

import React from 'react';
import type { MetarData } from '../types';
import {
  WindIcon,
  VisibilityIcon,
  ThermometerIcon,
  CloudIcon,
  PressureIcon,
  InfoIcon,
  ClockIcon,
} from './Icons';

interface MetarDisplayProps {
  data: MetarData;
}

const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="bg-gray-800/60 p-4 rounded-lg flex items-start gap-4">
    <div className="flex-shrink-0 text-blue-400">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-300">{title}</h3>
      <div className="text-lg text-white">{children}</div>
    </div>
  </div>
);

const MetarDisplay: React.FC<MetarDisplayProps> = ({ data }) => {
  const formatTime = (time: string) => {
    const day = time.substring(0, 2);
    const hour = time.substring(2, 4);
    const minute = time.substring(4, 6);
    return `Day ${day} at ${hour}:${minute} Zulu`;
  };

  const formatAltimeter = (altimeter: string) => {
    if (altimeter.startsWith('A')) {
      const value = altimeter.slice(1);
      if (value.length === 4) {
        return `${value.slice(0, 2)}.${value.slice(2)} inHg`;
      }
    } else if (altimeter.startsWith('Q')) {
      const value = altimeter.slice(1);
      return `${parseInt(value, 10)} hPa`;
    }
    return altimeter; // Fallback for unexpected formats
  };

  const formatVisibility = (visibility: string) => {
    if (!visibility) return 'Not Available';
    if (visibility === 'CAVOK') {
        return 'Ceiling and Visibility OK';
    }
    if (visibility.endsWith('SM')) {
        let visText = visibility.replace('SM', '');
        let prefix = '';
        if (visText.startsWith('P')) {
            prefix = 'More than ';
            visText = visText.slice(1);
        } else if (visText.startsWith('M')) {
            prefix = 'Less than ';
            visText = visText.slice(1);
        }
        return `${prefix}${visText} Statute Miles`;
    }
    // Check if it's a 4-digit number (assumed to be meters)
    if (/^\d{4}$/.test(visibility)) {
        return `${visibility} m`;
    }
    return visibility; // Fallback
  };

  const renderClouds = () => {
    const coverageMap: { [key: string]: string } = {
      FEW: 'Few',
      SCT: 'Scattered',
      BKN: 'Broken',
      OVC: 'Overcast',
    };

    // Handle cases where clouds should just be "Clear Skies"
    if (data.raw.includes('CAVOK')) return 'Clear Skies';
    
    // If after robust parsing there are no cloud layers, it's clear.
    if (!data.clouds || data.clouds.length === 0) return 'Clear Skies';
    
    // Handle SKC/CLR specifically, as they mean "Clear Skies".
    const hasOnlyClearLayers = data.clouds.every(c => c.coverage === 'SKC' || c.coverage === 'CLR');
    if (hasOnlyClearLayers) return 'Clear Skies';

    // Filter out SKC/CLR if mixed with other layers, as they are less significant.
    const significantLayers = data.clouds.filter(c => c.coverage !== 'SKC' && c.coverage !== 'CLR');
    if (significantLayers.length === 0) return 'Clear Skies';

    // Render the significant cloud layers
    return significantLayers.map((layer, index) => {
        const coverageText = coverageMap[layer.coverage] || layer.coverage;
        return (
            <div key={index}>
                {coverageText} at {layer.altitude.toLocaleString()} ft {layer.isCb ? '(CB)' : ''}
            </div>
        );
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-semibold text-cyan-300 mb-2">
          Raw METAR: {data.station}
        </h2>
        <p className="font-mono text-gray-300 bg-gray-900 p-3 rounded-md text-sm sm:text-base break-words">
          {data.raw}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard icon={<ClockIcon />} title="Observation Time">
          {formatTime(data.observationTime)}
        </InfoCard>

        <InfoCard icon={<WindIcon />} title="Wind">
          {data.wind.direction === 'VRB' ? 'Variable' : `${data.wind.direction}°`} at {data.wind.speed} knots
          {data.wind.gust && `, gusting to ${data.wind.gust} knots`}
        </InfoCard>

        <InfoCard icon={<VisibilityIcon />} title="Visibility">
          {formatVisibility(data.visibility)}
        </InfoCard>
        
        <InfoCard icon={<ThermometerIcon />} title="Temperature / Dew Point">
          {data.temperature}°C / {data.dewpoint}°C
        </InfoCard>
        
        <InfoCard icon={<PressureIcon />} title="Altimeter">
          {data.altimeter ? formatAltimeter(data.altimeter) : 'Not Available'}
        </InfoCard>

        <InfoCard icon={<CloudIcon />} title="Clouds">
          {renderClouds()}
        </InfoCard>
      </div>
      
      {(data.weather.length > 0 || data.remarks) && (
        <div className="bg-gray-800/60 p-4 rounded-lg">
           {data.weather.length > 0 && (
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 text-blue-400"><InfoIcon /></div>
              <div>
                <h3 className="font-bold text-gray-300">Weather</h3>
                <p className="text-lg text-white">{data.weather.join(', ')}</p>
              </div>
            </div>
          )}
          {data.remarks && (
             <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-blue-400"><InfoIcon /></div>
              <div>
                <h3 className="font-bold text-gray-300">Remarks</h3>
                <p className="text-lg text-white">{data.remarks}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetarDisplay;