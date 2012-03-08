// Pararr.js v0.2
// Parallel computing API and array functions for Node.js 
// (c) 2012 Aron Kornhall
// Pararr is freely distributable under the MIT license.

var cp = require('child_process'),
	numCPUs = require('os').cpus().length,
	
	FUNC_OPS = ['map', 'filter'], //Supported operations
	
	workers,
	workerJobCount = [],
	jobs = [],
	jobID = 0,

	// Ring buffer
	buffer = (function() {
		var BUF_SIZE = 1000,
			buffer = [],
			begin = 0,
			end = -1;

		// Initialize buffer
		function initBuffer() {
			buffer = [];
			begin = 0;
			end = -1;
		}

		// Add item to buffer
		function add(item) {
			var newEnd = (end + 1) % BUF_SIZE;

			if(end >= 0 && newEnd === begin) {
				throw Error('Buffer overflow: Buffer exceeded max size: ' + BUF_SIZE);
			}
			
			buffer[newEnd] = item;
			end = newEnd;
		}

		// Get next item from buffer
		function next() {
			var next;

			if (end < 0) { // Buffer is empty
				return null;
			}

			next = buffer[begin];
			delete buffer[begin];
			
			if (begin === end) { // Last element
				initBuffer();	
			} else {
				begin = (begin + 1) % BUF_SIZE;
			}
			return next;
		}

		function isEmpty() {
			return end === -1;
		}

		initBuffer();

		// Public interface
		return {
			add : add,
			next : next,
			isEmpty : isEmpty,
			clear : initBuffer
		};
	})();

// Execute work item on workers
function workerExec(workerIdx, workItem) {
	//console.log('---'+ workerIdx);
	workers[workerIdx].send(workItem);
	workerJobCount[workerIdx]++;
}

// Dispatch work items on free workers
function dispatchWorkItems() {
	var i,
		workItem;

	if (!buffer.isEmpty()) {
		i = workerJobCount.indexOf(0);
		if(i >= 0) { //Free worker found
			workItem = buffer.next();

			// Send task to worker
			workerExec(i, workItem);

			//Check for more free workers
			dispatchWorkItems();
		}
	}
}

// Initialize
function init() {
	var i,
		worker;
		
	if(!workers) {
		workers = [];
		
		// Fork a worker for each CPU core
		for (i = 0; i < numCPUs; i++) {
			worker = cp.fork(__dirname + '/paworker.js');
			worker.on('message', (function(workerIdx) {
				return function(m) {
					handleMessage(m, workerIdx);
				}
			})(i));
			//TODO: Error handling
			workers.push(worker);
			workerJobCount.push(0);
		}
	}
}

// Handles results from parallel array operations
function handleArrayResult(m, workerIdx) {
	var job = jobs[m.context.jobID],
		partition = m.context.partition,
		subResult = m.result,
		result = [],
		i;
	
	job.result[partition] = subResult;

	// Increase callback count.
	job.cbCount++;
	
	// When all workers are finished return result
	if(job.cbCount === workers.length) {
		for (i = 0; i < job.result.length; i++) {
			result = result.concat(job.result[i]);
		};
		
		job.cb(null, result);
	}

	// Worker is finished.
	workerJobCount[workerIdx]--;
	dispatchWorkItems();
}

// Handles results from parallel function execution
function handleExecResult(m, workerIdx) {
	var job = jobs[m.context.jobID];
		
	job.cb(m.err, m.result);

	// Worker is finished.
	workerJobCount[workerIdx]--;
	dispatchWorkItems();
}

// Handles messages from the workers
function handleMessage(m, workerIdx) {
	var job = jobs[m.context.jobID];

	switch(job.type) {
		case 'func':
			handleArrayResult(m, workerIdx);
			break;
		case 'exec':
			handleExecResult(m, workerIdx);
			break;
		default:
			throw Error('Invalid job type: ' + job.type);
	}
}

// Check whether op is a valid operation
function isValidOP(op) {
	return FUNC_OPS.some(function(elem) {
		return elem === op;
	});
}

// Execute an array operation in parallel
function executeParallel(op, arr, iter, cb) {
	var chunkSize = Math.floor(arr.length / numCPUs),
		worker,
		iterStr,
		task,
		offset,
		i;
	
	// Lazy initialization
	init();
	
	// Check params
	if (!cb) {
		throw Error('Expected callback');
	}	
    if (arr == null) {
		cb(null, []);
		return;
	}
	if (!Array.isArray(arr)) {
		cb(Error('Expected array'));
		return;
	}
	if (typeof iter !== 'function') {
		cb(Error('Expected iterator function'));
		return;
	}
	if (!isValidOP(op)) {
		cb(Error('Expected valid operation but got ' + op));
		return;
	}
	
	
	iterStr = iter.toString(); //Serialize iter
	
	for (i = 0; i < workers.length; i++) {
		worker = workers[i];
		offset = chunkSize * i;

		task = {
			type: 'func',
			op: op,
			data: (i === workers.length - 1 ? arr.slice(offset) : arr.slice(offset, offset + chunkSize)), // Partition arr
			iter: iterStr,
			context: {
				partition: i,
				jobID: jobID
			}
		};
		
		// Send task to worker
		// worker.send(task);
		buffer.add(task);
	}
	dispatchWorkItems();	

	// Store job
	jobs[jobID] = {
		type: 'func',
		result: [],
		cbCount: 0,
		cb: cb
	};
	
	// Increase jobID
	jobID++;
};


exports.filter = function(arr, iter, cb) {
	executeParallel('filter', arr, iter, cb);
};

// Parallel Map implementation
// iter must be a pure function
exports.map = function(arr, iter, cb) {
	executeParallel('map', arr, iter, cb);
};

// Execute a syncronous function in one of the CPUs as soon as it becomes available
// cb is called when the func returns and func must be a pure function. par is the
// parameter of the function call
exports.exec = function(func, par, cb) {
	var	funcStr,
		parStr,
		task;

	if (!cb) {
		cb = par;	
		par = null;
	}
	if (typeof func !== 'function') {
		return cb(Error('Invalid function'));
	}
	if (typeof par === 'function') {
		return cb(Error('par can not be a function'));
	}
	if (typeof cb !== 'function') {
		throw Error('Invalid callback');
	}
	
	funcStr = func.toString(); //Serialize function
	parStr = JSON.stringify(par); //Serialize parameters

	task = {
		type: 'exec',
		func: funcStr,
		par: parStr,
		context: {
			jobID: jobID
		}
	};

	// Add task to buffer
	buffer.add(task);

	// Start processing
	dispatchWorkItems();	

	// Store job
	jobs[jobID] = {
		type: 'exec',
		result: null,
		cb: cb
	};
	
	// Increase jobID
	jobID++;
};

// Execute functions funcs in parallel. When all functions have returned 
// cb is called with an array containing the results.
exports.parallel = function(funcs, cb) {
	var funcCount = funcs.length,
		returnCount = 0;
		results = [],
		that = this;

	funcs.forEach(function(func, i) {
		that.exec(func.func, func.par, (function(idx) {
			return function(err, res) {
				results[idx] = res;
				returnCount++;
				if(returnCount === funcCount) {
					cb(results);
				}
			}
		})(i));
	});
};

// Free allocated resources
exports.destroy = function() {
	var i;
	for (i = 0; i < workers.length; i++) {
		workers[i].kill();
	}
	workers = undefined;
	workerJobCount = [];
	jobs = [];
	jobID = 0;
};

// Explicitly initialize pararr (delazify)
exports.init = init;	//Initialize



















