// Birthday Wish 1 New — Independent Template Engine
// High-Fidelity Interactive Story Engine matching Cutiepage cp-birthday-wish-v2

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    currentSection: 0,
    totalSections: 9,
    unlocked: false,
    lightsOn: false,
    deckIndex: 0,
    deckTotal: 5,
    wishHeld: false,
    wishDone: false,
    candlesOut: [false, false],
    cakePhase: 'blow', // 'blow' -> 'cut' -> 'done'
    giftTaps: 0,
    giftOpen: false,
    audioInitialized: false
  };

  // Prime and unlock audio on first touch/click anywhere
  function primeAudio() {
    if (state.audioInitialized) return;
    state.audioInitialized = true;
    if (window.sound) {
      window.sound.unlock();
    }
    const bgAudio = document.getElementById('bg-music');
    if (bgAudio) {
      bgAudio.load();
    }
  }
  window.addEventListener('touchstart', primeAudio, { once: true, passive: true });
  window.addEventListener('pointerdown', primeAudio, { once: true, passive: true });
  window.addEventListener('click', primeAudio, { once: true });

  // Navigation Controller
  function goToSection(newIndex, direction = 'forward') {
    if (newIndex < 0 || newIndex >= state.totalSections || newIndex === state.currentSection) {
      return;
    }

    const currentEl = document.getElementById(`folio-section-${state.currentSection}`);
    const nextEl = document.getElementById(`folio-section-${newIndex}`);
    if (!currentEl || !nextEl) return;

    // If returning back to Slide 1 (Phone Lock Screen), reset its visual state cleanly
    if (newIndex === 0) {
      resetLockScreen();
    }

    currentEl.setAttribute('data-folio-leaving', direction);

    setTimeout(() => {
      currentEl.setAttribute('hidden', '');
      currentEl.removeAttribute('data-folio-leaving');

      nextEl.removeAttribute('hidden');
      state.currentSection = newIndex;

      updateNavUI();
      onSectionEnter(newIndex);
    }, 280);
  }

  function updateNavUI() {
    const prevBtn = document.getElementById('story-prev-btn');
    const nextBtn = document.getElementById('story-next-btn');
    const dotsList = document.querySelectorAll('#story-dots li');

    if (prevBtn) {
      prevBtn.disabled = state.currentSection === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = state.currentSection === state.totalSections - 1;
    }

    dotsList.forEach((dot, idx) => {
      if (idx === state.currentSection) {
        dot.classList.add('is-active');
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.classList.remove('is-active');
        dot.removeAttribute('aria-current');
      }
    });

    const dotsContainer = document.getElementById('story-dots');
    if (dotsContainer) {
      dotsContainer.setAttribute('aria-label', `Step ${state.currentSection + 1} of ${state.totalSections}`);
    }
  }

  function onSectionEnter(index) {
    if (index === 4) {
      // Cake screen: initialize microphone blow listener
      initMicBlowDetection();
    } else if (index === 8) {
      // Grand Finale confetti burst
      if (window.confetti && typeof window.confetti.burst === 'function') {
        window.confetti.burst(3500);
      }
    }
  }

  // ==========================================
  // SCREEN 1: PHONE LOCK SCREEN INTERACTION
  // ==========================================
  function resetLockScreen() {
    const lockPhone = document.querySelector('.folio-lock');
    if (lockPhone) {
      lockPhone.classList.remove('is-unlocked');
    }
    const knob = document.querySelector('.folio-lock-knob');
    if (knob) {
      knob.style.transform = 'translateX(0px)';
      knob.style.setProperty('--slide', '0');
      knob.style.transition = 'none';
    }
    const label = document.querySelector('.folio-lock-slide-label');
    if (label) {
      label.style.opacity = '1';
      label.style.transition = 'none';
    }
    state.unlocked = false;
  }

  function initLockScreen() {
    const track = document.querySelector('.folio-lock-track');
    const knob = document.querySelector('.folio-lock-knob');
    const label = document.querySelector('.folio-lock-slide-label');
    const lockPhone = document.querySelector('.folio-lock');

    if (!track || !knob) return;

    let isDragging = false;
    let startX = 0;
    let maxSlide = 0;
    let currentSlide = 0;

    function getPointerX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onStart(e) {
      if (state.unlocked) return;
      primeAudio();
      isDragging = true;
      startX = getPointerX(e);
      const trackRect = track.getBoundingClientRect();
      const knobRect = knob.getBoundingClientRect();
      maxSlide = Math.max(50, trackRect.width - knobRect.width - 8);
      knob.style.transition = 'none';
      if (label) label.style.transition = 'none';
    }

    function onMove(e) {
      if (!isDragging || state.unlocked) return;
      const x = getPointerX(e);
      const delta = Math.max(0, Math.min(x - startX, maxSlide));
      currentSlide = maxSlide > 0 ? delta / maxSlide : 0;

      knob.style.setProperty('--slide', currentSlide.toString());
      knob.style.transform = `translateX(${delta}px)`;
      if (label) {
        label.style.opacity = Math.max(0, 1 - currentSlide * 1.4).toString();
      }

      if (currentSlide >= 0.86) {
        triggerUnlock();
      }
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      if (state.unlocked) return;

      if (currentSlide >= 0.8) {
        triggerUnlock();
      } else {
        knob.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
        knob.style.transform = 'translateX(0px)';
        knob.style.setProperty('--slide', '0');
        if (label) {
          label.style.transition = 'opacity 0.25s ease';
          label.style.opacity = '1';
        }
        currentSlide = 0;
      }
    }

    function triggerUnlock() {
      if (state.unlocked) return;
      state.unlocked = true;
      isDragging = false;

      knob.style.transition = 'transform 0.2s ease-out';
      knob.style.transform = `translateX(${maxSlide}px)`;
      knob.style.setProperty('--slide', '1');
      if (label) label.style.opacity = '0';

      if (window.sound) window.sound.play('unlock');

      if (lockPhone) {
        lockPhone.classList.add('is-unlocked');
      }

      setTimeout(() => {
        goToSection(1, 'forward');
      }, 720);
    }

    knob.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    knob.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    track.addEventListener('click', (e) => {
      if (e.target !== knob && !state.unlocked) {
        maxSlide = Math.max(50, track.getBoundingClientRect().width - knob.getBoundingClientRect().width - 8);
        triggerUnlock();
      }
    });

    // Mascot sticker tap sound
    const mascot = document.querySelector('#folio-section-0 img, #folio-section-0 .mascot-cat');
    if (mascot) {
      mascot.addEventListener('click', () => {
        if (window.sound) window.sound.play('puff');
      });
    }
  }

  // ========================================================
  // SCREEN 2: LIGHTS GATE & LIT PARTY ROOM (TAP ME & BALLOONS)
  // ========================================================
  function initLightsScreen() {
    const lightsContainer = document.querySelector('.folio-lights');
    const cord = document.querySelector('.folio-lights-cord');
    const pullBtn = document.querySelector('.folio-lights-pull');

    if (!lightsContainer) return;

    let isPulling = false;
    let startY = 0;

    function onCordDown(e) {
      if (state.lightsOn) return;
      primeAudio();
      isPulling = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      if (pullBtn) pullBtn.style.transition = 'none';
      if (window.sound) window.sound.play('tick');
    }

    function onCordMove(e) {
      if (!isPulling || state.lightsOn) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dist = Math.max(0, Math.min(y - startY, 95));
      const stretch = dist / 95;
      if (pullBtn) {
        pullBtn.style.setProperty('--stretch', stretch.toString());
        pullBtn.style.transform = `translateY(${dist}px)`;
      }

      if (dist >= 70) {
        triggerLights();
      }
    }

    function onCordUp() {
      if (!isPulling) return;
      isPulling = false;
      if (state.lightsOn) return;

      if (pullBtn) {
        pullBtn.style.transition = 'transform 0.3s cubic-bezier(0.3, 1.4, 0.4, 1)';
        pullBtn.style.transform = 'translateY(0px)';
        pullBtn.style.setProperty('--stretch', '0');
      }
    }

    function triggerLights() {
      if (state.lightsOn) return;
      state.lightsOn = true;
      isPulling = false;

      if (pullBtn) {
        pullBtn.style.transition = 'transform 0.25s cubic-bezier(0.2, 1.2, 0.3, 1)';
        pullBtn.style.transform = 'translateY(0px)';
        pullBtn.style.setProperty('--stretch', '0');
      }

      const hint = document.querySelector('.folio-lights-hint');
      if (hint) hint.style.display = 'none';

      let flash = document.querySelector('.folio-lights-flash');
      if (!flash) {
        flash = document.createElement('div');
        flash.className = 'folio-lights-flash';
        flash.setAttribute('aria-hidden', 'true');
        lightsContainer.appendChild(flash);
      }

      if (window.sound) {
        window.sound.play('switch');
        setTimeout(() => window.sound.play('popper'), 120);
      }

      lightsContainer.classList.add('is-lit');

      if (window.confetti && typeof window.confetti.burst === 'function') {
        window.confetti.burst(3500);
      }

      // Start background music
      if (window.sound) {
        window.sound.playMusic();
        updateSoundButtonState(true);
      }

      setTimeout(() => {
        if (flash && flash.parentNode) {
          flash.parentNode.removeChild(flash);
        }
      }, 950);
    }

    if (cord) {
      cord.addEventListener('mousedown', onCordDown);
      window.addEventListener('mousemove', onCordMove);
      window.addEventListener('mouseup', onCordUp);

      cord.addEventListener('touchstart', onCordDown, { passive: true });
      window.addEventListener('touchmove', onCordMove, { passive: true });
      window.addEventListener('touchend', onCordUp);

      cord.addEventListener('click', () => {
        if (!state.lightsOn) triggerLights();
      });
    }

    // --- "TAP ME!" & BALLOONS FLYING LOGIC ---
    function triggerBalloonsFly() {
      if (window.sound) window.sound.play('popper');

      // 1. Animate cat mascot
      const cat = document.querySelector('#folio-section-1 .folio-ctap, #folio-section-1 img[src*="cat-cake"]');
      if (cat) {
        cat.classList.remove('mascot-tapped');
        void cat.offsetWidth;
        cat.classList.add('mascot-tapped');
      }

      // 2. Animate all SVG balloons in the room to fly upwards
      const balloons = document.querySelectorAll('#folio-section-1 svg[viewBox="0 0 80 200"]');
      balloons.forEach((b, idx) => {
        b.classList.remove('balloon-flying');
        void b.offsetWidth;
        b.style.animationDelay = (idx * 0.12) + 's';
        b.classList.add('balloon-flying');
      });

      // 3. Burst celebration confetti
      if (window.confetti && typeof window.confetti.burst === 'function') {
        window.confetti.burst(2000);
      }

      // 4. Reset balloon animation so user can tap multiple times
      setTimeout(() => {
        balloons.forEach(b => {
          b.classList.remove('balloon-flying');
          b.style.animationDelay = '';
        });
      }, 2800);
    }

    // Attach to 'tap me!' badge, cat mascot, and surrounding container
    const allSec1Elements = document.querySelectorAll('#folio-section-1 *');
    allSec1Elements.forEach(el => {
      if (el.children.length === 0 && el.textContent.trim().toLowerCase().includes('tap me')) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerBalloonsFly();
        });
      }
    });

    const sec1Cat = document.querySelector('#folio-section-1 .folio-ctap');
    if (sec1Cat) {
      sec1Cat.style.cursor = 'pointer';
      sec1Cat.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerBalloonsFly();
      });
    }

    // Direct click on room balloons
    const roomBalloons = document.querySelectorAll('#folio-section-1 svg[viewBox="0 0 80 200"]');
    roomBalloons.forEach(b => {
      b.style.cursor = 'pointer';
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerBalloonsFly();
      });
    });

    // "let's party ›" button
    const partyBtn = document.querySelector('.folio-lights-room .folio-pill, #party-continue-btn');
    if (partyBtn) {
      partyBtn.addEventListener('click', () => {
        goToSection(2, 'forward');
      });
    }
  }

  // ========================================================
  // SCREEN 3: YEAR WRAPPED DECK (PRESERVES VIBRANT CARD COLORS)
  // ========================================================
  function initWrappedDeck() {
    const deck = document.querySelector('.folio-deck');
    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll('.folio-deck-card'));
    const nextBtn = deck.querySelector('.folio-deck-next');
    const dots = deck.querySelectorAll('.folio-deck-progress li');
    state.deckTotal = cards.length;

    function renderDeck() {
      cards.forEach((card, idx) => {
        if (idx === state.deckIndex) {
          // Top Active Card — 100% Opaque, Vibrant, Interactive
          card.className = card.className.replace(/\bis-(top|behind|gone)\b/g, '').trim() + ' is-top';
          card.style.zIndex = '20';
          card.style.opacity = '1';
          card.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
          card.style.pointerEvents = 'auto';
          card.removeAttribute('aria-hidden');
        } else if (idx < state.deckIndex) {
          // Passed Card — Swiped Away
          const side = idx % 2 === 0 ? -1 : 1;
          card.className = card.className.replace(/\bis-(top|behind|gone)\b/g, '').trim() + ' is-gone';
          card.style.zIndex = '21';
          card.style.opacity = '0';
          card.style.transform = `translate(${side * 135}%, -10%) rotate(${side * 24}deg)`;
          card.style.pointerEvents = 'none';
          card.setAttribute('aria-hidden', 'true');
        } else {
          // Behind Card — Stacked Neatly
          const depth = idx - state.deckIndex;
          card.className = card.className.replace(/\bis-(top|behind|gone)\b/g, '').trim() + ' is-behind';
          card.style.zIndex = (20 - depth).toString();
          card.style.opacity = '1'; // Keep colors rich, no faded opacity!
          card.style.transform = `translateY(${depth * 12}px) scale(${1 - depth * 0.05}) rotate(${depth * 2.5}deg)`;
          card.style.pointerEvents = 'none';
          card.setAttribute('aria-hidden', 'true');
        }
      });

      // Update progress dots
      dots.forEach((dot, idx) => {
        if (idx <= state.deckIndex) {
          dot.classList.add('is-done');
        } else {
          dot.classList.remove('is-done');
        }
      });

      // Update next button label
      if (nextBtn) {
        if (state.deckIndex === state.deckTotal - 1) {
          nextBtn.textContent = 'make a wish ›';
        } else {
          nextBtn.textContent = 'next ›';
        }
      }
    }

    function advanceDeck() {
      if (state.deckIndex < state.deckTotal - 1) {
        state.deckIndex++;
        if (window.sound) window.sound.play('next');
        renderDeck();
      } else {
        // Last card: proceed to Make a Wish section
        goToSection(3, 'forward');
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        advanceDeck();
      });
    }

    const cardsContainer = deck.querySelector('.folio-deck-cards');
    if (cardsContainer) {
      cardsContainer.addEventListener('click', advanceDeck);
    }

    // Initial render
    renderDeck();
  }

  // ========================================================
  // SCREEN 4: MAKE A WISH (HOLD OR TAP TO COMPLETE)
  // ========================================================
  function initWishScreen() {
    const wishContainer = document.querySelector('.folio-wish');
    const wishBtn = document.querySelector('.folio-wish-button');
    const label = document.querySelector('.folio-wish-label');
    const fillRing = document.querySelector('.folio-wish-ring-fill');

    if (!wishContainer || !wishBtn) return;

    let holdTimer = null;
    let isHolding = false;

    function completeWish() {
      if (state.wishDone) return;
      state.wishDone = true;
      isHolding = false;
      if (holdTimer) clearTimeout(holdTimer);

      wishContainer.classList.remove('is-holding');
      wishContainer.classList.add('is-done');

      if (label) {
        label.innerHTML = '<span class="folio-text font-bold">wished ✓</span>';
      }
      if (fillRing) {
        fillRing.style.strokeDashoffset = '0';
      }

      if (window.sound) {
        window.sound.play('win');
      }
      if (window.confetti && typeof window.confetti.burst === 'function') {
        window.confetti.burst(3000);
      }

      // Update text
      const heading = document.querySelector('#folio-section-3 h2, #folio-section-3 p[class*="font-(family-name:--f-display)"]');
      if (heading) {
        heading.textContent = 'Wish sent ✦';
      }
      const sub = document.querySelector('#folio-section-3 p[class*="text-[17px]"], #folio-section-3 p[class*="max-w-[34ch]"]');
      if (sub) {
        sub.textContent = 'Your wish is safe with the stars ✨';
      }

      // Auto-advance to Cake slide after 1.4s
      setTimeout(() => {
        goToSection(4, 'forward');
      }, 1400);
    }

    function startHold(e) {
      if (state.wishDone || isHolding) return;
      isHolding = true;
      primeAudio();

      wishContainer.classList.add('is-holding');
      if (window.sound) window.sound.play('charge');

      holdTimer = setTimeout(() => {
        completeWish();
      }, 1400);
    }

    function cancelHold() {
      if (state.wishDone || !isHolding) return;
      isHolding = false;
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      wishContainer.classList.remove('is-holding');
    }

    // Pointer events for hold interaction
    wishBtn.addEventListener('pointerdown', startHold);
    window.addEventListener('pointerup', cancelHold);
    window.addEventListener('pointercancel', cancelHold);

    wishBtn.addEventListener('touchstart', startHold, { passive: true });
    window.addEventListener('touchend', cancelHold);

    // Fallback click on mobile
    wishBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!state.wishDone) {
        // Quick complete if user tapped
        startHold(e);
        setTimeout(completeWish, 500);
      }
    });
  }

  // ========================================================
  // SCREEN 5: BIRTHDAY CAKE & CANDLE BLOW / CUT INTERACTION
  // ========================================================
  let micStream = null;
  function initMicBlowDetection() {
    if (state.cakePhase !== 'blow') return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } })
        .then(stream => {
          micStream = stream;
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;
          const audioCtx = new AudioContextClass();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          const buffer = new Uint8Array(analyser.fftSize);

          let animId;
          function checkBlow() {
            if (state.cakePhase !== 'blow') {
              if (animId) cancelAnimationFrame(animId);
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            analyser.getByteTimeDomainData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) {
              const val = (buffer[i] - 128) / 128;
              sum += val * val;
            }
            const rms = Math.sqrt(sum / buffer.length);
            // High noise/blowing detected
            if (rms > 0.18) {
              extinguishCandles();
            }
            animId = requestAnimationFrame(checkBlow);
          }
          animId = requestAnimationFrame(checkBlow);
        })
        .catch(() => {
          // Microphone not available or denied; tap candles works 100%
        });
    }
  }

  function extinguishCandles() {
    const candles = document.querySelectorAll('.folio-cake-candle');
    candles.forEach((c, idx) => {
      setTimeout(() => {
        extinguishCandle(c, idx);
      }, idx * 180);
    });
  }

  function extinguishCandle(candleEl, idx) {
    if (candleEl.classList.contains('is-out')) return;

    candleEl.classList.add('is-out');
    state.candlesOut[idx] = true;

    // Spawn smoke puff
    let smoke = candleEl.querySelector('.folio-cake-smoke');
    if (!smoke) {
      smoke = document.createElement('span');
      smoke.className = 'folio-cake-smoke';
      candleEl.appendChild(smoke);
      setTimeout(() => smoke.remove(), 800);
    }

    if (window.sound) window.sound.play('puff');

    // Check if all candles are blown out
    const allCandles = document.querySelectorAll('.folio-cake-candle');
    const allOut = Array.from(allCandles).every(c => c.classList.contains('is-out'));

    if (allOut && state.cakePhase === 'blow') {
      state.cakePhase = 'cut';
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
      }
      setTimeout(transitionToCakeCutPhase, 700);
    }
  }

  function transitionToCakeCutPhase() {
    const cakeContainer = document.querySelector('.folio-cake');
    if (cakeContainer) {
      cakeContainer.classList.remove('is-blow');
      cakeContainer.classList.add('is-cut');
    }

    if (window.sound) window.sound.play('reveal');

    // Update copy text
    const title = document.querySelector('#folio-section-4 p[class*="font-(family-name:--f-display)"]');
    if (title) title.textContent = 'Now cut the cake! 🎂';

    const sub = document.querySelector('#folio-section-4 p[class*="text-[17px]"]');
    if (sub) sub.textContent = 'Swipe down or tap below to make the first slice.';

    // Inject knife and guide if not present
    const stage = document.querySelector('.folio-cake-stage');
    if (stage && !stage.querySelector('.folio-cake-knife')) {
      const knife = document.createElement('span');
      knife.className = 'folio-cake-knife';
      knife.setAttribute('aria-hidden', 'true');
      knife.innerHTML = `<svg viewBox="0 0 40 120"><rect x="15" y="0" width="10" height="38" rx="5" fill="var(--fp-ink)"></rect><path d="M14 40 H26 V104 Q26 116 20 118 Q14 116 14 104 Z" fill="var(--fp-card)" stroke="var(--fp-ink)" stroke-width="3" stroke-linejoin="round"></path></svg>`;
      stage.appendChild(knife);

      const guide = document.createElement('span');
      guide.className = 'folio-cake-guide';
      guide.setAttribute('aria-hidden', 'true');
      stage.appendChild(guide);
    }

    // Add helper "cut it for me" pill button
    const copyWrap = document.querySelector('.folio-cake-beat > div');
    if (copyWrap && !copyWrap.querySelector('.folio-cake-forme')) {
      const cutBtn = document.createElement('button');
      cutBtn.type = 'button';
      cutBtn.className = 'folio-pill is-quiet folio-cake-forme mt-2';
      cutBtn.textContent = 'cut it for me';
      cutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cutTheCake();
      });
      copyWrap.appendChild(cutBtn);
    }
  }

  function cutTheCake() {
    if (state.cakePhase === 'done') return;
    state.cakePhase = 'done';

    const cakeContainer = document.querySelector('.folio-cake');
    if (cakeContainer) {
      cakeContainer.classList.remove('is-cut');
      cakeContainer.classList.add('is-done');
    }

    if (window.sound) {
      window.sound.play('cut');
      setTimeout(() => window.sound.play('popper'), 320);
    }
    if (window.confetti && typeof window.confetti.burst === 'function') {
      window.confetti.burst(3500);
    }

    // Split cake visually
    const stage = document.querySelector('.folio-cake-stage');
    if (stage) {
      const unit = stage.querySelector('.folio-cake-unit');
      const unitHtml = unit ? unit.outerHTML : '';
      stage.innerHTML = `
        <div class="folio-cake-split">
          <div class="folio-cake-half is-left">${unitHtml}</div>
          <div class="folio-cake-half is-right">${unitHtml}</div>
        </div>
      `;
    }

    // Update copy and show continue button
    const title = document.querySelector('#folio-section-4 p[class*="font-(family-name:--f-display)"]');
    if (title) title.textContent = 'Yum! First slice served 🍰';

    const sub = document.querySelector('#folio-section-4 p[class*="text-[17px]"]');
    if (sub) sub.textContent = 'Baked with love (and zero calories).';

    const formeBtn = document.querySelector('.folio-cake-forme');
    if (formeBtn) formeBtn.remove();

    const copyWrap = document.querySelector('.folio-cake-beat > div');
    if (copyWrap && !copyWrap.querySelector('#cake-next-btn')) {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'folio-pill mt-3';
      nextBtn.id = 'cake-next-btn';
      nextBtn.textContent = 'ready for presents ›';
      nextBtn.addEventListener('click', () => {
        goToSection(5, 'forward');
      });
      copyWrap.appendChild(nextBtn);
    }
  }

  function initCakeScreen() {
    // 1. Tapping candle flames
    const candleButtons = document.querySelectorAll('.folio-cake-flame-hit');
    candleButtons.forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const candle = btn.closest('.folio-cake-candle');
        if (candle) extinguishCandle(candle, idx);
      });
      btn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        const candle = btn.closest('.folio-cake-candle');
        if (candle) extinguishCandle(candle, idx);
      }, { passive: true });
    });

    // Also support clicking directly on candles
    const candles = document.querySelectorAll('.folio-cake-candle');
    candles.forEach((c, idx) => {
      c.style.cursor = 'pointer';
      c.addEventListener('click', (e) => {
        e.stopPropagation();
        extinguishCandle(c, idx);
      });
    });

    // 2. Swipe down on cake stage to cut
    const stage = document.querySelector('.folio-cake-stage');
    if (stage) {
      let swipeStartY = 0;
      let isSwiping = false;

      stage.addEventListener('pointerdown', (e) => {
        if (state.cakePhase === 'cut') {
          isSwiping = true;
          swipeStartY = e.clientY;
        }
      });
      stage.addEventListener('pointerup', (e) => {
        if (isSwiping && state.cakePhase === 'cut') {
          const dist = e.clientY - swipeStartY;
          if (dist > 35) {
            cutTheCake();
          }
          isSwiping = false;
        }
      });

      // Also clicking the cake directly in 'cut' phase cuts it
      stage.addEventListener('click', () => {
        if (state.cakePhase === 'cut') {
          cutTheCake();
        }
      });
    }
  }

  // ========================================================
  // SCREEN 6: MYSTERY GIFT BOX SHAKE & OPEN
  // ========================================================
  function initGiftScreen() {
    const giftContainer = document.querySelector('.folio-gift');
    const giftBtn = document.querySelector('.folio-gift-box');
    const hint = document.querySelector('.folio-gift-hint');
    const dots = document.querySelectorAll('.folio-gift-dots i');

    if (!giftContainer || !giftBtn) return;

    giftBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.giftOpen) return;

      state.giftTaps++;

      if (state.giftTaps === 1) {
        if (window.sound) window.sound.play('shake');
        giftContainer.setAttribute('data-shake', 'a');
        setTimeout(() => giftContainer.removeAttribute('data-shake'), 450);
        if (dots[0]) dots[0].classList.add('is-on');
        if (hint) hint.innerHTML = '<span class="folio-text">tap it 2 more times</span>';
      } else if (state.giftTaps === 2) {
        if (window.sound) window.sound.play('shake');
        giftContainer.setAttribute('data-shake', 'b');
        setTimeout(() => giftContainer.removeAttribute('data-shake'), 450);
        if (dots[1]) dots[1].classList.add('is-on');
        if (hint) hint.innerHTML = '<span class="folio-text">one more tap!</span>';
      } else if (state.giftTaps >= 3) {
        state.giftOpen = true;
        giftContainer.classList.add('is-open');
        if (dots[2]) dots[2].classList.add('is-on');
        if (hint) hint.remove();

        if (window.sound) {
          window.sound.play('win');
          setTimeout(() => window.sound.play('horn'), 250);
        }
        if (window.confetti && typeof window.confetti.burst === 'function') {
          window.confetti.burst(3500);
        }

        // Show contents inside gift
        let contents = giftContainer.querySelector('.folio-gift-contents');
        if (!contents) {
          contents = document.createElement('div');
          contents.className = 'folio-gift-contents flex flex-col items-center gap-3 p-5 bg-white/95 rounded-3xl border-[3px] border-(--f-ink) shadow-[4px_6px_0_var(--f-ink)] text-center max-w-[280px] mx-auto mt-4';
          contents.innerHTML = `
            <span class="text-4xl">🎁 🌟</span>
            <h3 class="font-(family-name:--f-display) text-2xl text-(--f-fg) leading-tight">Happy Birthday!</h3>
            <p class="text-sm font-medium text-(--f-muted) leading-relaxed">A whole year of love, good vibes, and legendary moments!</p>
            <button type="button" class="folio-pill mt-2" id="gift-continue-btn">see photos ›</button>
          `;
          giftContainer.appendChild(contents);

          const continueBtn = contents.querySelector('#gift-continue-btn');
          if (continueBtn) {
            continueBtn.addEventListener('click', () => {
              goToSection(6, 'forward');
            });
          }
        }
      }
    });
  }

  // ========================================================
  // SCREEN 7: PHOTO DUMP (TAP TO FLIP)
  // ========================================================
  function initPhotoDump() {
    const photosSection = document.getElementById('folio-section-6');
    if (!photosSection) return;

    const cards = photosSection.querySelectorAll('article, .folio-item');
    cards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        if (window.sound) window.sound.play('tap');
        card.classList.toggle('is-flipped');
      });
    });

    // Add proceed button at the bottom of Photo Dump if not present
    if (!photosSection.querySelector('#photos-continue-btn')) {
      const btnWrap = document.createElement('div');
      btnWrap.className = 'flex justify-center mt-8 pb-12';
      btnWrap.innerHTML = `<button type="button" class="folio-pill" id="photos-continue-btn">read the letter ›</button>`;
      photosSection.querySelector('section')?.appendChild(btnWrap);

      const contBtn = btnWrap.querySelector('#photos-continue-btn');
      if (contBtn) {
        contBtn.addEventListener('click', () => {
          goToSection(7, 'forward');
        });
      }
    }
  }

  // ========================================================
  // SCREEN 8: HEARTFELT LETTER
  // ========================================================
  function initLetterScreen() {
    const letterSection = document.getElementById('folio-section-7');
    if (!letterSection) return;

    if (!letterSection.querySelector('#letter-continue-btn')) {
      const btnWrap = document.createElement('div');
      btnWrap.className = 'flex justify-center mt-6 pb-12';
      btnWrap.innerHTML = `<button type="button" class="folio-pill" id="letter-continue-btn">one more thing ›</button>`;
      letterSection.querySelector('section')?.appendChild(btnWrap);

      const contBtn = btnWrap.querySelector('#letter-continue-btn');
      if (contBtn) {
        contBtn.addEventListener('click', () => {
          goToSection(8, 'forward');
        });
      }
    }
  }

  // ========================================================
  // SCREEN 9: FINALE REPLAY
  // ========================================================
  function initFinaleScreen() {
    const replayBtn = document.querySelector('#folio-section-8 .folio-pill, #folio-section-8 button');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        goToSection(0, 'back');
      });
    }
  }

  // ========================================================
  // GLOBAL STORY NAVIGATION & SOUND CHIP
  // ========================================================
  function initStoryNavigation() {
    const prevBtn = document.getElementById('story-prev-btn');
    const nextBtn = document.getElementById('story-next-btn');
    const soundBtn = document.getElementById('story-sound-btn');
    const dots = document.querySelectorAll('#story-dots li');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSection(state.currentSection - 1, 'back');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSection(state.currentSection + 1, 'forward');
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSection(idx, idx > state.currentSection ? 'forward' : 'back');
      });
    });

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        primeAudio();
        if (window.sound) {
          const isPlaying = window.sound.toggleMusic();
          updateSoundButtonState(isPlaying);
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToSection(state.currentSection + 1, 'forward');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToSection(state.currentSection - 1, 'back');
      }
    });

    updateNavUI();
  }

  function updateSoundButtonState(isPlaying) {
    const soundBtn = document.getElementById('story-sound-btn');
    const bars = document.querySelector('.folio-sound-bars');
    if (!soundBtn) return;

    soundBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    if (bars) {
      if (isPlaying) {
        bars.classList.add('is-playing');
      } else {
        bars.classList.remove('is-playing');
      }
    }
  }

  
  // ========================================================
  // DYNAMIC PERSONALIZATION (NAME, AGE, CANDLES, DATE, CLOCK)
  // ========================================================
  const urlParams = new URLSearchParams(window.location.search);
  const config = {
    receiverName: urlParams.get('name') || urlParams.get('receiverName') || (window.__TEMPLATE_DATA__ && window.__TEMPLATE_DATA__.receiverName) || 'Favourite Person',
    senderName: urlParams.get('from') || urlParams.get('senderName') || (window.__TEMPLATE_DATA__ && window.__TEMPLATE_DATA__.senderName) || 'Someone Special',
    age: urlParams.get('age') || (window.__TEMPLATE_DATA__ && window.__TEMPLATE_DATA__.age) || '21',
    birthdayDate: urlParams.get('date') || urlParams.get('birthdayDate') || (window.__TEMPLATE_DATA__ && window.__TEMPLATE_DATA__.birthdayDate) || '28 September'
  };

  // 1. Live Real-Time Clock on Lock Screen
  function initLiveClock() {
    const clockEl = document.querySelector('.folio-lock-time');
    if (!clockEl) return;
    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      hours = hours % 12 || 12; // 12-hour format
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      clockEl.textContent = `${hours}:${strMinutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 2. Apply Custom Birthday Date
  function applyBirthdayDate() {
    if (!config.birthdayDate) return;
    // Lock screen date
    const lockDate = document.querySelector('.folio-lock-date .folio-text');
    if (lockDate) {
      lockDate.textContent = config.birthdayDate;
    }
    // Screen 2 party room date chip
    const dateChip = document.querySelector('#folio-section-1 .mt-1 .folio-text');
    if (dateChip) {
      dateChip.textContent = config.birthdayDate;
    }
  }

  // 3. Apply Personalized Name & Tape Letters
  function applyPersonalizedName() {
    const name = config.receiverName.trim();
    if (!name) return;

    // Lock screen Notification 1
    const noticeTitle = document.querySelector('#folio-section-0 .folio-lock-notice:nth-child(1) .folio-lock-notice-title .folio-text');
    if (noticeTitle) {
      noticeTitle.textContent = `It's officially ${name}'s day`;
    }

    // Party Room Tape Badges
    const tapeContainer = document.querySelector('#folio-section-1 h1 .contents');
    if (tapeContainer) {
      const colors = [
        { bg: 'var(--fp-pop1)', fg: 'var(--fp-card)' },
        { bg: 'var(--fp-pop4)', fg: 'var(--fp-ink)' },
        { bg: 'var(--fp-pop2)', fg: 'var(--fp-card)' },
        { bg: 'var(--f-accent)', fg: 'var(--fp-card)' },
        { bg: 'var(--fp-pop3)', fg: 'var(--fp-ink)' },
        { bg: 'var(--f-lilac)', fg: 'var(--fp-ink)' }
      ];
      const rots = [-5, 4, -3, 5, -4, 3];

      const words = name.toUpperCase().split(/\s+/);
      tapeContainer.innerHTML = words.map((word, wIdx) => {
        const letters = word.split('').map((char, cIdx) => {
          const color = colors[(wIdx * 3 + cIdx) % colors.length];
          const rot = rots[(wIdx * 2 + cIdx) % rots.length];
          return `<span class="grid min-w-[0.82em] place-items-center rounded-[10px] border-[3px] border-(--f-ink) px-[0.08em] pb-[0.06em] font-(family-name:--f-display) leading-[1.18] shadow-[3px_4px_0_var(--f-ink)]" style="background:${color.bg};color:${color.fg};rotate:${rot}deg">${char}</span>`;
        }).join('');
        return `<span class="inline-flex items-center gap-x-1 gap-y-2 whitespace-nowrap">${letters}</span>`;
      }).join(' ');

      // Also update hidden accessibility text
      const hiddenName = document.querySelector('#folio-section-1 h1 .text-transparent');
      if (hiddenName) hiddenName.textContent = name.toUpperCase();
    }

    // Section 8 Letter recipient and sender
    const letterTo = document.querySelector('#folio-section-7 p[class*="text-[46px]"], #folio-section-7 span[class*="text-[46px]"]');
    if (letterTo) {
      letterTo.textContent = name;
    }
    const letterFrom = document.querySelector('#folio-section-7 p:last-of-type, #folio-section-7 .folio-text:last-of-type');
    if (letterFrom && config.senderName) {
      // Find sign-off
      const allTexts = document.querySelectorAll('#folio-section-7 .folio-text');
      allTexts.forEach(el => {
        if (el.textContent.includes('Someone Special')) {
          el.textContent = config.senderName;
        }
      });
    }

    // Section 9 Finale name
    const finaleName = document.querySelector('#folio-section-8 p[class*="text-[30px]"]');
    if (finaleName) {
      finaleName.textContent = name.toLowerCase();
    }
  }

  // 4. Apply Dynamic Age & Candles
  function applyAgeAndCandles() {
    const ageDigits = config.age.toString().trim().split('');
    const candleWrap = document.querySelector('.folio-cake-candles');
    if (!candleWrap || ageDigits.length === 0) return;

    state.candlesOut = new Array(ageDigits.length).fill(false);

    candleWrap.innerHTML = ageDigits.map((digit, idx) => `
      <span class="folio-cake-candle is-number">
        <button type="button" class="folio-cake-flame-hit" aria-label="Blow out candle ${idx + 1}"></button>
        <span aria-hidden="true" class="folio-cake-flame"></span>
        <span aria-hidden="true" class="folio-cake-wick"></span>
        <span class="folio-cake-wax">${digit}</span>
      </span>
    `).join('');
  }


  // Run Personalization & Clock
  initLiveClock();
  applyBirthdayDate();
  applyPersonalizedName();
  applyAgeAndCandles();

  // Initialize all interactive modules
  initLockScreen();
  initLightsScreen();
  initWrappedDeck();
  initWishScreen();
  initCakeScreen();
  initGiftScreen();
  initPhotoDump();
  initLetterScreen();
  initFinaleScreen();
  initStoryNavigation();

  // Canvas resize for confetti
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
});
