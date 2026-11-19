import assert from 'assert'
//import domGetWindowSize from '../src/domGetWindowSize.mjs'


describe(`domGetWindowSize`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it(`should ignore a wrapper object as a window size candidate (W-20: candidates are filtered by isnbr, primitives only; was lodash isNumber, which accepted new Number)`, async function() {
        //於Node, getGlobal()為global; 候選值innerWidth為包裝物件而innerHeight為原始數字, 包裝物件不入候選(修前width為包裝物件本身)
        let { default: domGetWindowSize } = await import('../src/domGetWindowSize.mjs')
        let had = [Object.prototype.hasOwnProperty.call(globalThis, 'innerWidth'), Object.prototype.hasOwnProperty.call(globalThis, 'innerHeight')]
        let old = [globalThis.innerWidth, globalThis.innerHeight]
        try {
            globalThis.innerWidth = new Number(500) // eslint-disable-line no-new-wrappers
            globalThis.innerHeight = 400
            assert.strict.deepStrictEqual(domGetWindowSize(), { width: undefined, height: 400 })
            globalThis.innerWidth = 500
            assert.strict.deepStrictEqual(domGetWindowSize(), { width: 500, height: 400 })
        }
        finally {
            for (let [i, k] of ['innerWidth', 'innerHeight'].entries()) {
                if (had[i]) {
                    globalThis[k] = old[i]
                }
                else {
                    delete globalThis[k]
                }
            }
        }
    })

})
