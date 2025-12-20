/**
 * Shop class manages shop inventory, buying, selling, and re-buying
 */
export class Shop {
    constructor() {
        this.shopInventory = [];
        this.recentlySoldItems = [];
        this.maxRecentlySold = 10;
    }

    initializeShopInventory() {
        this.shopInventory = [
            {
                type: 'furniture',
                name: 'Table',
                buyPrice: 50,
                icon: '🪑'
            },
            {
                type: 'furniture',
                name: 'Chair',
                buyPrice: 30,
                icon: '🪑'
            },
            {
                type: 'fishing_rod',
                name: 'Fishing Rod',
                buyPrice: 10,
                icon: '🎣'
            }
        ];
    }

    getShopInventory() {
        return this.shopInventory;
    }

    getRecentlySoldItems() {
        return this.recentlySoldItems;
    }

    buyItem(item, money) {
        if (money >= item.buyPrice) {
            const purchasedItem = { ...item };
            // Remove buyPrice and add sellPrice for inventory items
            delete purchasedItem.buyPrice;
            purchasedItem.sellPrice = Math.floor(item.buyPrice * 0.5); // Sell for 50% of buy price
            return {
                success: true,
                item: purchasedItem,
                cost: item.buyPrice
            };
        }
        return {
            success: false,
            message: `Not enough bells! Need ${item.buyPrice} bells.`
        };
    }

    sellItem(item) {
        const soldItem = { ...item };
        this.recentlySoldItems.unshift(soldItem);
        // Keep only last N sold items
        if (this.recentlySoldItems.length > this.maxRecentlySold) {
            this.recentlySoldItems.pop();
        }
        return {
            item: soldItem,
            price: item.sellPrice
        };
    }

    reBuyItem(itemIndex, money) {
        if (itemIndex >= 0 && itemIndex < this.recentlySoldItems.length) {
            const item = this.recentlySoldItems[itemIndex];
            if (money >= item.sellPrice) {
                const reboughtItem = { ...item };
                this.recentlySoldItems.splice(itemIndex, 1);
                return {
                    success: true,
                    item: reboughtItem,
                    cost: item.sellPrice
                };
            }
            return {
                success: false,
                message: `Not enough bells! Need ${item.sellPrice} bells.`
            };
        }
        return {
            success: false,
            message: 'Invalid item index.'
        };
    }
}

