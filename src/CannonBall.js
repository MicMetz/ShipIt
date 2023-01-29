import {Box3, Mesh, MeshBasicMaterial, SphereGeometry} from "three";
import {GLTFLoader}                                    from "three/examples/jsm/loaders/GLTFLoader";



class CannonBall {
   /**
    * @description CannonBall constructor
    * @param {Vector3} direction - The direction the cannonball is heading
    */
   constructor(direction) {

      this.direction = direction.clone();
      this.direction.y -= 0.005;
      this.speed     = 1;
      this.damage    = 10;

   }


   /**
    * @description Load the cannonball's model
    * @param posX
    * @param posY
    * @param posZ
    * @param scale
    * @param scene
    * @returns {Promise<void>}
    */
   async loadModel(posX, posY, posZ, scale, scene) {

      const geometry = new SphereGeometry(1, 32, 16);
      const material = new MeshBasicMaterial({color: 0x111111});
      const sphere   = new Mesh(geometry, material);

      sphere.position.set(posX, 4, posZ);

      scene.add(sphere);
      this.object = sphere;

      this.box = new Box3();
      this.box.setFromObject(this.object);

   }


   /**
    * @description Update the cannonball's position
    */
   update() {

      this.object.position.addScaledVector(this.direction, this.speed);
      this.box.setFromObject(this.object);

   }
}



export {CannonBall};
