/*!
 * wpf v1.6.18
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!(function(t, e) {
    typeof exports === 'object' && typeof module !== 'undefined' ? e(exports) : typeof define === 'function' && define.amd ? define(['exports'], e) : e((t = typeof globalThis !== 'undefined' ? globalThis : t || self).wpf = {})
}(this, function(t) {
    'use strict'; let e = function(t, e) {
        for (let n = -1, r = t == null ? 0 : t.length; ++n < r && !1 !== e(t[n], n, t););return t
    }; let n = (function(t) {
        return function(e, n, r) {
            for (let o = -1, u = Object(e), c = r(e), i = c.length; i--;) {
                let f = c[t ? i : ++o]; if (!1 === n(u[f], f, u)) break
            } return e
        }
    }()); let r = function(t, e) {
        for (var n = -1, r = Array(t); ++n < t;)r[n] = e(n); return r
    }; function o(t) {
        return (o = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
            ? function(t) {
                return typeof t
            }
            : function(t) {
                return t && typeof Symbol === 'function' && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : typeof t
            })(t)
    } let u = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}; function c(t) {
        let e = { exports: {} }; return t(e, e.exports), e.exports
    } let i = o(u) == 'object' && u && u.Object === Object && u; let f = (typeof self === 'undefined' ? 'undefined' : o(self)) == 'object' && self && self.Object === Object && self; let a = i || f || Function('return this')(); let l = a.Symbol; let s = Object.prototype; let v = s.hasOwnProperty; let p = s.toString; let b = l ? l.toStringTag : void 0; let y = function(t) {
        let e = v.call(t, b); let n = t[b]; try {
            t[b] = void 0; var r = !0
        }
        catch (t) {} let o = p.call(t); return r && (e ? t[b] = n : delete t[b]), o
    }; let j = Object.prototype.toString; let h = function(t) {
        return j.call(t)
    }; let d = l ? l.toStringTag : void 0; let g = function(t) {
        return t == null ? void 0 === t ? '[object Undefined]' : '[object Null]' : d && d in Object(t) ? y(t) : h(t)
    }; let O = function(t) {
        return t != null && o(t) == 'object'
    }; let m = function(t) {
        return O(t) && g(t) == '[object Arguments]'
    }; let w = Object.prototype; let _ = w.hasOwnProperty; let x = w.propertyIsEnumerable; let S = m(function() {
        return arguments
    }())
        ? m
        : function(t) {
            return O(t) && _.call(t, 'callee') && !x.call(t, 'callee')
        }; let A = Array.isArray; let k = function() {
        return !1
    }; let P = c(function(t, e) {
        let n = e && !e.nodeType && e; let r = n && t && !t.nodeType && t; let o = r && r.exports === n ? a.Buffer : void 0; let u = (o ? o.isBuffer : void 0) || k; t.exports = u
    }); let T = /^(?:0|[1-9]\d*)$/; let F = function(t, e) {
        let n = o(t); return !!(e = e == null ? 9007199254740991 : e) && (n == 'number' || n != 'symbol' && T.test(t)) && t > -1 && t % 1 == 0 && t < e
    }; let N = function(t) {
        return typeof t === 'number' && t > -1 && t % 1 == 0 && t <= 9007199254740991
    }; let M = {}; M['[object Float32Array]'] = M['[object Float64Array]'] = M['[object Int8Array]'] = M['[object Int16Array]'] = M['[object Int32Array]'] = M['[object Uint8Array]'] = M['[object Uint8ClampedArray]'] = M['[object Uint16Array]'] = M['[object Uint32Array]'] = !0, M['[object Arguments]'] = M['[object Array]'] = M['[object ArrayBuffer]'] = M['[object Boolean]'] = M['[object DataView]'] = M['[object Date]'] = M['[object Error]'] = M['[object Function]'] = M['[object Map]'] = M['[object Number]'] = M['[object Object]'] = M['[object RegExp]'] = M['[object Set]'] = M['[object String]'] = M['[object WeakMap]'] = !1; let E = function(t) {
        return O(t) && N(t.length) && !!M[g(t)]
    }; let $ = function(t) {
        return function(e) {
            return t(e)
        }
    }; let C = c(function(t, e) {
        let n = e && !e.nodeType && e; let r = n && t && !t.nodeType && t; let o = r && r.exports === n && i.process; let u = (function() {
            try {
                let t = r && r.require && r.require('util').types; return t || o && o.binding && o.binding('util')
            }
            catch (t) {}
        }()); t.exports = u
    }); let I = C && C.isTypedArray; let L = I ? $(I) : E; let B = Object.prototype.hasOwnProperty; let U = function(t, e) {
        let n = A(t); let o = !n && S(t); let u = !n && !o && P(t); let c = !n && !o && !u && L(t); let i = n || o || u || c; let f = i ? r(t.length, String) : []; let a = f.length; for (let l in t)!e && !B.call(t, l) || i && (l == 'length' || u && (l == 'offset' || l == 'parent') || c && (l == 'buffer' || l == 'byteLength' || l == 'byteOffset') || F(l, a)) || f.push(l); return f
    }; let R = Object.prototype; let D = function(t) {
        let e = t && t.constructor; return t === (typeof e === 'function' && e.prototype || R)
    }; let V = (function(t, e) {
        return function(n) {
            return t(e(n))
        }
    }(Object.keys, Object)); let W = Object.prototype.hasOwnProperty; let q = function(t) {
        if (!D(t)) return V(t); let e = []; for (let n in Object(t))W.call(t, n) && n != 'constructor' && e.push(n); return e
    }; let z = function(t) {
        let e = o(t); return t != null && (e == 'object' || e == 'function')
    }; let G = function(t) {
        if (!z(t)) return !1; let e = g(t); return e == '[object Function]' || e == '[object GeneratorFunction]' || e == '[object AsyncFunction]' || e == '[object Proxy]'
    }; let H = function(t) {
        return t != null && N(t.length) && !G(t)
    }; let J = function(t) {
        return H(t) ? U(t) : q(t)
    }; let K = (function(t, e) {
        return function(n, r) {
            if (n == null) return n; if (!H(n)) return t(n, r); for (let o = n.length, u = e ? o : -1, c = Object(n); (e ? u-- : ++u < o) && !1 !== r(c[u], u, c););return n
        }
    }(function(t, e) {
        return t && n(t, e, J)
    })); let Q = function(t) {
        return t
    }; let X = function(t) {
        return typeof t === 'function' ? t : Q
    }; let Y; let Z = function(t, n) {
        return (A(t) ? e : K)(t, X(n))
    }; let tt = a['__core-js_shared__']; let et = (Y = /[^.]+$/.exec(tt && tt.keys && tt.keys.IE_PROTO || '')) ? 'Symbol(src)_1.' + Y : ''; let nt = function(t) {
        return !!et && et in t
    }; let rt = Function.prototype.toString; let ot = function(t) {
        if (t != null) {
            try {
                return rt.call(t)
            }
            catch (t) {} try {
                return t + ''
            }
            catch (t) {}
        } return ''
    }; let ut = /^\[object .+?Constructor\]$/; let ct = Function.prototype; let it = Object.prototype; let ft = ct.toString; let at = it.hasOwnProperty; let lt = RegExp('^' + ft.call(at).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'); let st = function(t) {
        return !(!z(t) || nt(t)) && (G(t) ? lt : ut).test(ot(t))
    }; let vt = function(t, e) {
        return t == null ? void 0 : t[e]
    }; let pt = function(t, e) {
        let n = vt(t, e); return st(n) ? n : void 0
    }; let bt = pt(a, 'DataView'); let yt = pt(a, 'Map'); let jt = pt(a, 'Promise'); let ht = pt(a, 'Set'); let dt = pt(a, 'WeakMap'); let gt = '[object Map]'; let Ot = '[object Promise]'; let mt = '[object Set]'; let wt = '[object WeakMap]'; let _t = '[object DataView]'; let xt = ot(bt); let St = ot(yt); let At = ot(jt); let kt = ot(ht); let Pt = ot(dt); let Tt = g; (bt && Tt(new bt(new ArrayBuffer(1))) != _t || yt && Tt(new yt()) != gt || jt && Tt(jt.resolve()) != Ot || ht && Tt(new ht()) != mt || dt && Tt(new dt()) != wt) && (Tt = function(t) {
        let e = g(t); let n = e == '[object Object]' ? t.constructor : void 0; let r = n ? ot(n) : ''; if (r) {
            switch (r) {
            case xt:return _t; case St:return gt; case At:return Ot; case kt:return mt; case Pt:return wt
            }
        } return e
    }); let Ft = Tt; let Nt = function(t) {
        return typeof t === 'string' || !A(t) && O(t) && g(t) == '[object String]'
    }; let Mt = (function(t) {
        return function(e) {
            return e == null ? void 0 : e[t]
        }
    }('length')); let Et = RegExp('[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]'); let $t = function(t) {
        return Et.test(t)
    }; let Ct = '[\\ud800-\\udfff]'; let It = '[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]'; let Lt = '\\ud83c[\\udffb-\\udfff]'; let Bt = '[^\\ud800-\\udfff]'; let Ut = '(?:\\ud83c[\\udde6-\\uddff]){2}'; let Rt = '[\\ud800-\\udbff][\\udc00-\\udfff]'; let Dt = '(?:' + It + '|' + Lt + ')' + '?'; let Vt = '[\\ufe0e\\ufe0f]?'; let Wt = Vt + Dt + ('(?:\\u200d(?:' + [Bt, Ut, Rt].join('|') + ')' + Vt + Dt + ')*'); let qt = '(?:' + [Bt + It + '?', It, Ut, Rt, Ct].join('|') + ')'; let zt = RegExp(Lt + '(?=' + Lt + ')|' + qt + Wt, 'g'); let Gt = function(t) {
        for (var e = zt.lastIndex = 0; zt.test(t);)++e; return e
    }; let Ht = function(t) {
        return $t(t) ? Gt(t) : Mt(t)
    }; let Jt = function(t) {
        if (t == null) return 0; if (H(t)) return Nt(t) ? Ht(t) : t.length; let e = Ft(t); return e == '[object Map]' || e == '[object Set]' ? t.size : q(t).length
    }; let Kt = function(t, e) {
        for (var n = -1, r = t == null ? 0 : t.length, o = Array(r); ++n < r;)o[n] = e(t[n], n, t); return o
    }; let Qt = function(t, e) {
        return Kt(e, function(e) {
            return t[e]
        })
    }; let Xt = function(t) {
        return t == null ? [] : Qt(t, J(t))
    }; function Yt() {
        let t; let e; let n = new Promise(function() {
            t = arguments[0], e = arguments[1]
        }); return n.resolve = t, n.reject = e, n
    } function Zt(t) {
        return Object.prototype.toString.call(t) === '[object Array]'
    } function te(t) {
        return Object.prototype.toString.call(t) === '[object Object]'
    } function ee(t) {
        let e = Object.prototype.toString.call(t); return e === '[object Function]' || e === '[object AsyncFunction]'
    } let ne = c(function(t) {
        let e = Object.prototype.hasOwnProperty; let n = '~'; function r() {} function o(t, e, n) {
            this.fn = t, this.context = e, this.once = n || !1
        } function u(t, e, r, u, c) {
            if (typeof r !== 'function') throw new TypeError('The listener must be a function'); let i = new o(r, u || t, c); let f = n ? n + e : e; return t._events[f] ? t._events[f].fn ? t._events[f] = [t._events[f], i] : t._events[f].push(i) : (t._events[f] = i, t._eventsCount++), t
        } function c(t, e) {
            --t._eventsCount == 0 ? t._events = new r() : delete t._events[e]
        } function i() {
            this._events = new r(), this._eventsCount = 0
        }Object.create && (r.prototype = Object.create(null), (new r()).__proto__ || (n = !1)), i.prototype.eventNames = function() {
            let t; let r; let o = []; if (this._eventsCount === 0) return o; for (r in t = this._events)e.call(t, r) && o.push(n ? r.slice(1) : r); return Object.getOwnPropertySymbols ? o.concat(Object.getOwnPropertySymbols(t)) : o
        }, i.prototype.listeners = function(t) {
            let e = n ? n + t : t; let r = this._events[e]; if (!r) return []; if (r.fn) return [r.fn]; for (var o = 0, u = r.length, c = new Array(u); o < u; o++)c[o] = r[o].fn; return c
        }, i.prototype.listenerCount = function(t) {
            let e = n ? n + t : t; let r = this._events[e]; return r ? r.fn ? 1 : r.length : 0
        }, i.prototype.emit = function(t, e, r, o, u, c) {
            let i = n ? n + t : t; if (!this._events[i]) return !1; let f; let a; let l = this._events[i]; let s = arguments.length; if (l.fn) {
                switch (l.once && this.removeListener(t, l.fn, void 0, !0), s) {
                case 1:return l.fn.call(l.context), !0; case 2:return l.fn.call(l.context, e), !0; case 3:return l.fn.call(l.context, e, r), !0; case 4:return l.fn.call(l.context, e, r, o), !0; case 5:return l.fn.call(l.context, e, r, o, u), !0; case 6:return l.fn.call(l.context, e, r, o, u, c), !0
                } for (a = 1, f = new Array(s - 1); a < s; a++)f[a - 1] = arguments[a]; l.fn.apply(l.context, f)
            }
            else {
                let v; let p = l.length; for (a = 0; a < p; a++) {
                    switch (l[a].once && this.removeListener(t, l[a].fn, void 0, !0), s) {
                    case 1:l[a].fn.call(l[a].context); break; case 2:l[a].fn.call(l[a].context, e); break; case 3:l[a].fn.call(l[a].context, e, r); break; case 4:l[a].fn.call(l[a].context, e, r, o); break; default:if (!f) for (v = 1, f = new Array(s - 1); v < s; v++)f[v - 1] = arguments[v]; l[a].fn.apply(l[a].context, f)
                    }
                }
            } return !0
        }, i.prototype.on = function(t, e, n) {
            return u(this, t, e, n, !1)
        }, i.prototype.once = function(t, e, n) {
            return u(this, t, e, n, !0)
        }, i.prototype.removeListener = function(t, e, r, o) {
            let u = n ? n + t : t; if (!this._events[u]) return this; if (!e) return c(this, u), this; let i = this._events[u]; if (i.fn)i.fn !== e || o && !i.once || r && i.context !== r || c(this, u); else {
                for (var f = 0, a = [], l = i.length; f < l; f++)(i[f].fn !== e || o && !i[f].once || r && i[f].context !== r) && a.push(i[f]); a.length ? this._events[u] = a.length === 1 ? a[0] : a : c(this, u)
            } return this
        }, i.prototype.removeAllListeners = function(t) {
            let e; return t ? (e = n ? n + t : t, this._events[e] && c(this, e)) : (this._events = new r(), this._eventsCount = 0), this
        }, i.prototype.off = i.prototype.removeListener, i.prototype.addListener = i.prototype.on, i.prefixed = n, i.EventEmitter = i, t.exports = i
    }); function re() {
        return new ne()
    } let oe = /\s/; let ue = function(t) {
        for (var e = t.length; e-- && oe.test(t.charAt(e)););return e
    }; let ce = /^\s+/; let ie = function(t) {
        return t ? t.slice(0, ue(t) + 1).replace(ce, '') : t
    }; let fe = function(t) {
        return o(t) == 'symbol' || O(t) && g(t) == '[object Symbol]'
    }; let ae = /^[-+]0x[0-9a-f]+$/i; let le = /^0b[01]+$/i; let se = /^0o[0-7]+$/i; let ve = parseInt; let pe = function(t) {
        if (typeof t === 'number') return t; if (fe(t)) return NaN; if (z(t)) {
            let e = typeof t.valueOf === 'function' ? t.valueOf() : t; t = z(e) ? e + '' : e
        } if (typeof t !== 'string') return t === 0 ? t : +t; t = ie(t); let n = le.test(t); return n || se.test(t) ? ve(t.slice(2), n ? 2 : 8) : ae.test(t) ? NaN : +t
    }; let be = 1 / 0; let ye = function(t) {
        return t ? (t = pe(t)) === be || t === -1 / 0 ? 17976931348623157e292 * (t < 0 ? -1 : 1) : t == t ? t : 0 : t === 0 ? t : 0
    }; let je = function(t) {
        let e = ye(t); let n = e % 1; return e == e ? n ? e - n : e : 0
    }; let he = function(t) {
        return typeof t === 'number' && t == je(t)
    }; function de(t) {
        return Object.prototype.toString.call(t) === '[object String]'
    } function ge(t) {
        let e = !1; return !(function(t) {
            return !(!de(t) || t === '')
        }(t))
            ? (function(t) {
                return Object.prototype.toString.call(t) === '[object Number]'
            }(t)) && (e = !0)
            : e = !isNaN(Number(t)), e
    } function Oe(t) {
        return ge(t) ? ye(t) : 0
    } function me(t) {
        return !!ge(t) && (t = Oe(t), he(t))
    } let we = l ? l.prototype : void 0; let _e = we ? we.toString : void 0; let xe = function t(e) {
        if (typeof e === 'string') return e; if (A(e)) return Kt(e, t) + ''; if (fe(e)) return _e ? _e.call(e) : ''; let n = e + ''; return n == '0' && 1 / e == -Infinity ? '-0' : n
    }; let Se = function(t) {
        return t == null ? '' : xe(t)
    }; let Ae = a.isFinite; let ke = Math.min; let Pe = (function(t) {
        let e = Math[t]; return function(t, n) {
            if (t = pe(t), (n = n == null ? 0 : ke(je(n), 292)) && Ae(t)) {
                let r = (Se(t) + 'e').split('e'); let o = e(r[0] + 'e' + (+r[1] + n)); return +((r = (Se(o) + 'e').split('e'))[0] + 'e' + (+r[1] - n))
            } return e(t)
        }
    }('round')); function Te(t) {
        if (!ge(t)) return 0; t = Oe(t); let e = Pe(t); return String(e) === '0' ? 0 : e
    } function Fe(t) {
        return !!me(t) && Te(t) < 0
    } function Ne() {
        let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0; let e = 0; let n = []; Fe(t) && (t = 0), t = Te(t); let r = re(); function o() {
            if (n.length > 0) return e += 1, n.splice(0, 1)[0]; return null
        } function u() {
            (e -= 1) < 0 && (e = 0), n.length > 0 && r.emit('message', n)
        } function c(o) {
            n.push(o), (t <= 0 || e < t) && r.emit('message', n)
        } function i() {
            e = 0, n = []
        } return r.get = o, r.cb = u, r.push = c, r.clear = i, r
    } function Me(t) {
        return !!(function(t) {
            return Object.prototype.toString.call(t) === '[object Undefined]'
        }(t)) || (!!(function(t) {
            return Object.prototype.toString.call(t) === '[object Null]'
        }(t)) || (!!(function(t) {
            if (te(t)) {
                for (let e in t) return !1; return !0
            } return !1
        }(t)) || (!!(function(t) {
            return !(!de(t) || t !== '')
        }(t)) || !!(function(t) {
            return !!Zt(t) && t.length === 0
        }(t)))))
    } let Ee = function(t) {
        return !0 === t || !1 === t || O(t) && g(t) == '[object Boolean]'
    }; t.cint = Te, t.isbol = function(t) {
        return Ee(t)
    }, t.isearr = function(t) {
        return !!Zt(t) && (t.length !== 0 && (t.length !== 1 || !Me(t[0])))
    }, t.iseobj = function(t) {
        if (te(t)) {
            for (let e in t) return !0; return !1
        } return !1
    }, t.isfun = ee, t.ispint = function(t) {
        return !!me(t) && Te(t) > 0
    }, t.pmMap = function(t, e) {
        let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0; let r = {}; let o = !1; let u = Yt(); if (!Zt(t) && !te(t)) return u.reject('rs is not an array or object'), u; let c = !1; if (te(t)) {
            c = !0; let i = []; Z(t, function(t, e) {
                i.push({ k: e, v: t })
            }), t = i
        } let f = Ne(n); return f.on('message', function(n) {
            if (!o) {
                let i; let a = f.get(); if (ee(e)) {
                    let l = a.key; let s = a.value; c && (l = a.value.k, s = a.value.v), i = e(s, l)
                }
                else i = a.value; i.then(function(t) {
                    r[a.key] = t
                }).catch(function(t) {
                    o = !0, f.clear(), u.reject(t)
                }).finally(function() {
                    f.cb(), Jt(r) === t.length && u.resolve(Xt(r))
                })
            }
        }), Z(t, function(t, e) {
            f.push({ key: e, value: t })
        }), u
    }, Object.defineProperty(t, '__esModule', { value: !0 })
}))
