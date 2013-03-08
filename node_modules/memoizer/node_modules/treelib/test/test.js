var Treelib = require('../index');
var tree = Treelib();

var pathA_array = ['a','b','c'];
var pathA_string = 'a/b/c';

var pathB_array = [2,3,5,7];
var pathB_string = '2/3/5/7';

var pathC_array = [2,3,'foo','bar'];
var pathC_string = '2/3/foo/bar';

var pathD_array = [2,'cat'];
var pathD_string = '2/cat';

var pathE_array = [2,'cat','dog'];
var pathE_string = '2/cat/dog';

exports.testBasics = function(test) {
	test.expect(6);
	tree.path(pathA_string);
	test.deepEqual(tree.checkPath('a/b/cauliflower'),
		{depth:2,validPath:['a','b']}, "Failed deep equal (test 1)");
	test.deepEqual(tree.checkPath('a/b/c'),
		{depth:3,validPath:['a','b','c']}, "Failed deep equal (test 2)");
	test.deepEqual(tree.tree(), {a:{b:{c:undefined}}});
	tree.path(pathA_array);
	test.deepEqual(tree.checkPath('a/b/cauliflower'),
		{depth:2,validPath:['a','b']}, "Failed deep equal (test 1)");
	test.deepEqual(tree.checkPath('a/b/c'),
		{depth:3,validPath:['a','b','c']}, "Failed deep equal (test 2)");
	test.deepEqual(tree.tree(), {a:{b:{c:undefined}}});
	test.done();
};
exports.testOverwrite = function(test) {
	test.expect(1);
	tree.clear();
	tree.path(pathB_string);
	tree.path(pathB_array);
	test.deepEqual(tree.tree(),{2:{3:{5:{7:undefined}}}});
	test.done();
};
exports.testBranching = function(test) {
	test.expect(1);
	tree.clear();
	tree.path(pathB_string);
	tree.path(pathC_string);
	test.deepEqual(tree.tree(),{2:{3:{foo:{bar:undefined}, 5:{7:undefined}}}});
	
	test.done();
};

exports.testBranching2 = function(test) {
	test.expect(1);
	tree.clear();
	tree.path(pathD_string);
	tree.path(pathE_array);
	test.deepEqual(tree.tree(),{2:{cat:{dog:undefined}}});
	
	test.done();
};

exports.testSetAndClearValues = function(test) {
	test.expect(5);
	tree.clear();
	tree.path(pathD_string);
	tree.setValue('meows');
	test.equal('meows',tree.getValue('2/cat'));
	test.equal('meows',tree.getValue(['2','cat']));
	tree.clearValue('2/cat');
	test.equal(undefined, tree.getValue(['2','cat']));
	tree.path('2/cat').setValue('karma');
	test.notEqual(undefined,tree.getValue('2/cat'));
	test.equal('karma',tree.getValue('2/cat'));
	// and mix in a path test
	test.done();
};
