import * as THREE from 'three';
import Sizes from './Sizes.js';
import Camera from './Camera';
import Time from './Time';
import Renderer from './Renderer';
import Resources from "./Resources.js";
import assets from "./assets.js";
import World from './World';
import Preloader from "./Preloader.js";
export default class Experience {
    static instance;
    constructor(canvas) {
        if (Experience.instance) {
            return Experience.instance;
        }
        Experience.instance = this;
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.time = new Time();
        this.sizes = new Sizes();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.resources = new Resources(assets);
        this.scene.background =new THREE.Color( 0x000000);
        this.world = new World();
        this.preloader = new Preloader();
  


  
        // this.preloader = new Preloader();
        
       
        
        

        this.sizes.on("resize", () => {
            this.resize();
        });
        this.time.on("update", () => {
            this.update();
        });

        
    }

    

   

    resize() {
        this.camera.resize();
        if (this.world) {
            this.world.resize();
        }
        this.renderer.resize();
    }

    update() {
        this.preloader.update();
        this.camera.update();
        this.renderer.update();
        
        if (this.world) {
            this.world.update();
        }
        
    }

    
}
