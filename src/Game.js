import {Player}         from "./Player.js";
import {Pirate}         from "./Pirate.js";
import {Treasure}       from "./Treasure.js";
import {CannonBall}     from "./CannonBall.js";
import {randFloat}      from "three/src/math/MathUtils.js";
import {Clock, Vector3} from "three";



class Game {
   /**
    * @description Main game controller.
    */
   constructor() {

      this.player       = new Player();
      this.score        = 0;
      this.health       = 100;
      this.pirates      = [];
      this.treasures    = [];
      this.cannonBalls  = [];
      this.gameOver     = false;
      this.turn         = 0;
      this.acc          = 0;
      this.fireAtPlayer = 0;
      this.clock        = new Clock();

   }


   /**
    * @description Load the models
    * @param scene {Scene}
    * @returns {Promise<void>}
    */
   async loadModels(scene) {

      await this.player.loadModel(0.1, scene);
      await this.SpawnTreasures(20, new Vector3(0, 0, 0), scene);
      await this.SpawnPirates(5, new Vector3(0, 0, 0), scene);

   }


   /**
    * @description Spawn treasures
    * @param num {number}
    * @param playerPos {Vector3}
    * @param scene {Scene}
    * @returns {Promise<void>}
    */
   async SpawnTreasures(num, playerPos, scene) {

      while (num > 0) {

         let treasure = new Treasure();

         const dist  = randFloat(100, 1000);
         const angle = randFloat(0, 6.24);

         await treasure.loadModel(playerPos.x + (Math.sin(angle) * dist), 0, playerPos.z + (Math.cos(angle) * dist), 0.06, scene);
         this.treasures.push(treasure);

         num -= 1;

      }
   }


   /**
    * @description Spawn pirate ships
    * @param num {number}
    * @param playerPos  {Vector3}
    * @param scene {Scene}
    * @returns {Promise<void>}
    */
   async SpawnPirates(num, playerPos, scene) {

      while (num > 0) {

         let pirate  = new Pirate(Math.ceil(this.clock.getElapsedTime()));
         const dist  = randFloat(500, 1000);
         const angle = randFloat(0, 6.24);

         await pirate.loadModel(playerPos.x + (Math.sin(angle) * dist), -1, playerPos.z + (Math.cos(angle) * dist), 6, scene);
         this.pirates.push(pirate);

         num -= 1;

      }
   }


   /**
    * @description Player fire action
    * @param scene
    * @returns {Promise<void>}
    */
   async PlayerFire(scene) {
      console.log("Fire");

      const cannonBall = new CannonBall(this.player.direction);
      let start        = this.player.object.position.clone();

      start.addScaledVector(this.player.direction, 30);
      await cannonBall.loadModel(start.x, start.y, start.z, 1, scene);

      if (this.player.speed < 0.5) {
         cannonBall.speed = 1.5;
      } else {
         cannonBall.speed = 3 * this.player.speed;
      }

      this.cannonBalls.push(cannonBall);

   }


   /**
    * @description Pirates fire action
    * @param scene {Scene}
    * @returns {Promise<void>}
    */
   async PiratesFire(scene) {

      const time = Math.ceil(this.clock.getElapsedTime());

      for (let pirate of this.pirates) {
         if (time < pirate.lastFired + 5) {
            continue;
         }

         let dir = this.player.object.position.clone();
         dir.sub(pirate.object.position).normalize();

         const cannonBall = new CannonBall(dir);
         let start        = pirate.object.position.clone();

         start.addScaledVector(dir, 50)
         await cannonBall.loadModel(start.x, start.y, start.z, 1, scene);

         if (this.player.speed < 0.5) {
            cannonBall.speed = 1
         } else {
            cannonBall.speed = 2 * this.player.speed
         }

         this.cannonBalls.push(cannonBall);
         pirate.lastFired = time;

      }
   }


   /**
    * @description Update the game
    * @param camera {PerspectiveCamera}
    * @param scene {Scene}
    */
   update(camera, scene) {

      const time = performance.now() * 0.001;
      this.PiratesFire(scene);

      if (this.player.object) {

         this.player.update(camera);
         this.player.object.position.y = Math.sin(time * 1.5) * 0.7 + 0.5;
         this.player.object.rotation.z = Math.cos(time * 2) * 0.05;

      } else {

         return;

      }

      this.treasures.forEach((treasure) => {

         if (treasure.object) {
            treasure.object.position.y = Math.sin(time) * 0.4 + 0.2;
            treasure.object.rotation.x = Math.cos(time) * 0.1;
            treasure.object.rotation.z = Math.sin(time) * 0.1;
         }

      })

      this.pirates.forEach((pirate) => {

         if (pirate.object) {
            pirate.update(this.player.object.position)
            pirate.object.position.y = Math.cos(time) * 0.7 - 2;
         }

      })

      this.cannonBalls.forEach((cannonBall) => {

         if (cannonBall.object) {
            cannonBall.update();
         }

      })

      this.HandleCollisions(scene);

      if (this.pirates.length < 5) {
         this.SpawnPirates(2, this.player.object.position, scene);
      }

      if (this.treasures.length < 5) {
         this.SpawnTreasures(5, this.player.object.position, scene);
      }

   }


   /**
    * @description Handle ship collisions
    * @param scene {Scene}
    * @constructor
    */
   HandleCollisions(scene) {

      let treasuresRemaining = [];

      this.treasures.forEach((treasure) => {

         if (treasure.object && treasure.box.intersectsBox(this.player.box)) {
            scene.remove(treasure.object);
            this.score += treasure.points;

            console.log("collectTreasure, score -> ", this.score);

         } else {
            treasuresRemaining.push(treasure);
         }

      })

      this.treasures           = treasuresRemaining;
      let cannonBallsRemaining = [];

      this.cannonBalls.forEach((cannonBall) => {

         if (cannonBall.object && cannonBall.box.intersectsBox(this.player.box)) {
            scene.remove(cannonBall.object);
            this.health -= cannonBall.damage;

            console.log("removed");

         } else {
            cannonBallsRemaining.push(cannonBall);
         }

      })

      this.cannonBalls = [];

      cannonBallsRemaining.forEach((cannonBall) => {

         let remove           = false;
         let piratesRemaining = [];

         this.pirates.forEach((pirate) => {
            if (pirate.object && pirate.box.intersectsBox(cannonBall.box)) {
               scene.remove(pirate.object);
               remove = true;

               console.log("removed");

            } else {
               piratesRemaining.push(pirate);
            }

         })

         this.pirates = piratesRemaining;

         if (remove) {
            scene.remove(cannonBall);
         } else {
            this.cannonBalls.push(cannonBall);
         }

      })

      let piratesRemaining = this.pirates;
      this.pirates         = [];

      piratesRemaining.forEach((pirate) => {
         if (pirate.object && pirate.box.intersectsBox(this.player.box)) {
            scene.remove(pirate.object);
            this.health = 0;
            console.log("collide");

         } else {
            this.pirates.push(pirate);
         }

      })

      if (this.health <= 0) {
         console.log("GAME OVER");
         this.gameOver = true;
         scene.remove(this.player.object);
      }

   }


}



export {Game};
