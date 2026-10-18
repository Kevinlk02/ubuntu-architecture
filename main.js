/* Les données des projets sont dans projets.js */
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ext = (p, small) => p.startsWith('img/illus') ? `${p}${small ? '-s' : ''}.webp` : `${p}${small ? '-s' : ''}.webp`;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const hasGsap = !!window.gsap;
const desktop = () => window.matchMedia('(min-width: 901px)').matches;

/* ============ BUILD: horizontal cards + index ============ */
const track = $('#hsTrack');
// left (% of track), vertical offset (% of card), rotation — computed for any number of projects
const ROT = [-6, 5, -3, 7, -5, 4];
const layout = PROJECTS.map((_, i, a) => [
  5 + i * (78 / Math.max(1, a.length - 1)),
  i % 2 ? -8 : -92,
  ROT[i % ROT.length]
]);
const WORDS = ['Zéro', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze'];
document.querySelectorAll('[data-projets-count]').forEach(el => el.dataset.count = PROJECTS.length);
document.querySelectorAll('[data-projets-mot]').forEach(el => el.textContent = (WORDS[PROJECTS.length] || PROJECTS.length) + ' lieux,');
PROJECTS.forEach((p, i) => {
  const [l, y, r] = layout[i];
  const a = document.createElement('a');
  a.className = 'hs-card';
  a.dataset.project = p.id;
  a.style.left = l + '%';
  a.style.marginTop = (y / 100 * 0.75) * 24 + 'vw';
  a.innerHTML = `<div class="hc-in" style="transform:rotate(${Number(r)}deg)"><img src="${esc(ext(p.cover, true))}" alt="${esc(p.name)}" loading="lazy"></div>
    <span class="tag">${esc(p.name)}</span><span class="hc-n">0${i + 1}</span>`;
  track.appendChild(a);
});
const list = $('#indexList');
PROJECTS.forEach((p, i) => {
  const li = document.createElement('li');
  li.dataset.project = p.id;
  li.dataset.img = ext(p.cover, true);
  li.innerHTML = `<span class="il-n">0${i + 1}</span><span class="il-name">${esc(p.name)}</span><span class="il-type">${esc(p.type)}</span><span class="il-arrow">→</span>`;
  list.appendChild(li);
});

/* ============ SMOOTH SCROLL ============ */
let lenis = null;
if (window.Lenis) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  if (hasGsap) {
    lenis.on('scroll', () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  lenis.stop();
}
const scrollToEl = el => lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' });
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const el = $(id);
  if (!el) return;
  e.preventDefault();
  closeMenu();
  scrollToEl(el);
}));

/* ============ NAV ============ */
const nav = $('#nav');
let lastY = 0;
const onScroll = y => {
  nav.classList.toggle('scrolled', y > 40);
  nav.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
  lastY = y;
};
if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY));
const burger = $('#burger'), mnav = $('#mnav');
function closeMenu() { burger.classList.remove('on'); mnav.classList.remove('on'); document.body.classList.remove('menu-open'); }
burger.addEventListener('click', () => {
  const on = !mnav.classList.contains('on');
  burger.classList.toggle('on', on); mnav.classList.toggle('on', on); document.body.classList.toggle('menu-open', on);
});

/* ============ CURSOR ============ */
const cursor = $('#cursor');
let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
(function loop() {
  cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
  cursor.style.transform = `translate(${cx}px,${cy}px)`;
  requestAnimationFrame(loop);
})();
document.addEventListener('pointerover', e => {
  cursor.classList.toggle('big', !!e.target.closest('[data-project], .proj-gallery figure'));
});

