import * as THREE from "three"
import { PointerLockControls } from 'three/examples/jsm/Addons.js'

export class PlayerController {
    constructor(camera, playerHitbox, worldOctree, controls) {
        this.camera = camera
        this.playerHitbox = playerHitbox
        this.worldOctree = worldOctree
        this.controls = new PointerLockControls(this.camera, document.body);

        this.playerPosition = new THREE.Vector3()
        this.playerVelocity  = new THREE.Vector3()

        this.directionVect = new THREE.Vector3()
        this.forward = new THREE.Vector3()
        this.right = new THREE.Vector3()


        this.onGround = false
        this.keyPress = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
            }
        this.startEventListener()
    } 

    startEventListener() {
        window.addEventListener("keydown", (e) => {
            if (e.code == "KeyW") {
                this.keyPress.forward = true
            }
            if (e.code == "KeyS") {
                this.keyPress.backward = true
            }
            if (e.code == "KeyA") {
                this.keyPress.left = true
            }
            if (e.code == "KeyD") {
                this.keyPress.right = true
            }
            if (e.key == "p") {
                this.controls.unlock()
            }
        })
        window.addEventListener("keyup", (e) => {
            if (e.code == "KeyW") {
                this.keyPress.forward = false
            }
            if (e.code == "KeyS") {
                this.keyPress.backward = false
            }
            if (e.code == "KeyA") {
                this.keyPress.left = false
            }
            if (e.code == "KeyD") {
                this.keyPress.right = false
            }
        })
    }

    playerCollision() {
      const result = this.worldOctree.capsuleIntersect(this.playerHitbox)
    
      if (result) {
        this.playerHitbox.translate(result.normal.multiplyScalar(result.depth))
      }
    }

    movement() {
        this.camera.getWorldDirection(this.directionVect)
        this.directionVect.y = 0
        this.directionVect.normalize()
        this.forward.copy(this.directionVect)
        this.right.crossVectors(this.forward, this.camera.up)

        const zMovement = Number(this.keyPress.forward) - Number(this.keyPress.backward)

        const xMovement = Number(this.keyPress.right) - Number(this.keyPress.left)

        this.directionVect.set(0,0,0)

        if (zMovement !== 0) {
            this.directionVect.add(this.forward.clone().multiplyScalar(zMovement))
        }

        if (xMovement !== 0) {
            this.directionVect.add(this.right.clone().multiplyScalar(xMovement))
        }

        if (this.directionVect.length() > 0) {
            this.directionVect.normalize()
        }

        const resultingSpeed = this.directionVect.multiplyScalar(10)
        this.playerVelocity.x = resultingSpeed.x
        this.playerVelocity.y = resultingSpeed.y
        this.playerVelocity.z = resultingSpeed.z
        // if (this.keys.jump) {
        //     playerVelocity.y = 100
        //     keys.jump = false
        //     keys.falling = true
        // } if (keys.falling) {
        //     playerVelocity.y = 0 * 9.8 
        // }
        }

    update(delta) {
        this.movement()
        this.playerHitbox.translate(this.playerVelocity.multiplyScalar(delta))
        this.playerCollision()
        this.playerHitbox.getCenter(this.playerPosition)
        this.camera.position.x = this.playerPosition.x
        this.camera.position.y = this.playerPosition.y
        this.camera.position.z = this.playerPosition.z
    }
}