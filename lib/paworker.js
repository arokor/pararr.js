process.on('message', function(task) {
	var data,
		iter;
		
	// Check task
	if(typeof task === 'undefined' || !task.op || !task.data || !task.iter || !task.context) {
		throw Error('Worker received invalid task');
	}
	
	data = task.data;
	// parse the serialized function
	// eval() may be evil but here we don't have much choice
	eval('var iter = ' + task.iter);
	
	switch(task.op) {
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
		context: task.context
	});
});