'use strict'

var Game = require('voxel-engine')
var textures = require('painterly-textures')

var Physics = require('../../')
var control = require('../../control')(Game)

var game = new Game({
  generate: function(x, y, z) {
    x = x + 16/2
    z = z + 16/2
    if (x < 0 || x >= 16 || z >= 16 || z < 0) return 0
    if (y === -1) return 1
    return 0
  },
  texturePath: '../../node_modules/painterly-textures/textures/',
  chunkSize: 16,
  chunkDistance: 0,
  asyncChunkGeneration: true
})

game.gravity = [0, -0.98, 0]
var physi = window.physi = Physics(game)
var obj = game.makePhysical(new game.THREE.Mesh(new game.THREE.SphereGeometry(1), game.materials.get('brick')[0]), {type: 'sphere'})
obj.body.position.set(0, 5, 0)

game.scene.add(obj.mesh)
game.control(obj.body)
var groundShape = new physi.CANNON.Plane()
var groundBody = new physi.CANNON.RigidBody(0, groundShape);
groundBody.quaternion.setFromAxisAngle(new physi.CANNON.Vec3(-1,0,0),Math.PI/2);
groundBody.position.set(0,-5,0);

physi.world.add(groundBody);

window.launch = launch
document.body.onmousedown = launch
launch.type = 2

document.addEventListener('keydown', function(e) {
  if (e.keyCode == 49) { // 1
    launch.type = 1
    console.log('cannon')
  }
  if (e.keyCode == 50) { // 2
    launch.type = 2
    console.log('shovel')
  }
})

function createBox() {
  var material = game.materials.load('plank')
  material.forEach(function(m, i) {
    if (i == 2 || i == 3) return
      m.map.repeat.set(1, 5)
  })
  var mesh = new game.THREE.Mesh(
    new game.THREE.CubeGeometry(1, 1, 1),
    new game.THREE.MeshFaceMaterial(material)
  )
  mesh.useQuaternion = true;
  return mesh
}

function launch() {
  if (launch.type == 2) {
    var ray = game.raycast()
    if (!ray) return
      game.setBlock(ray.position, 0)
    return
  }
  var CANNON = physi.CANNON

  var boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  var b1 = new CANNON.RigidBody(1000, boxShape);

  var position = game.camera.position.clone()
  b1.position.set(position.x, position.y - 1, position.z);
  var direction = game.cameraVector()
  b1.velocity.set(direction[0] * 5, direction[1] * 5, direction[2] * 5)
  b1.angularVelocity.set(Math.random(),
                         Math.random(),
                         Math.random())
   b1.linearDamping=0.1;
   b1.angularDamping=0.1;

   var mesh = createBox()
   mesh.position = position.clone()
   game.scene.add(mesh);

   mesh.position = position.clone()
   game.scene.add(mesh);

   physi.add(mesh, b1)
}
window.meshes = []

setTimeout(function() {
  game.paused = false
}, 1000)

//game.camera.position.set(5, 10, 5)
game.appendTo(document.body)
window.game = game
