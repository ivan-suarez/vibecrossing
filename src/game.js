import * as THREE from 'three';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.keys = {};
        this.clock = new THREE.Clock();
        this.moveSpeed = 5;
        this.rotationSpeed = 0.1;
        this.inventory = [];
        this.money = 0;
        this.flowers = [];
        this.shop = null;
        this.interactionDistance = 2.5;
        this.nearbyFlower = null;
        this.nearbyPlacedItem = null;
        this.nearShop = false;
        this.shopInventory = [];
        this.recentlySoldItems = [];
        this.placedItems = [];
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 8, 12);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add lighting
        this.setupLighting();

        // Create world
        this.createWorld();

        // Create player
        this.createPlayer();

        // Setup controls
        this.setupControls();

        // Setup UI
        this.setupUI();
        
        // Initialize shop inventory
        this.initializeShopInventory();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupUI() {
        // Initialize inventory UI
        this.updateInventoryUI();
        this.updateMoneyUI();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
    }

    createWorld() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x90EE90, // Light green
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add some trees
        this.createTree(-8, 0, -8);
        this.createTree(8, 0, -8);
        this.createTree(-8, 0, 8);
        this.createTree(8, 0, 8);
        this.createTree(0, 0, -10);
        this.createTree(0, 0, 10);

        // Add some decorative items (rocks, flowers)
        this.createRock(-5, 0, 5);
        this.createRock(5, 0, -5);
        this.createFlower(-3, 0, 3);
        this.createFlower(3, 0, -3);
        this.createFlower(-2, 0, 2);
        this.createFlower(2, 0, -2);
        this.createFlower(-4, 0, 4);
        this.createFlower(4, 0, -4);
        this.createFlower(-1, 0, 1);
        this.createFlower(1, 0, -1);

        // Create shop
        this.createShop(-10, 0, 0);
    }

    createTree(x, y, z) {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Leaves (multiple spheres for a nice tree shape)
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves1 = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 8, 8),
            leavesMaterial
        );
        leaves1.position.set(0, 2.5, 0);
        leaves1.castShadow = true;
        treeGroup.add(leaves1);

        const leaves2 = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 8, 8),
            leavesMaterial
        );
        leaves2.position.set(0, 3.5, 0);
        leaves2.castShadow = true;
        treeGroup.add(leaves2);

        treeGroup.position.set(x, y, z);
        this.scene.add(treeGroup);
    }

    createRock(x, y, z) {
        const rockGeometry = new THREE.DodecahedronGeometry(0.5, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            roughness: 0.9
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 0.5, z);
        rock.castShadow = true;
        this.scene.add(rock);
    }

    createFlower(x, y, z) {
        const flowerGroup = new THREE.Group();

        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.15;
        flowerGroup.add(stem);

        // Flower petals
        const petalColors = [0xFF69B4, 0xFFB6C1, 0xFFD700, 0xFF6347];
        const colorNames = ['Pink', 'Light Pink', 'Gold', 'Tomato'];
        const colorIndex = Math.floor(Math.random() * petalColors.length);
        const petalColor = petalColors[colorIndex];
        const colorName = colorNames[colorIndex];
        const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 6, 6),
                petalMaterial
            );
            petal.position.set(
                Math.cos(angle) * 0.2,
                0.3,
                Math.sin(angle) * 0.2
            );
            flowerGroup.add(petal);
        }

        // Center
        const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xFFD700 })
        );
        center.position.y = 0.3;
        flowerGroup.add(center);

        flowerGroup.position.set(x, y, z);
        
        // Store flower data for interaction
        flowerGroup.userData = {
            type: 'flower',
            color: colorName,
            colorValue: petalColor,
            pickable: true
        };
        
        this.flowers.push(flowerGroup);
        this.scene.add(flowerGroup);
    }

    createShop(x, y, z) {
        const shopGroup = new THREE.Group();

        // Shop base
        const baseGeometry = new THREE.BoxGeometry(3, 0.2, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;
        base.receiveShadow = true;
        shopGroup.add(base);

        // Shop walls
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        
        // Front wall
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 0.2),
            wallMaterial
        );
        frontWall.position.set(0, 1.1, 1.4);
        frontWall.castShadow = true;
        shopGroup.add(frontWall);

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 0.2),
            wallMaterial
        );
        backWall.position.set(0, 1.1, -1.4);
        backWall.castShadow = true;
        shopGroup.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 2, 3),
            wallMaterial
        );
        leftWall.position.set(-1.4, 1.1, 0);
        leftWall.castShadow = true;
        shopGroup.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 2, 3),
            wallMaterial
        );
        rightWall.position.set(1.4, 1.1, 0);
        rightWall.castShadow = true;
        shopGroup.add(rightWall);

        // Roof
        const roofGeometry = new THREE.ConeGeometry(2.5, 1.5, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 2.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        shopGroup.add(roof);

        // Shop sign
        const signGeometry = new THREE.BoxGeometry(1, 0.3, 0.1);
        const signMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 2.2, 1.5);
        shopGroup.add(sign);

        shopGroup.position.set(x, y, z);
        shopGroup.userData = { type: 'shop' };
        this.shop = shopGroup;
        this.scene.add(shopGroup);
    }

    createPlayer() {
        const playerGroup = new THREE.Group();

        // Body (simple capsule shape)
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        playerGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        playerGroup.add(head);

        // Simple eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.55, 0.3);
        playerGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1, 1.55, 0.3);
        playerGroup.add(rightEye);

        playerGroup.position.set(0, 0, 0);
        this.player = playerGroup;
        this.scene.add(playerGroup);
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Interaction key (E)
            if (event.code === 'KeyE') {
                this.handleInteraction();
            }
            
            // Toggle inventory (I)
            if (event.code === 'KeyI') {
                this.toggleInventory();
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
    }

    handleInteraction() {
        // Pick up nearby placed item (prioritize placed items over flowers)
        if (this.nearbyPlacedItem) {
            this.pickupPlacedItem(this.nearbyPlacedItem);
        }
        // Pick up nearby flower
        else if (this.nearbyFlower) {
            this.pickupFlower(this.nearbyFlower);
        }
        
        // Open shop
        if (this.nearShop) {
            this.toggleShop();
        }
    }

    pickupFlower(flower) {
        // Remove from scene
        this.scene.remove(flower);
        
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
        this.inventory.push(item);
        
        // Update UI
        this.updateInventoryUI();
        this.showNotification(`Picked up ${item.name}!`);
        
        this.nearbyFlower = null;
    }

    pickupPlacedItem(placedItem) {
        // Get item data from the placed object
        const itemData = placedItem.userData.itemData;
        if (!itemData) return;

        // Remove from scene
        this.scene.remove(placedItem);
        
        // Remove from placedItems array
        const index = this.placedItems.indexOf(placedItem);
        if (index > -1) {
            this.placedItems.splice(index, 1);
        }
        
        // Add back to inventory
        this.inventory.push(itemData);
        
        // Update UI
        this.updateInventoryUI();
        this.showNotification(`Picked up ${itemData.name}!`);
        
        this.nearbyPlacedItem = null;
    }

    sellItem(itemIndex) {
        if (itemIndex >= 0 && itemIndex < this.inventory.length) {
            const item = this.inventory[itemIndex];
            this.money += item.sellPrice;
            
            // Add to recently sold items for re-buying
            const soldItem = { ...item };
            this.recentlySoldItems.unshift(soldItem);
            // Keep only last 10 sold items
            if (this.recentlySoldItems.length > 10) {
                this.recentlySoldItems.pop();
            }
            
            this.inventory.splice(itemIndex, 1);
            this.updateInventoryUI();
            this.updateMoneyUI();
            this.updateShopUI();
            this.showNotification(`Sold ${item.name} for ${item.sellPrice} bells!`);
        }
    }

    buyItem(item) {
        if (this.money >= item.buyPrice) {
            this.money -= item.buyPrice;
            const purchasedItem = { ...item };
            // Remove buyPrice and add sellPrice for inventory items
            delete purchasedItem.buyPrice;
            purchasedItem.sellPrice = Math.floor(item.buyPrice * 0.5); // Sell for 50% of buy price
            this.inventory.push(purchasedItem);
            this.updateInventoryUI();
            this.updateMoneyUI();
            this.updateShopUI();
            this.showNotification(`Bought ${item.name} for ${item.buyPrice} bells!`);
        } else {
            this.showNotification(`Not enough bells! Need ${item.buyPrice} bells.`);
        }
    }

    reBuyItem(itemIndex) {
        if (itemIndex >= 0 && itemIndex < this.recentlySoldItems.length) {
            const item = this.recentlySoldItems[itemIndex];
            // Re-buy at original sell price (so you get it back for what you sold it for)
            if (this.money >= item.sellPrice) {
                this.money -= item.sellPrice;
                this.inventory.push(item);
                this.recentlySoldItems.splice(itemIndex, 1);
                this.updateInventoryUI();
                this.updateMoneyUI();
                this.updateShopUI();
                this.showNotification(`Re-bought ${item.name} for ${item.sellPrice} bells!`);
            } else {
                this.showNotification(`Not enough bells! Need ${item.sellPrice} bells.`);
            }
        }
    }

    placeItem(itemIndex) {
        if (itemIndex >= 0 && itemIndex < this.inventory.length) {
            const item = this.inventory[itemIndex];
            
            // Calculate position in front of player
            const playerPos = this.player.position;
            const playerRotation = this.player.rotation.y;
            const distance = 2; // Distance in front of player
            
            const placeX = playerPos.x + Math.sin(playerRotation) * distance;
            const placeZ = playerPos.z + Math.cos(playerRotation) * distance;
            const placeY = 0;
            
            // Create 3D object based on item type
            let placedObject = null;
            
            if (item.type === 'flower') {
                placedObject = this.createFlowerObject(placeX, placeY, placeZ, item);
            } else if (item.type === 'furniture') {
                if (item.name === 'Table') {
                    placedObject = this.createTable(placeX, placeY, placeZ);
                } else if (item.name === 'Chair') {
                    placedObject = this.createChair(placeX, placeY, placeZ);
                }
            }
            
            if (placedObject) {
                // Store item data with the object
                placedObject.userData = {
                    itemData: item,
                    itemIndex: itemIndex,
                    type: 'placed'
                };
                
                this.placedItems.push(placedObject);
                this.scene.add(placedObject);
                
                // Remove from inventory
                this.inventory.splice(itemIndex, 1);
                this.updateInventoryUI();
                this.showNotification(`Placed ${item.name}!`);
            }
        }
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
            }
        ];
    }

    createFlowerObject(x, y, z, itemData) {
        const flowerGroup = new THREE.Group();

        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.15;
        flowerGroup.add(stem);

        // Flower petals
        const petalMaterial = new THREE.MeshStandardMaterial({ color: itemData.colorValue });

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const petal = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 6, 6),
                petalMaterial
            );
            petal.position.set(
                Math.cos(angle) * 0.2,
                0.3,
                Math.sin(angle) * 0.2
            );
            flowerGroup.add(petal);
        }

        // Center
        const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xFFD700 })
        );
        center.position.y = 0.3;
        flowerGroup.add(center);

        flowerGroup.position.set(x, y, z);
        return flowerGroup;
    }

    createTable(x, y, z) {
        const tableGroup = new THREE.Group();

        // Table top
        const topGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.75;
        top.castShadow = true;
        top.receiveShadow = true;
        tableGroup.add(top);

        // Table legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.6, 0.35, -0.6);
        leg1.castShadow = true;
        tableGroup.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.6, 0.35, -0.6);
        leg2.castShadow = true;
        tableGroup.add(leg2);

        const leg3 = new THREE.Mesh(legGeometry, legMaterial);
        leg3.position.set(-0.6, 0.35, 0.6);
        leg3.castShadow = true;
        tableGroup.add(leg3);

        const leg4 = new THREE.Mesh(legGeometry, legMaterial);
        leg4.position.set(0.6, 0.35, 0.6);
        leg4.castShadow = true;
        tableGroup.add(leg4);

        tableGroup.position.set(x, y, z);
        return tableGroup;
    }

    createChair(x, y, z) {
        const chairGroup = new THREE.Group();

        // Seat
        const seatGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.5;
        seat.castShadow = true;
        seat.receiveShadow = true;
        chairGroup.add(seat);

        // Backrest
        const backrestGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
        const backrestMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const backrest = new THREE.Mesh(backrestGeometry, backrestMaterial);
        backrest.position.set(0, 0.8, -0.25);
        backrest.castShadow = true;
        chairGroup.add(backrest);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.25, 0.25, -0.25);
        leg1.castShadow = true;
        chairGroup.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.25, 0.25, -0.25);
        leg2.castShadow = true;
        chairGroup.add(leg2);

        const leg3 = new THREE.Mesh(legGeometry, legMaterial);
        leg3.position.set(-0.25, 0.25, 0.25);
        leg3.castShadow = true;
        chairGroup.add(leg3);

        const leg4 = new THREE.Mesh(legGeometry, legMaterial);
        leg4.position.set(0.25, 0.25, 0.25);
        leg4.castShadow = true;
        chairGroup.add(leg4);

        chairGroup.position.set(x, y, z);
        return chairGroup;
    }

    checkInteractions() {
        if (!this.player) return;

        const playerPos = this.player.position;
        this.nearbyFlower = null;
        this.nearbyPlacedItem = null;
        this.nearShop = false;

        // Check placed items first (prioritize over flowers)
        for (const placedItem of this.placedItems) {
            const distance = playerPos.distanceTo(placedItem.position);
            if (distance < this.interactionDistance) {
                this.nearbyPlacedItem = placedItem;
                break;
            }
        }

        // Check flowers (only if no placed item nearby)
        if (!this.nearbyPlacedItem) {
            for (const flower of this.flowers) {
                const distance = playerPos.distanceTo(flower.position);
                if (distance < this.interactionDistance) {
                    this.nearbyFlower = flower;
                    break;
                }
            }
        }

        // Check shop
        if (this.shop) {
            const shopPos = this.shop.position;
            const distance = playerPos.distanceTo(shopPos);
            if (distance < this.interactionDistance + 2) {
                this.nearShop = true;
            }
        }

        // Update interaction prompt
        this.updateInteractionPrompt();
    }

    updateInteractionPrompt() {
        const prompt = document.getElementById('interaction-prompt');
        if (!prompt) return;

        if (this.nearbyPlacedItem) {
            const itemName = this.nearbyPlacedItem.userData.itemData?.name || 'item';
            prompt.textContent = `Press E to pick up ${itemName}`;
            prompt.style.display = 'block';
        } else if (this.nearbyFlower) {
            prompt.textContent = 'Press E to pick up flower';
            prompt.style.display = 'block';
        } else if (this.nearShop) {
            prompt.textContent = 'Press E to open shop';
            prompt.style.display = 'block';
        } else {
            prompt.style.display = 'none';
        }
    }

    toggleInventory() {
        const inventoryPanel = document.getElementById('inventory-panel');
        if (inventoryPanel) {
            inventoryPanel.style.display = 
                inventoryPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleShop() {
        const shopPanel = document.getElementById('shop-panel');
        if (shopPanel) {
            shopPanel.style.display = 
                shopPanel.style.display === 'none' ? 'block' : 'none';
            this.updateShopUI();
        }
    }

    updateInventoryUI() {
        const inventoryList = document.getElementById('inventory-list');
        if (!inventoryList) return;

        inventoryList.innerHTML = '';
        
        if (this.inventory.length === 0) {
            inventoryList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Inventory is empty</p>';
            return;
        }

        this.inventory.forEach((item, index) => {
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
                this.placeItem(index);
            });
            
            inventoryList.appendChild(itemDiv);
        });
    }

    updateShopUI() {
        const shopList = document.getElementById('shop-list');
        if (!shopList) return;

        shopList.innerHTML = '';
        
        // Shop items for sale section
        if (this.shopInventory.length > 0) {
            const shopSection = document.createElement('div');
            shopSection.className = 'shop-section';
            shopSection.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 18px;">Items for Sale</h3>';
            
            this.shopInventory.forEach((item, index) => {
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
                    <button class="buy-button" data-index="${index}">Buy</button>
                `;
                
                const buyButton = itemDiv.querySelector('.buy-button');
                buyButton.addEventListener('click', () => {
                    if (this.nearShop) {
                        this.buyItem(item);
                    } else {
                        this.showNotification('You must be near the shop to buy!');
                    }
                });
                
                shopSection.appendChild(itemDiv);
            });
            
            shopList.appendChild(shopSection);
        }
        
        // Recently sold items section
        if (this.recentlySoldItems.length > 0) {
            const soldSection = document.createElement('div');
            soldSection.className = 'shop-section';
            soldSection.style.marginTop = '20px';
            soldSection.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 18px;">Recently Sold (Re-buy)</h3>';
            
            this.recentlySoldItems.forEach((item, index) => {
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
                    if (this.nearShop) {
                        this.reBuyItem(index);
                    } else {
                        this.showNotification('You must be near the shop to re-buy!');
                    }
                });
                
                soldSection.appendChild(itemDiv);
            });
            
            shopList.appendChild(soldSection);
        }
        
        // Items to sell section
        if (this.inventory.length > 0) {
            const sellSection = document.createElement('div');
            sellSection.className = 'shop-section';
            sellSection.style.marginTop = '20px';
            sellSection.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #4a4a4a; font-size: 18px;">Sell Items</h3>';
            
            this.inventory.forEach((item, index) => {
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
                    if (this.nearShop) {
                        this.sellItem(index);
                    } else {
                        this.showNotification('You must be near the shop to sell!');
                    }
                });
                
                sellSection.appendChild(itemDiv);
            });
            
            shopList.appendChild(sellSection);
        }
        
        // Empty state
        if (this.shopInventory.length === 0 && this.recentlySoldItems.length === 0 && this.inventory.length === 0) {
            shopList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No items available</p>';
        }
    }

    updateMoneyUI() {
        const moneyDisplay = document.getElementById('money-display');
        if (moneyDisplay) {
            moneyDisplay.textContent = `${this.money} bells`;
        }
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000);
        }
    }

    updatePlayer() {
        if (!this.player) return;

        const delta = this.clock.getDelta();
        const moveDistance = this.moveSpeed * delta;
        const rotationAmount = this.rotationSpeed * delta * 10;

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
        const cameraOffset = new THREE.Vector3(0, 8, 12);
        const targetPosition = this.player.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetPosition, 0.1);
        this.camera.lookAt(this.player.position);

        // Check for interactions
        this.checkInteractions();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updatePlayer();
        this.renderer.render(this.scene, this.camera);
    }
}

