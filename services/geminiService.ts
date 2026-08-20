import type {
  MetarDataResponse,
  AirportInsight,
  MetarData,
  CloudLayer
} from '../types';


function transformAviationGovMetar(data: any): MetarData {
  let formattedTime = '';

  // Prefer the actual METAR DDHHMMZ group.
  if (data.rawOb) {
    const timeMatch = data.rawOb.match(/\s(\d{6}Z)\b/);

    if (timeMatch && timeMatch[1]) {
      formattedTime = timeMatch[1];
    }
  }

  // Fallback to API observation time.
  if (!formattedTime && data.obsTime) {
    const obsDate = new Date(data.obsTime);

    const day = obsDate
      .getUTCDate()
      .toString()
      .padStart(2, '0');

    const hour = obsDate
      .getUTCHours()
      .toString()
      .padStart(2, '0');

    const minute = obsDate
      .getUTCMinutes()
      .toString()
      .padStart(2, '0');

    formattedTime = `${day}${hour}${minute}Z`;
  }


  // Clouds
  const clouds: CloudLayer[] = [];

  if (data.rawOb) {
    const cloudRegex =
      /(SKC|CLR|FEW|SCT|BKN|OVC)(\d{3})?(CB|TCU)?/g;

    let match;

    while ((match = cloudRegex.exec(data.rawOb)) !== null) {
      clouds.push({
        coverage: match[1],
        altitude: match[2]
          ? parseInt(match[2], 10) * 100
          : 0,
        isCb: match[3] === 'CB',
      });
    }
  }

  // Parsed-field fallback.
  if (clouds.length === 0) {
    for (let i = 1; i <= 4; i++) {
      const coverage = data[`cldCvg${i}`];
      const altitude = data[`cldBas${i}`];

      if (
        coverage &&
        coverage !== 'UNKN' &&
        (altitude || coverage === 'SKC' || coverage === 'CLR')
      ) {
        clouds.push({
          coverage,
          altitude: (altitude || 0) * 100,
          isCb: data[`cldTyp${i}`] === 'CB',
        });
      }
    }
  }


  // Altimeter
  let formattedAltimeter = '';

  if (data.rawOb) {
    const altimeterMatch =
      data.rawOb.match(/\s(A\d{4}|Q\d{4})\b/);

    if (altimeterMatch && altimeterMatch[1]) {
      formattedAltimeter = altimeterMatch[1];
    }
  }

  if (!formattedAltimeter) {
    const altimeterValue = data.altim;

    if (altimeterValue && !isNaN(altimeterValue)) {
      if (altimeterValue < 100) {
        formattedAltimeter =
          `A${Math.round(altimeterValue * 100)
            .toString()
            .padStart(4, '0')}`;
      } else {
        formattedAltimeter =
          `Q${Math.round(altimeterValue)
            .toString()
            .padStart(4, '0')}`;
      }
    }
  }


  // Visibility
  let formattedVisibility = '';

  if (data.rawOb) {
    const parts = data.rawOb
      .split(/\s+/)
      .filter(Boolean);

    const windIndex = parts.findIndex(
      part => /(KT|MPS|KPH)$/.test(part)
    );

    if (
      windIndex !== -1 &&
      parts.length > windIndex + 1
    ) {
      let visIndex = windIndex + 1;

      // Skip variable wind direction group, e.g. 240V300.
      if (
        parts[visIndex] &&
        /^\d{3}V\d{3}$/.test(parts[visIndex])
      ) {
        visIndex++;
      }

      const visibilityPart = parts[visIndex];

      if (visibilityPart) {
        if (
          visibilityPart === 'CAVOK' ||
          /^\d{4}$/.test(visibilityPart) ||
          /^(P?M?\d+(\/\d+)?SM)$/.test(visibilityPart)
        ) {
          formattedVisibility = visibilityPart;
        }
      }
    }

    if (
      !formattedVisibility &&
      parts.includes('CAVOK')
    ) {
      formattedVisibility = 'CAVOK';
    }
  }

  if (!formattedVisibility && data.visib) {
    formattedVisibility =
      `${parseFloat(data.visib)}SM`;
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

    weather: data.wxString
      ? data.wxString.split(' ').filter(Boolean)
      : [],

    clouds,

    temperature: data.temp,
    dewpoint: data.dewp,
    altimeter: formattedAltimeter,
    remarks: data.rmk || null,
  };
}


export const getMetarData = async (
  icaoCode: string
): Promise<MetarDataResponse> => {
  const icao = icaoCode.toUpperCase();

  try {
    const response = await fetch(
      `https://aerobrief-api.aerobrief-api.workers.dev/metar?icao=${icao}`
    );

    if (!response.ok) {
      throw new Error(
        `METAR request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        isValidIcao: true,
        errorMessage: null,
        metar: transformAviationGovMetar(data[0]),
      };
    }

    throw new Error('No METAR data found.');
  } catch (error) {
    console.error('METAR request failed:', error);

    return {
      isValidIcao: false,
      errorMessage:
        'Could not retrieve METAR data. Please check the ICAO code and try again.',
      metar: null,
    };
  }
};


export const getAirportInsights = async (
  icaoCode: string,
  metar: string
): Promise<AirportInsight> => {
  const response = await fetch(
    'https://aerobrief-api.aerobrief-api.workers.dev/gemini/insights',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        icaoCode,
        metar,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Gemini insights request failed with status ${response.status}`
    );
  }

  return await response.json() as AirportInsight;
};