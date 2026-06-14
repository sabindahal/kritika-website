/* =========================================================
   Kritika Prasai — Personal Site · interactions
   ========================================================= */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Header state + scroll progress ---------- */
const header = document.getElementById("header");
const progress = document.getElementById("scrollProgress");

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 40);

  const docH = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + "%";

  document.getElementById("toTop").classList.toggle("show", y > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open);
});

/* ---------- Smooth scroll + close menu ---------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const id = this.getAttribute("href");
    if (id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", false);
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
});

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !prefersReduced) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger for siblings revealed together
          setTimeout(() => entry.target.classList.add("in"), Math.min(i * 60, 240));
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* ---------- Active nav highlighting ---------- */
const sectionIds = ["home", "about", "research", "publications", "experience", "awards", "contact"];
const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
const navAnchors = [...document.querySelectorAll(".nav-links a")];

if ("IntersectionObserver" in window) {
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { threshold: 0.5, rootMargin: "-30% 0px -50% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));
}

/* ---------- Animated counters ---------- */
const counters = document.querySelectorAll(".stat-num");
if ("IntersectionObserver" in window && !prefersReduced) {
  const cIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const isYear = target > 1900;
        const dur = 1400;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = isYear ? Math.round(val) : Math.round(val) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = (isYear ? target : target) + suffix;
        }
        requestAnimationFrame(tick);
        cIO.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => cIO.observe(c));
} else {
  counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
}

/* ---------- Hero protein-interaction network ---------- */
(function heroNetwork() {
  const canvas = document.getElementById("heroNetwork");
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext("2d");
  let w, h, dpr, nodes, raf;
  const mouse = { x: -9999, y: -9999 };

  const TEAL = "242,166,121";
  const VIOLET = "212,192,232";

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    const count = Math.round(Math.min(72, (w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.8 + 1.2,
    }));
  }

  const LINK = 135;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // gentle mouse repulsion
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 120 && d > 0) {
        n.x += (dx / d) * (120 - d) * 0.012;
        n.y += (dy / d) * (120 - d) * 0.012;
      }
    }

    // edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK) {
          const o = (1 - dist / LINK) * 0.32;
          const col = (i + j) % 5 === 0 ? VIOLET : TEAL;
          ctx.strokeStyle = `rgba(${col},${o})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${TEAL},0.85)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(size, 200);
  });

  size();
  cancelAnimationFrame(raf);
  frame();
})();
