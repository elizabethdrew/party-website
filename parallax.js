(() => {
  // Desktop only
  const mq = window.matchMedia("(min-width: 901px)");
  if (!mq.matches) return;

  // Respect reduced motion
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  const els = Array.from(document.querySelectorAll(".parallax"));
  if (!els.length) return;

  let ticking = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function update() {
    const vh = window.innerHeight || 1;
    const centerY = vh / 2;

    // Tune these for vibe:
    const maxNudgePx = 16;  // 10–22 is a good range
    const maxScale = 0.012; // 0.00–0.02 (very subtle)
    const minOpacity = 0.82; // 0.75–0.9

    for (const el of els) {
      const r = el.getBoundingClientRect();
      const elCenter = r.top + r.height / 2;

      // distance from viewport center, normalized to -1..1
      const d = (elCenter - centerY) / centerY;
      const dn = clamp(d, -1, 1);

      // Make it ease (less linear, more natural)
      const eased = Math.sign(dn) * Math.pow(Math.abs(dn), 0.85);

      // Nudge opposite direction to create depth
      const nudge = -eased * maxNudgePx;

      // Optional "focus": closer to center = slightly larger and more opaque
      const focus = 1 - Math.min(1, Math.abs(dn)); // 1 at center, 0 at edges
      const scale = 1 + (focus * maxScale);
      const opacity = minOpacity + (focus * (1 - minOpacity));

      el.style.transform = `translate3d(0, ${nudge.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      el.style.opacity = opacity.toFixed(3);
    }

    ticking = false;
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  update();
})();
