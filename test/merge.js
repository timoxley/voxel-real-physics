'use strict'

var DEBUG = true
var merge = require('../merge.js')
var assert = require('assert')
var Game = require('voxel-engine')
var textures = require('painterly-textures')

var X = 0
var Y = 1
var Z = 2

var WIDTH = 0
var HEIGHT = 1
var DEPTH = 2


Game.prototype.initializeControls = Game.prototype.hookupControls = function() {}

var game = new Game({
  generate: function(x, y, z) {
    if (y == -1) return 3
      return 0
  },
  texturePath: '../node_modules/painterly-textures/textures/',
  chunkSize: 16,
  chunkDistance: 5,
})

it('is sane', function() {
  assert.ok(merge)
  assert.ok(typeof merge === 'function')
})

function generate(chunk, fn) {
  if (typeof chunk === 'function') {
    fn = chunk
    chunk = game.getChunkAtPosition([0,0,0])
  }
  for (var x = chunk.position[X] * chunk.dims[WIDTH]; x < chunk.dims[WIDTH] + chunk.position[X] * chunk.dims[WIDTH]; x++) {
    for (var y = chunk.position[Y] * chunk.dims[HEIGHT]; y < chunk.dims[HEIGHT] + chunk.position[Y] * chunk.dims[HEIGHT]; y++) {
      for (var z = chunk.position[Z] * chunk.dims[DEPTH]; z < chunk.dims[DEPTH] + chunk.position[Z] * chunk.dims[DEPTH]; z++) {
        game.setBlock([x, y, z], fn(x,y,z) || 0)
      }
    }
  }
}

window.game = game

var result, chunk, endPos, mesh


function getBlock(pos) {
  if (game.getBlock(pos) === 1) {
    return true
  }
  return false
}

beforeEach(function() {
  chunk = game.getChunkAtPosition([0,0,0])
  //endPos = {
  //x: chunk.position[0] + chunk.dims[0],
  //y: chunk.position[1] + chunk.dims[1],
  //z: chunk.position[2] + chunk.dims[2]
  //}
})

afterEach(function() {
  if (DEBUG) return
    generate(function() {
      return 0
    })
})

afterEach(function() {
  if (DEBUG) return
    hideMesh()
})

function showMesh(result) {
  showMesh.meshes = showMesh.meshes || []
  mesh = new game.THREE.Mesh(
    new game.THREE.CubeGeometry(result.dims[WIDTH],result.dims[HEIGHT],result.dims[DEPTH]),
    new game.THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
  )
  mesh.position.set(result.position[X] + result.dims[WIDTH] / 2, result.position[Y] + result.dims[HEIGHT] / 2, result.position[Z] + result.dims[DEPTH] / 2)
  game.scene.add(mesh)
  showMesh.meshes.push(mesh)
}

function hideMesh() {
  if (showMesh.meshes) {
    showMesh.meshes.forEach(function(mesh) {
      game.scene.remove(mesh)
    })
  }
}

describe('x', function() {
  describe('single row on x', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (y == 0 && z == 0) return 1
      })
    result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })
    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], game.chunkSize)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], 1)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], 1)
    })
  })
  describe('broken row on x', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (y == 0 && z == 0) {
          if (x === game.chunkSize / 2) return 0
            return 1
        }
        return 0
      })

      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], game.chunkSize / 2)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], 1)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], 1)
    })
  })
})

describe('y', function() {
  describe('single row on y', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (y < game.chunkSize && x == 0 && z == 0) return 1
          return 0
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })
    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], 1)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], game.chunkSize)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], 1)
    })
  })

  describe('broken row on y', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (x == 0 && z == 0) {
          if (y === game.chunkSize / 2) return 0
            return 1
        }
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], 1)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], game.chunkSize / 2)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], 1)
    })
  })

  describe('area shape on xy', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (x < game.chunkSize && y < game.chunkSize && z == 0) {
          return 1
        }
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], game.chunkSize)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], game.chunkSize)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], 1)
    })
  })

  describe('1/2 area shape on y', function() {
    beforeEach(function() {
      generate(function(x,y,z) {
        if (x < game.chunkSize / 2 && y < game.chunkSize / 2 && z == 0) {
          return 1
        }
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], game.chunkSize / 2)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], game.chunkSize / 2)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], 1)
    })
  })


})

