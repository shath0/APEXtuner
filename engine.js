/*
 * Forza Motorsport (2023) — Tune Engine
 * ------------------------------------------------------------------
 * Pure, deterministic. generateTune(car, opts) -> structured tune.
 * All heuristics derive from the FM2023 physics/PI model. Absolute
 * scales used:
 *   ARB            1–65
 *   Dampers        1.0–20.0
 *   Diff / brakes  % (0–100)
 *   Springs/ride   given as % of the car's slider RANGE (car-specific)
 * Tyre pressure, camber, toe and caster are given as absolute values.
 */
(function () {
  "use strict";

  var CLASS_FLOOR = { D:100, C:500, B:600, A:700, S1:800, S2:900, X:998 };
  var CLASS_CAP   = { D:500, C:600, B:700, A:800, S1:900, S2:998, X:999 };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function rHalf(v) { return Math.round(v * 2) / 2; }
  function r0(v) { return Math.round(v); }
  function sign(v) { return (v > 0 ? "+" : "") + v; }

  // opts: { piClass, tire, layout, drivetrain, surface, tech, goal, abs, tc, issue }
  function generateTune(car, o) {
    var dt = o.drivetrain || car.dt;
    var layout = o.layout || car.layout;
    var weight = car.weight || 3000;
    var fdist = car.fdist || 50;
    var frontHeavy = fdist >= 55;
    var rearEngine = layout === "rear";
    var midEngine = layout === "mid";
    var wet = o.surface === "wet";
    var damp = o.surface === "damp";
    var hispeed = o.tech === "high-speed";
    var techy = o.tech === "technical";
    var grip = o.goal === "grip" || o.goal === "time-attack";
    var drift = o.goal === "drift";
    var oval = o.goal === "oval";
    var drag = o.goal === "drag";
    var issue = o.issue || "none";

    // ---- track context ----
    var tk = o.track || null;
    function tkHas(f) { return !!(tk && tk.flags && tk.flags.indexOf(f) >= 0); }
    var tkOval = !!(tk && tk.type === "oval");
    var tkTouge = !!(tk && tk.type === "touge");
    var tkBumpy = tkHas("bumpy") || tkHas("elevation") || tkHas("kerbs");
    var tkFastCorners = tkHas("high-speed-corners");
    var tkLongStraight = tkHas("long-straight") || tkOval;
    var tkHeavyBrake = tkHas("heavy-braking");
    var tkLowGrip = tkHas("low-grip");
    var tkNarrow = tkHas("narrow");

    var sections = [];

    /* ---------------- TYRES ---------------- */
    var pF = 30, pR = 30;
    if (wet) { pF -= 2; pR -= 2; } else if (damp) { pF -= 1; pR -= 1; }
    if (hispeed) { pF += 1; pR += 1; }
    if (dt === "RWD") pR -= 0.5;
    if (dt === "FWD") pF -= 0.5;
    if (drift) pR += 2;
    pF = rHalf(clamp(pF, 24, 35)); pR = rHalf(clamp(pR, 24, 35));
    sections.push({
      id: "tyres", title: "Tyres",
      items: [
        { k: "Pressure — front", v: pF + " psi", r: "Target hot pressure; lower for grip in the " + (wet ? "wet" : "cold") + ", raise if turn-in feels vague." },
        { k: "Pressure — rear",  v: pR + " psi", r: drift ? "Higher rear pressure = smaller contact patch to break traction." : "Balance against front; drop 1 psi if the rear steps out under power." }
      ],
      note: wet ? "No dedicated rain compound in FM2023 — the setup compensates. Consider one compound softer than your dry choice." : "Aim for even tyre temps across the tread after a few laps."
    });

    /* ---------------- ALIGNMENT ---------------- */
    var cF = -1.4, cR = -0.9;
    if (grip) { cF -= 0.4; cR -= 0.3; }
    if (hispeed) { cF += 0.4; cR += 0.3; }
    if (techy) cF -= 0.2;
    if (wet) { cF += 0.5; cR += 0.4; }
    if (dt === "FWD") cF -= 0.2;
    if (drift) { cF = -3.5; cR = -0.5; }
    if (issue === "understeer") cF += 0.3;
    cF = r1(clamp(cF, -4, -0.5)); cR = r1(clamp(cR, -2.5, -0.3));

    var toeF = techy ? -0.1 : 0.0;
    var toeR = 0.1;
    if (dt === "RWD") toeR += 0.1;
    if (hispeed) toeR += 0.1;
    if (wet) toeR += 0.1;
    if (drift) { toeF = 0.0; toeR = 0.0; }
    if (issue === "understeer") toeF -= 0.1;
    if (issue === "snap-oversteer" || issue === "oversteer-entry") toeR += 0.1;
    toeF = r1(clamp(toeF, -0.3, 0.2)); toeR = r1(clamp(toeR, -0.1, 0.4));

    var caster = hispeed ? 6.5 : (drift ? 7.0 : 6.0);
    if (tkFastCorners) caster = Math.min(7.0, caster + 0.5);
    sections.push({
      id: "align", title: "Alignment",
      items: [
        { k: "Camber — front", v: cF + "°", r: "More negative = more mid-corner front grip; back off if you see inside-edge wear." },
        { k: "Camber — rear",  v: cR + "°", r: "Keep the rear flatter than the front for traction." },
        { k: "Toe — front",    v: sign(toeF) + "°", r: toeF < 0 ? "Slight toe-out sharpens turn-in." : "Zero toe for stability at speed." },
        { k: "Toe — rear",     v: sign(toeR) + "°", r: "Rear toe-in adds straight-line and corner-exit stability." },
        { k: "Caster",         v: caster + "°", r: "Higher caster improves self-centring and high-speed stability (great on a wheel)." }
      ]
    });

    /* ---------------- ANTI-ROLL BARS (1–65) ---------------- */
    var base = clamp(20 + (weight - 2600) / 60, 12, 55);
    var aF, aR;
    if (dt === "FWD") { aF = base * 0.82; aR = base * 1.18; }
    else if (dt === "RWD") { aF = base * 1.12; aR = base * 0.90; }
    else { aF = base * 0.98; aR = base * 1.05; } // AWD
    if (rearEngine) { aF *= 1.12; aR *= 0.95; }
    if (frontHeavy && dt !== "FWD") { aF *= 0.95; aR *= 1.05; }
    if (techy) { aF *= 0.9; aR *= 0.9; }
    if (hispeed) { aF *= 1.1; aR *= 1.1; }
    if (drift) { aF = 52; aR = 15; }
    if (issue === "understeer") aF *= 0.82;
    if (issue === "oversteer-exit") aR *= 0.82;
    if (issue === "braking-instability") aR *= 0.85;
    aF = r1(clamp(aF, 1, 65)); aR = r1(clamp(aR, 1, 65));
    sections.push({
      id: "arb", title: "Anti-roll Bars",
      items: [
        { k: "Front ARB", v: String(aF), r: "Stiffer front pushes toward understeer — your fastest single balance lever." },
        { k: "Rear ARB",  v: String(aR), r: "Stiffer rear frees rotation. Adjust ARBs before touching springs." }
      ],
      note: "Change ARBs in ~2-point steps and re-test one corner type at a time."
    });

    /* ---------------- SPRINGS (% of range) ---------------- */
    var sBase = 50;
    if (grip || hispeed) sBase += 8;
    if (dt === "AWD") sBase += 4;
    if (weight > 3800) sBase += 4;
    if (techy) sBase -= 6;
    if (wet) sBase -= 6;
    if (drift) sBase -= 4;
    if (tkBumpy) sBase -= 4;
    if (tkLowGrip) sBase -= 2;
    sBase = clamp(sBase, 30, 78);
    var sF = clamp(sBase + (fdist - 50) * 0.4, 25, 82);
    var sR = clamp(sBase - (fdist - 50) * 0.4, 25, 82);
    sF = r0(sF); sR = r0(sR);

    /* ---------------- RIDE HEIGHT (% of travel, 0 = lowest) ---------------- */
    var rh = 14;
    if (wet) rh += 12;
    if (techy) rh += 6;
    if (tkBumpy) rh += 6;
    if (drag) rh = 4;
    var rhF, rhR;
    if (rearEngine || midEngine) { rhF = rh + 3; rhR = rh; }
    else { rhF = rh; rhR = rh + 5; } // front-engine rake, nose down
    rhF = clamp(rhF, 2, 42); rhR = clamp(rhR, 2, 42);

    /* ---------------- DAMPERS (1–20) ---------------- */
    var k = sBase / 50;
    var bump = 8 * k;
    if (wet || techy || tkBumpy) bump *= 0.85;
    var reb = bump * 1.2;
    var bumpF = r1(clamp(bump * (sF / sBase), 1, 20));
    var bumpR = r1(clamp(bump * (sR / sBase), 1, 20));
    var rebF = r1(clamp(reb * (sF / sBase), 1, 20));
    var rebR = r1(clamp(reb * (sR / sBase), 1, 20));

    sections.push({
      id: "springs", title: "Springs, Ride Height & Dampers",
      items: [
        { k: "Spring — front", v: sF + "% of range", r: "Set as % of this car's slider min→max. Stiffer resists dive/roll." },
        { k: "Spring — rear",  v: sR + "% of range", r: "Split follows weight distribution (" + fdist + "% front)." },
        { k: "Ride height — front", v: rhF + "% of travel", r: "0% = lowest. Lower is faster until it bottoms out." },
        { k: "Ride height — rear",  v: rhR + "% of travel", r: (rhR > rhF ? "Slight rake (rear higher) aids turn-in on this layout." : "Near-flat rake for a mid/rear-engine car.") },
        { k: "Bump — front / rear",    v: bumpF + " / " + bumpR, r: "Controls compression speed; soften if it skates over bumps." },
        { k: "Rebound — front / rear", v: rebF + " / " + rebR, r: "~20% above bump so the car settles without floating." }
      ],
      note: (wet || techy || tkBumpy) ? "Softened and raised for compliance over bumps/kerbs/elevation here." : "If it bounces over kerbs, drop bump 1–2 points first."
    });

    /* ---------------- DIFFERENTIAL ---------------- */
    var accel = dt === "RWD" ? 30 : (dt === "AWD" ? 20 : 45);
    var decel = 15;
    if (wet) accel -= 8;
    if (drift) { accel = 90; decel = 45; }
    if (oval) decel = 10;
    if (!o.tc) accel += 5;
    if (issue === "wheelspin") accel += 10;
    if (issue === "oversteer-exit") accel -= 8;
    if (issue === "snap-oversteer" || issue === "oversteer-entry") decel -= 5;
    if (tkLowGrip) accel -= 5;
    if (tkOval) accel = Math.max(accel, dt === "RWD" ? 35 : accel); // ovals reward stable power-down
    accel = r0(clamp(accel, 0, 100)); decel = r0(clamp(decel, 0, 100));

    var diffItems = [
      { k: "Acceleration lock", v: accel + "%", r: dt === "FWD" ? "Puts FWD power down cleanly; too high forces understeer." : "Higher = more traction on exit, at the cost of some rotation." },
      { k: "Deceleration lock", v: decel + "%", r: "Higher = sharper lift-off rotation; keep low unless you want the tail lively." }
    ];
    if (dt === "AWD") {
      var rearBias = grip ? 55 : (drift ? 72 : 62);
      diffItems.push({ k: "Centre balance", v: rearBias + "% rear", r: "More rear bias = more RWD feel and rotation; more front = safer and more planted." });
    }
    sections.push({ id: "diff", title: "Differential", items: diffItems });

    /* ---------------- BRAKES ---------------- */
    var pressure = o.abs ? 100 : 90;
    if (wet) pressure -= 5;
    var bias = 52;
    if (oval) bias = 48;
    if (tkOval) bias -= 3;
    if (dt === "FWD") bias += 1;
    if (issue === "braking-instability" || issue === "oversteer-entry") bias += 2;
    if (issue === "understeer") bias -= 1;
    pressure = r0(clamp(pressure, 80, 100)); bias = r0(clamp(bias, 45, 58));
    sections.push({
      id: "brakes", title: "Brakes",
      items: [
        { k: "Pressure", v: pressure + "%", r: o.abs ? "ABS on — you can run full pressure without locking." : "ABS off — backed off to reduce lock-ups; trail gently." },
        { k: "Bias", v: bias + "% front", r: bias > 51 ? "Front bias for shorter stops; ease back if the fronts lock." : "Rearward bias trades stopping power for entry stability." }
      ],
      note: tkHeavyBrake ? "Heavy braking zones here — if the fronts lock, drop pressure 2–3% and shift bias rearward." : undefined
    });

    /* ---------------- GEOMETRY (FM2023) ---------------- */
    var arollF = 50, arollR = 50;
    if (hispeed) { arollF += 5; arollR += 5; }
    if (wet) { arollF -= 5; arollR -= 5; }
    var antiDive = 50 + (issue === "braking-instability" || hispeed || tkHeavyBrake ? 5 : 0);
    var antiSquat = dt === "FWD" ? 45 : 50;
    if (issue === "wheelspin") antiSquat += 5;
    var rcNote = grip || hispeed
      ? "Lower the front roll centre a touch (≈ −5 to −10 mm from stock) to trim roll and sharpen response."
      : (wet ? "Raise roll centres slightly toward stock for softer, more forgiving weight transfer." : "Leave near stock until springs and ARBs are dialled, then fine-tune balance here.");
    sections.push({
      id: "geo", title: "Suspension Geometry (FM2023)",
      items: [
        { k: "Anti-roll — front / rear", v: arollF + "% / " + arollR + "%", r: "Higher fights body roll geometrically; start at 50% and move in 5% steps." },
        { k: "Anti-dive", v: antiDive + "%", r: "Higher keeps the nose flatter under braking." },
        { k: "Anti-squat", v: antiSquat + "%", r: "Higher resists rear squat on power — helps put down torque." },
        { k: "Roll centre", v: "see note", r: rcNote }
      ],
      note: "Geometry is a final-polish tool. Only available with Race suspension installed."
    });

    /* ---------------- AERO ---------------- */
    var aeroF, aeroR;
    if (oval || tkOval) { aeroF = "minimum"; aeroR = "low"; }
    else if (tkFastCorners) { aeroF = "medium"; aeroR = "high"; }
    else if (tkLongStraight) { aeroF = "low"; aeroR = "low–medium"; }
    else if (hispeed) { aeroF = "low"; aeroR = "low–medium"; }
    else if (grip || techy) { aeroF = "medium"; aeroR = "medium–high"; }
    else if (drift) { aeroF = "low"; aeroR = "low"; }
    else { aeroF = "low–medium"; aeroR = "medium"; }
    sections.push({
      id: "aero", title: "Aero",
      items: [
        { k: "Front downforce", v: aeroF, r: "More front = more turn-in bite but more drag." },
        { k: "Rear downforce",  v: aeroR, r: "Keep rear ≥ front for high-speed stability." }
      ],
      note: "Only adjustable with aero parts fitted. Below A class the PI cost usually isn't worth it — skip unless the track is very fast."
    });

    /* ---------------- GEARING ---------------- */
    var fdDir = (tkLongStraight || tkOval) ? "longer (more top speed)"
      : (techy ? "shorter (more acceleration)"
      : (hispeed || oval ? "longer (more top speed)" : "balanced"));
    sections.push({
      id: "gears", title: "Gearing",
      items: [
        { k: "Final drive", v: fdDir, r: "Tune it to the circuit's longest straight — you should just hit the limiter at its end." },
        { k: "Individual ratios", v: "even spread", r: "Space the gears so the engine stays in its power band; check the max-speed-per-gear readout." }
      ]
    });

    /* ---------------- TRACK FOCUS (first card when a track is chosen) ---------------- */
    if (tk) {
      var emphasis = [];
      if (tkLongStraight || tkOval) emphasis.push("long gearing for top speed");
      if (tkFastCorners) emphasis.push("more rear downforce and stability");
      if (tkHeavyBrake) emphasis.push("braking stability (anti-dive, bias)");
      if (tkBumpy) emphasis.push("softer, higher setup for compliance");
      if (tkLowGrip || tkNarrow) emphasis.push("predictability over outright pace");
      if (!emphasis.length) emphasis.push("a neutral, balanced setup");
      var flagText = (tk.flags && tk.flags.length) ? tk.flags.join(", ") : "none";
      sections.unshift({
        id: "track", title: "Track — " + tk.venue + " · " + tk.layout,
        items: [
          { k: "Character", v: labelTech(tk.character), r: tk.note || "" },
          { k: "Type", v: tk.type, r: tkOval ? "Oval: minimise drag, gear long, bias brakes rearward." : (tkTouge ? "Mountain road: agility, compliance and traction matter more than top speed." : "Road circuit.") },
          { k: "Key traits", v: flagText, r: "These drove the adjustments below." },
          { k: "Setup emphasis", v: emphasis.length + " focus" + (emphasis.length > 1 ? "es" : ""), r: emphasis.join("; ") + "." }
        ]
      });
    }

    /* ---------------- UPGRADE PLAN ---------------- */
    var cap = CLASS_CAP[o.piClass] || 700;
    var upg = buildUpgradePlan(car, o, dt);

    /* ---------------- SUMMARY ---------------- */
    var notes = [];
    notes.push(dt + " · " + layout + "-engine · ~" + weight + " lb · " + fdist + "% front");
    notes.push("Target: " + o.piClass + " class (cap " + cap + ") · " + o.tire + " tyres · " + labelGoal(o.goal));
    notes.push(o.surface + " surface · " + labelTech(o.tech) + " · ABS " + (o.abs ? "on" : "off") + " · TC " + (o.tc ? "on" : "off"));
    if (tk) notes.push("Track: " + tk.venue + " — " + tk.layout);
    if (issue !== "none") notes.push("Correcting for: " + labelIssue(issue));

    return {
      summary: { car: car.name, piClass: o.piClass, cap: cap, floor: CLASS_FLOOR[o.piClass] || 600, notes: notes },
      upgrades: upg,
      sections: sections
    };
  }

  function buildUpgradePlan(car, o, dt) {
    var list = [];
    var tire = o.tire;
    list.push({ part: "Tyre compound → " + tire, why: "Highest grip-per-PI upgrade in the game. Fit before anything else." });
    if (tire === "Race" || tire === "Sport") list.push({ part: "Tyre width (rear +1, front if needed)", why: "Wider rear = traction, wider front = turn-in. Watch the PI cost." });
    list.push({ part: "Weight reduction (max affordable)", why: "PI-efficient: improves braking, accel and agility at once." });
    if (o.goal === "drift" || o.goal === "grip" || o.goal === "time-attack") {
      list.push({ part: "Race suspension", why: "Unlocks geometry: roll centre + anti-dive/squat/roll." });
    } else {
      list.push({ part: "Sport (or Race) suspension", why: "Sport unlocks the core sliders; Race adds full geometry." });
    }
    list.push({ part: "Race brakes", why: "Needed for brake-bias tuning." });
    list.push({ part: "Race/Sport LSD", why: "Enables accel/decel lock tuning — big traction gains." });
    if (o.goal === "drag" || o.goal === "drift") {
      list.push({ part: "Drivetrain swap (car level 50)", why: dt === "AWD" ? "AWD launch for drag." : "RWD character for drift/drag." });
    }
    list.push({ part: "Power (fill remaining PI)", why: "Add intake/exhaust/cam last; only as much as the chassis can use. Turbo/supercharger is high PI." });
    if (o.goal === "grip" || o.goal === "time-attack" || o.tech === "high-speed") {
      list.push({ part: "Aero (front + rear)", why: "Worth it in A class and above, or on fast tracks." });
    }
    return list;
  }

  function labelGoal(g) {
    return ({ grip: "grip / track", "time-attack": "time attack", drag: "drag", drift: "drift", oval: "oval / high-speed" })[g] || g;
  }
  function labelTech(t) {
    return ({ technical: "technical (short bursts)", mixed: "mixed layout", "high-speed": "high-speed (long straights)" })[t] || t;
  }
  function labelIssue(i) {
    return ({
      understeer: "understeer on entry",
      "oversteer-exit": "power oversteer on exit",
      "oversteer-entry": "oversteer on entry",
      "snap-oversteer": "snap / lift-off oversteer",
      "braking-instability": "instability under braking",
      wheelspin: "wheelspin out of corners",
      "wont-rotate": "won't rotate at apex"
    })[i] || i;
  }

  window.ForzaTune = { generateTune: generateTune, CLASS_FLOOR: CLASS_FLOOR, CLASS_CAP: CLASS_CAP };
})();
