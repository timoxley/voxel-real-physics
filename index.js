var physi = require('./vendor/physi')
module.exports = function(game) {
	var THREE = game.THREE
	var p = physi(game.THREE)
	p.scripts.worker = __dirname + '/vendor/physijs_worker.js'
	p.scripts.cannon = __dirname + '/vendor/cannon.js'
	p.scripts.ammo = __dirname + '/vendor/ammo.js'
	//var ammo = require('./vendor/ammo')
	//p.ammo = ammo
	window.THREE = game.THREE


	return p
}


module.exports.meshes = meshes
function meshes(game) {
	var meshes = [];
	for (var meshName in game.voxels.meshes) {
		meshes.push(game.voxels.meshes[meshName])
	}
	return meshes
}


