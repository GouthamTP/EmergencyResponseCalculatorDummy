# Product specification

## Purpose
Replicate the core planning use case of the existing Spotfire application with static data. The prototype visualizes offshore activities and emergency resources and calculates indicative SAR pickup, medevac and ERRV response results.

## Primary workflow
1. Filter and select an activity.
2. Inspect location, status, dates, people on board and applicable DFUs.
3. Compare SAR resources for DFU2.
4. Compare SAR and hospital combinations for DFU7.
5. Compare ERRVs for DFU5.
6. Inspect formula inputs and calculation breakdowns.

## Entities
Activities, SAR resources, ERRVs, hospitals, heliports and scenario requirements.

## Required improvements over legacy behavior
- Cap pickup output at the individual helicopter capacity.
- Keep mobilization time per resource, not as a single global value.
- Allow day/night mode.
- Make master data replaceable and maintainable.
- Prefer transparent numeric results over simplistic compliance claims.
- Put selected-activity outcomes in one view rather than separate pages.

## Acceptance criteria
- Runs after `npm install` and `npm run dev`.
- Loads only local static files.
- Filtering changes activity markers and table.
- Selecting an activity updates all three planning panels.
- Each result shows distance, travel, mobilization and total.
- Unit tests cover distance, DFU2, DFU7 and DFU5 calculations.
- Visible disclaimer states that values are synthetic and non-operational.
