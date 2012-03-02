#Pararr.js - Parallel array operations for Node

Modern multicore systems can process lots of data in parallel but writing parallel code can be tricky. Pararr.js provides parallel implementations of standard array functions like *map* or *filter* that utilize all cores in the system to calculate their result.

##Usage
    var p = require('./lib/pararr'),
    
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
    
##Demo / Benchmark
To run demo:

    node demo.js
    
To run benchmark:

    node benchmark.js

##API
* [init](#init)
* [map](#map)
* [filter](#filter)
* [destroy](#destroy)

##Considerations
Pararr creates a V8 instance for each CPU core. This effects memory consumption and startup time.

Partitioning the input data and transporting it to the workers takes time (O(n)), so if the iterator function is fast (O(1)) parallelization won't have a positive effect on performance. However, if the iterator function is slow we can benefit greatly from parallel processing. See *benchmark.js* for examples of good and bad use cases.

##Functions

<a name="init"/>
### init()

Initializes Pararr. If this function isn't called, Pararr will be initialized lazily

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
### map( arr, iter(a), callback(err, result) )
  
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

