import {GUI}                                                                                                                                                                              from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {Water}                                                                                                                                                                            from 'three/examples/jsm/objects/Water.js';
import {Sky}                                                                                                                                                                              from 'three/examples/jsm/objects/Sky.js';
import {Game}                                                                                                                                                                             from "./src/Game";
import {ACESFilmicToneMapping, AmbientLight, DirectionalLight, MathUtils, PerspectiveCamera, PlaneGeometry, PMREMGenerator, RepeatWrapping, Scene, TextureLoader, Vector3, WebGLRenderer} from "three";



let container;
let camera, scene, renderer;
let controls, water, sun;
let game;

let offset1          = new Vector3(-20, 100, 50);
let cameraDirection1 = new Vector3(40, -50, -80);
let offset2          = new Vector3(0, 100, 0);
let cameraDirection2 = new Vector3(0, -1, 0);
let cameraMode       = 1;

let offset = offset1.clone(), cameraDirection = cameraDirection1.clone()

init();
animate();


async function init() {
   container = document.getElementById('container');

   //

   renderer = new WebGLRenderer();
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.toneMapping = ACESFilmicToneMapping;
   document.body.appendChild(renderer.domElement);

   //

   scene = new Scene();

   camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 20000);
   camera.position.copy(offset)
   const targ = camera.position.clone().add(cameraDirection)
   camera.lookAt(targ.x, targ.y, targ.z)
   scene.add(camera)

   // sun
   sun = new Vector3();

   // Water
   const waterGeometry = new PlaneGeometry(10000, 10000);

   water = new Water(
     waterGeometry,
     {
        textureWidth   : 512,
        textureHeight  : 512,
        waterNormals   : new TextureLoader().load('textures/waternormals.jpg', function (texture) {

           texture.wrapS = texture.wrapT = RepeatWrapping;

        }),
        sunDirection   : new Vector3(),
        sunColor       : 0xffffff,
        waterColor     : 0x001e0f,
        distortionScale: 3.7,
        fog            : scene.fog !== undefined
     }
   );

   water.rotation.x = -Math.PI / 2;

   scene.add(water);

   // Skybox

   const sky = new Sky();
   sky.scale.setScalar(10000);
   scene.add(sky);

   const skyUniforms = sky.material.uniforms;

   skyUniforms['turbidity'].value       = 10;
   skyUniforms['rayleigh'].value        = 2;
   skyUniforms['mieCoefficient'].value  = 0.005;
   skyUniforms['mieDirectionalG'].value = 0.8;

   const parameters = {
      elevation: 2,
      azimuth  : 180
   };

   const pmremGenerator = new PMREMGenerator(renderer);


   function updateSun() {
      const phi   = MathUtils.degToRad(90 - parameters.elevation);
      const theta = MathUtils.degToRad(parameters.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;
   }


   updateSun();

   // GUI

   // const gui = new GUI();
   //
   // const folderSky = gui.addFolder( 'Sky' );
   // folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
   // folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
   // folderSky.open();
   //
   // const waterUniforms = water.material.uniforms;
   //
   // const folderWater = gui.addFolder( 'Water' );
   // folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
   // folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
   // folderWater.open();

   //

   game = new Game()
   await game.loadModels(scene)

   const ambientLight = new AmbientLight(0xffffff, 0.5); // soft white light
   scene.add(ambientLight);
   let directionalLight = new DirectionalLight(0x555555, 2);
   directionalLight.position.set(1, 1, 1);
   scene.add(directionalLight);

   window.addEventListener('resize', onWindowResize);
   document.body.addEventListener('keydown', onKeyDown, false);
   document.body.addEventListener('keyup', onKeyUp, false);
}


function animate() {
   requestAnimationFrame(animate);
   render();
}


function onKeyUp(e) {
   const keyCode = e.which;
   if (keyCode === 87) { // w
      game.acc = 0
   }
   if (keyCode === 83) { // s
      game.acc = 0
   }
   if (keyCode === 65) { // a
      game.turn = 0
   }
   if (keyCode === 68) { // d
      game.turn = 0
   }
   if (keyCode === 86) { // v
      cameraMode ^= 3;
      console.log(cameraMode)
      if (cameraMode === 1) {
         cameraDirection = cameraDirection1.clone()
         offset          = offset1.clone()
      }
      if (cameraMode === 2) {
         cameraDirection = cameraDirection2.clone()
         offset          = offset2.clone()
      }

      let axis = new Vector3(0, 1, 0)
      offset.applyAxisAngle(axis, game.player.object.rotation.y)
      cameraDirection.applyAxisAngle(axis, game.player.object.rotation.y)
   }
   if (keyCode === 32) { // space
      game.PlayerFire(scene)
   }
}


function onKeyDown(e) {
   const keyCode = e.which;
   if (keyCode === 87) { // w
      game.acc = 1
   }
   if (keyCode === 83) { // s
      game.acc = -1
   }
   if (keyCode === 65) { // a
      game.turn = 1
   }
   if (keyCode === 68) { // d
      game.turn = -1
   }
}


function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize(window.innerWidth, window.innerHeight);
}


function render() {
   if (game.gameOver) {
      renderer.setAnimationLoop(null)
      document.getElementById("gameover").innerHTML = "GAME OVER"
      return
   }

   water.material.uniforms['time'].value += 1.0 / 60.0;

   game.player.speed += game.acc * game.player.acc
   if (game.player.speed < 0) {
      game.player.speed = 0
   }
   if (game.player.speed > 4) {
      game.player.speed = 4
   }

   let axis = new Vector3(0, 1, 0)

   const turn = game.turn * game.player.turn * game.player.speed
   if (turn) {
      game.player.object.rotation.y += turn
      game.player.direction.applyAxisAngle(axis, turn)

      offset.applyAxisAngle(axis, turn)
      cameraDirection.applyAxisAngle(axis, turn)
   }

   if (game.player.object) {
      const dir = game.player.object.position.clone().add(offset)
      camera.position.set(dir.x, dir.y, dir.z)
   }
   let targ = camera.position.clone().add(cameraDirection)
   camera.lookAt(targ.x, targ.y, targ.z)

   game.update(camera, scene)

   document.getElementById("score").innerHTML  = "Score = " + game.score
   document.getElementById("health").innerHTML = "Health: " + game.health
   document.getElementById("time").innerHTML   = "Time: " + Math.ceil(game.clock.getElapsedTime())

   if (game.player.object) {
      water.position.set(game.player.object.position.x, game.player.object.position.y, game.player.object.position.z)
   }

   renderer.render(scene, camera);
}
