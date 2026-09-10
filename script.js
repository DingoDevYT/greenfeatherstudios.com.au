document.addEventListener("DOMContentLoaded", () => {
    const observerElements = document.querySelectorAll('.hidden');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        observerElements.forEach((el) => observer.observe(el));
    } else {
        observerElements.forEach((el) => el.classList.add('show'));
    }

    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const TRAILER_ID = 'YG2Mr_RnnYg';

    const videoFacade = document.getElementById('video-facade');
    if (videoFacade) {
        const loadVideo = () => {
            videoFacade.innerHTML = '<iframe src="https://www.youtube.com/embed/' + TRAILER_ID + '?autoplay=1&rel=0" title="Windweaver Trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
            videoFacade.style.cursor = 'default';
        };
        videoFacade.addEventListener('click', loadVideo);
        videoFacade.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadVideo();
            }
        });
    }

    const LAUNCH = new Date('2026-09-11T16:30:00+09:30').getTime();
    const TAKEOVER_LEAD = 60000;
    const LIVE_HOLD = 30000;
    const STEAM_URL = 'https://store.steampowered.com/app/4012590/Windweaver/';
    const KS_URL = 'https://www.kickstarter.com/projects/windweaver/windweaver-0/';

    const params = new URLSearchParams(location.search);
    const offset = params.has('t') ? LAUNCH - Number(params.get('t')) * 1000 - Date.now()
        : params.has('live') ? LAUNCH + 3600000 - Date.now()
            : 0;
    const now = () => Date.now() + offset;

    document.querySelectorAll('.countdown').forEach((cd) => {
        let timer = null;
        const slots = {};
        cd.querySelectorAll('[data-cd]').forEach((el) => { slots[el.dataset.cd] = el; });

        const pad = (n) => String(n).padStart(2, '0');

        const tick = () => {
            const diff = LAUNCH - now();

            if (diff <= 0) {
                cd.classList.add('is-live');
                if (slots.days) slots.days.textContent = '0';
                if (slots.hours) slots.hours.textContent = '00';
                if (slots.minutes) slots.minutes.textContent = '00';
                if (slots.seconds) slots.seconds.textContent = '00';
                if (timer) clearInterval(timer);
                return;
            }

            const secs = Math.floor(diff / 1000);
            if (slots.days) slots.days.textContent = Math.floor(secs / 86400);
            if (slots.hours) slots.hours.textContent = pad(Math.floor(secs / 3600) % 24);
            if (slots.minutes) slots.minutes.textContent = pad(Math.floor(secs / 60) % 60);
            if (slots.seconds) slots.seconds.textContent = pad(secs % 60);
        };

        tick();
        if (LAUNCH - now() > 0) timer = setInterval(tick, 1000);
    });

    if (!isNaN(LAUNCH)) {
        let overlay = null;
        let dismissed = false;
        let shownSecond = null;
        let loop = null;

        const stop = () => { if (loop) { clearInterval(loop); loop = null; } };

        const dismiss = () => {
            dismissed = true;
            if (overlay) overlay.classList.remove('on', 'live', 'tense');
            document.body.style.overflow = '';
        };

        const build = () => {
            overlay = document.createElement('div');
            overlay.id = 'launch-takeover';
            overlay.innerHTML =
                '<div class="lt-inner">'
                + '<span class="lt-ring"></span><span class="lt-ring"></span><span class="lt-ring"></span>'
                + '<p class="lt-sub">The Windweaver demo drops in</p>'
                + '<div class="lt-count"><span class="chunk" data-text="60">60</span></div>'
                + '<div class="lt-live">'
                + '<span class="chunk chunk-sun" data-text="It\'s Live!">It\'s Live!</span>'
                + '<div class="btn-row">'
                + '<a href="' + STEAM_URL + '" target="_blank" rel="noopener" class="btn btn-steam"><svg aria-hidden="true"><use href="#i-steam"/></svg>Play the Demo</a>'
                + '<a href="' + KS_URL + '" target="_blank" rel="noopener" class="btn btn-kickstarter"><img src="assets/images/kickstarter-k.png" alt="">Back us on Kickstarter</a>'
                + '</div></div></div>'
                + '<button class="lt-close" type="button" aria-label="Dismiss">&times;</button>';
            document.body.appendChild(overlay);
            overlay.querySelector('.lt-close').addEventListener('click', dismiss);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
        };

        const frame = () => {
            if (dismissed) return;
            const diff = LAUNCH - now();

            if (diff > TAKEOVER_LEAD || diff <= -LIVE_HOLD) {
                if (overlay) overlay.classList.remove('on', 'live', 'tense');
                document.body.style.overflow = '';
                if (diff <= -LIVE_HOLD) stop();
                return;
            }

            if (!overlay) build();
            overlay.classList.add('on');
            document.body.style.overflow = 'hidden';

            if (diff > 0) {
                const secs = Math.ceil(diff / 1000);
                overlay.classList.remove('live');
                overlay.classList.toggle('tense', secs <= 10);
                if (secs !== shownSecond) {
                    shownSecond = secs;
                    const chunk = overlay.querySelector('.lt-count .chunk');
                    chunk.textContent = secs;
                    chunk.dataset.text = secs;
                    const box = overlay.querySelector('.lt-count');
                    box.style.animation = 'none';
                    void box.offsetWidth;
                    box.style.animation = '';
                }
            } else {
                overlay.classList.remove('tense');
                overlay.classList.add('live');
            }
        };

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss(); });
        frame();
        if (LAUNCH - now() > -LIVE_HOLD) loop = setInterval(frame, 250);
    }

    const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCount = document.getElementById('lightbox-count');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    if (galleryImages.length > 0 && lightbox) {
        let index = 0;

        const render = () => {
            const img = galleryImages[index];
            lightboxImg.src = img.currentSrc || img.src;
            lightboxImg.alt = img.alt;
            if (lightboxCaption) lightboxCaption.textContent = img.dataset.caption || img.alt || '';
            if (lightboxCount) lightboxCount.textContent = (index + 1) + ' / ' + galleryImages.length;
        };

        const go = (step) => {
            index = (index + step + galleryImages.length) % galleryImages.length;
            render();
        };

        const open = (i) => {
            index = i;
            render();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (lightboxClose) lightboxClose.focus();
        };

        const close = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        galleryImages.forEach((img, i) => {
            img.addEventListener('click', () => open(i));
        });

        if (lightboxClose) lightboxClose.addEventListener('click', close);
        if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
        if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); go(1); });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) close();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        });

        let touchX = null;
        lightbox.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX = null;
        }, { passive: true });
    }
});
