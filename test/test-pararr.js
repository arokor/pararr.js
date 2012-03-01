//Nodeunit tests for Pararr.js
// Run with:
//  >nodeunit test (in parent dir)

var p = require('../lib/pararr');

// Check for array equality
function arrays_equal(a,b) {
	return !!a && !!b && !(a<b || b<a);
}

// Test map
exports.map = {
	testInvalidInput: function (test) {
		var arr;
		arr = [1,2,3,4,5,6];
		
		test.expect(3);
		p.map(arr, 'no strings allowed', function(err, act) {
			test.ok(err && typeof act === 'undefined', 'Expected error when passing in string instead of function to map');
			
			p.map({}, function(a){return a*2;}, function(err, act) {
				test.ok(err && typeof act === 'undefined', 'Expected error when passing in object instead of array to map');
				
				test.throws(function() {
					p.map(arr, function(a){return a*2;});
				}, 'Expected Exception due to missing callback');
					
				test.done();
			});
		});
	},
	testMany: function (test) {
		var iter = function(a){return a*2;},
			exp;
		
		function testMap(arr, iter, cb) {
			exp = arr.map(iter); //native map
			p.map(arr, iter, function(err, act) {
				test.ifError(err);
				test.ok(arrays_equal(act, exp), 'Expected ' + exp + ' but got ' + act);
				cb();
			});
		}
		
		testMap([], iter, function() {
			testMap([1,5], iter, function() {
				testMap([5], iter, function() {
					testMap([1,9,7,6,5,1], iter, function() {
						testMap([1,9,7,6,5,1,3], iter, function() {
							testMap([3,5,6,1,1,5,9,7], iter, function() {
								testMap([2,3,1,6,1,9,7,5,3,2,1,5,6,1,5,6,3,2,3,5,6,1,1,5,9,7], iter, function() {
									test.done();
								});
							});
						});
					});
				});
			});
		});
	},
	testSimultaneousCalls: function (test) {
		var iter = function(a){return a*2;},
			arr1 = [1,2,3,6,9,1,3,5,1,7,6,1,2,6,1,2,5,6,1,5,1,3,1,8,9,7,8,6,5,1,3,5,1,5,6,5,1,9,7,5,6,5,1,5,3,2,1,5,61,5,6,8,48,9,4,89,8,4,56,5,1,3,2,2],
			arr2 = [5,6,7,8,9,9,5,3,1,0,1,1,5,5,6,4,9,7,2,4,2,1,5,6,6,4,5,6,561,5,61,56,1,53,2,1,59,8,7,56,5,1,53,21,5,9,5,41,56,5,4789,5,53,1,23,2,3],
			arr3 = [3,5,1,3,2,2,16,1,9,8,7,6,51,5,6,3,21,2,5],
			exp1 = arr1.map(iter),
			exp2 = arr2.map(iter),
			exp3 = arr3.map(iter),
			count = 0;

		function cb(err, act, exp) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected ' + exp + ' but got ' + act + ' when calling map');
			count++;
			if (count === 3) {
				test.done();
			}
		}
		
		function createCallback(exp) {
			return function(err, act) {
				cb(err, act, exp);
			};
		}
		
		
		p.map(arr1, iter, createCallback(exp1));
		p.map(arr2, iter, createCallback(exp2));
		p.map(arr3, iter, createCallback(exp3));
	}
}

// Test filter
exports.filter = {
	testInvalidInput: function (test) {
		var arr;
		arr = [1,2,3,4,5,6];
		
		test.expect(3);
		p.map(arr, 'no strings allowed', function(err, act) {
			test.ok(err && typeof act === 'undefined', 'Expected error when passing in string instead of function to map');
			
			p.map({}, function(a){return a*2;}, function(err, act) {
				test.ok(err && typeof act === 'undefined', 'Expected error when passing in object instead of array to map');
				
				test.throws(function() {
					p.map(arr, function(a){return a*2;});
				}, 'Expected Exception due to missing callback');
					
				test.done();
			});
		});
	},
	testMany: function (test) {
		var iter = function(a){return a % 2 === 0;},
			exp;
		
		function testFilter(arr, iter, cb) {
			exp = arr.filter(iter); //native map
			p.filter(arr, iter, function(err, act) {
				test.ifError(err);
				test.ok(arrays_equal(act, exp), 'Expected ' + exp + ' but got ' + act);
				cb();
			});
		}
		
		testFilter([], iter, function() {
			testFilter([1,5], iter, function() {
				testFilter([5], iter, function() {
					testFilter([1,9,7,6,5,1], iter, function() {
						testFilter([1,9,7,6,5,1,3], iter, function() {
							testFilter([3,5,6,1,1,5,9,7], iter, function() {
								testFilter([2,3,1,6,1,9,7,5,3,2,1,5,6,1,5,6,3,2,3,5,6,1,1,5,9,7], iter, function() {
									test.done();
								});
							});
						});
					});
				});
			});
		});
	},
	testSimultaneousCalls: function (test) {
		var iter = function(a){return a % 2 === 0;},
			arr1 = [1,2,3,6,9,1,3,5,1,7,6,1,2,6,1,2,5,6,1,5,1,3,1,8,9,7,8,6,5,1,3,5,1,5,6,5,1,9,7,5,6,5,1,5,3,2,1,5,61,5,6,8,48,9,4,89,8,4,56,5,1,3,2,2],
			arr2 = [5,6,7,8,9,9,5,3,1,0,1,1,5,5,6,4,9,7,2,4,2,1,5,6,6,4,5,6,561,5,61,56,1,53,2,1,59,8,7,56,5,1,53,21,5,9,5,41,56,5,4789,5,53,1,23,2,3],
			arr3 = [3,5,1,3,2,2,16,1,9,8,7,6,51,5,6,3,21,2,5],
			exp1 = arr1.filter(iter),
			exp2 = arr2.filter(iter),
			exp3 = arr3.filter(iter),
			count = 0;

		function cb(err, act, exp) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected ' + exp + ' but got ' + act + ' when calling filter');
			count++;
			if (count === 3) {
				test.done();
			}
		}
		
		function createCallback(exp) {
			return function(err, act) {
				cb(err, act, exp);
			};
		}
		
		
		p.filter(arr1, iter, createCallback(exp1));
		p.filter(arr2, iter, createCallback(exp2));
		p.filter(arr3, iter, createCallback(exp3));
	}
}

//Finaly call destroy to free resources
exports.finalize = function (test) {
	p.destroy();
	test.done();
};

