/**
 * Three.js Unified Multi-Theme Engine (Unleashed Edition)
 * Features: Cosmic Black Hole Shader, Gravitational Lensing, Hyper Transition Shake & Flash
 * Author: ewasion137
 */

const canvas = document.getElementById('liquid-canvas');

// Dynamic Flash Overlay Injection
let flashOverlay = document.getElementById('flash-overlay');
if (!flashOverlay) {
    flashOverlay = document.createElement('div');
    flashOverlay.id = 'flash-overlay';
    flashOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: #ffffff; z-index: 99999; pointer-events: none;
        opacity: 0; transition: opacity 0.05s ease-in;
    `;
    document.body.appendChild(flashOverlay);
}

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

// --- 1. SHADERS FOR BRUTAL THEME ---
const bgMaterialBrutal = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_color1: { value: new THREE.Vector3(0.02, 0.0, 0.08) },
        u_color2: { value: new THREE.Vector3(0.65, 0.0, 0.95) },
        u_color3: { value: new THREE.Vector3(1.0, 0.25, 0.0) },
        u_color4: { value: new THREE.Vector3(1.0, 0.85, 0.95) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        uniform vec3 u_color4;

        vec2 hash(vec2 p) {
            p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
            return vec2(-1.0) + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (vec2(3.0) - 2.0 * f);

            return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                           dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                       mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                           dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
        }

        float fbm(vec2 p) {
            float val = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 4; i++) {
                val += amp * noise(p);
                p *= 2.0;
                amp *= 0.5;
            }
            return val;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            vec2 mouse = u_mouse;

            vec2 q = vec2(fbm(st * 3.0 + vec2(u_time * 0.08, u_time * 0.1)),
                          fbm(st * 3.0 + vec2(0.0, 0.0)));

            vec2 r = vec2(fbm(st * 3.0 + 4.0 * q + vec2(u_time * 0.08) + mouse * 0.15),
                          fbm(st * 3.0 + 4.0 * q + vec2(u_time * 0.04)));

            float f = fbm(st * 3.0 + 4.0 * r);

            vec3 col = mix(u_color1, u_color2, clamp(f * f * 3.0, 0.0, 1.0));
            col = mix(col, u_color3, clamp(length(q.x * r.y) * 2.2, 0.0, 1.0));
            col = mix(col, u_color4, clamp(pow(f, 3.0) * 1.5, 0.0, 1.0));

            gl_FragColor = vec4(col, 1.0);
        }
    `,
    depthWrite: false,
    depthTest: false
});

