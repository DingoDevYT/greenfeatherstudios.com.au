document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        const setOpen = (open) => {
            navLinks.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', String(open));
        };

        navToggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));
        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false);
        });

        const spy = Array.from(navLinks.querySelectorAll('a[href^="#"]'))
            .map((link) => [link, document.querySelector(link.getAttribute('href'))])
            .filter(([, section]) => section);

        if (spy.length && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    spy.forEach(([link, section]) => link.classList.toggle('is-active', section === entry.target));
                });
            }, { rootMargin: '-45% 0px -50% 0px' });

            spy.forEach(([, section]) => observer.observe(section));
        }
    }

    document.querySelectorAll('.video[data-youtube]').forEach((box) => {
        const button = box.querySelector('.video-play');
        if (!button) return;

        button.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(box.dataset.youtube) + '?autoplay=1&rel=0';
            iframe.title = box.dataset.title || 'YouTube video';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            button.replaceWith(iframe);
            iframe.focus();
        });
    });

    const items = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('lightbox');

    if (items.length && lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        const count = document.getElementById('lightbox-count');
        const closeBtn = document.getElementById('lightbox-close');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');
        let index = 0;

        const render = () => {
            const img = items[index].querySelector('img');
            lightboxImg.src = img.currentSrc || img.src;
            lightboxImg.alt = img.alt;
            caption.textContent = img.dataset.caption || img.alt || '';
            count.textContent = (index + 1) + ' / ' + items.length;
        };

        const go = (step) => {
            index = (index + step + items.length) % items.length;
            render();
        };

        const open = (i) => {
            index = i;
            render();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        };

        const close = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            items[index].focus();
        };

        items.forEach((item, i) => item.addEventListener('click', () => open(i)));
        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', () => go(-1));
        nextBtn.addEventListener('click', () => go(1));

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
