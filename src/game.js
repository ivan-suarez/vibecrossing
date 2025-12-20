import * as THREE from 'three';
import { World } from './world.js';
import { Inventory } from './inventory.js';
import { Shop } from './shop.js';
import { UIManager } from './ui-manager.js';
import { PlayerController } from './player-controller.js';
import { InteractionManager } from './interaction-manager.js';
import { SceneManager } from './scene-manager.js';

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
        this.player = null;
        this.money = 0;
        this.flowers = [];
        this.shopObject = null;
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

        // Setup controls
        this.playerController.setupControls(
            () => this.handleInteraction(),
            () => this.uiManager.toggleInventory()
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
        // Update player movement
        this.playerController.update();

        // Check for interactions
        this.interactionManager.checkInteractions(
            this.player,
            this.flowers,
            this.inventory.getPlacedItems(),
            this.shopObject
        );

        // Update interaction prompt
        const promptText = this.interactionManager.getInteractionPrompt();
        this.uiManager.updateInteractionPrompt(promptText);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updatePlayer();
        this.sceneManager.render();
    }
}
