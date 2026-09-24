# Static data dictionary

## activities.csv
One record per offshore activity or installation. Coordinates are decimal degrees. Dates use ISO YYYY-MM-DD. Applicable DFU fields are booleans.

## sar_resources.csv
One record per SAR asset/base. Speed is knots, range is nautical miles, time values are minutes, capacity is persons.

## errv_resources.csv
One record per emergency response vessel. Speed is knots and mobilization is minutes.

## hospitals.csv
Hospitals usable in prototype medevac scenarios. `helicopter_accessible` is a prototype flag.

## heliports.csv
Reference points for display and future master-data separation.

## requirements.json
Configurable planning thresholds and explanatory text. These values are illustrative and must be validated.
