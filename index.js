var physi = require('./vendor/physi')
module.exports = function(game) {
	var THREE = game.THREE
	var p = physi(game.THREE)
	p.scripts.worker = '../../vendor/physijs_worker.js'
	p.scripts.cannon = '../../vendor/cannon.js'
	p.scripts.ammo = '../../vendor/ammo.js'
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


