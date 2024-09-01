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

        this.isMoving = false; // To track if the camera is moving
        this.lookAtTarget = new THREE.Vector3(1, 0.5, 0); // Initial lookAt target

        this.createPerspectiveCamera();
        this.initParallaxEffect(); // Initialize parallax effect
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
        this.perspectiveCamera.lookAt(this.lookAtTarget);
        
        this.createCameraCurve();
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

    initParallaxEffect() {
        this.parallaxTimeline = gsap.timeline({ repeat: -1, paused: true });
    
        // Calculate the original target position
        const originalPosition = this.lookAtTarget.clone();
    
        this.parallaxTimeline.to(this.lookAtTarget, {
            x: '+=0.1',
            y: '+=0.05',
            duration: 5,
            ease: 'power1.inOut'
        });
    
        this.parallaxTimeline.to(this.lookAtTarget, {
            x: '-=0.2',
            y: '-=0.01',
            duration: 5,
            ease: 'power1.inOut'
        });
    
        this.parallaxTimeline.to(this.lookAtTarget, {
            x: originalPosition.x,
            y: originalPosition.y,
            duration: 5,
            ease: 'power1.inOut'
        });
    
        this.parallaxTimeline.play();
    }

    updateCameraPosition(dotPosition) {
        this.isMoving = true; // Camera is moving
        this.parallaxTimeline.pause(); // Stop parallax effect

        const pointOnCurve = this.cameraCurve.getPoint(dotPosition);
        this.perspectiveCamera.position.copy(pointOnCurve);
        this.perspectiveCamera.lookAt(this.lookAtTarget);

        // Reset isMoving state after some delay
        gsap.delayedCall(0.5, () => {
            this.isMoving = false;
            this.parallaxTimeline.play(); // Resume parallax effect
        });
    }

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
        // Update the camera's lookAt to follow the moving target
        this.perspectiveCamera.lookAt(this.lookAtTarget);
        
        if (!this.isMoving) {
            this.parallaxTimeline.play(); // Continue parallax effect if not moving
        }
    }
}
