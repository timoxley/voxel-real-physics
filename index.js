"use strict"

var CANNON = require('cannon')
var memoize = require('memoizer')

module.exports = function(game) {
  var physics = new Physics(game.THREE, {
    gravity: new CANNON.Vec3(game.gravity[0], game.gravity[1], game.gravity[2])
  })

  game.on('tick', function(dt) {
    dt = dt > 300 ? 300 : dt
    physics.tick(dt/200)
    if (!physics.done) findCollisions(game, physics)
  })
  physics.game = game

  return physics
}

function around(pos) {
  var positions = []
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      for (var k = -1; k < 2; k++) {
        positions.push([pos[0] + i, pos[1] + j, pos[2] + k])
      }
    }
  }
  return positions
}

function findCollisions(game, physics) {
  for (var i = 0; i < physics.items.length; i++) {
    var item = physics.items[i]
    var posArr = item.mesh.position
    var pos = [posArr.x, posArr.y, posArr.z]
    var v = item.body.velocity
    item.body.calculateAABB()
    var margin = 0.5
    for (var x = item.body.aabbmin.x - margin; x < item.body.aabbmax.x + margin; x += 1) {
      for (var y = item.body.aabbmin.y - margin; y < item.body.aabbmax.y + margin; y += 1) {
        for (var z = item.body.aabbmin.z - margin; z < item.body.aabbmax.z + margin; z += 1) {
          if (game.getBlock(x, y, z)) {
            var bp = game.blockPosition(x, y, z)
            physics.addCollider(bp)
          }
        }
      }
    }
  }
}

function Physics(THREE, opts) {
  opts = opts || {}
  this.THREE = THREE
  this.CANNON = CANNON
  this.world = createWorld(opts)
  var self = this
  this.items = []
  this.colliders = []
}

function createWorld(opts) {
  opts = opts || {}
  var world = new CANNON.World();
  if (opts.gravity) world.gravity = opts.gravity
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver = new CANNON.GSSolver();
  world.solver.iterations = 4;

  world.quatNormalizeFast = true;
  world.quatNormalizeSkip = 4;

  world.defaultContactMaterial.contactEquationStiffness = 5e6;
  world.defaultContactMaterial.contactEquationRegularizationTime = 10;
  world.allowSleep = false;
  return world
}

Physics.prototype.addCollider = function addCollider(position) {
  position[0] += 0.5
  position[1] += 0.5
  position[2] += 0.5
  var colliders = this.colliders
  var alreadyCollider = addCollider.alreadyCollider = addCollider.alreadyCollider || function alreadyCollider(x, y, z) {
      for (var i = 0; i < colliders.length; i++) {
        var c = colliders[i]
        if (c.position.almostEquals(new CANNON.Vec3(x, y, z))) {
          return true
        }
      }
      return false
  }

  if (alreadyCollider(position[0], position[1], position[2])) {
    return
  }

  var boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
  var collider = new CANNON.RigidBody(0, boxShape);
  collider.position.set(position[0], position[1], position[2])

  var mesh = new this.game.THREE.Mesh(
    new this.game.THREE.CubeGeometry(1,1,1),
    new this.game.THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
  )
  mesh.position.set(position[0], position[1], position[2])
  this.game.scene.add(mesh)

  this.colliders.push(collider)
  this.world.add(collider)
}

Physics.prototype.add = function add(mesh, body) {
  this.items.push({
    mesh: mesh,
    body: body
  })
  this.world.add(body)
}

Physics.prototype.tick = function tick(dt) {
  this.world.step(dt);
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i]
    update(item.mesh, item.body)
  }
}

function update(mesh, body) {
  body.position.copy(mesh.position);
  body.quaternion.copy(mesh.quaternion);
}
