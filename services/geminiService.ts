

import { GoogleGenAI, Type } from '@google/genai';
import type { MetarDataResponse, AirportInsight, MetarData, CloudLayer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// Gemini AI setup is still required for insights and fallback parsing.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transforms the JSON response from aviationweather.gov into the app's internal MetarData format.
 * @param data - The METAR data object from the API.
 * @returns A MetarData object.
 */
function transformAviationGovMetar(data: any): MetarData {
  // Prioritize parsing time from the raw METAR string, as it's the source of truth.
  let formattedTime = '';
  if (data.rawOb) {
    // The date/time group in a METAR is formatted as DDHHMMZ.
    const timeMatch = data.rawOb.match(/\s(\d{6}Z)\b/);
    if (timeMatch && timeMatch[1]) {
      formattedTime = timeMatch[1];
    }
  }

  // Fallback to using the obsTime field if parsing from raw string fails.
  if (!formattedTime && data.obsTime) {
    const obsDate = new Date(data.obsTime);
    const day = obsDate.getUTCDate().toString().padStart(2, '0');
    const hour = obsDate.getUTCHours().toString().padStart(2, '0');
    const minute = obsDate.getUTCMinutes().toString().padStart(2, '0');
    formattedTime = `${day}${hour}${minute}Z`;
  }

  let clouds: CloudLayer[] = [];
  // Priority 1: Parse cloud layers directly from the raw METAR string.
  // This is more reliable than relying on the API's parsed fields.
  if (data.rawOb) {
    const cloudRegex = /(SKC|CLR|FEW|SCT|BKN|OVC)(\d{3})?(CB|TCU)?/g;
    let match;
    while ((match = cloudRegex.exec(data.rawOb)) !== null) {
      clouds.push({
        coverage: match[1],
        altitude: match[2] ? parseInt(match[2], 10) * 100 : 0,
        isCb: match[3] === 'CB',
      });
    }
  }

  // Priority 2: Fallback to using the parsed fields if raw string parsing fails.
  // This is a safety net for unusual cases.
  if (clouds.length === 0) {
    for (let i = 1; i <= 4; i++) {
      const coverage = data[`cldCvg${i}`];
      const altitude = data[`cldBas${i}`];
      if (coverage && coverage !== 'UNKN') {
        if (altitude || coverage === 'SKC' || coverage === 'CLR') {
          clouds.push({
            coverage: coverage,
            altitude: (altitude || 0) * 100,
            isCb: data[`cldTyp${i}`] === 'CB',
          });
        }
      }
    }
  }


  let formattedAltimeter = '';

  // Priority 1: Parse directly from the raw string for highest accuracy.
  // The raw string is the source of truth for altimeter format.
  if (data.rawOb) {
    const altimeterMatch = data.rawOb.match(/\s(A\d{4}|Q\d{4})\b/);
    if (altimeterMatch && altimeterMatch[1]) {
      formattedAltimeter = altimeterMatch[1];
    }
  }

  // Priority 2: Fallback to the parsed 'altim' field if not found in raw string.
  // This handles cases where the raw string might be malformed but a numeric value exists.
  if (!formattedAltimeter) {
    const altimeterValue = data.altim;
    if (altimeterValue && !isNaN(altimeterValue)) {
      if (altimeterValue < 100) { // Assume it's inHg
        formattedAltimeter = `A${Math.round(altimeterValue * 100).toString().padStart(4, '0')}`;
      } else { // Assume it's hPa
        formattedAltimeter = `Q${Math.round(altimeterValue).toString().padStart(4, '0')}`;
      }
    }
  }
  
  let formattedVisibility = '';
    // Priority 1: Parse visibility from the raw string for accuracy.
    if (data.rawOb) {
        const parts = data.rawOb.split(/\s+/).filter(Boolean);
        const windIndex = parts.findIndex(p => /(KT|MPS|KPH)$/.test(p));

        if (windIndex !== -1 && parts.length > windIndex + 1) {
            let potentialVisIndex = windIndex + 1;
            // Account for wind variability group (e.g., 240V300)
            if (parts[potentialVisIndex] && /^\d{3}V\d{3}$/.test(parts[potentialVisIndex])) {
                potentialVisIndex++;
            }

            const visibilityPart = parts[potentialVisIndex];
            
            if (visibilityPart) {
                // Check for standard visibility formats
                if (visibilityPart === 'CAVOK' || 
                    /^\d{4}$/.test(visibilityPart) || 
                    /^(P?M?(\d+\s)?\d+(\/\d+)?SM)$/.test(visibilityPart)) {
                    formattedVisibility = visibilityPart;
                }
            }
        }
        
        // A second check for CAVOK in case it replaces wind/vis entirely
        if (!formattedVisibility && parts.includes('CAVOK')) {
            formattedVisibility = 'CAVOK';
        }
    }

    // Priority 2: Fallback to the parsed 'visib' field if raw parsing fails.
    if (!formattedVisibility && data.visib) {
        // This is a fallback and might not be in the pilot-friendly format.
        formattedVisibility = `${parseFloat(data.visib)}SM`;
    }


  return {
    raw: data.rawOb,
    station: data.icaoId,
    observationTime: formattedTime,
    wind: {
      direction: data.wdir?.toString() ?? 'VRB',
      speed: data.wspd ?? 0,
      gust: data.wgst ?? null,
    },
    visibility: formattedVisibility,
    weather: data.wxString ? data.wxString.split(' ').filter(Boolean) : [],
    clouds: clouds,
    temperature: data.temp,
    dewpoint: data.dewp,
    altimeter: formattedAltimeter,
    remarks: data.rmk || null,
  };
}


const metarParsingSchema = {
    type: Type.OBJECT,
    properties: {
      isValidIcao: { type: Type.BOOLEAN },
      errorMessage: { type: Type.STRING, nullable: true },
      metar: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          raw: { type: Type.STRING },
          station: { type: Type.STRING },
          observationTime: { type: Type.STRING },
          wind: {
            type: Type.OBJECT,
            properties: {
              direction: { type: Type.STRING },
              speed: { type: Type.NUMBER },
              gust: { type: Type.NUMBER, nullable: true },
            },
            required: ['direction', 'speed'],
          },
          visibility: { type: Type.STRING },
          weather: { type: Type.ARRAY, items: { type: Type.STRING } },
          clouds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                coverage: { type: Type.STRING },
                altitude: { type: Type.NUMBER },
                isCb: { type: Type.BOOLEAN },
              },
              required: ['coverage', 'altitude', 'isCb'],
            },
          },
          temperature: { type: Type.NUMBER },
          dewpoint: { type: Type.NUMBER },
          altimeter: { type: Type.STRING },
          remarks: { type: Type.STRING, nullable: true },
        },
        required: [
          'raw', 'station', 'observationTime', 'wind', 'visibility', 
          'clouds', 'temperature', 'dewpoint', 'altimeter'
        ],
      },
    },
    required: ['isValidIcao', 'errorMessage', 'metar'],
};

