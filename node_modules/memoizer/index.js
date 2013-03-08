exports = module.exports = Memoizer;
var EE = require('events').EventEmitter;
var Treelib = require('treelib');
var textual = require('textual');
function Memoizer(fn) {
	var args = {};
	var tree = Treelib();
	var emitter = new EE;	
	emitter.on('done', function(pathargs,value){ 
        lastKnownValue = value;
		tree.path(pathargs).setValue(value);
	});
    var lastKnownValue = undefined;
	var getLastArg = textual.getLastArg;
	var doesObjectCallMethod = textual.doesObjectCallMethod;
    var then = undefined; 
    var countCache = 0;
	var memo = function() {};
	var foo = function() {
		var args = [].slice.call(arguments,0);
		if (tree.getValue(args) === undefined) {
			args = args.map(function(val) {
				if (typeof val == 'function') {
					return val.toString();
                } else {
                    return val
                }
            }); 
			if (doesObjectCallMethod(fn, getLastArg(fn), 'done')) {
				var x = memo.bind(fn);
				x.done = function() { 
					var args = [].slice.call(arguments[0],0);
					var pathargs = args.slice(0,args.length-1);;
					var value = arguments[arguments.length-1];
					emitter.emit('done',pathargs,value);
				};
				fn.apply(fn,args.concat(x));
			} else {
                lastKnownValue = fn.apply(fn,arguments);
                if (then !== undefined) {
                    lastKnownValue = then(lastKnownValue);
                }
				tree.path(args).setValue(lastKnownValue);
			}
		} else {
            countCache++;
            //console.log("Cached Value used! :" + countCache);
			// cached value is being used! hooray!
		}
		return tree.getValue(args);
	};
	foo.lastArg = function(fn) {
		return getLastArg(fn);
	};
	foo.doesObjectCallMethod = function(fn,objstr,methodstr) {
		return doesObjectCallMethod(fn,objstr,methodstr)
	};
    foo.update = function(args, val) {
        tree.path(args).setValue(val);
        return foo;
    };
    foo.then = function(cb) {
        then = cb;
        return foo;
    }
	return foo;
};
