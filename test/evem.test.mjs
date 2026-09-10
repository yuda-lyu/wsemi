import assert from 'assert'
import EventEmitter from '../node_modules/eventemitter3/index.mjs'
import evem from '../src/evem.mjs'


//本測試之判準: evem() 須為合規之 EventEmitter
//  evem 不做任何包裝, 故其對呼叫端之可觀察行為須與直接 new EventEmitter() 完全一致。
//  下方以「差分」方式斷言: 同一組操作對 basic 與 evem() 之觀察結果必須相同。
//  監聽器出錯之防護不屬 emitter 之契約, 而由派發處自行處理(見 src/_evemEmit.mjs 與各模組)。


//observe, 對同一組操作記錄所有可觀察項
function observe(mkEE, scenario) {
    let log = {
        calls: [],
        thrown: null,
        emitRets: [],
        counts: null,
        countsAll: null,
        names: null,
        listenersSame: null,
    }
    let ee = mkEE()
    try {
        scenario(ee, log)
    }
    catch (err) {
        log.thrown = (err && err.message) || String(err)
    }
    try {
        log.counts = ee.listenerCount('ev')
    }
    catch (err) {
        log.counts = 'THROW'
    }
    try {
        log.countsAll = ee.eventNames().length
    }
    catch (err) {
        log.countsAll = 'THROW'
    }
    try {
        //保留原序與型別標記, 不可壓平, 否則順序與symbol身分不可見
        log.names = ee.eventNames().map((v) => {
            return (typeof v === 'symbol') ? ('sym:' + String(v)) : ('str:' + String(v))
        }).join('|')
    }
    catch (err) {
        log.names = 'THROW'
    }
    return JSON.stringify(log)
}


function diff(scenario) {
    let a = observe(() => {
        return new EventEmitter()
    }, scenario)
    let b = observe(() => {
        return evem()
    }, scenario)
    return { a, b }
}


