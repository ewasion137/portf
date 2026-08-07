/**
 * Kinetic Low-Level Background & Interactive Mechanics
 * ewasion137 Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Canvas HEX Kernel Stream Background
    const canvas = document.getElementById('kernel-canvas');
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const hexTokens = [
        '0x7F', '0x00', 'EAX', 'CR0', 'RING3', 'MOV', 'NOP', '0xDEADBEEF',
        'EXT2', 'FAT32', 'LIMINE', 'C++', 'ASM', '0x80', 'KERNEL', 'VFS'
    ];

    // Floating Particles
    const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        text: hexTokens[Math.floor(Math.random() * hexTokens.length)],
        speedY: (Math.random() - 0.5) * 0.4,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.35 + 0.05,
        fontSize: Math.floor(Math.random() * 6) + 11
    }));

    function renderCanvas() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around edges
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.font = `${p.fontSize}px "JetBrains Mono", monospace`;
            ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
            ctx.fillText(p.text, p.x, p.y);
        });

        requestAnimationFrame(renderCanvas);
    }

    renderCanvas();

    // 2. Interactive 3D Parallax Tilt on Cards
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (-y / rect.height) * 12;
            const rotateY = (x / rect.width) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    // 3. Category Filter
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cats = card.getAttribute('data-category').split(' ');
                if (filter === 'all' || cats.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});