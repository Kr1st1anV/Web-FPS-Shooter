import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { Octree } from 'three/examples/jsm/Addons.js'
import { Capsule } from 'three/examples/jsm/Addons.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { PlayerController } from './playerControls'
import { io } from "socket.io-client";
const socket = io();
const otherPlayers = {};

//FPS Checker
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const blocker = document.createElement('div');
blocker.id = 'blocker';
blocker.innerHTML = `
    <div id="instructions">
        <b style="font-size:36px">CLICK TO PLAY</b><br />
        ( W, A, S, D = Move , Space = Jump , Mouse = Look )
    </div>
`;
// Add some basic CSS
Object.assign(blocker.style, {
    position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex',
    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
    cursor: 'pointer', zIndex: '200', userSelect: "none", webkitUserSelect: "none", mozUserSelect: "none", msUserSelect: "none"});
document.body.appendChild(blocker);

blocker.addEventListener('click', () => {
    document.body.requestPointerLock({ unadjustedMovement: true });
    document.documentElement.requestFullscreen();
});

// Hide/Show blocker based on lock state
document.addEventListener('pointerlockchange', () => {
    blocker.style.display = (document.pointerLockElement === document.body) ? 'none' : 'flex';
});

//Crosshair
const style = document.createElement('style');
style.innerHTML = `
    #crosshair {
        position: fixed;
        top: 50%; left: 50%;
        width: 16px; height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 100;
    }
    #crosshair::after {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        width: 4px; height: 4px;
        background: red;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
`;
document.head.appendChild(style);

// Create the element
const crosshair = document.createElement('div');
crosshair.id = 'crosshair';
document.body.appendChild(crosshair);

//Setup Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x00c0ff)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
scene.add(ambientLight)

//Setup Camera - StereoCamera Research
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

//Setup Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setAnimationLoop( animate )
document.body.appendChild( renderer.domElement )

const worldOctree = new Octree()
const spawn = new THREE.Vector3(10,0,0)
const playerHitbox = new Capsule(new THREE.Vector3(spawn.x ,0.35, spawn.z),
                                 new THREE.Vector3(spawn.x, 1.0, spawn.z), 
                                 0.35)

//Setup Floor
const floorGeo = new THREE.BoxGeometry(50,50)
const floorMat = new THREE.MeshStandardMaterial( { color: 0xa6ff33 })
const floor = new THREE.Mesh( floorGeo, floorMat )
floor.rotateX(Math.PI/2)
scene.add(floor)
worldOctree.fromGraphNode(floor)

//Wall Geo and Mat
const geometry = new THREE.BoxGeometry( 10, 1.5, 10 )
const material = new THREE.MeshStandardMaterial( { color: 0x555555 } )
const cube = new THREE.Mesh( geometry, material )
scene.add( cube )
worldOctree.fromGraphNode(cube)

for (let i = 0; i < 2; i++) {
    const wallGeo = new THREE.BoxGeometry( 1, 4, 10 )
    const wallMat = new THREE.MeshStandardMaterial( { color: 0x555555} )
    const wall = new THREE.Mesh( wallGeo, wallMat )
    wall.position.x = 20 * (-1)**(i) 
    wall.position.y = 2
    scene.add( wall )
    worldOctree.fromGraphNode(wall)
}

for (let i = 0; i < 2; i++) {
    const wallGeo = new THREE.BoxGeometry( 1, 4, 10 )
    const wallMat = new THREE.MeshStandardMaterial( { color: 0x555555 } )
    const wall = new THREE.Mesh( wallGeo, wallMat )
    wall.position.z = 20 * (-1)**(i) 
    wall.position.y = 2
    wall.rotateY(Math.PI/2)
    scene.add( wall )
    worldOctree.fromGraphNode(wall)
}

//const controls = new FirstPersonControls(camera, renderer.domElement) - Cool concept with FirstPersonControls - Grappling Movement


//When adding maps
// loader.load('map.glb', (gltf) => {
//     scene.add(gltf.scene);
//     worldOctree.fromGraphNode(gltf.scene);
// });

const player = new PlayerController(camera, playerHitbox, worldOctree, socket)

// Function to create a visual mesh for other players
function createOtherPlayerMesh(id, initialData) {
    const radius = 0.35;
    const geometryHeight = 0.3;
    const geo = new THREE.CapsuleGeometry(radius, geometryHeight);
    
    geo.translate(0, 0.5, 0); 

    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geo, mat);

    if (initialData) {
        mesh.position.set(initialData.position.x, initialData.position.y, initialData.position.z);
        mesh.targetPosition = new THREE.Vector3().copy(mesh.position);
    }
    mesh.targetRotationY = 0;
    mesh.targetCrouch = false;

    scene.add(mesh);
    otherPlayers[id] = mesh;
}

socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach((id) => {
        if (id !== socket.id) createOtherPlayerMesh(id, players[id]);
    });
});

//Game Loop
const clock = new THREE.Clock()
const max_steps = 5

function animate() {
    stats.begin()
    const delta = Math.min(0.05, clock.getDelta())
  
    for (let i = 0; i < max_steps; i++) {
        player.update(delta / max_steps)
    }

    for(let id in otherPlayers) {
        const puppet = otherPlayers[id]

        // Replace the rotation lerp inside animate() with this:
        let diff = puppet.targetRotationY - puppet.rotation.y;

    // Normalize the angle so it takes the shortest turn
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    puppet.rotation.y += diff * 0.1; 

    // Update position lerp to match the new pivot
    if (puppet.targetPosition) {
        puppet.position.lerp(puppet.targetPosition, 0.15);
    }

    const targetScale = puppet.targetCrouch ? 0.5 : 1.0
    puppet.scale.y = THREE.MathUtils.lerp(puppet.scale.y, targetScale, 0.2)
  }

  renderer.render( scene, camera )

  stats.end()
}


//Tab Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
})

//Client Actions
socket.on('newPlayer', (info) => {
    createOtherPlayerMesh(info.id);
});

socket.on('playerMoved', (info) => {
    if (info.id == socket.id) return
    const puppet = otherPlayers[info.id]
    if (puppet) {
        puppet.targetPosition = new THREE.Vector3(info.data.position.x, info.data.position.y, info.data.position.z)
        puppet.targetRotationY = info.data.rotation.y
        puppet.targetCrouch = info.data.isCrouching
    }
});

socket.on('playerDisconnected', (id) => {
    if (otherPlayers[id]) {
        scene.remove(otherPlayers[id]);
        delete otherPlayers[id];
    }
});

// Listen for the specific kick message
socket.on('kickReason', (message) => {
    console.log("Kick message received:", message);
    alert(message);
});

// Also listen for the general disconnect
socket.on('disconnect', (reason) => {
    console.log("Disconnected. Reason:", reason);
    if (reason === "io server disconnect") {
        // This means the SERVER initiated the kick
        document.body.innerHTML = `<h1 style="color:white; text-align:center;">You were kicked for inactivity. Please refresh.</h1>`;
    }
});
