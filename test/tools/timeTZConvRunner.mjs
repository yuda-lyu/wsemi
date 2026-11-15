//timeTZConvRunner.mjs: elemLevelRulesB3.test.mjs〈十五〉之子行程執行器, 由測試以TZ環境變數設定系統時區後執行, 印出各呼叫之結果(JSON)
import timeTZ2day from '../../src/timeTZ2day.mjs'
import timeTZ2hour from '../../src/timeTZ2hour.mjs'
import timeTZ2min from '../../src/timeTZ2min.mjs'
import timemsTZ2day from '../../src/timemsTZ2day.mjs'
import timemsTZ2hour from '../../src/timemsTZ2hour.mjs'
import timemsTZ2min from '../../src/timemsTZ2min.mjs'
import timemsTZ2time from '../../src/timemsTZ2time.mjs'
import timeTZ2past from '../../src/timeTZ2past.mjs'
import timemsTZ2past from '../../src/timemsTZ2past.mjs'
import timeTZ2expire from '../../src/timeTZ2expire.mjs'
import timemsTZ2expire from '../../src/timemsTZ2expire.mjs'


let calls = JSON.parse(process.argv[2])
let fns = { timeTZ2day, timeTZ2hour, timeTZ2min, timemsTZ2day, timemsTZ2hour, timemsTZ2min, timemsTZ2time, timeTZ2past, timemsTZ2past, timeTZ2expire, timemsTZ2expire }
let r = {
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    results: calls.map(([fn, ...args]) => fns[fn](...args)),
}
process.stdout.write(JSON.stringify(r))
