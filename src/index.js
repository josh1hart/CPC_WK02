import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer;
let geometry, material, cube;
let colour, intensity, light;
let ambientLight;

let orbit;
let walker;

let listener, sound, audioLoader;

let clock, delta, interval;

let startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  //alert("We have initialised!")
  //remove overlay
  let overlay = document.getElementById("overlay");
  overlay.remove();
  //clock generator to ensure we can clamp some operations at different timed rates
  clock = new THREE.Clock();
  delta = 0;
  interval = 1 / 6; //12fps

  //create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfdfdf);
  //create camera
  camera = new THREE.PerspectiveCamera(
    75, //fov
    window.innerWidth / window.innerHeight, //aspect
    0.1, //near
    1000 //far
  );
  camera.position.z = 5;
  //specify our render and add it to our document
  renderer = new THREE.WebGL1Renderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  //create the orbit controls instace so we can use the mouse to move around our scene
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableZoom = true;

  //sound for single source and single listener
  listener = new THREE.AudioListener();
  camera.add(listener);
  sound = new THREE.PositionalAudio(listener);

  audioLoader = new THREE.AudioLoader();
  audioLoader.load(
    "./src/sounds/Gabriele100_Keyboard_Various-Keys_02.mp3",
    function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(10);
      sound.setRolloffFactor(0.9);
      sound.playbackRate = 10;
      sound.offset = 0.1;
      sound.setDirectionalCone(180, 230, 0.1);
      sound.setLoop(false);
      sound.setVolume(0.5);
    }
  );

  walker = new Walker(0, 0, 0);
  play();
  //lighting
  colour = 0xffffff;
  intensity = 1;
  light = new THREE.DirectionalLight(colour, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  //create a box to spin
  geometry = new THREE.BoxGeometry();
  material = new THREE.MeshNormalMaterial();
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

class Walker {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.dotGeometry = new THREE.DodecahedronBufferGeometry();
  }
  step() {
    let choice = THREE.MathUtils.randInt(0, 5);
    if (choice == 0) {
      this.x += 0.5;
    } else if (choice == 1) {
      this.x -= 0.5;
    } else if (choice == 2) {
      this.y += 0.5;
    } else if (choice == 3) {
      this.y -= 0.5;
    } else if (choice == 4) {
      this.z += 0.5;
    } else {
      this.z -= 0.5;
    }
    sound.offset = 0.0 + Math.random() * 0.05;
    sound.setVolume(0.8 + Math.random() * 0.1);
    sound.duration = 0.3;
    sound.play();

    this.dotMaterial = new THREE.MeshLambertMaterial({});
    this.dotMaterial.color = new THREE.Color(0.1, 0.5, 0.3);

    this.dot = new THREE.Mesh(this.dotGeometry, this.dotMaterial);
    this.dot.translateX(this.x);
    this.dot.translateY(this.y);
    this.dot.translateZ(this.z);
    scene.add(this.dot);
  }
}

//start animating
function play() {
  //using the new set animationloop method which means we are webxr ready if need be
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

//stop animating (not currentky used)
function stop() {
  renderer.setAnimationLoop(null);
}

//update function
function update() {
  orbit.update();
  //update stuff in here
  delta += clock.getDelta();

  if (delta > interval) {
    // The draw or time dependent code are here
    walker.step();
    delta = delta % interval;
  }
}

//simple render function
function render() {
  renderer.render(scene, camera);
}
