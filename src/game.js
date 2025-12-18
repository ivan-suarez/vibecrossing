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

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
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
        const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
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
        this.scene.add(flowerGroup);
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
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
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