describe('z', function() {
  describe('single row on z', function() {
    beforeEach(function() {
      generate(function(x,y,z) {
        if (x === 0 && y === 0) {
          return 1
        }
        return 0
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })
    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], 1)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], 1)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], game.chunkSize)
    })
  })

  describe('broken row on z', function() {
    beforeEach(function() {
      generate(function(x,y,z) {
        if (x === 0 && y === 0) {
          if (z === game.chunkSize / 2) return 0
            return 1
        }
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], 1)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], 1)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], game.chunkSize / 2)
    })
  })

  describe('area shape on xyz', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        return 1
      })
      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], game.chunkSize)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], game.chunkSize)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH],  game.chunkSize)
    })
  })

  describe('1/2 area shape on xyz', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (x < game.chunkSize / 2
            && y < game.chunkSize / 2
          && z < game.chunkSize / 2) {
            return 1
          }
          return 0
      })

      result = merge(getBlock, chunk)
    })

    beforeEach(function() {
      showMesh(result)
    })

    it('can merge x', function() {
      assert.equal(result.dims[WIDTH], game.chunkSize / 2)
    })
    it('can merge y', function() {
      assert.equal(result.dims[HEIGHT], game.chunkSize / 2)
    })
    it('can merge z', function() {
      assert.equal(result.dims[DEPTH], game.chunkSize / 2)
    })
  })
})

describe('cube', function() {
  beforeEach(function() {
    generate(function(x, y, z) {
      if (x < game.chunkSize / 2
          && y < game.chunkSize / 2
        && z < game.chunkSize / 2) {
          return 1
        }
        return 0
    })
    result = merge(getBlock, chunk)
  })

  beforeEach(function() {
    showMesh(result)
  })
  it('gets all points', function() {
    assert.equal(merge.voxelsIn(result).length, game.chunkSize / 2 * game.chunkSize / 2 * game.chunkSize / 2)
  })
})

