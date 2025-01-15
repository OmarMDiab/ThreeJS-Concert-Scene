import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from "https://cdn.rawgit.com/mrdoob/three.js/master/examples/jsm/loaders/GLTFLoader.js"
import { FontLoader } from "https://cdn.rawgit.com/mrdoob/three.js/master/examples/jsm/loaders/FontLoader.js"
import { TextGeometry } from "https://cdn.rawgit.com/mrdoob/three.js/master/examples/jsm/geometries/TextGeometry.js"
let container, stats;
let camera, scene, renderer;
let controls, water, sun, box1, box2,music=false,donald;

// Define a global clock
const clock = new THREE.Clock();
// Move parameters to a global scope
const parameters = {
    elevation: 2,
    azimuth: 180
};

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
    initIsland();
    initWelcomeModel();	
    //initBox();
    initConcert();
    initAudience();
    initLightHouse();
    initWhale();
    initBird();
    initVideo();
    initLasers();
    initPhoenix();
    initClassicShip();
    initEaster_island_head();
    initHouse();
    //initstarwarsTropper();
    initSkeleton();
    // initDonald();
    initYacht();
    initClouds();
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
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 10000);  // FOV increased, far plane set to 50000
    camera.position.set(40, 200, 100);  // Adjust camera position to make the environment appear larger
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
    folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(() => {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    });
    folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(() => {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    });
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
    if (box1) {
        box1.rotation.x = time * 0.5;
        box1.rotation.z = time * 0.51;
    }
    if (box2) {
        box2.rotation.x = time * 0.5;
        box2.rotation.z = time * 0.51;
    }

    water.material.uniforms['time'].value += 1.0 / 60.0;

    renderer.render(scene, camera);
}


function initBox() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('pablooo.jpg');
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 3
    });

    // Create the first box
    box1 = new THREE.Mesh(geometry, material);
    box1.position.set(-100, 0, 0); // Set position to one corner of the island
    scene.add(box1);

    // // Create the second box
    // box2 = new THREE.Mesh(geometry, material);
    // box2.position.set(50, 100, 50); // Set position to the opposite corner of the island
    // scene.add(box2);
}

function initConcert() {
    const loader = new GLTFLoader();

    loader.load(
        'public/concert.glb',
        (gltf) => {
            const Concert = gltf.scene;
            Concert.position.set(1000, -20, 0);
            Concert.rotation.y = 1;
            Concert.scale.set(0.5, 0.5, 0.5);
            scene.add(Concert);
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the Concert:', error);
        }
    );
}

function initLasers() {
    const loader = new GLTFLoader();
    loader.load(
        'public/laser_light.glb',
        (gltf) => {
            const lasers = gltf.scene;
            lasers.position.set(1000, 100, 40);
            lasers.rotation.y = 1;
            lasers.scale.set(10, 10, 10);
            scene.add(lasers);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(lasers); // Animation mixer for lasers
                const clock = new THREE.Clock();                // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateLasers() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    requestAnimationFrame(animateLasers);
                }

                animateLasers(); // Start animation loop
            } else {
                console.warn("No animations found in the lasers model.");
            }
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the lasers:', error);
        }
    );
}

