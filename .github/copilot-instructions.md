# GitHub Copilot project instructions

Act as a senior TypeScript architect, GIS developer, UX designer and test engineer. Build and improve this repository as an offline-first prototype for offshore emergency preparedness planning.

## Non-negotiable rules
- Use React, TypeScript and Vite. Keep strict TypeScript enabled.
- Use only local CSV/JSON data under `public/data` for the prototype.
- Do not add a backend, database, authentication, real-time feed or enterprise integration unless explicitly requested.
- Never place business formulas in React components. Put them in `src/domain/calculations`.
- Keep data access behind repository interfaces so Azure SQL, ArcGIS, Fabric or APIs can be added later.
- Treat all provided data as synthetic. Preserve the visible prototype disclaimer.
- Do not claim regulatory compliance. Show results as planning indicators.
- Use resource-specific capacity, day/night mobilization, speed, pickup time and installation time.
- Rank resources deterministically by total response time, then distance.
- Add or update Vitest tests whenever calculation logic changes.
- Use accessible labels, keyboard focus, contrast and responsive layouts.
- Prefer small, typed, composable components and pure functions.

## Product objective
A user selects an offshore activity and immediately sees nearby SAR helicopters, hospitals and ERRVs, coverage indicators, DFU2/DFU7/DFU5 planning tables, assumptions and traceable calculation breakdowns.

## Current calculation assumptions
- Great-circle distance uses Haversine and returns nautical miles.
- Travel minutes = distance NM / speed knots * 60.
- DFU2 planning model: mobilization + repeated round-trip flight + pickup time per person. Search the maximum passenger count that fits the threshold and never exceed resource capacity. This is a prototype assumption, not a confirmed production formula.
- DFU7 = mobilization + base-to-activity flight + installation handling + activity-to-hospital flight.
- DFU5 = mobilization + ERRV travel time. NOFO supplement is configurable and illustrative.

## Target UX
Use a polished Nordic command-centre visual language: deep navy surfaces, white content, coral/orange action accents, cyan information, restrained shadows, compact tables and clear visual hierarchy. Keep the map central. Do not copy Spotfire chrome.

## Delivery priority
1. Activity selection and static data validation
2. Map and resource visualization
3. DFU2 and DFU7
4. DFU5
5. Cost module and monthly activity splitting
6. Data administration and integrations
