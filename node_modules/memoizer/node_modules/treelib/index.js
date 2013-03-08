// incidentally, does shrubs too :-)
var Treelib = function(tree) {
	var self = {};
	if (tree === undefined) 
		tree = {};
	var currentBranch = {};
	var config = {};
	config.historyWindow = 50;	
	var history = [];
	var setCurrentBranch = function(list) {
		var branch = tree; 
		var i = 0;
		for (i = 0; i < list.length; i++) {
			if (branch[list[i]] !== undefined) {
				branch = branch[list[i]];
			} else {
				break;
			}
		}
		currentBranch.branch = branch;
		currentBranch.leaf = list[list.length-1];
	};
	var checkPath_array = function(list) {
		var branch = tree; 
		var depth = 0;
		var validPath = [];
		var i = 0;
		for (i = 0; i < list.length; i++) {
			if (branch.hasOwnProperty(list[i])) {
				validPath.push(list[i]);
			}
			if (branch[list[i]] !== undefined) {
				branch = branch[list[i]];
			} else {
				break;
			}
		}
		return {depth:validPath.length,validPath:validPath}
	};
	var checkPath_string = function(path) {
		var list = path.split('/');
		return checkPath_array(list.slice(0));
	};
	var deletePath_array = function(list) {
		var branch = tree;
		
	};
	var createPath = function(list,obj) {
		var newobj = {};
		if (list.length == 0) {
			return obj;
		} else if (list.length > 0) {
			newobj[list[0]] = obj;
			list.shift();   
			return createPath(list,newobj);
		}       
	};
	var addHistory = function(obj) {
		history.push(obj);
		if (history.length == config.historyWindow) {
			history.shift();
		}
	};
	var addPath_array = function(list) {
		var newPath = createPath(list.slice(0).reverse());
		addHistory(newPath);	
		merge(newPath,tree);	
		setCurrentBranch(list);
	};
	var addPath_string = function(path) {
		var list = path.split('/');
		addPath_array(list.slice(0));
	};
	var setValue = function(val) {
		currentBranch.branch[currentBranch.leaf] = val;
		currentBranch.val = val;
		addHistory(currentBranch);
	};
	var getValue_string = function(path) {
		var list = path.split('/');
		return getValue_array(list.slice(0));	
	};
	var getValue_array = function(list) {
		var result = checkPath_array(list);
		if (result.validPath.length < list.length) {
			return undefined
		}	
		var branch = tree;
		for (i = 0; i < list.length; i++) {
			branch = branch[list[i]];
		}
		return branch;
	};
	var merge = function (from,to) {
		Object.keys(from).forEach(function (key) {
			if ((to !== undefined) && (to[key] !== undefined)) {
				if (from[key] !== undefined) 
					merge(from[key], to[key])	
			} else if (to !== undefined)
				to[key] = from[key];
		});
	};
	var blend = function(obj1,obj2) {
		merge(obj1,obj2);
		merge(obj2,obj1);
	};
	var clearValue_string = function(path) {
		var list = path.split('/');
		clearValue_array(list);
	};
	var clearValue_array = function(list) {
		var result = checkPath_array(list);		
		var branch = tree;
		var i = 0;
		for (i = 0; i < list.length; i++) {
			if (i < (list.length-1))
			branch = branch[list[i]];
		}
		branch[list[i-1]] = undefined;
	};
	self.add = function(path) {
		if (typeof path == 'string') {
			addPath_string(path);
		}
		else if (Array.isArray(path)) {
			addPath_array(path);
		}
		return self;
	};
	self.clearValue = function(path) {
		if (typeof path == 'string') {
			clearValue_string(path);
		}
		else if (Array.isArray(path)) {
			clearValue_array(path);
		}
		return self;
	};
	self.createPath = function(path,obj) {
		var obj = {};
		createPath(path.slice(0).reverse(),obj);
		return self;
	};
	self.setValue = function(val) {
		setValue(val);
		return self;
	};
	self.getValue = function(path) {
		if (typeof path == 'string') {
			return getValue_string(path);
		}
		else if (Array.isArray(path)) {
			return getValue_array(path);
		}
	};
	self.path = function (path) {
		this.add(path);
		return self;
	};
	self.setConfig = function(obj) {
		for (var i in obj) {
			config[i] = obj[i];
		}
	}
	self.checkPath = function(path) {
		if (typeof path == 'string') 
			return checkPath_string(path)
		else if (Array.isArray(path))
			return checkPath_array(path)
	};
	self.show = function() {
		console.log(tree);
		return self;
	};
	self.tree = function() {
		return tree;
	};
	self.clear = function() {
		tree = {};
		return self;
	};
	self.history = function() {
		return history;
	};
	return self;
};
exports = module.exports = Treelib;
