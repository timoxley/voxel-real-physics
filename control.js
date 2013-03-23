"use strict"

var Stream = require('stream').Stream

var X = 0
var Y = 1
var Z = 2

var WIDTH = 0
var HEIGHT = 1
var DEPTH = 2

module.exports = function(Game) {
  //Game.prototype.initializeControls = initializeControls
  Game.prototype.hookupControls = hookupControls
  Game.prototype.makePhysical = makePhysical
  Game.prototype.control = control
}

function control(target, options) {
  options = options || {}
  this.controlling = target
  options.game = this
  return this.controls.target(target, options)
}

function makePhysical(mesh, options) {
  options = options || {}
  var CANNON = this.physics.CANNON
  var dimensions = [1,1,1]
  mesh.useQuaternion = true
  if (mesh.geometry) {
    if (options.type == 'sphere') {
      mesh.geometry.computeBoundingSphere()
      dimensions = mesh.geometry.boundingSphere
    } else {
      mesh.geometry.computeBoundingBox()
      dimensions = mesh.geometry.boundingBox.size().toArray()
    }
  }
  var shape
  if (options.type == 'sphere') {
    shape = new CANNON.Sphere(dimensions.radius || 0.5)
  } else {
    shape = new CANNON.Box(new CANNON.Vec3(dimensions[WIDTH] / 2, dimensions[HEIGHT] / 2, dimensions[DEPTH] / 2))
  }
  if (typeof options.mass === 'undefined') options.mass = 1

  var body = new CANNON.RigidBody(1000, shape)
  body.linearDamping = 0.8;
  body.angularDamping = 0.8;
  mesh.position.copy(body.position)
  return this.physics.add(mesh, body)
}

function hookupControls(buttons, options) {
  options = options || {}
  options.controls = options.controls || {}
  options.controls.onfire = this.onFire.bind(this)
  this.controls = new PhysicalControls(buttons, options, this)
  this.items.push(this.controls)
  this.controlling = null
}

function PhysicalControls(buttons, options) {
  options = options || {}
  this.state = buttons
  this.rotation_scale = options.rotationScale || 0.002
  this.state.rotation = [0, 0, 0]
  this.STATES = Object.keys(this.state).filter(function(f) {return typeof this.state[f] !== 'function' }, this)
  this.controls = options.controls || controls
  this.velocityFactor = 0.05
}
var PI_2 = Math.PI / 2;

var controls = {
  forward: function() {

  },
  backward: function() {

  },
  left: function() {

  },
  right: function() {

  },
  rotation: function() {

  },
  fire: function() {

  },
  firealt: function() {

  },
  jump: function() {

  },
  tick: function tick(delta, state) {
    var THREE = this.game.THREE
    var velocity = this._target.velocity;

    if (!tick.initialized) {
      this.inputVelocity = new THREE.Vector3();
      this.quat = new THREE.Quaternion();

      this.yawObject = new THREE.Object3D();
      this.pitchObject = new THREE.Object3D();
      this.yawObject.add(this.pitchObject);
      this.pitchObject.add(this.game.camera);

      this.game.scene.add(this.yawObject)
      this.game.control.yawObject = this.yawObject
      this.pitchObject.position.y = 1.62

      tick.initialized = true
    }

    this.inputVelocity.set(0, 0, 0)

    if (state.forward){
      this.inputVelocity.z = -this.velocityFactor * delta;
    }
    if (state.backward){
      this.inputVelocity.z = this.velocityFactor * delta;
    }

    if (state.left) {
      this.inputVelocity.x = -this.velocityFactor * delta;
    }
    if (state.right) {
      this.inputVelocity.x = this.velocityFactor * delta;
    }
    
    // Convert velocity to world coordinates
    this.quat.setFromEuler({x: this.pitchObject.rotation.x, y: this.yawObject.rotation.y, z: 0},"XYZ");
    this.inputVelocity.applyQuaternion(this.quat);

    // Add to the object
    velocity.x += this.inputVelocity.x;
    velocity.z += this.inputVelocity.z;

    this.yawObject.rotation.y += this.state.rotation[1] * 0.005
    this.pitchObject.rotation.x += this.state.rotation[0] * 0.005
    this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );

    this._target.position.copy(this.yawObject.position);
  }
}

PhysicalControls.prototype.target = function target(object, options) {
  if (!object) return {
    avatar: this._target
  }
  options = options || {}
  this.game = options.game
  this._target = object
  this.controls = options.controls || controls
}

PhysicalControls.prototype.tick = function tick(dt) {

  this.controls.tick && this.controls.tick.call(this, dt, this.state)
  for (var i = 0; i < this.STATES.length; ++i) {
    var state = this.STATES[i]
    if (this.state[state] && this.controls[state]) this.controls[state].call(this, dt, this.state[state])
  }
  this.state.rotation = [0, 0, 0]


}

PhysicalControls.prototype.createWriteRotationStream = function() {
  var state = this.state
    , stream = new Stream

  state.rotation = [0,0,0]

  stream.writable = true
  stream.write = write
  stream.end = end

  return stream

  function write(changes) {
    state.rotation[0] -= changes.dy || 0
    state.rotation[1] -= changes.dx || 0
    state.rotation[2] += changes.dz || 0
  }

  function end(deltas) {
    if(deltas) {
      stream.write(deltas)
    }
  }
}
