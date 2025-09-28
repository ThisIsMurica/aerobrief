import React, { useState, useMemo } from 'react';
import type { WindData, WindComponent } from '../types';
import { CrosswindIcon, HeadwindIcon } from './Icons';

interface WindComponentCalculatorProps {
  wind: WindData;
}

const WindComponentCalculator: React.FC<WindComponentCalculatorProps> = ({ wind }) => {
  const [runway, setRunway] = useState('');

  const windComponents = useMemo<WindComponent | null>(() => {
    const runwayHeadingStr = runway.trim().replace(/[LCR]/i, '');
    if (!runwayHeadingStr || isNaN(Number(runwayHeadingStr))) {
      return null;
    }

    const runwayHeading = Number(runwayHeadingStr) * 10;
    if (runwayHeading < 0 || runwayHeading > 360) {
      return null;
    }
    
    if (wind.direction === 'VRB' || isNaN(Number(wind.direction))) {
        return null; // Cannot calculate with variable winds
    }

    const windDirection = Number(wind.direction);
    const windSpeed = wind.speed;

    const angle = (windDirection - runwayHeading) * (Math.PI / 180);

    const crosswind = Math.round(windSpeed * Math.sin(angle));
    const headwind = Math.round(windSpeed * Math.cos(angle));

    return {
      crosswind: Math.abs(crosswind),
      crosswindDirection: crosswind > 0 ? 'Right' : 'Left',
      headwind: headwind,
    };
  }, [runway, wind]);

  return (
    <div className="mt-8 animate-fade-in">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          Runway Wind Component
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label htmlFor="runway-input" className="sr-only">Runway</label>
            <input
                id="runway-input"
                type="text"
                value={runway}
                onChange={(e) => setRunway(e.target.value.toUpperCase())}
                placeholder="Enter Runway (e.g., 22L)"
                className="flex-grow w-full sm:w-auto bg-gray-900 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                maxLength={3}
            />
        </div>
        
        {wind.direction === 'VRB' && runway && (
            <p className="mt-4 text-center text-yellow-400">Cannot calculate components for variable winds.</p>
        )}

        {windComponents && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center animate-fade-in">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <CrosswindIcon className="w-5 h-5" />
                <h3 className="font-semibold">Crosswind</h3>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {windComponents.crosswind} knots
              </p>
              <p className="text-gray-300">from the {windComponents.crosswindDirection}</p>
            </div>
             <div className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-gray-400">
                    <HeadwindIcon className="w-5 h-5" />
                    <h3 className="font-semibold">{windComponents.headwind >= 0 ? 'Headwind' : 'Tailwind'}</h3>
                </div>
                 <p className="text-2xl font-bold text-white mt-1">
                    {Math.abs(windComponents.headwind)} knots
                 </p>
                 <p className="text-gray-300">&nbsp;</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WindComponentCalculator;