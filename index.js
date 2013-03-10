"use strict"

var CANNON = require('cannon')
var memoize = require('memoizer')
//var AMMO = require('./ammo')

module.exports = function(game) {
  var physics = new Physics(game.THREE, {
    gravity: new CANNON.Vec3(game.gravity[0], game.gravity[1], game.gravity[2])
  })

  game.on('tick', function(dt) {
    dt = dt > 300 ? 300 : dt
    physics.tick(dt/200)

    //if (!physics.done) findCollisions(game, physics)
  })
  physics.game = game
  //physics.AMMO = AMMO
  physics.createPhysicsEntities(game.camera.position)
  return physics
}

//function findSolid(chunk) {
  //for (var x = 0; x < chunk.dims.x; x++) {
    //for (var y = 0; y < chunk.dims.y; y++) {
      //for (var z = 0; z < chunk.dims.z; z++) {

      //}
    //}
  //}
  //return false
//}

//function findBoxDimensions(game, startPos, endPos) {
  //var box = {
    //x: startPos.x,
    //y: startPos.y,
    //z: startPos.z,
    //width: 1,
    //height: 1,
    //depth: 1
  //}
  //for (var x = startPos.x; x < endPos.x; x++) {
    //if (game.getBlock(x, startPos.y, startPos.z) !== 1) {
      //box.width = x - startPos.x
      //break
    //}
    ////for (var y = startPos.y; y < endPos.y; y++) {
      ////for (var z = startPos.z; z < endPos.z; z++) {
          ////box.height = y - startPos.y
          ////box.depth = z - startPos.z
          ////box.x = startPos.x + box.width / 2
          ////box.y = startPos.y + box.height / 2
          ////box.z = startPos.z + box.depth / 2

          ////game.setBlock([x, y, z], 2)
        ////} else {
          ////return box
        ////}
      ////}
    ////}
  //}
//}

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

  //var boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
  //debugger
  merge.all(function(x, y, z) {
    return game.getBlock([x, y, z]) === 1
  }, startPos, endPos, function(result) {
    merge.voxelsIn(result).forEach(function(pos) {
      game.setBlock([pos.x, pos.y, pos.z], 2)
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
  //var game = this.game
  //var world = this.game
  //var boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
  //var chunk = game.getChunkAtPosition(position)
  //var foundSolid = findSolid(chunk)
  //if (foundSolid) {
  //var endPos = {
  //x: foundSolid.x - chunk.position[0] - chunk.dims[0]
  //y: foundSolid.y - chunk.position[1] - chunk.dims[1]
  //z: foundSolid.z - chunk.position[2] - chunk.dims[2]
  //}
  //var boxInfo = findBoxDimensions(game, foundSolid, endPos)
  //var box = new CANNON.RigidBody(0, boxShape);
  //box.position.set(boxInfo.x, boxInfo.y, boxInfo.z)
  //this.world.add(box)

  //var mesh = new this.game.THREE.Mesh(
  //new this.game.THREE.CubeGeometry(1,1,1),
  //new this.game.THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
  //)
  //mesh.position.set()
  //this.game.scene.add(mesh)


}

//Physics.prototype.isPhysical(x,y,z) {
  //return physical[[x,y,z].join(',')]
//}

//Physics.prototype.setPhysical(x,y,z) {
  //return physical[[x,y,z].join(',')] = true
//}


//function around(pos) {
  //var positions = []
  //for (var i = -1; i < 2; i++) {
    //for (var j = -1; j < 2; j++) {
      //for (var k = -1; k < 2; k++) {
        //positions.push([pos[0] + i, pos[1] + j, pos[2] + k])
      //}
    //}
  //}
  //return positions
//}

function findCollisions(game, physics) {
  //for (var i = 0; i < physics.items.length; i++) {
    //var item = physics.items[i]
    //var posArr = item.mesh.position
    //var pos = [posArr.x, posArr.y, posArr.z]
    //var v = item.body.velocity
    //item.body.calculateAABB()
    //var margin = 0.5
    //for (var x = item.body.aabbmin.x - margin; x < item.body.aabbmax.x + margin; x += 1) {
      //for (var y = item.body.aabbmin.y - margin; y < item.body.aabbmax.y + margin; y += 1) {
        //for (var z = item.body.aabbmin.z - margin; z < item.body.aabbmax.z + margin; z += 1) {
          //if (game.getBlock(x, y, z)) {
            //var bp = game.blockPosition(x, y, z)
            //physics.addCollider(bp[0], bp[1], bp[2])
          //}
        //}
      //}
    //}
  //}
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
  //world.solver = new CANNON.GSSolver();
  //world.solver.iterations = 4;
  var solver = new CANNON.GSSolver();
  solver.iterations = 5;
  //world.defaultContactMaterial.contactEquationStiffness = 1e7;
  world.defaultContactMaterial.contactEquationRegularizationTime = 0.55;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);

  world.quatNormalizeFast = true;
  world.quatNormalizeSkip = 0;

  world.defaultContactMaterial.friction = 0.7
  world.defaultContactMaterial.restitution = 0.0
  world.defaultContactMaterial.contactEquationStiffness = 1e7;
  world.defaultContactMaterial.contactEquationRegularizationTime = 0.5;
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



