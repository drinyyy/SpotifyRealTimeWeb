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

        
        
    }

    

update() {

}
}