import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, BotIcon, UserIcon, LoaderIcon } from './Icons';

interface ChatbotProps {
  icaoCode: string;
  metarRaw: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ icaoCode, metarRaw }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: `Hello! Ask me anything about ${icaoCode} or its current weather.`
      }
    ]);
  }, [icaoCode, metarRaw]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim() || isLoading) return;

    const messageToSend = userInput.trim();

    // Don't send the locally-generated greeting to Gemini as chat history.
    const history = messages.slice(1);

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://aerobrief-api.aerobrief-api.workers.dev/gemini/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            icaoCode,
            metarRaw,
            message: messageToSend,
            history,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Gemini chat request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.text) {
        throw new Error('Gemini returned an empty response.');
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: data.text,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);

      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="mt-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col"
      style={{ height: '500px' }}
    >
      <h2 className="text-xl font-semibold text-cyan-300 p-4 border-b border-gray-700 flex-shrink-0">
        Ask Gemini
      </h2>

      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 w-full ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center text-cyan-300">
                <BotIcon />
              </div>
            )}

            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {msg.content}
            </div>

            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-200">
                <UserIcon />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center text-cyan-300">
              <BotIcon />
            </div>

            <div className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 flex items-center">
              <LoaderIcon className="animate-spin h-5 w-5" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-700 flex gap-4 flex-shrink-0 bg-gray-800/50"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
          disabled={isLoading}
          aria-label="Chat input"
        />

        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold p-2.5 rounded-md transition duration-200"
          aria-label="Send message"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};