// CRT-style boot screen: signal noise resolves into the wordmark, then collapses away.
(function initSiteLoader() {
    var loader = document.getElementById('siteLoader');
    var noise = document.getElementById('siteLoaderNoise');
    if (!loader) return;

    function isProjectReturn() {
        try {
            if (window.sessionStorage.getItem('skipHomeLoader') === 'true') {
                window.sessionStorage.removeItem('skipHomeLoader');
                return true;
            }
        } catch (storageError) {
            // Continue with navigation/referrer detection when storage is unavailable.
        }

        var navigation = window.performance &&
            window.performance.getEntriesByType &&
            window.performance.getEntriesByType('navigation')[0];
        if (navigation && navigation.type === 'back_forward') return true;
        if (!document.referrer) return false;

        try {
            var referrer = new URL(document.referrer);
            var current = new URL(window.location.href);
            var projectPages = [
                '/dag.html',
                '/genai-registry.html',
                '/rai-checker.html'
            ];
            var cameFromThisSite = referrer.origin === current.origin;
            var cameFromProject = projectPages.some(function (page) {
                return referrer.pathname.endsWith(page);
            });
            return cameFromThisSite && cameFromProject;
        } catch (error) {
            return false;
        }
    }

    if (isProjectReturn()) {
        document.body.classList.remove('is-loading');
        loader.remove();
        return;
    }

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var startedAt = Date.now();
    var noiseTimer = 0;
    var noiseGlyphs = '01{}[]<>/\\|=+*:. ';
    var revealed = false;

    function drawNoise() {
        if (!noise || reduceMotion) return;
        // Intentionally overfill both axes: font metrics and letter-spacing vary
        // slightly by browser, and the noise layer clips any excess.
        var columns = Math.ceil((loader.clientWidth + 64) / 5);
        var rows = Math.ceil((loader.clientHeight + 64) / 9);
        var count = columns * rows;
        var output = '';
        var index;

        for (index = 0; index < count; index += 1) {
            var showGlyph = Math.random() > 0.73;
            output += showGlyph ?
                noiseGlyphs.charAt(Math.floor(Math.random() * noiseGlyphs.length)) :
                ' ';
            if ((index + 1) % columns === 0) output += '\n';
        }
        noise.textContent = output;
    }

    function reveal() {
        if (revealed) return;
        revealed = true;
        window.clearInterval(noiseTimer);
        window.removeEventListener('resize', drawNoise);
        loader.classList.add('is-leaving');

        window.setTimeout(function () {
            document.body.classList.remove('is-loading');
            loader.remove();
        }, reduceMotion ? 220 : 620);
    }

    function revealAfterMinimum() {
        var minimum = reduceMotion ? 120 : 1150;
        var remaining = Math.max(0, minimum - (Date.now() - startedAt));
        window.setTimeout(reveal, remaining);
    }

    drawNoise();
    if (!reduceMotion) {
        noiseTimer = window.setInterval(drawNoise, 90);
        window.addEventListener('resize', drawNoise, { passive: true });
    }

    if (document.readyState === 'complete') {
        revealAfterMinimum();
    } else {
        window.addEventListener('load', revealAfterMinimum, { once: true });
        window.setTimeout(reveal, reduceMotion ? 500 : 2600);
    }
})();

// Project-page wordmark returns to home without replaying the boot sequence.
(function markProjectLogoReturn() {
    var homeLogo = document.querySelector('a.header-title[href$="index.html"]');
    if (!homeLogo) return;

    homeLogo.addEventListener('click', function () {
        try {
            window.sessionStorage.setItem('skipHomeLoader', 'true');
        } catch (storageError) {
            // Referrer detection in initSiteLoader remains as the fallback.
        }
    });
})();

