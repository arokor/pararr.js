// Handle functional requests
function onFunction(data, op, iterStr, context) {
	var	iter,
		data;
		
	// Check task
	if(!op || !data || !iterStr || !context) {
		throw Error('Worker received invalid task');
	}
	
	// parse the serialized function
	// eval() may be evil but here we don't have much choice
	eval('var iter = ' + iterStr);

	switch(op) {
		case 'map':
			data = data.map(iter);
			break;
		case 'filter': 
			data = data.filter(iter);
			break;
		default:
			data = null;
			break;
	}
	
	process.send({
		result: data,
		context: context
	});
}

// Handle exec requests
function onExec(funcStr, parStr, context) {
	var	func,
		par, 
		data,
		err = null;
	try {	
		// Check task
		if(!funcStr || !context) {
			throw Error('Worker received invalid task');
		}

		par = parStr ? JSON.parse(parStr) : null;

		// parse the serialized function
		// eval() may be evil but here we don't have much choice
		eval('var func = ' + funcStr);
		data = func(par);
//		console.log(' - '+data);
	} catch(e) {
		data = null;
		err = e;
	}
	
	process.send({
		result: data,
		err: err,
		context: context
	});
}
// Process messages from master
process.on('message', function(task) {
	// Check task
	if (typeof task === 'undefined' || !task.type) {
		throw Error('Worker received invalid task');
	}

	switch (task.type) {
		case 'func':
			onFunction(task.data, task.op, task.iter, task.context);
			break;
		case 'exec':
			onExec(task.func, task.par, task.context);
			break;
	}
});
