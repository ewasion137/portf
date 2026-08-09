/**
 * Three.js 3D Jelly Text + Liquid Background
 * Features:
 * - Violet-to-Orange Gradient Shader on 3D Text
 * - Stretch deformation ONLY on Left Mouse Button Drag
 * - Zero-CPU/GPU Idle Sleep System
 * Author: ewasion137
 */

const canvas = document.getElementById('liquid-canvas');

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

// --- 1. LIQUID BACKGROUND MATERIAL ---
const bgMaterial = new THREE.ShaderMaterial({
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

            vec2 q = vec2(fbm(st * 3.0 + vec2(u_time * 0.1, u_time * 0.15)),
                          fbm(st * 3.0 + vec2(0.0, 0.0)));

            vec2 r = vec2(fbm(st * 3.0 + 4.0 * q + vec2(u_time * 0.1) + mouse * 0.2),
                          fbm(st * 3.0 + 4.0 * q + vec2(u_time * 0.05)));

            float f = fbm(st * 3.0 + 4.0 * r);

            vec3 colorBg = vec3(0.02, 0.0, 0.08);
            vec3 colorPurple = vec3(0.65, 0.0, 0.95);
            vec3 colorOrange = vec3(1.0, 0.25, 0.0);
            vec3 colorWhite = vec3(1.0, 0.85, 0.95);

            vec3 col = mix(colorBg, colorPurple, clamp(f * f * 3.0, 0.0, 1.0));
            col = mix(col, colorOrange, clamp(length(q.x * r.y) * 2.2, 0.0, 1.0));
            col = mix(col, colorWhite, clamp(pow(f, 3.0) * 1.5, 0.0, 1.0));

            gl_FragColor = vec4(col, 1.0);
        }
    `,
    depthWrite: false,
    depthTest: false
});

const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
scene.add(bgMesh);

// --- 2. VIOLET-ORANGE GRADIENT MATERIAL FOR 3D TEXT ---
const textShaderMaterial = new THREE.ShaderMaterial({
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
            // Horizontal gradient mixing across the text width (-4.0 to +4.0)
            float mixFactor = clamp((vPosition.x + 3.5) / 7.0, 0.0, 1.0);
            
            vec3 colorPurple = vec3(0.70, 0.0, 1.0);   // Electric Purple
            vec3 colorOrange = vec3(1.0, 0.35, 0.0);   // Fiery Orange
            vec3 baseColor = mix(colorPurple, colorOrange, mixFactor);

            // Specular Reflection
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
            vec3 halfDir = normalize(lightDir + viewDir);

            float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
            float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

            vec3 finalColor = baseColor + spec * vec3(1.0, 0.8, 1.0) + rim * vec3(0.6, 0.1, 0.9);
            gl_FragColor = vec4(finalColor, 0.95);
        }
    `,
    transparent: true
});

// --- 3. 3D JELLY TEXT SETUP ---
let textMesh = null;
let originalPositions = null;
let currentPositions = null;
let velocities = null;

// Physics Config
const springStiffness = 0.08;
const springDamping = 0.45;
const mouseForceRadius = 3.5;
const mouseForceStrength = 0.05;
const maxVelocity = 0.3;
const maxDisplacement = 1.2;

// Mouse Interaction & Drag State
let isMouseDown = false;
let isAnimatingPhysics = false; // Controls GPU sleep mode

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

    textMesh = new THREE.Mesh(textGeo, textShaderMaterial);
    textMesh.position.z = 2;
    scene.add(textMesh);

    const posAttr = textGeo.attributes.position;
    const count = posAttr.count;

    originalPositions = new Float32Array(posAttr.array);
    currentPositions = new Float32Array(posAttr.array);
    velocities = new Float32Array(count * 3);
});

// Raycasting Setup
const raycaster = new THREE.Raycaster();
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);
const mouse3D = new THREE.Vector3();
const mouse2D = new THREE.Vector2();

// Mouse Event Listeners for Dragging
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left Mouse Button Only
        isMouseDown = true;
        isAnimatingPhysics = true;
    }
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

window.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

