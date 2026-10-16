import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mat2ltdt from '../src/mat2ltdt.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`mat2ltdt`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [['a', 'b'], [12, 34.56], ['x', '12.34']],
        out: [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 1
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: [['a', 'b'], [12, 34.56, 999], ['x', '12.34', 'abc']],
        out: [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 2
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: [['a', 'b', 'c'], [12, 34.56], ['x', '12.34']],
        out: [{ a: 12, b: 34.56, c: '' }, { a: 'x', b: '12.34', c: '' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 3
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = mat2ltdt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = mat2ltdt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = mat2ltdt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = mat2ltdt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = mat2ltdt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = mat2ltdt(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a valid mat with returnWithStateAndMsg`, function() {
        let r = mat2ltdt([['a', 'b'], [1, 2]], { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: [{ a: 1, b: 2 }] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid mat' } when input NaN with returnWithStateAndMsg`, function() {
        let r = mat2ltdt(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid mat' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error' } when mat has less than 2 rows with returnWithStateAndMsg`, function() {
        //原碼三種失敗皆回[], 與「本就轉出空陣列」無從分辨
        let r = mat2ltdt([['a', 'b']], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('2 rows') >= 0, true, `msg 應標明列數不足, got ${r.msg}`)
    })

    it(`should return { state: 'error' } when any row is not an effective array with returnWithStateAndMsg`, function() {
        let r = mat2ltdt([['a', 'b'], NaN], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('row') >= 0, true, `msg 應標明列無效, got ${r.msg}`)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = mat2ltdt([['a', 'b'], [1, 2]], { returnWithStateAndMsg: 'yes' })
        let rr = [{ a: 1, b: 2 }]
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`mat2ltdt 經keysmat2ltdt之使用端物件之迭代(R-OBJ-ITER-01, 整合案例)`, function() {

        it(`should keep length as an ordinary column: [['length','a'],[3,'x']] -> [{ length: 3, a: 'x' }]`, function() {
            let r = mat2ltdt([['length', 'a'], [3, 'x']])
            assert.strict.deepStrictEqual(r, [{ length: 3, a: 'x' }])
            assert.strict.deepStrictEqual(Object.keys(r[0]), ['length', 'a'])
        })

        it(`should keep length as an ordinary column for several rows with different length values`, function() {
            let r = mat2ltdt([['length', 'a'], [0, 'x'], [1, 'y'], [7, 'z']])
            assert.strict.deepStrictEqual(r, [{ length: 0, a: 'x' }, { length: 1, a: 'y' }, { length: 7, a: 'z' }])
            assert.strict.deepStrictEqual(r.map((o) => Object.keys(o)), [['length', 'a'], ['length', 'a'], ['length', 'a']])
        })

        it(`should still fill missing cells with empty strings next to a length column`, function() {
            let r = mat2ltdt([['a', 'length', 'b'], ['x', 2]])
            assert.strict.deepStrictEqual(r, [{ a: 'x', length: 2, b: '' }])
        })

        it(`should keep length as an ordinary column with returnWithStateAndMsg`, function() {
            let r = mat2ltdt([['length', 'a'], [3, 'x']], { returnWithStateAndMsg: true })
            assert.strict.deepStrictEqual(r, { state: 'success', msg: [{ length: 3, a: 'x' }] })
        })

        it(`should keep length as an ordinary column when the value is -0 (JSON.parse('-0'))`, function() {
            let r = mat2ltdt(JSON.parse('[["length","a"],[-0,"x"]]'))
            assert.strict.deepStrictEqual(Object.keys(r[0]), ['length', 'a'])
            assert.ok(Object.is(r[0].length, -0))
        })

        it(`should not alter the behavior when the length column holds non-array-like values`, function() {
            let r = mat2ltdt([['length', 'a'], [-1, 'x'], [1.5, 'y'], ['3', 'z'], [null, 'w']])
            assert.strict.deepStrictEqual(r, [{ length: -1, a: 'x' }, { length: 1.5, a: 'y' }, { length: '3', a: 'z' }, { length: null, a: 'w' }])
        })

        //極大length於限額子行程: 修前依length迭代並逐一建立屬性, 64MB下耗盡堆積而崩潰(離開碼134)
        let runner = join(__dirname, 'tools', 'objIterG4Runner.mjs')
        let MAX = Number.MAX_SAFE_INTEGER
        for (let len of [1e8, MAX, 4294967295, 4294967296]) {
            it(`should finish with a length column of ${len} within 1000 ms and 4 MB of heap, with no index key`, function() {
                let rc = runChildCase(runner, `mat2ltdt:basic:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                assert.ok(rc.r !== null, 'no result line')
                assert.strict.deepStrictEqual(rc.r.out, [{ length: len, a: 'x' }, { length: len, a: 'y' }])
                assert.ok(rc.r.ms < 1000, `ms=${rc.r.ms}`)
                assert.ok(rc.r.heapMB < 4, `heapMB=${rc.r.heapMB}`)
            })
        }

    })

})