function initAudience() {
    const loader = new GLTFLoader();
    loader.load(
        'public/people/audience.glb',
        (gltf) => {
            const audience = gltf.scene;
            audience.position.set(1000, 100, 30);
            audience.rotation.y = 1;
            audience.scale.set(10, 10, 10);
            scene.add(audience);
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the audience:', error);
        }
    );
}
function initVideo() {
    const video = document.createElement('video');
    const soundEffect = new Audio('public/sounds/click.mp3'); // Button click sound
    const songs = ['public/sounds/Karma_pablo.mp4', 'public/sounds/Melody_pablo.mp4', 'public/sounds/Mabda2_pablo.mp4']; // Add more songs here
    let currentSongIndex = 0;

    video.src = songs[currentSongIndex];
    video.loop = true;
    video.muted = false;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    const geometry = new THREE.PlaneGeometry(16 * 45, 9 * 45);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(690, 210, -210);
    plane.rotation.y = 1; // Rotate the plane to make it vertical and face the camera
    scene.add(plane);

    // Create the 3D button as a mesh (using a box geometry for the button)
    const buttonGeometry = new THREE.BoxGeometry(40, 20, 10); // Increased size of the button
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x32cd32 }); // Dodger blue color for the button 0x32cd32
    const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
    buttonMesh.position.set(1200, 210, -200); // Position the button in front of the video screen
    scene.add(buttonMesh);

    // Create the next song button
    const nextButtonGeometry = new THREE.BoxGeometry(40, 20, 10);
    const nextButtonMaterial = new THREE.MeshBasicMaterial({ color: 0x1e90ff }); // Lime green color for the next button
    const nextButtonMesh = new THREE.Mesh(nextButtonGeometry, nextButtonMaterial);
    nextButtonMesh.position.set(1200, 180, -200); // Position the next button below the play button
    scene.add(nextButtonMesh);

    // Add text to the buttons
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry('Play Music', {
            font: font,
            size: 4, // Adjust size to fit on the button
            depth: 1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-16, -2, 5.1); // Position the text on the button
        buttonMesh.add(textMesh); // Add text as a child of the button

        const nextTextGeometry = new TextGeometry('Next Song', {
            font: font,
            size: 4,
            depth: 1,
        });
        const nextTextMesh = new THREE.Mesh(nextTextGeometry, textMaterial);
        nextTextMesh.position.set(-16, -2, 5.1); // Position the text on the next button
        nextButtonMesh.add(nextTextMesh); // Add text as a child of the next button

        // Animate the buttons and text rotation
        function animateButton() {
            buttonMesh.rotation.y += 0.03;
            nextButtonMesh.rotation.y += 0.03;
            requestAnimationFrame(animateButton);
        }
        animateButton();
    });

    // Add raycasting to detect mouse click on the 3D buttons
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false); // To detect mouse hover

    // Button scaling on hover
    function onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the mouse coordinates
        raycaster.setFromCamera(mouse, camera); // 'camera' is the perspective camera in your scene

        // Check for intersections between the ray and the buttons
        const intersects = raycaster.intersectObjects([buttonMesh, nextButtonMesh]);

        if (intersects.length > 0) {
            intersects[0].object.scale.set(1.1, 1.1, 1); // Scale up when hovered
        } else {
            buttonMesh.scale.set(1, 1, 1); // Return to original size
            nextButtonMesh.scale.set(1, 1, 1); // Return to original size
        }
    }

    function onMouseClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster with the mouse coordinates
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections between the ray and the buttons
        const intersects = raycaster.intersectObjects([buttonMesh, nextButtonMesh]);
        

        if (intersects.length > 0) {
            if (intersects[0].object === buttonMesh) {
                // Play video and button click sound
                video.play().catch(error => {
                    console.error('Error attempting to play video:', error);
                });
                soundEffect.play(); // Play the sound effect
                music=true;
                initDonald();
                initstarwarsTropper();

                // Make the button disappear
                buttonMesh.visible = false;
            } else if (intersects[0].object === nextButtonMesh) {
                // Switch to the next song
                currentSongIndex = (currentSongIndex + 1) % songs.length;
                video.src = songs[currentSongIndex];
                video.play().catch(error => {
                    console.error('Error attempting to play video:', error);
                });
                soundEffect.play(); // Play the sound effect
            }
        }
    }

    // Adjust sound volume based on camera distance
    function adjustVolume() {
        const distance = camera.position.distanceTo(plane.position);
        const maxDistance = 3500; // Maximum distance for full volume
        const minDistance = 200; // Minimum distance for zero volume

        // Calculate volume based on distance
        let volume = 1 - (distance - minDistance) / (maxDistance - minDistance);
        volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1

        video.volume = volume;
        requestAnimationFrame(adjustVolume);
    }

    adjustVolume(); // Start adjusting volume
}






function initEaster_island_head() {
    const loader = new GLTFLoader();
    loader.load(
        'public/easter_island_head.glb',
        (gltf) => {
            const island = gltf.scene;
            island.position.set(1000, -20, 0); // Position inside the concert
            island.rotation.y = 1;
            island.scale.set(1, 1, 1);
            scene.add(island);
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the island:', error);
        }
    );
}


