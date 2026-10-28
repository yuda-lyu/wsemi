import fs from 'fs'
import assert from 'assert'
import getTrace from '../src/getTrace.mjs'


//getTrace為計時器相關函數之觀察回調(opt.onTrace)共用之取得與呼叫, 由index對外匯出供其他自有套件使用, 規則見sgud/rule/rulebook.md之R-TRACE-01


describe(`getTrace`, function() {

    it(`should be exported by index from its own module`, function() {
        //R-TRACE-01 規則2: 單一擁有者且wsemi對外匯出, 他自有套件import之而不各自實作; index於Node內無法整份載入(viewerjs之css), 故檢查匯出行
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as getTrace } from './getTrace.mjs'`), true)
        assert.strict.deepStrictEqual(typeof getTrace, 'function')
    })

    it(`should return null when opt.onTrace is not a function`, function() {
        //R-TRACE-01 P3: 未給或非函數時回傳null, 呼叫端以if (trace)略過, 未傳回調時之行為與效能同未支援前
        let vs = [undefined, null, {}, { onTrace: null }, { onTrace: 'abc' }, { onTrace: 1 }, { onTrace: {} }, { onTrace: Promise.resolve() }]
        assert.strict.deepStrictEqual(vs.map((v) => getTrace(v)), vs.map(() => null))
    })

    it(`should call onTrace synchronously with a frozen event without a receiver`, function() {
        //R-TRACE-01 P1: 同步呼叫; P4: 事件為凍結物件{ type, ... }, 回調不帶接收者
        let got = []
        let trace = getTrace({
            onTrace: function(e) {
                got.push([this, e, Object.isFrozen(e)])
            },
        })
        trace('check', { n: 1, ok: true })
        let nSync = got.length
        assert.strict.deepStrictEqual(nSync, 1)
        assert.strict.deepStrictEqual(got[0], [undefined, { type: 'check', n: 1, ok: true }, true])
        assert.throws(() => {
            'use strict'
            got[0][1].n = 2
        }, TypeError)
    })

    it(`should ignore a throwing onTrace, a rejected promise it returns and its return value`, async function() {
        //R-TRACE-01 P4: 拋錯被隔離(不外拋), 回傳之Promise之rejection不成為未處理之rejection, 回傳值不使用
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        try {
            let t1 = getTrace({
                onTrace: () => {
                    throw new Error('trace boom')
                },
            })
            assert.strict.deepStrictEqual(t1('a', {}), undefined)
            let t2 = getTrace({ onTrace: () => Promise.reject(new Error('trace reject')) })
            assert.strict.deepStrictEqual(t2('a', {}), undefined)
            let caught = false
            let t3 = getTrace({
                onTrace: () => ({
                    catch() {
                        caught = true
                    },
                }),
            })
            assert.strict.deepStrictEqual(t3('a', {}), undefined)
            let t4 = getTrace({
                onTrace: () => ({
                    get catch() {
                        throw new Error('catch getter boom')
                    },
                }),
            })
            assert.strict.deepStrictEqual(t4('a', {}), undefined)
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual([caught, un], [true, []])
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
    })

})
