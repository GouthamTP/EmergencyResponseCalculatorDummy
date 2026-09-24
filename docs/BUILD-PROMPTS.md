# Prompts for GitHub Copilot Chat in VS Code

Use these prompts sequentially. Copilot will also read `.github/copilot-instructions.md`.

## 1. Review and plan
Review `.github/copilot-instructions.md`, `docs/PRODUCT-SPEC.md`, the current source tree and all files in `public/data`. Identify gaps against the acceptance criteria. Create a concise implementation plan in `docs/IMPLEMENTATION-PLAN.md`. Do not change code yet.

## 2. Harden data loading
Implement typed repositories for every CSV/JSON dataset. Add Zod validation, useful row-level error messages, safe numeric/date conversion and loading/error states. Keep data access behind interfaces. Add tests.

## 3. Improve the command-centre UI
Refactor the UI into small components. Preserve the central map, left filters, right calculation panels and bottom activity table. Improve responsive behavior, accessibility, tooltips, empty states and visual polish. Do not add external map services.

## 4. Complete DFU2
Review and improve the DFU2 calculator. Keep the prototype assumption explicit. Rank all SAR resources, cap survivors by each aircraft capacity, support day/night mobilization and show a transparent time breakdown. Add edge-case tests.

## 5. Complete DFU7
Generate all SAR and hospital combinations, calculate the total medevac time, rank combinations and identify the best planning option. Add map connection lines and tests.

## 6. Complete DFU5
Rank ERRVs by mobilization plus travel time. Show configurable threshold and illustrative supplement. Add tests and avoid claiming operational compliance.

## 7. Add cost module
Implement ActivitySplitter and CostCalculator using planned dates until actual dates are available. Split activities by calendar month and return active days. Keep all assumptions documented and tested. Add a separate cost view without distracting from use case A.

## 8. Final quality pass
Run tests and build. Fix TypeScript, accessibility and responsive-layout issues. Remove dead code. Update README and produce `docs/VALIDATION-CHECKLIST.md` listing business rules still requiring confirmation.
