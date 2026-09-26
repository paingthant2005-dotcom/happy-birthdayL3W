/* =============================================================
   Happy 21st Birthday 💜  —  script.js  (vanilla JavaScript)
   -------------------------------------------------------------
   • No autoplay: the birthday song starts only when the cake is tapped
   • Works when ./assets/birthday-song.mp3 is missing (nothing breaks)
   • Relative paths only  ➜  GitHub Pages / any sub-directory friendly
   • Respects prefers-reduced-motion
   ============================================================= */
(function () {
  'use strict';

  /* ---------------- tiny helpers ---------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var rand = function (min, max) { return Math.random() * (max - min) + min; };
  var randInt = function (min, max) { return Math.floor(rand(min, max + 1)); };
  var pick = function (list) { return list[randInt(0, list.length - 1)]; };
  var wait = function (ms) { return new Promise(function (res) { setTimeout(res, ms); }); };
  var nextFrame = function () {
    return new Promise(function (res) {
      requestAnimationFrame(function () { requestAnimationFrame(res); });
    });
  };

  /* JS is alive: let CSS know (paragraph text stays readable without JS) */
  document.documentElement.classList.remove('no-js');

  /* ---------------- preferences ---------------- */
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var prefersReduced = function () { return !!(motionQuery && motionQuery.matches); };

  /* ---------------- elements ---------------- */
  var landing = $('#landing');
  var openBtn = $('#openBtn');
  var transition = $('#transition');
  var experience = $('#experience');
  var cake = $('#cake');
  var cakeStage = $('.cake-stage');
  var candleBox = $('#candles');
  var cakeSparkles = $('#cakeSparkles');
  var micBtn = $('#micBtn');
  var micNote = $('#micNote');
  var statusEl = $('#status');
  var messageCard = $('#messageCard');
  var message = $('#message');
  var skipBtn = $('#skipBtn');
  var finalBlock = $('#final');
  var replayBtn = $('#replayBtn');
  var music = $('#music');
  var musicBtn = $('#musicBtn');
  var song = $('#song');
  var fx = $('#fx');
  var bgStars = $('#bgStars');
  var bgClouds = $('#bgClouds');
  var bgParticles = $('#bgParticles');

  /* ---------------- constants ---------------- */
  var CANDLE_COUNT = 21;
  var DEFAULT_VOLUME = 0.85;
  var CONFETTI_COLOURS = ['#c6a8ff', '#ffb3d4', '#b9dcff', '#aeeadb', '#ffe6a7', '#ffffff', '#d9c2ff', '#ff9ac4'];
  var FIREWORK_COLOURS = ['#c6a8ff', '#ffd9ec', '#b9dcff', '#fff1b8', '#e0d0ff', '#ff9ac4'];
  var HEART_GLYPHS = ['💜', '💕', '💖', '💗', '✨', '⭐'];

  /* ---------------- state ---------------- */
  var state = {
    opened: false,
    blowing: false,
    blown: false,
    typed: false,
    skipTyping: false
  };

  var originalMessage = [];   /* the exact message lines, remembered for replay */
  var timers = [];            /* scheduled timeouts (all cleared on replay) */
  var intervals = [];         /* celebration intervals (cleared on replay) */
  var heartSpawns = 0;

  function later(fn, ms) {
    var id = setTimeout(function () {
      var at = timers.indexOf(id);
      if (at > -1) { timers.splice(at, 1); }
      fn();
    }, ms);
    timers.push(id);
    return id;
  }

  function every(fn, ms) {
    var id = setInterval(fn, ms);
    intervals.push(id);
    return id;
  }

  function clearScheduled() {
    timers.forEach(clearTimeout);
    timers.length = 0;
    intervals.forEach(clearInterval);
    intervals.length = 0;
  }

  /* =============================================================
     BACKGROUND : stars, drifting clouds, floating particles
     ============================================================= */
  function buildBackground() {
    var reduced = prefersReduced();
    var w = Math.max(window.innerWidth || 360, 320);

    /* twinkling stars */
    var starCount = reduced ? 16 : Math.min(56, Math.round(w / 11));
    var starsHTML = '';
    for (var i = 0; i < starCount; i++) {
      var s = rand(1.4, 3.2).toFixed(1);
      starsHTML += '<span class="star" style="left:' + rand(0.5, 99).toFixed(2) + '%;top:' +
        rand(1, 99).toFixed(2) + '%;width:' + s + 'px;height:' + s + 'px;--dur:' +
        rand(2.4, 5.4).toFixed(2) + 's;--delay:' + rand(0, 5).toFixed(2) + 's"></span>';
    }
    bgStars.innerHTML = starsHTML;

    /* soft drifting clouds */
    var cloudCount = reduced ? 0 : (w < 620 ? 3 : 5);
    var cloudsHTML = '';
    for (var c = 0; c < cloudCount; c++) {
      cloudsHTML += '<span class="cloud" style="--w:' + randInt(130, 300) + 'px;top:' +
        rand(2, 76).toFixed(1) + 'vh;--dur:' + randInt(80, 160) + 's;--delay:-' +
        randInt(0, 120) + 's"></span>';
    }
    bgClouds.innerHTML = cloudsHTML;

    /* magical rising particles */
    var pCount = reduced ? 0 : Math.min(20, Math.round(w / 28));
    var pHTML = '';
    for (var p = 0; p < pCount; p++) {
      pHTML += '<span class="particle" style="left:' + rand(1, 98).toFixed(2) + '%;--s:' +
        randInt(4, 10) + 'px;--dur:' + randInt(20, 38) + 's;--delay:-' + randInt(0, 30) +
        's;--dx:' + randInt(-60, 60) + 'px"></span>';
    }
    bgParticles.innerHTML = pHTML;
  }

  /* =============================================================
     CAKE : all 21 candles (7 + 7 + 7)
     ============================================================= */
  function buildCandles() {
    candleBox.innerHTML = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < CANDLE_COUNT; i++) {
      var candleEl = document.createElement('span');
      candleEl.className = 'candle candle--' + (i % 4);
      /* --delay : staggered shrinking / going out (a soft wave over the cake) */
      candleEl.style.setProperty('--delay', (i * 65) + 'ms');
      /* --d     : de-synchronised idle flicker for every single flame */
      candleEl.style.setProperty('--d', '-' + randInt(0, 1600) + 'ms');

      var flame = document.createElement('span');
      flame.className = 'flame';

      var smoke = document.createElement('span');
      smoke.className = 'smoke';

      candleEl.appendChild(flame);
      candleEl.appendChild(smoke);
      frag.appendChild(candleEl);
    }
    candleBox.appendChild(frag);
  }

  var candles = [];
  function refreshCandleList() { candles = $$('.candle', candleBox); }

  /* sparkles twinkling around the cake */
  function buildCakeSparkles(intense) {
    cakeSparkles.innerHTML = '';
    if (prefersReduced()) { return; }
    var count = intense ? 24 : 11;
    var html = '';
    for (var i = 0; i < count; i++) {
      html += '<span class="fx-spark" style="--x:' + rand(2, 96).toFixed(1) + '%;--y:' +
        rand(1, 95).toFixed(1) + '%;--s:' + randInt(intense ? 7 : 5, intense ? 14 : 10) +
        'px;--dur:' + rand(1.6, 3.4).toFixed(2) + 's;--delay:' + rand(0, 2.6).toFixed(2) + 's"></span>';
    }
    cakeSparkles.innerHTML = html;
  }

  /* =============================================================
     AUDIO : ./assets/birthday-song.mp3
     Never autoplayed. Started from the cake tap (a real user gesture,
     which is what mobile browsers require).
     ============================================================= */
  var songAvailable = true;
  var songStarted = false;
  var volumeTimer = null;
  var chimeDone = false;

  function hideMusicControl() { music.hidden = true; }

  function setMusicState(playing) {
    musicBtn.textContent = playing ? '⏸' : '▶';
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', playing ? 'Pause the birthday song' : 'Play the birthday song');
  }

  function showMusicControl() {
    if (!songAvailable) { return; }
    music.hidden = false;
    setMusicState(true);
  }

  /* gentle volume fade-in so the song "starts smoothly" */
  function fadeInVolume() {
    clearInterval(volumeTimer);
    var steps = 26;
    var step = 0;
    song.volume = 0;
    volumeTimer = setInterval(function () {
      step += 1;
      var v = (DEFAULT_VOLUME * step) / steps;
      try { song.volume = Math.min(DEFAULT_VOLUME, v); } catch (e) { /* ignore */ }
      if (step >= steps) { clearInterval(volumeTimer); }
    }, 60);
  }

  function startSong() {
    if (songStarted) { return; }
    songStarted = true;

    if (!songAvailable) { playFallbackChime(); return; }

    try { song.currentTime = 0; } catch (e) { /* some browsers complain before metadata */ }
    song.volume = 0;
    var attempt;
    try {
      attempt = song.play();
    } catch (e) {
      songAvailable = false;
      hideMusicControl();
      playFallbackChime();
      return;
    }

    if (attempt && typeof attempt.then === 'function') {
      attempt.then(function () {
        fadeInVolume();
        showMusicControl();
      }).catch(function () {
        /* blocked / unsupported / file missing → keep the magic going */
        songAvailable = false;
        hideMusicControl();
        playFallbackChime();
      });
    } else {
      fadeInVolume();
      showMusicControl();
    }
  }

  /* Graceful fallback if the mp3 is missing: a soft magical arpeggio,
     synthesised in the browser (no files, no libraries). */
  function playFallbackChime() {
    if (chimeDone) { return; }
    chimeDone = true;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { return; }
    try {
      var ctx = new Ctx();
      var notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 1046.50];
      var now = ctx.currentTime;
      notes.forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var t = now + i * 0.33;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.7);
      });
      setTimeout(function () { try { ctx.close(); } catch (e) { /* ignore */ } }, 6500);
    } catch (e) { /* never break the page for sound */ }
  }

  if (song) {
    song.addEventListener('error', function () {
      songAvailable = false;
      clearInterval(volumeTimer);
      hideMusicControl();
      if (state.blowing) { playFallbackChime(); }
    });
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', function () {
      if (!songAvailable) { return; }
      if (song.paused) {
        var p = song.play();
        if (p && typeof p.then === 'function') { p.catch(function () { }); }
        setMusicState(true);
      } else {
        song.pause();
        setMusicState(false);
      }
    });
  }

  /* =============================================================
     CELEBRATION : confetti, hearts, sparkles, fireworks
     Every particle removes itself once its animation ends, so the
     DOM stays light and the page stays smooth on a phone.
     ============================================================= */
  function spawnFx(el) {
    el.addEventListener('animationend', function () { el.remove(); });
    fx.appendChild(el);
    return el;
  }

  function burstConfetti(count) {
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.setProperty('--x', rand(0, 100).toFixed(2) + '%');
      piece.style.setProperty('--w', randInt(6, 12) + 'px');
      piece.style.setProperty('--h', randInt(9, 16) + 'px');
      piece.style.setProperty('--br', Math.random() < 0.32 ? '50%' : '2px');
      piece.style.setProperty('--c', pick(CONFETTI_COLOURS));
      piece.style.setProperty('--dx', randInt(-90, 90) + 'px');
      piece.style.setProperty('--rot', randInt(360, 1080) + 'deg');
      piece.style.setProperty('--dur', rand(3.4, 6.2).toFixed(2) + 's');
      piece.style.setProperty('--delay', rand(0, 1.6).toFixed(2) + 's');
      spawnFx(piece);
    }
  }

  function floatHearts(count) {
    for (var i = 0; i < count; i++) {
      heartSpawns += 1;
      var h = document.createElement('span');
      h.className = 'heart-float';
      h.textContent = pick(HEART_GLYPHS);
      h.style.setProperty('--x', rand(2, 96).toFixed(2) + '%');
      h.style.setProperty('--fs', rand(1.05, 2.1).toFixed(2) + 'rem');
      h.style.setProperty('--dx', randInt(-70, 70) + 'px');
      h.style.setProperty('--rot', randInt(-28, 28) + 'deg');
      h.style.setProperty('--dur', rand(7, 11).toFixed(2) + 's');
      h.style.setProperty('--delay', rand(0, 1.4).toFixed(2) + 's');
      spawnFx(h);
    }
  }

  function popGlints(count) {
    for (var i = 0; i < count; i++) {
      var g = document.createElement('span');
      g.className = 'glint';
      g.textContent = pick(['✨', '⭐', '💫', '🌟']);
      g.style.setProperty('--x', rand(2, 96).toFixed(2) + '%');
      g.style.setProperty('--y', rand(2, 92).toFixed(2) + '%');
      g.style.setProperty('--fs', rand(0.8, 1.6).toFixed(2) + 'rem');
      g.style.setProperty('--dur', rand(1.8, 3.2).toFixed(2) + 's');
      g.style.setProperty('--delay', rand(0, 1.2).toFixed(2) + 's');
      spawnFx(g);
    }
  }

  function launchFirework() {
    var fw = document.createElement('div');
    fw.className = 'firework';
    fw.style.setProperty('--x', rand(12, 88).toFixed(2) + '%');
    fw.style.setProperty('--y', rand(8, 60).toFixed(2) + '%');

    var colour = pick(FIREWORK_COLOURS);
    var dots = randInt(14, 22);
    var radius = rand(70, 135);

    for (var i = 0; i < dots; i++) {
      var dot = document.createElement('i');
      dot.style.setProperty('--a', ((360 / dots) * i + rand(-6, 6)).toFixed(1) + 'deg');
      dot.style.setProperty('--r', (radius * rand(0.8, 1.15)).toFixed(0) + 'px');
      dot.style.setProperty('--c', i % 4 === 0 ? '#ffffff' : colour);
      dot.style.setProperty('--dur', rand(0.8, 1.15).toFixed(2) + 's');
      dot.style.setProperty('--delay', rand(0, 0.16).toFixed(2) + 's');
      fw.appendChild(dot);
    }

    fx.appendChild(fw);
    /* the wrapper itself stays still, so clean it up with a timer */
    later(function () { if (fw.parentNode) { fw.remove(); } }, 2600);
  }

  function launchFireworks(count) {
    for (var i = 0; i < count; i++) {
      later(launchFirework, i * randInt(240, 620));
    }
  }

  function celebrate() {
    var reduced = prefersReduced();

    burstConfetti(reduced ? 16 : 90);
    floatHearts(reduced ? 6 : 26);
    popGlints(reduced ? 6 : 24);

    if (reduced) { launchFireworks(1); return; }

    /* fireworks keep appearing in different places, but they do calm down */
    launchFireworks(5);
    var round = 0;
    var fwId = every(function () {
      round += 1;
      launchFireworks(randInt(1, 2));
      if (round >= 5) {
        clearInterval(fwId);
        var at = intervals.indexOf(fwId);
        if (at > -1) { intervals.splice(at, 1); }
      }
    }, 2300);

    /* a few more hearts drift up while the message is being written */
    var heartsId = every(function () {
      floatHearts(5);
      if (heartSpawns >= 60) {
        clearInterval(heartsId);
        var at = intervals.indexOf(heartsId);
        if (at > -1) { intervals.splice(at, 1); }
      }
    }, 4200);
  }

  /* magical flash used for the landing ➜ cake transition */
  function flashTransition() {
    transition.classList.remove('is-on');
    void transition.offsetWidth;           /* restart the CSS animation */
    transition.classList.add('is-on');
    later(function () { transition.classList.remove('is-on'); }, 1300);
    popGlints(prefersReduced() ? 6 : 20);
  }

  /* =============================================================
     SCREEN 1 ➜ SCREEN 2 : the magical transition
     ============================================================= */
  async function openSurprise() {
    if (state.opened) { return; }
    state.opened = true;
    openBtn.disabled = true;

    flashTransition();
    landing.classList.add('is-leaving');
    await wait(prefersReduced() ? 150 : 540);

    landing.hidden = true;
    experience.hidden = false;
    scrollToTop(false);
    await wait(80);

    /* a short, polite hint for screen-reader users (and everyone else) */
    statusEl.textContent = 'Your cake is ready — tap the candles to make your wish 🎂';
    statusEl.classList.add('is-in');
    later(function () {
      if (!state.blowing) { statusEl.classList.remove('is-in'); }
    }, 4400);

    try { cake.focus({ preventScroll: true }); } catch (e) { cake.focus(); }
  }

  function scrollToTop(smooth) {
    try {
      window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    } catch (e) { window.scrollTo(0, 0); }
  }

  function scrollIntoViewSoftly(el) {
    if (!el) { return; }
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      el.scrollIntoView(true);
    }
  }

  /* =============================================================
     CANDLE INTERACTION
     tap/click the cake ➜ flicker ➜ shrink ➜ flames out ➜ smoke
     ➜ cake glows ➜ song + celebration ➜ birthday message
     ============================================================= */
  function timings() {
    var reduced = prefersReduced();
    return {
      flicker: reduced ? 80 : 550,     /* hard flickering            */
      shrinkStep: reduced ? 8 : 16,    /* stagger of the shrink wave */
      shrink: reduced ? 100 : 950,     /* the flames get smaller     */
      outStep: reduced ? 12 : 48,      /* stagger of the out wave    */
      celebrateAt: reduced ? 40 : 520, /* celebration joins in       */
      outTail: reduced ? 130 : 900,    /* whole "out" transition     */
      beforeMessage: reduced ? 100 : 800
    };
  }

  async function blowCandles() {
    if (state.blowing || state.blown) { return; }
    state.blowing = true;

    var t = timings();
    var i;

    /* (1) the birthday song starts inside the SAME user gesture.
           Playing it here (with a smooth volume fade-in) is what makes
           mobile browsers happy — no autoplay, ever.                     */
    startSong();

    /* (2) flames flicker + the candles shake gently */
    statusEl.classList.remove('is-in');
    statusEl.textContent = '';
    cake.classList.add('is-flickering');
    await wait(t.flicker);

    /* (3) ...the flames become smaller... */
    cake.classList.remove('is-flickering');
    cake.classList.add('is-shrinking');           /* stops the idle flicker animation */
    for (i = 0; i < candles.length; i++) {
      candles[i].style.setProperty('--delay', (i * t.shrinkStep) + 'ms');
      candles[i].classList.add('is-shrinking');
    }
    await wait(t.shrink);

    /* (4) ...and finally go out one after another, leaving tiny smoke trails */
    for (i = 0; i < candles.length; i++) {
      candles[i].style.setProperty('--delay', (i * t.outStep) + 'ms');
      candles[i].classList.add('is-out');
    }

    /* (5) the cake starts to glow while the last flames fade away */
    await wait(t.celebrateAt);
    state.blown = true;
    cake.classList.add('is-blown', 'is-glow');
    cakeStage.classList.add('is-celebrating');
    buildCakeSparkles(true);

    statusEl.textContent = 'May all your wishes come true! 💜✨';
    statusEl.classList.add('is-in');

    celebrate();

    /* (6) then the birthday message appears */
    var rest = Math.max(0, (candles.length - 1) * t.outStep + t.outTail - t.celebrateAt);
    await wait(rest + t.beforeMessage);
    revealMessage();
  }

  /* =============================================================
     BIRTHDAY MESSAGE : fade-in + slide-up + gentle typewriter
     ============================================================= */
  var finalShown = false;

  async function revealMessage() {
    if (!messageCard.hidden) { return; }
    messageCard.hidden = false;
    await nextFrame();
    messageCard.classList.add('is-in');
    skipBtn.hidden = false;

    typeMessage();

    if (!prefersReduced()) {
      later(function () { scrollIntoViewSoftly(messageCard); }, 1600);
    }
  }

  function typeMessage() {
    if (state.typed) { return; }
    state.typed = true;

    var paras = $$('#message p');

    /* reduced motion: show the whole message at once, no typing */
    if (prefersReduced()) {
      paras.forEach(function (p) { p.classList.add('is-in'); });
      skipBtn.hidden = true;
      showFinal();
      return;
    }

    var pi = 0;

    function finishRest() {
      for (var k = 0; k < paras.length; k++) {
        paras[k].textContent = originalMessage[k];
        paras[k].classList.add('is-in');
        paras[k].classList.remove('is-typing');
      }
      skipBtn.hidden = true;
      showFinal();
    }

    function typeParagraph() {
      if (pi >= paras.length) {
        skipBtn.hidden = true;
        showFinal();
        return;
      }

      var p = paras[pi];
      var full = originalMessage[pi];
      /* Array.from keeps emoji (💕) in one piece while typing */
      var chars = Array.from ? Array.from(full) : full.split('');
      var ci = 0;

      p.textContent = '';
      p.classList.add('is-in', 'is-typing');

      function step() {
        if (state.skipTyping) { finishRest(); return; }

        if (ci >= chars.length) {
          p.textContent = full;
          p.classList.remove('is-typing');
          pi += 1;
          later(typeParagraph, 340);
          return;
        }

        var ch = chars[ci];
        p.textContent += ch;
        ci += 1;
        later(step, ch === ' ' ? 12 : (ch === '.' || ch === '?' ? 110 : 26));
      }

      step();
    }

    typeParagraph();
  }

  /* final section : "From the one 💜" + Replay the Magic ✨ */
  function buildFinalSparkles() {
    var box = $('.final__sparkles', finalBlock);
    if (!box) { return; }
    box.innerHTML = '';
    if (prefersReduced()) { return; }
    var html = '';
    for (var i = 0; i < 14; i++) {
      html += '<span class="fx-spark" style="--x:' + rand(4, 94).toFixed(1) + '%;--y:' +
        rand(2, 90).toFixed(1) + '%;--s:' + randInt(6, 12) + 'px;--dur:' +
        rand(1.8, 3.6).toFixed(2) + 's;--delay:' + rand(0, 2.4).toFixed(2) + 's"></span>';
    }
    box.innerHTML = html;
  }

  function showFinal() {
    if (finalShown) { return; }
    finalShown = true;
    finalBlock.hidden = false;
    nextFrame().then(function () { finalBlock.classList.add('is-in'); });
    buildFinalSparkles();
  }

  /* =============================================================
     REPLAY : back to the very first magical moment
     ============================================================= */
  function replayMagic() {
    clearScheduled();
    stopMic();              /* if the optional microphone was listening, release it */
    fx.innerHTML = '';
    heartSpawns = 0;

    /* audio back to the start */
    clearInterval(volumeTimer);
    volumeTimer = null;
    try { song.pause(); song.currentTime = 0; } catch (e) { /* ignore */ }
    song.volume = DEFAULT_VOLUME;
    songStarted = false;
    chimeDone = false;
    songAvailable = true;
    hideMusicControl();
    setMusicState(false);

    /* candles + flames + smoke freshly "just lit" (also re-randomises
       the idle flicker so the replay never looks identical) */
    buildCandles();
    refreshCandleList();
    cake.classList.remove('is-flickering', 'is-shrinking', 'is-blown', 'is-glow');
    cakeStage.classList.remove('is-celebrating');

    statusEl.textContent = '';
    statusEl.classList.remove('is-in');

    /* the exact birthday message, untyped */
    $$('#message p').forEach(function (p, i) {
      p.textContent = originalMessage[i] || '';
      p.classList.remove('is-in', 'is-typing');
    });
    messageCard.classList.remove('is-in');
    messageCard.hidden = true;
    skipBtn.hidden = true;

    /* final section folded away */
    var sparkBox = $('.final__sparkles', finalBlock);
    if (sparkBox) { sparkBox.innerHTML = ''; }
    finalBlock.classList.remove('is-in');
    finalBlock.hidden = true;
    finalShown = false;

    /* optional microphone back to neutral */
    setMicNote('');
    if (micBtn) { micBtn.hidden = false; }

    state.opened = false;
    state.blowing = false;
    state.blown = false;
    state.typed = false;
    state.skipTyping = false;

    buildCakeSparkles(false);
    buildBackground();

    /* and back to the "Open Your Surprise" screen */
    experience.hidden = true;
    landing.hidden = false;
    landing.classList.remove('is-leaving');
    openBtn.disabled = false;
    scrollToTop(!prefersReduced());
    later(function () {
      try { openBtn.focus({ preventScroll: true }); } catch (e) { openBtn.focus(); }
    }, prefersReduced() ? 0 : 500);
  }

  /* =============================================================
     OPTIONAL : blow into the microphone 💨
     Completely optional. Tapping the cake always works, and every
     failure path just returns the control with a friendly note.
     ============================================================= */
  var micStream = null;
  var micCtx = null;
  var micAnalyser = null;
  var micData = null;
  var micRaf = null;
  var loudFrames = 0;
  var micGaveUp = null;

  function setMicNote(text) {
    if (!micNote) { return; }
    micNote.textContent = text;
  }

  function stopMic() {
    if (micGaveUp) { clearTimeout(micGaveUp); micGaveUp = null; }
    if (micRaf) { cancelAnimationFrame(micRaf); micRaf = null; }
    if (micStream) {
      micStream.getTracks().forEach(function (track) { track.stop(); });
      micStream = null;
    }
    if (micCtx) { try { micCtx.close(); } catch (e) { /* ignore */ } micCtx = null; }
    micAnalyser = null;
    micData = null;
    loudFrames = 0;
  }

  function micLoop() {
    if (!micAnalyser || !micData) { return; }

    micAnalyser.getByteFrequencyData(micData);
    var sum = 0;
    for (var i = 0; i < micData.length; i++) { sum += micData[i]; }
    var level = sum / micData.length;

    /* a few loud frames in a row = a real puff of air, not a random click */
    loudFrames = level > 34 ? loudFrames + 1 : 0;

    if (loudFrames >= 6) {
      stopMic();
      if (micBtn) { micBtn.hidden = true; }
      setMicNote('Nice blow! 💨');
      blowCandles();
      return;
    }

    micRaf = requestAnimationFrame(micLoop);
  }

  function micUnsupported() {
    stopMic();
    if (micBtn) { micBtn.hidden = true; }
    setMicNote('Blowing is not supported here — just tap the cake 💜');
  }

  async function enableMic() {
    if (state.blowing || state.blown) { return; }

    var md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) {
      if (micBtn) { micBtn.hidden = true; }
      setMicNote('No microphone here — just tap the cake instead 💜');
      return;
    }

    setMicNote('Listening… blow gently towards your phone 🎈');

    try {
      micStream = await md.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
    } catch (e) {
      if (micBtn) { micBtn.hidden = true; }
      setMicNote('Microphone not allowed — no worries, just tap the cake 💜');
      return;
    }

    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { micUnsupported(); return; }

    try {
      micCtx = new Ctx();
      var source = micCtx.createMediaStreamSource(micStream);
      micAnalyser = micCtx.createAnalyser();
      micAnalyser.fftSize = 512;
      micAnalyser.smoothingTimeConstant = 0.7;
      source.connect(micAnalyser);
      micData = new Uint8Array(micAnalyser.frequencyBinCount);
    } catch (e) {
      micUnsupported();
      return;
    }

    if (micBtn) { micBtn.hidden = true; }
    statusEl.classList.remove('is-in');
    micLoop();

    /* never leave the listener hanging: after a while, kindly hand the
       control back so tapping the cake is obviously still available */
    micGaveUp = setTimeout(function () {
      if (state.blowing || !micAnalyser) { return; }
      stopMic();
      if (micBtn) { micBtn.hidden = false; }
      setMicNote('Tapping the cake always works too 🎂');
    }, 22000);
  }

  /* =============================================================
     BOOTSTRAP
     ============================================================= */
  function onMessageCardClick(event) {
    if (!state.typed || state.skipTyping) { return; }
    var t = event.target;
    if (t && t.closest && t.closest('button, a')) { return; }
    if (skipBtn && !skipBtn.hidden) { state.skipTyping = true; }
  }

  function init() {
    buildBackground();
    buildCandles();
    refreshCandleList();
    buildCakeSparkles(false);

    /* remember the exact birthday message for the typewriter + the replay */
    originalMessage = $$('#message p').map(function (p) { return p.textContent.trim(); });

    openBtn.addEventListener('click', openSurprise);
    cake.addEventListener('click', function () { blowCandles(); });
    replayBtn.addEventListener('click', replayMagic);

    if (skipBtn) {
      skipBtn.addEventListener('click', function () { state.skipTyping = true; });
    }
    if (messageCard) {
      messageCard.addEventListener('click', onMessageCardClick);
    }
    if (micBtn) {
      micBtn.addEventListener('click', enableMic);
    }

    song.addEventListener('ended', function () { setMusicState(false); });

    /* rebuild the light background layers if the window changes a lot */
    var lastWidth = window.innerWidth;
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - lastWidth) < 120) { return; }
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildBackground, 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();









