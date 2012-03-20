// Nodeunit tests for Pararr.js
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
			exp = arr.filter(iter); //native filter
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


// Test many initializations
exports.init = {
	testMany: function (test) {
		var iter = function(a){return a % 2 === 0;},
			exp;
		
		function testFilter(arr, iter, cb) {
			exp = arr.filter(iter); //native filter
			p.filter(arr, iter, function(err, act) {
				test.ifError(err);
				test.ok(arrays_equal(act, exp), 'Expected ' + exp + ' but got ' + act);
				cb();
			});
		}
		
		testFilter([], iter, function() {
			p.destroy();
			testFilter([1,5], iter, function() {
				p.destroy();
				testFilter([5], iter, function() {
					p.destroy();
					testFilter([1,9,7,6,5,1], iter, function() {
						p.destroy();
						testFilter([1,9,7,6,5,1,3], iter, function() {
							p.destroy();
							testFilter([3,5,6,1,1,5,9,7], iter, function() {
								p.destroy();
								testFilter([2,3,1,6,1,9,7,5,3,2,1,5,6,1,5,6,3,2,3,5,6,1,1,5,9,7], iter, function() {
									test.done();
								});
							});
						});
					});
				});
			});
		});
	}
};

// Test exec
exports.exec = {
	testExecError : function(test) {
		p.exec(function(a) { throw Error('test'); }, 4, function(err, act) {
			test.ok(err !== null, 'Expected error');
			test.strictEqual(act, null, 'Expected null');
			p.exec(function(a) { throw Error('test'); }, 2, function(err, act) {
				test.ok(err !== null, 'Expected error');
				test.strictEqual(act, null, 'Expected null');
				p.exec(function(a) { throw Error('test'); }, 5, function(err, act) {
					test.ok(err !== null, 'Expected error');
					test.strictEqual(act, null, 'Expected null');
					p.exec(function(a) { throw Error('test'); }, 2, function(err, act) {
						test.ok(err !== null, 'Expected error');
						test.strictEqual(act, null, 'Expected null');
						p.exec(function(a) { throw Error('test'); }, 1, function(err, act) {
							test.ok(err !== null, 'Expected error');
							test.strictEqual(act, null, 'Expected null');
							test.done();
						});
					});
				});
			});
		});
	},
	testInvalidInput : function(test) {
		p.exec('dummy', 1, function(err, act) { //first arg not a fkn
			test.ok(err !== null, 'Expected error');
			p.exec(function(a) {return a;}, function(){}, function(err, act) { //par is a fkn
				test.ok(err !== null, 'Expected error');
				test.throws(function() {
					p.exec(function(a) {return a;}, 0);
				}, 'Expected thrown error due to missing callback');
				test.done();
			});
		});
	},
	testNoPar : function(test) {
		p.exec(function() {return 1;}, function(err, act) {
			test.ifError(err, 'Did not expect error here');
			test.strictEqual(act, 1, 'Incorrect exec() result');
			test.done();
		});
	},
	testSequentialExec : function(test) {
		var f0 = function() { return 123-20+20; },
			f1 = function() { return 123; },
			f2 = function() { return 123*2/2; },
			f3 = function() { return 123+5-5; },
			exp = 123;

		p.exec(f0, 0, function(err, act) {
			test.strictEqual(act, exp, 'Incorrect exec() result');
				p.exec(f1, 0, function(err, act) {
					test.strictEqual(act, exp, 'Incorrect exec() result');
					p.exec(f2, 0, function(err, act) {
						test.strictEqual(act, exp, 'Incorrect exec() result');
						p.exec(f3, 0, function(err, act) {
							test.strictEqual(act, exp, 'Incorrect exec() result');
							test.done();
						});
					});
				});
		});
	},
	testParallelExec : function(test) {
		var f0 = function(a) { return 123-20+20+a-a; },
			f1 = function(a) { return 123+a-a; },
			f2 = function(a) { return 123*2/2+a-a; },
			f3 = function(a) { return 123+5-5+a-a; },
			exp = 123,
			count = 0;

		function cb() {
			count++;
			if (count === 4) {
				test.done();
			}
		}

		p.exec(f0, 3, function(err, act) {
			test.strictEqual(act, exp, 'Incorrect exec() result');
			cb();
		});
		p.exec(f1, 9, function(err, act) {
			test.strictEqual(act, exp, 'Incorrect exec() result');
			cb();
		});
		p.exec(f2, 6, function(err, act) {
			test.strictEqual(act, exp, 'Incorrect exec() result');
			cb();
		});
		p.exec(f3, 4, function(err, act) {
			test.strictEqual(act, exp, 'Incorrect exec() result');
			cb();
		});
	},
	testParallel : function(test) {
		var a = [123,234,345,456],
			f = function(a) {
				var i, j;
				for(i=0; i<12345; i++) {
					j += i /1234;
				}
				return a;
			}; 

		p.parallel(
			[
				{
					func : function(par) {
						var i, j;
						for(i=0; i<100000; i++) {
							j += i /1234;
						}
						return par.a;
					},
					par : {
						a : a[0]
					}
				},
				{
					func : function(par) {
						var i, j;
						for(i=0; i<30000; i++) {
							j += i /1234;
						}
						return par.a;
					},
					par : {
						a : a[1]
					}
				},
				{
					func : function(par) {
						var i, j;
						for(i=0; i<12000; i++) {
							j += i /1234;
						}
						return par.a;
					},
					par : {
						a : a[2]
					}
				},
				{
					func : function(par) {
						var i, j;
						for(i=0; i<1000; i++) {
							j += i /1234;
						}
						return par.a;
					},
					par : {
						a : a[3]
					}
				},
				{
					func : f,
					par : 'test'
				}
			],

			// Callback
			function(result) {
				test.strictEqual(result[0], a[0], 'Incorrect parallel result');
				test.strictEqual(result[1], a[1], 'Incorrect parallel result');
				test.strictEqual(result[2], a[2], 'Incorrect parallel result');
				test.strictEqual(result[3], a[3], 'Incorrect parallel result');
				test.strictEqual(result[4], 'test', 'Incorrect parallel result');
				test.done();
			}
		);	
	}
};

