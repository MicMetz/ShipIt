import {Box3, BoxHelper} from "three";
import {GLTFLoader}      from "three/examples/jsm/loaders/GLTFLoader.js";



class Pirate {
   /**
    * @description Pirate constructor.
    * @param {number} time - The current game time.
    */
   constructor(time) {

      this.speed     = 0.34;
      this.damage    = 10;
      this.lastFired = time;
      this.fireRate  = 1000;
   }


   /**
    * Load the pirate's model
    * @param posX
    * @param posY
    * @param posZ
    * @param scale
    * @param scene
    * @returns {Promise<void>}
    */
   async loadModel(posX, posY, posZ, scale, scene) {
      const source = "../models/pirate/scene.gltf"
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
        }
      );
   }


   /**
    * Update the pirate's position and rotation
    * @param {Vector3} target - The target position
    */
   update(target) {

      let dir = target.clone().sub(this.object.position)
      this.object.position.addScaledVector(dir.normalize(), this.speed)

      let lookAt = this.object.position.clone().sub(dir)
      this.object.lookAt(lookAt.x, lookAt.y, lookAt.z)
      this.box.setFromObject(this.object)

   }

}



export {Pirate};
