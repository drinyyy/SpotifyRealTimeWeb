import * as THREE from "three";
import Experience from "./experience";
import gsap from 'gsap';

export default class Characters {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        
        this.me = this.resources.items.me;
        this.actualMe = this.me.scene;
        
        this.trunk = this.resources.items.trunk;
        this.actualTrunk = this.trunk.scene;

        this.charactermodel();
        this.trunkmodel();
    }

    
    charactermodel(){
        this.meAO = this.resources.items.meTexture;
        this.meAO.flipY = false;

        this.pants = this.resources.items.pantsTexture;
        this.pants.flipY = false;

        this.actualMe.traverse((child) => { 
            if (child.isMesh) {
                child.castShadow = true; 
        
                if (child.name === "pantsshoes") {
                    child.material = new THREE.MeshPhysicalMaterial({ map: this.pants });
                }

                if (child.name === "UpperBody") {
                    child.material = new THREE.MeshPhysicalMaterial({ color: 0xfffffff, side: THREE.DoubleSide });
                    
                }

                if (child.name === "tie") {
                    child.material = this.createTieMaterial(); 
                }
                
            }
        });
       

        this.actualMe.position.set(3, 0, -1);
      
        this.scene.add(this.actualMe);
      
       

    }

    createTieMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveAmplitude: { value: 5.1 },
                waveFrequency: { value: 0.01 }
            },
            vertexShader: `
                uniform float time;
                uniform float waveAmplitude;
                uniform float waveFrequency;
                varying vec2 vUv;

                void main() {
                    vUv = uv;

                    vec3 transformed = position;

                    // Apply wave-like motion to the lower part of the tie
                    if (position.y < 0.2) {
                        float waveX = sin(position.y * waveFrequency + time * 0.35) * waveAmplitude;

                        // Apply the wave effect on the Z-axis but clamp it to prevent downward movement
                        float waveZ = cos(position.y * waveFrequency * 1.3 + time * 0.05) * (waveAmplitude * 2.5);
                        waveZ = max(0.0, waveZ); // Ensure the Z movement is only upwards

                        // Move the vertices along both x and z axes to create a flapping effect
                        transformed.x += waveX;
                        transformed.z += waveZ;
                    }

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;

                void main() {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black color for the tie
                }
            `,
            side: THREE.DoubleSide,
        });
    }
    trunkmodel(){
        this.trunkTexture = this.resources.items.trunkTexture;
        this.trunkTexture.flipY = false;

        this.actualTrunk.traverse((child) => { 
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;  
                 child.material = new THREE.MeshStandardMaterial({map: this.trunkTexture })
            }
        });
       

        this.actualTrunk.position.set(3, 0, -1);
      
        this.scene.add(this.actualTrunk);
    }   

    update() {
        const tieMaterial = this.actualMe.getObjectByName("tie").material;
        

        tieMaterial.uniforms.waveAmplitude.value = 4.0 + Math.sin(tieMaterial.uniforms.time.value * 0.1) * 1.0; 
        tieMaterial.uniforms.waveFrequency.value = 0.01 + Math.sin(tieMaterial.uniforms.time.value * 0.15) * 0.005; 
        tieMaterial.uniforms.time.value += 0.05; 
    }
}
