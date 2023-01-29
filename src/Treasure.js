import {Box3, BoxHelper} from "three";
import {GLTFLoader}      from "three/examples/jsm/loaders/GLTFLoader.js";



class Treasure {
   /**
    * @description Treasure constructor
    */
   constructor() {

      this.points    = 10
      this.destroyed = false

   }


   /**
    * @description Load the model
    * @param posX
    * @param posY
    * @param posZ
    * @param scale
    * @param scene
    * @returns {Promise<void>}
    */
   async loadModel(posX, posY, posZ, scale, scene) {

      const source = "../models/treasure/scene.gltf";
      const loader = new GLTFLoader();

      await loader.load(source, (gltf) => {

         const object = gltf.scene;
         object.position.set(posX, posY, posZ);
         object.scale.multiplyScalar(scale);
         scene.add(object);
         this.object = object;

         this.box = new Box3();
         this.box.setFromObject(this.object);

         this.helper = new BoxHelper(this.object);
      });

   }


   /**
    * @description Update the treasure's position
    */
   update() {

      this.box.setFromObject(this.object);

   }

}



export {Treasure};
