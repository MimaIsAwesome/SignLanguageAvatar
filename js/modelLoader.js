/**
 * Autor: Marek Lukac
 *
 * Generovanie modelu
 * Ovladanie modelu
 * Organizacia tlacidiel
 * Spustanie sekvencie znakov
 **/

import * as THREE from "./three.module.js";
import { FBXLoader } from "./FBXLoader.js";
import vectors from "../js/vectors.js";

const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
let bot;
const light = new THREE.DirectionalLight(0xffffff, 1);
const camera = new THREE.PerspectiveCamera(
  75,
  ((window.innerWidth * 0.8) / window.innerHeight) * 0.8,
  0.1,
  100
);
const renderer = new THREE.WebGL1Renderer({
  canvas: canvas,
});
const limbos = [];

const writeToFile = (bot) => {
  for (let i = 10; i < 33; i++) {
    if (i == 16 || i == 20 || i == 24 || i == 28 || i == 32) {
      continue;
    }
    console.log(
      "{x:" +
        bot.skeleton.bones[i].rotation._x.toFixed(2) +
        ",y:" +
        bot.skeleton.bones[i].rotation._y.toFixed(2) +
        ",z:" +
        bot.skeleton.bones[i].rotation._z.toFixed(2) +
        "},"
    );
  }

  for (let i = 34; i < 57; i++) {
    if (i == 40 || i == 44 || i == 48 || i == 52 || i == 56) {
      continue;
    }
    console.log(
      "{x:" +
        bot.skeleton.bones[i].rotation._x.toFixed(2) +
        ",y:" +
        bot.skeleton.bones[i].rotation._y.toFixed(2) +
        ",z:" +
        bot.skeleton.bones[i].rotation._z.toFixed(2) +
        "},"
    );
  }
};

const init = () => {
  // lights setup
  light.position.set(2, 2, 3);
  scene.add(light);

  // camera setup
  camera.position.set(0, 1.25, 1);
  camera.rotation.set(0, 0, 0);
  scene.add(camera);

  // scene bg
  scene.background = new THREE.Color(0xffffff);

  // renderer setup
  renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.7);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enable = true;
  renderer.gamaOutput = true;
};

// model loader
const fbxLoader = new FBXLoader();
fbxLoader.load(
  "../assets/ybot_A_6.fbx",
  (object) => {
    object.scale.set(0.01, 0.01, 0.01);
    object.position.set(0, 0, 0);
    bot = object.children[2];
    scene.add(object);
    defineBones(bot);
    // initial button state
    updateRotation("A");
    checkButton("A");
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

// window resizer
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = ((window.innerWidth * 0.7) / window.innerHeight) * 0.7;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.7);
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  TWEEN.update();
  render();
}

init();
animate();

// get all bones from model
const defineBones = (bot) => {
  const skeleton = bot.skeleton;

  for (let i = 10; i < 33; i++) {
    if (i == 16 || i == 20 || i == 24 || i == 28 || i == 32) {
      continue;
    }
    limbos.push(skeleton.bones[i]);
  }

  for (let i = 34; i < 57; i++) {
    if (i == 40 || i == 44 || i == 48 || i == 52 || i == 56) {
      continue;
    }
    limbos.push(skeleton.bones[i]);
  }
};

// change bone rotation
let lastChar = "A";
const updateRotation = (char) => {
  if (bot) {
    for (let i = 0; i < 36; i++) {
      let tween = new TWEEN.Tween(limbos[i].rotation)
        .to(
          vectors[char][i],
          document.getElementById("checker").checked ? 700 : 3000
        )
        .delay(100);
      tween.start();
      lastChar = char;
    }
  }
};

const buttons = Array.prototype.slice.call(
  document.getElementsByTagName("button")
);
// setup all event listeners
const initBtns = () => {
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.id.length < 3) {
        updateRotation(btn.id);
        clearBtns();
        btn.setAttribute(
          "style",
          "background: #2196F3; color: white; box-shadow: 5px 5px #333"
        );
      }
    });
  });
};
initBtns();

// clear buttons
const clearBtns = () => {
  buttons.forEach((btn) => {
    btn.setAttribute("style", "background: red, color: #333");
  });
};

// disable buttons
const disableBtns = () => {
  buttons.forEach((btn) => {
    if (btn.id.length < 3) {
      btn.disabled = !btn.disabled;
    }
  });
};

// clear intervals
const clearIntervals = (interval) => {
  interval.forEach((int) => {
    clearInterval(int);
  });
};

// check buttons
const checkButton = (char) => {
  document
    .getElementById(char)
    .setAttribute(
      "style",
      "background: #2196F3; color: white; box-shadow: 5px 5px #333"
    );
};

// change button inner html
const changeRunToStopBtn = () => {
  isRunning ? (buttonState = "Stop") : (buttonState = "Run");
  isRunning = !isRunning;
  runButton.innerHTML = "<h3>" + buttonState + "</h3>";
};

const textInputSeq = document.getElementById("text-input");
const runButton = document.getElementById("btn-run");
const checker = document.getElementById("checker");
let buttonState = "Run";
let isRunning = true;
let interval = [];

// start seq of signs
const runTextSeq = () => {
  changeRunToStopBtn();
  clearBtns();
  disableBtns();

  // depends on isRunning value
  // run just on true
  if (!isRunning) {
    checker.disabled = true;

    // filter out non char values
    let charsToRun = textInputSeq.value
      .toUpperCase()
      .split("")
      .filter((ch) => ch.match(/[a-z]/i));

    textInputSeq.value = charsToRun.join("");
    let totalTime = 0;

    // run rotation for every char in seq
    charsToRun.forEach((char, index) => {
      let time = checker.checked ? 700 : 3000;
      totalTime = index * time + 200 * index + time;
      interval[index] = setTimeout(() => {
        updateRotation(char);
      }, index * time + 200 * index);
    });

    // clear intervals, set value to "" and check last button
    let int = setTimeout(() => {
      disableBtns();
      clearIntervals(interval);
      textInputSeq.value = "";
      interval = [];
      changeRunToStopBtn();
      checkButton(lastChar);
      checker.disabled = false;
    }, totalTime);

    interval.push(int);

  //otherwise clear intervals, set value to "" and check last button
  } else {
    clearIntervals(interval);
    textInputSeq.value = "";
    interval = [];
    checker.disabled = false;
    checkButton(lastChar);
  }
};

runButton.addEventListener("click", runTextSeq);
