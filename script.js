/* Interactive Mintlify controller with 3D Tilt and Lazy Player Engine */
document.addEventListener('DOMContentLoaded', () => {

    /* 1. Contact Copy Action */
    const copyBtn = document.getElementById('copyContactBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = copyBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const prev = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.textContent = prev; }, 1800);
            });
        });
    }

    /* 2. 3D Tilt Effect on Screenshots */
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            const rotateX = (-deltaY * 12).toFixed(2);
            const rotateY = (deltaX * 12).toFixed(2);

            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    /* 3. Image Lightbox Inspector */
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
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.inspectable-img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const fullSrc = img.getAttribute('data-full') || img.src;
            openLightbox(fullSrc);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);

    /* 4. Zenith Player Lazy Launcher (Zero CPU until clicked) */
    const playerModal = document.getElementById('zenithPlayerModal');
    const playerHolder = document.getElementById('playerIframeHolder');
    const zenithBackdrop = document.getElementById('zenithModalBackdrop');
    const zenithCloseBtn = document.getElementById('zenithCloseBtn');
    const zenithMinimizeBtn = document.getElementById('zenithMinimizeBtn');
    const zenithWindowStage = document.getElementById('zenithWindowStage');
    const launchTriggers = document.querySelectorAll('.launch-zenith-trigger');

    let isPlayerRunning = false;

    /* Replace launchPlayer in script.js */
    function launchPlayer() {
        if (!playerModal || !playerHolder) return;

        if (!isPlayerRunning) {
            /* Resolve safe relative URL for GitHub Pages deployment */
            const playerUrl = new URL('player/Zenith/form.html', window.location.href).href;
            playerHolder.innerHTML = `<iframe src="${playerUrl}" class="zenith-embedded-frame" id="liveZenithFrame"></iframe>`;
            isPlayerRunning = true;
        }

        playerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function killPlayer() {
        if (!playerModal || !playerHolder) return;
        playerModal.classList.remove('active');
        document.body.style.overflow = '';

        /* Purge iframe completely to kill all Web Audio Contexts and audio playback */
        playerHolder.innerHTML = '';
        isPlayerRunning = false;
        zenithWindowStage.classList.remove('stage-minimized');
    }

    launchTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
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

    /* Global Escape Key Listener for Modals */
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox && lightbox.classList.contains('active')) {
                closeLightbox();
            } else if (playerModal && playerModal.classList.contains('active')) {
                killPlayer();
            }
        }
    });

    /* 5. Manifest Filter Pills */
    const filterTabs = document.querySelectorAll('.manifest-tabs .pill-tab[data-filter]');
    const rows = document.querySelectorAll('.manifest-table .table-row');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            rows.forEach(row => {
                if (filter === 'all' || row.getAttribute('data-cat') === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    /* 6. Source Telemetry Toggle */
    const tabEquinox = document.getElementById('tabEquinox');
    const tabEquant = document.getElementById('tabEquant');
    const snippetFilename = document.getElementById('snippetFilename');
    const snippetContent = document.getElementById('snippetContent');

    const snippets = {
        equinox: {
            filename: 'EquinoxOS/kernel.c',
            code: `/* EquinoxOS Monolithic Kernel Entry Sequence */
void kmain(void) {
    serial_init(COM1);
    tty_init();
    term_print("=== EquinoxOS Kernel Starting ===\\n");

    if (hhdm_request.response == NULL) {
        term_print("ERROR: Limine HHDM not available!\\n");
        while (1) __asm__("cli; hlt");
    }
    hhdm_offset = hhdm_request.response->offset;

    init_gdt();
    init_sse();
    pmm_init();
    vmm_init();
    init_heap((uint64_t)pmm_alloc_continuous(16384) + hhdm_offset, 64 * 1024 * 1024);

    struct limine_framebuffer *fb = framebuffer_request.response->framebuffers[0];
    init_vesa((uintptr_t)fb->address, fb->width, fb->height, fb->pitch);
    vmm_remap_fb_wc();

    vfs_init();
    ext2_init();
    fat32_init();
    exec_from_disk("bin/sysgui.elf");
}`
        },
        equant: {
            filename: 'EquantOS/kernel/main.c',
            code: `/* EquantOS Bootstrap & Userland Jump */
void _start(void) {
    serial_init(COM1);
    enable_fpu_sse();
    init_gdt();
    init_idt();

    if (hhdm_request.response == NULL || hhdm_request.response->offset == 0) {
        PANIC("Limine HHDM response is NULL!");
    }
    hhdm_offset = hhdm_request.response->offset;

    pmm_init();
    vmm_init();
    init_heap(0, 0);
    apic_init();

    asm volatile ("sti");
    do_initcalls();

    tty_print("\\nWelcome to EquantOS!\\n\\n");
    kernel_start_userland();

    for (;;) {
        asm volatile ("hlt");
    }
}`
        }
    };

    if (tabEquinox && tabEquant) {
        tabEquinox.addEventListener('click', () => {
            tabEquinox.classList.add('active');
            tabEquant.classList.remove('active');
            snippetFilename.textContent = snippets.equinox.filename;
            snippetContent.textContent = snippets.equinox.code;
        });

        tabEquant.addEventListener('click', () => {
            tabEquant.classList.add('active');
            tabEquinox.classList.remove('active');
            snippetFilename.textContent = snippets.equant.filename;
            snippetContent.textContent = snippets.equant.code;
        });
    }
});