/* ============ INDEX PREVIEW ============ */
const prev = $('#indexPreview'), prevImg = $('img', prev);
let px = 0, py = 0, tx = 0, ty = 0;
list.addEventListener('pointerover', e => {
  const li = e.target.closest('li'); if (!li) return;
  if (prevImg.getAttribute('src') !== li.dataset.img) prevImg.src = li.dataset.img;
  prev.classList.add('on');
});
list.addEventListener('pointerleave', () => prev.classList.remove('on'));
const checkPreview = () => {
  const el = document.elementFromPoint(mx, my);
  if (!el || !el.closest('.index-list li')) prev.classList.remove('on');
};
if (lenis) lenis.on('scroll', checkPreview); else addEventListener('scroll', checkPreview);
addEventListener('pointermove', e => { tx = e.clientX + 30; ty = e.clientY - 120; });
(function pl() {
  px += (tx - px) * 0.12; py += (ty - py) * 0.12;
  prev.style.left = px + 'px'; prev.style.top = py + 'px';
  requestAnimationFrame(pl);
})();

/* ============ PROJECT OVERLAY ============ */
const proj = $('#proj'), projInner = $('#projInner');
proj.setAttribute('data-lenis-prevent', '');
function openProject(id) {
  const i = PROJECTS.findIndex(p => p.id === id);
  if (i < 0) return;
  const p = PROJECTS[i], next = PROJECTS[(i + 1) % PROJECTS.length];
  $('#pType').textContent = p.type;
  $('#pName').textContent = p.name;
  $('#pNum').textContent = `Projet 0${i + 1} / 0${PROJECTS.length}`;
  $('#pCover').src = ext(p.cover);
  $('#pCover').alt = p.name;
  $('#pDesc').textContent = p.desc;
  const imgs = [...p.images.filter(x => x !== p.cover).map(x => ({ src: x })), ...p.illus.filter(x => x !== p.cover).map(x => ({ src: x, illus: true }))];
  $('#pGallery').innerHTML = imgs.map(o =>
    `<figure class="${o.illus ? 'illus' : ''}" data-full="${esc(ext(o.src))}"><img src="${esc(ext(o.src, true))}" alt="${esc(p.name)}" loading="lazy"></figure>`).join('');
  $('b', $('#pNext')).textContent = next.name + ' →';
  $('#pNext').dataset.next = next.id;
  proj.scrollTop = 0;
  proj.classList.add('on');
  proj.setAttribute('aria-hidden', 'false');
  lenis && lenis.stop();
  document.body.style.overflow = 'hidden';
  if (hasGsap) {
    gsap.fromTo('#pName', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, delay: .45, ease: 'expo.out' });
    gsap.fromTo('.proj-cover img', { scale: 1.25 }, { scale: 1, duration: 1.8, delay: .3, ease: 'expo.out' });
  }
  try { history.replaceState(null, '', '#' + p.id); } catch (e) {}
}
function closeProject() {
  proj.classList.remove('on');
  proj.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lenis && lenis.start();
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-project]');
  if (t && !proj.contains(t)) { e.preventDefault(); openProject(t.dataset.project); }
});
$('#projClose').addEventListener('click', closeProject);
$('#pNext').addEventListener('click', () => {
  proj.classList.remove('on');
  setTimeout(() => openProject($('#pNext').dataset.next), 700);
});
const lb = $('#lightbox');
$('#pGallery').addEventListener('click', e => {
  const f = e.target.closest('figure'); if (!f) return;
  $('img', lb).src = f.dataset.full; lb.classList.add('on');
});
lb.addEventListener('click', () => lb.classList.remove('on'));
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (lb.classList.contains('on')) lb.classList.remove('on');
  else if (proj.classList.contains('on')) closeProject();
});

