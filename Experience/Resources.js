import * as THREE from "three";
import { EventEmitter } from "events";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Experience from "./experience.js";

export default class Resources extends EventEmitter {
    constructor(assets) {
        super();
        this.experience = new Experience();
        this.renderer = this.experience.renderer;
        this.assets = assets;
        this.items = {};
        this.queue = this.assets.length;
        this.loaded = 0;

        this.setLoaders();
        this.startLoading();
    }

    setLoaders() {
        this.loadingManager = new THREE.LoadingManager(
            // Loaded
            () => {
                this.emit("ready");
            },
            // Progress
            (itemUrl, itemsLoaded, itemsTotal) => {
                const progressRatio = itemsLoaded / itemsTotal;
                this.emit("progress", progressRatio);
            }
        );

        this.loaders = {};
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
        this.loaders.dracoLoader = new DRACOLoader();
        this.loaders.dracoLoader.setDecoderPath("/draco/");
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
    }

    startLoading() {
        for (const asset of this.assets) {
            if (asset.type === "glbModel") {
                this.loaders.gltfLoader.load(asset.path, (file) => {
                    this.singleAssetLoaded(asset, file);
                });
            } else if (asset.type === "texture") {
                this.loaders.textureLoader.load(asset.path, (file) => {
                    this.singleAssetLoaded(asset, file);
                });
            } else if (asset.type === "videoTexture") {
                // ... (rest of the videoTexture loading code)
                this.singleAssetLoaded(asset, this.videoTexture[asset.name]);
            }
        }
    }

    singleAssetLoaded(asset, file) {
        this.items[asset.name] = file;
        this.loaded++;
    }
}