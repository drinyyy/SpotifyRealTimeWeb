import * as THREE from "three";
import Experience from "./experience.js";
import GUI from 'lil-gui';
import { gsap } from 'gsap';



const params = {
    color1: '#0296EB',
    color2: '#D5EDF2',
    opacity1: 1.0,
    opacity2: 1.0,
    cloudOpacity: 1.0,
    rotationY: Math.PI / 2,
    blendPosition: 0.25,
    pointLightColor: '#FFFFFF',
    pointLightIntensity: 0.0,
    pointLightPositionX: 1.16,
    pointLightPositionY: 0.9,
    pointLightPositionZ: 0.16,
    ambientLightColor: '#FFFFFF',
    ambientLightIntensity: 1.0,
    pointLightIntensity2: 167,
};

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;
        this.params = params; // Add this line
        this.lights();
        this.cloud();
        this.sky();
        this.createCircularSlider();
        // this.setupGUI(); // Add GUI setup

    }

    lights() {
        this.ambientLight = new THREE.AmbientLight(params.ambientLightColor, params.ambientLightIntensity);
        this.scene.add(this.ambientLight);
        
        this.fog = new THREE.FogExp2(0xD5EDF2, 0.0001);
        this.scene.fog = this.fog;

        this.pointlight = new THREE.PointLight(params.pointLightColor, params.pointLightIntensity, 100);
        this.pointlight.position.set(params.pointLightPositionX, params.pointLightPositionY, params.pointLightPositionZ);
        this.pointlight.castShadow = true;
        this.scene.add(this.pointlight)

        this.pointlight2 = new THREE.PointLight(0xffffff, params.pointLightIntensity2, 100);
        this.pointlight2.position.set(7, 6.3, -3);
        this.pointlight2.castShadow = true;
        this.scene.add(this.pointlight2)
        // const pointLightHelper = new THREE.PointLightHelper(this.pointlight, 0.5);
        // this.scene.add(pointLightHelper);
    }

    cloud(){
        const textureLoader = new THREE.TextureLoader();
        this.cloudTexture = textureLoader.load('/textures/clouds.png');
        this.cloudTexture.flipY = false;

        this.cloudGeometry = new THREE.PlaneGeometry(10, 6); 
        this.cloudMaterial = new THREE.MeshBasicMaterial({ map: this.cloudTexture, transparent: true ,opacity: this.params.cloudOpacity});
        this.cloud = new THREE.Mesh(this.cloudGeometry, this.cloudMaterial);
        this.cloud.position.set(-4.5, 1.64, -1.3);
        this.cloud.rotation.set( 0,Math.PI /2, 3, )
        this.scene.add(this.cloud);
    }

    sky() {
        const geometry = new THREE.PlaneGeometry(50, 20);
        
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform vec3 color1;
            uniform vec3 color2;
            uniform float opacity1;
            uniform float opacity2;
            uniform float blendPosition;
            varying vec2 vUv;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main() {
                vec2 uv = vUv;
                float noise = random(uv * 50.0);
                float blendFactor = smoothstep(0.0, 1.0, (uv.y - blendPosition) * 2.0);
                vec3 gradientColor = mix(color1, color2, blendFactor);
                float gradientOpacity = mix(opacity1, opacity2, blendFactor);
                vec3 grainyColor = gradientColor + noise * 0.05;
                gl_FragColor = vec4(grainyColor, gradientOpacity);
            }
        `;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(params.color1) },
                color2: { value: new THREE.Color(params.color2) },
                opacity1: { value: params.opacity1 },
                opacity2: { value: params.opacity2 },
                blendPosition: { value: params.blendPosition },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
        });

        this.cityBackground = new THREE.Mesh(geometry, this.material);
        this.cityBackground.position.set(-5, 2.5, -10);
        this.cityBackground.rotateY(params.rotationY);
        this.cityBackground.rotateZ(Math.PI);
        this.scene.add(this.cityBackground);
    }
   
    setupGUI() {
        const gui = new GUI();
        
        gui.add(params, 'ambientLightIntensity', 0, 300).name('AmbientIntensity').onChange((value) => {
            this.ambientLight.intensity = value;
        });

        gui.addColor(params, 'pointLightColor').name('Point Light Color').onChange((value) => {
            this.pointlight2.color.set(value);
        });

        gui.add(params, 'pointLightIntensity', 0, 300).name('Point Light Intensity').onChange((value) => {
            this.pointlight2.intensity = value;
        });

        gui.add(params, 'pointLightPositionX', -10, 10).name('Point Light X').onChange((value) => {
            this.cloud.position.x = value;
        });

        gui.add(params, 'pointLightPositionY', -10, 10).name('Point Light Y').onChange((value) => {
            this.cloud.position.y = value;
        });

        gui.add(params, 'pointLightPositionZ', -10, 10).name('Point Light Z').onChange((value) => {
            this.cloud.position.z = value;
        });

    }

    createCircularSlider() {
        const size = 100;
        const svgC = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgC.setAttribute("width", size);
        svgC.setAttribute("height", size);
        svgC.style.position = "absolute";
        svgC.style.top = "5%";
        svgC.style.right = "2%";
        
        // Create a wobbly circle path
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const radius = size / 2 - 5;
        const center = size / 2;
        let d = `M ${center + radius} ${center}`;
    
        for (let i = 0; i <= 360; i += 10) {
            const angle = i * Math.PI / 180;
            const wobble = Math.random() * 4 - 2; // Random value between -2 and 2
            const x = center + (radius + wobble) * Math.cos(angle);
            const y = center + (radius + wobble) * Math.sin(angle);
            d += ` L ${x} ${y}`;
        }
    
        d += ' Z'; // Close the path
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#ccc");
        path.setAttribute("stroke-width", "2");
        
        const dotC = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dotC.setAttribute("r", "5");
        dotC.setAttribute("fill", "#FFFFFF");
        path.style.opacity = "30%"; 
        dotC.style.opacity = "50%";      
        
        // Set initial position of the dot at the top of the circle
        dotC.setAttribute("cx", size - 5);
        dotC.setAttribute("cy", size / 2);
    
        const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        foreignObject.setAttribute("width", size);
        foreignObject.setAttribute("height", size);
        foreignObject.setAttribute("x", "0");
        foreignObject.setAttribute("y", "0");
    
        // Create a div to hold the icon
        const iconDiv = document.createElement("div");
        iconDiv.style.width = "100%";
        iconDiv.style.height = "100%";
        iconDiv.style.display = "flex";
        iconDiv.style.justifyContent = "center";
        iconDiv.style.alignItems = "center";
    
        // Create the icon element
        const icon = document.createElement("i");
        icon.className = "material-symbols-outlined";
        icon.textContent = "routine";
        icon.style.fontSize = "24px";
        icon.style.color = "#fff";
    
        iconDiv.appendChild(icon);
        foreignObject.appendChild(iconDiv);
    
        svgC.appendChild(path);
        svgC.appendChild(dotC);
        svgC.appendChild(foreignObject);
    
        let isDragging = false;
        let lastUpdateTime = 0;
        const updateDelay = 100; // 100ms delay between updates
    
        const updateDotPosition = (e) => {
            const currentTime = Date.now();
            if (currentTime - lastUpdateTime < updateDelay) return;
            lastUpdateTime = currentTime;
    
            const rect = svgC.getBoundingClientRect();
            const centerX = rect.left + size / 2;
            const centerY = rect.top + size / 2;
            
            let angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            if (angle < 0) angle += 2 * Math.PI;
    
            const x = Math.cos(angle) * radius + size / 2;
            const y = Math.sin(angle) * radius + size / 2;
    
            // Use GSAP to animate the dot position
            gsap.to(dotC, {
                attr: { cx: x, cy: y },
                duration: 0.3,
                ease: "power2.out"
            });
    
            // Update ambient light intensity
            const normalizedAngle = angle / (2 * Math.PI);
    
            let newAmbientIntensity, newPointLightIntensity, newFillLightIntensity, newCloudOpacity, newBackgroundOpacity1, newBackgroundOpacity2;
    
            if (normalizedAngle <= 0.5) {
                newAmbientIntensity = 1.1 - (normalizedAngle * 2 * 0.9);
                newFillLightIntensity = normalizedAngle * 2 * 0.3;
                newPointLightIntensity = 167 - (normalizedAngle * 2 * 142); 
                newCloudOpacity = 1.0 - (normalizedAngle * 2 * 0.9);
                newBackgroundOpacity1 = 1.0 - (normalizedAngle * 2 * 0.9);
                newBackgroundOpacity2 = 1.0 - (normalizedAngle * 2 * 0.9);
            } else {
                newAmbientIntensity = 0.2 + ((normalizedAngle - 0.5) * 2 * 0.9);
                newFillLightIntensity = 0.3 - ((normalizedAngle - 0.5) * 2 * 0.3);
                newPointLightIntensity = 25 + ((normalizedAngle - 0.5) * 2 * 142);
                newCloudOpacity = 0.1 + ((normalizedAngle - 0.5) * 2 * 0.9);
                newBackgroundOpacity1 = 0.1 + ((normalizedAngle - 0.5) * 2 * 0.9);
                newBackgroundOpacity2 = 0.1 + ((normalizedAngle - 0.5) * 2 * 0.9);
            }
    
            // Use GSAP to animate the light and material changes
            gsap.to(this.params, {
                ambientLightIntensity: newAmbientIntensity,
                pointLightIntensity: newFillLightIntensity,
                pointLightIntensity2: newPointLightIntensity,
                cloudOpacity: newCloudOpacity,
                opacity1: newBackgroundOpacity1,
                opacity2: newBackgroundOpacity2,
                duration: 0.3,
                ease: "power2.out",
                onUpdate: () => {
                    this.ambientLight.intensity = this.params.ambientLightIntensity;
                    this.pointlight.intensity = this.params.pointLightIntensity;
                    this.pointlight2.intensity = this.params.pointLightIntensity2;
                    this.cloudMaterial.opacity = this.params.cloudOpacity;
                    this.material.uniforms.opacity1.value = this.params.opacity1;
                    this.material.uniforms.opacity2.value = this.params.opacity2;
                }
            });
        };
    
        const enlargeDot = () => {
            gsap.to(dotC, {
                attr: { r: 7 },
                opacity: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        };
    
        const shrinkDot = () => {
            if (!isDragging) {
                gsap.to(dotC, {
                    attr: { r: 5 },
                    opacity: 0.5,
                    duration: 0.2,
                    ease: "power2.out"
                });
            }
        };
    
        svgC.addEventListener("mouseenter", enlargeDot);
        svgC.addEventListener("mouseleave", shrinkDot);
    
        svgC.addEventListener("mousedown", (e) => {
            isDragging = true;
            enlargeDot();
            updateDotPosition(e);
        });
    
        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                updateDotPosition(e);
            }
        });
    
        document.addEventListener("mouseup", () => {
            isDragging = false;
            shrinkDot();
        });
    
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    
        const style = document.createElement("style");
        style.textContent = `
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
        `;
        document.head.appendChild(style);
    
        document.body.appendChild(svgC);
    
        return svgC;
    }


    update() {
        const distance = this.camera.perspectiveCamera.position.length();

        // Adjust fog density based on the camera distance
        this.fog.density = Math.max(0.05, 0.0002 * distance);
    }
}
