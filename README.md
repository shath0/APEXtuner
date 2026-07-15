# APEX — Forza Motorsport (2023) Tune Generator

A single self-contained web app that generates baseline tunes for **Forza Motorsport (2023)**. Pick a car, set your PI class, tyres, drivetrain, engine layout, surface, track and build goal, and it produces a full setup sheet — tyres, alignment, ARBs, springs/ride/dampers, differential, brakes, FM2023 geometry, aero and gearing — each value with a one-line reason, plus a PI-ordered upgrade plan.

**Everything is in `index.html`.** No build step, no framework, no external files, no dependencies.

---

## Run it

Double-click **`index.html`**. That's it — it works offline.

## Deploy to GitHub Pages

1. Add **`index.html`** to a repo (that one file is the whole app).
2. **Settings → Pages → Deploy from a branch → `main` / root**. Save.
3. Live at `https://<you>.github.io/<repo>/` within a minute.

Because there are no external files, deployment can't break on missing folders, path case, or Jekyll. If you ever swap in a new version, hard-refresh (Ctrl/Cmd+Shift+R) to clear the cached copy.

---

## What's inside

- **All 681 cars** — the complete final roster, from the official list at https://forza.net/fmcars.
- **30 track locations / 57 layouts** — every venue through the final content update (Fujimi Kaido, May 2025), each with tuning-relevant traits.
- **The tune engine** — deterministic logic derived from the FM2023 physics/PI model.

All three are inlined as `<script>` blocks near the bottom of `index.html`.

### Car stats panel
Selecting a car shows a panel with year, make, division, drivetrain and engine layout.
- **Name, division, make, year** are accurate (from / parsed from the official data).
- **Drivetrain and layout** are auto-inferred and tagged **· auto** — override them with the toggles if a car is wrong.
- **Stock PI, class and weight** aren't published in the official roster, so they show "—" by default. They appear automatically if you load an enriched roster (see below), and the engine uses `weight`/`fdist`/`cls`/`pi` when present.

### How the track picker affects the tune
Picking a track sets the character toggle and feeds the engine per-layout flags:

| Flag | Effect |
|---|---|
| `long-straight` / oval | Longer gearing, less aero |
| `high-speed-corners` | More rear downforce, more caster |
| `heavy-braking` | More anti-dive, braking-stability note |
| `bumpy` / `elevation` / `kerbs` | Higher ride height, softer springs/bump |
| `low-grip` / `narrow` | Softer, lower diff lock — predictability |
| oval / touge | Minimal aero + long gearing / agility + compliance |

### Value scales
Springs and ride height are given as **% of each car's slider range** (car-specific); ARB (1–65), dampers (1–20), diff and brakes are absolute. In-game behaviour is always ground truth — treat every tune as a starting point and iterate.

---

## Editing the data

All data lives in the inline `<script>` blocks in `index.html`:
- **`window.FORZA_CARS = [...]`** — the car roster. Fix a car's `dt`/`layout`, or add `weight`, `fdist`, `cls`, `pi` to any car and the stats panel + engine use them.
- **`window.FORZA_TRACKS = [...]`** — tracks, with `character`, `type` and `flags`.
- **`window.ForzaTune`** — the engine, if you want to change the tuning maths.

Car schema (only `name` is required; everything else optional):
```json
{ "name": "2015 SUBARU WRX STI", "make": "SUBARU", "year": 2015,
  "division": "Modern Sport Compact", "dt": "AWD", "layout": "front",
  "weight": 3391, "fdist": 59, "cls": "B", "pi": 660 }
```
- `dt`: `RWD` | `AWD` | `FWD` · `layout`: `front` | `mid` | `rear`

### Adding stock PI / weight in bulk
The official list doesn't include PI or weight. To populate them, host a `cars.json` (a raw JSON array using the schema above) and paste its raw URL into the app's **"Replace roster"** box — the roster swaps in and the stats panel/engine light up. Community stats sources include ManteoMax's Forza spreadsheets (manteomax.com).

---

Not affiliated with Turn 10 Studios or Microsoft. Forza Motorsport is their trademark.
