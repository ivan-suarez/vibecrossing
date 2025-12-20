import * as THREE from 'three';

/**
 * InteractionManager class handles proximity detection and interactions
 */
export class InteractionManager {
    constructor(scene) {
        this.scene = scene;
        this.interactionDistance = 2.5;
        this.nearbyFlower = null;
        this.nearbyPlacedItem = null;
        this.nearShop = false;
    }

    checkInteractions(player, flowers, placedItems, shop) {
        if (!player) {
            this.reset();
            return;
        }

        const playerPos = player.position;
        this.reset();

        // Check placed items first (prioritize over flowers)
        for (const placedItem of placedItems) {
            const distance = playerPos.distanceTo(placedItem.position);
            if (distance < this.interactionDistance) {
                this.nearbyPlacedItem = placedItem;
                break;
            }
        }

        // Check flowers (only if no placed item nearby)
        if (!this.nearbyPlacedItem) {
            for (const flower of flowers) {
                const distance = playerPos.distanceTo(flower.position);
                if (distance < this.interactionDistance) {
                    this.nearbyFlower = flower;
                    break;
                }
            }
        }

        // Check shop
        if (shop) {
            const shopPos = shop.position;
            const distance = playerPos.distanceTo(shopPos);
            if (distance < this.interactionDistance + 2) {
                this.nearShop = true;
            }
        }
    }

    reset() {
        this.nearbyFlower = null;
        this.nearbyPlacedItem = null;
        this.nearShop = false;
    }

    getInteractionPrompt() {
        if (this.nearbyPlacedItem) {
            const itemName = this.nearbyPlacedItem.userData.itemData?.name || 'item';
            return `Press E to pick up ${itemName}`;
        } else if (this.nearbyFlower) {
            return 'Press E to pick up flower';
        } else if (this.nearShop) {
            return 'Press E to open shop';
        }
        return null;
    }

    hasInteraction() {
        return !!(this.nearbyPlacedItem || this.nearbyFlower || this.nearShop);
    }
}

