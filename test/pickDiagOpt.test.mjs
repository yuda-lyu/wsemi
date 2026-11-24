import fs from 'fs'
import assert from 'assert'
import pickDiagOpt from '../src/pickDiagOpt.mjs'
import evem from '../src/evem.mjs'
import evEmit from '../src/evEmit.mjs'
import genDiagFunLog from '../src/genDiagFunLog.mjs'


//pickDiagOpt自使用端之設定物件取診斷輸出之兩鍵, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則18(排程第610項⑦: 使用端多份自寫之取值函數收為單一實作)
//規格句(JSDoc): P1 回傳只含{ logDetail, funLog }之新物件; P2 logDetail須===true才為true; P3 funLog須為函數才保留原參照, 其餘null;
//P4 各鍵讀取一次、各自try, opt非物件或讀取拋錯視為未給, 不讀其他鍵、不改寫輸入、永不拋錯; P5 併入evEmit之opt時, 監聽器拋錯之通報交給該funLog


describe(`pickDiagOpt`, function() {

    it(`should be exported from the package index`, function() {
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as pickDiagOpt } from './pickDiagOpt.mjs'`), true)
    })

    it(`P1-P3: should return only logDetail and funLog, normalized, keeping the funLog reference`, function() {
        let fl = () => {}
        let { funLog: srvLog } = genDiagFunLog(() => {})
        let opt = { logDetail: true, funLog: fl, tag: 'x', funSettle: () => {}, other: 1 }
        let r = pickDiagOpt(opt)
        assert.strict.deepStrictEqual(Object.keys(r), ['logDetail', 'funLog'])
        assert.strict.deepStrictEqual([r.logDetail, r.funLog === fl, r === opt], [true, true, false])
        assert.strict.deepStrictEqual(pickDiagOpt({ funLog: srvLog }).funLog, srvLog)
        assert.strict.deepStrictEqual(Object.keys(opt), ['logDetail', 'funLog', 'tag', 'funSettle', 'other']) //不改寫輸入
    })

    it(`P2/P3: should treat every non-true logDetail and every non-function funLog as not given`, function() {
        for (let v of [false, 'true', 1, 'yes', null, undefined, {}, [true], new Boolean(true)]) { // eslint-disable-line no-new-wrappers
            assert.strict.deepStrictEqual(pickDiagOpt({ logDetail: v }), { logDetail: false, funLog: null }, String(v))
        }
        for (let v of ['fn', 1, null, undefined, {}, [() => {}], true]) {
            assert.strict.deepStrictEqual(pickDiagOpt({ funLog: v }), { logDetail: false, funLog: null }, String(v))
        }
    })

    it(`P4: should give defaults for non-object opt, throwing getters and revoked Proxy, reading each key once and no other key`, function() {
        for (let o of [undefined, null, 5, 'str', true]) {
            assert.strict.deepStrictEqual(pickDiagOpt(o), { logDetail: false, funLog: null }, String(o))
        }
        let thr = {}
        Object.defineProperty(thr, 'logDetail', {
            get: () => {
                throw new Error('x')
            }
        })
        Object.defineProperty(thr, 'funLog', {
            get: () => {
                throw new Error('y')
            }
        })
        assert.strict.deepStrictEqual(pickDiagOpt(thr), { logDetail: false, funLog: null })
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        assert.strict.deepStrictEqual(pickDiagOpt(proxy), { logDetail: false, funLog: null })
        let seen = []
        let fl = () => {}
        let px = new Proxy({ logDetail: true, funLog: fl }, {
            get: (t, k) => {
                seen.push(k); return t[k]
            }
        })
        assert.strict.deepStrictEqual(pickDiagOpt(px), { logDetail: true, funLog: fl })
        assert.strict.deepStrictEqual(seen, ['logDetail', 'funLog'])
        //繼承之鍵同getDiag之讀法(可讀得)
        assert.strict.deepStrictEqual(pickDiagOpt(Object.create({ logDetail: true })).logDetail, true)
    })

    it(`P5: merged into evEmit opt, a listener throw is reported only to the picked funLog, and the caller's other keys are not overridden`, function() {
        let calls = []
        let userOpt = { funLog: (label, safe) => calls.push([label, safe]), tag: 'user-tag-should-not-win', funSettle: 'bad' }
        let ev = evem()
        ev.on('e', () => {
            throw new Error('boom')
        })
        let settled = 0
        let r = evEmit(ev, 'e', [], {
            tag: 'pkg',
            funSettle: () => {
                settled++
            },
            ...pickDiagOpt(userOpt)
        })
        assert.strict.deepStrictEqual([r, settled], [false, 1])
        assert.strict.deepStrictEqual(calls, [['[wsemi pkg] listener threw', { errType: 'Error' }]])
    })

})
