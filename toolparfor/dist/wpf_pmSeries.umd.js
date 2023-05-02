/*!
 * wpf_pmSeries v1.6.18
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!(function(t, r) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = r() : typeof define === 'function' && define.amd ? define(r) : (t = typeof globalThis !== 'undefined' ? globalThis : t || self).wpf_pmSeries = r()
}(this, function() {
    'use strict'; let t = function(t, r, e) {
        let n = -1; let o = t.length; r < 0 && (r = -r > o ? 0 : o + r), (e = e > o ? o : e) < 0 && (e += o), o = r > e ? 0 : e - r >>> 0, r >>>= 0; for (var u = Array(o); ++n < o;)u[n] = t[n + r]; return u
    }; let r = /\s/; let e = function(t) {
        for (var e = t.length; e-- && r.test(t.charAt(e)););return e
    }; let n = /^\s+/; let o = function(t) {
        return t ? t.slice(0, e(t) + 1).replace(n, '') : t
    }; function u(t) {
        return (u = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
            ? function(t) {
                return typeof t
            }
            : function(t) {
                return t && typeof Symbol === 'function' && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : typeof t
            })(t)
    } let c = function(t) {
        let r = u(t); return t != null && (r == 'object' || r == 'function')
    }; let i = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}; function f(t) {
        let r = { exports: {} }; return t(r, r.exports), r.exports
    } let a = u(i) == 'object' && i && i.Object === Object && i; let l = (typeof self === 'undefined' ? 'undefined' : u(self)) == 'object' && self && self.Object === Object && self; let b = a || l || Function('return this')(); let v = b.Symbol; let y = Object.prototype; let p = y.hasOwnProperty; let s = y.toString; let j = v ? v.toStringTag : void 0; let d = function(t) {
        let r = p.call(t, j); let e = t[j]; try {
            t[j] = void 0; var n = !0
        }
        catch (t) {} let o = s.call(t); return n && (r ? t[j] = e : delete t[j]), o
    }; let g = Object.prototype.toString; let h = function(t) {
        return g.call(t)
    }; let O = v ? v.toStringTag : void 0; let m = function(t) {
        return t == null ? void 0 === t ? '[object Undefined]' : '[object Null]' : O && O in Object(t) ? d(t) : h(t)
    }; let A = function(t) {
        return t != null && u(t) == 'object'
    }; let S = function(t) {
        return u(t) == 'symbol' || A(t) && m(t) == '[object Symbol]'
    }; let x = /^[-+]0x[0-9a-f]+$/i; let w = /^0b[01]+$/i; let T = /^0o[0-7]+$/i; let F = parseInt; let P = function(t) {
        if (typeof t === 'number') return t; if (S(t)) return NaN; if (c(t)) {
            let r = typeof t.valueOf === 'function' ? t.valueOf() : t; t = c(r) ? r + '' : r
        } if (typeof t !== 'string') return t === 0 ? t : +t; t = o(t); let e = w.test(t); return e || T.test(t) ? F(t.slice(2), e ? 2 : 8) : x.test(t) ? NaN : +t
    }; let N = 1 / 0; let k = function(t) {
        return t ? (t = P(t)) === N || t === -1 / 0 ? 17976931348623157e292 * (t < 0 ? -1 : 1) : t == t ? t : 0 : t === 0 ? t : 0
    }; let I = function(t) {
        let r = k(t); let e = r % 1; return r == r ? e ? r - e : r : 0
    }; let U = function(r, e, n) {
        let o = r == null ? 0 : r.length; return o ? (e = n || void 0 === e ? 1 : I(e), t(r, e < 0 ? 0 : e, o)) : []
    }; let B = function(t, r) {
        for (let e = -1, n = t == null ? 0 : t.length; ++e < n && !1 !== r(t[e], e, t););return t
    }; let $ = (function(t) {
        return function(r, e, n) {
            for (let o = -1, u = Object(r), c = n(r), i = c.length; i--;) {
                let f = c[t ? i : ++o]; if (!1 === e(u[f], f, u)) break
            } return r
        }
    }()); let E = function(t, r) {
        for (var e = -1, n = Array(t); ++e < t;)n[e] = r(e); return n
    }; let q = function(t) {
        return A(t) && m(t) == '[object Arguments]'
    }; let D = Object.prototype; let M = D.hasOwnProperty; let C = D.propertyIsEnumerable; let G = q(function() {
        return arguments
    }())
        ? q
        : function(t) {
            return A(t) && M.call(t, 'callee') && !C.call(t, 'callee')
        }; let L = Array.isArray; let R = function() {
        return !1
    }; let V = f(function(t, r) {
        let e = r && !r.nodeType && r; let n = e && t && !t.nodeType && t; let o = n && n.exports === e ? b.Buffer : void 0; let u = (o ? o.isBuffer : void 0) || R; t.exports = u
    }); let W = /^(?:0|[1-9]\d*)$/; let _ = function(t, r) {
        let e = u(t); return !!(r = r == null ? 9007199254740991 : r) && (e == 'number' || e != 'symbol' && W.test(t)) && t > -1 && t % 1 == 0 && t < r
    }; let z = function(t) {
        return typeof t === 'number' && t > -1 && t % 1 == 0 && t <= 9007199254740991
    }; let H = {}; H['[object Float32Array]'] = H['[object Float64Array]'] = H['[object Int8Array]'] = H['[object Int16Array]'] = H['[object Int32Array]'] = H['[object Uint8Array]'] = H['[object Uint8ClampedArray]'] = H['[object Uint16Array]'] = H['[object Uint32Array]'] = !0, H['[object Arguments]'] = H['[object Array]'] = H['[object ArrayBuffer]'] = H['[object Boolean]'] = H['[object DataView]'] = H['[object Date]'] = H['[object Error]'] = H['[object Function]'] = H['[object Map]'] = H['[object Number]'] = H['[object Object]'] = H['[object RegExp]'] = H['[object Set]'] = H['[object String]'] = H['[object WeakMap]'] = !1; let J = function(t) {
        return A(t) && z(t.length) && !!H[m(t)]
    }; let K = function(t) {
        return function(r) {
            return t(r)
        }
    }; let Q = f(function(t, r) {
        let e = r && !r.nodeType && r; let n = e && t && !t.nodeType && t; let o = n && n.exports === e && a.process; let u = (function() {
            try {
                let t = n && n.require && n.require('util').types; return t || o && o.binding && o.binding('util')
            }
            catch (t) {}
        }()); t.exports = u
    }); let X = Q && Q.isTypedArray; let Y = X ? K(X) : J; let Z = Object.prototype.hasOwnProperty; let tt = function(t, r) {
        let e = L(t); let n = !e && G(t); let o = !e && !n && V(t); let u = !e && !n && !o && Y(t); let c = e || n || o || u; let i = c ? E(t.length, String) : []; let f = i.length; for (let a in t)!r && !Z.call(t, a) || c && (a == 'length' || o && (a == 'offset' || a == 'parent') || u && (a == 'buffer' || a == 'byteLength' || a == 'byteOffset') || _(a, f)) || i.push(a); return i
    }; let rt = Object.prototype; let et = function(t) {
        let r = t && t.constructor; return t === (typeof r === 'function' && r.prototype || rt)
    }; let nt = (function(t, r) {
        return function(e) {
            return t(r(e))
        }
    }(Object.keys, Object)); let ot = Object.prototype.hasOwnProperty; let ut = function(t) {
        if (!et(t)) return nt(t); let r = []; for (let e in Object(t))ot.call(t, e) && e != 'constructor' && r.push(e); return r
    }; let ct = function(t) {
        if (!c(t)) return !1; let r = m(t); return r == '[object Function]' || r == '[object GeneratorFunction]' || r == '[object AsyncFunction]' || r == '[object Proxy]'
    }; let it = function(t) {
        return t != null && z(t.length) && !ct(t)
    }; let ft = function(t) {
        return it(t) ? tt(t) : ut(t)
    }; let at = (function(t, r) {
        return function(e, n) {
            if (e == null) return e; if (!it(e)) return t(e, n); for (let o = e.length, u = r ? o : -1, c = Object(e); (r ? u-- : ++u < o) && !1 !== n(c[u], u, c););return e
        }
    }(function(t, r) {
        return t && $(t, r, ft)
    })); let lt = function(t) {
        return t
    }; let bt = function(t) {
        return typeof t === 'function' ? t : lt
    }; let vt = function(t, r) {
        return (L(t) ? B : at)(t, bt(r))
    }; function yt(t) {
        return Object.prototype.toString.call(t) === '[object Object]'
    } function pt(t) {
        let r = Object.prototype.toString.call(t); return r === '[object Function]' || r === '[object AsyncFunction]'
    } return function(t, r) {
        let e; let n; let o; let u; let c = ((o = new Promise(function() {
            e = arguments[0], n = arguments[1]
        })).resolve = e, o.reject = n, o); if (u = t, Object.prototype.toString.call(u) !== '[object Array]' && !yt(t)) return c.reject('rs is not an array or object'), c; let i = !1; if (yt(t)) {
            i = !0; let f = []; vt(t, function(t, r) {
                f.push({ k: r, v: t })
            }), t = f
        }pt(r) || (r = function(t) {
            return t
        }); let a = -1; let l = []; return t.reduce(function(t, e) {
            return t.then(function(t) {
                l.push(t); let n = a += 1; let o = e; return i && (n = e.k, o = e.v), pt(r) ? r(o, n) : o
            })
        }, Promise.resolve()).then(function(t) {
            l.push(t), l = U(l), c.resolve(l)
        }).catch(function(t) {
            c.reject(t)
        }), c
    }
}))
