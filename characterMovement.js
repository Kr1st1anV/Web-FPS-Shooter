import * as THREE from "three"
import { PointerLockControls } from "three/examples/jsm/Addons.js";

export class PlayerController {
    constructor(camera, playerHitbox, worldOctree, socket) {
        this.camera = camera;
        this.camera.rotation.order = "YXZ"
        this.playerHitbox = playerHitbox;
        this.worldOctree = worldOctree;
        this.socket = socket

        this.controls = new PointerLockControls(this.camera, document.body);
        this.controls.disconnect();

        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;

        this.pitch = 0
        this.yaw = 0
        this.lookSensitivity = 0.0015

        this.playerVelocity = new THREE.Vector3();
        this.directionVect = new THREE.Vector3();
        this.forward = new THREE.Vector3();
        this.right = new THREE.Vector3();
        
        this.gravity = 30.0; 
        this.jump_force = 8.0;
        this.playerWalkSpeed = 4;

        this.onGround = false;
        this.keyPress = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false
        };
        // Sync manual angles with the initial camera rotation
        this.yaw = this.camera.rotation.y;
        this.pitch = this.camera.rotation.x;

        this.startEventListener();
    } 

    startEventListener() {
        window.addEventListener("keydown", (e) => {
            if (e.code == "KeyW") this.keyPress.forward = true;
            if (e.code == "KeyS") this.keyPress.backward = true;
            if (e.code == "KeyA") this.keyPress.left = true;
            if (e.code == "KeyD") this.keyPress.right = true;
            if (e.code == "Space") this.keyPress.jump = true;
            if (e.code == "ShiftLeft") this.keyPress.crouch = true;
            if (e.key == "p") this.controls.unlock();
        });

        window.addEventListener("keyup", (e) => {
            if (e.code == "KeyW") this.keyPress.forward = false;
            if (e.code == "KeyS") this.keyPress.backward = false;
            if (e.code == "KeyA") this.keyPress.left = false;
            if (e.code == "KeyD") this.keyPress.right = false;
            if (e.code == "Space") this.keyPress.jump = false;
            if (e.code == "ShiftLeft") this.keyPress.crouch = false;
        });
        document.addEventListener("mousemove", (event) => {
            if (document.pointerLockElement == document.body) {
                this.mouseDeltaX += event.movementX || 0;
                this.mouseDeltaY += event.movementY || 0;
            }
        });

        window.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                const canvas = document.querySelector('body');
                
                // This is the PRO way to stop snapping for gaming mice
                const promise = canvas.requestPointerLock({
                    unadjustedMovement: true, // This bypasses Windows acceleration entirely
                });

                // Fallback for older browsers
                if (!promise) {
                    canvas.requestPointerLock();
                }
                
                promise.catch(error => {
                    if (error.name === "NotSupportedError") {
                        // Browser doesn't support unadjustedMovement, use standard
                        canvas.requestPointerLock();
                    }
                });
            }
        });
    }

    playerCollision() {
        const result = this.worldOctree.capsuleIntersect(this.playerHitbox);
        
        // Reset ground state
        this.onGround = false;

        if (result) {
            // Check if we hit a floor (normal pointing up)
            this.onGround = result.normal.y > 0;

            if (this.onGround) {
                this.playerVelocity.y = 0; // Stop gravity from pulling us further
            }

            // This is the physical push-back that stops you from falling through
            this.playerHitbox.translate(result.normal.multiplyScalar(result.depth));
        } 
    }

    movement(delta) {
        // Get orientation
        this.camera.getWorldDirection(this.directionVect);
        this.directionVect.y = 0;
        this.directionVect.normalize();
        this.forward.copy(this.directionVect);
        this.right.crossVectors(this.forward, this.camera.up);

        // Calculate input
        const zMovement = Number(this.keyPress.forward) - Number(this.keyPress.backward);
        const xMovement = Number(this.keyPress.right) - Number(this.keyPress.left);

        this.directionVect.set(0,0,0);

        if (zMovement !== 0) this.directionVect.add(this.forward.clone().multiplyScalar(zMovement));
        if (xMovement !== 0) this.directionVect.add(this.right.clone().multiplyScalar(xMovement));

        if (this.directionVect.length() > 0) {
            this.directionVect.normalize();
        }

        // Apply horizontal velocity
        this.playerVelocity.x = this.directionVect.x * this.playerWalkSpeed;
        this.playerVelocity.z = this.directionVect.z * this.playerWalkSpeed;

        // Apply Gravity
        if (this.onGround && this.keyPress.jump) {
            this.playerVelocity.y = this.jump_force
            this.onGround = false
        }


        if (!this.onGround) {
            this.playerVelocity.y -= this.gravity * delta;
        }
    }  

    // Replace your update(delta) function with this:
update(delta) {
    this.movement(delta);

    this.yaw -= this.mouseDeltaX * this.lookSensitivity;
    this.pitch -= this.mouseDeltaY * this.lookSensitivity;

    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = this.yaw;

    const targetHeight = this.keyPress.crouch ? 0.5 : 1.0; 
    // Lerp the 'end' point for a smooth head bob/crouch
    this.playerHitbox.end.y = THREE.MathUtils.lerp(this.playerHitbox.end.y, this.playerHitbox.start.y + targetHeight, 0.2);

    this.playerHitbox.translate(this.playerVelocity.clone().multiplyScalar(delta));
    this.playerCollision();

    this.camera.position.copy(this.playerHitbox.end);
    this.camera.position.y += 0.1;

    const myData = {
        position: this.playerHitbox.start,
        rotation: { y: this.yaw },
        isCrouching: this.keyPress.crouch
    };

    this.socket.emit('playerMovement', myData);
    }
}