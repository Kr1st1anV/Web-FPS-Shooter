import * as THREE from "three"

export class PlayerController {
    constructor(camera, playerCollider, wordlOctree) {}

    const playerPosition = new THREE.Vector3()
    const playerVelocity  = new THREE.Vector3()

    const keys = {
    forwards: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    falling: true,
    }

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

    //Def Vector
    const directionVect = new THREE.Vector3()
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()

    function movement() {
    camera.getWorldDirection(directionVect)
    directionVect.y = 0
    directionVect.normalize()
    forward.copy(directionVect)
    right.crossVectors(forward, camera.up)

    const zMovement = Number(keys.forwards) - Number(keys.backward)

    const xMovement = Number(keys.right) - Number(keys.left)

    directionVect.set(0,0,0)

    if (zMovement !== 0) {
        directionVect.add(forward.clone().multiplyScalar(zMovement))
    }

    if (xMovement !== 0) {
        directionVect.add(right.clone().multiplyScalar(xMovement))
    }

    if (directionVect.length() > 0) {
        directionVect.normalize()
    }

    let resultingSpeed = directionVect.multiplyScalar(walkingSpeed)
    playerVelocity.x = resultingSpeed.x
    playerVelocity.y = resultingSpeed.y
    playerVelocity.z = resultingSpeed.z
    if (keys.jump) {
        playerVelocity.y = 100
        keys.jump = false
        keys.falling = true
    } if (keys.falling) {
        playerVelocity.y = 0 * 9.8 
    }
    }
}