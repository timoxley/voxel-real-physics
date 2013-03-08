memoizer - f2 = memo(f); f2 is now fully memoized!
==================================================
From [Wikipedia] [wikipedia-memo]
	
In computing, memoization is an optimization technique used primarily to speed up computer programs by having function calls avoid repeating the calculation of results for previously-processed inputs.

example:

	var memo = require('memoizer');
	var f = function(x,y,z) { return ((x + 1) * y) + z };
	
	var f2 = memo(f);

	// now f2 is fully memoized!

	f2(2,3,4);
	
	>> 13

	f2(2,3,4);
	
	>> 13 // but instantly from cache!

[wikipedia-memo]: http://en.wikipedia.org/wiki/Memoization

Usage
=====

memo(your_function)
-------------------

memo takes a function, memoizes it, and the return value is a fully-memoized version of your function, bam!

memoizer works with asynchronous functions too!!
================================================

What? in *your_function* simply declare a memo parameter as your last
argument, and call memo.done(arguments,value) where *value* is the value
you want to store.

Example:
	
	var f = function(x,y,z,memo) {
		var result = ((x+1) * y) + z;
		memo.done(arguments, result);
	}
	
	f(2,3,4);
	
	// will store the value
	// after memo.done is called.

	// sometime later..time passes..

	f(2,3,4);
		
	// calculated instantly!

Even Do Advanced Calculations with .then
========================================

Example:

    var f = function(x) {
        return x + 3;
    };

    var g = memo(f)
            .then(function(last) {
                return last * 4;
            });

    g(2);
    
    // (2 + 3) * 4 = 20
