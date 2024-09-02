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

        this.mouseDown = false; // Track mouse state
        this.mousePosition = 0.5; // Initial position on the curve

        this.createPerspectiveCamera();
        this.createCameraCurve();
        this.initParallaxEffect(); // Initialize parallax effect
        this.addEventListeners(); // Add mouse event listeners
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

    addEventListeners() {
        // Mouse events
        window.addEventListener('mousedown', (event) => {
            this.mouseDown = true;
            this.parallaxTimeline.pause(); 
            document.body.style.cursor = 'grabbing'; 
        });
    
        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
            this.parallaxTimeline.play(); // Resume parallax effect on drag end
            document.body.style.cursor = 'default'; // Reset cursor to 'default' when mouse is up
        });
    
        window.addEventListener('mousemove', (event) => {
            if (this.mouseDown) {
                const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                
                this.mousePosition += movementX * 0.001;
                this.mousePosition = Math.max(0, Math.min(1, this.mousePosition)); // Clamp between 0 and 1
    
                this.updateCameraPosition(this.mousePosition);
            }
        });
    
        // Touch events for mobile
        window.addEventListener('touchstart', (event) => {
            this.mouseDown = true;
            this.parallaxTimeline.pause(); 
    
            // Track the initial touch position
            this.initialTouchX = event.touches[0].clientX;
            document.body.style.cursor = 'grabbing';
        });
    
        window.addEventListener('touchend', () => {
            this.mouseDown = false;
            this.parallaxTimeline.play(); // Resume parallax effect on touch end
            document.body.style.cursor = 'default'; // Reset cursor to 'default' when touch ends
        });
    
        window.addEventListener('touchmove', (event) => {
            if (this.mouseDown) {
                // Calculate movement difference from the initial touch position
                const touchX = event.touches[0].clientX;
                const movementX = touchX - this.initialTouchX;
                
                this.mousePosition += movementX * 0.001;
                this.mousePosition = Math.max(0, Math.min(1, this.mousePosition)); // Clamp between 0 and 1
    
                this.updateCameraPosition(this.mousePosition);
    
                // Update initial touch position for continuous movement
                this.initialTouchX = touchX;
            }
        });
    }
    

    updateCameraPosition(dotPosition) {
        this.isMoving = true; // Camera is moving

        const pointOnCurve = this.cameraCurve.getPoint(dotPosition);
        this.perspectiveCamera.position.copy(pointOnCurve);
        this.perspectiveCamera.lookAt(this.lookAtTarget);

        // Reset isMoving state after some delay
        gsap.delayedCall(1.0, () => {
            this.isMoving = false;
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
        
        if (!this.isMoving && !this.mouseDown) {
            this.parallaxTimeline.play(); // Continue parallax effect if not moving and not dragging
        }
    }
}
