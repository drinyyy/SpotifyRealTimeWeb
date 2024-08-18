import * as THREE from "three";
import Experience from "./experience";
import gsap from 'gsap';

export default class Information {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;
        this.resources = this.experience.resources;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.planes = [];
        this.corners();

        // Add event listener for mouse move
        
    }

    corners() {
        // Create a plane geometry
        const geometry = new THREE.PlaneGeometry(0.05, 0.05);
    
        // Create a material for the planes (you can customize this)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uColor: { value: new THREE.Color(0xFEFCE9) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                uniform vec3 uColor;
                varying vec2 vUv;
        
                float noise(vec2 p) {
                    return sin(p.x * 5.0 + time) * sin(p.y * 2.0 + time);
                }
        
                void main() {
                    vec2 p = -1.0 + 2.0 * vUv;
                    p += noise(p) * 0.05;  // Adds the wobbly effect
        
                    float len = length(p);
                    float noisy = sin(len * 10.0 - time * 0.5) * 0.2;
                    float drippy = smoothstep(0.8, 0.3, len + noisy);
        
                    gl_FragColor = vec4(uColor, drippy);
                }
            `,
            transparent: true,
        });
// Create the first plane mesh
// const plane1 = new THREE.Mesh(geometry, this.material);
// // Create the second plane mesh
// const plane2 = new THREE.Mesh(geometry, this.material);

const plane3 = new THREE.Mesh(geometry, this.material);

// const plane4 = new THREE.Mesh(geometry, this.material);
// Add the planes to the scene
// this.scene.add(plane1);
// this.scene.add(plane2);
this.scene.add(plane3);
// this.scene.add(plane4);    

// Set positions in normalized device coordinates (NDC) space
// NDC space ranges from -1 to 1 on both axes, where (0, 0) is the center
// plane1.position.set(1, -1, 0); // bottom right corner
// plane2.position.set(-1, -1, 0); // bottom left corner
plane3.position.set(1, 1, 0); // bottom right corner
// plane4.position.set(-1, 1, 0); // bottom left corner
// Convert the planes to 2D screen space using the camera
// const plane1Position = new THREE.Vector3(1, -1, 0);
// const plane2Position = new THREE.Vector3(-1, -1, 0);
const plane3Position = new THREE.Vector3(1, 1, 0);
// const plane4Position = new THREE.Vector3(-1, 1, 0);

// plane1Position.unproject(this.camera.perspectiveCamera);
// plane2Position.unproject(this.camera.perspectiveCamera);
plane3Position.unproject(this.camera.perspectiveCamera);
// plane4Position.unproject(this.camera.perspectiveCamera);
// Set the positions for 2D screen space
// plane1.position.copy(plane1Position);
// plane2.position.copy(plane2Position);
plane3.position.copy(plane3Position);
// plane4.position.copy(plane4Position);

// plane1.lookAt(this.camera.perspectiveCamera.position);
// plane2.lookAt(this.camera.perspectiveCamera.position);
plane3.lookAt(this.camera.perspectiveCamera.position);
// plane4.lookAt(this.camera.perspectiveCamera.position);
}

update() {
this.material.uniforms.time.value += 0.005;
}
}