const textMaterialBrutal = new THREE.ShaderMaterial({
    uniforms: {
        u_baseColor: { value: new THREE.Vector3(0.96, 0.96, 0.98) },
        u_tintLeft: { value: new THREE.Vector3(0.75, 0.20, 1.0) },
        u_tintRight: { value: new THREE.Vector3(1.0, 0.45, 0.15) }
    },
    vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        uniform vec3 u_baseColor;
        uniform vec3 u_tintLeft;
        uniform vec3 u_tintRight;

        void main() {
            float mixFactor = clamp((vPosition.x + 3.5) / 7.0, 0.0, 1.0);
            vec3 subtleColor = mix(u_tintLeft, u_tintRight, mixFactor);
            vec3 baseColor = mix(u_baseColor, subtleColor, 0.12);

            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
            vec3 halfDir = normalize(lightDir + viewDir);

            float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
            float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

            vec3 finalColor = baseColor + spec * vec3(0.8) + rim * subtleColor * 0.3;
            gl_FragColor = vec4(finalColor, 0.98);
        }
    `,
    transparent: true
});

// --- 2. BLACK HOLE + COSMIC GRID SHADER FOR KOCMOC THEME ---
const bgMaterialKocmoc = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                       mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }

        float fbm(vec2 p) {
            float val = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 5; i++) {
                val += amp * noise(p);
                p *= 2.2;
                amp *= 0.5;
            }
            return val;
        }

        void main() {
            vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            vec2 mouse = (u_mouse - 0.5) * 0.15;
            vec2 bhCenter = vec2(0.0, 0.0) + mouse;

            float dist = length(st - bhCenter);

            // 🕳️ Gravitational Lensing Distortion (Space warped around Black Hole)
            vec2 warpedSt = st;
            if (dist > 0.02) {
                float warp = 0.07 / (dist + 0.12);
                warpedSt += normalize(st - bhCenter) * warp;
            }

            // 1. Warped Techno Cosmic Grid
            vec2 gridUv = warpedSt * 10.0;
            gridUv += vec2(sin(u_time * 0.4), cos(u_time * 0.4)) * 0.15;
            float grid = abs(sin(gridUv.x)) * abs(sin(gridUv.y));
            grid = pow(0.018 / grid, 1.2);

            // 2. Cosmic Energy Waves
            vec2 q = vec2(fbm(warpedSt * 2.0 + u_time * 0.15), fbm(warpedSt * 2.0 - u_time * 0.1));
            float cosmicEnergy = fbm(warpedSt * 3.0 + 4.0 * q);
            cosmicEnergy = pow(cosmicEnergy, 3.5) * 3.5;

            // 3. Stars / Particles
            float starNoise = hash(gl_FragCoord.xy + floor(u_time * 12.0));
            float stars = pow(starNoise, 40.0) * 2.5;

            // 4. Black Hole Accretion Disk & Photon Ring
            float r_event = 0.22; // Event Horizon Radius
            float angle = atan(st.y - bhCenter.y, st.x - bhCenter.x);
            
            // Accretion Disk Swirl Motion
            vec2 swirlUv = vec2(angle * 2.0 + u_time * 0.8, 1.0 / (dist + 0.05) - u_time * 1.2);
            float diskSwirl = fbm(swirlUv * 1.5);
            
            float accretionDisk = smoothstep(0.55, r_event, dist) * smoothstep(r_event - 0.02, r_event + 0.05, dist);
            accretionDisk *= (0.5 + 0.5 * diskSwirl);

            // Glowing Photon Ring around Event Horizon
            float photonRing = smoothstep(r_event + 0.04, r_event, dist) * smoothstep(r_event - 0.02, r_event, dist);
            photonRing = pow(photonRing, 2.0) * 4.0;

            // Palette
            vec3 voidBlack = vec3(0.0, 0.0, 0.0);
            vec3 neonWhite = vec3(1.0, 1.0, 1.0);
            vec3 midGray = vec3(0.2, 0.2, 0.23);

            vec3 col = mix(voidBlack, midGray, clamp(cosmicEnergy * 0.5, 0.0, 1.0));
            col += neonWhite * grid * 0.15;
            col += neonWhite * cosmicEnergy;
            col += neonWhite * stars;

            // Add Glowing Black Hole Disk & Ring
            col += neonWhite * accretionDisk * 2.5;
            col += neonWhite * photonRing;

            // 🕳️ Event Horizon Shadow (Pure Void in center)
            if (dist < r_event) {
                col = vec3(0.0);
            }

            // Vignette
            float vignette = 1.0 - length(st * 0.7);
            col *= clamp(vignette, 0.1, 1.0);

            gl_FragColor = vec4(col, 1.0);
        }
    `,
    depthWrite: false,
    depthTest: false
});

