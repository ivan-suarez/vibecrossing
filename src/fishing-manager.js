import * as THREE from 'three';

/**
 * FishingManager class handles fishing mechanics
 */
export class FishingManager {
    constructor(scene) {
        this.scene = scene;
        this.isFishing = false;
        this.fishingLine = null;
        this.bobbler = null;
        this.castPosition = null;
        this.fishNearBobbler = null;
        this.nibbleCount = 0;
        this.maxNibbles = 0;
        this.bobblerUnderwater = false;
        this.catchWindow = false;
        this.catchWindowTimer = null;
    }

    startFishing(player, pond) {
        if (!player || !pond) return false;

        const pondCenter = pond.userData.center;
        const playerPos = player.position;
        const distance = playerPos.distanceTo(pondCenter);
        
        if (distance > 6) {
            return { success: false, message: 'You need to be closer to the pond!' };
        }

        this.isFishing = true;
        this.nibbleCount = 0;
        this.maxNibbles = 1 + Math.floor(Math.random() * 5); // 1-5 nibbles
        this.bobblerUnderwater = false;
        this.catchWindow = false;
        this.fishNearBobbler = null;

        // Calculate cast position (in front of player, in pond)
        const playerRotation = player.rotation.y;
        const castDistance = 3;
        
        const castX = playerPos.x + Math.sin(playerRotation) * castDistance;
        const castZ = playerPos.z + Math.cos(playerRotation) * castDistance;
        const castY = 0.5; // Water surface level
        
        this.castPosition = new THREE.Vector3(castX, castY, castZ);

        // Create fishing line
        this.createFishingLine(player);

        // Create bobbler
        this.createBobbler();

        return { success: true, message: 'Fishing... Press F when bobbler goes underwater!' };
    }

