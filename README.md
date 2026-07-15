# APEX — Forza Motorsport (2023) Tune Generator

A zero-dependency, client-side tune generator for **Forza Motorsport (2023)**. Pick a car, set your PI class, tyres, drivetrain, engine layout, surface condition, track character and build goal, and it produces a full baseline setup sheet — tyres, alignment, ARBs, springs/ride/dampers, differential, brakes, FM2023 geometry, aero and gearing — each value with a one-line reason, plus a PI-ordered upgrade plan.

No build step, no framework, no npm. Just static files — open `index.html` or drop it on GitHub Pages.

---

## Run it locally

**Easiest:** double-click `index.html`. Everything works offline (car data and the engine load via `<script>` tags, not `fetch`).

**If you prefer a local server** (needed only if you want to test the *remote roster loader*):

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Deploy to GitHub Pages

1. Create a repo and push these files (keep the folder structure).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: `main`, folder: `/root`. Save.
4. Your app is live at `https://<you>.github.io/<repo>/` in a minute or two.

That's it — it's a fully static site.

```
forza-tune-generator/
├── index.html          # UI + wiring (the "test environment")
├── js/engine.js        # deterministic tune logic (pure functions)
├── data/cars.js        # full roster — all 681 cars (generated)
├── data/tracks.js      # 30 locations / 57 layouts with tuning attributes
├── data/roster_raw.txt # source list: name|division, one per line
├── build_roster.py     # regenerates cars.js from roster_raw.txt
└── README.md
```

---

## How the tune engine works

`ForzaTune.generateTune(car, opts)` in `js/engine.js` is pure and deterministic. Scales used:

| Setting | Output form |
|---|---|
| Tyre pressure, camber, toe, caster | absolute (psi / degrees) |
| ARB | absolute, 1–65 |
| Dampers (bump/rebound) | absolute, 1–20 |
| Differential, brakes, geometry | absolute % |
| **Springs & ride height** | **% of the car's slider range** (these are car-specific in FM2023, so a percentage travels correctly across cars) |

Every heuristic is derived from the FM2023 physics/PI model — drivetrain, engine layout and weight distribution drive the ARB split, spring balance and diff defaults; surface, track character and build goal shift them; the optional "handling issue" selector layers a targeted correction on top. **In-game behaviour is always ground truth** — treat the output as a starting point and trim from there.

To tweak the logic, edit `js/engine.js` — the sections are labelled and self-contained.

---

## The track roster (30 locations)

Picking a track gives much more precise tunes than the generic character toggle. `data/tracks.js` holds all **30 FM2023 locations** (24 real + 6 fictional, through the final Fujimi Kaido update, May 2025) across **57 layout configurations** — the main variations of each venue.

Selecting a track:
1. Sets the **track-character toggle** (technical / mixed / fast) automatically.
2. Feeds the engine per-layout **flags** that shift the actual values, and adds a "Track focus" card summarising why.

Each track carries a `type` (`circuit` / `oval` / `touge`) and `flags` the engine reacts to:

| Flag | Effect on the tune |
|---|---|
| `long-straight` / `banking` | Longer final drive, less aero (top speed) |
| `high-speed-corners` | More rear downforce, more caster (stability) |
| `heavy-braking` | More anti-dive, braking-stability note |
| `bumpy` / `elevation` / `kerbs` | Higher ride height, softer springs and bump damping |
| `low-grip` / `narrow` | Slightly softer, lower diff lock — predictability |
| `type: oval` | Minimal aero, long gearing, rearward brake bias |
| `type: touge` | Compliance and agility over top speed |

`character` and `flags` are tuning heuristics based on each circuit's real layout, not telemetry — edit `data/tracks.js` freely to taste. The list covers the primary configurations; a few venues have extra in-game variations not listed. The `note` field can say anything; the flags are what actually move the numbers.

## The car roster (681 cars — complete)

`data/cars.js` contains the **complete FM2023 roster: all 681 cars**, generated from the official list at https://forza.net/fmcars. The game is no longer updated, so this list is final.

**What's authoritative vs. inferred:**
- **Name and division** come straight from the official source — accurate.
- **Drivetrain (`dt`) and engine layout (`layout`) are auto-inferred** by `build_roster.py` using a documented rule set (e.g. quattro/STI/Evo/GT-R → AWD; hot hatches → FWD; 911/356/959 → rear; supercars → mid; everything else defaults to front/RWD). These are correct for the large majority but not every car. **The app's drivetrain and layout toggles override whatever's stored**, so any inferred miss is a one-tap fix when you pick the car.
- **Weight, weight distribution and PI are not published in the source, so they're omitted.** The tune engine falls back to generic values (≈3200 lb, 50% front) when they're absent — drivetrain, layout, class, tyres, surface, track character and goal still drive the meaningful adjustments; only spring/ARB magnitudes are slightly generic.

### Regenerating or correcting the roster
`build_roster.py` reads `data/roster_raw.txt` (one `name|division` per line) and writes `data/cars.js`:

```bash
python3 build_roster.py
```

To fix a specific car's drivetrain/layout, either edit `data/cars.js` directly or adjust the keyword rules in `build_roster.py` and re-run. To add weights/PI, give the car objects `weight`, `fdist`, `cls` and `pi` fields — the engine uses them automatically.

### Enriching with weights/PI (optional)
The official list doesn't include weight or PI. To add them, merge in a stats source and produce your own `cars.json`, then load it via the app's **"Replace roster"** box (must be a raw URL that allows cross-origin requests). Useful sources:

- **ManteoMax's Forza spreadsheets** — per-car weight, drivetrain, PI and more: `https://www.manteomax.com/`
- **kudosprime FM car list** — `https://www.kudosprime.com/fm/carlist.php`
- **Forzurda/ForzaMotorsport2023CarIDs** — car names + in-game IDs: `https://github.com/Forzurda/ForzaMotorsport2023CarIDs`
- **bluemanos/forza-motorsport-car-track-ordinal** — cars & tracks CSV/XML (see the `fm8` folder): `https://github.com/bluemanos/forza-motorsport-car-track-ordinal`

**Schema per car:**
```json
{ "name": "2015 SUBARU WRX STI", "division": "Modern Sport Compact",
  "dt": "AWD", "layout": "front", "weight": 3391, "fdist": 59, "cls": "B", "pi": 660 }
```
- `dt`: `RWD` | `AWD` | `FWD` · `layout`: `front` | `mid` | `rear`
- `weight` (lb), `fdist` (front %), `cls`, `pi` are all optional.

---

## Notes

- Uses Google Fonts (Barlow Condensed + JetBrains Mono) with system fallbacks, so it still looks fine offline.
- No analytics, no tracking, no external calls except the fonts and the optional roster fetch you trigger.
- Not affiliated with Turn 10 Studios or Microsoft. Forza Motorsport is their trademark.
