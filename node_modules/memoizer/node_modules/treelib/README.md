treelib : create tree's as easy as .path('a/b/c')
=================================================

	var Treelib = require('treelib');
	var tree = Treelib();

	tree.path('a/b/c').setValue('foobar');

	// creates a nested tree
	> { a : { b : { c : 'foobar' }}}

methods
=======

.path(path) 
-----------
path takes a string or array to indicate a path, i.e.
'a/b/c' refers to this path {a : {b : { c : '' }}}

Treelib creates the path if it doesn't exist.

example: 

	tree.path(['foo','bar','baz']).setValue('PERL!');

	> {foo: {bar: {baz: 'PERL!'}}}

	tree.path('foo/bar/bitter').setValue('Randal Schwartz');

	> {foo: {bar: {baz: 'PERL!', bitter: 'Randal Schwartz'}}}


.setValue(val)
--------------
setValue sets a value on the current path. The current path
is set after .path is called.

example:
	
	tree.path('Music/The Smiths').setValue({price:'$12.99',SKU:'24142'})

	> {Music:{'The Smiths':{price:'$12.99',SKU:'24142'}}}

.getValue(path)
---------------
getValue takes a path in the form of a string or array and returns
the value there. If the path doesn't exist or there is no value set
at that path, then it returns undefined


.clearValue(path) 
----------------------------
clearValue takes a path in the form of a string or array and clears the value at the end of that path, i.e. clears the leaf value.


.checkPath(path) 
---------------------------
example:
	tree.path('a/b/c');	
	tree.checkPath('a/b/cauliflower');
	
	// returns

	> {depth: 2, validPath: [ 'a', 'b' ] }

checkPath takes a path in the form of a string or array and returns how far it could walk down the tree.

.show()
-------
Show the tree in the console.

.tree()
-------
Returns the tree itself.

.history()
----------
Returns the 50 most recent history of path creation and setValues
executions.

TESTING
=======

testing results from ./test/test.js (nodeunit)

	$ nodeunit *

	test.js
	✔ testBasics
	✔ testOverwrite
	✔ testBranching
	✔ testBranching2
	✔ testSetAndClearValues

	OK: 14 assertions (13ms)
