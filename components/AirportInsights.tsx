
import React from 'react';
import type { AirportInsight } from '../types';
import { PlaneLandingIcon, LightbulbIcon, WindIcon, MountainIcon } from './Icons';

interface AirportInsightsProps {
  insights: AirportInsight;
}

const InsightCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="bg-gray-800/60 p-4 rounded-lg flex items-start gap-4 h-full">
    <div className="flex-shrink-0 text-cyan-400 mt-1">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-300">{title}</h3>
      <div className="text-lg text-white">{children}</div>
    </div>
  </div>
);

export const AirportInsights: React.FC<AirportInsightsProps> = ({ insights }) => {
  return (
    <div className="animate-fade-in space-y-4 mt-8">
       <h2 className="text-2xl font-semibold text-cyan-300 mb-4 text-center">AI Pilot Briefing</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <InsightCard icon={<MountainIcon />} title="Elevation">
           {insights.elevation}
         </InsightCard>
         <InsightCard icon={<WindIcon />} title="Weather Advisory">
           {insights.weatherAdvisory}
         </InsightCard>
         <InsightCard icon={<PlaneLandingIcon />} title="Runway Recommendation">
           <strong>{insights.runwayRecommendation.runway}:</strong> {insights.runwayRecommendation.justification}
         </InsightCard>
         <InsightCard icon={<LightbulbIcon />} title="Airport Tip">
           {insights.airportTip}
         </InsightCard>
       </div>
    </div>
  );
};

export const AirportInsightsSkeleton: React.FC = () => (
    <div className="space-y-4 mt-8" aria-live="polite" aria-busy="true">
        <div className="h-8 bg-gray-700 rounded-md w-1/3 mx-auto animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/60 p-4 rounded-lg h-36 animate-pulse"></div>
            <div className="bg-gray-800/60 p-4 rounded-lg h-36 animate-pulse"></div>
            <div className="bg-gray-800/60 p-4 rounded-lg h-36 animate-pulse"></div>
            <div className="bg-gray-800/60 p-4 rounded-lg h-36 animate-pulse"></div>
        </div>
    </div>
);