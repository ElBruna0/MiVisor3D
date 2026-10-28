
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.querySelector('#viewer');
const status = document.querySelector('#status');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(0, 1.2, 4);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

container.appendChild(renderer.domElement);

// Iluminación de la escena
scene.add(new THREE.HemisphereLight(0xffffff, 0x24242a, 2.1));

const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(4, 6, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x9bbcff, 2.0);
rim.position.set(-4, 2, -4);
scene.add(rim);

// Controles de cámara
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 0.3;
controls.maxDistance = 30;
controls.target.set(0, 0, 0);

// Carga del modelo 3D
let model = null;
const loader = new GLTFLoader();

loader.load(
  './models/model.glb',
  (gltf) => {
    model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.2 / maxDim;
    model.scale.setScalar(scale);

    camera.position.set(0, 0.35, 3.8);
    controls.target.set(0, 0, 0);
    controls.update();

    status.classList.add('hidden');
  },
  undefined,
  (error) => {
    console.error('No se pudo cargar models/model.glb:', error);

    status.innerHTML =
      '<strong>El visor está listo.</strong><br>' +
      'Falta el modelo 3D.<br>' +
      'Guarda el archivo .glb en la carpeta ' +
      '<code>models</code> con el nombre <code>model.glb</code> ' +
      'y recarga la página.<br><br>' +
      'Para abrir la página correctamente, sigue las instrucciones de LEEME.txt.';
  }
);

// Botón para restablecer la vista
document.querySelector('#reset').addEventListener('click', () => {
  camera.position.set(0, 0.35, 3.8);
  controls.target.set(0, 0, 0);
  controls.update();
});

// Botón de giro automático
let autoRotate = false;

document.querySelector('#rotate').addEventListener('click', (event) => {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;

  event.currentTarget.textContent =
    `Giro automático: ${autoRotate ? 'sí' : 'no'}`;
});

// Botón de pantalla completa
document.querySelector('#fullscreen').addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error(error);
  }
});

// Ajuste al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animación continua del visor
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
