import { gsap } from "gsap";
import * as THREE from "three";

import Experience from "./experience";
import grassVertexShader from "./vertex.glsl"
import grassFragmentShader from "./fragment.glsl"
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import GUI from 'lil-gui'; // Import lil-gui
export default class Ground {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;
        this.renderer = this.experience.renderer;

        this.ground = this.resources.items.ground;
        this.actualGround = this.ground.scene;

        this.flower = this.resources.items.flower;
        this.actualFlower = this.flower.scene;

        this.daisy = this.resources.items.daisy;
        this.actualDaisy = this.daisy.scene;

        

        this.setGround();
        
        this.setFlowers();
        this.setFlowers1();
        this.setGrass();
        // this.placeCubes();
        // this.setGUI();
    }

    setGround() {
        this.actualGround.position.set(3, 0, -1);
        this.groundMaterial = new THREE.MeshBasicMaterial({color:0x27601F})
        this.actualGround.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = this.groundMaterial;
                if (!child.geometry.index) {
                    
                    child.geometry = new THREE.BufferGeometry().setFromPoints(child.geometry.attributes.position.array);
                }
            }
        });
    
        this.scene.add(this.actualGround);
    }
    

   
    setFlowers() {
        const textureLoader = new THREE.TextureLoader();
    this.AOTexture = textureLoader.load('/textures/Sunflower.png');
    this.AOTexture.flipY = false;

    // Custom shader material for the wind effect
    this.windShaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uTexture: { value: this.AOTexture },
        },
        vertexShader: `
            uniform float uTime;
varying vec2 vUv;

void main() {
    vUv = uv;

    // Wind effect
    vec3 transformed = position;

    // Define the threshold for the wind effect (upper 70% of the flower)
    float heightThreshold = 0.3; // Bottom 30% will not be affected (1 - 0.7)
    
    // Apply wind effect only to the upper part of the flower
    float windStrength = 0.1; // Adjust the wind strength here

    // Use a smoothstep function to create a gradual transition for the wind effect
    float influence = smoothstep(heightThreshold, 1.0, transformed.y); // Smooth transition from 0% to 100% effect

    // Calculate wind displacement in local space before applying instance rotation
    float windOffset = sin(transformed.y * 0.3 + uTime) * windStrength * influence;
    
    // Transform the wind effect to account for instance rotation
    vec3 windEffect = vec3(windOffset, 0.0, 0.0); // Wind effect in the local x direction
    
    // Apply the instance rotation
    vec3 transformedPosition = (instanceMatrix * vec4(transformed + windEffect, 1.0)).xyz;
    
    // Final position after applying model view and projection matrices
    vec4 mvPosition = modelViewMatrix * vec4(transformedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}


        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            varying vec2 vUv;

            void main() {
                vec4 color = texture2D(uTexture, vUv);

                if (color.a < 0.5) discard; // Alpha test for transparency

                gl_FragColor = color;
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
    });

    // Prepare the flower model with custom shader material
    this.actualFlower.traverse((child) => {
        if (child.isMesh) {
            child.material = this.windShaderMaterial;
        }
    });
    
        // Debugging: Log the flower model structure
        
    
        // Find a suitable mesh from the ground to sample from
        let groundMesh;
        this.actualGround.traverse((child) => {
            if (child.isMesh && !groundMesh) {
                groundMesh = child;
            }
        });
    
        if (!groundMesh) {
            
            return;
        }
        
        const boundingBox = new THREE.Box3().setFromObject(groundMesh);
        const groundSize = new THREE.Vector3();
        boundingBox.getSize(groundSize);
    
        // Create a surface sampler
        const sampler = new MeshSurfaceSampler(groundMesh).build();
        const tempPosition = new THREE.Vector3();
        const tempNormal = new THREE.Vector3();
        
        const dummy = new THREE.Object3D();
        const matrices = [];
    
        const flowerCount = 50; // Number of flowers to instance
        const scaleFactor = Math.max(groundSize.x, groundSize.z) / 10;
        const positionOffset = new THREE.Vector3(3, 0, -1); // Adjust as needed
    
        // Define a single exclusion zone
        const exclusionZone = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
        const exclusionOffset = new THREE.Vector3(0.5, 0, -0.1); // Example offset

    // Translate the exclusion zone
        exclusionZone.translate(exclusionOffset);
        // Visualize the exclusion zone
        // this.visualizeExclusionZone(exclusionZone);
    
        // Function to check if a position is valid (outside the exclusion zone)
        const isPositionValid = (position) => {
            return !exclusionZone.containsPoint(position);
        };
    
        let placedFlowers = 0;
        while (placedFlowers < flowerCount) {
            sampler.sample(tempPosition, tempNormal);
            
            tempPosition.multiplyScalar(5.8).add(positionOffset);
            tempPosition.addScaledVector(tempNormal, 0.02);
    
            // Check if the position is valid before placing the flower
            if (isPositionValid(tempPosition)) {
                dummy.position.copy(tempPosition);
                dummy.rotation.y =  Math.PI / 2;
                dummy.scale.setScalar(0.6 * 0.7);
                dummy.updateMatrix();
    
                matrices.push(dummy.matrix.clone());
                placedFlowers++;
            }
        }
    
        // Find all meshes in the flower model
        const flowerMeshes = [];
        this.actualFlower.traverse((child) => {
            if (child.isMesh) {
                flowerMeshes.push(child);
            }
        });
    
        if (flowerMeshes.length === 0) {
            
            return;
        }
    
        
    
        // Create instanced meshes for each part of the flower
        flowerMeshes.forEach((mesh, index) => {
            const instancedFlower = new THREE.InstancedMesh(
                mesh.geometry,
                this.windShaderMaterial,
                flowerCount
            );
    
            // Set instance matrices
            matrices.forEach((matrix, i) => {
                instancedFlower.setMatrixAt(i, matrix);
            });
    
            instancedFlower.instanceMatrix.needsUpdate = true;
            
            this.scene.add(instancedFlower);
            
        });
    }
    







    setFlowers1() {
        const textureLoader = new THREE.TextureLoader();
        this.AOTexture = textureLoader.load('/textures/Daisy.png');
        this.AOTexture.flipY = false;
    
        // Prepare the flower model
        this.actualDaisy.traverse((child) => {
    if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ 
            map: this.AOTexture, // Your texture
            transparent: true,
            side: THREE.DoubleSide, // Renders both sides of the mesh
            alphaTest: 0.5 // Adjust this value as needed
        });
    }
});
    
        // Debugging: Log the flower model structure
        
    
        // Find a suitable mesh from the ground to sample from
        let groundMesh;
        this.actualGround.traverse((child) => {
            if (child.isMesh && !groundMesh) {
                groundMesh = child;
            }
        });
    
        if (!groundMesh) {
            
            return;
        }
        
        const boundingBox = new THREE.Box3().setFromObject(groundMesh);
        const groundSize = new THREE.Vector3();
        boundingBox.getSize(groundSize);
    
        // Create a surface sampler
        const sampler = new MeshSurfaceSampler(groundMesh).build();
        const tempPosition = new THREE.Vector3();
        const tempNormal = new THREE.Vector3();
        
        const dummy = new THREE.Object3D();
        const matrices = [];
    
        const flowerCount = 800; // Number of flowers to instance
        const scaleFactor = Math.max(groundSize.x, groundSize.z) / 10;
        const positionOffset = new THREE.Vector3(3, 0, -1); // Adjust as needed
    
        // Define a single exclusion zone
        const exclusionZone = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
        const exclusionOffset = new THREE.Vector3(0.5, 0, -0.1); // Example offset

    // Translate the exclusion zone
        exclusionZone.translate(exclusionOffset);
        // Visualize the exclusion zone
        // this.visualizeExclusionZone(exclusionZone);
    
        // Function to check if a position is valid (outside the exclusion zone)
        const isPositionValid = (position) => {
            return !exclusionZone.containsPoint(position);
        };
    
        let placedFlowers = 0;
        while (placedFlowers < flowerCount) {
            sampler.sample(tempPosition, tempNormal);
            
            tempPosition.multiplyScalar(5.8).add(positionOffset);
            tempPosition.addScaledVector(tempNormal, 0.02);
    
            // Check if the position is valid before placing the flower
            if (isPositionValid(tempPosition)) {
                dummy.position.copy(tempPosition);
                dummy.rotation.y = Math.random() * Math.PI * 2;
                dummy.scale.setScalar(0.8 * 0.9);
                dummy.updateMatrix();
    
                matrices.push(dummy.matrix.clone());
                placedFlowers++;
            }
        }
    
        // Find all meshes in the flower model
        const flowerMeshes = [];
        this.actualDaisy.traverse((child) => {
            if (child.isMesh) {
                flowerMeshes.push(child);
            }
        });
    
        if (flowerMeshes.length === 0) {
            
            return;
        }
    
        
    
        // Create instanced meshes for each part of the flower
        flowerMeshes.forEach((mesh, index) => {
            const instancedFlower = new THREE.InstancedMesh(
                mesh.geometry,
                mesh.material,
                flowerCount
            );
    
            // Set instance matrices
            matrices.forEach((matrix, i) => {
                instancedFlower.setMatrixAt(i, matrix);
            });
    
            instancedFlower.instanceMatrix.needsUpdate = true;
            instancedFlower.castShadow = true;
            this.scene.add(instancedFlower);
            
        });
    }


    setGrass() {
        let groundMesh;
        this.actualGround.traverse((child) => {
            if (child.isMesh && !groundMesh) {
                groundMesh = child;
            }
        });
    
        if (!groundMesh) {
            console.error('No mesh found in actualGround');
            return;
        }
    
        // Calculate the bounding box of the ground mesh
        const boundingBox = new THREE.Box3().setFromObject(groundMesh);
        const groundSize = new THREE.Vector3();
        boundingBox.getSize(groundSize);
    
        
    
        const grassCount = 100000;
        const grassHeight = 0.2;
        const grassWidth = 0.02;
        const segments = 8; // Number of segments in the blade
    
        // Create a custom geometry for the grass blade with more segments
        const grassGeometry = new THREE.BufferGeometry();
        const positions = [];
        const indices = [];
        const bladeCurves = new Float32Array(grassCount);
        const instanceDensities = new Float32Array(grassCount);
    
        // Create vertices and indices for a blade with segments
        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            const y = progress * grassHeight;
            const width = grassWidth * (1 - progress); // Taper the blade
    
            positions.push(-width / 2, y, 0);
            positions.push(width / 2, y, 0);
    
            if (i < segments) {
                const offset = i * 2;
                indices.push(offset, offset + 1, offset + 2);
                indices.push(offset + 2, offset + 1, offset + 3);
            }
        }
    
        grassGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        grassGeometry.setIndex(indices);
        grassGeometry.setAttribute('bladeCurve', new THREE.InstancedBufferAttribute(bladeCurves, 1));
        grassGeometry.setAttribute('instanceDensity', new THREE.InstancedBufferAttribute(instanceDensities, 1));
        
        const noiseTexture = new THREE.TextureLoader().load('/textures/perlin.png');
        noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
        this.grassMaterial = new THREE.ShaderMaterial({
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
        time: { value: 0.0 },
        windSpeed: { value: 1.5 },  // Reduced from 2.1 for more subtle movement
        windStrength: { value: 3.0 },
        windDirection: { value: new THREE.Vector2(1.2, 2.2) },
        noiseTexture: { value: noiseTexture },
        grassColorLow: { value: new THREE.Color(0.066, 0.324, 0.054) },
        grassColorMid:{ value: new THREE.Color(0.779, 0.779, 0.508) }, // Default low color
        grassColorHigh: { value: new THREE.Color(0.9, 0.5, 0.15) },
       
    },
});
    
        const grass = new THREE.InstancedMesh(grassGeometry, this.grassMaterial, grassCount);
    
        const matrix = new THREE.Matrix4();
        const colors = new Float32Array(grassCount * 3);
    
        // Create a sampler for the ground mesh
        const sampler = new MeshSurfaceSampler(groundMesh).build();
        const tempPosition = new THREE.Vector3();
        const tempNormal = new THREE.Vector3();
    
        // Adjust the scaling based on the bounding box of the ground mesh
        const scaleFactor = Math.max(groundSize.x, groundSize.z) / 10; // Adjust this divisor as needed
    
        const positionOffset = new THREE.Vector3(3, 0, -1); // Adjust these values as needed

        for (let i = 0; i < grassCount; i++) {
            sampler.sample(tempPosition, tempNormal);
        
            // Apply the position offset
            tempPosition.multiplyScalar(5.8).add(positionOffset); // Scale and then add the offset
        
            // Orient grass blade based on surface normal
            matrix.makeRotationFromEuler(new THREE.Euler(
                tempNormal.x * Math.PI * 0.5,
                tempNormal.y * Math.PI * 0.5,
                tempNormal.z * Math.PI * 0.5
            ));
            matrix.setPosition(tempPosition);
        
            // Add some random rotation and scaling for variety
            
            const scale = (0.8 + Math.random() * 0.4) * scaleFactor;
            matrix.scale(new THREE.Vector3(scale, scale, scale));
        
            grass.setMatrixAt(i, matrix);
        
            // Set color for each instance
            const shade = 0.8 + Math.random() * 0.4;
            colors[i * 3] = 0.23 * shade;     // R
            colors[i * 3 + 1] = 0.73 * shade; // G
            colors[i * 3 + 2] = 0.23 * shade; // B
        
            // Set bladeCurve and instanceDensity (if you're using these)
            bladeCurves[i] = Math.random() * Math.PI * 0.5;
            instanceDensities[i] = Math.random();
        }
    
        grass.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    
        this.scene.add(grass);
    }
    

    setGUI() {
        const gui = new GUI();
        const grassFolder = gui.addFolder('Grass Colors');
        
        // Low grass color controls
        grassFolder.add(this.grassMaterial.uniforms.grassColorLow.value, 'r', 0, 1).name('Low Grass Red');
        grassFolder.add(this.grassMaterial.uniforms.grassColorLow.value, 'g', 0, 1).name('Low Grass Green');
        grassFolder.add(this.grassMaterial.uniforms.grassColorLow.value, 'b', 0, 1).name('Low Grass Blue');
        
        grassFolder.add(this.grassMaterial.uniforms.grassColorMid.value, 'r', 0, 1).name('Mid Grass Red');
        grassFolder.add(this.grassMaterial.uniforms.grassColorMid.value, 'g', 0, 1).name('Mid Grass Green');
        grassFolder.add(this.grassMaterial.uniforms.grassColorMid.value, 'b', 0, 1).name('Mid Grass Blue');
        // High grass color controls
        grassFolder.add(this.grassMaterial.uniforms.grassColorHigh.value, 'r', 0, 1).name('High Grass Red');
        grassFolder.add(this.grassMaterial.uniforms.grassColorHigh.value, 'g', 0, 1).name('High Grass Green');
        grassFolder.add(this.grassMaterial.uniforms.grassColorHigh.value, 'b', 0, 1).name('High Grass Blue');
        
        grassFolder.open();

       
    }
    
    
   


    update() {
        this.windShaderMaterial.uniforms.uTime.value += 0.001;
        this.grassMaterial.uniforms.time.value += 0.001;
       
    }
}