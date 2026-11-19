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
    bootOverlay.classList.add("hidden");
    statusLed.classList.add("online");
    vmStatus.textContent = "RUNNING // x86_64 (TYPE IN TERMINAL)";
    monitorFrame.focus();
});

monitorFrame.addEventListener("click", () => {
    monitorFrame.focus();
    if (typeof emulator.keyboard_set_status === "function") {
        emulator.keyboard_set_status(true);
    }
});

btnReboot.addEventListener("click", () => {
    emulator.restart();
    monitorFrame.focus();
});

btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        monitorFrame.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
    monitorFrame.focus();
});
