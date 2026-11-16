# AeroBrief

Aviation weather application built with **React, TypeScript, and Vite**. AeroBrief displays aviation weather information, helps interpret METAR reports, and includes wind-component and airport-insight interfaces.

> **Security notice:** The current application integrates Gemini directly in browser-side code. Its Vite configuration substitutes `GEMINI_API_KEY` into the client bundle. **Do not configure a real Gemini API key in a public frontend build.** A server-side proxy is required before a production deployment can safely use a private Gemini key. Rotate any key previously used in a public deployment.

## Features in the repository

- METAR presentation and weather data transformation
- Wind-component calculation interface
- Airport insights and AI-assisted weather interpretation
- Chat-based user interface
- Primary METAR request to AviationWeather.gov, with a raw-text fallback

The exact behavior of live external services depends on network access, upstream APIs, and deployment configuration.

## Technology

- React 19 and TypeScript
- Vite
- Google Gen AI SDK
- AviationWeather.gov METAR API and NWS text-source fallback

## Run locally

```bash
npm install
npm run dev
```

The browser frontend currently expects a Gemini credential at build time for AI features. For a secure deployment, first implement a backend endpoint that holds the credential privately and calls Gemini on the server. **Never put a production credential in a Vite environment variable or client-side JavaScript.**

## Repository structure

```text
App.tsx                   Main application
components/              Weather, airport, chat, and wind UI
services/geminiService.ts Weather retrieval and AI integration
types.ts                  Shared TypeScript models
vite.config.ts            Build configuration
```

## Known limitations and planned fixes

1. **Credential handling:** Move Gemini requests to a server-side API; remove `GEMINI_API_KEY` substitution from the browser bundle and rotate exposed keys.
2. **Weather API requests:** Remove the unrelated Gemini key from the `X-API-Key` header used for AviationWeather.gov METAR requests.
3. **Reliability:** Add robust error handling and tests for missing METAR data, fallback parsing, and upstream API failures.
4. **Repository hygiene:** Remove unrelated Word documents and temporary Office files after confirming they are not needed.
5. **Documentation:** Add screenshots, setup examples, and an architecture diagram.

## Disclaimer

This project is an educational weather interpretation tool, **not an approved or certified source for flight planning or operational decisions**. Confirm all operational weather information using appropriate official products and procedures.
