/* ==========================================================================
   EWASION137 PORTFOLIO CONTROLLER
   Black Brutalism // Low-Level Systems Spec
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Contact Copy Action (Brutalist Inverted Feedback) */
    const copyBtn = document.getElementById('copyContactBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = copyBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const prevText = copyBtn.textContent;
                copyBtn.textContent = '[COPIED]';
                copyBtn.style.background = '#ffffff';
                copyBtn.style.color = '#000000';

                setTimeout(() => {
                    copyBtn.textContent = prevText;
                    copyBtn.style.background = '';
                    copyBtn.style.color = '';
                }, 1600);
            }).catch(err => {
                console.error('Copy failure:', err);
            });
        });
    }

    /* 2. Image Lightbox Inspector (Reliable Click Trigger) */
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxCloseBtn');
    const backdrop = document.querySelector('.lightbox-backdrop');

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        if (lightboxImg) lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    // Attach click listeners to tilt-cards and inspectable images
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, a')) return;
            const img = card.querySelector('.inspectable-img') || card.querySelector('img');
            if (img) {
                const fullSrc = img.getAttribute('data-full') || img.src;
                openLightbox(fullSrc);
            }
        });
    });

    document.querySelectorAll('.inspectable-img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const fullSrc = img.getAttribute('data-full') || img.src;
            openLightbox(fullSrc);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === backdrop) {
                closeLightbox();
            }
        });
    }

    /* 3. Zenith Player Lazy Launcher (Zero CPU/Memory until requested) */
    const playerModal = document.getElementById('zenithPlayerModal');
    const playerHolder = document.getElementById('playerIframeHolder');
    const zenithBackdrop = document.getElementById('zenithModalBackdrop');
    const zenithCloseBtn = document.getElementById('zenithCloseBtn');
    const zenithMinimizeBtn = document.getElementById('zenithMinimizeBtn');
    const zenithWindowStage = document.getElementById('zenithWindowStage');
    const launchTriggers = document.querySelectorAll('.launch-zenith-trigger');

    let isPlayerRunning = false;

    function launchPlayer() {
        if (!playerModal || !playerHolder) return;

        if (!isPlayerRunning) {
            const playerUrl = new URL('player/Zenith/form.html', window.location.href).href;
            playerHolder.innerHTML = `<iframe src="${playerUrl}" class="zenith-embedded-frame" id="liveZenithFrame" title="Zenith Player Web Audio Instance"></iframe>`;
            isPlayerRunning = true;
        }

        playerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function killPlayer() {
        if (!playerModal || !playerHolder) return;
        playerModal.classList.remove('active');
        document.body.style.overflow = '';

        /* Purge iframe completely to terminate Web Audio Context and audio output */
        playerHolder.innerHTML = '';
        isPlayerRunning = false;
        if (zenithWindowStage) zenithWindowStage.classList.remove('stage-minimized');
    }

    launchTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            launchPlayer();
        });
    });

    if (zenithCloseBtn) zenithCloseBtn.addEventListener('click', killPlayer);
    if (zenithBackdrop) zenithBackdrop.addEventListener('click', killPlayer);

    if (zenithMinimizeBtn) {
        zenithMinimizeBtn.addEventListener('click', () => {
            zenithWindowStage.classList.toggle('stage-minimized');
        });
    }

    /* Global Escape / Space Key Listener for Modals */
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox && lightbox.classList.contains('active')) {
                closeLightbox();
            } else if (playerModal && playerModal.classList.contains('active')) {
                killPlayer();
            } else if (typeof closeAsciiModal === 'function') {
                closeAsciiModal();
            }
        } else if (e.code === 'Space') {
            const asciiModal = document.getElementById('asciiModal');
            if (asciiModal && asciiModal.classList.contains('active')) {
                e.preventDefault();
                if (typeof rerollAscii === 'function') {
                    rerollAscii();
                }
            }
        }
    });

    /* 4. Manifest Filter Tabs */
    const filterTabs = document.querySelectorAll('.manifest-tabs .pill-tab[data-filter]');
    const rows = document.querySelectorAll('.manifest-table .table-row');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            rows.forEach(row => {
                const matches = filter === 'all' || row.getAttribute('data-cat') === filter;
                row.style.display = matches ? '' : 'none';
            });
        });
    });

    /* 5. Source Telemetry Switcher */
    const tabEquinox = document.getElementById('tabEquinox');
    const tabEquant = document.getElementById('tabEquant');
    const snippetFilename = document.getElementById('snippetFilename');
    const snippetContent = document.getElementById('snippetContent');

    const snippets = {
        equinox: {
            filename: 'EquinoxOS/kernel.c',
            code: `<span class="tok-c">/* EquinoxOS Monolithic Kernel Entry Sequence */</span>
<span class="tok-k">void</span> <span class="tok-fn">kmain</span>(<span class="tok-k">void</span>) {
    <span class="tok-fn">serial_init</span>(COM1);
    <span class="tok-fn">tty_init</span>();
    <span class="tok-fn">term_print</span>(<span class="tok-s">"=== EquinoxOS Kernel Starting ===\\n"</span>);

    <span class="tok-k">if</span> (hhdm_request.response == NULL) {
        <span class="tok-fn">term_print</span>(<span class="tok-s">"ERROR: Limine HHDM not available!\\n"</span>);
        <span class="tok-k">while</span> (1) __asm__(<span class="tok-s">"cli; hlt"</span>);
    }
    hhdm_offset = hhdm_request.response->offset;

    <span class="tok-fn">init_gdt</span>();
    <span class="tok-fn">init_sse</span>();
    <span class="tok-fn">pmm_init</span>();
    <span class="tok-fn">vmm_init</span>();
    <span class="tok-fn">init_heap</span>((uint64_t)<span class="tok-fn">pmm_alloc_continuous</span>(16384) + hhdm_offset, 64 * 1024 * 1024);

    <span class="tok-k">struct</span> limine_framebuffer *fb = framebuffer_request.response->framebuffers[0];
    <span class="tok-fn">init_vesa</span>((uintptr_t)fb->address, fb->width, fb->height, fb->pitch);
    <span class="tok-fn">vmm_remap_fb_wc</span>();

    <span class="tok-fn">vfs_init</span>();
    <span class="tok-fn">ext2_init</span>();
    <span class="tok-fn">fat32_init</span>();
    <span class="tok-fn">exec_from_disk</span>(<span class="tok-s">"bin/sysgui.elf"</span>);
}`
        },
        equant: {
            filename: 'EquantOS/kernel/main.c',
            code: `<span class="tok-c">/* EquantOS Bootstrap &amp; Userland Jump */</span>
<span class="tok-k">void</span> <span class="tok-fn">_start</span>(<span class="tok-k">void</span>) {
    <span class="tok-fn">serial_init</span>(COM1);
    <span class="tok-fn">enable_fpu_sse</span>();
    <span class="tok-fn">init_gdt</span>();
    <span class="tok-fn">init_idt</span>();

    <span class="tok-k">if</span> (hhdm_request.response == NULL || hhdm_request.response->offset == 0) {
        <span class="tok-fn">PANIC</span>(<span class="tok-s">"Limine HHDM response is NULL!"</span>);
    }
    hhdm_offset = hhdm_request.response->offset;

    <span class="tok-fn">pmm_init</span>();
    <span class="tok-fn">vmm_init</span>();
    <span class="tok-fn">init_heap</span>(0, 0);
    <span class="tok-fn">apic_init</span>();

    asm volatile (<span class="tok-s">"sti"</span>);
    <span class="tok-fn">do_initcalls</span>();

    <span class="tok-fn">tty_print</span>(<span class="tok-s">"\\nWelcome to EquantOS!\\n\\n"</span>);
    <span class="tok-fn">kernel_start_userland</span>();

    <span class="tok-k">for</span> (;;) {
        asm volatile (<span class="tok-s">"hlt"</span>);
    }
}`
        }
    };

    if (tabEquinox && tabEquant && snippetFilename && snippetContent) {
        tabEquinox.addEventListener('click', () => {
            tabEquinox.classList.add('active');
            tabEquant.classList.remove('active');
            snippetFilename.textContent = snippets.equinox.filename;
            snippetContent.innerHTML = snippets.equinox.code;
        });

        tabEquant.addEventListener('click', () => {
            tabEquant.classList.add('active');
            tabEquinox.classList.remove('active');
            snippetFilename.textContent = snippets.equant.filename;
            snippetContent.innerHTML = snippets.equant.code;
        });
    }

    /* 6. Custom Brutalist Side Scroll Slider */
    const sideScrollTrack = document.getElementById('sideScrollTrack');
    const scrollRail = document.getElementById('scrollRailContainer');
    const scrollThumb = document.getElementById('scrollSliderThumb');
    const scrollPctLabel = document.getElementById('scrollPctLabel');

    if (sideScrollTrack && scrollRail && scrollThumb) {
        let isDragging = false;

        function updateSideSlider() {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const pct = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

            const railHeight = scrollRail.clientHeight;
            const thumbHeight = scrollThumb.clientHeight;
            const maxTop = Math.max(railHeight - thumbHeight, 0);

            if (!isDragging) {
                scrollThumb.style.top = `${pct * maxTop}px`;
            }

            if (scrollPctLabel) {
                const roundedPct = Math.round(pct * 100);
                scrollPctLabel.textContent = roundedPct < 10 ? `0${roundedPct}%` : `${roundedPct}%`;
            }
        }

        window.addEventListener('scroll', updateSideSlider, { passive: true });
        window.addEventListener('resize', updateSideSlider);
        updateSideSlider();

        // Click on rail jumps to position
        scrollRail.addEventListener('click', (e) => {
            if (e.target === scrollThumb) return;
            const rect = scrollRail.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const thumbHeight = scrollThumb.clientHeight;
            const maxTop = Math.max(rect.height - thumbHeight, 1);
            const targetTop = clickY - (thumbHeight / 2);
            const pct = Math.min(Math.max(targetTop / maxTop, 0), 1);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: pct * maxScroll, behavior: 'smooth' });
        });

        // Dragging the slider thumb
        scrollThumb.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            document.body.style.userSelect = 'none';

            const startY = e.clientY;
            const startThumbTop = parseFloat(scrollThumb.style.top) || 0;
            const railHeight = scrollRail.clientHeight;
            const thumbHeight = scrollThumb.clientHeight;
            const maxTop = Math.max(railHeight - thumbHeight, 0);

            function onMouseMove(moveEvent) {
                if (!isDragging) return;
                const deltaY = moveEvent.clientY - startY;
                const newTop = Math.min(Math.max(startThumbTop + deltaY, 0), maxTop);
                scrollThumb.style.top = `${newTop}px`;

                const pct = maxTop > 0 ? newTop / maxTop : 0;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: pct * maxScroll });

                if (scrollPctLabel) {
                    const roundedPct = Math.round(pct * 100);
                    scrollPctLabel.textContent = roundedPct < 10 ? `0${roundedPct}%` : `${roundedPct}%`;
                }
            }

            function onMouseUp() {
                isDragging = false;
                document.body.style.userSelect = '';
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    }

    /* ======================================================================
       7. BACKGROUND 0101 ELECTRIC NETWORK MATRIX
       ====================================================================== */
    const canvas = document.getElementById('binaryNetworkCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 65 : 140;
        const particles = [];

        class BinaryNode {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : (Math.random() < 0.5 ? -10 : height + 10);
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.char = Math.random() < 0.5 ? '0' : '1';
                this.baseAlpha = 0.08 + Math.random() * 0.04; // ~10% idle opacity
                this.energy = 0; // 0 to 1 excitation
                this.flipTimer = Math.floor(Math.random() * 240);
            }

            update(mX, mY, isMouseActive) {
                this.x += this.vx;
                this.y += this.vy;

                // Screen wrap
                if (this.x < -20) this.x = width + 20;
                else if (this.x > width + 20) this.x = -20;
                if (this.y < -20) this.y = height + 20;
                else if (this.y > height + 20) this.y = -20;

                // Random character flip
                if (++this.flipTimer > 300) {
                    this.char = this.char === '0' ? '1' : '0';
                    this.flipTimer = 0;
                }

                // Mouse direct hit
                if (isMouseActive) {
                    const dx = mX - this.x;
                    const dy = mY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 95) {
                        const directPower = Math.pow((95 - dist) / 95, 1.2);
                        this.energy = Math.max(this.energy, directPower);
                    }
                }

                // Energy decay
                this.energy *= 0.94;
            }

            draw(c) {
                const alpha = Math.min(this.baseAlpha + (1.0 - this.baseAlpha) * this.energy, 1.0);
                c.font = '13px "Geist Mono", monospace';
                c.textAlign = 'center';
                c.textBaseline = 'middle';

                if (this.energy > 0.4) {
                    c.shadowBlur = 6 * this.energy;
                    c.shadowColor = '#ffffff';
                } else {
                    c.shadowBlur = 0;
                }

                c.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                c.fillText(this.char, this.x, this.y);
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new BinaryNode());
        }

        let mouseX = -9999;
        let mouseY = -9999;
        let mouseActive = false;
        let mouseTimeout = null;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            mouseActive = true;
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => { mouseActive = false; }, 2000);
        });

        window.addEventListener('mouseleave', () => {
            mouseActive = false;
            mouseX = -9999;
            mouseY = -9999;
        });

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const connectDist = 110;

        function animateNetwork() {
            ctx.clearRect(0, 0, width, height);

            // 1. Update nodes
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(mouseX, mouseY, mouseActive);
            }

            // 2. Electric network chain reaction & spark arcs
            ctx.shadowBlur = 0;
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                if (p1.energy < 0.12) continue;

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectDist) {
                        // Propagate electric impulse with distance attenuation
                        const factor = (1 - dist / connectDist) * 0.72;
                        p2.energy = Math.max(p2.energy, p1.energy * factor);
                        p1.energy = Math.max(p1.energy, p2.energy * factor);

                        // Draw subtle electric network branch
                        const arcAlpha = Math.min(p1.energy, p2.energy) * (1 - dist / connectDist) * 0.45;
                        if (arcAlpha > 0.05) {
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = `rgba(255, 255, 255, ${arcAlpha})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
            }

            // 3. Draw nodes
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw(ctx);
            }

            requestAnimationFrame(animateNetwork);
        }

        requestAnimationFrame(animateNetwork);
    }

    /* ======================================================================
       8. BRUTALIST ASCII VAULT (CLICK NICKNAME TO SUMMON RANDOM ASCII ART)
       ====================================================================== */
    const asciiModal = document.getElementById('asciiModal');
    const asciiModalBackdrop = document.getElementById('asciiModalBackdrop');
    const asciiCloseBtn = document.getElementById('asciiCloseBtn');
    const asciiRerollBtn = document.getElementById('asciiRerollBtn');
    const asciiBodyContainer = document.getElementById('asciiBodyContainer');
    const asciiBannerDisplay = document.getElementById('asciiBannerDisplay');
    const asciiFontBadge = document.getElementById('asciiFontBadge');
    const asciiIndexCount = document.getElementById('asciiIndexCount');
    const nickTriggers = document.querySelectorAll('#brandNickTrigger, .brand-name, .brand-link');

    let currentAsciiIndex = -1;

    function getRandomAsciiIndex() {
        if (!window.ASCII_BANNERS || window.ASCII_BANNERS.length === 0) return -1;
        let nextIdx = Math.floor(Math.random() * window.ASCII_BANNERS.length);
        if (window.ASCII_BANNERS.length > 1 && nextIdx === currentAsciiIndex) {
            nextIdx = (nextIdx + 1) % window.ASCII_BANNERS.length;
        }
        return nextIdx;
    }

    function renderAscii(index) {
        if (!window.ASCII_BANNERS || !window.ASCII_BANNERS[index]) return;
        currentAsciiIndex = index;
        const item = window.ASCII_BANNERS[index];

        if (asciiBannerDisplay) {
            asciiBannerDisplay.style.opacity = '0';
            setTimeout(() => {
                asciiBannerDisplay.textContent = item.art.replace(/^\n+/, '');
                asciiBannerDisplay.style.opacity = '1';
            }, 50);
        }

        if (asciiFontBadge) {
            const fontName = (item.font || 'UNKNOWN').toUpperCase();
            const formattedIdx = (index + 1) < 10 ? `0${index + 1}` : `${index + 1}`;
            asciiFontBadge.textContent = `FONT: ${fontName} [${formattedIdx}/${window.ASCII_BANNERS.length}]`;
        }

        if (asciiIndexCount) {
            asciiIndexCount.textContent = `${window.ASCII_BANNERS.length} VARIANTS LOADED // CLICK TO REROLL`;
        }
    }

    window.rerollAscii = function() {
        const idx = getRandomAsciiIndex();
        if (idx >= 0) renderAscii(idx);
    };

    window.openAsciiModal = function() {
        if (!asciiModal) return;
        asciiModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        window.rerollAscii();
    };

    window.closeAsciiModal = function() {
        if (!asciiModal) return;
        asciiModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    nickTriggers.forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.openAsciiModal();
        });
    });

    if (asciiCloseBtn) asciiCloseBtn.addEventListener('click', window.closeAsciiModal);
    if (asciiModalBackdrop) asciiModalBackdrop.addEventListener('click', window.closeAsciiModal);
    if (asciiRerollBtn) asciiRerollBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.rerollAscii();
    });
    if (asciiBodyContainer) asciiBodyContainer.addEventListener('click', () => {
        window.rerollAscii();
    });

        /* ======================================================================
       9. NEWSPAPER CYLINDER ROLL EFFECT (СКРОЛЛ-РУЛОН В ТРУБУ)
       ====================================================================== */
    const rollElements = document.querySelectorAll(
        '.hero-container, .section-header, .section-header-row, .product-card, .table-card, .code-panel, .footer-grid'
    );

    let isTicking = false;

    function updateCylinderRoll() {
        const topNavHeight = 64; // Высота шапки
        // Срабатывает ТОЛЬКО когда верх блока почти коснулся шапки (+20px)
        const rollThreshold = topNavHeight + 20; 
        const rollDepth = 180; // Зона полного сворачивания в трубу

        rollElements.forEach(el => {
            const rect = el.getBoundingClientRect();

            // Если элемент еще читается на экране — он на 100% плоский и без искажений
            if (rect.top >= rollThreshold) {
                if (el.style.transform !== '') {
                    el.style.transform = '';
                    el.style.opacity = '';
                    el.style.filter = '';
                }
                return;
            }

            // Начинаем заворачивать только когда уходит под шапку
            const factor = Math.min(Math.max((rollThreshold - rect.top) / rollDepth, 0), 1.4);

            const rotateX = factor * 26;          // Плавный угол назад
            const translateZ = -factor * 90;      // Уход вглубь
            const translateY = factor * 10;       // Компенсация дуги
            const scale = Math.max(0.92, 1 - factor * 0.05);
            const opacity = Math.max(0.1, 1 - factor * 0.7);

            el.style.transformOrigin = '50% 0%';
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale})`;
            el.style.opacity = opacity;
            el.style.filter = `brightness(${Math.max(0.25, 1 - factor * 0.7)})`;
        });

        isTicking = false;
    }

    function onScrollRoll() {
        if (!isTicking) {
            window.requestAnimationFrame(updateCylinderRoll);
            isTicking = true;
        }
    }

    window.addEventListener('scroll', onScrollRoll, { passive: true });
    window.addEventListener('resize', onScrollRoll);
    updateCylinderRoll();
});