build/build.js: index.js
	@mkdir -p build
	@browserify index.js > build/build.js

examples: index.js examples/simple/index.html examples/simple/index.js
	@browserify --insert-globals examples/simple/index.js > examples/simple/build.js

.PHONY: examples
