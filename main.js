import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { Octree } from 'three/examples/jsm/Addons.js'
import { Capsule } from 'three/examples/jsm/Addons.js'
import { horizontalMovement }  from "./characterMovement.js"
import { frontFacing } from 'three/tsl'

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
const floorGeo = new THREE.PlaneGeometry(50,50)
const floorMat = new THREE.MeshBasicMaterial( { color: 0xa6ff33, side: THREE.DoubleSide })
const floor = new THREE.Mesh( floorGeo, floorMat )
floor.rotateX(Math.PI/2)
floor.position.y = -10
scene.add(floor)

// const gridHelper = new THREE.GridHelper(50,50)
// gridHelper.position.y = -10
// scene.add(gridHelper)


//Character Geo and Mat
const geometry = new THREE.BoxGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
const cube = new THREE.Mesh( geometry, material )
cube.position.y = -10
scene.add( cube )

//FPS Camera
const controls = new PointerLockControls(camera, document.body);

//OrbitControls - Look at documentation for more details
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

function playerCollision() {
  const result = worldOctree.capsuleIntersect(playerHitbox)

  if (result) {
    playerHitbox.translate(result.normal.multiplyScalar(result.depth))
  }
}


//Game Loop
const clock = new THREE.Clock()
const walkingSpeed = 10

function animate() {
  const delta = clock.getDelta()

  movement()
  playerHitbox.translate(playerVelocity.multiplyScalar(delta))
  playerCollision()
  playerHitbox.getCenter(playerPosition)
  camera.position.x = playerPosition.x
  camera.position.y = playerPosition.y
  camera.position.z = playerPosition.z
  renderer.render( scene, camera )
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
})