/**
 * Parses a raw METAR string using Gemini. Used as part of the fallback mechanism.
 * @param rawMetar - The raw METAR string to parse.
 * @returns A MetarDataResponse object.
 */
const parseRawMetarWithGemini = async (rawMetar: string): Promise<MetarDataResponse> => {
    const prompt = `Parse the following raw METAR string: "${rawMetar}". Provide the output as a JSON object that includes the raw METAR string and a parsed breakdown of its components. The 'metar' object must be fully populated. Ensure all numeric values are actual numbers, not strings. Set isValidIcao to true.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: metarParsingSchema,
        },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as MetarDataResponse;
    
    // Ensure consistency as we know the ICAO is valid at this point
    if (result.metar) {
        result.isValidIcao = true;
        result.errorMessage = null;
    }
    return result;
}

export const getMetarData = async (icaoCode: string): Promise<MetarDataResponse> => {
  // Primary Method: AviationWeather.gov REST API
  try {
    const response = await fetch(
  `https://aerobrief-api.aerobrief-api.workers.dev/metar?icao=${icaoCode.toUpperCase()}`
);

    if (!response.ok) {
      throw new Error(`AviationWeather API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const metarData = transformAviationGovMetar(data[0]);
      return {
        isValidIcao: true,
        errorMessage: null,
        metar: metarData,
      };
    } else {
      // API returned 200 OK but no data, likely a valid ICAO with no recent METAR. Try fallback.
      throw new Error('No METAR data found from primary source.');
    }
  } catch (error) {
    console.warn("Primary API failed, trying fallback:", error);

    // Fallback Method: TGFTP Raw Text + Gemini Parsing
    try {
      const response = await fetch(`https://tgftp.nws.noaa.gov/data/observations/metar/stations/${icaoCode.toUpperCase()}.TXT`);
      if (!response.ok) {
        throw new Error(`TGFTP request failed with status ${response.status}`);
      }
      
      const text = await response.text();
      // The second line usually has the METAR string
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const rawMetar = lines.length > 1 ? lines[1] : lines[0];

      if (!rawMetar || !rawMetar.trim().startsWith(icaoCode.toUpperCase())) {
        throw new Error('Invalid or empty METAR data from TGFTP.');
      }

      // Use Gemini to parse the raw text from the fallback source
      return await parseRawMetarWithGemini(rawMetar.trim());

    } catch (fallbackError) {
      console.error("Fallback data source also failed:", fallbackError);
      return {
        isValidIcao: false,
        errorMessage: 'Could not retrieve METAR data. Please check the ICAO code and try again.',
        metar: null,
      };
    }
  }
};


const insightsSchema = {
  type: Type.OBJECT,
  properties: {
    elevation: {
      type: Type.STRING,
      description: "The airport's official elevation (e.g., '87 ft / 27 m')."
    },
    weatherAdvisory: {
      type: Type.STRING,
      description: "A brief, actionable advisory for pilots based on the current METAR. For example, 'VFR conditions prevail. Watch for potential crosswinds from the west.' or 'IFR conditions due to low ceilings. Instrument approach will be required.'",
    },
    runwayRecommendation: {
      type: Type.OBJECT,
      properties: {
        runway: { type: Type.STRING, description: "The recommended landing runway, chosen from the airport's actual available runways. E.g., '19'." },
        justification: { type: Type.STRING, description: "A brief reason for the runway choice, primarily based on wind direction and speed from the METAR." },
      },
      required: ['runway', 'justification'],
    },
    airportTip: {
      type: Type.STRING,
      description: "An interesting fact, operational tip, or piece of trivia about the specified airport.",
    },
  },
  required: ['elevation', 'weatherAdvisory', 'runwayRecommendation', 'airportTip'],
};

export const getAirportInsights = async (icaoCode: string, metar: string): Promise<AirportInsight> => {
  const prompt = `For the airport with ICAO code "${icaoCode}", first find its official data including elevation and a complete list of all available runway designators. Then, using that information and the following METAR report: "${metar}", provide a concise set of insights for a pilot. Your runway recommendation MUST be chosen from the official list of runways you found.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: insightsSchema,
    },
  });
  
  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as AirportInsight;
};