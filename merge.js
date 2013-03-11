function findConvexBox(check, startPos, endPos, fn) {
  var box = {
    x: startPos.x,
    y: startPos.y,
    z: startPos.z,
    width: 0,
    height: 0,
    depth: 0,
    points: []
  }
  if (!check(startPos.x, startPos.y, startPos.z)) {
    return false
  }
  for (var x = startPos.x; x < endPos.x + 1; x++) {
    var y = startPos.y
    var z = startPos.z
    if (!check(x, y, z)) {
      box.width = x - startPos.x
      break
    } else {
      box.points.push({x: x, y: y, z: z})
    }

  }
  var found = false
  for (var z = startPos.z + 1; !found && z < endPos.z + 1; z++) {
    for (var x = startPos.x; !found && x < startPos.x + box.width; x++) {
      var y = startPos.y
      if (!check(x, y, z)) {
        box.depth = z - startPos.z
        found = true
      } else {
        box.points.push({x: x, y: y, z: z})
      }
    }
  }

  var found = false
  for (var z = startPos.y + 1; !found && y < endPos.y + 1; y++) {
    for (var x = startPos.x; !found && x < startPos.x + box.width; x++) {
      for (var z = startPos.z; !found && z < startPos.z + box.depth; z++) {
        if (!check(x, y, z)) {
          box.height = y - startPos.y
          found = true
        }
      }
    }
  }

  if (box.width == 0) box.width = 1;
  if (box.height == 0) box.height = 1;
  if (box.depth == 0) box.depth = 1;

  box.x = startPos.x + box.width / 2
  box.y = startPos.y + box.height / 2
  box.z = startPos.z + box.depth / 2
  return box
}

findConvexBox.all = function(check, startPos, endPos, done) {
  var results = []
  for (var x = startPos.x; x < endPos.x; x++) {
    for (var y = startPos.y; y < endPos.y; y++) {
      for (var z = startPos.z; z < endPos.z; z++) {
        var result = findConvexBox(check, {x: x, y: y, z: z}, endPos)
        if (result) {
          done(result)
          results.push(result)
        }
      }
    }
  }
  return results
}


findConvexBox.voxelsIn = function voxelsIn(box) {
  var boxX = box.x - box.width / 2
  var boxY = box.y - box.height / 2
  var boxZ = box.z - box.depth / 2

  var points = []
  for (var x = boxX; x < boxX + box.width; x++) {
    for (var y = boxY; y < boxY + box.height; y++) {
      for (var z = boxZ; z < boxZ + box.depth; z++) {
        points.push({x: x, y: y, z: z})
      }
    }
  }
  return points
}

module.exports = findConvexBox
