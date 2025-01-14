import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;

init();

function init() {
    container = document.getElementById('container');
    if (!container) {
        console.error("Container element with id 'container' not found.");
        return;
    }

    initRenderer();
    initScene();
    initCamera();
    initSun();
    initWater();
    initSky();
    initBox();
    initControls();
    initStats();
    initGUI();

    window.addEventListener('resize', onWindowResize);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    container.appendChild(renderer.domElement);
}

function initScene() {
    scene = new THREE.Scene();
}

function initCamera() {
    // Increase the FOV for a wider view
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50000);  // FOV increased, far plane set to 50000
    camera.position.set(40, 30, 100);  // Adjust camera position to make the environment appear larger
}

function initSun() {
    sun = new THREE.Vector3();
}

function initWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    // Create the top water surface
    water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
            'https://threejs.org/examples/textures/waternormals.jpg',
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),
        sunDirection: new THREE.Vector3(0, 1, 0),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    });

    water.rotation.x = -Math.PI / 2;
    water.position.y = 0; // Top surface position
    water.material.transparent = true; // Enable transparency
    water.material.side = THREE.DoubleSide; // Render both sides of the water
    scene.add(water);

    // // Create the bottom water surface (duplicate with adjustments)
    // const bottomWater = new Water(waterGeometry, {
    //     textureWidth: 512,
    //     textureHeight: 512,
    //     waterNormals: new THREE.TextureLoader().load(
    //         'https://threejs.org/examples/textures/waternormals.jpg',
    //         (texture) => {
    //             texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //         }
    //     ),
    //     sunDirection: new THREE.Vector3(0, 1, 0),
    //     sunColor: 0xffffff,
    //     waterColor: 0x001e0f,
    //     distortionScale: 3.7,
    //     fog: scene.fog !== undefined
    // });

    // bottomWater.rotation.x = -Math.PI / 2;
    // bottomWater.position.y = -500; // Position below the top surface
    // bottomWater.material.transparent = true; // Enable transparency
    // bottomWater.material.side = THREE.DoubleSide; // Render both sides of the water
    // scene.add(bottomWater);
}




function initSky() {
    const sky = new Sky();
    sky.scale.setScalar(10000);  // Increase the scale for a more expansive sky
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.5;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    let renderTarget;

    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        if (renderTarget !== undefined) renderTarget.dispose();

        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;
    }

    updateSun();
}

function initBox() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('pablooo.jpg');
    const geometry = new THREE.BoxGeometry(60, 60, 60);
    const material = new THREE.MeshStandardMaterial({ 
        map: texture, 
        roughness: 0.5, 
        metalness: 3 
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 100, 0); // Set a fixed position above the water
    scene.add(mesh);
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 50, 0);  // Adjusted the target to (0, 50, 0) for a better view
    controls.minDistance = 40.0;
    controls.maxDistance = 10000.0;  // Increased max zoom distance to allow a wider view of the environment
    controls.update();
}

function initStats() {
    stats = new Stats();
    container.appendChild(stats.dom);
}

function initGUI() {
    const gui = new GUI();

    const folderSky = gui.addFolder('Sky');
    folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(updateSun);
    folderSky.open();

    const waterUniforms = water.material.uniforms;

    const folderWater = gui.addFolder('Water');
    folderWater.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
    folderWater.add(waterUniforms.size, 'value', 0.1, 10, 0.1).name('size');
    folderWater.open();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    render();
    stats.update();
}

function render() {
    const time = performance.now() * 0.001;

    // Remove the box oscillation, keep it fixed at y = 60 (above the water)
    if (mesh) {
        mesh.rotation.x = time * 0.5;
        mesh.rotation.z = time * 0.51;
    }

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
}
