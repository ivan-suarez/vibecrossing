import * as THREE from 'three';

/**
 * World class handles all 3D model creation and world setup
 * Separated from gameplay logic for better code organization
 */
export class World {
    constructor(scene) {
        this.scene = scene;
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

    createGround() {
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
        return ground;
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
        return treeGroup;
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
        return rock;
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
        
        this.scene.add(flowerGroup);
        return flowerGroup;
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
        this.scene.add(shopGroup);
        return shopGroup;
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
        this.scene.add(playerGroup);
        return playerGroup;
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
        this.scene.add(flowerGroup);
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
        this.scene.add(tableGroup);
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
        this.scene.add(chairGroup);
        return chairGroup;
    }

    createPond(x, y, z) {
        const pondGroup = new THREE.Group();

        // Pond base (hole in ground)
        const pondGeometry = new THREE.CylinderGeometry(4, 4, 0.5, 32);
        const pondMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2E5090,
            roughness: 0.1,
            metalness: 0.3
        });
        const pondBase = new THREE.Mesh(pondGeometry, pondMaterial);
        pondBase.position.y = 0.25;
        pondBase.receiveShadow = true;
        pondGroup.add(pondBase);

        // Water surface
        const waterGeometry = new THREE.CircleGeometry(4, 32);
        const waterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4169E1,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.5
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.5;
        water.receiveShadow = true;
        pondGroup.add(water);

        pondGroup.position.set(x, y, z);
        pondGroup.userData = { 
            type: 'pond',
            center: new THREE.Vector3(x, y, z),
            radius: 4
        };
        this.scene.add(pondGroup);
        return pondGroup;
    }

    createFish(x, y, z) {
        // Fish body (ellipse shape) - made slightly larger and more visible
        const fishGeometry = new THREE.SphereGeometry(0.25, 8, 6);
        fishGeometry.scale(1.5, 0.6, 0.8);
        const fishMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1E3A8A, // Darker blue for better visibility
            roughness: 0.3,
            metalness: 0.2,
            emissive: 0x000033 // Slight glow to make them more visible
        });
        const fishMesh = new THREE.Mesh(fishGeometry, fishMaterial);

        // Fish tail
        const tailGeometry = new THREE.ConeGeometry(0.15, 0.3, 6);
        const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x1E3A8A });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(-0.3, 0, 0);
        tail.rotation.z = Math.PI / 2;

        const fishGroup = new THREE.Group();
        fishGroup.add(fishMesh);
        fishGroup.add(tail);
        fishGroup.position.set(x, y, z);

        // Fish properties
        fishGroup.userData = {
            type: 'fish',
            speed: 0.5 + Math.random() * 0.5,
            direction: Math.random() * Math.PI * 2,
            targetDirection: Math.random() * Math.PI * 2,
            changeDirectionTimer: 0,
            changeDirectionInterval: 2 + Math.random() * 3,
            isNibbling: false,
            nibbleTimer: 0,
            facingBobbler: false
        };

        this.scene.add(fishGroup);
        return fishGroup;
    }
}

