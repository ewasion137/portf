/**
 * Three.js 3D KOCMOC UNLEASHED Engine
 * High-Contrast Techno-Cosmic Monochrome Shader & Kinetic Mesh Physics
 */

const canvas = document.getElementById('liquid-canvas');

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

// --- 1. KOCMOC HIGH-CONTRAST COSMIC BACKGROUND SHADER ---
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

        // High contrast speed noise for hyper space energy streams
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
            vec2 mouse = (u_mouse - 0.5) * 0.2;

            // Techno Cosmic Grid Warp
            vec2 gridUv = st * 12.0;
            gridUv += vec2(sin(u_time * 0.5), cos(u_time * 0.5)) * 0.2;
            float grid = abs(sin(gridUv.x)) * abs(sin(gridUv.y));
            grid = pow(0.02 / grid, 1.2); // Extremely sharp high-contrast grid lines

            // Cosmic Void Energy Waves
            vec2 q = vec2(fbm(st * 2.0 + u_time * 0.15 + mouse), fbm(st * 2.0 - u_time * 0.1));
            float cosmicEnergy = fbm(st * 3.0 + 4.0 * q);
            cosmicEnergy = pow(cosmicEnergy, 3.5) * 4.0; // High contrast threshold

            // Stars / Speed Particles
            float starNoise = hash(gl_FragCoord.xy + floor(u_time * 12.0));
            float stars = pow(starNoise, 40.0) * 2.5;

            // Black & White Stark Monochromatic Palette
            vec3 voidBlack = vec3(0.0, 0.0, 0.0);
            vec3 neonWhite = vec3(1.0, 1.0, 1.0);
            vec3 midGray = vec3(0.25, 0.25, 0.28);

            vec3 col = mix(voidBlack, midGray, clamp(cosmicEnergy * 0.5, 0.0, 1.0));
            col += neonWhite * grid * 0.15; // Grid glow
            col += neonWhite * cosmicEnergy; // Energy blasts
            col += neonWhite * stars; // Hyper speed star dust

            // Vignette for dark outer space edge
            float vignette = 1.0 - length(st * 0.8);
            col *= clamp(vignette, 0.2, 1.0);

            gl_FragColor = vec4(col, 1.0);
        }
    `,
    depthWrite: false,
    depthTest: false
});

const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial);
scene.add(bgMesh);

// --- 2. HIGH-CONTRAST CHROME / NEON GLOW TEXT MATERIAL ---
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
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);

            // High intensity chrome / neon lighting
            vec3 lightDir = normalize(vec3(0.0, 1.0, 2.0));
            vec3 halfDir = normalize(lightDir + viewDir);

            // Ultra intense sharp specular
            float spec = pow(max(dot(normal, halfDir), 0.0), 64.0); 
            // Sharp stark rim highlight
            float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);

            vec3 baseBlack = vec3(0.05, 0.05, 0.05);
            vec3 starkWhite = vec3(1.0, 1.0, 1.0);

            // Metallic gradient
            float vertGradient = clamp((vPosition.y + 0.5), 0.0, 1.0);
            vec3 col = mix(baseBlack, starkWhite * 0.7, vertGradient);

            col += spec * starkWhite * 2.0; // High contrast bright spot
            col += rim * starkWhite * 1.5;  // Neon edge stroke

            gl_FragColor = vec4(col, 1.0);
        }
    `,
    transparent: true
});

// --- 3. HIGH-SPEED KINETIC CYBER PHYSICS ---
let textMesh = null;
let originalPositions = null;
let currentPositions = null;
let velocities = null;

// Rapid, snappy, hyper-responsive cybernetic spring physics
const springStiffness = 0.01; 
const springDamping = 0.01;   
const mouseForceRadius = 3.5;
const mouseForceStrength = 0.05; 
const maxVelocity = 0.05;
const maxDisplacement = 0.5;

let isMouseDown = false;
let isAnimatingPhysics = false;

const fontLoader = new THREE.FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new THREE.TextGeometry('KOCMOC', {
        font: font,
        size: 1.4,
        height: 0.4,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.04,
        bevelSegments: 4
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

// Raycasting & Event Handling
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

// --- 4. RENDER LOOP ---
function animate(time) {
    const timeInSeconds = time * 0.001;
    bgMaterial.uniforms.u_time.value = timeInSeconds;

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

            if (isMouseDown && dist < mouseForceRadius && dist > 0.05) {
                const force = (1.0 - dist / mouseForceRadius) * mouseForceStrength;
                velocities[idx] += (dx / dist) * force;
                velocities[idx + 1] += (dy / dist) * force;
                velocities[idx + 2] += force * 0.4;
            }

            const springX = (originalPositions[idx] - currentPositions[idx]) * springStiffness;
            const springY = (originalPositions[idx + 1] - currentPositions[idx + 1]) * springStiffness;
            const springZ = (originalPositions[idx + 2] - currentPositions[idx + 2]) * springStiffness;

            velocities[idx] = (velocities[idx] + springX) * springDamping;
            velocities[idx + 1] = (velocities[idx + 1] + springY) * springDamping;
            velocities[idx + 2] = (velocities[idx + 2] + springZ) * springDamping;

            velocities[idx] = Math.max(-maxVelocity, Math.min(maxVelocity, velocities[idx]));
            velocities[idx + 1] = Math.max(-maxVelocity, Math.min(maxVelocity, velocities[idx + 1]));
            velocities[idx + 2] = Math.max(-maxVelocity, Math.min(maxVelocity, velocities[idx + 2]));

            currentPositions[idx] += velocities[idx];
            currentPositions[idx + 1] += velocities[idx + 1];
            currentPositions[idx + 2] += velocities[idx + 2];

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

        posAttr.needsUpdate = true;

        if (!isMouseDown && totalDisplacement < 0.02) {
            isAnimatingPhysics = false;
        }
    }

    if (textMesh) {
        textMesh.position.y = window.scrollY * 0.008;

        // Sharp Techno Rotation
        textMesh.rotation.y = Math.sin(timeInSeconds * 0.8) * 0.08;
        textMesh.rotation.x = Math.cos(timeInSeconds * 0.6) * 0.05;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);