describe(`evem`, function() {

    it(`should emit and receive data`, function() {
        let r = null
        let ev = evem()
        ev.on('evName', function(msg) {
            r = msg
        })
        ev.emit('evName', { abc: 12.34 })
        assert.strict.deepStrictEqual(r, { abc: 12.34 })
    })

    it(`should return a raw eventemitter3 instance`, function() {
        let ev = evem()
        assert.strict.deepStrictEqual(ev instanceof EventEmitter, true)
    })

    it(`should take no options and ignore extra arguments`, function() {
        assert.strict.deepStrictEqual(evem.length, 0)
        let ev = evem({ type: 'safe' }) //舊版之opt已移除, 傳入不應有任何作用亦不應拋錯
        let r = null
        ev.on('ev', (v) => {
            r = v
        })
        ev.emit('ev', 1)
        assert.strict.deepStrictEqual(r, 1)
    })

    //以下為合規性差分: 每條皆須 basic 與 evem() 完全一致

    it(`should match eventemitter3 for a basic on/emit`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('ev', function(x, y) {
                log.calls.push('L1:' + x + ',' + y)
                return 1
            })
            log.emitRets.push(ee.emit('ev', 'x', 'y'))
            log.emitRets.push(ee.emit('none'))
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for listener order and multiple listeners`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('ev', () => {
                log.calls.push('L1')
            })
            ee.on('ev', () => {
                log.calls.push('L2')
            })
            ee.on('ev', () => {
                log.calls.push('L3')
            })
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 when a listener throws (propagates to emit caller, aborts remaining listeners)`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('ev', () => {
                log.calls.push('L1')
            })
            ee.on('ev', () => {
                throw new Error('listener boom')
            })
            ee.on('ev', () => {
                log.calls.push('L3')
            })
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should propagate a sync listener throw to the emit caller`, function() {
        let ev = evem()
        ev.on('ev', () => {
            throw new Error('listener boom')
        })
        let r = () => {
            return ev.emit('ev')
        }
        assert.throws(r, /listener boom/)
    })

    it(`should not call remaining listeners after one throws (EventEmitter semantics)`, function() {
        let seq = []
        let ev = evem()
        ev.on('ev', () => {
            seq.push('L1')
        })
        ev.on('ev', () => {
            throw new Error('listener boom')
        })
        ev.on('ev', () => {
            seq.push('L3')
        })
        try {
            ev.emit('ev')
        }
        catch (err) {
        }
        assert.strict.deepStrictEqual(seq, ['L1'])
    })

    it(`should match eventemitter3 for once`, function() {
        let { a, b } = diff((ee, log) => {
            ee.once('ev', () => {
                log.calls.push('once')
            })
            log.emitRets.push(ee.emit('ev'))
            log.emitRets.push(ee.emit('ev'))
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for context binding`, function() {
        let ctx = { tag: 'ctx' }
        let { a, b } = diff((ee, log) => {
            ee.on('ev', function() {
                log.calls.push('this===ctx:' + (this === ctx))
            }, ctx)
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for six or more emit arguments`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('ev', function(...v) {
                log.calls.push(JSON.stringify(v))
            })
            ee.emit('ev', 1, 2, 3, 4, 5, 6, 7)
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for off by original function`, function() {
        let { a, b } = diff((ee, log) => {
            let fn = () => {
                log.calls.push('L1')
            }
            ee.on('ev', fn)
            ee.off('ev', fn)
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for event name type aliasing (number vs string)`, function() {
        let { a, b } = diff((ee, log) => {
            let fn = () => {
                log.calls.push('L1')
            }
            ee.on(1, fn)
            ee.off('1', fn)
            ee.emit(1)
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for a Symbol event name`, function() {
        let s = Symbol('ev')
        let { a, b } = diff((ee, log) => {
            ee.on(s, () => {
                log.calls.push('L1')
            })
            ee.emit(s)
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for listeners() identity`, function() {
        let fn = function named() {}
        let { a, b } = diff((ee, log) => {
            ee.on('ev', fn)
            log.listenersSame = (ee.listeners('ev').length === 1 && ee.listeners('ev')[0] === fn)
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for removeAllListeners`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('a', () => {
                log.calls.push('a')
            })
            ee.on('b', () => {
                log.calls.push('b')
            })
            ee.removeAllListeners()
            ee.emit('a')
            ee.emit('b')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for adding a listener during dispatch`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('ev', () => {
                log.calls.push('L1')
                ee.on('ev', () => {
                    log.calls.push('added')
                })
            })
            ee.emit('ev')
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for removing itself during dispatch`, function() {
        let { a, b } = diff((ee, log) => {
            let fn = () => {
                log.calls.push('L1')
                ee.off('ev', fn)
            }
            ee.on('ev', fn)
            ee.on('ev', () => {
                log.calls.push('L2')
            })
            ee.emit('ev')
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for the same function on two events`, function() {
        let { a, b } = diff((ee, log) => {
            let fn = () => {
                log.calls.push('L1')
            }
            ee.on('ev', fn)
            ee.on('ev2', fn)
            ee.off('ev', fn)
            ee.emit('ev')
            ee.emit('ev2')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 for addListener and removeListener aliases`, function() {
        let { a, b } = diff((ee, log) => {
            let fn = () => {
                log.calls.push('L1')
            }
            ee.addListener('ev', fn)
            ee.emit('ev')
            ee.removeListener('ev', fn)
            ee.emit('ev')
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 when the listener is not a function`, function() {
        let { a, b } = diff((ee) => {
            ee.on('ev', {})
        })
        assert.strict.deepStrictEqual(a, b)
    })

    it(`should match eventemitter3 when a listener returns a rejected promise (not observed by emit)`, function() {
        let { a, b } = diff((ee, log) => {
            ee.on('ev', () => {
                let pm = Promise.reject(new Error('async boom'))
                pm.catch(() => {}) //由監聽器自行處理, 符合規範之作法
                log.calls.push('L1')
                return pm
            })
            log.emitRets.push(ee.emit('ev'))
        })
        assert.strict.deepStrictEqual(a, b)
    })

})
