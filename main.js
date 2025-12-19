import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { horizontalMovement }  from "./characterMovement.js"


//Def Vector
const vec = new THREE.Vector3()

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
floor.position.y = -5
scene.add(floor)

// const gridHelper = new THREE.GridHelper(50,50)
// gridHelper.position.y = -10
// scene.add(gridHelper)


//Character Geo and Mat
const geometry = new THREE.BoxGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
const cube = new THREE.Mesh( geometry, material )
scene.add( cube )

//FPS Camera
const controls = new PointerLockControls(camera, document.body);

//OrbitControls - Look at documentation for more details
//const controls = new FirstPersonControls(camera, renderer.domElement) - Cool concept with FirstPersonControls - Grappling Movement

//Character Movement
const keys = {
  forwards: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  falling: true,
}

const playerPosition = new THREE.Vector3(0,10,0)
const playerVelocity  = new THREE.Vector3(0, 0, 0)

document.addEventListener("keydown", function(event) {
  if (event.code == "KeyW"){
    keys.forwards = true
  }
  if (event.code == "KeyS"){
    keys.backward = true
  }
  if (event.code == "KeyA"){
    keys.left = true
  }
  if (event.code == "KeyD"){
    keys.right = true
  }
  if (event.code == "Space"){
    keys.jump = true
  }
  if (event.key == "p") {
    controls.unlock()
  }
})

document.addEventListener("keyup", function(event) {
  if (event.code == "KeyW"){
    keys.forwards = false
  }
  if (event.code == "KeyS"){
    keys.backward = false
  }
  if (event.code == "KeyA"){
    keys.left = false
  }
  if (event.code == "KeyD"){
    keys.right = false
  }
})

document.addEventListener("mousedown", function(event) {
  //console.log(event.button)
  if (event.button === 0) {
    controls.lock()
  }
})

function movement() {
  camera.getWorldDirection(vec)
  vec.y = 0
  vec.normalize()
  const delta = clock.getDelta()
  const distance = moveSpeed * delta
  if (keys.forwards) {
    playerPosition.z += vec.z * distance
    playerPosition.x += vec.x * distance
  }
  if (keys.left) {
    playerPosition.z += vec.x * -distance
    playerPosition.x += vec.z * distance
  }
  if (keys.backward) {
    playerPosition.z += vec.z * -distance
    playerPosition.x += vec.x * -distance
  }
  if (keys.right) {
    playerPosition.z += vec.x * distance
    playerPosition.x += vec.z * -distance
  }
   if (keys.jump) {
    playerVelocity.y += 100 * delta
    keys.jump = false
    keys.falling = true
  } if (keys.falling) {
    if (playerPosition.y >= -3) {
      playerVelocity.y -= 9.8 * delta
    } else {
      keys.falling = false
      playerVelocity.y = 0
    }
  }
  playerPosition.y += playerVelocity.y * delta
}




//Game Loop
const clock = new THREE.Clock()
const moveSpeed = 10

function animate() {
  movement()
  cube.position.x = playerPosition.x
  cube.position.y = playerPosition.y
  cube.position.z = playerPosition.z
  
  camera.position.set(cube.position.x, cube.position.y, cube.position.z)
  renderer.render( scene, camera )
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
})