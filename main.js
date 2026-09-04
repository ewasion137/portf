// Web Audio API движок
const GC_Audio = {
    ctx: null,
    bootOscillators: [],

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playBoot() {
        this.init();
        this.stopBoot(); // Очищаем старые если были
        const t = this.ctx.currentTime;
        const freqs = [196, 261.6, 329.6, 392, 523.2];

        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f * 0.5, t + i * 0.15);
            osc.frequency.exponentialRampToValueAtTime(f, t + i * 0.15 + 0.3);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.12, t + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t + i * 0.15);
            osc.stop(t + 2.2);

            this.bootOscillators.push(osc);
        });
    },

    // Мгновенно глушит звук бута при скипе
    stopBoot() {
        if (this.bootOscillators.length > 0) {
            this.bootOscillators.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) {}
            });
            this.bootOscillators = [];
        }
    },

    click() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    },

    shift() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }
};

const cube = document.getElementById('cube');
const wobbler = document.getElementById('cube-wobbler');
const navButtons = document.querySelectorAll('.gc-btn-nav');
const hudBtnB = document.getElementById('btn-hud-b');
const skipHint = document.getElementById('skip-hint');
const powerScreen = document.getElementById('power-screen');

let isPoweredOn = false;
let isIntroActive = false;
let bootTimeout = null;
let activeFace = 'front';

// 1. СТАРТ СИСТЕМЫ (Запуск интро со звуком)
function startSystem() {
    if (isPoweredOn) return;
    isPoweredOn = true;
    isIntroActive = true;

    // Убираем оверлей включения
    powerScreen.classList.add('fade-out');
    skipHint.classList.remove('hidden');

    // Запускаем звук бута и анимацию синхронно
    GC_Audio.playBoot();
    wobbler.classList.add('booting');

    // Автоматическое завершение интро через 2.2с
    bootTimeout = setTimeout(() => {
        finishIntro();
    }, 2200);
}

// 2. ЗАВЕРШЕНИЕ ИЛИ СКИП ИНТРО
function finishIntro() {
    if (!isIntroActive) return;
    isIntroActive = false;

    clearTimeout(bootTimeout);
    GC_Audio.stopBoot(); // Глушим звук если скипнули
    skipHint.classList.add('hidden');

    // Переходим в чистое вертикальное покачивание (Y-float)
    wobbler.classList.remove('booting');
    wobbler.classList.add('wobbling');
}

// Слушатели на включение питания
powerScreen.addEventListener('click', startSystem);
window.addEventListener('keydown', (e) => {
    if (!isPoweredOn) {
        startSystem();
        return;
    }

    // Скип на ПРОБЕЛ во время интро
    if (e.code === 'Space' && isIntroActive) {
        e.preventDefault();
        finishIntro();
        return;
    }
});

// Навигация
function rotateTo(faceName) {
    if (!isPoweredOn) return;
    if (isIntroActive) finishIntro();
    if (activeFace === faceName) return;

    GC_Audio.shift();

    cube.className = 'cube';
    cube.classList.add(`show-${faceName}`);
    activeFace = faceName;

    if (faceName !== 'front') {
        wobbler.classList.add('steady');
    } else {
        wobbler.classList.remove('steady');
    }
}

navButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => GC_Audio.click());
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        rotateTo(btn.dataset.target);
    });
});

hudBtnB.addEventListener('click', () => rotateTo('front'));

window.addEventListener('keydown', (e) => {
    if (!isPoweredOn) return;

    if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
        rotateTo('front');
    } else if (activeFace === 'front' && !isIntroActive) {
        if (e.key === 'ArrowUp' || e.key === 'w') rotateTo('projects');
        if (e.key === 'ArrowLeft' || e.key === 'a') rotateTo('specs');
        if (e.key === 'ArrowRight' || e.key === 'd') rotateTo('about');
        if (e.key === 'ArrowDown' || e.key === 's') rotateTo('links');
    }
});