describe('multi find', function() {
  var results
  describe('stairs', function() {
    describe('xy stairs', function() {
      beforeEach(function() {
        generate(function(x, y, z) {
          if (z !== 0) return 0
            if (x + y < 5) {
              return 1
            }
        })
        results = merge.all(getBlock, chunk, function(result) {
          merge.voxelsIn(result).forEach(function(pos) {
            game.setBlock(pos, 2)
          })
        })
        results.forEach(showMesh)
      })
      it('creates optimum number of boxes', function() {
        assert.equal(results.length, 5)
      })
    })
    describe('xz stairs + z line', function() {
      beforeEach(function() {
        generate(function(x, y, z) {
          if (y !== 0) return 0
            if (z === 6) return 1
            if (z + x < 5) {
              return 1
            }
        })
        results = merge.all(getBlock, chunk, function(result) {
          merge.voxelsIn(result).forEach(function(pos) {
            game.setBlock(pos, 2)
          })
        })
        results.forEach(showMesh)
      })
      it('creates optimum number of boxes', function() {
        assert.equal(results.length, 6)
      })
    })
    describe('xz 2 way stairs + z line', function() {
      beforeEach(function() {
        generate(function(x, y, z) {
          if (y < 10) {
            if (Math.random() > 0.8) return 1
          }
          if (y !== 0) return 0
            if (z + x < 5) {
              return 1
            }
            if (z - x > 5 && z - x > 10) {
              return 1
            }
            if (x - z > 5 && x - z > 10) {
              return 1
            }

        })
        results = merge.all(getBlock, chunk, function(result) {
          merge.voxelsIn(result).forEach(function(pos) {
            game.setBlock(pos, 2)
          })
        })
        results.forEach(showMesh)
      })
      it('creates optimum number of boxes', function() {
        assert.equal(results.length, 6)
      })
    })

  })
  describe('broken area shape on xy', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (z == 0) {
          if (x === game.chunkSize / 2 && y === game.chunkSize / 2) return 0
          return 1
        }
      })
      results = merge.all(getBlock, chunk, function(result) {
        merge.voxelsIn(result).forEach(function(pos) {
          game.setBlock(pos, 2)
        })
      })
    })
    it('creates optimum number of boxes', function() {
      assert.equal(results.length, 4)
    })
  })
  describe('broken area shape on xz', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (y == 0) {
          if (x === game.chunkSize / 2 && z === game.chunkSize / 2) return 0
            return 1
        }
      })
      results = merge.all(getBlock, chunk, function(result) {
        merge.voxelsIn(result).forEach(function(pos) {
          game.setBlock(pos, 2)
        })
      })
      results.forEach(showMesh)
    })
    it('creates optimum number of boxes', function() {
      assert.equal(results.length, 4)
    })
  })

  describe('broken area shape on xyz', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (x === game.chunkSize / 2 && y === game.chunkSize / 2 && z === game.chunkSize - 1) return 0
          return 1
      })
      results = merge.all(getBlock, chunk, function(result) {
        merge.voxelsIn(result).forEach(function(pos) {
          game.setBlock(pos, 2)
        })
      })
      results.forEach(showMesh)
    })
    it('creates optimum number of boxes', function() {
      assert.equal(results.length, 5)
    })
  })
  describe('different chunks', function() {
    describe('single row on x', function() {
      beforeEach(function() {
        chunk = game.getChunkAtPosition([game.chunkSize, game.chunkSize, game.chunkSize])
        generate(chunk, function(x, y, z) {
          if (y == game.chunkSize && z == game.chunkSize) return 1
        })
        results = merge.all(getBlock, chunk, function(result) {
          merge.voxelsIn(result).forEach(function(pos) {
            game.setBlock(pos, 2)
          })
        })
        results.forEach(showMesh)

      })
      it('merges correctly', function() {
        assert.equal(results.length, 1)
        var result = results[0]
        assert.equal(result.dims[WIDTH], game.chunkSize)
        assert.equal(result.dims[HEIGHT], 1)
        assert.equal(result.dims[DEPTH], 1)
      })
    })

    describe('area shape on xyz', function() {
      beforeEach(function() {
        chunk = game.getChunkAtPosition([game.chunkSize, game.chunkSize, game.chunkSize])
        // make it a little smaller than dims
        // to test algorithm doesn't rely on
        // dim values
        generate(chunk, function(x, y, z) {
          if (x < game.chunkSize - 1 &&
              y < game.chunkSize - 1 &&
              z < game.chunkSize - 1) return 1
        })
        results = merge.all(getBlock, chunk, function(result) {
          merge.voxelsIn(result).forEach(function(pos) {
            game.setBlock(pos, 2)
          })
        })
        results.forEach(showMesh)
      })
      it('merges correctly', function() {
        assert.equal(results.length, 1)
        var result = results[0]
        assert.equal(result.dims[WIDTH], game.chunkSize - 1)
        assert.equal(result.dims[HEIGHT], game.chunkSize - 1)
        assert.equal(result.dims[DEPTH], game.chunkSize - 1)
      })
    })
    describe('broken area shape on xyz', function() {
      beforeEach(function() {
        chunk = game.getChunkAtPosition([game.chunkSize, game.chunkSize, game.chunkSize])
        generate(chunk, function(x, y, z) {
          if (x === game.chunkSize + game.chunkSize / 2 && y === game.chunkSize && z === game.chunkSize) return 0
          return 1
        })
        results = merge.all(getBlock, chunk, function(result) {
          merge.voxelsIn(result).forEach(function(pos) {
            game.setBlock(pos, 2)
          })
        })
        results.forEach(showMesh)
      })
      it.only('merges correctly', function() {
        assert.equal(results.length, 4)
      })
    })


  })

  describe('a U shape', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        if (y == 0) {
          if (x == 0 || x == 1) return 1
        }
      if ((x == 0 || x == 1) && (z == 0 || z == game.chunkSize - 1)) {
        return 1
      }
      })
      results = merge.all(getBlock, chunk, function(result) {
        merge.voxelsIn(result).forEach(function(pos) {
          game.setBlock(pos, 2)
        })
        showMesh(result)
      })
    })
    it('works', function() {
      assert.equal(results.length, 3)
    })
  })

  describe('terrain', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        var val = y + 4 * Math.sin(x / game.chunkSize * 10)
        if (val > 2 && val < 5) return 1
      })
    results = merge.all(getBlock, chunk, function(result) {
      merge.voxelsIn(result).forEach(function(pos) {
        game.setBlock(pos, 2)
      })
      showMesh(result)
    })

    })
    it('works', function() {
      assert.equal(results.length, 14)
    })
  })
  describe('box with chinks', function() {
    beforeEach(function() {
      generate(function(x, y, z) {
        //if (y === 2) return 1
        if (x === 13) return 0
          if (y === 2) return 1
            //var val = y + 3 * Math.sin(z / 4)
            //if (val > 1 && val < 5) {
            //console.log(x, y, z)
            //return 1
            //}
      })
      var removeBlock = game.blockPosition([2.7786577951257296, 2.999999957666711, 5.581482984617888])
      //console.log(removeBlock)
      game.setBlock(removeBlock, 0)
      results = merge.all(getBlock, chunk, function(result) {
        merge.voxelsIn(result).forEach(function(pos) {
          //try {
          assert.notDeepEqual(pos, removeBlock)
          //} catch (e) {
          //console.log('omg', result)
          //results
          //pos
          //debugger
          //}
          game.setBlock(pos, 2)
        })
        showMesh(result)

      })

      game.setBlock(removeBlock, 0)
    })
    it('works', function() {
      //assert.equal(results.length, 14)
    })
  })
})