// Custom cursor: difference-blend rings, scales on links (no GSAP)
(function initCustomCursor() {
    function shouldSkip() {
        if (!window.matchMedia) {
            return true;
        }
        if (window.matchMedia('(pointer: coarse)').matches) {
            return true;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return true;
        }
        return false;
    }

    function setup() {
        if (shouldSkip()) {
            return;
        }

        var root = document.createElement('div');
        root.className = 'custom-cursor';
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML =
            '<div class="custom-cursor__ball custom-cursor__ball--big">' +
            '<div class="custom-cursor__ball-core">' +
            '<svg width="30" height="30" aria-hidden="true" focusable="false">' +
            '<circle cx="15" cy="15" r="12"></circle></svg></div></div>' +
            '<div class="custom-cursor__ball custom-cursor__ball--small">' +
            '<svg width="10" height="10" aria-hidden="true" focusable="false">' +
            '<circle cx="5" cy="5" r="4"></circle></svg></div>';

        document.body.appendChild(root);
        document.body.classList.add('custom-cursor--active');

        var bigOuter = root.querySelector('.custom-cursor__ball--big');
        var smallBall = root.querySelector('.custom-cursor__ball--small');
        var mx = -100;
        var my = -100;
        var bx = -100;
        var by = -100;
        var sx = -100;
        var sy = -100;
        var kBig = 0.22;
        var kSmall = 0.55;
        var hasMoved = false;

        function tick() {
            bx += (mx - 15 - bx) * kBig;
            by += (my - 15 - by) * kBig;
            sx += (mx - 5 - sx) * kSmall;
            sy += (my - 7 - sy) * kSmall;
            bigOuter.style.transform = 'translate3d(' + bx + 'px,' + by + 'px,0)';
            smallBall.style.transform = 'translate3d(' + sx + 'px,' + sy + 'px,0)';
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);

        document.addEventListener(
            'mousemove',
            function (e) {
                mx = e.clientX;
                my = e.clientY;
                hasMoved = true;
                root.classList.add('is-visible');
            },
            { passive: true }
        );

        document.documentElement.addEventListener('mouseleave', function () {
            root.classList.remove('is-visible');
        });

        document.documentElement.addEventListener('mouseenter', function () {
            if (hasMoved) {
                root.classList.add('is-visible');
            }
        });

        var coreEl = root.querySelector('.custom-cursor__ball--big .custom-cursor__ball-core');

        var zoomLabel = document.createElement('span');
        zoomLabel.className = 'custom-cursor__zoom-label';
        zoomLabel.textContent = '+';
        coreEl.appendChild(zoomLabel);

        var hoverLabel = document.createElement('span');
        hoverLabel.className = 'custom-cursor__hover-label';
        hoverLabel.textContent = '\u2197';
        coreEl.appendChild(hoverLabel);

        var hoverSelector =
            'a, button, .project-card, input[type="submit"], input[type="button"], input[type="reset"], summary';
        var zoomSelector = '.project-main img:not(.project-header-image)';

        document.addEventListener('mouseover', function (e) {
            var t = e.target;
            if (t.closest && t.closest(zoomSelector)) {
                root.classList.add('is-zoom');
            } else if (t.closest && t.closest(hoverSelector)) {
                root.classList.add('is-hover');
            }
        });

        document.addEventListener('mouseout', function (e) {
            var from = e.target;
            var to = e.relatedTarget;

            var fromZoom = from.closest && from.closest(zoomSelector);
            if (fromZoom) {
                if (to && fromZoom.contains(to)) return;
                root.classList.remove('is-zoom');
                return;
            }

            var fromMatch = from.closest && from.closest(hoverSelector);
            if (!fromMatch) {
                return;
            }
            if (to && fromMatch.contains(to)) {
                return;
            }
            root.classList.remove('is-hover');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();

// Navigation and interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for any internal links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const projectMain = document.querySelector('.project-main');
    if (projectMain) {
        const revealSelector =
            '.project-section > *, .project-section .dag-section-stack > *, .feature-card, .stat, .pain-column, .project-next, .dag-stat-card, .dag-phase-card, .decision-card, .dag-outcome-card, .dag-quote';
        const revealTargets = projectMain.querySelectorAll(revealSelector);
        const reduceMotion =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        revealTargets.forEach(function (el) {
            el.classList.add('scroll-reveal');
            if (el.classList.contains('project-section')) {
                el.classList.add('scroll-reveal--section');
            }
        });

        if (!reduceMotion && revealTargets.length) {
            const observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: '0px 0px -6% 0px',
                    threshold: 0.06
                }
            );
            revealTargets.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            revealTargets.forEach(function (el) {
                el.classList.add('is-visible');
            });
        }

        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.type = 'button';
        scrollTopBtn.className = 'scroll-top-btn scroll-top-btn--dim';
        scrollTopBtn.setAttribute('aria-label', 'Back to top');
        var scrollTopIcon = document.createElement('span');
        scrollTopIcon.className = 'scroll-top-icon';
        scrollTopIcon.setAttribute('aria-hidden', 'true');
        scrollTopIcon.textContent = '\u2191';
        scrollTopBtn.appendChild(scrollTopIcon);

        function getScrollY() {
            var y = 0;
            if (typeof window.scrollY === 'number') {
                y = window.scrollY;
            }
            var root = document.scrollingElement || document.documentElement;
            if (root) {
                y = Math.max(y, root.scrollTop);
            }
            var mainEl = document.querySelector('main.project-main');
            if (mainEl) {
                y = Math.max(y, mainEl.scrollTop);
            }
            return y;
        }

        function updateScrollTopBtn() {
            scrollTopBtn.classList.toggle('scroll-top-btn--dim', getScrollY() < 80);
        }

        function hardScrollToTop() {
            var els = [
                document.scrollingElement,
                document.documentElement,
                document.body,
                document.querySelector('main.project-main')
            ];
            var i;
            for (i = 0; i < els.length; i++) {
                if (!els[i]) {
                    continue;
                }
                els[i].scrollTop = 0;
                if (typeof els[i].scrollTo === 'function') {
                    try {
                        els[i].scrollTo({ top: 0, left: 0, behavior: 'auto' });
                    } catch (err1) {
                        els[i].scrollTop = 0;
                    }
                }
            }
            try {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            } catch (err2) {
                window.scrollTo(0, 0);
            }
            var hdr = document.querySelector('header.header');
            if (hdr && typeof hdr.scrollIntoView === 'function') {
                hdr.scrollIntoView({ block: 'start', behavior: 'auto', inline: 'nearest' });
            }
        }

        scrollTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            hardScrollToTop();
        });

        document.body.appendChild(scrollTopBtn);
        window.addEventListener('scroll', updateScrollTopBtn, { passive: true });
        updateScrollTopBtn();
        requestAnimationFrame(updateScrollTopBtn);
    }
});

