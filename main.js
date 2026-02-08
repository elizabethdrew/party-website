(() => {
  const layers = [
    { el: document.getElementById("bgA"), url: "images/background_night.png" },
    { el: document.getElementById("bgB"), url: "images/background_dawn.png" },
    { el: document.getElementById("bgC"), url: "images/background_day.png" },
    { el: document.getElementById("bgD"), url: "images/background_sunset.png" },
  ];

  let pxPerScene = 1400;


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
    const scenePos = scrollY / pxPerScene;
    const n = layers.length;
    const base = ((Math.floor(scenePos) % n) + n) % n;
    const next = (base + 1) % n;
    
    const rawT = scenePos - Math.floor(scenePos);
    const fadeStart = 1 - fadePortion;              
    const t = Math.min(1, Math.max(0, (rawT - fadeStart) / fadePortion));

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

(() => {
  // Respect reduced motion
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  // Start hidden
  els.forEach(el => el.classList.add("reveal--hidden"));

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("reveal--shown");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();
