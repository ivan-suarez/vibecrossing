/**
 * Inventory class manages player inventory and item placement
 */
export class Inventory {
    constructor() {
        this.items = [];
        this.placedItems = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }

    getItem(index) {
        if (index >= 0 && index < this.items.length) {
            return this.items[index];
        }
        return null;
    }

    getAllItems() {
        return this.items;
    }

    getPlacedItems() {
        return this.placedItems;
    }

    addPlacedItem(placedObject) {
        this.placedItems.push(placedObject);
    }

    removePlacedItem(placedObject) {
        const index = this.placedItems.indexOf(placedObject);
        if (index > -1) {
            this.placedItems.splice(index, 1);
            return true;
        }
        return false;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getItemCount() {
        return this.items.length;
    }
}