window.addEventListener('mousemove', (e) => {
    mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;

    bgMaterial.uniforms.u_mouse.value.x = e.clientX / window.innerWidth;
    bgMaterial.uniforms.u_mouse.value.y = 1.0 - (e.clientY / window.innerHeight);

    raycaster.setFromCamera(mouse2D, camera);
    raycaster.ray.intersectPlane(mousePlane, mouse3D);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    bgMaterial.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

// --- 4. OPTIMIZED RENDER LOOP ---
function animate(time) {
    const timeInSeconds = time * 0.001;
    bgMaterial.uniforms.u_time.value = timeInSeconds;

    // Run physics simulation ONLY if active (isMouseDown or returning to rest position)
    if (textMesh && originalPositions && isAnimatingPhysics) {
        const posAttr = textMesh.geometry.attributes.position;
        const array = posAttr.array;
        let totalDisplacement = 0;

        for (let i = 0; i < posAttr.count; i++) {
            const idx = i * 3;

            const vx = currentPositions[idx];
            const vy = currentPositions[idx + 1];

            const dx = vx - mouse3D.x;
            const dy = vy - mouse3D.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Apply force ONLY when Left Mouse Button is held down
            if (isMouseDown && dist < mouseForceRadius && dist > 0.05) {
                const force = (1.0 - dist / mouseForceRadius) * mouseForceStrength;
                velocities[idx] += (dx / dist) * force;
                velocities[idx + 1] += (dy / dist) * force;
                velocities[idx + 2] += force * 0.3;
            }

            // Spring forces (returns mesh to original position)
            const springX = (originalPositions[idx] - currentPositions[idx]) * springStiffness;
            const springY = (originalPositions[idx + 1] - currentPositions[idx + 1]) * springStiffness;
            const springZ = (originalPositions[idx + 2] - currentPositions[idx + 2]) * springStiffness;

            velocities[idx] = (velocities[idx] + springX) * springDamping;
            velocities[idx + 1] = (velocities[idx + 1] + springY) * springDamping;
            velocities[idx + 2] = (velocities[idx + 2] + springZ) * springDamping;

            // Velocity clamping
            velocities[idx] = Math.max(-maxVelocity, Math.min(maxVelocity, velocities[idx]));
            velocities[idx + 1] = Math.max(-maxVelocity, Math.min(maxVelocity, velocities[idx + 1]));
            velocities[idx + 2] = Math.max(-maxVelocity, Math.min(maxVelocity, velocities[idx + 2]));

            currentPositions[idx] += velocities[idx];
            currentPositions[idx + 1] += velocities[idx + 1];
            currentPositions[idx + 2] += velocities[idx + 2];

            // Hard Displacement Clamp
            const dispX = currentPositions[idx] - originalPositions[idx];
            const dispY = currentPositions[idx + 1] - originalPositions[idx + 1];
            const dispZ = currentPositions[idx + 2] - originalPositions[idx + 2];
            const dispDist = Math.sqrt(dispX * dispX + dispY * dispY + dispZ * dispZ);

            if (dispDist > maxDisplacement) {
                const factor = maxDisplacement / dispDist;
                currentPositions[idx] = originalPositions[idx] + dispX * factor;
                currentPositions[idx + 1] = originalPositions[idx + 1] + dispY * factor;
                currentPositions[idx + 2] = originalPositions[idx + 2] + dispZ * factor;
            }

            array[idx] = currentPositions[idx];
            array[idx + 1] = currentPositions[idx + 1];
            array[idx + 2] = currentPositions[idx + 2];

            totalDisplacement += dispDist + Math.abs(velocities[idx]);
        }

        // Only upload buffer to GPU when active
        posAttr.needsUpdate = true;

        // GPU SLEEP MODE: Put vertex physics to sleep if mouse is released and text returned to rest position
        if (!isMouseDown && totalDisplacement < 0.05) {
            isAnimatingPhysics = false;
        }
    }

    // Gentle text rotation motion
    if (textMesh) {
        textMesh.rotation.y = Math.sin(timeInSeconds * 0.5) * 0.08;
        textMesh.rotation.x = Math.cos(timeInSeconds * 0.3) * 0.05;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);