    createFishingLine(player) {
        if (this.fishingLine) {
            this.scene.remove(this.fishingLine);
        }

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x654321 });
        const lineGeometry = new THREE.BufferGeometry();
        
        const playerPos = player.position.clone();
        playerPos.y += 1.5; // Hand height
        
        const points = [
            playerPos,
            this.castPosition.clone()
        ];
        
        lineGeometry.setFromPoints(points);
        this.fishingLine = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(this.fishingLine);
    }

    createBobbler() {
        if (this.bobbler) {
            this.scene.remove(this.bobbler);
        }

        const bobblerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bobblerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            emissive: 0x444400
        });
        this.bobbler = new THREE.Mesh(bobblerGeometry, bobblerMaterial);
        this.bobbler.position.copy(this.castPosition);
        this.bobbler.position.y = 0.5; // Floating on water
        this.scene.add(this.bobbler);
    }

    stopFishing() {
        this.isFishing = false;
        
        if (this.fishingLine) {
            this.scene.remove(this.fishingLine);
            this.fishingLine = null;
        }
        
        if (this.bobbler) {
            this.scene.remove(this.bobbler);
            this.bobbler = null;
        }

        if (this.fishNearBobbler) {
            this.fishNearBobbler.userData.isNibbling = false;
            this.fishNearBobbler.userData.facingBobbler = false;
            this.fishNearBobbler = null;
        }

        if (this.catchWindowTimer) {
            clearTimeout(this.catchWindowTimer);
            this.catchWindowTimer = null;
        }

        this.castPosition = null;
        this.bobblerUnderwater = false;
        this.catchWindow = false;
    }

    tryCatch() {
        if (!this.isFishing) return { success: false, message: 'Not fishing!' };
        
        if (this.catchWindow && this.bobblerUnderwater) {
            return this.catchFish();
        } else if (this.bobblerUnderwater) {
            return this.missFish();
        }
        
        return { success: false, message: 'Wait for the fish to bite!' };
    }

    catchFish() {
        if (!this.fishNearBobbler) {
            return { success: false, message: 'No fish to catch!' };
        }

        const caughtFish = this.fishNearBobbler;
        
        // Remove fish from scene
        this.scene.remove(caughtFish);
        
        // Create fish item
        const fishTypes = ['Bass', 'Carp', 'Trout', 'Salmon', 'Tuna'];
        const fishName = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const fishValue = 20 + Math.floor(Math.random() * 30); // 20-50 bells

        const fishItem = {
            type: 'fish',
            name: fishName,
            sellPrice: fishValue,
            icon: '🐟'
        };

        this.stopFishing();

        return {
            success: true,
            item: fishItem,
            message: `Caught ${fishName}! (+${fishValue} bells)`,
            fish: caughtFish // Return fish object so it can be removed from array
        };
    }

    missFish() {
        if (!this.fishNearBobbler) return { success: false };

        const missedFish = this.fishNearBobbler;
        
        // Remove fish from scene
        this.scene.remove(missedFish);
        missedFish.userData.isNibbling = false;
        missedFish.userData.facingBobbler = false;
        this.fishNearBobbler = null;

        this.stopFishing();

        return { success: false, message: 'Fish got away!', fish: missedFish };
    }

    update(player, fish, delta) {
        if (!this.isFishing || !this.bobbler || !this.fishingLine) return;

        // Update fishing line
        const playerPos = player.position.clone();
        playerPos.y += 1.5;
        
        const lineGeometry = this.fishingLine.geometry;
        const points = [
            playerPos,
            this.bobbler.position.clone()
        ];
        lineGeometry.setFromPoints(points);
        lineGeometry.attributes.position.needsUpdate = true;

        // Bobbler floating animation (if not underwater)
        if (!this.bobblerUnderwater) {
            this.bobbler.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.02;
        }

        // Check for fish near bobbler
        this.checkFishNearBobbler(fish);
    }

    checkFishNearBobbler(fish) {
        if (!this.bobbler) return;

        for (const f of fish) {
            const distanceToBobbler = f.position.distanceTo(this.bobbler.position);
            
            if (distanceToBobbler < 1.5) {
                // Fish notices bobbler
                if (!f.userData.facingBobbler) {
                    f.userData.facingBobbler = true;
                    f.userData.isNibbling = false;
                    f.userData.nibbleTimer = 0;
                    this.fishNearBobbler = f;
                }

                // Face the bobbler
                const directionToBobbler = Math.atan2(
                    this.bobbler.position.x - f.position.x,
                    this.bobbler.position.z - f.position.z
                );
                f.userData.direction = directionToBobbler;
                f.rotation.y = f.userData.direction;

                // Nibbling behavior
                if (!f.userData.isNibbling && this.nibbleCount < this.maxNibbles) {
                    f.userData.nibbleTimer += 0.016; // Approximate delta
                    if (f.userData.nibbleTimer > 0.5) {
                        f.userData.isNibbling = true;
                        f.userData.nibbleTimer = 0;
                        this.nibbleCount++;
                        
                        // Bobbler bobs up and down during nibble
                        if (this.bobbler) {
                            this.bobbler.position.y = 0.5 + Math.sin(Date.now() * 0.01) * 0.05;
                        }
                    }
                } else if (f.userData.isNibbling) {
                    f.userData.isNibbling = false;
                    f.userData.nibbleTimer = 0;
                }

                // After all nibbles, bobbler goes underwater
                if (this.nibbleCount >= this.maxNibbles && !this.bobblerUnderwater) {
                    this.bobblerUnderwater = true;
                    this.catchWindow = true;
                    
                    // Animate bobbler going underwater
                    if (this.bobbler) {
                        this.bobbler.position.y = 0.3;
                    }
                    
                    // Catch window lasts 1 second
                    if (this.catchWindowTimer) {
                        clearTimeout(this.catchWindowTimer);
                    }
                    this.catchWindowTimer = setTimeout(() => {
                        if (this.catchWindow && this.bobblerUnderwater) {
                            this.missFish();
                        }
                    }, 1000);
                }
                return;
            } else {
                // Too far from bobbler
                if (f.userData.facingBobbler) {
                    f.userData.facingBobbler = false;
                    f.userData.isNibbling = false;
                    if (this.fishNearBobbler === f) {
                        this.fishNearBobbler = null;
                    }
                }
            }
        }
    }

    getStatus() {
        if (!this.isFishing) return null;
        
        if (this.bobblerUnderwater && this.catchWindow) {
            return { text: 'Press F NOW to catch!', urgent: true };
        } else if (this.fishNearBobbler) {
            return { text: 'Fish is nibbling... Wait for it!', urgent: false };
        } else {
            return { text: 'Fishing... Waiting for fish', urgent: false };
        }
    }
}

