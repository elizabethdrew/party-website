/**
 * A Celestial Midsummer Night's Dream — V2
 * All the magic in one file: stars, fireflies, cursor trail,
 * background transitions, parallax, reveals, and the gate.
 */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // 1. PASSWORD GATE
  // ============================================================
  (() => {
    const PARTY_PASSWORD = 'party';
    const KEY = 'partyInviteUnlocked';

    const gate = document.getElementById('gate');
    const invite = document.getElementById('inviteContent');
    const form = document.getElementById('gateForm');
    const input = document.getElementById('password');
    const error = document.getElementById('gateError');

    if (!gate || !invite || !form || !input) return;

    function unlock() {
      sessionStorage.setItem(KEY, 'true');

      // Magical dissolve
      gate.classList.add('gate--unlocking');
      gate.addEventListener('animationend', () => {
        gate.style.display = 'none';
      }, { once: true });

      invite.style.display = 'block';

      // Burst of sparkles on unlock
      if (!reducedMotion) {
        burstSparkles(window.innerWidth / 2, window.innerHeight / 2, 40);
      }
    }

    if (sessionStorage.getItem(KEY) === 'true') {
      gate.style.display = 'none';
      invite.style.display = 'block';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      error.textContent = '';
      if ((input.value || '') === PARTY_PASSWORD) {
        unlock();
      } else {
        error.textContent = 'Nope — try again.';
        input.value = '';
        input.focus();
        // Shake the card
        const card = gate.querySelector('.gate-card');
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = 'shake 0.5s ease';
      }
    });
  })();

  // ============================================================
  // 2. BACKGROUND CROSSFADE (Sky transitions)
  // ============================================================
  (() => {
    const layers = [
      { el: document.getElementById('bgA'), url: 'images/background_night.png' },
      { el: document.getElementById('bgB'), url: 'images/background_dawn.png' },
      { el: document.getElementById('bgC'), url: 'images/background_day.png' },
      { el: document.getElementById('bgD'), url: 'images/background_sunset.png' },
    ];

    const pxPerScene = 900;
    const fadePortion = 0.2;
    const moonEl = document.querySelector('.face-moon');
    const sunEl = document.querySelector('.face-sun');
    const sunLevels = [0.0, 0.6, 1.0, 0.6];

    // Star opacity per scene: stars visible at night/dawn/sunset, dim during day
    const starOpacity = [1.0, 0.4, 0.05, 0.5];

    // The scene sequence: night(0) -> dawn(1) -> day(2) -> sunset(3) -> night(0), then hold
    const sceneSequence = [0, 1, 2, 3, 0]; // indices into layers[]
    const NUM_TRANSITIONS = sceneSequence.length - 1; // 4 transitions

    layers.forEach(l => {
      if (l.el) l.el.style.backgroundImage = `url("${l.url}")`;
    });

    function update() {
      // Clamp scroll progress to the number of transitions
      const scenePos = Math.min(scrollY / pxPerScene, NUM_TRANSITIONS);
      const transIndex = Math.min(Math.floor(scenePos), NUM_TRANSITIONS - 1);

      const baseLayer = sceneSequence[transIndex];
      const nextLayer = sceneSequence[transIndex + 1];

      // Calculate fade: only fade in the last portion of each scene
      const rawT = scenePos - transIndex;
      const fadeStart = 1 - fadePortion;
      const t = (scenePos >= NUM_TRANSITIONS) ? 0 : Math.min(1, Math.max(0, (rawT - fadeStart) / fadePortion));

      // Build target opacity for each layer
      const opacities = [0, 0, 0, 0];

      if (scenePos >= NUM_TRANSITIONS) {
        // Past all transitions — hold on night
        opacities[0] = 1;
      } else if (t === 0) {
        // No crossfade happening — show base at full
        opacities[baseLayer] = 1;
      } else {
        // Crossfading between base and next
        opacities[baseLayer] = 1 - t;
        opacities[nextLayer] = Math.max(opacities[nextLayer], t);
      }

      // Apply all opacities in one pass (no flicker from setting 0 first)
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].el) layers[i].el.style.opacity = String(opacities[i]);
      }

      // Sun/moon face sync
      const activeBase = sceneSequence[transIndex];
      const activeNext = sceneSequence[transIndex + 1];
      const sunIntensity = (sunLevels[activeBase] * (1 - t)) + (sunLevels[activeNext] * t);
      if (moonEl && sunEl) {
        moonEl.style.opacity = '1';
        sunEl.style.opacity = String(sunIntensity);
      }

      // Star canvas opacity
      const sOpacity = (starOpacity[activeBase] * (1 - t)) + (starOpacity[activeNext] * t);
      const starCanvas = document.getElementById('starCanvas');
      if (starCanvas) starCanvas.style.opacity = String(sOpacity);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // ============================================================
  // 3. STAR CANVAS — Twinkling stars + shooting stars
  // ============================================================
  if (!reducedMotion) (() => {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const stars = [];
    const shootingStars = [];
    const STAR_COUNT = 200;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.8 + 0.3,
          brightness: Math.random() * 0.5 + 0.5,
        });
      }
    }

    function maybeShootingStar() {
      if (Math.random() < 0.003 && shootingStars.length < 2) {
        const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
        shootingStars.push({
          x: Math.random() * W * 0.8,
          y: Math.random() * H * 0.3,
          len: 60 + Math.random() * 80,
          speed: 6 + Math.random() * 6,
          angle,
          life: 1,
          decay: 0.015 + Math.random() * 0.01,
        });
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        const twinkle = Math.sin(time * 0.001 * s.speed + s.phase) * 0.3 + 0.7;
        const alpha = s.brightness * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 230, ${alpha})`;
        ctx.fill();

        // Larger stars get a subtle glow
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 235, 200, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      // Shooting stars
      maybeShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life -= ss.decay;

        if (ss.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(1, `rgba(255, 248, 220, ${ss.life * 0.9})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 240, ${ss.life})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    initStars();
    requestAnimationFrame(draw);
    window.addEventListener('resize', () => { resize(); initStars(); });
  })();

  // ============================================================
  // 4. FIREFLIES (Canvas)
  // ============================================================
  if (!reducedMotion && window.innerWidth > 900) (() => {
    const canvas = document.getElementById('fireflyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const flies = [];
    const FLY_COUNT = 30;
    let mouseX = -1000, mouseY = -1000;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initFlies() {
      flies.length = 0;
      for (let i = 0; i < FLY_COUNT; i++) {
        flies.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2.5 + 1.5,
          phase: Math.random() * Math.PI * 2,
          glowSpeed: Math.random() * 1.5 + 0.8,
          hue: 40 + Math.random() * 20, // warm gold range
        });
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, W, H);

      for (const f of flies) {
        // Slight drift
        f.vx += (Math.random() - 0.5) * 0.05;
        f.vy += (Math.random() - 0.5) * 0.05;
        f.vx *= 0.98;
        f.vy *= 0.98;

        // Gentle attraction toward cursor
        const dx = mouseX - f.x;
        const dy = mouseY - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250 && dist > 20) {
          f.vx += (dx / dist) * 0.03;
          f.vy += (dy / dist) * 0.03;
        }

        f.x += f.vx;
        f.y += f.vy;

        // Wrap around
        if (f.x < -20) f.x = W + 20;
        if (f.x > W + 20) f.x = -20;
        if (f.y < -20) f.y = H + 20;
        if (f.y > H + 20) f.y = -20;

        // Glow pulse
        const glow = Math.sin(time * 0.001 * f.glowSpeed + f.phase) * 0.4 + 0.6;

        // Outer glow
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 8);
        grad.addColorStop(0, `hsla(${f.hue}, 80%, 70%, ${glow * 0.25})`);
        grad.addColorStop(1, `hsla(${f.hue}, 80%, 70%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(f.x - f.r * 8, f.y - f.r * 8, f.r * 16, f.r * 16);

        // Core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 90%, 80%, ${glow * 0.8})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    initFlies();
    requestAnimationFrame(draw);

    window.addEventListener('resize', () => { resize(); initFlies(); });
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });
  })();

  // ============================================================
  // 5. CURSOR SPARKLE TRAIL
  // ============================================================
  if (!reducedMotion) (() => {
    const container = document.getElementById('cursorTrail');
    if (!container) return;

    const sparkles = [];
    const MAX_SPARKLES = 30;
    let lastX = 0, lastY = 0, lastTime = 0;

    function createSparkle(x, y) {
      const el = document.createElement('div');
      el.className = 'sparkle';
      const size = Math.random() * 8 + 3;
      const hue = 35 + Math.random() * 25;
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        background: radial-gradient(circle, hsla(${hue}, 90%, 75%, 0.9), transparent 70%);
        box-shadow: 0 0 ${size * 2}px hsla(${hue}, 90%, 70%, 0.3);
      `;
      container.appendChild(el);

      const sparkle = {
        el,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size,
      };
      sparkles.push(sparkle);

      if (sparkles.length > MAX_SPARKLES) {
        const old = sparkles.shift();
        old.el.remove();
      }
    }

    function updateSparkles() {
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life -= s.decay;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.03; // gravity

        if (s.life <= 0) {
          s.el.remove();
          sparkles.splice(i, 1);
          continue;
        }

        s.el.style.transform = `translate(${s.x - parseFloat(s.el.style.left)}px, ${s.y - parseFloat(s.el.style.top)}px) scale(${s.life})`;
        s.el.style.opacity = String(s.life);
      }

      requestAnimationFrame(updateSparkles);
    }

    requestAnimationFrame(updateSparkles);

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Only emit sparkles when moving fast enough, throttled
      if (speed > 3 && now - lastTime > 40) {
        createSparkle(e.clientX, e.clientY);
        lastTime = now;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }, { passive: true });
  })();

  // Burst sparkles helper (used on gate unlock)
  function burstSparkles(cx, cy, count) {
    const container = document.getElementById('cursorTrail');
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'sparkle';
      const size = Math.random() * 10 + 4;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const dist = 50 + Math.random() * 120;
      const hue = 30 + Math.random() * 30;
      const dur = 0.6 + Math.random() * 0.8;

      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${cx - size / 2}px;
        top: ${cy - size / 2}px;
        background: radial-gradient(circle, hsla(${hue}, 90%, 75%, 1), transparent 70%);
        box-shadow: 0 0 ${size * 3}px hsla(${hue}, 90%, 70%, 0.5);
        transition: all ${dur}s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 1;
      `;
      container.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), dur * 1000 + 100);
    }
  }

  // ============================================================
  // 6. FLOATING PARTICLES (DOM-based, sparse)
  // ============================================================
  if (!reducedMotion) (() => {
    const container = document.querySelector('.particles');
    if (!container) return;

    const COUNT = 15;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'particle-float';
      const size = Math.random() * 3 + 2;
      const left = Math.random() * 100;
      const delay = Math.random() * 20;
      const dur = 15 + Math.random() * 20;
      const hue = 35 + Math.random() * 25;

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: -10px;
        background: hsla(${hue}, 80%, 70%, 0.7);
        box-shadow: 0 0 ${size * 2}px hsla(${hue}, 80%, 70%, 0.3);
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `;
      container.appendChild(p);
    }
  })();

  // ============================================================
  // 7. SCROLL REVEAL (IntersectionObserver)
  // ============================================================
  (() => {
    if (reducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal--visible'));
      return;
    }

    function setupReveals() {
      const reveals = document.querySelectorAll('.reveal:not(.reveal--visible)');
      if (!reveals.length) return;

      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            io.unobserve(entry.target);
          }
        }
      }, { threshold: 0.08, rootMargin: '50px 0px -20px 0px' });

      reveals.forEach(el => io.observe(el));
    }

    // Run immediately and also after a short delay (for gate unlock timing)
    setupReveals();
    setTimeout(setupReveals, 500);

    // Re-run when inviteContent becomes visible
    const invite = document.getElementById('inviteContent');
    if (invite) {
      const mo = new MutationObserver(() => {
        if (invite.style.display !== 'none') {
          setTimeout(setupReveals, 100);
          mo.disconnect();
        }
      });
      mo.observe(invite, { attributes: true, attributeFilter: ['style'] });
    }
  })();

  // ============================================================
  // 8. PARALLAX (Desktop only)
  // ============================================================
  (() => {
    if (reducedMotion) return;
    const mq = window.matchMedia('(min-width: 901px)');
    if (!mq.matches) return;

    const els = document.querySelectorAll('.card');
    if (!els.length) return;

    let ticking = false;

    function update() {
      const vh = window.innerHeight;
      const centerY = vh / 2;

      for (const el of els) {
        if (!el.classList.contains('reveal--visible')) continue;

        const r = el.getBoundingClientRect();
        const elCenter = r.top + r.height / 2;
        const d = Math.max(-1, Math.min(1, (elCenter - centerY) / centerY));
        const eased = Math.sign(d) * Math.pow(Math.abs(d), 0.85);
        const nudge = -eased * 14;

        el.style.transform = `translate3d(0, ${nudge.toFixed(1)}px, 0)`;
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  })();

  // ============================================================
  // 9. GATE STARS (mini star field for the gate screen)
  // ============================================================
  if (!reducedMotion) (() => {
    const canvas = document.getElementById('gateStars');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const stars = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function init() {
      stars.length = 0;
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.5 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 1 + 0.5,
        });
      }
    }

    function draw(time) {
      // Stop if gate is hidden
      if (canvas.offsetParent === null) return;

      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const twinkle = Math.sin(time * 0.001 * s.speed + s.phase) * 0.35 + 0.65;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 230, ${twinkle})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    init();
    requestAnimationFrame(draw);
    window.addEventListener('resize', () => { resize(); init(); });
  })();

  // ============================================================
  // 10. SHAKE KEYFRAME (injected dynamically for gate error)
  // ============================================================
  (() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-5px); }
        80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  })();

})();
