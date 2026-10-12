document.addEventListener('DOMContentLoaded', () => {
    // 1. Fixed Nav dynamic backdrop state
    const nav = document.getElementById('topNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 2. Mobile Navigation Drawer Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('open');
        });

        // Close drawer on link selection
        mobileDrawer.querySelectorAll('.drawer-item').forEach(item => {
            item.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
            });
        });
    }

    // 3. One-Click Contact Copy (SpaceX ghost button feedback)
    const copyBtn = document.getElementById('copyMailBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = copyBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'COMMS ESTABLISHED (COPIED)';
                copyBtn.style.backgroundColor = 'var(--colors-on-primary)';
                copyBtn.style.color = 'var(--colors-primary)';
                
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.style.backgroundColor = '';
                    copyBtn.style.color = '';
                }, 2000);
            });
        });
    }

    // 4. Fleet Manifest Live Filter (Kernel / Tools)
    const filterPills = document.querySelectorAll('.manifest-filter-pill');
    const tableRows = document.querySelectorAll('.manifest-row');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.getAttribute('data-filter');

            tableRows.forEach(row => {
                if (filter === 'all' || row.getAttribute('data-cat') === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // 5. Architecture Telemetry Tabs (EquinoxOS vs EquantOS C Source)
    const telemetryTabs = document.querySelectorAll('.telemetry-tab');
    const snippetEquinox = document.getElementById('codeSnippetEquinox');
    const snippetEquant = document.getElementById('codeSnippetEquant');
    const codeFilename = document.getElementById('codeFilename');

    telemetryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            telemetryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabKey = tab.getAttribute('data-tab');

            if (tabKey === 'equinox') {
                snippetEquinox.classList.remove('hide');
                snippetEquant.classList.add('hide');
                codeFilename.innerText = 'EquinoxOS / kernel.c — Limine Monolithic Entry';
            } else if (tabKey === 'equant') {
                snippetEquant.classList.remove('hide');
                snippetEquinox.classList.add('hide');
                codeFilename.innerText = 'EquantOS / main.c — Clean Ring 3 & Initcalls';
            }
        });
    });
});