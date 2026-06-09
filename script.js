/* ==============================================
   BOSKES — Harvard UX Storyscrolling Engine
   All GSAP + ScrollTrigger animation logic
   ============================================== */

gsap.registerPlugin(ScrollTrigger);

// Don't let the mobile URL-bar show/hide trigger ScrollTrigger refreshes (prevents jumps)
ScrollTrigger.config({ ignoreMobileResize: true });

// ── LENIS SMOOTH SCROLL ──────────────────────────
const lenis = new Lenis({
    duration: 1.05,                  /* snappier than before — less floaty */
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  /* natural decel */
    smoothWheel: true,               /* smooth on desktop wheel/trackpad */
    syncTouch: false,                /* native scroll on touch — far more reliable with pinned sections */
    wheelMultiplier: 1.0,            /* standard sensitivity */
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ── NAVBAR: glass effect on scroll ───────────────
const navbar = document.getElementById('navbar');
if (navbar) {
    lenis.on('scroll', ({ scroll }) => {
        navbar.classList.toggle('scrolled', scroll > 60);
    });
    // Also handle anchor clicks for Lenis smooth navigation
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) lenis.scrollTo(target, { offset: -20, duration: 1.8, easing: t => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2 });
        });
    });
}

// ── SETUP: CENTER ALL HERO FRAMES ────────────────
gsap.set('.frame', { xPercent: -50, yPercent: -50, autoAlpha: 0 });
gsap.set('.frame-3', { y: 60 });   /* frame-3 starts below center so it never overlaps logo */
gsap.set('.scroll-indicator', { autoAlpha: 0, y: 20 });

// ── 1. HERO INTRO ─────────────────────────────────
const heroTl = gsap.timeline({ delay: 0.2 });

heroTl
    .fromTo('.frame-1',
        { autoAlpha: 0, y: 60, scale: 0.92, filter: 'blur(14px)' },
        { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'power4.out' }
    )
    .to('.scroll-indicator',
        { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out' },
        '-=0.8'
    );

// ── 2. HERO MOUSE PARALLAX ─────────────────────────
const heroPinned = document.querySelector('.hero-pinned');
const logoFrame  = document.querySelector('.frame-logo');

if (heroPinned && logoFrame) {
    // quickTo: butter-smooth logo tilt AND background parallax restored
    const bgXTo   = gsap.quickTo(heroPinned, 'backgroundPositionX', { duration: 2.5, ease: 'power2.out' });
    const bgYTo   = gsap.quickTo(heroPinned, 'backgroundPositionY', { duration: 2.5, ease: 'power2.out' });
    const logoXTo = gsap.quickTo(logoFrame, 'xPercent', { duration: 1.4, ease: 'power3.out' });
    const logoYTo = gsap.quickTo(logoFrame, 'yPercent', { duration: 1.4, ease: 'power3.out' });
    const rotYTo  = gsap.quickTo(logoFrame, 'rotationY', { duration: 1.4, ease: 'power3.out' });
    const rotXTo  = gsap.quickTo(logoFrame, 'rotationX', { duration: 1.4, ease: 'power3.out' });

    heroPinned.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth  - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        bgXTo(`${50 + x * -3}%`);
        bgYTo(`${50 + y * -3}%`);
        logoXTo(-50 + x * 4);
        logoYTo(-50 + y * 4);
        rotYTo(x * 6);
        rotXTo(y * -6);
    });

    heroPinned.addEventListener('mouseleave', () => {
        bgXTo('50%'); bgYTo('50%');
        logoXTo(-50); logoYTo(-50);
        rotYTo(0);    rotXTo(0);
    });
}

// ── 3. HERO SCROLL STORY ──────────────────────────
const heroScroll = gsap.timeline({
    scrollTrigger: {
        trigger: '.scrolly-hero',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,  /* Reduced to 1.0 to eliminate scroll-lag overlap entirely */
    }
});

// Beat 1: Logo + indicator fade out fully
heroScroll
    .to('.scroll-indicator', { autoAlpha: 0, y: -10, duration: 1 }, 0)
    .to('.frame-1', { autoAlpha: 0, y: -150, scale: 1.08, duration: 4 }, 0)

