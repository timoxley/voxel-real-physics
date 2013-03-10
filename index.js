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
  })

  physics.game = game
  physics.createPhysicsEntities(game.camera.position)
  return physics
}

var merge = require('./merge')

Physics.prototype.createPhysicsEntities = function createPhysicsEntities(position) {
  var self = this
  var game = this.game
  var chunk = game.getChunkAtPosition([position.x, position.y, position.z])
  var startPos =  {
    x: chunk.position[0] - chunk.dims[0] * 2,
    y: chunk.position[1] - chunk.dims[1] * 2,
    z: chunk.position[2] - chunk.dims[2] * 2
  }

  var endPos = {
    x: chunk.position[0] + chunk.dims[0] * 2,
    y: chunk.position[1] + chunk.dims[1] * 2,
    z: chunk.position[2] + chunk.dims[2] * 2
  }

  merge.all(function(x, y, z) {
    return game.getBlock([x, y, z]) === 3
  }, startPos, endPos, function(result) {
    merge.voxelsIn(result).forEach(function(pos) {
      game.setBlock([pos.x, pos.y, pos.z], 1)
    })

    var boxShape = new CANNON.Box(new CANNON.Vec3(result.width / 2, result.height / 2, result.depth / 2))
    var box = new CANNON.RigidBody(0, boxShape)
    box.position.set(result.x, result.y, result.z)
    self.world.add(box);

    var mesh = new game.THREE.Mesh(
      new game.THREE.CubeGeometry(result.width,result.height,result.depth),
      new game.THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
    )
    mesh.position.set(result.x, result.y, result.z)
    game.scene.add(mesh)

  })
}

function Physics(THREE, opts) {
  opts = opts || {}
  this.THREE = THREE
  this.CANNON = CANNON
  this.world = createWorld(opts)
  var self = this
  this.items = []
  this.physical = {}
}

function createWorld(opts) {
  opts = opts || {}
  var world = new CANNON.World();
  if (opts.gravity) world.gravity = opts.gravity
  world.broadphase = new CANNON.NaiveBroadphase();
  var solver = new CANNON.GSSolver();
  solver.iterations = 7;
  world.defaultContactMaterial.contactEquationRegularizationTime = 0.55;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);

  world.quatNormalizeFast = true;
  world.quatNormalizeSkip = 0;

  world.defaultContactMaterial.friction = 0.7
  world.defaultContactMaterial.restitution = 0.0
  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRegularizationTime = 4;
  world.broadphase.useBoundingBoxes = true;
  world.allowSleep = false;
  return world
}

Physics.prototype.addCollider = function addCollider(x,y,z) {
  x += 0.5
  y += 0.5
  z += 0.5
  if (colliders.x === x
       && colliders.y === y
       && colliders.z === y) return

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



