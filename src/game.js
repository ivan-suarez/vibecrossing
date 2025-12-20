import * as THREE from 'three';
import { World } from './world.js';
import { Inventory } from './inventory.js';
import { Shop } from './shop.js';
import { UIManager } from './ui-manager.js';
import { PlayerController } from './player-controller.js';
import { InteractionManager } from './interaction-manager.js';
import { SceneManager } from './scene-manager.js';
import { FishingManager } from './fishing-manager.js';

/**
 * Game class orchestrates all game systems
 */
export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.sceneManager = null;
        this.world = null;
        this.inventory = null;
        this.shop = null;
        this.uiManager = null;
        this.playerController = null;
        this.interactionManager = null;
        this.fishingManager = null;
        this.player = null;
        this.money = 0;
        this.flowers = [];
        this.fish = [];
        this.pond = null;
        this.shopObject = null;
        this.clock = new THREE.Clock();
    }

    init() {
        // Initialize scene manager
        this.sceneManager = new SceneManager(this.canvas);
        this.sceneManager.init();

        // Initialize world (handles 3D models and world creation)
        this.world = new World(this.sceneManager.getScene());
        this.world.setupLighting();
        this.createWorld();

        // Create player
        this.player = this.world.createPlayer();

        // Initialize game systems
        this.inventory = new Inventory();
        this.shop = new Shop();
        this.shop.initializeShopInventory();
        this.uiManager = new UIManager();
        this.playerController = new PlayerController(
            this.player,
            this.sceneManager.getCamera()
        );
        this.interactionManager = new InteractionManager(this.sceneManager.getScene());
        this.fishingManager = new FishingManager(this.sceneManager.getScene());

        // Setup controls
        this.playerController.setupControls(
            () => this.handleInteraction(),
            () => this.uiManager.toggleInventory(),
            () => this.handleFishingInput()
        );

        // Setup UI
        this.updateAllUI();
    }

    createWorld() {
        // Create ground
        this.world.createGround();

        // Add some trees
        this.world.createTree(-8, 0, -8);
        this.world.createTree(8, 0, -8);
        this.world.createTree(-8, 0, 8);
        this.world.createTree(8, 0, 8);
        this.world.createTree(0, 0, -10);
        this.world.createTree(0, 0, 10);

        // Add some decorative items (rocks, flowers)
        this.world.createRock(-5, 0, 5);
        this.world.createRock(5, 0, -5);
        
        // Create flowers and track them
        const flower1 = this.world.createFlower(-3, 0, 3);
        const flower2 = this.world.createFlower(3, 0, -3);
        const flower3 = this.world.createFlower(-2, 0, 2);
        const flower4 = this.world.createFlower(2, 0, -2);
        const flower5 = this.world.createFlower(-4, 0, 4);
        const flower6 = this.world.createFlower(4, 0, -4);
        const flower7 = this.world.createFlower(-1, 0, 1);
        const flower8 = this.world.createFlower(1, 0, -1);
        
        this.flowers.push(flower1, flower2, flower3, flower4, flower5, flower6, flower7, flower8);

        // Create shop
        this.shopObject = this.world.createShop(-10, 0, 0);

        // Create pond
        this.pond = this.world.createPond(10, 0, 10);

        // Spawn fish
        this.spawnFish(5);
    }

    spawnFish(count) {
        if (!this.pond) return;

        const pondCenter = this.pond.userData.center;
        const pondRadius = this.pond.userData.radius;

        for (let i = 0; i < count; i++) {
            // Random position within pond
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (pondRadius - 0.5);
            const x = pondCenter.x + Math.cos(angle) * distance;
            const z = pondCenter.z + Math.sin(angle) * distance;
            const y = 0.3; // Just below water surface

            const fish = this.world.createFish(x, y, z);
            this.fish.push(fish);
        }
    }

    handleInteraction() {
        // Pick up nearby placed item (prioritize placed items over flowers)
        if (this.interactionManager.nearbyPlacedItem) {
            this.pickupPlacedItem(this.interactionManager.nearbyPlacedItem);
        }
        // Pick up nearby flower
        else if (this.interactionManager.nearbyFlower) {
            this.pickupFlower(this.interactionManager.nearbyFlower);
        }
        
        // Open shop
        if (this.interactionManager.nearShop) {
            this.uiManager.toggleShop();
            this.updateShopUI();
        }
    }

    pickupFlower(flower) {
        // Remove from scene
        this.sceneManager.getScene().remove(flower);
        
        // Remove from flowers array
        const index = this.flowers.indexOf(flower);
        if (index > -1) {
            this.flowers.splice(index, 1);
        }
        
        // Add to inventory
        const item = {
            type: 'flower',
            name: `${flower.userData.color} Flower`,
            color: flower.userData.color,
            colorValue: flower.userData.colorValue,
            sellPrice: 10
        };
        this.inventory.addItem(item);
        
        // Update UI
        this.updateAllUI();
        this.uiManager.showNotification(`Picked up ${item.name}!`);
    }

    pickupPlacedItem(placedItem) {
        // Get item data from the placed object
        const itemData = placedItem.userData.itemData;
        if (!itemData) return;

        // Remove from scene
        this.sceneManager.getScene().remove(placedItem);
        
        // Remove from inventory's placed items
        this.inventory.removePlacedItem(placedItem);
        
        // Add back to inventory
        this.inventory.addItem(itemData);
        
        // Update UI
        this.updateAllUI();
        this.uiManager.showNotification(`Picked up ${itemData.name}!`);
    }

    sellItem(itemIndex) {
        const item = this.inventory.getItem(itemIndex);
        if (!item) return;

        this.money += item.sellPrice;
        this.shop.sellItem(item);
        this.inventory.removeItem(itemIndex);
        
        this.updateAllUI();
        this.uiManager.showNotification(`Sold ${item.name} for ${item.sellPrice} bells!`);
    }

    buyItem(item) {
        const result = this.shop.buyItem(item, this.money);
        if (result.success) {
            this.money -= result.cost;
            this.inventory.addItem(result.item);
            this.updateAllUI();
            this.uiManager.showNotification(`Bought ${item.name} for ${item.buyPrice} bells!`);
        } else {
            this.uiManager.showNotification(result.message);
        }
    }

    reBuyItem(itemIndex) {
        const result = this.shop.reBuyItem(itemIndex, this.money);
        if (result.success) {
            this.money -= result.cost;
            this.inventory.addItem(result.item);
            this.updateAllUI();
            this.uiManager.showNotification(`Re-bought ${result.item.name} for ${result.cost} bells!`);
        } else {
            this.uiManager.showNotification(result.message);
        }
    }

    placeItem(itemIndex) {
        const item = this.inventory.getItem(itemIndex);
        if (!item) return;

        // Don't allow placing fishing rods or fish
        if (item.type === 'fishing_rod' || item.type === 'fish') {
            this.uiManager.showNotification('Cannot place this item!');
            return;
        }

        // Calculate position in front of player
        const placePos = this.playerController.calculatePlacePosition(2);
        if (!placePos) return;
        
        // Create 3D object based on item type
        let placedObject = null;
        
        if (item.type === 'flower') {
            placedObject = this.world.createFlowerObject(placePos.x, placePos.y, placePos.z, item);
        } else if (item.type === 'furniture') {
            if (item.name === 'Table') {
                placedObject = this.world.createTable(placePos.x, placePos.y, placePos.z);
            } else if (item.name === 'Chair') {
                placedObject = this.world.createChair(placePos.x, placePos.y, placePos.z);
            }
        }
        
        if (placedObject) {
            // Store item data with the object
            placedObject.userData = {
                itemData: item,
                itemIndex: itemIndex,
                type: 'placed'
            };
            
            this.inventory.addPlacedItem(placedObject);
            this.sceneManager.getScene().add(placedObject);
            
            // Remove from inventory
            this.inventory.removeItem(itemIndex);
            this.updateAllUI();
            this.uiManager.showNotification(`Placed ${item.name}!`);
        }
    }

    handleFishingInput() {
        if (this.fishingManager.isFishing) {
            // Try to catch fish
            const result = this.fishingManager.tryCatch();
            if (result.success) {
                // Remove fish from array
                if (result.fish) {
                    const index = this.fish.indexOf(result.fish);
                    if (index > -1) {
                        this.fish.splice(index, 1);
                    }
                }
                this.inventory.addItem(result.item);
                this.updateAllUI();
                this.uiManager.showNotification(result.message);
                // Spawn new fish after a delay
                setTimeout(() => {
                    if (this.pond) {
                        this.spawnFish(1);
                    }
                }, 3000);
            } else if (result.message) {
                // Remove fish from array if it got away
                if (result.fish) {
                    const index = this.fish.indexOf(result.fish);
                    if (index > -1) {
                        this.fish.splice(index, 1);
                    }
                }
                this.uiManager.showNotification(result.message);
                // Spawn new fish after a delay if fish got away
                if (result.message.includes('got away')) {
                    setTimeout(() => {
                        if (this.pond) {
                            this.spawnFish(1);
                        }
                    }, 3000);
                }
            }
        } else {
            // Start fishing (check if player has fishing rod and is near pond)
            if (!this.hasFishingRod()) {
                this.uiManager.showNotification('You need a fishing rod!');
                return;
            }
            
            if (!this.isNearPond()) {
                this.uiManager.showNotification('You need to be near the pond!');
                return;
            }

            const result = this.fishingManager.startFishing(this.player, this.pond);
            if (result.success) {
                this.uiManager.showNotification(result.message);
            } else {
                this.uiManager.showNotification(result.message);
            }
        }
    }

    hasFishingRod() {
        return this.inventory.getAllItems().some(item => item.type === 'fishing_rod');
    }

    isNearPond() {
        if (!this.pond || !this.player) return false;
        const pondCenter = this.pond.userData.center;
        const distance = this.player.position.distanceTo(pondCenter);
        return distance < 6; // Within casting distance
    }

    updateFish(delta) {
        if (!this.pond) return;

        const pondCenter = this.pond.userData.center;
        const pondRadius = this.pond.userData.radius;

        for (const fish of this.fish) {
            const fishData = fish.userData;

            // Skip if fish is interacting with bobbler
            if (fishData.facingBobbler) {
                continue;
            }

            // Update direction change timer
            fishData.changeDirectionTimer += delta;
            if (fishData.changeDirectionTimer >= fishData.changeDirectionInterval) {
                fishData.targetDirection = Math.random() * Math.PI * 2;
                fishData.changeDirectionTimer = 0;
                fishData.changeDirectionInterval = 2 + Math.random() * 3;
            }

            // Smoothly rotate towards target direction
            let angleDiff = fishData.targetDirection - fishData.direction;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            fishData.direction += angleDiff * 0.1;

            // Move fish
            const moveX = Math.sin(fishData.direction) * fishData.speed * delta;
            const moveZ = Math.cos(fishData.direction) * fishData.speed * delta;

            fish.position.x += moveX;
            fish.position.z += moveZ;

            // Keep fish within pond bounds - clamp position if outside
            const distanceFromCenter = fish.position.distanceTo(pondCenter);
            const maxDistance = pondRadius - 0.5;
            
            if (distanceFromCenter > maxDistance) {
                // Clamp fish position back inside pond
                const angleToCenter = Math.atan2(
                    fish.position.z - pondCenter.z,
                    fish.position.x - pondCenter.x
                );
                
                fish.position.x = pondCenter.x + Math.cos(angleToCenter) * maxDistance;
                fish.position.z = pondCenter.z + Math.sin(angleToCenter) * maxDistance;
                
                // Bounce off edge by reversing direction
                fishData.direction = angleToCenter + Math.PI;
            }

            fish.rotation.y = fishData.direction;
        }
    }

    updateAllUI() {
        this.uiManager.updateInventoryUI(this.inventory, (index) => this.placeItem(index));
        this.updateShopUI();
        this.uiManager.updateMoneyUI(this.money);
    }

    updateShopUI() {
        this.uiManager.updateShopUI(
            this.shop,
            this.inventory,
            this.money,
            {
                onBuy: (item) => {
                    if (this.interactionManager.nearShop) {
                        this.buyItem(item);
                    } else {
                        this.uiManager.showNotification('You must be near the shop to buy!');
                    }
                },
                onSell: (index) => {
                    if (this.interactionManager.nearShop) {
                        this.sellItem(index);
                    } else {
                        this.uiManager.showNotification('You must be near the shop to sell!');
                    }
                },
                onReBuy: (index) => {
                    if (this.interactionManager.nearShop) {
                        this.reBuyItem(index);
                    } else {
                        this.uiManager.showNotification('You must be near the shop to re-buy!');
                    }
                }
            }
        );
    }

    updatePlayer() {
        const delta = this.clock.getDelta();

        // Don't allow movement while fishing
        if (this.fishingManager.isFishing) {
            // Update camera to follow player (but don't move)
            this.playerController.updateCamera();
            // Update fishing
            this.fishingManager.update(this.player, this.fish, delta);
            // Update fish
            this.updateFish(delta);
            // Update fishing status prompt
            const fishingStatus = this.fishingManager.getStatus();
            if (fishingStatus) {
                this.uiManager.updateInteractionPrompt(fishingStatus.text, fishingStatus.urgent);
            }
            return;
        }

        // Update player movement
        this.playerController.update();

        // Update fish
        this.updateFish(delta);

        // Update fishing
        this.fishingManager.update(this.player, this.fish, delta);

        // Check for interactions
        this.interactionManager.checkInteractions(
            this.player,
            this.flowers,
            this.inventory.getPlacedItems(),
            this.shopObject
        );

        // Update interaction prompt
        let promptText = this.interactionManager.getInteractionPrompt();
        
        // Check if near pond and has fishing rod
        if (!promptText && this.isNearPond() && this.hasFishingRod()) {
            promptText = 'Press F to start fishing';
        }
        
        this.uiManager.updateInteractionPrompt(promptText);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updatePlayer();
        this.sceneManager.render();
    }
}