function initClouds() {
    const loader = new GLTFLoader();
    const cloudPositions = Array.from({ length: 30 }, () => ({
        x: Math.random() * 8000 - 4000,
        y: 1000,
        z: Math.random() * 8000 - 4000
    }));

    loader.load('public/clouds/scene.gltf', function (gltf) {
        cloudPositions.forEach(position => {
            const cloud = gltf.scene.clone();
            cloud.position.set(position.x, position.y, position.z);
            cloud.scale.set(0.5, 0.5, 0.5);
            scene.add(cloud);

            // Animate clouds
            function animateClouds() {
                cloud.position.x += 0.5;
                if (cloud.position.x > 5000) {
                    cloud.position.x = -5000;
                }
                requestAnimationFrame(animateClouds);
            }
            animateClouds();
        });
    }, undefined, function (error) {
        console.error('An error happened while loading the clouds:', error);
    });
}



// houses models >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function initLightHouse() {
    const loader = new GLTFLoader();

    loader.load(
        'public/lighthouse_on_a_sea_rock.glb',
        (gltf) => {
            const lightHouse = gltf.scene;
            lightHouse.position.set(3000, 2, 2000);  // Adjust position if needed
            lightHouse.scale.set(5, 5, 5);           // Adjust scale if needed
            scene.add(lightHouse);
        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the lighthouse:', error);
        }
    );
}

function initHouse() {
    const loader = new GLTFLoader();

    loader.load(
        'public/house.glb',
        function (gltf) {
            const house = gltf.scene;
            house.position.set(-1000,20, -3000); // Initial position
            house.scale.set(150, 150, 150);         // Adjust scale as needed
            house.rotation.y = 1;

            scene.add(house);
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the house:', error);
        }
    );
}

function initSkeleton() {
    const loader = new GLTFLoader();

    loader.load(
        'public/people/spooky_skeleton_dance_1.glb',
        function (gltf) {
            const skeleton = gltf.scene;
            skeleton.position.set(-500, 20, -2500); // Initial position
            skeleton.scale.set(50, 50, 50);       // Adjust scale as needed
            skeleton.rotation.y = 1;

            scene.add(skeleton);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(skeleton); // Animation mixer for skeleton
                const clock = new THREE.Clock();                // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateSkeleton() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    requestAnimationFrame(animateSkeleton);
                }

                animateSkeleton(); // Start animation loop
            } else {
                console.warn("No animations found in the skeleton model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the skeleton:', error);
        }
    );
}
function initYacht(){
    const loader = new GLTFLoader();

    loader.load(
        'public/ships/yatch_ii.glb',
        function (gltf) {
            const yacht = gltf.scene;
            yacht.position.set(-500, -50, -1500); // Initial position
            yacht.scale.set(30, 30, 30);       // Adjust scale as needed
            yacht.rotation.y = -1;

            scene.add(yacht);
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the yacht:', error);
        }
    );
}

function initDonald() {
    const loader = new GLTFLoader();

    loader.load(
        'public/people/donald.glb',
        function (gltf) {
            donald = gltf.scene;
            donald.position.set(800, 10, 200); // Initial position
            donald.scale.set(50, 50, 50);       // Adjust scale as needed
            donald.rotation.y = 1;

            scene.add(donald);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0 && music) {
                const mixer = new THREE.AnimationMixer(donald); // Animation mixer for donald
                const clock = new THREE.Clock();                // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateDonald() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    requestAnimationFrame(animateDonald);
                }

                animateDonald(); // Start animation loop
            } else {
                console.log("No animations found in the donald model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the donald:', error);
        }
    );
}

function initstarwarsTropper() {
    const loader = new GLTFLoader();

    loader.load(
        'public/people/dancing_stormtrooper.glb',
        function (gltf) {
            const Tropper = gltf.scene;
            Tropper.position.set(1100, 10, -250); // Initial position
            Tropper.scale.set(50, 50, 50);       // Adjust scale as needed
            Tropper.rotation.y = 1;

            scene.add(Tropper);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0 && music) {
                const mixer = new THREE.AnimationMixer(Tropper); // Animation mixer for Tropper
                const clock = new THREE.Clock();                // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateDonald() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    requestAnimationFrame(animateDonald);
                }

                animateDonald(); // Start animation loop
            } else {
                console.log("No animations found in the Tropper model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the Tropper:', error);
        }
    );
}

