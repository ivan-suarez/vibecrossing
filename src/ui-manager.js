/**
 * UIManager class handles all UI updates and interactions
 */
export class UIManager {
    constructor() {
        this.elements = {
            inventoryPanel: null,
            shopPanel: null,
            inventoryList: null,
            shopList: null,
            moneyDisplay: null,
            interactionPrompt: null,
            notification: null
        };
        this.initializeElements();
    }

    initializeElements() {
        this.elements.inventoryPanel = document.getElementById('inventory-panel');
        this.elements.shopPanel = document.getElementById('shop-panel');
        this.elements.inventoryList = document.getElementById('inventory-list');
        this.elements.shopList = document.getElementById('shop-list');
        this.elements.moneyDisplay = document.getElementById('money-display');
        this.elements.interactionPrompt = document.getElementById('interaction-prompt');
        this.elements.notification = document.getElementById('notification');
    }

    updateInventoryUI(inventory, onPlaceItem) {
        const list = this.elements.inventoryList;
        if (!list) return;

        list.innerHTML = '';
        
        if (inventory.isEmpty()) {
            list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Inventory is empty</p>';
            return;
        }

        inventory.getAllItems().forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            
            // Create icon based on item type
            let iconHTML = '';
            if (item.type === 'flower' && item.colorValue) {
                iconHTML = `<div class="item-icon" style="background-color: #${item.colorValue.toString(16).padStart(6, '0')}"></div>`;
            } else if (item.type === 'furniture') {
                iconHTML = `<div class="item-icon" style="background: #8B4513; display: flex; align-items: center; justify-content: center; font-size: 20px;">${item.icon || '🪑'}</div>`;
            } else {
                iconHTML = `<div class="item-icon" style="background: #ddd;"></div>`;
            }
            
            itemDiv.innerHTML = `
                ${iconHTML}
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.sellPrice ? item.sellPrice + ' bells' : ''}</div>
                </div>
                <button class="place-button" data-index="${index}">Place</button>
            `;
            
            const placeButton = itemDiv.querySelector('.place-button');
            placeButton.addEventListener('click', () => {
                if (onPlaceItem) onPlaceItem(index);
            });
            
            list.appendChild(itemDiv);
        });
    }

    updateShopUI(shop, inventory, money, callbacks) {
        const list = this.elements.shopList;
        if (!list) return;

        list.innerHTML = '';
        
        // Shop items for sale section
        if (shop.getShopInventory().length > 0) {
            const shopSection = document.createElement('div');
            shopSection.className = 'shop-section';
            shopSection.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 18px;">Items for Sale</h3>';
            
            shop.getShopInventory().forEach((item) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';
                
                let iconHTML = '';
                if (item.type === 'furniture') {
                    iconHTML = `<div class="item-icon" style="background: #8B4513; display: flex; align-items: center; justify-content: center; font-size: 20px;">${item.icon || '🪑'}</div>`;
                } else {
                    iconHTML = `<div class="item-icon" style="background: #ddd;"></div>`;
                }
                
                itemDiv.innerHTML = `
                    ${iconHTML}
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${item.buyPrice} bells</div>
                    </div>
                    <button class="buy-button">Buy</button>
                `;
                
                const buyButton = itemDiv.querySelector('.buy-button');
                buyButton.addEventListener('click', () => {
                    if (callbacks.onBuy) callbacks.onBuy(item);
                });
                
                shopSection.appendChild(itemDiv);
            });
            
            list.appendChild(shopSection);
        }
        
        // Recently sold items section
        if (shop.getRecentlySoldItems().length > 0) {
            const soldSection = document.createElement('div');
            soldSection.className = 'shop-section';
            soldSection.style.marginTop = '20px';
            soldSection.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 18px;">Recently Sold (Re-buy)</h3>';
            
            shop.getRecentlySoldItems().forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';
                
                let iconHTML = '';
                if (item.type === 'flower' && item.colorValue) {
                    iconHTML = `<div class="item-icon" style="background-color: #${item.colorValue.toString(16).padStart(6, '0')}"></div>`;
                } else if (item.type === 'furniture') {
                    iconHTML = `<div class="item-icon" style="background: #8B4513; display: flex; align-items: center; justify-content: center; font-size: 20px;">${item.icon || '🪑'}</div>`;
                } else {
                    iconHTML = `<div class="item-icon" style="background: #ddd;"></div>`;
                }
                
                itemDiv.innerHTML = `
                    ${iconHTML}
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${item.sellPrice} bells</div>
                    </div>
                    <button class="rebuy-button" data-index="${index}">Re-buy</button>
                `;
                
                const rebuyButton = itemDiv.querySelector('.rebuy-button');
                rebuyButton.addEventListener('click', () => {
                    if (callbacks.onReBuy) callbacks.onReBuy(index);
                });
                
                soldSection.appendChild(itemDiv);
            });
            
            list.appendChild(soldSection);
        }
        
        // Items to sell section
        if (!inventory.isEmpty()) {
            const sellSection = document.createElement('div');
            sellSection.className = 'shop-section';
            sellSection.style.marginTop = '20px';
            sellSection.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 18px;">Sell Items</h3>';
            
            inventory.getAllItems().forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';
                
                let iconHTML = '';
                if (item.type === 'flower' && item.colorValue) {
                    iconHTML = `<div class="item-icon" style="background-color: #${item.colorValue.toString(16).padStart(6, '0')}"></div>`;
                } else if (item.type === 'furniture') {
                    iconHTML = `<div class="item-icon" style="background: #8B4513; display: flex; align-items: center; justify-content: center; font-size: 20px;">${item.icon || '🪑'}</div>`;
                } else {
                    iconHTML = `<div class="item-icon" style="background: #ddd;"></div>`;
                }
                
                itemDiv.innerHTML = `
                    ${iconHTML}
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${item.sellPrice} bells</div>
                    </div>
                    <button class="sell-button" data-index="${index}">Sell</button>
                `;
                
                const sellButton = itemDiv.querySelector('.sell-button');
                sellButton.addEventListener('click', () => {
                    if (callbacks.onSell) callbacks.onSell(index);
                });
                
                sellSection.appendChild(itemDiv);
            });
            
            list.appendChild(sellSection);
        }
        
        // Empty state
        if (shop.getShopInventory().length === 0 && shop.getRecentlySoldItems().length === 0 && inventory.isEmpty()) {
            list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No items available</p>';
        }
    }

    updateMoneyUI(money) {
        if (this.elements.moneyDisplay) {
            this.elements.moneyDisplay.textContent = `${money} bells`;
        }
    }

    showNotification(message) {
        if (this.elements.notification) {
            this.elements.notification.textContent = message;
            this.elements.notification.style.display = 'block';
            setTimeout(() => {
                if (this.elements.notification) {
                    this.elements.notification.style.display = 'none';
                }
            }, 2000);
        }
    }

    updateInteractionPrompt(text) {
        if (!this.elements.interactionPrompt) return;
        
        if (text) {
            this.elements.interactionPrompt.textContent = text;
            this.elements.interactionPrompt.style.display = 'block';
        } else {
            this.elements.interactionPrompt.style.display = 'none';
        }
    }

    toggleInventory() {
        if (this.elements.inventoryPanel) {
            this.elements.inventoryPanel.style.display = 
                this.elements.inventoryPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleShop() {
        if (this.elements.shopPanel) {
            this.elements.shopPanel.style.display = 
                this.elements.shopPanel.style.display === 'none' ? 'block' : 'none';
        }
    }
}

