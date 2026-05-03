/* =====================================================
   LUMINARY — script.js
   Mobile menu · Smooth scroll · Canvas animations
   Scroll-triggered reveals · Form handling
   ===================================================== */

"use strict";

/* ── Utility: debounce ── */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* =============================================
   1. NAVIGATION — Hamburger + Scrolled state
   ============================================= */
(function initNav() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = navMenu.querySelectorAll(".nav-link");
  let menuOpen = false;

  function toggleMenu(open) {
    menuOpen = open;
    hamburger.classList.toggle("active", open);
    navMenu.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  hamburger.addEventListener("click", () => toggleMenu(!menuOpen));

  /* Close on link click */
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (menuOpen) toggleMenu(false);
    });
  });

  /* Close on outside click */
  document.addEventListener("click", (e) => {
    if (menuOpen && !navbar.contains(e.target)) toggleMenu(false);
  });

  /* Scrolled state */
  function updateNavbar() {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }

  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();
})();

/* =============================================
   2. SMOOTH SCROLL for anchor links
   ============================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-h",
          ),
        ) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

/* =============================================
   3. HERO CANVAS — Particle field animation
   ============================================= */
(function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W,
    H,
    particles = [],
    raf;

  const PARTICLE_COUNT = 80;
  const ACCENT = { r: 108, g: 143, b: 255 };
  const ACCENT2 = { r: 167, g: 139, b: 250 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.1);
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
      const t = Math.random();
      this.color = t < 0.5 ? ACCENT : ACCENT2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.6;
      const { r, g, b } = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  /* Faint connecting lines */
  function drawLines() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,143,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLines();
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    raf = requestAnimationFrame(loop);
  }

  resize();
  init();
  loop();

  window.addEventListener(
    "resize",
    debounce(() => {
      resize();
      init();
    }, 200),
  );
})();

/* =============================================
   4. SHOWCASE CANVAS — Abstract wave animation
   ============================================= */
(function initShowcaseCanvas() {
  const canvas = document.getElementById("showcaseCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W,
    H,
    t = 0,
    raf;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function drawWave(yBase, amplitude, frequency, speed, color) {
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= W; x++) {
      const y =
        yBase +
        Math.sin(x * frequency + t * speed) * amplitude +
        Math.sin(x * frequency * 0.7 + t * speed * 1.3) * (amplitude * 0.5);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;

    drawWave(H * 0.5, 30, 0.008, 1, "rgba(108,143,255,0.04)");
    drawWave(H * 0.55, 24, 0.01, 1.2, "rgba(167,139,250,0.04)");
    drawWave(H * 0.6, 18, 0.012, 0.9, "rgba(108,143,255,0.05)");
    drawWave(H * 0.7, 14, 0.015, 1.5, "rgba(167,139,250,0.035)");

    raf = requestAnimationFrame(loop);
  }

  resize();
  loop();

  window.addEventListener("resize", debounce(resize, 200));
})();

/* =============================================
   5. SCROLL-TRIGGERED REVEAL ANIMATIONS
   ============================================= */
(function initReveal() {
  /* Cards */
  const cards = document.querySelectorAll(".glass-card");
  const cardObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute("data-delay") || 0;
          setTimeout(
            () => entry.target.classList.add("revealed"),
            parseInt(delay),
          );
          cardObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  cards.forEach((card) => cardObs.observe(card));

  /* Feature list items */
  const featureItems = document.querySelectorAll(".feature-item");
  const featureObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute("data-delay") || 0;
          setTimeout(
            () => entry.target.classList.add("revealed"),
            parseInt(delay),
          );
          featureObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -20px 0px" },
  );

  featureItems.forEach((item) => featureObs.observe(item));

  /* Generic scroll-reveal elements */
  const revealEls = document.querySelectorAll(".reveal-on-scroll");
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  revealEls.forEach((el) => revealObs.observe(el));

  /* Section header reveal */
  const headers = document.querySelectorAll(".section-header");
  const headerObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          headerObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  headers.forEach((h) => {
    h.style.opacity = "0";
    h.style.transform = "translateY(24px)";
    h.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    headerObs.observe(h);
  });
})();

/* =============================================
   6. CONTACT FORM — Validation & Submit
   ============================================= */
(function initForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    /* Basic validation */
    const name = form.querySelector("#userName");
    const email = form.querySelector("#userEmail");
    const msg = form.querySelector("#userMsg");
    let valid = true;

    [name, email, msg].forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "rgba(255,100,100,0.7)";
        field.style.boxShadow = "0 0 0 3px rgba(255,100,100,0.1)";
        valid = false;
      } else {
        field.style.borderColor = "";
        field.style.boxShadow = "";
      }
    });

    /* Email format check */
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = "rgba(255,100,100,0.7)";
      valid = false;
    }

    if (!valid) return;

    /* Simulate send */
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.innerHTML =
      '<span class="material-icons-outlined" aria-hidden="true">hourglass_empty</span> Sending…';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.style.opacity = "";
      btn.innerHTML =
        '<span class="material-icons-outlined" aria-hidden="true">send</span> Send Message';
      success.hidden = false;
      success.style.animation = "heroReveal 0.4s ease forwards";
      setTimeout(() => {
        success.hidden = true;
      }, 5000);
    }, 1400);
  });

  /* Live border-reset on input */
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      field.style.borderColor = "";
      field.style.boxShadow = "";
    });
  });
})();

/* =============================================
   7. FOOTER — Current year
   ============================================= */
(function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

/* =============================================
   8. ACTIVE NAV LINK — Highlight on scroll
   ============================================= */
(function initActiveNav() {
  const sections = document.querySelectorAll("section[id], footer[id]");
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.style.color = "";
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.style.color = "var(--white)";
            }
          });
        }
      });
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
  );

  sections.forEach((s) => obs.observe(s));
})();
