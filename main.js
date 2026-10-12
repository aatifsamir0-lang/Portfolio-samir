
import * as THREE from 'three';

/* ================================
   INITIALISATION
================================ */

const container = document.getElementById('scene-container');

if (!container) {
    throw new Error('Élément #scene-container introuvable.');
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
);

camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

/* ================================
   GROUPE PRINCIPAL
================================ */

const group = new THREE.Group();
scene.add(group);

/* ================================
   LUMIÈRES
================================ */

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const blueLight = new THREE.PointLight(0x4488ff, 35);
blueLight.position.set(3, 3, 4);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0x9944ff, 30);
purpleLight.position.set(-3, -2, 2);
scene.add(purpleLight);

/* ================================
   SPHÈRE CENTRALE
================================ */

const sphereGeometry = new THREE.IcosahedronGeometry(1.35, 2);

const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x151b48,
    metalness: 0.8,
    roughness: 0.23,
    emissive: 0x2025a0,
    emissiveIntensity: 0.7,
    flatShading: true
});

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
group.add(sphere);

/* ================================
   FIL DE FER
================================ */

const wireGeometry = new THREE.IcosahedronGeometry(1.39, 2);

const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x6b9cff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
});

const wireSphere = new THREE.Mesh(wireGeometry, wireMaterial);
group.add(wireSphere);

/* ================================
   ANNEAUX 3D
================================ */

const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.012, 8, 150),
    new THREE.MeshBasicMaterial({
        color: 0x8e6aff,
        transparent: true,
        opacity: 0.8
    })
);

ring1.rotation.x = 1.1;
ring1.rotation.y = 0.4;
group.add(ring1);

const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.009, 8, 150),
    new THREE.MeshBasicMaterial({
        color: 0x45baff,
        transparent: true,
        opacity: 0.7
    })
);

ring2.rotation.x = 0.4;
ring2.rotation.y = 1.2;
group.add(ring2);

/* ================================
   OBJETS 3D FLOTTANTS
================================ */

const floatingObjects = [];

const geometries = [
    new THREE.OctahedronGeometry(0.22),
    new THREE.TetrahedronGeometry(0.20),
    new THREE.IcosahedronGeometry(0.17)
];

const colors = [
    0x5ea7ff,
    0xa879ff,
    0x55e7ff
];

for (let i = 0; i < 9; i++) {
    const color = colors[i % colors.length];

    const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.7,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.35
    });

    const object = new THREE.Mesh(
        geometries[i % geometries.length],
        material
    );

    const angle = (i / 9) * Math.PI * 2;
    const radius = 2.5 + (i % 3) * 0.35;

    object.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.65,
        (i % 3 - 1) * 0.45
    );

    object.userData = {
        angle: angle,
        radius: radius,
        speed: 0.15 + (i % 4) * 0.07,
        phase: i * 0.7
    };

    group.add(object);
    floatingObjects.push(object);
}

/* ================================
   PARTICULES
================================ */

const count = 900;
const positions = new Float32Array(count * 3);

for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
    color: 0x829cff,
    size: 0.018,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(
    particlesGeometry,
    particlesMaterial
);

scene.add(particles);

/* ================================
   INTERACTION SOURIS
================================ */

const mouse = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = -(event.clientY / window.innerHeight - 0.5) * 2;
});

/* ================================
   ANIMATION
================================ */

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Rotation de la sphère
    sphere.rotation.y = time * 0.15;
    sphere.rotation.x = time * 0.08;

    // Rotation du fil de fer
    wireSphere.rotation.copy(sphere.rotation);

    // Rotation des anneaux
    ring1.rotation.z = time * 0.12;
    ring2.rotation.x = 0.4 + time * 0.08;

    // Réaction du groupe aux mouvements de la souris
    group.rotation.y +=
        (mouse.x * 0.35 - group.rotation.y) * 0.025;

    group.rotation.x +=
        (mouse.y * 0.2 - group.rotation.x) * 0.025;

    // Animation des objets flottants
    floatingObjects.forEach((object) => {
        const { angle, radius, speed, phase } = object.userData;
        const a = angle + time * speed;

        object.position.x = Math.cos(a) * radius;

        object.position.y =
            Math.sin(a) * radius * 0.65 +
            Math.sin(time + phase) * 0.12;

        object.rotation.x = time * 0.35 + phase;
        object.rotation.y = time * 0.5 + phase;
    });

    // Mouvement des particules
    particles.rotation.y = time * 0.012;

    renderer.render(scene, camera);
}

animate();

/* ================================
   RESPONSIVE / REDIMENSIONNEMENT
================================ */

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* ================================
   DARK / LIGHT MODE
================================ */

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');

        const isLight =
            document.body.classList.contains('light-mode');

        themeToggle.textContent = isLight ? '🌙' : '☀️';

        themeToggle.setAttribute(
            'aria-label',
            isLight
                ? 'Activer le thème sombre'
                : 'Activer le thème clair'
        );
    });
}