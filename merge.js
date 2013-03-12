"use strict"

var X = 0
var Y = 1
var Z = 2

var WIDTH = 0
var HEIGHT = 1
var DEPTH = 2

function findConvexBox(check, startPos, chunk) {
  if (arguments.length === 2) {
    chunk = startPos
    startPos = chunk.position.map(function(v, i) {
      return v * chunk.dims[i]
    })
  }
  if (!chunk.voxels) throw new Error('Requires game chunk')

  var endPos = chunk.position.map(function(v, i) {
    return v * chunk.dims[i] + chunk.dims[i]
  })

  var box = {
    dims: startPos.map(function(v, i) {return endPos[i] - v}),
    position: [0,0,0]
  }
  if (!check(startPos)) {
    return false
  }
  var found = false
  for (var x = startPos[X]; !found && x < endPos[X]; x++) {
    var y = startPos[Y]
    var z = startPos[Z]
    if (!check([x, y, z])) {
      if (box.dims[WIDTH] > x - startPos[X]) box.dims[WIDTH] = x - startPos[X]
    }
  }

  var found = false
  for (var z = startPos[Z] + 1; !found && z < endPos[Z]; z++) {
    for (var x = startPos[X]; !found && x < startPos[X] + box.dims[WIDTH]; x++) {
      var y = startPos[Y]
      if (!check([x, y, z])) {
        if (box.dims[DEPTH] > z - startPos[Z]) box.dims[DEPTH] = z - startPos[Z]
      }
    }
  }

  var found = false
  for (var y = startPos[Y] + 1; !found && y < endPos[Y]; y++) {
    for (var x = startPos[X]; !found && x < startPos[X] + box.dims[WIDTH]; x++) {
      for (var z = startPos[Z]; !found && z < startPos[Z] + box.dims[DEPTH]; z++) {
        if (!check([x, y, z])) {
          if (box.dims[HEIGHT] > y - startPos[Y]) box.dims[HEIGHT] = y - startPos[Y]
        }
      }
    }
  }

  if (box.dims[WIDTH] == 0) box.dims[WIDTH] = 1;
  if (box.dims[HEIGHT] == 0) box.dims[HEIGHT] = 1;
  if (box.dims[DEPTH] == 0) box.dims[DEPTH] = 1;
  box.position[X] = startPos[X] //+ box.dims[WIDTH]
  box.position[Y] = startPos[Y] //+ box.dims[HEIGHT]
  box.position[Z] = startPos[Z] //+ box.dims[DEPTH]
  return box
}

findConvexBox.all = function(check, chunk, done) {
  var results = []
  findConvexBox.voxelsIn(chunk).forEach(function(pos) {
    var result = findConvexBox(check, pos, chunk)
    if (result) {
      done(result)
      results.push(result)
    }
  })
  return results
}


findConvexBox.voxelsIn = function voxelsIn(chunk) {
  if (chunk.voxels) {
    chunk = {
      dims: chunk.dims.map(function(v) {return v}),
      position: chunk.position.map(function(v, i) {return v * chunk.dims[i]})
    }
  }

  var points = []
  for (var x = chunk.position[X]; x < chunk.position[X] + chunk.dims[WIDTH]; x++) {
    for (var y = chunk.position[Y]; y < chunk.position[Y] + chunk.dims[HEIGHT]; y++) {
      for (var z = chunk.position[Z]; z < chunk.position[Z] + chunk.dims[DEPTH]; z++) {
        points.push([x, y, z])
      }
    }
  }
  return points
}

module.exports = findConvexBox