//window.onmousedown = function() {
//var ray = game.raycast()
//if (!ray) return
//game.setBlock(ray.position, 0)
////console.log(ray.position)
//var results = merge.all(getBlock, game.getChunkAtPosition(ray.position), function(result) {
//merge.voxelsIn(result).forEach(function(pos) {
//game.setBlock(pos, 2)
//})
//})
//results.forEach(showMesh)

//}

game.camera.position.set(0, 5, 0)
game.appendTo(document.getElementById('world'))
game.paused = false

window.fControls = new FirstPersonControls(game.camera, document.body)
game.on('tick', function(dt) {
  if (window.fr) return
    fControls.update(dt / 60)
})

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */
function FirstPersonControls( object, domElement ) {
  var THREE = game.THREE

  this.object = object;
  this.target = new THREE.Vector3( 0, 0, 0 );

  this.domElement = ( domElement !== undefined ) ? domElement : document;

  this.movementSpeed = 0.7;
  this.lookSpeed = 0.02;

  this.lookVertical = true;
  this.autoForward = false;
  this.invertVertical = true;

  this.activeLook = true;

  this.heightSpeed = false;
  this.heightCoef = 1.0;
  this.heightMin = 0.0;
  this.heightMax = 1.0;

  this.constrainVertical = false;
  this.verticalMin = 0;
  this.verticalMax = Math.PI;

  this.autoSpeedFactor = 0.0;

  this.mouseX = 0;
  this.mouseY = 0;

  this.lat = 0;
  this.lon = 0;
  this.phi = 0;
  this.theta = 0;

  this.moveForward = false;
  this.moveBackward = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.freeze = false;

  this.mouseDragOn = false;

  this.viewHalfX = 0;
  this.viewHalfY = 0;

  if ( this.domElement !== document ) {

    this.domElement.setAttribute( 'tabindex', -1 );

  }

  //

  this.handleResize = function () {

    if ( this.domElement === document ) {

      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;

    } else {

      this.viewHalfX = this.domElement.offsetWidth / 2;
      this.viewHalfY = this.domElement.offsetHeight / 2;

    }

  };

  this.onMouseDown = function ( event ) {

    if ( this.domElement !== document ) {

      this.domElement.focus();

    }

    event.preventDefault();
    event.stopPropagation();

    if ( this.activeLook ) {

      switch ( event.button ) {

        case 0: this.moveForward = true; break;
        case 2: this.moveBackward = true; break;

      }

    }

    this.mouseDragOn = true;

  };

  this.onMouseUp = function ( event ) {

    event.preventDefault();
    event.stopPropagation();

    if ( this.activeLook ) {

      switch ( event.button ) {

        case 0: this.moveForward = false; break;
        case 2: this.moveBackward = false; break;

      }

    }

    this.mouseDragOn = false;

  };

  this.onMouseMove = function ( event ) {

    if ( this.domElement === document ) {

      this.mouseX = event.pageX - this.viewHalfX;
      this.mouseY = event.pageY - this.viewHalfY;

    } else {

      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

    }

  };

  this.onKeyDown = function ( event ) {

    //event.preventDefault();

    switch ( event.keyCode ) {

      case 38: /*up*/
      case 87: /*W*/ this.moveForward = true; break;

      case 37: /*left*/
      case 65: /*A*/ this.moveLeft = true; break;

      case 40: /*down*/
      case 83: /*S*/ this.moveBackward = true; break;

      case 39: /*right*/
      case 68: /*D*/ this.moveRight = true; break;

      case 82: /*R*/ this.moveUp = true; break;
      case 70: /*F*/ this.moveDown = true; break;

      case 81: /*Q*/ this.freeze = !this.freeze; break;

    }

  };

  this.onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: /*up*/
      case 87: /*W*/ this.moveForward = false; break;

      case 37: /*left*/
      case 65: /*A*/ this.moveLeft = false; break;

      case 40: /*down*/
      case 83: /*S*/ this.moveBackward = false; break;

      case 39: /*right*/
      case 68: /*D*/ this.moveRight = false; break;

      case 82: /*R*/ this.moveUp = false; break;
      case 70: /*F*/ this.moveDown = false; break;

    }

  };

  this.update = function( delta ) {

    if ( this.freeze ) {

      return;

    }

    if ( this.heightSpeed ) {

      var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
      var heightDelta = y - this.heightMin;

      this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

    } else {

      this.autoSpeedFactor = 0.0;

    }

    var actualMoveSpeed = delta * this.movementSpeed;

    if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
    if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

    if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
    if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

    if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
    if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

    var actualLookSpeed = delta * this.lookSpeed;

    if ( !this.activeLook ) {

      actualLookSpeed = 0;

    }

    var verticalLookRatio = 1;

    if ( this.constrainVertical ) {

      verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

    }

    this.lon += this.mouseX * actualLookSpeed;
    if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

    this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
    this.phi = THREE.Math.degToRad( 90 - this.lat );

    this.theta = THREE.Math.degToRad( this.lon );

    if ( this.constrainVertical ) {

      this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

    }

    var targetPosition = this.target,
    position = this.object.position;

    targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
    targetPosition.y = position.y + 100 * Math.cos( this.phi );
    targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

    this.object.lookAt( targetPosition );

  };


  this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

  this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
  //this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
  //this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
  this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
  this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

  function bind( scope, fn ) {

    return function () {

      fn.apply( scope, arguments );

    };

  };

  this.handleResize();

}
