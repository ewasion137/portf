document.addEventListener('DOMContentLoaded', () => {
    // 1. Копирование контакта в 1 клик с брутальным откликом
    const copyBtn = document.getElementById('copyMailBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const email = copyBtn.getAttribute('data-email');
            navigator.clipboard.writeText(email).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'COPIED TO CLIPBOARD';
                copyBtn.style.background = 'var(--accent)';
                copyBtn.style.color = 'var(--bg)';
                
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.style.background = '';
                    copyBtn.style.color = '';
                }, 1800);
            });
        });
    }

    // 2. Быстрый фильтр проектов без перезагрузки
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            cards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-cat') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});