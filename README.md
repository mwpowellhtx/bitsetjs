# BitSetJS

This is not the first BitSet implementation for JavaScript. I doubt it will be the last. I set out not wanting to take on another external dependency, so to speak, and have found it interesting, if a bit tricky to come up with a working functional BitSet for JavaScript.

## Design Goals

My design goals starting out are to provide an analog for concepts such as:

* .NET Framework [System.Collections.BitArray](http://msdn.microsoft.com/en-us/library/system.collections.bitarray.aspx)
* C++ [std::bitset](http://www.cplusplus.com/reference/bitset/bitset/)
* [boost::dynamic_bitset](http://www.boost.org/doc/libs/1_60_0/libs/dynamic_bitset/dynamic_bitset.html)

I also wanted for a BitSet to exhibit immutable characteristics, especially when operations among two or more instances were concerned. These should return a new instance with the expected result based on the two or more operands.

I may accomplish feature parity, but for the moment this is a good start, and will continue to work on it until I am satisfied. Contributors are always welcome as well if you find it useful.

I believe I accomplished immutability but with a couple of interesting language runtime limitations. Specifically having to do with the fact that in JavaScript everything is held as a reference. I mean, ***everyting***.

* So for things like default values, I must use factory methods and return the interesting details.
* Also, any data or lengths and such contributing to new instances must be serialized and deserialized via [JSON.stringify](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) followed by [JSON.parse](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse). Not the most graceful solution, but probably the best we can do.
* I also avoided using [Int32Array](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array), per se, in favor of JSON [arrays](http://www.w3schools.com/json/json_syntax.asp). These are simple enough and are easy to construct and work with.

## Features

## Test Cases

Feel free to have a look at the [test cases](http://github.com/mwpowellhtx/bitsetjs/blob/master/src/BitsetJS/TestFixture.html) for examples on how to work with the BitSet.

## Performance Implications

I have not tested for performance yet, but I imagine the reference limitations are a big one that will make things interesting.
