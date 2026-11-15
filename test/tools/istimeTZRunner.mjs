//istimeTZRunner.mjs: elemLevelRulesB3.test.mjs〈十四〉之子行程執行器, 由測試以TZ環境變數設定系統時區後執行, 印出各輸入之判斷結果(JSON)
import istimeTZ from '../../src/istimeTZ.mjs'
import istimemsTZ from '../../src/istimemsTZ.mjs'
import istime from '../../src/istime.mjs'
import istimems from '../../src/istimems.mjs'


let inputs = JSON.parse(process.argv[2])
let fns = { istimeTZ, istimemsTZ, istime, istimems }
let r = {
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    results: inputs.map(([fn, v]) => fns[fn](v)),
}
process.stdout.write(JSON.stringify(r))
