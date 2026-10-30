import assert from 'assert'
import { fileURLToPath } from 'url'
import { runChildCase } from './tools/runChildCase.mjs'


//_pmMarkHandled之規格(JSDoc _pmMarkHandled; diag-run02 P6、dspec〈診斷輸出與遮罩〉Q-D): 以品牌判定原生Promise(載入時之Promise.prototype.then之品牌檢查), 跨realm、原型為null者皆標記已處理;
//非原生Promise者不讀屬性、不呼叫其then、不觸發Proxy之陷阱; 載入後改寫Promise.prototype.then不影響; 使用端pmSeries、pmMap(未給fun)、genDiagFunLog、getDiag之跨realm行為隨之(R-PM-SETTLE-01規則2: 不產生未處理之rejection)
//每案於獨立子行程執行(test/tools/pmMarkHandledRunner.mjs), 跨realm之Promise以vm.runInNewContext產生; 有util(util.types.isPromise預檢)與無util(子行程刪除process.getBuiltinModule, 全由then之品牌檢查判定)兩種環境各一次


let runner = fileURLToPath(new URL('./tools/pmMarkHandledRunner.mjs', import.meta.url))


for (let [envName, env] of [['util.types available', undefined], ['no util.types: browser / Node<20.16 fallback', { ...process.env, PMH_NOUTIL: '1' }]]) {

    describe(`_pmMarkHandled (${envName})`, function() {

        let run = (name) => runChildCase(runner, name, { env }).r

        it(`should mark cross-realm and null-prototype native Promises as handled, without touching non-Promise values (no trap, no then call)`, function() {
            //「跨realm、原型為null者皆標記」: 無未處理之rejection; 「不讀其任何屬性、不觸發Proxy之陷阱、不呼叫一般thenable之then」: n為0
            assert.strict.deepStrictEqual(run('direct'), { out: { n: 0 }, unhandled: [], uncaught: [] })
        })

        it(`should keep using the built-in then captured at load time after Promise.prototype.then is overwritten`, function() {
            //「以載入時之Promise.prototype.then執行」: 改寫者不被呼叫(n為0), 標記照常生效(無未處理之rejection)
            assert.strict.deepStrictEqual(run('thenPatched'), { out: { n: 0 }, unhandled: [], uncaught: [] })
        })

        //原型為null之原生Promise無then(非thenable), pmSeries、pmMap依原值交出(結果陣列含該Promise本身, 呼叫端仍可取用); 跨realm者為thenable, 其rejection照常使pmSeries、pmMap reject

        it(`pmSeries without fun: a later cross-realm / null-prototype rejected Promise is not an unhandled rejection; cross-realm rejects pmSeries with its error, null-prototype is delivered as is [R-PM-SETTLE-01 rule 2]`, function() {
            let rej = (m) => ({ s: 'reject', v: m })
            let asIs = { s: 'resolve', v: ['a', '[Promise]'] }
            assert.strict.deepStrictEqual(run('series'), {
                out: { realm: rej('series:realm'), nullProto: asIs, realmNullProto: asIs, objRealm: rej('series:obj') },
                unhandled: [],
                uncaught: [],
            })
        })

        it(`pmMap without fun (takeLimit 1): a not-yet-dispatched cross-realm / null-prototype rejected Promise is not an unhandled rejection [R-PM-SETTLE-01 rule 2]`, function() {
            let asIs = { s: 'resolve', v: ['a', '[Promise]'] }
            assert.strict.deepStrictEqual(run('map'), { out: { realm: { s: 'reject', v: 'map:realm' }, nullProto: asIs, realmNullProto: asIs }, unhandled: [], uncaught: [] })
        })

        it(`should not change the results of resolved cross-realm / null-prototype Promises`, function() {
            //「預先標記後其結果仍由原流程取用」: 跨realm者取其值, 原型為null者依原值交出
            assert.strict.deepStrictEqual(run('resolved'), { out: { s: { s: 'resolve', v: ['a', 'b', '[Promise]'] }, m: { s: 'resolve', v: ['a', 'b', '[Promise]'] } }, unhandled: [], uncaught: [] })
        })

        it(`genDiagFunLog write and getDiag funLog returning cross-realm / null-prototype rejected Promises: no unhandled rejection [R-DIAG-01]`, function() {
            assert.strict.deepStrictEqual(run('diag'), { out: 'ok', unhandled: [], uncaught: [] })
        })

    })

}
