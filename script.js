import * as V86Module from "./build/libv86.mjs";

const V86 = V86Module.V86 || V86Module.default;

const monitorFrame = document.getElementById("monitorFrame");
const screenContainer = document.getElementById("screen_container");
const bootOverlay = document.getElementById("bootOverlay");
const bootDetail = document.getElementById("bootDetail");
const progressFill = document.getElementById("progressFill");
const vmStatus = document.getElementById("vmStatus");
const statusLed = document.getElementById("statusLed");
const btnReboot = document.getElementById("btnReboot");
const btnFullscreen = document.getElementById("btnFullscreen");

const emulator = new V86({
    wasm_path: "./build/v86.wasm",
    memory_size: 128 * 1024 * 1024,
    vram_size: 8 * 1024 * 1024,
    cpu_type: "x86_64",
    machine_type: "i440fx",
    acpi: true,
    graphics_adapter: "bochs_vga",
    screen_container: screenContainer,
    bios: { url: "./bios/seabios.bin" },
    vga_bios: { url: "./bios/vgabios.bin" },
    cdrom: {
        url: "./equantos.iso",
        async: false,
    },
    autostart: true,
});

window.emulator = emulator;

let vmStarted = false;
let osBooted = false;
let serialLine = "";

function capturePointer() {
    if (document.pointerLockElement) return;

    if (typeof emulator.mouse_set_enabled === "function") {
        emulator.mouse_set_enabled(true);
    } else if (typeof emulator.mouse_set_status === "function") {
        emulator.mouse_set_status(true);
    }

    try {
        if (typeof emulator.lock_mouse === "function") {
            const res = emulator.lock_mouse();
            if (res && typeof res.catch === "function") res.catch(() => {});
        } else {
            const target = screenContainer || monitorFrame;
            if (target.requestPointerLock) {
                const res = target.requestPointerLock();
                if (res && typeof res.catch === "function") res.catch(() => {});
            }
        }
    } catch {
        // Игнорируем ошибку, если браузер отклонил захват вне клика
    }
}

function updateStatusText() {
    if (!vmStarted) return;
    if (document.pointerLockElement) {
        vmStatus.textContent = "RUNNING // CURSOR LOCKED (ESC TO RELEASE)";
    } else {
        vmStatus.textContent = "RUNNING // CLICK SCREEN TO LOCK CURSOR";
    }
}

document.addEventListener("pointerlockchange", () => {
    updateStatusText();
    if (document.pointerLockElement) {
        monitorFrame.focus();
    }
});

document.addEventListener("pointerlockerror", () => {
    updateStatusText();
});

emulator.add_listener("serial0-output-byte", (byte) => {
    const ch = String.fromCharCode(byte);
    if (ch === "\n") {
        if (
            serialLine.includes("Welcome to EquantOS!") ||
            serialLine.includes("EquantOS Unix Subsystem")
        ) {
            osBooted = true;
            if (typeof emulator.keyboard_set_status === "function") {
                emulator.keyboard_set_status(false);
            }
        }
        serialLine = "";
    } else if (ch !== "\r") {
        serialLine += ch;
    }
});

emulator.add_listener("download-progress", (e) => {
    const name = e.file_name ? e.file_name.split("/").pop() : "asset";
    if (e.total && e.total > 0) {
        const pct = Math.min(100, Math.round((e.loaded / e.total) * 100));
        progressFill.style.width = `${pct}%`;
        bootDetail.textContent = `Downloading ${name} (${pct}%)...`;
    } else {
        const mb = (e.loaded / (1024 * 1024)).toFixed(1);
        bootDetail.textContent = `Downloading ${name} (${mb} MB)...`;
    }
});

emulator.add_listener("download-error", (e) => {
    bootDetail.textContent = `Error loading ${e.file_name || "image"}. Check console (F12).`;
    vmStatus.textContent = "LOAD ERROR";
});

emulator.add_listener("emulator-started", () => {
    vmStarted = true;
    bootOverlay.classList.add("hidden");
    statusLed.classList.add("online");
    updateStatusText();
    monitorFrame.focus();
});

monitorFrame.addEventListener("click", () => {
    monitorFrame.focus();
    if (!osBooted && typeof emulator.keyboard_set_status === "function") {
        emulator.keyboard_set_status(true);
    }
    if (vmStarted) {
        capturePointer();
    }
});

btnReboot.addEventListener("click", () => {
    if (document.pointerLockElement && document.exitPointerLock) {
        document.exitPointerLock();
    }
    osBooted = false;
    serialLine = "";
    if (typeof emulator.keyboard_set_status === "function") {
        emulator.keyboard_set_status(true);
    }
    emulator.restart();
    monitorFrame.focus();
});

btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        monitorFrame
            .requestFullscreen()
            .then(() => {
                capturePointer();
            })
            .catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
    monitorFrame.focus();
});

// Маппинг клавиш в COM1 для EquantOS (соответствует tty_input.c)
function keyEventToSerial(e) {
    if (e.ctrlKey && !e.altKey && !e.metaKey) {
        const match = /^Key([A-Z])$/.exec(e.code);
        if (match) {
            const letter = match[1].toLowerCase();
            if (["r", "t", "w", "n"].includes(letter)) return null;
            return String.fromCharCode(letter.charCodeAt(0) - 96);
        }
    }

    switch (e.key) {
        case "Enter":
            return "\n";
        case "Backspace":
            return "\b";
        case "Tab":
            return "\t";
        case "Escape":
            return "\x1b";
        case "ArrowUp":
            return "\x1b[A";
        case "ArrowDown":
            return "\x1b[B";
        case "ArrowRight":
            return "\x1b[C";
        case "ArrowLeft":
            return "\x1b[D";
        case "Home":
            return "\x1b[H";
        case "End":
            return "\x1b[F";
        case "Delete":
            return "\x1b[3~";
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const code = e.key.charCodeAt(0);
        if (code >= 0x20 && code <= 0x7e) {
            return e.key;
        }
        const keyMatch = /^Key([A-Z])$/.exec(e.code);
        if (keyMatch) {
            const ch = keyMatch[1];
            return e.shiftKey ? ch : ch.toLowerCase();
        }
        const digitMatch = /^Digit([0-9])$/.exec(e.code);
        if (digitMatch) {
            return digitMatch[1];
        }
    }

    return null;
}

window.addEventListener(
    "keydown",
    (e) => {
        // Если курсор захвачен, Esc только отпускает его и не уходит в терминал
        if (e.key === "Escape" && document.pointerLockElement) {
            if (document.exitPointerLock) document.exitPointerLock();
            return;
        }

        if (!osBooted) return;

        if (["F5", "F11", "F12"].includes(e.key) || e.metaKey || e.altKey)
            return;
        if (e.ctrlKey && e.shiftKey) return;

        const active = document.activeElement;
        if (
            !document.pointerLockElement &&
            active &&
            active !== document.body &&
            !monitorFrame.contains(active)
        ) {
            return;
        }

        const seq = keyEventToSerial(e);
        if (seq !== null) {
            e.preventDefault();
            e.stopPropagation();
            emulator.serial0_send(seq);
        }
    },
    true,
);
