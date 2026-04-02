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

        var hoverSelector =
            'a, button, .project-card, input[type="submit"], input[type="button"], input[type="reset"], summary';

        document.addEventListener('mouseover', function (e) {
            var t = e.target;
            if (t.closest && t.closest(hoverSelector)) {
                root.classList.add('is-hover');
            }
        });

        document.addEventListener('mouseout', function (e) {
            var from = e.target;
            var to = e.relatedTarget;
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
            '.project-section > *, .project-section .dag-section-stack > *, .feature-card, .stat, .pain-column, .project-next, .dag-stat-card, .dag-phase-card, .dag-decision-card, .dag-outcome-card, .dag-quote';
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
        'responsible-ai-checker': 'rai-checker.html',
        'deep-learning-research': 'deep-learning-research.html'
    };
    
    const projectPage = projectPages[projectId];
    if (projectPage) {
        window.location.href = projectPage;
    }
}

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

