import {Box3, BoxHelper, Vector3} from "three";
import {GLTFLoader}               from "three/examples/jsm/loaders/GLTFLoader.js";



class Player {
   /**
    * @description Player constructor.
    */
   constructor() {

      this.direction = new Vector3(0, 0, -1);
      this.speed     = 0.5;
      this.acc       = 0.05;
      this.turn      = 0.05;

   }


   /**
    * @description Load the model
    * @param scale
    * @param scene
    * @returns {Promise<void>}
    */
   async loadModel(scale, scene) {

      const source = "../models/ship/scene.gltf";
      const loader = new GLTFLoader();

      await loader.load(source, (gltf) => {

         gltf.scene.updateMatrixWorld(true);
         const object = gltf.scene;
         object.position.set(10, 0, 10);
         object.scale.multiplyScalar(scale);

         scene.add(object);
         this.object = object;

         this.box = new Box3();
         this.box.setFromObject(this.object);

         this.helper = new BoxHelper(this.object);

      });

   }


   /**
    * @description Update the player's position
    * @param camera
    */
   update(camera) {

      this.object.position.addScaledVector(this.direction, this.speed);
      camera.position.addScaledVector(this.direction, this.speed);
      this.box.setFromObject(this.object);

   }
}



export {Player};
