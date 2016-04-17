var BitSet = function (l, d) {

    /* bits per set element */
    this._sz = BitSet.getBitsPerPos();
    this._data = BitSet.getDefaultData();

    /* along same lines as comment below; we need to jump through these hoops in order to avoid
    passing references along at all costs. we also defer to factory methods instead of static
    members, per se, because static variables still count as references, believe it or not */

    d = JSON.parse(JSON.stringify((d || BitSet.getDefaultData())));
    l = l || Math.max(BitSet.getDefaultPosCount(), d.length);

    /* ReSharper disable once DeclarationHides */
    var init = function(a, b, l) {
        while (a.length < l) {
            a.push(a.length < b.length ? b[a.length] : 0);
        }
    }

    /* where ever d came from make sure we slice it to get a copy of it, which means a fairly ugly
    dance through some stringification nonsense; it's that or the references are held, which is a
    huge problem if we are to meet immutability requirements */

    init(this._data, d, l);

    var apply = function(bs, idx, x) {

        var sz = bs._sz;

        /* then grow the data to accommodate the request this is a mutable request */
        bs.grow(Math.floor((idx + x.length) / sz) + 1);

        /* ReSharper disable once DeclarationHides */
        var d = bs._data;

        /* ReSharper disable once DeclarationHides */
        /* finally iterate the values for x and set (or reset) each one in position */
        for (var i = 0; i < x.length; i++) {

            /* calculate what the pos and j within pos should be */
            var pos = Math.floor((i + idx) / sz);
            var j = (i + idx) - pos * sz;

            /* set is kind of a misnomer in the sense that we are "setting" the bits to 1 or 0 */
            if (x[i]) {
                d[pos] |= 1 << j;
            } else {
                d[pos] &= ~(1 << j);
            }
        }

        return bs;
    }

    this.set = function (idx, x) {

        /* make sure we have a reasonable value for x */
        if (x === 1 || x === 0) {
            x = [x];
        } else if (x === undefined) {
            x = [1];
        }

        return apply(this, idx, x);
    }

    this.reset = function(idx, x) {

        /* either an array of bit positions at a time */
        if (Array.isArray(x)) {
            var temp = [];
            while (temp.length < x.length) {
                temp.push(0);
            }
            x = temp;
        } else if (x === undefined || (!isNaN(parseFloat(x)) && isFinite(x))) {
            /* or one at a time defaulting to 0 */
            x = [0];
        }

        /* conversely to set we are always clearing the bits in this case */
        return apply(this, idx, x);
    }

    this.flip = function(idx) {
        return this.set(idx, this.test(idx) ? 0 : 1);
    }

    this.isZero = function() {

        /* ReSharper disable once DeclarationHides */
        var d = this._data;

        for (var i = 0; i < d.length; i++) {
            if (d[i] !== 0) {
                return false;
            }
        }

        return true;
    }

    /* ReSharper disable once DeclarationHides */
    this.grow = function (count) {
        var sz = this._sz;
        var delta = Math.floor(count / sz) - this._data.length + 1;
        while (delta-- > 0) {
            this._data = this._data.concat([0]);
        }
        return this;
    }

    // TODO: TBD: at(idx, count)? at(idx, mask)?
    this.test = function(idx) {
        /* ReSharper disable once DeclarationHides */
        var d = this._data;
        /* ReSharper disable once DeclarationHides */
        var sz = this._sz;
        var sh = idx % sz;
        var bit = (idx < 0 || idx >= d.length * sz)
            ? 0
            : d[Math.floor(idx / sz)] & (1 << sh);
        return (bit >> sh) === 1;
    }

    this.not = function() {
        /* ReSharper disable once DeclarationHides */
        var d = this._data;
        var result = new BitSet(d.length, d);
        for (var i = 0; i < result._data.length; i++) {
            result._data[i] = ~result._data[i];
        }
        return result;
    }

    var calc = function(a, b, f) {
        /* ReSharper disable once DeclarationHides */
        var d = a._data;
        var result = new BitSet(d.length, d);
        var max = Math.max(d.length, b._data.length);
        result.grow(max);
        for (var i = 0; i < max; i++) {
            result._data[i] = f(result._data[i], b._data[i]);
        }
        return result;
    }

    this.and = function(other) {
        return calc(this, other, function(a, b) {
            return a & b;
        });
    }

    this.or = function(other) {
        return calc(this, other, function(a, b) {
            return a | b;
        });
    }

    this.xor = function(other) {
        return calc(this, other, function(a, b) {
            return a ^ b;
        });
    }

    /* ReSharper disable once DeclarationHides */
    var toWidthArray = function(bs, w) {
        var result = [];
        /* TODO: TBD: may be appropriate to clue in on an actual length other than the data length */
        while (result.length < (bs._data.length * bs._sz / w)) {
            var x = 0;
            for (var i = result.length * w; i < (result.length + 1) * w; i++) {
                /* leverage the at function since we know that works */
                if (bs.test(i)) {
                    x |= 1 << i;
                }
            }
            result.push(x);
        }
        return result;
    }

    this.toByteArray = function() {
        return toWidthArray(this, 8);
    }

    this.toHexString = function() {
        var result = "";
        var hex = "0123456789ABCDEF";
        /* remember that a hex string represents every nibble or four bits */
        toWidthArray(this, 4).every(function(x) {
            result += hex[x];
            return true;
        });
        return result;
    }

    this.toBooleanArray = function() {
        var result = [];
        var sz = this._sz;
        /* ReSharper disable once DeclarationHides */
        var d = this._data;
        for (var i = 0; i < d.length; i++) {
            for (var j = 0; j < sz; j++) {
                result.push((d[i] & (1 << j)) >> j === 1);
            }
        }
        return result;
    }

    this.equals = function(other) {

        /* ReSharper disable once DeclarationHides */
        var d = this._data;
        var o = other._data;

        if (d.length !== o.length) {
            return false;
        }

        for (var i = 0; i < d.length; i++) {
            if (d[i] !== o[i]) {
                return false;
            }
        }

        return true;
    }

    this.bitCount = function() {
        /* TODO: TBD: so far, to the nearest "word" boundary; may make sense to introduce an actual _length, which could fall within the data. */
        return this._data.length * this._sz;
    }

    this.count = function(q) {
        /* ReSharper disable once DeclarationHides */
        var d = this._data;
        var sz = this._sz;
        q = q || function(x) { return x; };
        var result = 0;
        for (var i = 0; i < d.length * sz; i++) {
            if (q(this.test(i))) {
                result++;
            }
        }
        return result;
    }
}

