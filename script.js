(() => {
  'use strict';

  /* ==========================================================================
     1. MODERN WEB GUIDANCE FALLBACKS (Dialog Top-Layer Exit & Light-Dismiss)
     ========================================================================== */
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
  }

  async function closeTopLayer(element, isPopover = false) {
    if (!supportsTopLayerExit()) {
      element.setAttribute('data-closing', '');
      const animations = element.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 2000)),
        ]);
      }
      if (!element.hasAttribute('data-closing')) return;
      element.removeAttribute('data-closing');
    }

    if (isPopover) {
      if (typeof element.hidePopover === 'function') element.hidePopover();
    } else {
      element.close();
    }
  }

  // Setup all native <dialog> elements for animated close and closedby="any" fallback
  const allDialogs = document.querySelectorAll('dialog');
  allDialogs.forEach((dialog) => {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(dialog, false);
    });

    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });
  });

  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) {
          closeTopLayer(dialog, false);
        }
      });
    }
  }

  document.querySelectorAll('[data-close-popover]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close-popover');
      const pop = document.getElementById(targetId);
      if (pop) closeTopLayer(pop, true);
    });
  });

  /* ==========================================================================
     2. WEB AUDIO SYNTHESIZER (Chimes, Pops, Fanfare & Melodies)
     ========================================================================== */
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq = 440, duration = 0.35, type = 'triangle', volume = 0.14) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  function playPopSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(95, ctx.currentTime + 0.11);

    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  function playSparkleChord() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => playTone(n, 0.45, 'triangle', 0.11), idx * 65);
    });
  }

  function playGrandFanfare() {
    const seq = [
      { f: 523.25, d: 0.18, t: 0 },
      { f: 659.25, d: 0.18, t: 140 },
      { f: 783.99, d: 0.18, t: 280 },
      { f: 1046.5, d: 0.65, t: 420 },
    ];
    seq.forEach((item) => {
      setTimeout(() => playTone(item.f, item.d, 'triangle', 0.16), item.t);
    });
  }

  /* ==========================================================================
     3. QUEST / EXPLORER PROGRESS TRACKER (7 KEJUTAN MBA KEI)
     ========================================================================== */
  const completedQuests = new Set();
  const questCountEl = document.getElementById('quest-count');
  const questListEl = document.getElementById('quest-list');

  function completeQuest(questKey) {
    if (completedQuests.has(questKey)) return;
    completedQuests.add(questKey);
    if (questCountEl) questCountEl.textContent = String(completedQuests.size);

    const item = questListEl?.querySelector(`[data-quest="${questKey}"]`);
    if (item) {
      item.classList.add('done');
      const check = item.querySelector('.q-check');
      if (check) check.textContent = '✓';
    }

    if (completedQuests.size === 7) {
      setTimeout(() => {
        playGrandFanfare();
        launchFireworksShow();
        openSurpriseModal({
          badge: '🏆 Semua 7 Kejutan Terbuka!',
          emoji: '🎓',
          title: 'Queen of Graduation & 7 November 2026!',
          desc: 'Keren banget Mba Kei! Semua 7 kejutan interaktif udah kamu buka. Orang yang rajin, sabar, dan luar biasa kayak kamu pasti bakal terus bersinar di dunia dan mulia di akhirat!',
          code: 'KEI-WISUDA-ULTAH-2026-CHAMPION',
        });
      }, 600);
    }
  }

  /* ==========================================================================
     4. CUSTOM CANVAS CONFETTI & FIREWORKS ENGINE (WITH TOGA PARTICLES)
     ========================================================================== */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrameId = null;

  const shapeModes = ['toga', 'mix', 'hearts', 'stars', 'petals'];
  const shapeEmojis = { toga: '🎓', mix: '✨', hearts: '💖', stars: '⭐', petals: '🌸' };
  const shapeLabels = {
    toga: 'Mode: Toga Wisuda 🎓',
    mix: 'Mode: Mix ✨',
    hearts: 'Mode: Hati 💖',
    stars: 'Mode: Bintang ⭐',
    petals: 'Mode: Sakura 🌸'
  };
  let currentShapeModeIndex = 0;

  const palettes = [
    '#f43f5e', '#ec4899', '#f59e0b', '#fbbf24',
    '#a855f7', '#10b981', '#38bdf8', '#fb7185'
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function pickParticleShape() {
    const mode = shapeModes[currentShapeModeIndex];
    if (mode === 'toga') return 'toga';
    if (mode === 'hearts') return 'heart';
    if (mode === 'stars') return 'star';
    if (mode === 'petals') return 'petal';
    const all = ['rect', 'circle', 'heart', 'star', 'petal', 'toga'];
    return all[Math.floor(Math.random() * all.length)];
  }

  function createConfettiBurst(x, y, count = 55, spreadVelocity = 11) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.75 + 0.25) * spreadVelocity;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: Math.random() * 8 + 6,
        color: palettes[Math.floor(Math.random() * palettes.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        gravity: 0.22 + Math.random() * 0.1,
        drag: 0.985,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.007,
        shape: pickParticleShape(),
        wobble: Math.random() * 10,
        wobbleSpeed: 0.08 + Math.random() * 0.06,
      });
    }
    startParticleLoop();
  }

  function launchSideCannons() {
    const h = window.innerHeight;
    const w = window.innerWidth;
    for (let i = 0; i < 70; i++) {
      const fromLeft = i % 2 === 0;
      const angle = fromLeft
        ? -Math.PI / 3 + (Math.random() - 0.5) * 0.45
        : -Math.PI * (2 / 3) + (Math.random() - 0.5) * 0.45;
      const speed = 12 + Math.random() * 12;
      particles.push({
        x: fromLeft ? 20 : w - 20,
        y: h * 0.78,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 9 + 6,
        color: palettes[Math.floor(Math.random() * palettes.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        gravity: 0.24,
        drag: 0.988,
        opacity: 1,
        decay: 0.006 + Math.random() * 0.005,
        shape: pickParticleShape(),
        wobble: Math.random() * 10,
        wobbleSpeed: 0.09,
      });
    }
    playSparkleChord();
    completeQuest('confetti');
    startParticleLoop();
  }

  function launchFireworksShow() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bursts = 5;
    for (let b = 0; b < bursts; b++) {
      setTimeout(() => {
        const bx = w * (0.18 + Math.random() * 0.64);
        const by = h * (0.18 + Math.random() * 0.35);
        createConfettiBurst(bx, by, 65, 13);
        playTone(440 + b * 90, 0.35, 'sine', 0.12);
      }, b * 260);
    }
    completeQuest('confetti');
  }

  function drawHeart(ctx, size) {
    const s = size * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.4);
    ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.4);
    ctx.bezierCurveTo(-s, s * 0.9, 0, s * 1.3, 0, s * 1.6);
    ctx.bezierCurveTo(0, s * 1.3, s, s * 0.9, s, s * 0.4);
    ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  function drawStar(ctx, size) {
    const spikes = 5;
    const outer = size * 0.85;
    const inner = size * 0.4;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(0, -outer);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
      rot += step;
      ctx.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);
      rot += step;
    }
    ctx.lineTo(0, -outer);
    ctx.closePath();
    ctx.fill();
  }

  function drawToga(ctx, size) {
    const s = size * 0.7;
    // Diamond cap
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 1.4, -s * 0.2);
    ctx.lineTo(0, s * 0.6);
    ctx.lineTo(-s * 1.4, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    // Cap base
    ctx.beginPath();
    ctx.arc(0, s * 0.2, s * 0.6, 0, Math.PI);
    ctx.fill();
  }

  function renderParticles() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.wobble += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.wobble) * 0.65;
      p.y += p.vy;
      p.rotation += p.vRot;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > window.innerHeight + 60) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'petal') {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.7, p.size * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'heart') {
        drawHeart(ctx, p.size);
      } else if (p.shape === 'star') {
        drawStar(ctx, p.size);
      } else if (p.shape === 'toga') {
        drawToga(ctx, p.size);
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(renderParticles);
    } else {
      animFrameId = null;
    }
  }

  function startParticleLoop() {
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(renderParticles);
    }
  }

  /* ==========================================================================
     5. CLICK ANYWHERE FLOATING WORDS & SPARKLE BURST (NYANTAI & WARM)
     ========================================================================== */
  const clickSparklesLayer = document.getElementById('click-sparkles');
  const floatingPhrases = [
    'Happy Wisuda Mba Kei! 🎓',
    'HBD 7 Nov 2026 🎂',
    'Super Rajin & Sabar 💪',
    'Fa inna ma\'al-\'usri yusra 🤍',
    'Dunia & Akhirat Juara 🤲',
    'Bangga Banget Sama Kamu! ✨',
    'Officially Graduated! 🎓',
    'Level Up Day! 🥂',
    'Tetap Semangat Ya! 🌟'
  ];
  let phraseIdx = 0;

  function spawnFloatingWord(x, y, customText) {
    if (!clickSparklesLayer) return;
    const el = document.createElement('div');
    el.className = 'floating-click-word';
    el.textContent = customText || floatingPhrases[phraseIdx++ % floatingPhrases.length];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    clickSparklesLayer.appendChild(el);
    setTimeout(() => el.remove(), 1250);
  }

  document.addEventListener('pointerdown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    const isFormField = ['input', 'textarea', 'select'].includes(tag);
    if (isFormField) return;
    createConfettiBurst(e.clientX, e.clientY, 15, 6.8);
    if (!e.target.closest('button, a, dialog, [popover]')) {
      spawnFloatingWord(e.clientX, e.clientY);
      playTone(587.33 + Math.random() * 220, 0.16, 'sine', 0.05);
    }
  });

  /* ==========================================================================
     6. LIVE 7 NOVEMBER 2026 COUNTDOWN & CELEBRATION MODE
     ========================================================================== */
  const targetBirthdayStart = new Date('2026-11-07T00:00:00+07:00').getTime();
  const targetBirthdayEnd = new Date('2026-11-07T23:59:59+07:00').getTime();
  let forceCelebrateNow = false;

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');
  const capsuleModeTitle = document.getElementById('capsule-mode-title');
  const capsuleNote = document.getElementById('capsule-note');
  const statusLabel = document.getElementById('countdown-status-label');

  function updateCountdown() {
    const now = Date.now();
    if (forceCelebrateNow || (now >= targetBirthdayStart && now <= targetBirthdayEnd)) {
      if (cdDays) cdDays.textContent = '07';
      if (cdHours) cdHours.textContent = '11';
      if (cdMins) cdMins.textContent = '20';
      if (cdSecs) cdSecs.textContent = '26';
      if (capsuleModeTitle) capsuleModeTitle.textContent = '🎓🎉 HARI H WISUDA & ULTAH MBA KEI!';
      if (capsuleNote) capsuleNote.textContent = 'Selamat merayakan 7 November 2026! Hari bahagia resmi wisuda dan ultah milikmu sepenuhnya ✨';
      if (statusLabel) statusLabel.textContent = '🎓 Double Celebration • Wisuda & Ultah 7 November 2026 🎉';
      return;
    }

    const diff = Math.abs(targetBirthdayStart - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
    if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');

    if (now < targetBirthdayStart) {
      if (capsuleModeTitle) capsuleModeTitle.textContent = '⏳ Menuju Momen Emas 7 November 2026 (WIB)';
    } else {
      if (capsuleModeTitle) capsuleModeTitle.textContent = '✨ Kenangan Indah Sejak 7 November 2026';
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  document.getElementById('celebrate-now-btn')?.addEventListener('click', () => {
    forceCelebrateNow = !forceCelebrateNow;
    updateCountdown();
    launchSideCannons();
  });

  document.querySelectorAll('.time-box').forEach((box) => {
    box.addEventListener('click', (e) => {
      const rect = box.getBoundingClientRect();
      createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28, 9);
      spawnFloatingWord(e.clientX, e.clientY, 'Wisuda & Ultah 2026 🎓✨');
      playSparkleChord();
    });
  });

  /* ==========================================================================
     7. HERO INTERACTIONS, ENVELOPE & LETTER MODAL
     ========================================================================== */
  const letterDialog = document.getElementById('letter-dialog');
  const envelopeCard = document.getElementById('envelope-card');

  function openLetterModal() {
    if (!letterDialog) return;
    envelopeCard?.classList.add('is-open');
    letterDialog.showModal();
    launchSideCannons();
    completeQuest('envelope');
  }

  document.getElementById('open-letter-btn')?.addEventListener('click', openLetterModal);
  document.getElementById('dock-letter-btn')?.addEventListener('click', openLetterModal);
  envelopeCard?.addEventListener('click', openLetterModal);
  envelopeCard?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLetterModal();
    }
  });

  document.getElementById('letter-confetti-btn')?.addEventListener('click', () => {
    launchFireworksShow();
  });

  document.getElementById('mega-confetti-btn')?.addEventListener('click', () => {
    launchSideCannons();
  });

  const interactiveName = document.getElementById('interactive-name');
  interactiveName?.addEventListener('click', (e) => {
    createConfettiBurst(e.clientX, e.clientY, 45, 11);
    spawnFloatingWord(e.clientX, e.clientY, 'Mba Kei Keren Banget! 🎓👑');
    playGrandFanfare();
  });

  document.querySelectorAll('.floating-sticker').forEach((sticker) => {
    sticker.addEventListener('click', (e) => {
      const msg = sticker.getAttribute('data-sticker-msg') || 'Congrats Mba Kei! 🎓';
      createConfettiBurst(e.clientX, e.clientY, 30, 9);
      spawnFloatingWord(e.clientX, e.clientY, msg);
      playSparkleChord();
    });
  });

  // Al-Insyirah Card Blessing Action
  document.getElementById('insyirah-bless-btn')?.addEventListener('click', (e) => {
    launchFireworksShow();
    playGrandFanfare();
    spawnFloatingWord(e.clientX, e.clientY, 'Aamiin! Selalu Dimudahkan 🤲🤍');
    completeQuest('fortune');
  });

  /* ==========================================================================
     8. GALERI KEI (LIGHTBOX PREVIEW & LOCAL UPLOAD)
     ========================================================================== */
  const lightboxDialog = document.getElementById('gallery-lightbox-dialog');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxBadge = document.getElementById('lightbox-badge');

  function openLightbox(src, caption, badgeText = 'Momen Mba Kei 🎓') {
    if (!lightboxDialog || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxTitle) lightboxTitle.textContent = caption || 'Momen Spesial Mba Kei';
    if (lightboxBadge) lightboxBadge.textContent = badgeText;
    lightboxDialog.showModal();
    createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 35, 10);
    playSparkleChord();
  }

  function bindGalleryCard(card) {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-full-src') || card.querySelector('img')?.src;
      const caption = card.getAttribute('data-caption') || card.querySelector('h3')?.textContent;
      openLightbox(src, caption);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  }

  document.querySelectorAll('.gallery-card').forEach(bindGalleryCard);

  document.getElementById('lightbox-cheer-btn')?.addEventListener('click', () => {
    launchFireworksShow();
  });

  // Upload Local Photo Handler
  const galleryInput = document.getElementById('gallery-file-input');
  const galleryGrid = document.getElementById('gallery-grid');
  galleryInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl || !galleryGrid) return;
      const newCard = document.createElement('article');
      newCard.className = 'gallery-card';
      newCard.setAttribute('data-full-src', dataUrl);
      newCard.setAttribute('data-caption', 'Momen Spesial Mba Kei — Wisuda & Ultah 7 November 2026 yang tak terlupakan! 💖🎓');
      newCard.tabIndex = 0;
      newCard.setAttribute('role', 'button');
      newCard.setAttribute('aria-label', 'Foto Mba Kei yang diupload, klik untuk perbesar');

      newCard.innerHTML = `
        <div class="gallery-frame">
          <img src="${dataUrl}" alt="Foto Mba Kei" loading="lazy">
          <span class="gallery-tag">✨ Foto Baru</span>
        </div>
        <div class="gallery-desc">
          <h3>Momen Berharga Mba Kei</h3>
          <p>Potret indah kenangan wisuda & ulang tahun 7 November 2026.</p>
          <span class="gallery-hint">Klik buat perbesar 🔍</span>
        </div>
      `;

      bindGalleryCard(newCard);
      galleryGrid.prepend(newCard);
      launchSideCannons();
    };
    reader.readAsDataURL(file);
  });

  /* ==========================================================================
     9. INTERACTIVE BIRTHDAY CAKE, CANDLES & MICROPHONE BLOW
     ========================================================================== */
  const candles = document.querySelectorAll('.candle-unit');
  const blownCountEl = document.getElementById('candles-blown-count');
  const cakeStatusPill = document.getElementById('cake-status-pill');
  const candleWishBanner = document.getElementById('candle-wish-banner');
  const sliceCakeBtn = document.getElementById('slice-cake-btn');
  const cakeBody = document.getElementById('cake-body');

  function updateCandleState() {
    const blown = document.querySelectorAll('.candle-unit.blown').length;
    if (blownCountEl) blownCountEl.textContent = String(blown);

    if (blown === candles.length) {
      if (cakeStatusPill) cakeStatusPill.textContent = '🎉 Semua Lilin Ditiup! Make a Wish!';
      if (sliceCakeBtn) sliceCakeBtn.disabled = false;
      completeQuest('cake');
      launchFireworksShow();
      playGrandFanfare();
      if (candleWishBanner) {
        candleWishBanner.textContent = '🌟 Semua 5 doa wisuda & ultah buat Mba Kei udah diterbangkan ke langit! Yuk potong kuenya 🍰';
      }
    } else {
      if (cakeStatusPill) cakeStatusPill.textContent = `🔥 ${candles.length - blown} Lilin Masih Menyala`;
      if (sliceCakeBtn) sliceCakeBtn.disabled = true;
    }
  }

  function blowSingleCandle(candle) {
    if (candle.classList.contains('blown')) return;
    candle.classList.add('blown');
    const wishText = candle.getAttribute('data-wish');
    if (candleWishBanner && wishText) {
      candleWishBanner.textContent = `🕯️ Doa Terkabul: “${wishText}”`;
    }
    const rect = candle.getBoundingClientRect();
    createConfettiBurst(rect.left + rect.width / 2, rect.top + 10, 22, 7.5);
    playPopSound();
    updateCandleState();
  }

  candles.forEach((candle) => {
    candle.addEventListener('click', () => blowSingleCandle(candle));
  });

  document.getElementById('blow-all-btn')?.addEventListener('click', () => {
    candles.forEach((candle, idx) => {
      setTimeout(() => blowSingleCandle(candle), idx * 130);
    });
  });

  document.getElementById('relight-btn')?.addEventListener('click', () => {
    candles.forEach((c) => c.classList.remove('blown'));
    cakeBody?.classList.remove('is-sliced');
    if (candleWishBanner) {
      candleWishBanner.textContent = '✨ Lilin menyala lagi! Klik apinya buat tiup dan baca doanya.';
    }
    updateCandleState();
    playSparkleChord();
  });

  sliceCakeBtn?.addEventListener('click', () => {
    cakeBody?.classList.add('is-sliced');
    launchSideCannons();
    openSurpriseModal({
      badge: '🍰 Potongan Kue Wisuda & Ultah',
      emoji: '🍰',
      title: 'Kue Spesial Mba Kei!',
      desc: 'Potongan kue pertama dengan taburan stroberi manis disajikan khusus buat Mba Kei yang rajin dan sabar. Semoga hari-harimu ke depan selalu semanis ini!',
      code: 'SWEET-KEI-SLICE-2026',
    });
  });

  cakeBody?.addEventListener('click', (e) => {
    createConfettiBurst(e.clientX, e.clientY, 26, 8);
    spawnFloatingWord(e.clientX, e.clientY, 'Yummy! Kue Mba Kei 🍓🎓');
    playSparkleChord();
  });

  // Microphone Blow Detection
  let micStream = null;
  let micRaf = null;
  const micBlowBtn = document.getElementById('mic-blow-btn');
  const micBlowLabel = document.getElementById('mic-blow-label');

  async function toggleMicBlow() {
    if (micStream) {
      stopMicBlow();
      return;
    }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(micStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      if (micBlowLabel) micBlowLabel.textContent = 'Tiup Sekarang ke Mic... (Klik Stop)';

      const checkBlow = () => {
        if (!micStream) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < 30; i++) sum += data[i];
        const avgLowFreq = sum / 30;

        if (avgLowFreq > 95) {
          const litCandle = document.querySelector('.candle-unit:not(.blown)');
          if (litCandle) blowSingleCandle(litCandle);
        }

        if (document.querySelectorAll('.candle-unit:not(.blown)').length === 0) {
          stopMicBlow();
          return;
        }
        micRaf = requestAnimationFrame(checkBlow);
      };
      checkBlow();
    } catch {
      if (candleWishBanner) {
        candleWishBanner.textContent = '💡 Akses mikrofon tidak diizinkan/tersedia — klik langsung apinya atau tombol "Tiup Semua Lilin" ya!';
      }
    }
  }

  function stopMicBlow() {
    if (micRaf) cancelAnimationFrame(micRaf);
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
    if (micBlowLabel) micBlowLabel.textContent = 'Tiup Pakai Mikrofon';
  }

  micBlowBtn?.addEventListener('click', toggleMicBlow);

  /* ==========================================================================
     10. INTERACTIVE BALLOON POP SKY GARDEN
     ========================================================================== */
  const balloonSky = document.getElementById('balloon-sky');
  const poppedCountEl = document.getElementById('popped-count');
  const poppedMsgText = document.getElementById('popped-message-text');
  let poppedTotal = 0;

  const balloonCompliments = [
    '🎈 “Mba Kei itu orang yang super rajin dan sabar, respek banget sama kegigihannya!”',
    '🎈 “Selamat wisuda Mba Kei! Gelar baru, peluang baru, dan masa depan yang cerah menantimu! 🎓”',
    '🎈 “Fa inna ma\'al-\'usri yusra. Setelah sempit pasti ada kemudahan berlipat ganda 🤍”',
    '🎈 “Semoga di usia baru ini, sukses dunia dan kemuliaan akhirat selalu Mba Kei raih! 🤲”',
    '🎈 “Jarang banget ada orang sesabar dan setulus Mba Kei. Bangga banget sama kamu!”',
    '🎈 “Di kondisi apa pun nanti, tetap semangat ya! Jangan pernah lupa betapa luar biasanya kamu 💪”',
    '🎈 “7 November 2026: Dobel perayaan yang dirayakan se-unik mungkin khusus buat Mba Kei! 🎂”',
    '🎈 “Doa tulus: sehat selalu, hati selalu tenang, rezeki melimpah, dan langkah selalu berkah 🌸”'
  ];

  const balloonGradients = [
    'linear-gradient(135deg, #fb7185, #e11d74)',
    'linear-gradient(135deg, #fbbf24, #d97706)',
    'linear-gradient(135deg, #c084fc, #7e22ce)',
    'linear-gradient(135deg, #34d399, #059669)',
    'linear-gradient(135deg, #38bdf8, #0284c7)',
    'linear-gradient(135deg, #f472b6, #db2777)'
  ];

  const balloonIcons = ['🎓', '💖', '👑', '🌸', '⭐', '🎂', '💪', '🥂'];

  function spawnBalloons(count = 8) {
    if (!balloonSky) return;
    balloonSky.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'balloon-item';
      btn.style.background = balloonGradients[i % balloonGradients.length];
      btn.style.animationDelay = `${(i * 0.35).toFixed(2)}s`;
      btn.setAttribute('aria-label', `Balon harapan nomor ${i + 1}, klik untuk pecahkan`);
      btn.textContent = balloonIcons[i % balloonIcons.length];

      const message = balloonCompliments[i % balloonCompliments.length];
      btn.addEventListener('click', () => {
        if (btn.classList.contains('popping')) return;
        btn.classList.add('popping');
        const rect = btn.getBoundingClientRect();
        createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 32, 9.5);
        playPopSound();

        poppedTotal++;
        if (poppedCountEl) poppedCountEl.textContent = String(poppedTotal);
        if (poppedMsgText) poppedMsgText.textContent = message;

        if (poppedTotal >= 3) {
          completeQuest('balloon');
        }

        setTimeout(() => {
          btn.remove();
          if (balloonSky.children.length === 0) {
            setTimeout(() => spawnBalloons(8), 700);
          }
        }, 220);
      });

      balloonSky.appendChild(btn);
    }
  }

  spawnBalloons(8);

  document.getElementById('spawn-balloons-btn')?.addEventListener('click', () => {
    spawnBalloons(8);
    playSparkleChord();
  });

  document.getElementById('pop-all-balloons-btn')?.addEventListener('click', () => {
    const allBalloons = balloonSky?.querySelectorAll('.balloon-item:not(.popping)');
    allBalloons?.forEach((b, i) => {
      setTimeout(() => b.click(), i * 110);
    });
  });

  /* ==========================================================================
     11. MYSTERY GIFT BOXES & WISH JAR / FORTUNE COOKIE
     ========================================================================== */
  const surpriseDialog = document.getElementById('surprise-dialog');
  const surpriseBadge = document.getElementById('surprise-modal-badge');
  const surpriseEmoji = document.getElementById('surprise-modal-emoji');
  const surpriseTitle = document.getElementById('surprise-dialog-title');
  const surpriseDesc = document.getElementById('surprise-modal-desc');
  const surpriseCode = document.getElementById('surprise-voucher-code');

  const giftsData = [
    {
      badge: 'Kado Wisuda #1',
      emoji: '🎓',
      title: 'Toga Emas Kebanggaan',
      desc: 'Selamat wisuda Mba Kei! Resmi menyandang gelar baru dengan kerja keras dan kesabaran tinggi. Pintu-pintu karier dan karya terbaik kini terbuka lebar buatmu!',
      code: 'GRADUATION-HERO-KEI',
    },
    {
      badge: 'Kado Karakter #2',
      emoji: '👑',
      title: 'Mahkota Ratu Rajin & Sabar',
      desc: 'Penghargaan tertinggi buat Mba Kei yang selalu tekun, sabar menghadapi proses, dan gak pernah gampang ngeluh. Kamu beneran orang yang sangat luar biasa!',
      code: 'PATIENT-QUEEN-KEI',
    },
    {
      badge: 'Kado Berkah #3',
      emoji: '🎟️',
      title: 'Voucher Rezeki Melimpah & Halal',
      desc: 'Voucher doa abadi: semoga pintu rezeki Mba Kei mengalir deras dari arah yang tak disangka-sangka, berkah buat keluarga, dan bermanfaat buat sesama!',
      code: 'UNLIMITED-BARAKAH-2026',
    },
    {
      badge: 'Kado Selebrasi #4',
      emoji: '💐',
      title: 'Buket Bunga Abadi Kelulusan',
      desc: 'Buket bunga virtual yang gak akan pernah layu—sebagai simbol doa tulus dan rasa bangga dari semua orang yang sayang sama Mba Kei.',
      code: 'ETERNAL-BLOOM-GRAD',
    },
    {
      badge: 'Kado Semangat #5',
      emoji: '✈️',
      title: 'Paspor Petualangan Dunia & Akhirat',
      desc: 'Semoga semua mimpi jalan-jalan, liburan, dan cita-cita besar Mba Kei segera terwujud, sambil terus menjaga bekal terbaik menuju surga-Nya!',
      code: 'DUNIA-AKHIRAT-JUARA',
    },
    {
      badge: 'Kado Apresiasi #6',
      emoji: '🏆',
      title: 'Piala Sosok Paling Luar Biasa',
      desc: 'Selamat ulang tahun 7 November 2026! Terima kasih sudah bertahan, bertumbuh, dan selalu jadi pribadi yang hangat. We are so proud of you!',
      code: 'BEST-SOUL-AWARD-2026',
    },
  ];

  function openSurpriseModal(data) {
    if (!surpriseDialog) return;
    if (surpriseBadge) surpriseBadge.textContent = data.badge;
    if (surpriseEmoji) surpriseEmoji.textContent = data.emoji;
    if (surpriseTitle) surpriseTitle.textContent = data.title;
    if (surpriseDesc) surpriseDesc.textContent = data.desc;
    if (surpriseCode) surpriseCode.textContent = data.code;
    surpriseDialog.showModal();
  }

  document.querySelectorAll('.gift-card').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = Number(card.getAttribute('data-gift-index') || 0);
      card.classList.add('opened');
      const tag = card.querySelector('.gift-tag');
      if (tag) tag.textContent = 'Sudah dibuka ✓ (Klik lagi)';
      launchSideCannons();
      completeQuest('gift');
      openSurpriseModal(giftsData[idx] || giftsData[0]);
    });
  });

  document.getElementById('surprise-more-confetti-btn')?.addEventListener('click', () => {
    launchFireworksShow();
  });

  // Wish Jar & Fortune Cookie (Reflective & Encouraging)
  const fortunes = [
    '🤍 “Fa inna ma\'al-\'usri yusra. Ingat Mba Kei, kesulitan itu cuma sementara, jalan kemudahannya udah disiapin Allah di saat yang sama!”',
    '💪 “Mba Kei itu orang yang super rajin dan sabar banget. Di kondisi apa pun, tetap semangat ya! Usahamu gak akan sia-sia!”',
    '🎓 “Selamat wisuda Mba Kei! Gelar baru ini bukti nyata ketekunanmu. Sukses berkarier dan terus melangkah maju!”',
    '🤲 “Kejarlah impian duniamu setinggi bintang, dan jangan pernah lupa perbanyak bekal buat akhiratmu.”',
    '🌸 “Doa-doa yang Mba Kei bisikkan dalam sujud sedang dirangkai semesta jadi takdir yang paling indah.”',
    '🎂 “7 November 2026: Dobel momen wisuda dan ultah yang dirayakan se-unik mungkin. You deserve all this joy!”'
  ];
  let fortuneIndex = 0;
  const fortuneOutput = document.getElementById('fortune-output');

  function drawFortune(prefixEmoji = '🌟') {
    const text = fortunes[fortuneIndex++ % fortunes.length];
    if (fortuneOutput) {
      fortuneOutput.innerHTML = `<span class="fortune-quote">${prefixEmoji} ${text}</span>`;
    }
    const jarBtn = document.getElementById('wish-jar-btn');
    if (jarBtn) {
      const r = jarBtn.getBoundingClientRect();
      createConfettiBurst(r.left + r.width / 2, r.top + r.height / 2, 35, 10);
    }
    playSparkleChord();
    completeQuest('fortune');
  }

  document.getElementById('wish-jar-btn')?.addEventListener('click', () => drawFortune('🫙'));
  document.getElementById('draw-fortune-btn')?.addEventListener('click', () => drawFortune('📜'));
  document.getElementById('cookie-crack-btn')?.addEventListener('click', () => drawFortune('🥠'));

  /* ==========================================================================
     12. INTERACTIVE KALIMBA & AUTO-PLAY CELEBRATION MELODY
     ========================================================================== */
  const noteDisplay = document.getElementById('note-display');
  const kalimbaButtons = document.querySelectorAll('.k-key');

  kalimbaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const freq = parseFloat(btn.getAttribute('data-freq') || '440');
      const label = btn.getAttribute('data-label') || 'Do';
      const note = btn.getAttribute('data-note') || 'C4';

      playTone(freq, 0.55, 'triangle', 0.16);
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 180);

      if (noteDisplay) {
        noteDisplay.textContent = `🎶 Nada ${label} (${note}) — Merdu banget, Mba Kei!`;
      }

      const rect = btn.getBoundingClientRect();
      createConfettiBurst(rect.left + rect.width / 2, rect.top + 20, 14, 6);
      completeQuest('music');
    });
  });

  // Keyboard shortcuts 1-8 for Kalimba
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(activeTag)) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 8) {
      kalimbaButtons[num - 1]?.click();
    }
  });

  // Celebration Song Sequencer (Happy Birthday + Wisuda Anthem)
  let isPlayingSong = false;
  let songTimeouts = [];
  const autoplayBtn = document.getElementById('autoplay-song-btn');
  const autoplayLabel = document.getElementById('autoplay-song-label');
  const bgmToggleBtn = document.getElementById('bgm-toggle-btn');
  const bgmIcon = document.getElementById('bgm-icon');

  const celebrationMelody = [
    { note: 'C4', f: 261.63, d: 300, lyric: 'Hap-' },
    { note: 'C4', f: 261.63, d: 250, lyric: 'py' },
    { note: 'D4', f: 293.66, d: 500, lyric: 'Birth-' },
    { note: 'C4', f: 261.63, d: 500, lyric: 'day' },
    { note: 'F4', f: 349.23, d: 500, lyric: '&amp;' },
    { note: 'E4', f: 329.63, d: 900, lyric: 'Wisuda! 🎓' },

    { note: 'C4', f: 261.63, d: 300, lyric: 'Hap-' },
    { note: 'C4', f: 261.63, d: 250, lyric: 'py' },
    { note: 'D4', f: 293.66, d: 500, lyric: 'Mile-' },
    { note: 'C4', f: 261.63, d: 500, lyric: 'stone' },
    { note: 'G4', f: 392.00, d: 500, lyric: 'Mba' },
    { note: 'F4', f: 349.23, d: 900, lyric: 'Kei! 🎂' },

    { note: 'C4', f: 261.63, d: 300, lyric: 'Hap-' },
    { note: 'C4', f: 261.63, d: 250, lyric: 'py' },
    { note: 'C5', f: 523.25, d: 500, lyric: 'Gra-' },
    { note: 'A4', f: 440.00, d: 500, lyric: 'dua-' },
    { note: 'F4', f: 349.23, d: 500, lyric: 'tion' },
    { note: 'E4', f: 329.63, d: 500, lyric: 'Dear' },
    { note: 'D4', f: 293.66, d: 850, lyric: 'Kei... 💖' },

    { note: 'B4', f: 466.16, d: 300, lyric: 'Hap-' },
    { note: 'B4', f: 466.16, d: 250, lyric: 'py' },
    { note: 'A4', f: 440.00, d: 500, lyric: '7 Nov' },
    { note: 'F4', f: 349.23, d: 500, lyric: '2026' },
    { note: 'G4', f: 392.00, d: 500, lyric: 'To' },
    { note: 'F4', f: 349.23, d: 1000, lyric: 'You! 🎉' },
  ];

  function stopBirthdaySong() {
    songTimeouts.forEach((t) => clearTimeout(t));
    songTimeouts = [];
    isPlayingSong = false;
    if (autoplayLabel) autoplayLabel.textContent = 'Mainkan Lagu "Happy Milestone Mba Kei"';
    if (bgmToggleBtn) bgmToggleBtn.setAttribute('aria-pressed', 'false');
    if (bgmIcon) bgmIcon.textContent = '🔇';
  }

  function playBirthdaySong() {
    if (isPlayingSong) {
      stopBirthdaySong();
      return;
    }
    isPlayingSong = true;
    completeQuest('music');
    if (autoplayLabel) autoplayLabel.textContent = '⏹️ Hentikan Musik';
    if (bgmToggleBtn) bgmToggleBtn.setAttribute('aria-pressed', 'true');
    if (bgmIcon) bgmIcon.textContent = '🔊';

    let elapsed = 0;
    celebrationMelody.forEach((step) => {
      const tid = setTimeout(() => {
        if (!isPlayingSong) return;
        playTone(step.f, (step.d / 1000) * 0.95, 'triangle', 0.16);
        if (noteDisplay) {
          noteDisplay.innerHTML = `🎵 Menyanyikan: “${step.lyric}” (${step.note})`;
        }
        const matchingKey = document.querySelector(`.k-key[data-note="${step.note}"]`);
        if (matchingKey) {
          matchingKey.classList.add('active');
          setTimeout(() => matchingKey.classList.remove('active'), 220);
        }
      }, elapsed);
      songTimeouts.push(tid);
      elapsed += step.d + 45;
    });

    const endTid = setTimeout(() => {
      stopBirthdaySong();
      launchSideCannons();
      if (noteDisplay) {
        noteDisplay.textContent = '🎉 Selamat Wisuda & Ultah, Mba Kei! (Klik buat muter lagi)';
      }
    }, elapsed + 100);
    songTimeouts.push(endTid);
  }

  autoplayBtn?.addEventListener('click', playBirthdaySong);
  bgmToggleBtn?.addEventListener('click', playBirthdaySong);

  /* ==========================================================================
     13. POLAROID 3D FLIP & PERSISTENT WALL OF WISHES
     ========================================================================== */
  document.querySelectorAll('.polaroid-card').forEach((card) => {
    const toggleFlip = () => {
      card.classList.toggle('is-flipped');
      const rect = card.getBoundingClientRect();
      createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, 7);
      playSparkleChord();
    };
    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });

  const STORAGE_KEY = 'mba_kei_milestone_wishes_2026';
  const defaultWishes = [
    {
      sender: 'Sahabat Seperjuangan',
      badge: '🎓',
      message: 'Congrats wisudanya Mba Kei dan happy birthday 7 Nov 2026! Lu beneran orang yang paling sabar dan rajin yang pernah gua kenal. Terus gaspol kejar dunia dan akhirat ya!',
      date: '7 Nov 2026',
    },
    {
      sender: 'Keluarga & Support System',
      badge: '🤲',
      message: 'Bangga banget sama Mba Kei! Semoga ilmu yang didapat berkah, karier lancar, dan tetap rendah hati serta istiqomah di jalan Allah. Fa inna ma\'al-\'usri yusra!',
      date: '7 Nov 2026',
    },
  ];

  const wishesWall = document.getElementById('user-wishes-wall');
  const wishForm = document.getElementById('wish-form');

  function loadWishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultWishes;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultWishes;
    } catch {
      return defaultWishes;
    }
  }

  function renderWishes() {
    if (!wishesWall) return;
    const list = loadWishes();
    wishesWall.innerHTML = '';

    list.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'wish-note-card';

      const header = document.createElement('div');
      header.className = 'wish-note-header';

      const author = document.createElement('div');
      author.className = 'wish-note-author';
      author.textContent = `${item.badge || '💖'} ${item.sender}`;

      const dateSpan = document.createElement('span');
      dateSpan.className = 'wish-note-date';
      dateSpan.textContent = item.date || '7 Nov 2026';

      header.append(author, dateSpan);

      const body = document.createElement('p');
      body.textContent = item.message;

      card.append(header, body);
      wishesWall.appendChild(card);
    });
  }

  renderWishes();

  wishForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const senderInput = document.getElementById('sender-name');
    const badgeInput = document.getElementById('wish-badge');
    const msgInput = document.getElementById('wish-message');

    const sender = senderInput?.value.trim() || 'Sahabat Mba Kei';
    const badge = badgeInput?.value || '🎓';
    const message = msgInput?.value.trim();
    if (!message) return;

    const current = loadWishes();
    current.unshift({
      sender,
      badge,
      message,
      date: '7 Nov 2026 • Baru saja',
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, 15)));
    } catch {
      // Ignore quota
    }

    renderWishes();
    if (msgInput) msgInput.value = '';
    launchSideCannons();
  });

  /* ==========================================================================
     14. DOCK CONTROLS & THEME SWITCHER
     ========================================================================== */
  document.getElementById('dock-cannon-btn')?.addEventListener('click', () => {
    launchSideCannons();
  });

  document.getElementById('dock-fireworks-btn')?.addEventListener('click', () => {
    launchFireworksShow();
  });

  const dockShapeBtn = document.getElementById('dock-shape-btn');
  const dockShapeEmoji = document.getElementById('dock-shape-emoji');
  const dockShapeLabel = document.getElementById('dock-shape-label');

  dockShapeBtn?.addEventListener('click', (e) => {
    currentShapeModeIndex = (currentShapeModeIndex + 1) % shapeModes.length;
    const mode = shapeModes[currentShapeModeIndex];
    if (dockShapeEmoji) dockShapeEmoji.textContent = shapeEmojis[mode];
    if (dockShapeLabel) dockShapeLabel.textContent = shapeLabels[mode];
    createConfettiBurst(e.clientX, e.clientY - 20, 40, 10);
    playSparkleChord();
  });

  const themes = ['rose', 'matcha', 'starlight'];
  const themeIcons = { rose: '🌸', matcha: '🍵', starlight: '🌙' };
  let themeIdx = 0;

  document.getElementById('theme-toggle-btn')?.addEventListener('click', (e) => {
    themeIdx = (themeIdx + 1) % themes.length;
    const nextTheme = themes[themeIdx];
    document.documentElement.setAttribute('data-theme', nextTheme);
    const iconEl = document.getElementById('theme-icon');
    if (iconEl) iconEl.textContent = themeIcons[nextTheme];
    createConfettiBurst(e.clientX, e.clientY, 30, 8);
    playSparkleChord();
  });

  // Initial welcome confetti burst on page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      createConfettiBurst(window.innerWidth * 0.3, window.innerHeight * 0.35, 45, 10);
      createConfettiBurst(window.innerWidth * 0.7, window.innerHeight * 0.35, 45, 10);
    }, 350);
  });
})();
