# SWAC Publication History Visualization

A minimalist, storytelling-focused stream graph that explores the publication history of the Sahel and West Africa Club (SWAC).

## Files
- `SWAC publications 1980-2020s.xlsx` — Original Excel data
- `swac_data.json` — Processed JSON (primary data source)
- `create_single_json.py` — Script to regenerate the JSON
- `index.html`, `styles.css`, `app.js` — Web visualization

## Data Structure (swac_data.json)
```json
{
  "metadata": {
    "total_publications": 1043,
    "year_range": { "min": 1978, "max": 2025 },
    "topics": ["Urban", "Economy", "Food", ...],
    "series_count": 43,
    "types_count": 13
  },
  "publications": [
    {
      "year": 2002,
      "series": "ECOLOC",
      "type": "Report",
      "title": "...",
      "author": "...",
      "status": "published",
      "code": "...",
      "topics": ["Economy", "Urban", ...]
    }
  ],
  "publications_by_year": {
    "1995": [ ... ],
    "1996": [ ... ]
  },
  "series_info": {
    "ECOLOC": {
      "total": 67,
      "years": { "start": 1995, "end": 2002 },
      "main_type": "Report"
    }
  },
  "yearly_stats": {
    "1995": { "total": 20, "series_count": 6, "top_series": [ ... ], "cumulative": 220 }
  }
}
```

## Quick Start
Serve the folder locally and open in a browser.
```bash
# Start a local server (choose one)
python -m http.server 8000
# or
python3 -m http.server 8000

# Then open
open http://localhost:8000
```

Regenerate the JSON (optional):
```bash
conda run -n swac python create_single_json.py
```

Use in JavaScript:
```javascript
fetch('swac_data.json')
  .then(r => r.json())
  .then(data => {
    console.log('Total publications:', data.metadata.total_publications);
    console.log('Publications in 1995:', data.publications_by_year['1995']);
  });
```

## Features
- Multi-dimensional views: `Series`, `Topics`, `Type`, `Author`
- Stream graph with vintage newspaper theme
- Interactive hover + inline callouts on key years
- Legend-based filtering and selection
- Stats footer (total, years, current dimension)
- Optional playback (year-by-year reveal)

## Notes
- Data cleaned (removed invalid year=0 rows)
- Years are integers
- Topics normalized to arrays
- Saved in UTF-8