const textMaterialKocmoc = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);

            vec3 lightDir = normalize(vec3(0.0, 1.0, 2.0));
            vec3 halfDir = normalize(lightDir + viewDir);

            float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);
            float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);

            vec3 baseBlack = vec3(0.05, 0.05, 0.05);
            vec3 starkWhite = vec3(1.0, 1.0, 1.0);

            float vertGradient = clamp((vPosition.y + 0.5), 0.0, 1.0);
            vec3 col = mix(baseBlack, starkWhite * 0.7, vertGradient);

            col += spec * starkWhite * 2.0;
            col += rim * starkWhite * 1.5;

            gl_FragColor = vec4(col, 1.0);
        }
    `,
    transparent: true
});

// Scene Meshes
const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterialBrutal);
scene.add(bgMesh);

// Theme Configurations
const THEMES = {
    brutal: {
        css: 'style.css',
        bgMat: bgMaterialBrutal,
        textMat: textMaterialBrutal,
        physics: { stiffness: 0.08, damping: 0.45, force: 0.35 }
    },
    kocmoc: {
        css: 'KOCMOC.css',
        bgMat: bgMaterialKocmoc,
        textMat: textMaterialKocmoc,
        physics: { stiffness: 0.12, damping: 0.72, force: 0.45 }
    }
};

let currentTheme = 'brutal';
let shakeIntensity = 0;

// 3D Text Setup
let textMesh = null;
let originalPositions = null;
let currentPositions = null;
let velocities = null;

let isMouseDown = false;
let isAnimatingPhysics = false;

const fontLoader = new THREE.FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new THREE.TextGeometry('ewasion137', {
        font: font,
        size: 1.3,
        height: 0.4,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.04,
        bevelSegments: 3
    });

    textGeo.center();

    textMesh = new THREE.Mesh(textGeo, textMaterialBrutal);
    textMesh.position.z = 2;
    scene.add(textMesh);

    const posAttr = textGeo.attributes.position;
    const count = posAttr.count;

    originalPositions = new Float32Array(posAttr.array);
    currentPositions = new Float32Array(posAttr.array);
    velocities = new Float32Array(count * 3);

    const savedTheme = localStorage.getItem('selected-theme') || 'brutal';
    switchThemeDirect(savedTheme);
});

// Raycasting Setup
const raycaster = new THREE.Raycaster();
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);
const mouse3D = new THREE.Vector3();
const mouse2D = new THREE.Vector2();

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        isMouseDown = true;
        isAnimatingPhysics = true;
    }
});

window.addEventListener('mouseup', () => { isMouseDown = false; });
window.addEventListener('mouseleave', () => { isMouseDown = false; });

window.addEventListener('mousemove', (e) => {
    mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;

    const mx = e.clientX / window.innerWidth;
    const my = 1.0 - (e.clientY / window.innerHeight);

    bgMaterialBrutal.uniforms.u_mouse.value.set(mx, my);
    bgMaterialKocmoc.uniforms.u_mouse.value.set(mx, my);

    raycaster.setFromCamera(mouse2D, camera);
    raycaster.ray.intersectPlane(mousePlane, mouse3D);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    bgMaterialBrutal.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    bgMaterialKocmoc.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

// Direct Theme Switcher
function switchThemeDirect(themeKey) {
    if (!THEMES[themeKey]) return;
    currentTheme = themeKey;
    const config = THEMES[themeKey];

    const stylesheet = document.getElementById('theme-stylesheet');
    if (stylesheet) {
        stylesheet.href = config.css;
    }

    if (bgMesh) bgMesh.material = config.bgMat;
    if (textMesh) textMesh.material = config.textMat;

    localStorage.setItem('selected-theme', themeKey);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeKey);
    });
}

// 💥 EXPLOSIVE FLASH & CAMERA SHAKE TRANSITION
function triggerExplosiveTransition(themeKey) {
    if (!THEMES[themeKey] || themeKey === currentTheme) return;

    // 1. Flash White
    flashOverlay.style.transition = 'opacity 0.05s ease-in';
    flashOverlay.style.opacity = '1';

    // 2. Heavy Screen Shake
    shakeIntensity = 0.55;

    // 3. Swap Theme mid-flash
    setTimeout(() => {
        switchThemeDirect(themeKey);

        // Fade Out Flash
        flashOverlay.style.transition = 'opacity 0.5s ease-out';
        flashOverlay.style.opacity = '0';
    }, 80);
}

// Bind Theme Switcher Buttons
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selected-theme') || 'brutal';
    switchThemeDirect(savedTheme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const themeKey = e.target.dataset.theme;
            triggerExplosiveTransition(themeKey);
        });
    });
});

// --- RENDER LOOP ---
function animate(time) {
    const timeInSeconds = time * 0.001;

    bgMaterialBrutal.uniforms.u_time.value = timeInSeconds;
    bgMaterialKocmoc.uniforms.u_time.value = timeInSeconds;

    // Camera Shake Decay
    if (shakeIntensity > 0.001) {
        camera.position.x = (Math.random() - 0.5) * shakeIntensity;
        camera.position.y = (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.88;
    } else {
        camera.position.x = 0;
        camera.position.y = 0;
        shakeIntensity = 0;
    }

    const physConfig = THEMES[currentTheme].physics;

    if (textMesh && originalPositions && isAnimatingPhysics) {
        const posAttr = textMesh.geometry.attributes.position;
        const array = posAttr.array;
        let totalDisplacement = 0;

        for (let i = 0; i < posAttr.count; i++) {
            const idx = i * 3;

            const vx = currentPositions[idx];
            const vy = currentPositions[idx + 1] + textMesh.position.y;

            const dx = vx - mouse3D.x;
            const dy = vy - mouse3D.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (isMouseDown && dist < 2.5 && dist > 0.05) {
                const force = (1.0 - dist / 2.5) * physConfig.force;
                velocities[idx] += (dx / dist) * force;
                velocities[idx + 1] += (dy / dist) * force;
                velocities[idx + 2] += force * 0.3;
            }

            const springX = (originalPositions[idx] - currentPositions[idx]) * physConfig.stiffness;
            const springY = (originalPositions[idx + 1] - currentPositions[idx + 1]) * physConfig.stiffness;
            const springZ = (originalPositions[idx + 2] - currentPositions[idx + 2]) * physConfig.stiffness;

            velocities[idx] = (velocities[idx] + springX) * physConfig.damping;
            velocities[idx + 1] = (velocities[idx + 1] + springY) * physConfig.damping;
            velocities[idx + 2] = (velocities[idx + 2] + springZ) * physConfig.damping;

            currentPositions[idx] += velocities[idx];
            currentPositions[idx + 1] += velocities[idx + 1];
            currentPositions[idx + 2] += velocities[idx + 2];

            const dispX = currentPositions[idx] - originalPositions[idx];
            const dispY = currentPositions[idx + 1] - originalPositions[idx + 1];
            const dispZ = currentPositions[idx + 2] - originalPositions[idx + 2];
            const dispDist = Math.sqrt(dispX * dispX + dispY * dispY + dispZ * dispZ);

            if (dispDist > 1.2) {
                const factor = 1.2 / dispDist;
                currentPositions[idx] = originalPositions[idx] + dispX * factor;
                currentPositions[idx + 1] = originalPositions[idx + 1] + dispY * factor;
                currentPositions[idx + 2] = originalPositions[idx + 2] + dispZ * factor;
            }

            array[idx] = currentPositions[idx];
            array[idx + 1] = currentPositions[idx + 1];
            array[idx + 2] = currentPositions[idx + 2];

            totalDisplacement += dispDist + Math.abs(velocities[idx]);
        }

        posAttr.needsUpdate = true;

        if (!isMouseDown && totalDisplacement < 0.03) {
            isAnimatingPhysics = false;
        }
    }

    if (textMesh) {
        textMesh.position.y = window.scrollY * 0.01;

        if (currentTheme === 'kocmoc') {
            textMesh.rotation.y = Math.sin(timeInSeconds * 0.8) * 0.08;
            textMesh.rotation.x = Math.cos(timeInSeconds * 0.6) * 0.05;
        } else {
            textMesh.rotation.y = Math.sin(timeInSeconds * 0.5) * 0.08;
            textMesh.rotation.x = Math.cos(timeInSeconds * 0.3) * 0.05;
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);