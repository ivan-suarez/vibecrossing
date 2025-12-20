import * as THREE from 'three';

/**
 * PlayerController class handles player movement, camera, and input
 */
export class PlayerController {
    constructor(player, camera) {
        this.player = player;
        this.camera = camera;
        this.keys = {};
        this.clock = new THREE.Clock();
        this.moveSpeed = 5;
        this.rotationSpeed = 0.1;
    }

    setupControls(onInteraction, onToggleInventory, onFishing) {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Interaction key (E)
            if (event.code === 'KeyE') {
                if (onInteraction) onInteraction();
            }
            
            // Toggle inventory (I)
            if (event.code === 'KeyI') {
                if (onToggleInventory) onToggleInventory();
            }

            // Fishing key (F)
            if (event.code === 'KeyF') {
                if (onFishing) onFishing();
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
    }

    update() {
        if (!this.player) return;

        const delta = this.clock.getDelta();
        const moveDistance = this.moveSpeed * delta;

        let moveX = 0;
        let moveZ = 0;
        let shouldRotate = false;

        // Movement controls
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            moveZ -= moveDistance;
            shouldRotate = true;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            moveZ += moveDistance;
            shouldRotate = true;
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            moveX -= moveDistance;
            shouldRotate = true;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            moveX += moveDistance;
            shouldRotate = true;
        }

        // Apply movement
        if (moveX !== 0 || moveZ !== 0) {
            this.player.position.x += moveX;
            this.player.position.z += moveZ;

            // Rotate player to face movement direction
            if (shouldRotate) {
                const angle = Math.atan2(moveX, moveZ);
                this.player.rotation.y = angle;
            }
        }

        // Keep player on ground
        this.player.position.y = 0.8;

        // Update camera to follow player
        this.updateCamera();
    }

    updateCamera() {
        if (!this.player || !this.camera) return;
        
        const cameraOffset = new THREE.Vector3(0, 8, 12);
        const targetPosition = this.player.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetPosition, 0.1);
        this.camera.lookAt(this.player.position);
    }

    getPlayerPosition() {
        return this.player ? this.player.position : null;
    }

    getPlayerRotation() {
        return this.player ? this.player.rotation.y : 0;
    }

    calculatePlacePosition(distance = 2) {
        if (!this.player) return null;
        
        const playerPos = this.player.position;
        const playerRotation = this.player.rotation.y;
        
        return {
            x: playerPos.x + Math.sin(playerRotation) * distance,
            y: 0,
            z: playerPos.z + Math.cos(playerRotation) * distance
        };
    }
}

