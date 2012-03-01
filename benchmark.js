// Benchmark of Pararr.js with different iterators
// Run with:
//  >node benchmark.js

var p = require('./lib/pararr'),
	arr = [],
	i,
	
	//Funcitons for map
	fac = function(a) {
		return (function facI(a) {
			if (a <= 1) {
				return a;
			}
			return facI(a - 1);
		})(a);
	},
	x2 = function(a) {
		return a * a;
	},
	
	//Functions for filter
	isEven = function(a) {
		return a % 2 === 0;
	},
	isPrime = function(a) {
		var i;
		if (a <= 2) {
			return true;
		}
		for (i = Math.ceil(Math.sqrt(a)) ; i > 1; i--) {
			if (a % i === 0) {
				console.log(i);
				return false;
			}
		}
		return true;
	},
	
	timerPrototype = {
		start : function() {
			this.begin = new Date();
		},
		stop : function() {
			this.end = new Date();
			return this.end - this.begin;
		},
		time : function() {
			return this.end - this.begin;
		}
	};

// Factory function to create a timer object
function createTimer() {
	var timer = Object.create(timerPrototype);
	return timer;
}
	
// Check for array equality
function arrays_equal(a,b) {
	return !!a && !!b && !(a<b || b<a);
}

// Measure and output time required for paralell and normal operations
function benchmark(op, arrLen, iter, iterName, cb) {
	var t1, t2, //Timers
		r1, r2, //Results
		i;
		
	console.log('Iterator: "' + iterName + '"');	
	console.log('# Elements: "' + arrLen + '"');
	
	//Initialize pararr
	p.init();

	// Generate test data
	for (i = 0; i < arrLen; i++) {
		arr.push(Math.floor(Math.random() * 10000));
	}
		
	// Benchmark built in map function
	t1 = createTimer();
	t1.start();
	r1 = arr[op](iter);
	console.log('  Native ' + op + ': ' + t1.stop() + 'ms');

	// Benchmark pararr
	t2 = createTimer();
	t2.start();
	p[op](arr, iter, function(err, act) {
		console.log('  Pararr ' + op + ': ' + t2.stop() + 'ms' + (t2.time() < t1.time() ? ' - faster' : ' - slower'));
		r2 = act;
		if (!arrays_equal(r1,r2)) {
			console.log('  ERROR: Arrays are not equal');
		}
		
		console.log(); //Empty line
		p.destroy();
		cb();
	});
}

benchmark('map', 10000, fac, 'factorial', function() {
	benchmark('map', 10000, x2, 'x^2', function() {
		benchmark('filter', 100000, isPrime, 'isPrime', function() {
			benchmark('filter', 100000, isEven, 'isEven', function() {

			});
		});
	});
});






