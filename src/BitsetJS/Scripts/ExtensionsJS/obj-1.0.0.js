if (Object.prototype.reduceArgs === undefined) {
    /* ReSharper disable once NativeTypePrototypeExtending */
    Object.prototype.reduceArgs = function(callback, initialValue) {
        /* handle a couple of concerns consistent with Array.prototype.reduce.
        http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce */
        if (this.length === 0 && initialValue === undefined) {
            throw TypeError;
        }
        if (this.length === 1 && initialValue === undefined) {
            return callback(this[0]);
        }
        if (initialValue !== undefined && this.length === 0) {
            return initialValue;
        }
        var result = initialValue || [];
        for (var i = 0; i < this.length; i++) {
            result = callback(result, this[i], i, this);
        }
        return result;
    }
}

if (Object.prototype.reduceArgsRight === undefined) {
    /* ReSharper disable once NativeTypePrototypeExtending */
    Object.prototype.reduceArgsRight = function(callback, initialValue) {
        /* handle a couple of concerns consistent with Array.prototype.reduceRight:
        http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight */
        if (this.length === 0 && initialValue === undefined) {
            throw TypeError;
        }
        if (this.length === 1 && initialValue === undefined) {
            return callback(this[0]);
        }
        if (initialValue !== undefined && this.length === 0) {
            return initialValue;
        }
        var result = initialValue || [];
        /* same as for reduceArgs, from the right-to-left: */
        for (var i = this.length - 1; i >= 0; i--) {
            result = callback(result, this[i], i, this);
        }
        return result;
    }
}
