import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'


//Setup Scene
const scene = new THREE.Scene()
//Setup Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
//Setup Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setAnimationLoop( animate )
document.body.appendChild( renderer.domElement )
//Setup FLoor
const floorGeo = new THREE.PlaneGeometry()

const geometry = new THREE.BoxGeometry( 1, 1, 1 )
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
const cube = new THREE.Mesh( geometry, material )
scene.add( cube )

camera.position.z = 10

//OrbitControls - Look at documentation for more details
const controls = new OrbitControls(camera, renderer.domElement)

function animate() {

  renderer.render( scene, camera )

}