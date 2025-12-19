import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { Octree } from 'three/examples/jsm/Addons.js'
import { Capsule } from 'three/examples/jsm/Addons.js'
import { PlayerController } from './characterMovement'

//Setup Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x00c0ff)

//Setup Camera - StereoCamera Research
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

//Setup Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setAnimationLoop( animate )
document.body.appendChild( renderer.domElement )

//Setup Floor
const floorGeo = new THREE.BoxGeometry(50,50)
const floorMat = new THREE.MeshBasicMaterial( { color: 0xa6ff33 })
const floor = new THREE.Mesh( floorGeo, floorMat )
floor.rotateX(Math.PI/2)
floor.position.y = -10
scene.add(floor)

// const gridHelper = new THREE.GridHelper(50,50)
// gridHelper.position.y = -10
// scene.add(gridHelper)


//Character Geo and Mat
const geometry = new THREE.BoxGeometry( 1, 15 )
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
const cube = new THREE.Mesh( geometry, material )
cube.position.y = -10
scene.add( cube )

//FPS Camera
const controls = new PointerLockControls(camera, document.body);

//const controls = new FirstPersonControls(camera, renderer.domElement) - Cool concept with FirstPersonControls - Grappling Movement


const worldOctree = new Octree()
const playerHitbox = new Capsule(new THREE.Vector3(3,0.35,3),
                                 new THREE.Vector3(3, 1.0, 3), 
                                 0.35)

worldOctree.fromGraphNode(floor)
worldOctree.fromGraphNode(cube)
//When adding maps
// loader.load('map.glb', (gltf) => {
//     scene.add(gltf.scene);
//     worldOctree.fromGraphNode(gltf.scene);
// });

const player = new PlayerController(camera, playerHitbox, worldOctree, controls)

//Game Loop
const clock = new THREE.Clock()

function animate() {
  const delta = clock.getDelta()

  player.update(delta)

  renderer.render( scene, camera )
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
})

window.addEventListener("mousedown", function(event) {
        //console.log(event.button)
            if (event.button === 0) {
                controls.lock()
            }
        })