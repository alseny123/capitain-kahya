/* ==========================================================
   CAPITAL KAHYA TRANSIT INC. — script.js
   ========================================================== */

// ---- AOS ----
AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic', offset: 60 });

// ---- HERO CINEMATIC ENTRANCE ----
// ↓ Ajuste cette valeur : nombre de secondes dans la vidéo où la terre se transforme en port
(function () {
  const VIDEO_TRIGGER_TIME = 1.5; // secondes — modifie selon le timing exact de ta vidéo

  const timeline = [
    { sel: '.hero-logo-wrap', delay: 0    },
    { sel: '.hero-title',     delay: 380  },
    { sel: '.hero-slogan',    delay: 800  },
    { sel: '.hero-desc',      delay: 1180 },
    { sel: '.hero-btns',      delay: 1540 },
  ];

  let fired = false;
  let autoScrollTimer = null;
  let userInteracted = false;

  // Cancel auto-scroll on any user interaction
  function cancelAutoScroll() {
    userInteracted = true;
    if (autoScrollTimer) { clearTimeout(autoScrollTimer); autoScrollTimer = null; }
  }
  ['wheel', 'touchstart', 'mousedown', 'keydown'].forEach(function (evt) {
    window.addEventListener(evt, cancelAutoScroll, { once: true, passive: true });
  });

  // Custom slow smooth scroll with ease-in-out curve
  function smoothScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var distance = targetY - startY;
    var startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1 && !userInteracted) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function triggerHeroEntrance() {
    if (fired) return;
    fired = true;
    timeline.forEach(function (item) {
      var el = document.querySelector(item.sel);
      if (!el) return;
      setTimeout(function () { el.classList.add('is-visible'); }, item.delay);
    });

    // After all hero animations finish + long pause, slow custom smooth-scroll to next section
    var lastDelay = timeline[timeline.length - 1].delay;
    autoScrollTimer = setTimeout(function () {
      if (userInteracted || window.scrollY > 80) return;
      var nextSection = document.getElementById('apropos');
      if (!nextSection) return;
      var headerH = document.getElementById('header') ? document.getElementById('header').offsetHeight : 0;
      var targetY = nextSection.getBoundingClientRect().top + window.scrollY - headerH;
      smoothScrollTo(targetY, 2200); // 2200ms = scroll très lent et fluide
    }, lastDelay + 700 + 2300); // 2300ms de pause après la dernière animation
  }

  var vid = document.querySelector('.hero-video');
  if (vid) {
    // Force play on mobile (certains navigateurs mobiles ignorent l'attribut autoplay HTML)
    var playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        // Autoplay bloqué — on déclenche quand même l'entrée via le fallback timeout
      });
    }

    function onTimeUpdate() {
      if (vid.currentTime >= VIDEO_TRIGGER_TIME) {
        vid.removeEventListener('timeupdate', onTimeUpdate);
        triggerHeroEntrance();
      }
    }
    vid.addEventListener('timeupdate', onTimeUpdate);
    // Fallback : déclenche après 4s si la vidéo ne joue pas (autoplay bloqué, etc.)
    setTimeout(triggerHeroEntrance, 4000);
  } else {
    setTimeout(triggerHeroEntrance, 800);
  }
})();

// ---- PARTICLES ----
(function () {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const colors = [
    'rgba(67,160,71,.55)', 'rgba(21,101,192,.45)',
    'rgba(255,255,255,.25)', 'rgba(77,208,225,.35)'
  ];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 6 + 2;
    p.style.cssText =
      'left:' + (Math.random() * 100) + '%;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
      'animation-duration:' + (Math.random() * 18 + 12) + 's;' +
      'animation-delay:' + (Math.random() * 12) + 's;';
    container.appendChild(p);
  }
})();

// ---- HERO VIDEO PARALLAX ----
(function () {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo || window.innerWidth < 768) return;
  const hero = document.getElementById('accueil');

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight) return;
    heroVideo.style.transform = 'translateY(' + (scrollY * 0.28) + 'px)';
  }, { passive: true });
})();

// ---- HEADER SCROLL + BACK-TO-TOP ----
const header    = document.getElementById('header');
const backToTop = document.getElementById('back-to-top');

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 80);
  backToTop.classList.toggle('visible', y > 400);
  highlightNav();
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- ACTIVE NAV HIGHLIGHT ----
function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link:not(.nav-link--cta)');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  links.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
}

// ---- HAMBURGER ----
const hamburger   = document.getElementById('hamburger');
const navMenu     = document.getElementById('nav-menu');
const navOverlay  = document.getElementById('nav-overlay');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navMenu.classList.toggle('open', open);
  navOverlay.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

navOverlay.addEventListener('click', closeMenu);

function closeMenu() {
  hamburger.classList.remove('open');
  navMenu.classList.remove('open');
  navOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - header.offsetHeight,
      behavior: 'smooth'
    });
  });
});

// ---- BACK TO TOP ----
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---- COUNTER ANIMATION ----
function countUp(el, target, duration) {
  const step  = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-number').forEach(el => {
        const t = parseInt(el.getAttribute('data-target'), 10);
        if (!isNaN(t)) countUp(el, t, 1800);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 }).observe(statsGrid);
}

// ---- SERVICES CAROUSEL ----
(function () {
  var track   = document.getElementById('svc-track');
  var prevBtn = document.getElementById('svc-prev');
  var nextBtn = document.getElementById('svc-next');
  var dotsEl  = document.getElementById('svc-dots');
  if (!track) return;

  var items   = track.querySelectorAll('.svc-carousel-item');
  var total   = items.length;
  var current = 0;

  items.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'svc-dot' + (i === 0 ? ' svc-dot--active' : '');
    d.setAttribute('aria-label', 'Service ' + (i + 1));
    d.addEventListener('click', function () { goTo(i); });
    dotsEl.appendChild(d);
  });

  function getStep() {
    return items[0].offsetWidth + 20;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, total - 1));
    track.style.transform = 'translateX(-' + (current * getStep()) + 'px)';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    dotsEl.querySelectorAll('.svc-dot').forEach(function (d, i) {
      d.classList.toggle('svc-dot--active', i === current);
    });
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });

  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  goTo(0);
})();

// ---- CONTACT FORM ----
const form        = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

// Add shake keyframe
const style = document.createElement('style');
style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}';
document.head.appendChild(style);

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const required = ['nom', 'email', 'message'];
  let valid = true;

  required.forEach(id => {
    const field = form.querySelector('#' + id);
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#e53935';
      field.style.animation   = 'shake .4s ease';
      setTimeout(() => { field.style.animation = ''; field.style.borderColor = ''; }, 500);
    }
  });

  if (!valid) return;

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-content"><i class="fa-solid fa-circle-notch fa-spin"></i> Envoi en cours…</span>';

  setTimeout(() => {
    btn.style.display  = 'none';
    formSuccess.style.display = 'flex';
    form.reset();
  }, 1400);
});
