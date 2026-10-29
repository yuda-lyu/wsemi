import assert from 'assert'
import corpus from '../../src/_diagCases.mjs'
import { runCases, runNoUtil } from './diagCaseRunner.mjs'


//diagSuite, 以_diagCases語料逐案定義測試(主要受測函數為fnName之案): 有util(本行程)與無util(子行程刪除process.getBuiltinModule)兩種環境各一次
//每案之期望為語料之expect(R-DIAG-01與主控dspec〈診斷輸出與遮罩〉之翻譯, 見各案label); need為child之案由各測試檔另行執行
let diagSuite = (fnName) => {
    let cs = corpus.cases.filter((c) => c.fn === fnName && c.need !== 'child')
    let ids = cs.map((c) => c.id)

    describe(`${fnName} corpus (util.types available)`, function() {
        let r = null
        before(async function() {
            r = await runCases({ ids })
            assert.strict.deepStrictEqual(r.util, true)
        })
        for (let c of cs) {
            it(`${c.id} ${c.label}`, function() {
                assert.strict.deepStrictEqual(r.rs[c.id], null)
            })
        }
    })

    describe(`${fnName} corpus (no util.types: browser / Node<20.16 fallback)`, function() {
        let r = null
        before(function() {
            r = runNoUtil({ ids })
            assert.strict.deepStrictEqual(r.util, false)
        })
        for (let c of cs) {
            it(`${c.id} ${c.label}`, function() {
                assert.strict.deepStrictEqual(r.rs[c.id], null)
            })
        }
    })

    return cs
}


export default diagSuite
