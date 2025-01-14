import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

let scene, camera, renderer, controls, loadingScreen;
let sun, sky, sunLight;
let assetsToLoad = 0;
let assetsLoaded = 0;

function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 10, 100);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 50, 10);
    scene.add(sunLight);
}

function addSky() {
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 3;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.7;

    const sunPosition = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(90 - 20);
    const theta = THREE.MathUtils.degToRad(180);
    sunPosition.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sunPosition);
    sunLight.position.copy(sunPosition.multiplyScalar(450000));
}

function addGround() {
    assetsToLoad++;
    const groundTexture = new THREE.TextureLoader().load('./public/brown_mud_leaves_01_diff_4k.jpg', () => {
        checkAssetsLoaded();
    });
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(20, 20);

    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
}

function addLake() {
    const waterGeometry = new THREE.CircleGeometry(5, 32);
    const water = new Water(waterGeometry, {
        color: 0x001e0f,
        scale: 1,
        flowDirection: new THREE.Vector2(1, 1),
        textureWidth: 1024,
        textureHeight: 1024,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.01;
    scene.add(water);
    checkAssetsLoaded();
}

function addTrees() {
    assetsToLoad++;
    const loader = new GLTFLoader();
    loader.load('./public/island_tree_01_4k.gltf', (gltf) => {
        for (let i = 0; i < 50; i++) {
            const tree = gltf.scene.clone();
            tree.position.set(
                Math.random() * 40 - 20,
                0,
                Math.random() * 40 - 20
            );
            tree.scale.set(0.5, 0.5, 0.5);
            scene.add(tree);
        }
        checkAssetsLoaded();
    });
}

function addSoldierModel() {
    const loader = new GLTFLoader();
    loader.load(
        './public/Army_Models/Soldier.glb', // Correct path relative to index.html
        (gltf) => {
            const soldier = gltf.scene;
            soldier.scale.set(1, 1, 1);
            soldier.position.set(0, 0, 0);
            scene.add(soldier);
            console.log('Soldier model loaded successfully');
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
            console.error('An error occurred while loading the Soldier model:', error);
        }
    );
}


function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

function checkAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === assetsToLoad) {
        loadingScreen.style.display = 'none';
        animate();
    }
}

function handleResize() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function initLoadingScreen() {
    loadingScreen = document.getElementById('loading');
}

function init() {
    console.log("Initializing...");
    initLoadingScreen();
    initScene();
    initCamera();
    initRenderer();
    initControls();
    addLighting();
    addSky();
    addGround();
    addLake();
    addTrees();
    addSoldierModel();
    handleResize();
    animate();
}

init();
