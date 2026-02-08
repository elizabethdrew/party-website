(() => {
  const layers = [
    { el: document.getElementById("bgA"), url: "images/background_night.png" },
    { el: document.getElementById("bgB"), url: "images/background_dawn.png" },
    { el: document.getElementById("bgC"), url: "images/background_day.png" },
    { el: document.getElementById("bgD"), url: "images/background_sunset.png" },
  ];

  const sceneLens = [1400, 700, 700, 700]; // [night, dawn, day, sunset]
  const totalLen = sceneLens.reduce((a, b) => a + b, 0);

  // Fade length within each scene (0..1). Smaller = shorter fade.
  const fadePortion = 0.2;

  // Face elements (query once)
  const moonEl = document.querySelector(".face-moon");
  const sunEl  = document.querySelector(".face-sun");

  // Sun intensity per scene: [night, dawn, day, sunset]
  const sunLevels = [0.0, 0.6, 1.0, 0.6];

  // Set backgrounds once
  layers.forEach(l => {
    if (l.el) l.el.style.backgroundImage = `url("${l.url}")`;
  });

  function update() {
    const n = layers.length;

    // Loop the timeline
    const y = ((scrollY % totalLen) + totalLen) % totalLen;
    
    // Find which scene we're in
    let base = 0;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const len = sceneLens[i];
      if (y < acc + len) {
        base = i;
        break;
      }
      acc += len;
    }
    
    const next = (base + 1) % n;
    
    // Progress within the current scene (0..1)
    const rawT = (y - acc) / sceneLens[base];
    
    // Shorten fade within the scene, then “hold”
    const t = Math.min(1, rawT / fadePortion);


    // Reset all
    layers.forEach(l => { if (l.el) l.el.style.opacity = "0"; });

    // Crossfade only two
    if (layers[base].el) layers[base].el.style.opacity = String(1 - t);
    if (layers[next].el) layers[next].el.style.opacity = String(t);

    // Sun intensity synced to background transition
    const sunIntensity = (sunLevels[base] * (1 - t)) + (sunLevels[next] * t);

    // Moon always in front, sun fades behind (synced)
    if (moonEl && sunEl) {
      moonEl.style.opacity = "1";
      sunEl.style.opacity  = String(sunIntensity);
    }
  }

  // rAF throttle for smoother scroll updates
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  update();
})();

