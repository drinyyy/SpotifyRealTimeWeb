import * as THREE from 'three';
import Experience from "./experience";
import { gsap } from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        this.createPerspectiveCamera();
        
    }

    createPerspectiveCamera() {
        const initialFOV = window.innerWidth < 648 ? 65 : 35;

        this.perspectiveCamera = new THREE.PerspectiveCamera(
            initialFOV,
            this.sizes.aspect,
            0.1,
            100
        );
        this.scene.add(this.perspectiveCamera);
        this.perspectiveCamera.position.set(3.58, 0.239, 1.82);  
        this.perspectiveCamera.lookAt(new THREE.Vector3(1, 0.5, 0));
        console.log(this.perspectiveCamera.position)
        this.createCameraCurve();

        
    //     const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    // const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    // boxMesh.position.set(1.0, 0.7, 0.5); // Place the box at the target location
    // this.scene.add(boxMesh);
    }
    
    createCameraCurve() {
        this.cameraCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(3.17, 0.45, 2),
            new THREE.Vector3(3.37, 0.35, 2),
            new THREE.Vector3(3.58, 0.239, 1.82),
            new THREE.Vector3(3.5, 0.3, 1.0),
            new THREE.Vector3(3.80, 0.35, 1.0),
        ]);
    }
    
    updateCameraPosition(dotPosition) {
        const pointOnCurve = this.cameraCurve.getPoint(dotPosition);
        this.perspectiveCamera.position.copy(pointOnCurve);
        this.perspectiveCamera.lookAt(new THREE.Vector3(1, 0.5, 0));
    }
    
    // Call updateCameraPosition with the normalized dot position
    
    

    resize() {
        if (window.innerWidth < 648) {
            this.perspectiveCamera.fov = 55;
        } else {
            this.perspectiveCamera.fov = 35;
        }
        // Updating Perspective Camera on Resize
        this.perspectiveCamera.aspect = this.sizes.aspect;
        this.perspectiveCamera.updateProjectionMatrix();
    }

    update() {
        
       
      
    }
}