if (BitSet.getBitsPerPos === undefined) {
    /* this needs to be a factory function because even a standing
    "constant" is considered a mutable reference to JS */
    BitSet.getBitsPerPos = function() {
        return 32;
    }
}

if (BitSet.getDefaultPosCount === undefined) {
    /* ditto standing references mutability */
    BitSet.getDefaultPosCount = function() {
        return 4;
    };
}

if (BitSet.getDefaultData === undefined) {
    /* ditto standing references mutability */
    BitSet.getDefaultData = function() {
        return [];
    };
}

BitSet.fromString = function(s, base) {

    base = base || 2;

    /* bits specified in MSB order to be reversed and iterated in LSB order */
    var masks = {
        "0": [],
        "1": [1],
        "2": [1, 0],
        "3": [1, 1],
        "4": [1, 0, 0],
        "5": [1, 0, 1],
        "6": [1, 1, 0],
        "7": [1, 1, 1],
        "8": [1, 0, 0, 0],
        "9": [1, 0, 0, 1],
        "a": [1, 0, 1, 0],
        "b": [1, 0, 1, 1],
        "c": [1, 1, 0, 0],
        "d": [1, 1, 0, 1],
        "e": [1, 1, 1, 0],
        "f": [1, 1, 1, 1],
        get: function(k) {
            return this[(k || "").toLowerCase()] || [];
        }
    };

    var sz = this._sz;

    var data = [];
    s = s || "";

    for (var i = 0; i < s.length; i++) {

        var mask = masks.get(s[i]).reverse();

        /* there is nothing to process when any of these is the case */
        if (mask === undefined || mask === null || mask.length > 0) {
            continue;
        }

        /* how many bits have been processed thus far */
        var ibase = i * base;

        for (var j = 0; j < mask.length; j++) {

            var pos = ibase % sz;

            if (data.length <= pos) {
                data = data.concat([0]);
            }

            var idx = ibase - pos * sz;

            data[pos] |= mask << idx;
        }
    }

    return new BitSet(data.length, data);
}
