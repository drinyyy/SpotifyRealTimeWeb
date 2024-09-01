import * as THREE from "three";
import Experience from "./experience.js";
import gsap from 'gsap';
import { EventEmitter } from "events";

export default class Preloader extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.camera = this.experience.camera;
        this.resources = this.experience.resources;
        this.world = this.experience.world;

        // Listen for the progress event from Resources
        this.resources.on("progress", (progressRatio) => {
            const progress = progressRatio * 100;
            this.updateLoadingPercentage(progress);
        });

        // Listen for the ready event from Resources
        this.resources.on("ready", () => {
            this.updateLoadingPercentage(100);
        });

        this.world.on("worldready", () => {
            setTimeout(() => {
                this.hideIntro();
            }, 1000);
        });

        this.animateIntroText();
        this.animateLoadingPercentage();
    }

    animateIntroText() {
        const name = document.querySelector('#intro-overlay h1');
        const description = document.getElementById('description');

        gsap.fromTo([name, description], 
            { y: 50, opacity: 0 },
            { 
                duration: 1,
                y: 0,
                opacity: 1,
                ease: "power3.out",
                stagger: 0.2
            }
        );
    }

    animateLoadingPercentage() {
        const loadingPercentage = document.getElementById('loading-percentage');
        gsap.fromTo(loadingPercentage,
            { opacity: 0 },
            { 
                duration: 0.5,
                opacity: 1,
                ease: "power2.inOut"
            }
        );

        this.updateLoadingPercentage(0);
    }

    updateLoadingPercentage(progress) {
        const loadingPercentage = document.getElementById('loading-percentage');
        if (loadingPercentage) {
            gsap.to(loadingPercentage, {
                duration: 0.5,
                textContent: `${Math.round(progress)}`,
                snap: { textContent: 1 },
                ease: "power1.inOut"
            });

            if (progress === 100) {
                gsap.to(loadingPercentage, {
                    duration: 0.5,
                    opacity: 0,
                    delay: 0.8,
                    ease: "power2.in"
                });
            }
        }
    }

    hideIntro() {
        const introOverlay = document.getElementById('intro-overlay');
        const name = document.querySelector('#intro-overlay h1');
        const description = document.getElementById('description');

        gsap.to([name, description], {
            duration: 0.7,
            y: -50,
            opacity: 0,
            ease: "power2.in",
            stagger: 0.1
        });

        gsap.to(introOverlay, {
            duration: 1,
            yPercent: -100,
            ease: "power3.inOut",
            delay: 0.5,
            onComplete: () => {
                introOverlay.style.display = 'none';
            }
        });
    }

    updateScene() {
        // Your updateScene logic here
    }

    resize() {}

    update() {}
}