/* ============ SKETCH → RENDER COMPARE ============ */
const cmp = $('#compare'), cmpB = $('.cmp-b', cmp), cmpH = $('.cmp-handle', cmp);
function setPair(i) {
  $('.cmp-a', cmp).src = ext(S2R[i].render);
  $('img', cmpB).src = ext(S2R[i].illus);
  $$('#s2rTabs button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
}
function setSplit(pct) {
  pct = Math.max(0, Math.min(100, pct));
  cmpB.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  cmpH.style.left = pct + '%';
}
setPair(0); setSplit(50);
$('#s2rTabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  setPair(+b.dataset.i);
  if (hasGsap) { const o = { v: 100 }; gsap.to(o, { v: 50, duration: 1.2, ease: 'expo.out', onUpdate: () => setSplit(o.v) }); }
});
let dragging = false;
const dragTo = e => { const r = cmp.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width * 100); };
cmp.addEventListener('pointerdown', e => { dragging = true; cmp.setPointerCapture(e.pointerId); dragTo(e); });
cmp.addEventListener('pointermove', e => dragging && dragTo(e));
cmp.addEventListener('pointerup', () => dragging = false);

/* ============ WORD SPLIT ============ */
$$('.reveal-words').forEach(el => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${esc(w)}</span>`).join(' ');
});

/* ============ LOADER + INTRO ============ */
const loader = $('#loader');
const sub = $('.b-sub', loader);
sub.innerHTML = [...sub.textContent].map(c => `<span class="ch">${esc(c)}</span>`).join('');

function preload(srcs) {
  let done = 0;
  return srcs.map(s => new Promise(res => {
    const im = new Image(); im.onload = im.onerror = () => { done++; res(); }; im.src = s;
  }));
}
const heroImgs = $$('.strip img').map(i => i.src).concat(['img/mask.png']);

if (!hasGsap) {
  loader.remove(); addEventListener("hero3d:ready", () => window.HERO3D.intro(), { once: true }); window.HERO3D && window.HERO3D.intro();
  document.body.classList.remove('is-loading');
  lenis && lenis.start();
  $$('.reveal-words .w').forEach(w => w.style.opacity = 1);
  $$('[data-count]').forEach(b => b.textContent = b.dataset.count);
} else {
  gsap.registerPlugin(ScrollTrigger);
  const counter = $('#count');
  const prog = { v: 0 };
  let loaded = 0;
  const ps = preload(heroImgs);
  ps.forEach(p => p.then(() => { loaded++; }));

  // prepare construction lines for "drawing"
  $$('.c-lines > *', loader).forEach(el => {
    const len = el.getTotalLength ? el.getTotalLength() : 1200;
    el.style.strokeDasharray = len; el.style.strokeDashoffset = len;
  });

  gsap.set('#loaderBrand .b-left .b-txt', { xPercent: 105 });
  gsap.set('#loaderBrand .b-right .b-txt', { xPercent: -105 });
  gsap.set('#loaderBrand .b-sub .ch', { yPercent: 120, opacity: 0 });
  gsap.set('#loaderBrand .b-mask', { opacity: 0, scale: 1.5, filter: 'blur(18px)' });
  gsap.set('.hero-title .line > span', { yPercent: 110 });
  gsap.set('.strip-item', { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(['.hero-meta', '.hero-row', '.nav'], { opacity: 0 });

  const isPhone = matchMedia('(max-width: 900px)').matches;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (isPhone) tl.timeScale(1.7); // shorter intro on phones
  tl.to('.c-lines > *', { strokeDashoffset: 0, duration: 1.6, stagger: .08, ease: 'power2.inOut' }, 0)
    .to('.c-dash > *', { opacity: .9, duration: .8, stagger: .1, ease: 'power1.out' }, .3)
    .fromTo('.c-dash > *', { rotation: -25, scale: .7, transformOrigin: '500px 300px' }, { rotation: 0, scale: 1, duration: 2, stagger: .1 }, .3)
    .to('#loaderBrand .b-mask', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4 }, .8)
    .to('#loaderBrand .b-left .b-txt', { xPercent: 0, duration: 1.3, ease: 'expo.inOut' }, 1.5)
    .to('#loaderBrand .b-right .b-txt', { xPercent: 0, duration: 1.3, ease: 'expo.inOut' }, 1.5)
    .to('#loaderBrand .b-sub .ch', { yPercent: 0, opacity: 1, duration: .8, stagger: .03 }, 2.4)
    .to('.c-dash > *', { opacity: .35, duration: 1 }, 2.4)
    .to(prog, { v: 1, duration: 3.1, ease: 'none', onUpdate: () => {
      const real = loaded / heroImgs.length;
      counter.textContent = String(Math.round(Math.min(prog.v, real * 0.9 + 0.1) * 100)).padStart(3, '0');
    } }, 0);

  // wait for the 3D module (max 3 s) so the 2D mask can turn into the 3D object
  const ready3d = new Promise(r => {
    if (window.HERO3D) return r(true);
    addEventListener('hero3d:ready', () => r(true), { once: true });
    setTimeout(() => r(false), isPhone ? 1500 : 3000);
  });
  Promise.all([Promise.all(ps), new Promise(r => tl.eventCallback('onComplete', r)), ready3d]).then(([, , has3d]) => {
    counter.textContent = '100';
    const finish = () => {
      document.body.classList.remove('is-loading'); lenis && lenis.start(); loader.remove();
      if (location.hash.length > 1) openProject(location.hash.slice(1));
    };
    const revealHero = (tlx, at) => tlx
      .to('.hero-title .line > span', { yPercent: 0, duration: 1.4, stagger: .1, ease: 'expo.out' }, at)
      .to(['.nav', '.hero-meta', '.hero-row'], { opacity: 1, duration: 1, stagger: .1, ease: 'power2.out' }, at + .3)
      .to('.strip-item', { clipPath: 'inset(0% 0 0 0)', duration: 1.4, stagger: .08, ease: 'expo.inOut' }, at + .2);
    const out = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
    if (isPhone) out.timeScale(1.4);

    if (has3d && window.HERO3D) {
      // 2D mask -> 3D mask, same spot; letters slide back behind it; then it flies to the hero
      const m2d = $('#loaderBrand .b-mask');
      out.add(() => { document.body.classList.add('morphing'); window.HERO3D.morph(m2d.getBoundingClientRect()); }, 0)
        .to(m2d, { opacity: 0, duration: .3, ease: 'power1.out' }, .08)
        .to('#loaderBrand .b-sub .ch', { yPercent: 120, opacity: 0, duration: .5, stagger: .02, ease: 'power2.in' }, .1)
        .to('#loaderBrand .b-left .b-txt', { xPercent: 105, duration: 1 }, .3)
        .to('#loaderBrand .b-right .b-txt', { xPercent: -105, duration: 1 }, .3)
        .to('.construct', { opacity: 0, duration: .9, ease: 'power1.out' }, .2)
        .to('.loader-foot', { opacity: 0, duration: .4 }, .1)
        .add(() => window.HERO3D.release(), 1.25)
        .to(loader, { opacity: 0, duration: .6, ease: 'power1.out' }, 1.3)
        .add(finish, 1.95)
        .add(() => document.body.classList.remove('morphing'), 3.0);
      revealHero(out, 2.0);
    } else {
      out.to('.construct', { opacity: 0, scale: 1.2, duration: 1 }, .2)
        .to('.loader-foot', { opacity: 0, duration: .5 }, .2)
        .to('#loaderBrand', { scale: .9, opacity: 0, filter: 'blur(10px)', duration: 1 }, .5)
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.2 }, .9)
        .add(() => { finish(); window.HERO3D ? window.HERO3D.intro() : addEventListener('hero3d:ready', () => window.HERO3D.intro(), { once: true }); });
      revealHero(out, 1.3);
    }
  });

  /* ---- scroll animations ---- */
  // manifesto words
  const words = $$('.reveal-words .w');
  ScrollTrigger.create({
    trigger: '.manifesto-text', start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.style.opacity = i < n ? 1 : .14); }
  });
  gsap.from('.manifesto-title', { yPercent: 30, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto-title', start: 'top 85%' } });

  // count-up
  $$('[data-count]').forEach(b => {
    const o = { v: 0 };
    gsap.to(o, { v: +b.dataset.count, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 90%' }, onUpdate: () => b.textContent = Math.round(o.v) });
  });

  // section titles rise
  $$('.sec-title, .cta-title').forEach(t => gsap.from(t, { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 88%' } }));
  $$('.index-list li, .tl-row, .services li').forEach(r => gsap.from(r, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 92%' } }));

  // parallax images
  $$('.p-img img').forEach(img => gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } }));
  gsap.fromTo('.quote-bg img', { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.quote', scrub: true } });
  gsap.from('.quote p', { opacity: 0, y: 80, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.quote', start: 'top 60%' } });
  gsap.fromTo('.cta-word', { backgroundPosition: '50% 0%' }, { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: '.cta', scrub: true } });
  gsap.from('.cta-word', { yPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.cta', start: 'top 75%' } });
  gsap.fromTo('.compare', { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.compare', start: 'top 95%', end: 'top 35%', scrub: true } });

  // hero: 3D mask turns away and content fades as you scroll out
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: s => { window.HERO3D && window.HERO3D.setScroll(s.progress); }
  });
  gsap.to('.hero-inner', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true } });

  // nav switches to light text over dark sections
  const darkTriggers = $$('[data-dark]').map(sec => ScrollTrigger.create({
    trigger: sec, start: 'top 40px', end: 'bottom 40px',
    onToggle: () => nav.classList.toggle('nav--dark', darkTriggers.some(t => t.isActive))
  }));

  // horizontal PROJETS section (desktop)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const dist = () => track.scrollWidth - innerWidth;
    const hs = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.hscroll', pin: true, scrub: 1, end: () => '+=' + dist(), invalidateOnRefresh: true, anticipatePin: 1 }
    });
    $$('.hs-card', track).forEach((c, i) => {
      gsap.fromTo(c, { yPercent: i % 2 ? 25 : -25 }, {
        yPercent: i % 2 ? -25 : 25, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: hs, start: 'left right', end: 'right left', scrub: true }
      });
      gsap.fromTo($('.hc-in', c), { rotation: layout[i][2] * 2 }, {
        rotation: -layout[i][2], ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: hs, start: 'left right', end: 'right left', scrub: true }
      });
    });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}

/* ============ CONTACTS (assemblés ici pour ne pas apparaître en clair dans le code source) ============ */
const CONTACT = (() => {
  const u = ['kko', 'uawo'].join(''), d = ['gmail', 'com'].join('.');
  const n = ['228', '91', '96', '56', '18'];
  return { mail: u + '@' + d, telShow: '+' + n.join(' '), tel: '+' + n.join(''), wa: n.join('') };
})();
document.querySelectorAll('[data-contact]').forEach(a => {
  const k = a.dataset.contact;
  if (k === 'mail' || k === 'mail-cta') a.href = 'mailto:' + CONTACT.mail + (k === 'mail-cta' ? '?subject=' + encodeURIComponent('Nouveau projet') : '');
  if (k === 'mail') a.querySelector('b').textContent = CONTACT.mail;
  if (k === 'tel') { a.href = 'tel:' + CONTACT.tel; a.querySelector('b').textContent = CONTACT.telShow; }
  if (k === 'wa') a.href = 'https://wa.me/' + CONTACT.wa;
});
document.querySelectorAll('[data-copy-contact]').forEach(b => { b.dataset.copy = b.dataset.copyContact === 'mail' ? CONTACT.mail : CONTACT.telShow; });

/* ============ COPY CONTACT ============ */
document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
  const done = () => { b.textContent = 'Copié ✓'; setTimeout(() => b.textContent = 'Copier', 1800); };
  const fallback = () => {
    const t = b.previousElementSibling; const r = document.createRange(); r.selectNodeContents(t);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Sélectionné';
  };
  try { navigator.clipboard.writeText(b.dataset.copy).then(done, fallback); } catch (e) { fallback(); }
}));

/* ============ GLASS LENS (hero) ============ */
(() => {
  const lensEl = document.getElementById('lens'), hero = document.querySelector('.hero');
  if (!lensEl || !hero || matchMedia('(hover: none)').matches) return;
  let lx = 0, ly = 0, tx2 = 0, ty2 = 0, on = false;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect(); tx2 = e.clientX - r.left; ty2 = e.clientY - r.top;
    if (!on) { lx = tx2; ly = ty2; on = true; lensEl.classList.add('on'); }
  });
  hero.addEventListener('pointerleave', () => { on = false; lensEl.classList.remove('on'); });
  (function step() {
    lx += (tx2 - lx) * 0.14; ly += (ty2 - ly) * 0.14;
    lensEl.style.transform = `translate(${lx}px,${ly}px)`;
    requestAnimationFrame(step);
  })();
})();

/* ============ STACKED CARDS (savoir-faire) ============ */
(() => {
  const stack = document.getElementById('stack'); if (!stack) return;
  const cards = [...stack.children], n = cards.length, dots = document.getElementById('stackDots');
  let cur = 0, timer = null;
  cards.forEach((_, i) => {
    const b = document.createElement('button'); b.setAttribute('aria-label', 'Carte ' + (i + 1));
    b.addEventListener('click', () => go(i)); dots.appendChild(b);
  });
  function render() {
    cards.forEach((c, k) => {
      const d = (k - cur + n) % n;
      c.style.zIndex = n - d;
      c.style.transform = `translate(${d * 22}px, ${-d * 22}px) scale(${1 - d * 0.05})`;
      c.style.opacity = d > 3 ? 0 : 1 - d * 0.12;
      c.style.filter = `brightness(${1 - d * 0.2})`;
      c.setAttribute('aria-hidden', d !== 0);
    });
    [...dots.children].forEach((b, i) => b.classList.toggle('on', i === cur));
  }
  function go(i) { cur = (i + n) % n; render(); restart(); }
  function restart() {
    clearInterval(timer);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => { cur = (cur + 1) % n; render(); }, 4500);
  }
  document.getElementById('stackNext').addEventListener('click', () => go(cur + 1));
  document.getElementById('stackPrev').addEventListener('click', () => go(cur - 1));
  // swipe left / right on touch screens
  let sx = null, swiped = false;
  stack.addEventListener('touchstart', e => { sx = e.touches[0].clientX; swiped = false; }, { passive: true });
  stack.addEventListener('touchend', e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { swiped = true; go(cur + (dx < 0 ? 1 : -1)); }
  });
  stack.addEventListener('click', () => { if (swiped) { swiped = false; return; } go(cur + 1); });
  stack.addEventListener('pointerenter', () => clearInterval(timer));
  stack.addEventListener('pointerleave', restart);
  render(); restart();
})();

/* ============ FONDATEURS ============ */
(() => {
  const box = document.getElementById('teamList');
  if (!box || typeof FONDATEURS === 'undefined') return;
  box.innerHTML = FONDATEURS.map((f, i) => `
    <article class="member${i % 2 ? ' member--alt' : ''}">
      <figure class="member-photo"><img src="${esc(f.photo)}" alt="Portrait de ${esc(f.nom)}" loading="lazy"></figure>
      <div class="member-text">
        <blockquote class="member-quote">« ${esc(f.citation)} »</blockquote>
        <div class="member-id">
          <h3>${esc(f.nom)}</h3>
          <span class="mono">${esc(f.role)}</span>
        </div>
        <p>${esc(f.bio)}</p>
      </div>
    </article>`).join('');
  if (window.gsap && window.ScrollTrigger) {
    box.querySelectorAll('.member').forEach(m => {
      gsap.fromTo(m.querySelector('.member-photo'), { clipPath: 'inset(18% 18% 18% 18%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: m, start: 'top 90%', end: 'top 40%', scrub: true } });
      gsap.fromTo(m.querySelector('img'), { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }
})();
