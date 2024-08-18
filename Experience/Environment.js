import * as THREE from "three";
import Experience from "./experience.js";
import GUI from 'lil-gui';

const params = {
    color1: '#0296EB',
    color2: '#D5EDF2',
    opacity1: 1,
    opacity2: 1,
    rotationY: Math.PI / 2,
    blendPosition: 0.25,
    pointLightColor: '#FFFFFF',
    pointLightIntensity: 167.4,
    pointLightPositionX: 7.06,
    pointLightPositionY: 6.32,
    pointLightPositionZ: -3.52,
};

export default class Environment {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.camera = this.experience.camera;

        this.setAmbientLightRoom1();
        this.cloud();
        this.sky();
        // this.setupGUI(); // Add GUI setup

    }

    setAmbientLightRoom1() {
        this.ambientLight = new THREE.AmbientLight("#FFFFFF", 0.1);
        this.scene.add(this.ambientLight);
        
        this.fog = new THREE.FogExp2(0xD5EDF2, 0.0001);
        this.scene.fog = this.fog;

        this.pointlight = new THREE.PointLight(params.pointLightColor, params.pointLightIntensity, 100);
        this.pointlight.position.set(params.pointLightPositionX, params.pointLightPositionY, params.pointLightPositionZ);
        this.pointlight.castShadow = true;
        this.scene.add(this.pointlight)
        this.pointlight.shadow.mapSize.width = 2048;
        this.pointlight.shadow.mapSize.height = 2048;
        this.pointlight.shadow.bias = 0.0001;
        this.pointlight.shadow.radius = 10;
        this.pointlight.shadow.camera.near = 0.01;
        this.pointlight.shadow.camera.far = 100;
        this.scene.add(this.pointlight);
        const pointLightHelper = new THREE.PointLightHelper(this.pointlight, 0.5);
        this.scene.add(pointLightHelper);
    }

    cloud(){
        const textureLoader = new THREE.TextureLoader();
        this.cloudTexture = textureLoader.load('/textures/cloud.png');
        this.cloudTexture.flipY = false;

        const planeGeometry1 = new THREE.PlaneGeometry(5, 5); 
        const planeMaterial1 = new THREE.MeshBasicMaterial({ map: this.cloudTexture, transparent: true });
        const plane1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
        plane1.position.set(-2.5, 2, 0);
        plane1.rotation.set(0,Math.PI /2 ,Math.PI /2)
        this.scene.add(plane1);
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
   
    // setupGUI() {
    //     const gui = new GUI();
        
    //     gui.addColor(params, 'pointLightColor').name('Point Light Color').onChange((value) => {
    //         this.pointlight.color.set(value);
    //     });

    //     gui.add(params, 'pointLightIntensity', 0, 300).name('Point Light Intensity').onChange((value) => {
    //         this.pointlight.intensity = value;
    //     });

    //     gui.add(params, 'pointLightPositionX', -10, 10).name('Point Light X').onChange((value) => {
    //         this.pointlight.position.x = value;
    //     });

    //     gui.add(params, 'pointLightPositionY', -10, 10).name('Point Light Y').onChange((value) => {
    //         this.pointlight.position.y = value;
    //     });

    //     gui.add(params, 'pointLightPositionZ', -10, 10).name('Point Light Z').onChange((value) => {
    //         this.pointlight.position.z = value;
    //     });
    // }

    update() {
        const distance = this.camera.perspectiveCamera.position.length();

        // Adjust fog density based on the camera distance
        this.fog.density = Math.max(0.05, 0.0002 * distance);
    }
}
