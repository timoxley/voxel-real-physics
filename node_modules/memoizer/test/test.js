var memo = require('../index');
var foo = function(x,y,z) { return (x*y) + z }
var bar = function(fn,y) { return fn(y)};
var foo_memoized = memo(foo);
var bar_memoized = memo(bar);
exports.testStoreAndFetch = function(test) {
	test.expect(4);
	test.equal(10,foo_memoized(2,3,4));
	test.equal(10,foo_memoized(2,3,4));
	test.equal(307,bar_memoized(function(val) { return val + 300 },7));
	test.equal(307,bar_memoized(function(val) { return val + 300 },7));
	test.done();
};

var x = function(a,b,c,memo){
	var value = 42;
	memo.done(arguments,value);
};
var y = memo(x);
exports.testAsynchronousStoreAndFetch = function(test) {
	test.expect(3);
	test.equal(42,y('aay','beee','seee'));
	setTimeout(function() {
		test.equal(42,y('aay','beee','seee'));
		test.notEqual(43,y('aay','beee','seee'));
		test.done();
	},250);
};

var baz = {};
baz.myNum = 5;
baz.add= function(x) { return x + this.myNum };
var add_memo = memo(baz.add.bind(baz));
exports.testMethodContext = function(test) {
    test.expect(2);
    test.equal(8, add_memo(3));
    test.equal(8, add_memo(3));
    test.done();
};

var addThen_memo = memo(baz.add.bind(baz))
                    .then(function(last) {
                        return last * 4;
                    });
                         
var f = function(x) {
    return x + 3;
};

var g = memo(f)
        .then(function(last) {
            return last * 4;
        });
exports.testThenFunctionality = function(test) {
    test.expect(2);
    test.equal(32, addThen_memo(3));
    test.equal(20, g(2));
    test.done();
}
