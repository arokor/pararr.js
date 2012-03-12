#Pararr.js - Parallel computing for Node

Modern multicore systems can process lots of data in parallel but writing parallel code can be tricky. Pararr.js provides an easy-to-use API for parallel computing in Node and parallel implementations of standard array functions like *map* or *filter* that utilize all available cores in the system when calculating their result.

##Installation
	npm install pararr

##Usage
    var p = require('pararr'),
    
        arr = [1,2,3,4,5,6,7,8,9,10],
    	
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
    
    	
    // Parallel filter
    p.filter(arr, isPrime, function(err, res) {
        console.log('Parallel filter returned: ' + res);
        
        p.destroy(); //Cleanup
    });	

Outputs:

    Parallel filter returned: 1,2,3,5,7
    
See *benchmark.js* for more examples

##Demo / Benchmark
To run demo:

    node demo.js
    
To run benchmark:

    node benchmark.js

##API
* [init](#init)
* [exec](#exec)
* [parallel](#parallel)
* [map](#map)
* [filter](#filter)
* [destroy](#destroy)

##Considerations
Pararr creates a V8 instance for each CPU core which has an effect memory consumption and startup time. When a calculation is dispatched to a worker the function and its data is copied and sent to the corresponding instance which causes an shorter or longer delay depending mainly on the data volume. Generally speaking we can benefit from parallelization in this form when data volumes are small and CPU cycles is a bottleneck.

For array functions such as *map* or *filter* the partitioning of the input data and transporting it to the workers takes time (O(n)), so if the iterator function is fast (O(1)) parallelization won't have a positive effect on performance. However, if the iterator function is slow we can benefit greatly from parallel processing. See *benchmark.js* for examples of good and bad use cases.

##Functions

<a name="init"/>
### init()

Initializes Pararr. If this function isn't called, Pararr will be initialized lazily

---------------------------------------

<a name="exec"/>
### exec( func(par), par, callback(err, result) )
  
Execute function func with parameter par when a CPU becomes free and return the result in callback.

__Arguments__

    func     {Function} Function to be executed
    par      {Object|Number|String} parameter with which func will be called
    callback {Function} Callback called when finished.

---------------------------------------

<a name="parallel"/>
### parallel( funcs, callback(result) )
  
Execute a number of functions in parallel. When all functions have returned callback returns an array containing the results.

__Arguments__

    funcs    {Array} Array of functions to be executed. Each elements is an object containing a function *func* and a parameter *par*
    callback {Function} Callback called when finished. Results are returned in form of an array with the same indexing as funcs.

---------------------------------------

<a name="map"/>
### map( arr, iter(a), callback(err, result) )
  
Apply a function to each element in an array

__Arguments__

    arr      {Array} input array
    iter     {Function} Iterator function (Must be a pure function)
    callback {Function} Callback called when finished.

---------------------------------------

<a name="filter"/>
### filter( arr, iter(a), callback(err, result) )
  
Filter an an array

__Arguments__

    arr      {Array} input array
    iter     {Function} Filter function that returns true or false (Must be a pure function)
    callback {Function} Callback called when finished.

---------------------------------------

<a name="destroy"/>
### destroy()
  
Free all resources (kill workers)

---------------------------------------

##Tests
Run tests with nodeunit:

     nodeunit test
     
##License 
(MIT License)

Copyright (c) 2012 Aron Kornhall

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