// Function to open project pages
function openProject(projectId) {
    // Create project pages based on the project ID
    const projectPages = {
        'dag': 'dag.html',
        'genai-registry': 'genai-registry.html',
        'responsible-ai-checker': 'rai-checker.html'
    };

    const projectPage = projectPages[projectId];
    if (projectPage) {
        if (typeof gtag === 'function') {
            gtag('event', 'project_click', {
                event_category: 'engagement',
                project_id: projectId,
                source: 'homepage'
            });
        }
        window.location.href = projectPage;
    }
}

// Generic link tracking: fires a GA event with the link type, where it was
// clicked from (header/footer/modal), and which page it happened on, so
// clicks can be broken down by source instead of just totaled.
(function initLinkTracking() {
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof gtag !== 'function') return;

        var page = document.body.getAttribute('data-page') || 'unknown';
        var trackedLinks = document.querySelectorAll('[data-track]');

        trackedLinks.forEach(function (el) {
            el.addEventListener('click', function () {
                gtag('event', 'link_click', {
                    event_category: 'engagement',
                    link_type: el.getAttribute('data-track'),
                    source: el.getAttribute('data-track-source') || 'unknown',
                    page: page
                });
            });
        });
    });
})();

// Lightbox: click any project image to view full size
(function initLightbox() {
    document.addEventListener('DOMContentLoaded', function () {
        var projectMain = document.querySelector('.project-main');
        if (!projectMain) return;

        var overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        var img = document.createElement('img');
        img.className = 'lightbox-img';
        overlay.appendChild(img);
        document.body.appendChild(overlay);

        var cursorRoot = document.querySelector('.custom-cursor');
        var zoomLabelEl = cursorRoot && cursorRoot.querySelector('.custom-cursor__zoom-label');

        function close() {
            overlay.classList.remove('is-active');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (cursorRoot) cursorRoot.classList.remove('is-zoom-out');
            if (zoomLabelEl) zoomLabelEl.textContent = '+';
        }

        overlay.addEventListener('click', close);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        overlay.addEventListener('mouseenter', function () {
            if (overlay.classList.contains('is-active') && cursorRoot) {
                cursorRoot.classList.add('is-zoom-out');
            }
        });

        overlay.addEventListener('mouseleave', function () {
            if (cursorRoot) cursorRoot.classList.remove('is-zoom-out');
        });

        projectMain.addEventListener('click', function (e) {
            var target = e.target;
            if (target.tagName !== 'IMG' || target.classList.contains('project-header-image')) return;
            img.src = target.src;
            img.alt = target.alt;
            overlay.classList.add('is-active');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (cursorRoot) cursorRoot.classList.add('is-zoom-out');
            if (zoomLabelEl) zoomLabelEl.textContent = '\u2212';
        });

        var imgs = projectMain.querySelectorAll('img:not(.project-header-image)');
        imgs.forEach(function (el) { el.classList.add('dag-zoomable'); });
    });
})();

// More About Me modal
(function initAboutModal() {
    document.addEventListener('DOMContentLoaded', function () {
        var openBtn = document.getElementById('aboutMoreBtn');
        var overlay = document.getElementById('aboutModalOverlay');
        var closeBtn = document.getElementById('aboutModalClose');
        if (!openBtn || !overlay || !closeBtn) return;

        function open() {
            overlay.classList.add('is-active');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            if (typeof gtag === 'function') {
                gtag('event', 'about_modal_open', {
                    event_category: 'engagement',
                    event_label: 'about_me_modal'
                });
            }
        }

        function close() {
            overlay.classList.remove('is-active');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        openBtn.addEventListener('click', open);
        closeBtn.addEventListener('click', close);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('is-active')) close();
        });

        var photoImgs = overlay.querySelectorAll('.about-modal-photo img');
        photoImgs.forEach(function (img) {
            img.addEventListener('error', function () {
                img.closest('.about-modal-photo').classList.add('is-missing');
            });
        });
    });
})();

// Add smooth transitions to header links
document.addEventListener('DOMContentLoaded', function() {
    const headerLinks = document.querySelectorAll('.header-link');
    headerLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
