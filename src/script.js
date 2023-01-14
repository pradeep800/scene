import "./style.css";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
/**
 * spector js

 */
// var SPECTOR = require("spectorjs");

// var spector = new SPECTOR.Spector();
// spector.displayUI();
/**
 * Base
 */
// Debug
const gui = new dat.GUI({
  width: 200,
});
const debugObject = { clearColor: "#000000" };
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
/**
 * Object
 */

/**
 * baked texture
 */
const bakedTexture = textureLoader.load("baked.jpg");
/**
 * material
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const pointMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const pointLightMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffe5,
  side: THREE.DoubleSide,
});
bakedTexture.flipY = false;

/**
 * Model
 */

gltfLoader.load("portal.glb", (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });
  let poleLightAMesh = gltf.scene.children.find((child) => {
    return child.name == "polelight1";
  });
  let poleLightBMesh = gltf.scene.children.find((child) => {
    return child.name == "polelight2";
  });
  let pointLight = gltf.scene.children.find((child) => {
    return child.name == "point";
  });
  poleLightAMesh.material = pointLightMaterial;
  poleLightBMesh.material = pointLightMaterial;
  pointLight.material = pointMaterial;
  console.log(poleLightAMesh, poleLightBMesh, pointLight);
});
/**
 * fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry();
const fireFliesCout = 30;
const positionArray = new Float32Array(fireFliesCout * 3);
const scaleArray = new Float32Array(fireFliesCout);
for (let i = 0; i < fireFliesCout; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
  positionArray[i * 3 + 1] = Math.random() * 1.5;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
  scaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);
firefliesGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(scaleArray, 1)
);
//fireflies materil
const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uPixelRatio: { value: Math.min(2, window.devicePixelRatio) },
    uSize: { value: 100 },
    uTime: { value: 0 },
  },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

gui
  .add(firefliesMaterial.uniforms.uSize, "value")
  .min(0)
  .max(500)
  .step(1)
  .name("firefliesSize");
//point
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
debugObject.clearColor = "#201919";
renderer.setClearColor(debugObject.clearColor);
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.outputEncoding = THREE.sRGBEncoding;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  //update material
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
  //update fireflies
  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  );
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
