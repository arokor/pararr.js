// Pararr.js v0.1
// Parallel implementations for Node.js of some standard array functions
// (c) 2012 Aron Kornhall
// Pararr is freely distributable under the MIT license.

var cp = require('child_process'),
	numCPUs = require('os').cpus().length,
	
	OPS = ['map', 'filter'], //Supported operations
	
	workers,
	jobs = [],
	jobID = 0;

// Initialize
function init() {
	var i,
		worker;
		
	if(!workers) {
		workers = [];
		
		// Fork a worker for each CPU core
		for (i = 0; i < numCPUs; i++) {
			worker = cp.fork(__dirname + '/paworker.js');
			worker.on('message', handleMessage);
			//TODO: Error handling
			workers.push(worker);
		}
	}
}

// Handles messages from the workers
function handleMessage(m) {
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
}

// Check whether op is a valid operation
function isValidOP(op) {
	return OPS.some(function(elem) {
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
			op: op,
			data: (i === workers.length - 1 ? arr.slice(offset) : arr.slice(offset, offset + chunkSize)), // Partition arr
			iter: iterStr,
			context: {
				partition: i,
				jobID: jobID
			}
		};
		
		// Send task to worker
		worker.send(task);
	}
	
	// Store job
	jobs[jobID] = {
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


// Free allocated resources
exports.destroy = function() {
	var i;
	for (i = 0; i < workers.length; i++) {
		workers[i].kill();
	}
	workers = undefined;
	jobs = [];
	jobID = 0;
};

// Explicitly initialize pararr (delazify)
exports.init = init;	//Initialize



















