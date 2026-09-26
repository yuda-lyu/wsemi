import assert from 'assert'
import detector from '../src/_detector.mjs'


let tick = () => new Promise((resolve) => setTimeout(resolve, 0))


//muteConsoleError, 暫時攔截console.error, 回傳還原函數與收到之參數
function muteConsoleError() {
    let ce = console.error
    let got = []
    console.error = (...args) => {
        got.push(args)
    }
    return {
        got,
        restore: () => {
            console.error = ce
        },
    }
}


describe(`_detector`, function() {

    it(`should parse the mode, anything but event being promise`, function() {
        assert.strict.deepStrictEqual(detector.getMode({ mode: 'event' }), 'event')
        for (let o of [{ mode: 'promise' }, { mode: 'x' }, {}, null, undefined]) {
            assert.strict.deepStrictEqual(detector.getMode(o), 'promise', JSON.stringify(o))
        }
    })

    it(`should start once in a microtask after create, emit while running, and release in reverse order on dispose`, async function() {
        //create於microtask啟動, 重複呼叫不重複啟動; dispose依登記相反順序釋放, 之後不再發出; dispose可重複呼叫且回傳true; create回傳undefined
        let log = []
        let emitRef = null
        let ev = detector.detectorEvent((emit, addCleanup) => {
            log.push('start')
            emitRef = emit
            addCleanup(() => log.push('stop1'))
            addCleanup(() => log.push('stop2'))
        })
        let r = ev.create()
        ev.create()
        let startedSync = log.length
        let got = []
        ev.on('x', (v) => got.push(v)) //create後才掛之監聽亦收得到
        await tick()
        emitRef('x', 1)
        assert.strict.deepStrictEqual(ev.dispose(), true)
        emitRef('x', 2)
        assert.strict.deepStrictEqual(ev.dispose(), true)
        ev.create()
        await tick()
        assert.strict.deepStrictEqual([r, startedSync, ev.error, log, got], [undefined, 0, null, ['start', 'stop2', 'stop1'], [1]])
    })

    it(`should never start when disposed before the microtask, or before create`, async function() {
        let n = 0
        let e1 = detector.detectorEvent(() => {
            n++
        })
        e1.create()
        e1.dispose()
        let e2 = detector.detectorEvent(() => {
            n++
        })
        e2.dispose()
        e2.create()
        await tick()
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`should stay inert with the error when start is null`, async function() {
        //無法偵測時仍可呼叫create、on、dispose, 永不發出, error為原因
        let ev = detector.detectorEvent(null, { error: 'invalid element' })
        assert.doesNotThrow(() => {
            ev.on('x', () => {})
            ev.create()
        })
        await tick()
        assert.strict.deepStrictEqual([ev.error, ev.dispose()], ['invalid element', true])
    })

    it(`should release what start acquired before it threw, keep the error, and stop emitting`, async function() {
        //啟動途中拋錯: 已登記之資源立即釋放, error為所拋之值, 之後之emit無效, 再create不重試
        let log = []
        let emitRef = null
        let n = 0
        let ev = detector.detectorEvent((emit, addCleanup) => {
            n++
            emitRef = emit
            addCleanup(() => log.push('released'))
            throw new Error('boom')
        })
        let got = []
        ev.on('x', (v) => got.push(v))
        assert.doesNotThrow(() => ev.create())
        await tick()
        let released = log.slice() //dispose之前即已釋放
        emitRef('x', 1)
        ev.create()
        await tick()
        assert.strict.deepStrictEqual([ev.error instanceof Error, ev.error.message, released, got, n, ev.dispose(), log.length], [true, 'boom', ['released'], [], 1, true, 1])
    })

    it(`should run a cleanup added after dispose at once, and keep releasing when one cleanup throws`, async function() {
        let log = []
        let add = null
        let ev = detector.detectorEvent((emit, addCleanup) => {
            add = addCleanup
            addCleanup(() => log.push('a'))
            addCleanup(() => {
                throw new Error('cleanup boom')
            })
        })
        ev.create()
        await tick()
        assert.doesNotThrow(() => ev.dispose())
        add(() => log.push('late'))
        assert.strict.deepStrictEqual(log, ['a', 'late'])
    })

    it(`should report a throwing listener by console.error or the error event, and keep emitting`, async function() {
        //監聽器拋錯經evEmit: 無error監聽者時console.error(帶tag), 有則發出error事件; 其後之emit照常
        let emitRef = null
        let ev = detector.detectorEvent((emit) => {
            emitRef = emit
        }, { tag: 'tdet' })
        let got = []
        let boom = true
        ev.on('x', (v) => {
            if (boom) {
                boom = false
                throw new Error('listener boom')
            }
            got.push(v)
        })
        ev.create()
        await tick()
        let m = muteConsoleError()
        try {
            emitRef('x', 1)
        }
        finally {
            m.restore()
        }
        emitRef('x', 2)
        let errs = []
        ev.on('error', (e) => errs.push(e))
        boom = true
        emitRef('x', 3)
        ev.dispose()
        assert.strict.deepStrictEqual([m.got.length, String(m.got[0][0]).includes('tdet'), got, errs.length, errs[0].name, errs[0].msg.message], [1, true, [2], 1, 'x', 'listener boom'])
    })

    it(`should reject in promise mode and return an inert detector in event mode on failure`, async function() {
        //promise模式仍以原字串reject; event模式回傳不觸發之物件, 不產生未處理之拒絕
        let err = null
        try {
            await detector.detectorFail('promise', 'invalid element')
        }
        catch (e) {
            err = e
        }
        let rejections = 0
        let onRej = () => {
            rejections++
        }
        process.on('unhandledRejection', onRej)
        let ev = detector.detectorFail('event', 'invalid element')
        await tick()
        process.removeListener('unhandledRejection', onRej)
        assert.strict.deepStrictEqual([err, ev instanceof Promise, typeof ev.on, typeof ev.create, typeof ev.dispose, ev.error, rejections], ['invalid element', false, 'function', 'function', 'function', 'invalid element', 0])
    })

})