// VERY LARGE GAP: Beat 2 ONLY begins at timestamp 6.5 (2.5 seconds AFTER the logo has finished fading out at 4)
    .to('.frame-3', { autoAlpha: 1, y: 0, duration: 3.5 }, 6.5)

// Beat 3: Clean exit before next section
    .to('.frame-3', { autoAlpha: 0, y: -80, duration: 2 }, '+=2.5')
    .to('.hero-pinned', { autoAlpha: 0, duration: 2 }, '-=1.0');

// ── 4. ABOUT — STAGGER TEXT + IMAGE REVEAL ───────────
ScrollTrigger.create({
    trigger: '.about-story',
    start: 'top 55%',
    onEnter: () => {
        // Text block punch
        gsap.to('.split-text', {
            opacity: 1, y: 0,
            duration: 1.0, ease: 'expo.out'
        });
        // Each text child staggers
        gsap.from('.split-text > *', {
            opacity: 0, y: 24,
            stagger: 0.1,
            duration: 1.0, ease: 'expo.out',
            delay: 0.05
        });
        // Image curtain
        gsap.to('.image-clip', {
            clipPath: 'inset(0 0% 0 0)',
            scale: 1,
            duration: 1.8, ease: 'expo.inOut', delay: 0.1
        });
    }
});

// Parallax the about image as you scroll
gsap.to('.image-clip', {
    backgroundPositionY: '30%',
    ease: 'none',
    scrollTrigger: {
        trigger: '.about-story',
        start: 'top bottom', end: 'bottom top',
        scrub: true,
    }
});

// ── 5. SERVICES — PUNCHY STAGGERED ROWS ───────────
gsap.utils.toArray('.service-row').forEach((row, i) => {
    gsap.to(row, {
        opacity: 1, x: 0,
        duration: 1.0,
        ease: 'expo.out',
        delay: i * 0.1,
        scrollTrigger: {
            trigger: row,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
        },
    });
});

// ── 6. PORTFOLIO — HORIZONTAL SCROLL ─────────────
const portfolioTrack = document.querySelector('.portfolio-track');
const portfolioPinned = document.querySelector('.portfolio-pinned');

if (portfolioTrack && portfolioPinned) {
    // Calculate how far to scroll horizontally
    const getScrollAmount = () => {
        const trackWidth = portfolioTrack.scrollWidth;
        const viewWidth  = portfolioPinned.offsetWidth;
        return -(trackWidth - viewWidth + 14 * 24); // total slides width minus visible
    };

    gsap.to(portfolioTrack, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
            trigger: '.portfolio-story',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.0,                 /* tighter catch-up — less horizontal lag */
            invalidateOnRefresh: true,  /* recompute scroll distance on resize */
        }
    });

    // Subtle parallax depth: each image moves at slightly different speeds
    gsap.utils.toArray('.pslide-img').forEach((img, i) => {
        gsap.to(img, {
            backgroundPositionY: i % 2 === 0 ? '60%' : '40%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.portfolio-story',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
            }
        });
    });
}

// ── 7. STATEMENT — IMAGE PARALLAX + TEXT REVEAL ──
const stmtBg = document.querySelector('.statement-bg');
if (stmtBg) {
    gsap.fromTo(stmtBg,
        { scale: 1.12 },
        {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.statement-story',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            }
        }
    );
}

gsap.to('.statement-text', {
    opacity: 1, y: 0, duration: 1.6, ease: 'expo.out',
    scrollTrigger: {
        trigger: '.statement-story',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
    }
});

// ── 8. CONTACT ────────────────────────────────────
gsap.to('.contact-inner', {
    opacity: 1, y: 0, duration: 1.4, ease: 'expo.out',
    scrollTrigger: {
        trigger: '.contact-story',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
    }
});

// ── REFRESH ───────────────────────────────────────
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

