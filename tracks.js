/*
 * Forza Motorsport (2023) — TRACK ROSTER
 * ------------------------------------------------------------------
 * All 30 locations (24 real + 6 fictional) from the final content build
 * (through Fujimi Kaido, May 2025). The main layout configurations are
 * listed; a few venues have more in-game variations than shown.
 *
 * Fields:
 *   venue     : location name (used for grouping)
 *   layout    : configuration name (as it commonly appears in-game)
 *   type      : 'circuit' | 'oval' | 'touge'
 *   character : 'technical' | 'mixed' | 'high-speed'  (drives the track toggle)
 *   flags     : tuning-relevant traits — the engine reacts to these:
 *               heavy-braking, elevation, bumpy, kerbs, low-grip,
 *               long-straight, high-speed-corners, narrow, banking
 *   note      : one-line setup emphasis
 *
 * character/flags are tuning heuristics based on each circuit's real layout,
 * not telemetry — treat them as sensible defaults and adjust to taste.
 */
window.FORZA_TRACKS = [
  // Barcelona-Catalunya
  { venue:"Circuit de Barcelona-Catalunya", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["heavy-braking","kerbs","low-grip"], note:"Abrasive surface and long corners punish understeer; protect front tyres." },
  { venue:"Circuit de Barcelona-Catalunya", layout:"National", type:"circuit", character:"mixed", flags:["kerbs"], note:"Flows better without the final sector; balance for rotation." },
  { venue:"Circuit de Barcelona-Catalunya", layout:"Club", type:"circuit", character:"technical", flags:["kerbs"], note:"Short and tight — mechanical grip over top speed." },

  // Spa
  { venue:"Circuit de Spa-Francorchamps", layout:"Grand Prix", type:"circuit", character:"high-speed", flags:["elevation","high-speed-corners","long-straight","heavy-braking"], note:"Eau Rouge wants stability; gear for the Kemmel straight." },

  // Homestead-Miami
  { venue:"Homestead-Miami Speedway", layout:"Oval", type:"oval", character:"high-speed", flags:["banking","long-straight"], note:"Banking loads the outside; long gearing and rearward brake bias." },
  { venue:"Homestead-Miami Speedway", layout:"Road Course", type:"circuit", character:"mixed", flags:["banking"], note:"Infield rotation plus a banked section — compromise setup." },

  // Indianapolis
  { venue:"Indianapolis Motor Speedway", layout:"Speedway Oval", type:"oval", character:"high-speed", flags:["banking","long-straight"], note:"Minimal drag, long final drive, slight rear brake bias." },
  { venue:"Indianapolis Motor Speedway", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["heavy-braking"], note:"Stop-and-go infield rewards strong braking stability." },

  // Kyalami
  { venue:"Kyalami Grand Prix Circuit", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["elevation","high-speed-corners"], note:"Fast sweeps with altitude; lean on aero balance." },

  // Le Mans
  { venue:"Le Mans - Circuit de la Sarthe", layout:"Full Circuit", type:"circuit", character:"high-speed", flags:["long-straight","heavy-braking"], note:"Top-speed track with hard chicane braking — split the difference on gearing." },
  { venue:"Le Mans - Circuit de la Sarthe", layout:"Old Mulsanne (No Chicane)", type:"circuit", character:"high-speed", flags:["long-straight"], note:"Pure top speed: longest gearing, minimum drag." },

  // Lime Rock
  { venue:"Lime Rock Park", layout:"Full Course", type:"circuit", character:"technical", flags:["elevation","kerbs","narrow"], note:"Tiny and rhythmic — soft over kerbs, quick direction changes." },
  { venue:"Lime Rock Park", layout:"Classic (No Chicane)", type:"circuit", character:"technical", flags:["elevation","narrow"], note:"Even tighter; maximise mechanical grip." },

  // Mid-Ohio
  { venue:"Mid-Ohio Sports Car Course", layout:"Full Circuit", type:"circuit", character:"technical", flags:["elevation","kerbs"], note:"Tight, undulating, kerb-heavy — agility over speed." },
  { venue:"Mid-Ohio Sports Car Course", layout:"Chicane", type:"circuit", character:"technical", flags:["elevation","kerbs"], note:"The chicane adds a braking test; keep the car settled." },

  // Mugello
  { venue:"Mugello Circuit", layout:"Grand Prix", type:"circuit", character:"high-speed", flags:["elevation","high-speed-corners","heavy-braking"], note:"Flowing high-speed corners then a huge stop into T1." },

  // Nürburgring
  { venue:"Nürburgring", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["heavy-braking","kerbs"], note:"Balanced GP loop; strong braking and kerb compliance." },
  { venue:"Nürburgring", layout:"Nordschleife", type:"circuit", character:"high-speed", flags:["elevation","bumpy","narrow","high-speed-corners"], note:"Bumps and blind crests demand a softer, forgiving car." },
  { venue:"Nürburgring", layout:"24h (GP + Nordschleife)", type:"circuit", character:"high-speed", flags:["elevation","bumpy","narrow","high-speed-corners","heavy-braking"], note:"Everything at once — prioritise compliance and stability." },

  // Road America
  { venue:"Road America", layout:"Full Circuit", type:"circuit", character:"high-speed", flags:["long-straight","heavy-braking"], note:"Long straights into heavy braking zones — gearing and brakes matter most." },

  // Silverstone
  { venue:"Silverstone Circuit", layout:"Grand Prix", type:"circuit", character:"high-speed", flags:["high-speed-corners"], note:"Maggotts–Becketts rewards downforce and a stable rear." },
  { venue:"Silverstone Circuit", layout:"National", type:"circuit", character:"mixed", flags:["high-speed-corners"], note:"Shorter but still fast; keep the rear planted." },
  { venue:"Silverstone Circuit", layout:"International", type:"circuit", character:"mixed", flags:[], note:"Mixed rhythm — a neutral balance works well." },

  // Suzuka
  { venue:"Suzuka Circuit", layout:"Full Circuit", type:"circuit", character:"high-speed", flags:["high-speed-corners","kerbs"], note:"The Esses and 130R need a confident front and stable rear." },
  { venue:"Suzuka Circuit", layout:"East", type:"circuit", character:"technical", flags:["kerbs"], note:"Short loop — mechanical grip and quick turn-in." },

  // Virginia International Raceway
  { venue:"Virginia International Raceway", layout:"Grand Course", type:"circuit", character:"mixed", flags:["elevation","high-speed-corners"], note:"Long and hilly with fast esses; balance for commitment." },
  { venue:"Virginia International Raceway", layout:"Patriot", type:"circuit", character:"technical", flags:["elevation"], note:"Compact layout — favour agility." },

  // Watkins Glen
  { venue:"Watkins Glen", layout:"Full (Boot)", type:"circuit", character:"high-speed", flags:["elevation","high-speed-corners"], note:"Fast, committed corners; downforce and a stable rear." },
  { venue:"Watkins Glen", layout:"Short (No Boot)", type:"circuit", character:"high-speed", flags:["high-speed-corners"], note:"Even faster average speed; keep it planted." },

  // Laguna Seca
  { venue:"WeatherTech Raceway Laguna Seca", layout:"Full Circuit", type:"circuit", character:"mixed", flags:["elevation","heavy-braking"], note:"The Corkscrew rewards a car that stays settled over crests." },

  // Yas Marina
  { venue:"Yas Marina Circuit", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["heavy-braking","long-straight"], note:"Big stops after long straights — braking stability is key." },
  { venue:"Yas Marina Circuit", layout:"South", type:"circuit", character:"technical", flags:["heavy-braking"], note:"Tighter section; mechanical grip and strong brakes." },
  { venue:"Yas Marina Circuit", layout:"North", type:"circuit", character:"mixed", flags:[], note:"Balanced short layout." },

  // Hockenheim
  { venue:"Hockenheim", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["heavy-braking"], note:"Stadium hairpins reward braking and traction." },
  { venue:"Hockenheim", layout:"National", type:"circuit", character:"mixed", flags:["heavy-braking"], note:"Shorter loop; keep braking stable." },
  { venue:"Hockenheim", layout:"Short", type:"circuit", character:"technical", flags:[], note:"Compact and tight — agility first." },

  // Daytona
  { venue:"Daytona International Speedway", layout:"Tri-Oval", type:"oval", character:"high-speed", flags:["banking","long-straight"], note:"High banking; long gearing, minimal drag, rear brake bias." },
  { venue:"Daytona International Speedway", layout:"Road Course", type:"circuit", character:"mixed", flags:["banking","heavy-braking"], note:"Banked oval sections plus a technical infield — compromise." },

  // Brands Hatch
  { venue:"Brands Hatch", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["elevation","high-speed-corners"], note:"Rolling and fast; commit through the downhill sweeps." },
  { venue:"Brands Hatch", layout:"Indy", type:"circuit", character:"technical", flags:["elevation"], note:"Short, sharp, elevation-rich — agility over top speed." },

  // Sebring
  { venue:"Sebring International Raceway", layout:"Full Circuit", type:"circuit", character:"mixed", flags:["bumpy","heavy-braking"], note:"Notoriously bumpy — soften and raise ride height to keep contact." },
  { venue:"Sebring International Raceway", layout:"School / Short", type:"circuit", character:"technical", flags:["bumpy"], note:"Bumpy and tight; compliance over stiffness." },

  // Road Atlanta
  { venue:"Road Atlanta", layout:"Full Circuit", type:"circuit", character:"high-speed", flags:["elevation","high-speed-corners","heavy-braking"], note:"Blind, elevated fast corners then a hard chicane stop." },

  // Bathurst
  { venue:"Mount Panorama Circuit", layout:"Full Circuit", type:"circuit", character:"high-speed", flags:["elevation","narrow","low-grip","high-speed-corners"], note:"Walls, big elevation, fast top section — stability and precision, no risks." },

  // --- Fictional ---
  { venue:"Eaglerock Speedway", layout:"Oval", type:"oval", character:"high-speed", flags:["banking","long-straight"], note:"Fictional oval; long gearing and rear brake bias." },

  { venue:"Grand Oak Raceway", layout:"Grand Prix", type:"circuit", character:"mixed", flags:["heavy-braking"], note:"Balanced fictional GP; neutral setup baseline." },
  { venue:"Grand Oak Raceway", layout:"National", type:"circuit", character:"mixed", flags:[], note:"Mid-length loop; keep it neutral." },
  { venue:"Grand Oak Raceway", layout:"Club", type:"circuit", character:"technical", flags:[], note:"Short and tight — mechanical grip." },

  { venue:"Hakone Circuit", layout:"Grand Prix", type:"circuit", character:"high-speed", flags:["elevation","high-speed-corners"], note:"Fast fictional mountain GP; downforce and stability." },
  { venue:"Hakone Circuit", layout:"Club", type:"circuit", character:"mixed", flags:["elevation"], note:"Shorter variant; balanced with elevation changes." },

  { venue:"Maple Valley", layout:"Full Circuit", type:"circuit", character:"mixed", flags:["elevation","kerbs","narrow"], note:"Classic flowing forest track; compliance over kerbs." },
  { venue:"Maple Valley", layout:"Short", type:"circuit", character:"technical", flags:["elevation","narrow"], note:"Tight version — agility and mechanical grip." },

  { venue:"Sunset Peninsula", layout:"Oval", type:"oval", character:"high-speed", flags:["banking","long-straight"], note:"Fictional superspeedway; low drag, long gearing." },
  { venue:"Sunset Peninsula", layout:"Road Course", type:"circuit", character:"mixed", flags:["banking"], note:"Infield plus banking — compromise setup." },

  { venue:"Fujimi Kaido", layout:"Full", type:"touge", character:"technical", flags:["elevation","narrow","low-grip","bumpy"], note:"Long, tight mountain road — soft, agile and forgiving; a handling test." },
  { venue:"Fujimi Kaido", layout:"Uphill", type:"touge", character:"technical", flags:["elevation","narrow","low-grip"], note:"Traction and drive off slow corners matter most." },
  { venue:"Fujimi Kaido", layout:"Downhill", type:"touge", character:"technical", flags:["elevation","narrow","low-grip","bumpy"], note:"Braking stability and compliance downhill; don't over-stiffen." }
];