// Test sort
exports.sort = {
	testInvalidInput: function(test) {
		p.sort(null, function(err) {
			test.ok(err, 'Expected error');
			p.sort([1,2,3], null, function(err) {
				test.ok(err, 'Expected error');
				test.throws(function() {
					p.sort([1,2,3]);
				}, 'Expected exception');
				test.done();
			});
		});
	},
	testSortInts: function(test) {
		var arr = [1,6,5,9,12,5,473,5,4,23,5,89,15,19,3,7,6,8,42,15,9,878,3,21,456],
			comp = function(a,b) { return a-b; }, // Comparator
			exp = arr.slice().sort(comp);

		p.sort(arr, comp, function(err, act) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected equal sorted arrays');
			test.done();
		});
	},
	testSortStrings: function(test) {
		var arr = ['abc', 'fr', 'jkl', 'xcc', 'zh', 'nhz', 'oeo', 'nh', 'r4e'],
			exp = arr.slice().sort();

		p.sort(arr, function(err, act) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected equal sorted arrays');
			test.done();
		});
	},
	testDefaultComparator: function(test) {
		var arr = [9,1,556,675,2,132,4,1,25,71,9,18,4,16,123,3,4,1,6,28,1],
			exp = arr.slice().sort();

		p.sort(arr, function(err, act) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected equal sorted arrays');
			test.done();
		});
	},
	testTinyArray: function(test) {
		var arr = [9,5],
			exp = arr.slice().sort();

		p.sort(arr, function(err, act) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected equal sorted arrays');
			test.done();
		});
	},
	testMixedArray: function(test) {
		var arr = [9,'/*-',8,null,'a','5','x','d',4],
			exp = arr.slice().sort();

		p.sort(arr, function(err, act) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected equal sorted arrays');
			test.done();
		});
	},
	testLargeArray: function(test) {
		var arr = [],
			exp,
			i;

		for(i=0; i<100000; i++) {
			arr[i] = Math.floor(Math.random() * 1000);
		}

		exp = arr.slice().sort();
		p.sort(arr, function(err, act) {
			test.ifError(err);
			test.ok(arrays_equal(act, exp), 'Expected equal sorted arrays');
			test.done();
		});
	}
};

//Finaly call destroy to free resources
exports.finalize = function (test) {
	p.destroy();
	test.done();
};

