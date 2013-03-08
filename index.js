"use strict"

var CANNON = require('cannon')
var memoize = require('memoizer')

module.exports = function(game) {
  var physics = new Physics(game.THREE, {
    gravity: new CANNON.Vec3(game.gravity[0], game.gravity[1], game.gravity[2])
  })

  game.on('tick', function(dt) {
    physics.tick(dt/200)
    findCollisions(game, physics)
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
  //var blockCache = {}
  //physics
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

  //world.solver.tolerance = 0.0001;
  //world.defaultContactMaterial.contactEquationStiffness = 1e6;
  //world.defaultContactMaterial.contactEquationRegularizationTime = 10;
  world.defaultContactMaterial.contactEquationStiffness = 5e6;
  world.defaultContactMaterial.contactEquationRegularizationTime = 10;
  world.allowSleep = false;
  return world
}

Physics.prototype.addCollider = function addCollider(position) {
  //debugger
  //addCollider.count = addCollider.count + 1 || 0
  position[0] += 0.5
  position[1] += 0.5
  position[2] += 0.5
  var colliders = this.colliders
  var alreadyCollider = addCollider.alreadyCollider = addCollider.alreadyCollider || function alreadyCollider(x, y, z) {
      if (colliders.length > 150) {
        //debugger
      }
      for (var i = 0; i < colliders.length; i++) {
        var c = colliders[i]
        if (c.position.almostEquals(new CANNON.Vec3(x, y, z))) {
          //debugger
          return true
        }
      }
      return false
  }

  if (alreadyCollider(position[0], position[1], position[2])) {
    //debugger
    return
  }

  var boxShape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
  var collider = new CANNON.RigidBody(0, boxShape);
  collider.position.set(position[0], position[1], position[2])

  //var mesh = new this.game.THREE.Mesh(
    //new this.game.THREE.CubeGeometry(1,1,1),
    //new this.game.THREE.MeshBasicMaterial( { color: 0xff0000 })//, wireframe: true } )
  //)
  //mesh.scale.set(1.01, 1.01, 1.01)
  //mesh.position.set(position[0], position[1], position[2])
  //this.game.scene.add(mesh)

  //this.add(mesh, collider)
  this.colliders.push(collider)
  this.world.add(collider)
  //console.log('colliders', this.colliders.length)
}

Physics.prototype.add = function add(mesh, body) {
  this.items.push({
    mesh: mesh,
    body: body
  })
  this.world.add(body)
}

Physics.prototype.tick = function tick(dt) {
  //debugger
  this.world.step(dt);
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i]
    update(item.mesh, item.body)
  }
}

function update(mesh, body) {
  //debugger
  body.position.copy(mesh.position);
  body.quaternion.copy(mesh.quaternion);
  //console.log(body.quaternion)
}

Physics.prototype.shape2mesh = function shape2mesh(shape, material){
  var THREE = this.game.THREE
  var wireframe = false //= settings.renderMode=="wireframe";
  var mesh;
  switch (shape.type) {
    case CANNON.Shape.types.SPHERE:
      var sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
      mesh = new THREE.Mesh( sphere_geometry, material );
      break;

    case CANNON.Shape.types.PLANE:
      var geometry = new THREE.PlaneGeometry( 10, 10 , 4 , 4 );
      mesh = new THREE.Object3D();
      var submesh = new THREE.Object3D();
      var ground = new THREE.Mesh( geometry, material );
      ground.scale = new THREE.Vector3(100,100,100);
      submesh.add(ground);

      ground.castShadow = true;
      ground.receiveShadow = true;

      mesh.add(submesh);
      break;

    case CANNON.Shape.types.BOX:
      var box_geometry = new THREE.CubeGeometry(shape.halfExtents.x*2, shape.halfExtents.y*2, shape.halfExtents.z*2);
      mesh = new THREE.Mesh( box_geometry, material );
      break;

    case CANNON.Shape.types.CONVEXPOLYHEDRON:
      var verts = [];

      for (var i = 0; i < shape.vertices.length; i++){
        verts.push(new THREE.Vector3(shape.vertices[i].x, shape.vertices[i].y, shape.vertices[i].z));
      }

      var geo = new THREE.ConvexGeometry(verts);
      mesh = new THREE.Mesh( geo, material );
      break;

    case CANNON.Shape.types.COMPOUND:
      // recursive compounds
      var o3d = new THREE.Object3D();
      for (var i = 0; i < shape.childShapes.length; i++){
        // Get child information
        var subshape = shape.childShapes[i];
        var o = shape.childOffsets[i];
        var q = shape.childOrientations[i];

        var submesh = shape2mesh(subshape);
        submesh.position.set(o.x,o.y,o.z);
        submesh.quaternion.set(q.x,q.y,q.z,q.w);

        submesh.useQuaternion = true;
        o3d.add(submesh);
        mesh = o3d;
      }
      break;

    default:
      throw "Visual type not recognized: "+shape.type;
  }

  //mesh.receiveShadow = true;
  //mesh.castShadow = true;

  //if(mesh.children){
    //for(var i=0; i<mesh.children.length; i++){
      //mesh.children[i].castShadow = true;
      //mesh.children[i].receiveShadow = true;
      //if(mesh.children[i]){
        //for(var j=0; j<mesh.children[i].length; j++){
          //mesh.children[i].children[j].castShadow = true;
          //mesh.children[i].children[j].receiveShadow = true;
        //}
      //}
    //}
  //}
  mesh.useQuaternion = true
  return mesh;
}
