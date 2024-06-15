import * as THREE from "three";
import {OrbitControls} from 'jsm/controls/OrbitControls.js';

const w = window.innerWidth;
const h = window.innerHeight;

//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const cameraDistance = 4;
let useAnimatedCamera = true;

//renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

//3d control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// controls.dampingFactor = 0.3;

//light
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

//earth group
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180; //rotate earth
scene.add(earthGroup);

//earth
const detail = 16;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

//earth night view
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"), blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

//earth clouds
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'), // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

//moon
const moonGroup = new THREE.Group(); //moon group
scene.add(moonGroup);
const moonMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/moonmap4k.jpg"), bumpMap: loader.load("./textures/moonbump4k.jpg"), bumpScale: 2,
})
const moonMesh = new THREE.Mesh(geometry, moonMat);
moonMesh.position.set(3, 0, 0);
moonMesh.scale.setScalar(0.27);
moonGroup.add(moonMesh);

// stars
const stars = addStar(2000);
scene.add(stars);

function addStar(size = 500) {
  const starGeometry = new THREE.BufferGeometry();
  const startMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.1});
  const star = new THREE.Points(starGeometry, startMaterial);

  const startVertices = [];
  for (let i = 0; i < size; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    startVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(startVertices, 3))

  return star;
}


function animate(t = 0) {
  requestAnimationFrame(animate);
  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  moonGroup.rotation.y -= 0.005;
  // stars.rotation.y += 0.0002;
  renderer.render(scene, camera);
  if (useAnimatedCamera) {
    let time = t * 0.0002;
    camera.position.x = Math.cos(time * 0.9) * cameraDistance;
    camera.position.y = Math.cos(time * 0.9) * 2;
    camera.position.z = Math.sin(time * 0.9) * cameraDistance;
    camera.lookAt(0, 0, 0);
  } else {
    controls.update();
  }
  document.addEventListener('mousedown', () => {
    useAnimatedCamera = false;
  });
  document.addEventListener('dblclick', () => {
    useAnimatedCamera = true;
  });
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
window.addEventListener('resize', handleWindowResize, false);