// ships models >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//public\ships\classic_ship.glb
function initClassicShip() {
    const loader = new GLTFLoader();

    loader.load(
        'public/ships/classic_ship.glb',
        function (gltf) {
            const ship = gltf.scene;
            ship.position.set(2100, -10, 1000); // Position beside the lighthouse
            ship.scale.set(20, 20, 20);       // Adjust scale as needed
            ship.rotation.y = -1;

            scene.add(ship);
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the ship:', error);
        }
    );
}












// Animals models >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function initWhale() {
    const loader = new GLTFLoader();

    loader.load(
        'public/animals/whale_of_the_veil_-_stylized_animated_model/scene.gltf',
        function (gltf) {
            const whale = gltf.scene;
            whale.position.set(-3000, -10, 0); // Initial position
            whale.scale.set(90, 90, 90);         // Adjust scale as needed
            whale.rotation.y = 0;

            scene.add(whale);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(whale); // Animation mixer for whale
                const clock = new THREE.Clock();                // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateWhale() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    whale.position.z += 0.8;
                    whale.rotation.z += 0.004;
                    if (whale.position.z > 5000) {
                        whale.position.z = -5000;
                    }


                    requestAnimationFrame(animateWhale);
                }

                animateWhale(); // Start animation loop
            } else {
                console.warn("No animations found in the whale model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the whale:', error);
        }
    );
}



function initPhoenix() {
    const loader = new GLTFLoader();

    loader.load(
        'public/animals/phoenix_bird.glb',
        function (gltf) {
            const phoenix = gltf.scene;
            phoenix.position.set(2000, 400, -3000); // Initial position
            phoenix.scale.set(0.5, 0.5, 0.5);       // Adjust scale as needed
            phoenix.rotation.y = -1;

            scene.add(phoenix);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(phoenix); // Animation mixer for bird
                const clock = new THREE.Clock();              // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animatePhoenix() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    phoenix.position.z += 1;
                    if (phoenix.position.z > 4000) {
                        phoenix.position.z = -4000;
                    }

                    requestAnimationFrame(animatePhoenix);
                }

                animatePhoenix(); // Start animation loop
            } else {
                console.warn("No animations found in the bird model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the bird:', error);
        }
    );
}



function initBird() {
    const loader = new GLTFLoader();

    loader.load(
        'public/animals/birds.glb',
        function (gltf) {
            const bird = gltf.scene;
            bird.position.set(-3000, 800, 0); // Initial position
            bird.scale.set(70, 70, 70);       // Adjust scale as needed
            bird.rotation.y = -1.5;

            scene.add(bird);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(bird); // Animation mixer for bird
                const clock = new THREE.Clock();              // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateBird() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    bird.position.x += 0.5;
                    if (bird.position.x > 5000) {
                        bird.position.x = -5000;
                    }

                    requestAnimationFrame(animateBird);
                }

                animateBird(); // Start animation loop
            } else {
                console.warn("No animations found in the bird model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the bird:', error);
        }
    );
}

function initIsland() {
    const loader = new GLTFLoader();

    loader.load(
        'public/fort_island_in_the_park.glb',
        function (gltf) {
            const island = gltf.scene;
            island.position.set(0, -10, 2500); // Initial position
            island.scale.set(100, 100, 100);       // Adjust scale as needed
            island.rotation.y = 1;

            scene.add(island);
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the island:', error);
        }
    );
}

function initWelcomeModel(){
    const loader = new GLTFLoader();

    loader.load(
        'public/welcome_3d_text_logo.glb',
        function (gltf) {
            const welcome = gltf.scene;
            welcome.position.set(0, 1200, 0); // Initial position
            welcome.scale.set(200, 200, 200);       // Adjust scale as needed
            welcome.rotation.y = 1;

            scene.add(welcome);

            // Check if animations exist
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(welcome); // Animation mixer for bird
                const clock = new THREE.Clock();              // Clock for animation timing

                // Play all animations (modify if you want specific animations)
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });

                // Animation loop
                function animateWelcome() {
                    const delta = clock.getDelta(); // Time since last frame
                    mixer.update(delta);            // Update animations

                    requestAnimationFrame(animateWelcome);
                }

                animateWelcome(); // Start animation loop
            } else {
                console.warn("No animations found in the welcome model.");
            }
        },
        undefined,
        function (error) {
            console.error('An error happened while loading the welcome:', error);
        }
    );

}