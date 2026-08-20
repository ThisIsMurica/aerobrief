import React, { useState, useCallback } from 'react';
import type { MetarDataResponse, AirportInsight } from './types';
import { getMetarData, getAirportInsights } from './services/geminiService';
import MetarDisplay from './components/MetarDisplay';
import { AirportInsights, AirportInsightsSkeleton } from './components/AirportInsights';
import { Chatbot } from './components/Chatbot';
import WindComponentCalculator from './components/WindComponentCalculator';
import { SearchIcon, LoaderIcon, AlertTriangleIcon } from './components/Icons';

const App: React.FC = () => {
  const [icaoCode, setIcaoCode] = useState<string>('');
  const [metarData, setMetarData] = useState<MetarDataResponse | null>(null);
  const [insights, setInsights] = useState<AirportInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMetar = useCallback(async () => {
    if (!icaoCode || icaoCode.length < 3 || icaoCode.length > 4) {
      setError('Please enter a valid 3 or 4-letter ICAO code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetarData(null);
    setInsights(null);

    try {
      const result = await getMetarData(icaoCode.toUpperCase());
      if (result.isValidIcao && result.metar) {
        setMetarData(result);
        setIsLoadingInsights(true);
        try {
            const insightsResult = await getAirportInsights(icaoCode.toUpperCase(), result.metar.raw);
            setInsights(insightsResult);
        } catch (insightErr) {
            console.error("Error fetching insights:", insightErr);
            // Fail gracefully without showing an error to the user for the insights part.
        } finally {
            setIsLoadingInsights(false);
        }
      } else {
        setError(result.errorMessage || 'Invalid ICAO code or no data available.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [icaoCode]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFetchMetar();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIcaoCode(e.target.value.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-gray-700/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_95%)]"></div>
      
      <div className="w-full max-w-4xl mx-auto z-10">
        <header className="text-center my-8">
<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sky-400">
  AeroBrief METAR Finder and Briefing 
</h1>

          <p className="mt-4 text-lg text-gray-400">
            Get instant, AI-decoded aviation weather reports and insights Powered by Google Gemini.
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={icaoCode}
                onChange={handleInputChange}
                placeholder="Enter Airport ICAO (e.g., KJFK)"
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                maxLength={4}
                minLength={3}
                required
                aria-label="Airport ICAO Code"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition duration-200"
                aria-label="Get METAR Data"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="animate-spin h-5 w-5" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-5 w-5" />
                    <span>Get Report</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8">
            {error && (
              <div role="alert" className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertTriangleIcon className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            {metarData?.metar && (
              <>
                <MetarDisplay data={metarData.metar} />
                <WindComponentCalculator wind={metarData.metar.wind} />
              </>
            )}
            
            {isLoadingInsights && <AirportInsightsSkeleton />}
            
            {insights && !isLoadingInsights && <AirportInsights insights={insights} />}

            {metarData?.metar && (
              <Chatbot icaoCode={metarData.metar.station} metarRaw={metarData.metar.raw} />
            )}
          </div>
        </main>
      </div>
      
      <footer className="w-full max-w-4xl mx-auto text-center text-gray-600 py-8 mt-auto z-10">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;