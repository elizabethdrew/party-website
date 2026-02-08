(() => {
  const layers = [
    { el: document.getElementById("bgA"), url: "images/background_night.png" },
    { el: document.getElementById("bgB"), url: "images/background_dawn.png" },
    { el: document.getElementById("bgC"), url: "images/background_day.png" },
    { el: document.getElementById("bgD"), url: "images/background_sunset.png" },
  ];

  const pxPerScene = 1400;

  // Fade length within each scene (0..1). Smaller = shorter fade.
  const fadePortion = 0.2;

  // Face elements (query once)
  const moonEl = document.querySelector(".face-moon");
  const sunEl  = document.querySelector(".face-sun");
  const facePx = 2800; // pixels for moon -> sun, then sun -> moon over next 2800

  // Banner wobble element
  const bannerEl = document.querySelector(".banner");

  // Set backgrounds once
  layers.forEach(l => {
    if (l.el) l.el.style.backgroundImage = `url("${l.url}")`;
  });

  function update() {
    const scrollY = window.scrollY || 0;
    const scenePos = scrollY / pxPerScene;

    const n = layers.length;
    const base = ((Math.floor(scenePos) % n) + n) % n; // safe modulo
    const next = (base + 1) % n;

    const rawT = scenePos - Math.floor(scenePos);      // 0..1 within a scene
    const t = Math.min(1, rawT / fadePortion);         // shortened fade

    // Reset all
    layers.forEach(l => { if (l.el) l.el.style.opacity = "0"; });

    // Crossfade only two
    if (layers[base].el) layers[base].el.style.opacity = String(1 - t);
    if (layers[next].el) layers[next].el.style.opacity = String(t);

    // Face crossfade (LOOPING ping-pong: moon -> sun -> moon -> sun ...)
    const phase = (scrollY % (facePx * 2)) / facePx; // 0..2
    const faceT = phase <= 1 ? phase : (2 - phase); // 0..1..0
    if (moonEl && sunEl) {
      moonEl.style.opacity = "1";
      sunEl.style.opacity  = String(faceT);
    }

    // Banner wobble (gentle sway + rotate)
    if (bannerEl) {
      const wobbleEveryPx = 700; // smaller = more frequent wobble
      const maxRotateDeg = 4;    // rotation strength
      const maxSwayPx = 10;      // sideways movement

      const p = scrollY / wobbleEveryPx;
      const wave = Math.sin(p * Math.PI * 2); // -1..1

      const rot = wave * maxRotateDeg;
      const sway = wave * maxSwayPx;

      // Keep your base translateY(-50%) and add wobble on top
      bannerEl.style.transform = `translateY(-50%) translateX(${sway}px) rotate(${rot}deg)`;
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

  // initial render
  update();
})();