/* ─────────────────────────────────────────────────
   HAMBURGER MENU
   Toggle mobile fullscreen overlay
───────────────────────────────────────────────── */
const burgerBtn  = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu(forceClose = false) {
    const isOpen = burgerBtn.classList.contains('open');
    if (forceClose || isOpen) {
        burgerBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Restore scroll
        lenis.start();                      // Resume smooth scroll
    } else {
        burgerBtn.classList.add('open');
        mobileMenu.classList.add('open');
        burgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Lock scroll while menu open
        lenis.stop();                            // Freeze background (also blocks touch scroll)
    }
}

if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => toggleMenu());

    // Close button inside the overlay
    const mobileClose = document.getElementById('mobileClose');
    if (mobileClose) mobileClose.addEventListener('click', () => toggleMenu(true));

    // Close menu + smooth scroll to section on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu(true); // Close first
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                // Small timeout to let menu close before scrolling
                setTimeout(() => {
                    lenis.scrollTo(target, {
                        offset: -20,
                        duration: 1.8,
                        easing: t => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2
                    });
                }, 300);
            }
        });
    });

    // Also close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleMenu(true);
    });
}



/* ─────────────────────────────────────────────────
   WOW #1: CURSOR LUMINOUS GLOW
   Ultra-smooth radial light follows the cursor
───────────────────────────────────────────────── */
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
    /* GSAP quickTo: ultra-smooth with generous lag for floaty feel */
    const xTo = gsap.quickTo(cursorGlow, 'x', { duration: 0.9, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursorGlow, 'y', { duration: 0.9, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });
}

/* ─────────────────────────────────────────────────
   WOW #2: SCROLL PROGRESS BAR
   Thin green line that fills as you scroll
───────────────────────────────────────────────── */
const scrollFill = document.getElementById('scrollFill');
if (scrollFill) {
    lenis.on('scroll', ({ progress }) => {
        scrollFill.style.height = `${progress * 100}%`;
    });
}

/* ─────────────────────────────────────────────────
   WOW #3: MAGNETIC SERVICE ROWS
   Rows subtly shift toward the cursor on hover
───────────────────────────────────────────────── */
document.querySelectorAll('.service-row').forEach((row) => {
    row.addEventListener('mousemove', (e) => {
        const rect = row.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
        gsap.to(row, { x, y, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
    });
    row.addEventListener('mouseleave', () => {
        gsap.to(row, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    });
});


/* ─────────────────────────────────────────────────
   WOW #4: SCROLL-SPY + DOT NAV + BACK-TO-TOP
   Highlights the active section across navbar & dots,
   reveals the side dots and the back-to-top control.
───────────────────────────────────────────────── */
const sectionIds = ['scrolly-hero', 'nosotros', 'servicios', 'proyectos', 'frase', 'contacto'];
const sections   = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);
const spyLinks   = document.querySelectorAll('[data-spy]');
const dotNav     = document.getElementById('dotNav');
const backToTop  = document.getElementById('backToTop');

let activeId = null;

function setActiveSection(id) {
    if (id === activeId) return;
    activeId = id;
    spyLinks.forEach(link => {
        const isActive = link.dataset.spy === id;
        link.classList.toggle('active', isActive);
        // aria-current marks the in-view section for assistive tech
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
    });
}

function updateNavState(scroll) {
    // Reference line at 45% of the viewport — the section crossing it is "active"
    const refLine = scroll + window.innerHeight * 0.45;
    let current = sections[0];
    for (const section of sections) {
        if (section.offsetTop <= refLine) current = section;
    }
    if (current) setActiveSection(current.id);

    // Reveal dots + back-to-top once the user leaves the hero
    const past = scroll > window.innerHeight * 0.6;
    if (dotNav)    dotNav.classList.toggle('visible', past);
    if (backToTop) backToTop.classList.toggle('visible', past);
}

// Drive it from Lenis so it stays in sync with the smooth scroll
lenis.on('scroll', ({ scroll }) => updateNavState(scroll));
// Initial paint (also after a refresh / resize recomputes offsets)
window.addEventListener('load', () => updateNavState(window.scrollY));
ScrollTrigger.addEventListener('refreshInit', () => updateNavState(window.scrollY));

// Back-to-top → smooth scroll to the very top
if (backToTop) {
    backToTop.addEventListener('click', () => {
        lenis.scrollTo(0, {
            duration: 1.8,
            easing: t => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2
        });
    });
}

