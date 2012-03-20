// Demo of Pararr.js
// Run with:
//  >node demo.js
// Output:
//  >Parallel map returned: 1,2,6,24,120,720,5040,40320,362880,3628800
//  >Parallel map returned: 1,2,3,5,7

var p = require('./lib/pararr'),

	arr = [1,2,3,4,5,6,7,8,9,10],

	// Inperformant factorial funciton
	fac = function(a) {
		return (function facI(a) {
			if (a === 1) {
				return a;
				
			}
			return a * facI(a - 1);
		})(a);
	},
	
	// Inperformant primality check
	isPrime = function(a) {
		var i;
		if (a <= 2) {
			return true;
		}
		for (i = Math.ceil(Math.sqrt(a)) ; i > 1; i--) {
			if (a % i === 0) {
				return false;
			}
		}
		return true;
	};

	
// Parallel map
p.map(arr, fac, function(err, res) {
	console.log('Parallel map returned: ' + res);

	// Parallel filter
	p.filter(arr, isPrime, function(err, res) {
		console.log('Parallel filter returned: ' + res);
		
		// Parallel execution
		p.parallel(
			[
				{
					func : fac,
					par : 3
				},
				{
					func : fac,
					par : 4
				},
				{
					func : fac,
					par : 5
				},
				{
					func : fac,
					par : 6
				},
				{
					func : fac,
					par : 7
				}
			],
			function(result) {
				var facsum = result.reduce(function(acc, val) {
					return acc + val;
				});
				console.log('Sum of factorials: ' + facsum);
				
				// Parallel sorting
				p.sort([8,6,9,4,7,4,2,0,1,3,2], function(err, res) {
					console.log('Sorted array: ' + res);
					p.destroy(); //Cleanup
				});
			}
		);
	});	
});

