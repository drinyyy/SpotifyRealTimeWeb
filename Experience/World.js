import * as THREE from "three";
import Experience from "./experience.js";

import Environment from "./Environment.js";

import Ground from "./Ground.js"
import Characters from "./Characters.js"

import { EventEmitter } from "events";
export default class World  extends EventEmitter {
    constructor() {
        super();
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.camera = this.experience.camera;
        this.resources = this.experience.resources;
    
       

        this.resources.on("ready", () => {
            this.environment = new Environment();
            this.ground = new Ground();
            this.Characters = new Characters();
            
            
            this.emit("worldready");
        });

        
    }

    
    
resize() {}

    update() {
        
        if(this.ground){
            this.ground.update();
            
        }
        
        if(this.Characters){
            this.Characters.update();
            
        }
        
        if(this.environment){
            this.environment.update();
        }
        
    }
    
}