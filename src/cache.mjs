import loGet from 'lodash-es/get.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import evem from './evem.mjs'
import isfun from './isfun.mjs'
import isbol from './isbol.mjs'
import haskey from './haskey.mjs'
import ispint from './ispint.mjs'
import isarr from './isarr.mjs'
import cint from './cint.mjs'


/**
 * 非同步函數快取，通過指定key代表函數與其輸入、代為執行與快取。快取可設定失效時間，超過失效時間則重新執行與再更新快取
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cache.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳事件物件，可呼叫函數on、set、get、getProxy、clear、remove。on為監聽事件，需自行監聽message與error事件。set為加入待執行函數，函數結束回傳欲快取的值，set傳入參數依序為key與快取物件，key為唯一識別字串，可使用函數加上輸入參數作為key，因考慮輸入參數可能為大量數據會有效能問題，由開發者自行決定key，而快取物件需設定欄位fun為待執行的非同步函數、inputs為待執行函數fun的傳入參數組、timeExpired為過期時間整數，單位為毫秒ms，預設5000、timeFrom為快取時間之起算點，可選'start'或'end'，'start'為自函數開始執行時起算，'end'為自函數執行完畢時起算，預設'start'、cacheError為函數執行失敗時是否快取，預設true，失敗時快取值為undefined並保留整個timeExpired，若設定false則失敗不快取，錯誤會拋給呼叫端(含等待中之併發呼叫)且下次get重新執行、useCloneDeep為取值時是否複製快取值後才回傳，預設true，因快取值若為物件則可能受外部調用而被修改到快取區的記憶體，若快取值為大量數據可設定false以節省複製開銷，但呼叫端須自行確保不修改所取得之值。get為依照key取得目前快取值，若該key之函數執行中則共用執行中之promise，待其執行完畢即一併取得結果，不另行輪詢，get傳入參數依序為key與設定物件，設定物件之欄位useCloneDeep可覆寫set時之設定，未指定時沿用set之設定。getProxy為合併set與get功能，直接set註冊待執行函數與取值，傳入參數同set，且會一併傳給get，回傳同get。update為強制更新key所屬快取值，同時也會更新該快取之時間至當前，於函數執行中呼叫時以update之值為準，不被執行結果覆寫。clear為清除key所屬快取的是否執行標記，使該快取視為需重新執行函數取值，於函數執行中呼叫亦有效，執行中之呼叫仍取得本次結果，下次get才重新執行。remove為直接清除key所屬快取，清除後用set重設
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oc = cache()
 *
 *             // oc.on('message', function(msg) {
 *             //     console.log('message', msg)
 *             // })
 *             // oc.on('error', function(msg) {
 *             //     console.log('error', msg)
 *             // })
 *
 *             let i = 0
 *             let j = 0
 *             function fun(v1, v2) {
 *                 i++
 *                 console.log('call fun, count=' + i)
 *                 ms.push('call fun, count=' + i)
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         j++
 *                         ms.push(v1 + '|' + v2 + ', count=' + j)
 *                         resolve(v1 + '|' + v2 + ', count=' + j)
 *                     }, 300)
 *                 })
 *             }
 *
 *             oc.set('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 }) //快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *             setTimeout(function() {
 *                 //第1次呼叫(1ms), 此時沒有快取只能執行取值, 執行300ms後回應, 會取得第1次結果(count=1)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 1st', msg)
 *                         ms.push('fun 1st', msg)
 *                     })
 *             }, 1)
 *             setTimeout(function() {
 *                 //第2次呼叫(50ms), 此時第1次呼叫還沒完成(要到300ms), 故get會共用執行中的promise等待, 於第1次執行完畢(300ms)時一併取得第1次結果(count=1)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 2nd', msg)
 *                         ms.push('fun 2nd', msg)
 *                     })
 *             }, 50)
 *             setTimeout(function() {
 *                 //第3次呼叫(250ms), 此時第1次呼叫還沒完成(要到300ms), 同第2次呼叫共用執行中的promise等待, 於300ms時一併取得第1次結果(count=1)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 3rd', msg)
 *                         ms.push('fun 3rd', msg)
 *                     })
 *             }, 250)
 *             setTimeout(function() {
 *                 //第4次呼叫(500ms), 此時第1次呼叫已結束(300ms), 且第1次快取(count=1)未過期(要到1200ms), 故get可拿到第1次計算的快取(count=1)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 4th', msg)
 *                         ms.push('fun 4th', msg)
 *                     })
 *             }, 500)
 *             setTimeout(function() {
 *                 //第5次呼叫(1300ms), 此時第1次快取(count=1)已過期(1200ms), 故重新執行取值(1300~1600ms執行, 2500ms過期), 於1600ms取得第2次結果(count=2)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 5th', msg)
 *                         ms.push('fun 5th', msg)
 *                     })
 *             }, 1300)
 *             setTimeout(function() {
 *                 //第6次呼叫(1600ms), 此時第2次執行剛好結束(1600ms), 若尚未結束則共用執行中的promise等待, 若已結束則直接拿快取, 皆會取得第2次結果(count=2)
 *                 oc.get('fun')
 *                     .then(function(msg) {
 *                         console.log('fun 6th', msg)
 *                         ms.push('fun 6th', msg)
 *                     })
 *             }, 1600)
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 2400)
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // call fun, count=1
 *     // fun 1st inp1|inp2, count=1
 *     // fun 2nd inp1|inp2, count=1
 *     // fun 3rd inp1|inp2, count=1
 *     // fun 4th inp1|inp2, count=1
 *     // call fun, count=2
 *     // fun 5th inp1|inp2, count=2
 *     // fun 6th inp1|inp2, count=2
 *     // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun 4th","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2","fun 6th","inp1|inp2, count=2"]
 *
 *     function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oc = cache()
 *
 *             // oc.on('message', function(msg) {
 *             //     console.log('message', msg)
 *             // })
 *             // oc.on('error', function(msg) {
 *             //     console.log('error', msg)
 *             // })
 *
 *             let i = 0
 *             let j = 0
 *             function fun(v1, v2) {
 *                 i++
 *                 console.log('call fun, count=' + i)
 *                 ms.push('call fun, count=' + i)
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         j++
 *                         ms.push(v1 + '|' + v2 + ', count=' + j)
 *                         resolve(v1 + '|' + v2 + ', count=' + j)
 *                     }, 300)
 *                 })
 *             }
 *
 *             oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 }) //首次getProxy即註冊並執行取值(0~300ms), 快取1200ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留800ms
 *             setTimeout(function() {
 *                 //第1次呼叫(1ms), 此時首次getProxy執行中, 會共用執行中的promise等待, 於300ms取得第1次結果(count=1)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 1st', msg)
 *                         ms.push('fun 1st', msg)
 *                     })
 *             }, 1)
 *             setTimeout(function() {
 *                 //第2次呼叫(100ms), 此時執行中, 同第1次呼叫共用執行中的promise等待, 於300ms取得第1次結果(count=1)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 2nd', msg)
 *                         ms.push('fun 2nd', msg)
 *                     })
 *             }, 100)
 *             setTimeout(function() {
 *                 //第3次呼叫(500ms), 此時已有快取, 直接取得第1次結果(count=1)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 3rd', msg)
 *                         ms.push('fun 3rd', msg)
 *                     })
 *             }, 500)
 *             setTimeout(function() {
 *                 //第4次呼叫(1300ms), 此時第1次快取(count=1)已失效(1200ms), 會重新呼叫函數取值(1300~1600ms), 取得第2次結果(count=2)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1200 })
 *                     .then(function(msg) {
 *                         console.log('fun 4th', msg)
 *                         ms.push('fun 4th', msg)
 *                     })
 *             }, 1300)
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 1700)
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // call fun, count=1
 *     // fun 1st inp1|inp2, count=1
 *     // fun 2nd inp1|inp2, count=1
 *     // fun 3rd inp1|inp2, count=1
 *     // call fun, count=2
 *     // fun 4th inp1|inp2, count=2
 *     // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","call fun, count=2","inp1|inp2, count=2","fun 4th","inp1|inp2, count=2"]
 *
 *     function test3() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let oc = cache()
 *
 *             // oc.on('message', function(msg) {
 *             //     console.log('message', msg)
 *             // })
 *             // oc.on('error', function(msg) {
 *             //     console.log('error', msg)
 *             // })
 *
 *             let i = 0
 *             let j = 0
 *             function fun(v1, v2) {
 *                 i++
 *                 console.log('call fun, count=' + i)
 *                 ms.push('call fun, count=' + i)
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         j++
 *                         ms.push(v1 + '|' + v2 + ', count=' + j)
 *                         resolve(v1 + '|' + v2 + ', count=' + j)
 *                     }, 300)
 *                 })
 *             }
 *
 *             oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 }) //首次getProxy即註冊並執行取值(0~300ms), 快取1500ms, 但第1次執行就需要300ms, 故執行完畢後只會再保留1200ms
 *             setTimeout(function() {
 *                 //第1次呼叫(延遲1ms), 此時首次getProxy執行中, 會共用執行中的promise等待, 於300ms取得第1次結果(count=1)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 1st', msg)
 *                         ms.push('fun 1st', msg)
 *                     })
 *             }, 1)
 *             setTimeout(function() {
 *                 //第2次呼叫(延遲200ms), 此時執行中, 同第1次呼叫共用執行中的promise等待, 於300ms取得第1次結果(count=1), 早於被強制更新(1100ms)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 2nd', msg)
 *                         ms.push('fun 2nd', msg)
 *                     })
 *             }, 200)
 *             setTimeout(function() {
 *                 //第3次呼叫(500ms), 此時已有快取, 直接取得第1次結果(count=1)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 3rd', msg)
 *                         ms.push('fun 3rd', msg)
 *                     })
 *             }, 500)
 *             setTimeout(function() {
 *                 //更新快取值(延遲1100ms), 快取值為abc, 快取時間也被更新至此時, 故會重新計算1500ms才會失效
 *                 oc.update('fun', 'abc')
 *                 console.log('fun update', 'abc')
 *                 ms.push('fun update', 'abc')
 *             }, 1100)
 *             setTimeout(function() {
 *                 //第4次呼叫(延遲1300ms), 此時會取得被強制更新之快取值(abc), 快取還剩1300ms才失效(也就是在2600ms失效)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 4th', msg)
 *                         ms.push('fun 4th', msg)
 *                     })
 *             }, 1300)
 *             setTimeout(function() {
 *                 //第5次呼叫(延遲2700ms), 此時被強制更新之快取值(abc)已失效, 會重新呼叫函數取值, 取得第2次結果(count=2)
 *                 oc.getProxy('fun', { fun, inputs: ['inp1', 'inp2'], timeExpired: 1500 })
 *                     .then(function(msg) {
 *                         console.log('fun 5th', msg)
 *                         ms.push('fun 5th', msg)
 *                     })
 *             }, 2700)
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 3100)
 *
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // call fun, count=1
 *     // fun 1st inp1|inp2, count=1
 *     // fun 2nd inp1|inp2, count=1
 *     // fun 3rd inp1|inp2, count=1
 *     // fun update abc
 *     // fun 4th abc
 *     // call fun, count=2
 *     // fun 5th inp1|inp2, count=2
 *     // ["call fun, count=1","inp1|inp2, count=1","fun 1st","inp1|inp2, count=1","fun 2nd","inp1|inp2, count=1","fun 3rd","inp1|inp2, count=1","fun update","abc","fun 4th","abc","call fun, count=2","inp1|inp2, count=2","fun 5th","inp1|inp2, count=2"]
 *
 *     async function test4() {
 *         //執行中clear與update: clear於執行中呼叫仍有效(執行中之呼叫取得本次結果, 下次get重新執行); update於執行中呼叫以update之值為準, 不被執行結果覆寫
 *         let oc = cache()
 *
 *         let n = 0
 *         let fun = () => {
 *             n++
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(function() {
 *                     resolve('count=' + n)
 *                 }, 100)
 *             })
 *         }
 *
 *         //clear於執行中
 *         oc.set('clear', { fun, inputs: [], timeExpired: 30000 })
 *         let pm1 = oc.get('clear')
 *         await new Promise((resolve) => setTimeout(resolve, 10))
 *         oc.clear('clear')
 *         let v1 = await pm1 //執行中之呼叫取得本次結果(count=1)
 *         let v2 = await oc.get('clear') //clear有效, 重新執行(count=2)
 *         let v3 = await oc.get('clear') //快取(count=2)
 *
 *         //update於執行中
 *         n = 0
 *         oc.set('update', { fun, inputs: [], timeExpired: 30000 })
 *         let pm2 = oc.get('update')
 *         await new Promise((resolve) => setTimeout(resolve, 10))
 *         oc.update('update', 'abc')
 *         let v4 = await pm2 //以update之值為準(abc)
 *         let v5 = await oc.get('update') //快取(abc), 不重新執行
 *
 *         return { v1, v2, v3, v4, v5, n }
 *     }
 *     console.log('test4')
 *     let r4 = await test4()
 *     console.log(JSON.stringify(r4))
 *     // test4
 *     // {"v1":"count=1","v2":"count=2","v3":"count=2","v4":"abc","v5":"abc","n":1}
 *
 *     async function test5() {
 *         //timeFrom: 預設'start'自fun開始起算, 'end'自fun結束起算; fun耗時200ms, timeExpired 220ms, 結束後再隔120ms取值: 'start'時已過期(320>220)重新執行, 'end'時未過期(120<220)取快取
 *         let oc = cache()
 *
 *         let n = 0
 *         let fun = () => {
 *             n++
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(function() {
 *                     resolve('count=' + n)
 *                 }, 200)
 *             })
 *         }
 *
 *         oc.set('start', { fun, inputs: [], timeExpired: 220 }) //預設timeFrom='start'
 *         let v1 = await oc.get('start')
 *         await new Promise((resolve) => setTimeout(resolve, 120))
 *         let v2 = await oc.get('start')
 *
 *         n = 0
 *         oc.set('end', { fun, inputs: [], timeExpired: 220, timeFrom: 'end' })
 *         let v3 = await oc.get('end')
 *         await new Promise((resolve) => setTimeout(resolve, 120))
 *         let v4 = await oc.get('end')
 *
 *         return { v1, v2, v3, v4 }
 *     }
 *     console.log('test5')
 *     let r5 = await test5()
 *     console.log(JSON.stringify(r5))
 *     // test5
 *     // {"v1":"count=1","v2":"count=2","v3":"count=1","v4":"count=1"}
 *
 *     async function test6() {
 *         //cacheError: 預設true失敗快取undefined; false時失敗不快取, 錯誤拋給執行者與等待中之併發呼叫, 下次get重新執行, error事件仍發出
 *         let oc = cache()
 *
 *         let errs = []
 *         oc.on('error', function(msg) {
 *             errs.push(msg.key + ':' + msg.msg.message)
 *         })
 *
 *         let n = 0
 *         let fun = () => {
 *             n++
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(function() {
 *                     if (n <= 2) {
 *                         reject(new Error('down' + n))
 *                     }
 *                     else {
 *                         resolve('up' + n)
 *                     }
 *                 }, 50)
 *             })
 *         }
 *
 *         oc.set('fun', { fun, inputs: [], timeExpired: 30000, cacheError: false })
 *
 *         //第1次執行失敗: 執行者與等待中之併發呼叫皆收到reject
 *         let pm1 = oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
 *         await new Promise((resolve) => setTimeout(resolve, 10))
 *         let pm2 = oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
 *         let r1 = await pm1
 *         let r2 = await pm2
 *
 *         //第2次執行仍失敗(失敗不快取故重新執行)
 *         let r3 = await oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
 *
 *         //第3次執行成功並快取
 *         let r4 = await oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
 *         let r5 = await oc.get('fun').then((v) => 'ok:' + v).catch((e) => 'err:' + e.message)
 *
 *         await new Promise((resolve) => setTimeout(resolve, 50)) //error事件以timer脫勾發送, 稍待
 *
 *         return { rs: [r1, r2, r3, r4, r5], n, errs }
 *     }
 *     console.log('test6')
 *     let r6 = await test6()
 *     console.log(JSON.stringify(r6))
 *     // test6
 *     // {"rs":["err:down1","err:down1","err:down2","ok:up3","ok:up3"],"n":3,"errs":["fun:down1","fun:down2"]}
 *
 *     async function test7() {
 *         //useCloneDeep: 預設true回傳複製值, 呼叫端修改不影響快取; 設false則直接回傳快取內之值(為同一參照), 可省去大量數據之複製開銷, 但呼叫端須自行確保不修改
 *         let oc = cache()
 *
 *         let fun = async () => {
 *             return { a: 1 }
 *         }
 *
 *         //預設true
 *         oc.set('clone', { fun, inputs: [], timeExpired: 30000 })
 *         let v1 = await oc.get('clone')
 *         v1.a = 2 //修改所取得之值
 *         let v2 = await oc.get('clone') //快取未受影響
 *
 *         //get傳入useCloneDeep=false
 *         oc.set('noclone', { fun, inputs: [], timeExpired: 30000 })
 *         let v3 = await oc.get('noclone', { useCloneDeep: false })
 *         let v4 = await oc.get('noclone', { useCloneDeep: false })
 *
 *         //set時設定useCloneDeep=false, get未指定則沿用set之設定
 *         oc.set('setnoclone', { fun, inputs: [], timeExpired: 30000, useCloneDeep: false })
 *         let v5 = await oc.get('setnoclone')
 *         let v6 = await oc.get('setnoclone')
 *
 *         //get之設定可覆寫set之設定
 *         let v7 = await oc.get('setnoclone', { useCloneDeep: true })
 *
 *         return { v2, sameNoclone: v3 === v4, sameSetnoclone: v5 === v6, sameOverride: v5 === v7 }
 *     }
 *     console.log('test7')
 *     let r7 = await test7()
 *     console.log(JSON.stringify(r7))
 *     // test7
 *     // {"v2":{"a":1},"sameNoclone":true,"sameSetnoclone":true,"sameOverride":false}
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function cache() {
    let ev = evem()
    let data = {} //快取資料

    function emit(mode, data) {
        setTimeout(() => { //用timer脫勾
            ev.emit(mode, data)
        }, 1)
    }

    function set(key, opt = {}) {

        //check
        if (haskey(data, key)) {
            //可重複設定不報錯
            //emit('error', { fun: 'set', key, msg: 'has key' })
            return
        }

        //fun
        let fun = loGet(opt, 'fun')
        if (!isfun(fun)) {
            fun = async () => {}
        }

        //inputs
        let inputs = loGet(opt, 'inputs')
        if (!isarr(inputs)) {
            inputs = []
        }

        //timeExpired
        let timeExpired = loGet(opt, 'timeExpired')
        if (!ispint(timeExpired)) {
            timeExpired = 5000
        }
        timeExpired = cint(timeExpired)

        //timeFrom
        let timeFrom = loGet(opt, 'timeFrom')
        if (timeFrom !== 'end') {
            timeFrom = 'start'
        }

        //cacheError
        let cacheError = loGet(opt, 'cacheError')
        if (cacheError !== false) {
            cacheError = true
        }

        //useCloneDeep
        let useCloneDeep = loGet(opt, 'useCloneDeep')
        if (!isbol(useCloneDeep)) {
            useCloneDeep = true
        }

        //save
        data[key] = {
            needExec: true,
            fun,
            pm: null, //執行中之promise, null代表非執行中
            gen: 0, //update次數, 執行中若被update則gen改變, 用於使執行結果不覆寫update之值
            inputs,
            value: null,
            time: null,
            timeExpired,
            timeFrom,
            cacheError,
            useCloneDeep,
        }
        emit('message', { fun: 'set', key, timeExpired, timeFrom, cacheError, useCloneDeep })

    }

    async function get(key, opt = {}) {
        if (haskey(data, key)) {
            let d = data[key] //取物件參照, 執行中若遭remove仍可正常收尾

            //useCloneDeep, 未指定時沿用set時之設定
            let useCloneDeep = loGet(opt, 'useCloneDeep')
            if (!isbol(useCloneDeep)) {
                useCloneDeep = d.useCloneDeep
            }

            //若執行中則共用執行中之promise, 待其執行完畢即一併取得結果, 不輪詢
            if (d.pm) {
                emit('message', { fun: 'get', key, msg: 'waiting' })
                await d.pm
                return (useCloneDeep) ? cloneDeep(d.value) : d.value
            }

            //t
            let t = Date.now()

            //needExec or timeExpired
            let b = d.needExec
            let timeDiff = (t - d.time)
            if (b) {
                emit('message', { fun: 'get', key, msg: 'execute first' })
            }
            else if (d.timeExpired > 0 && (timeDiff > d.timeExpired)) {
                emit('message', { fun: 'get', key, msg: 'execute by timeExpired', timeDiff })
                b = true
            }

            //fun
            if (b) {
                emit('message', { fun: 'get', key, msg: 'fun start' })
                d.needExec = false //受理即清除標記, 執行中若再clear會重設為true, 留待下次get重新執行
                let gen = d.gen //執行中若被update則d.gen改變, 本次執行結果不覆寫update之值與時間
                let run = async () => {
                    try {
                        let v
                        try {
                            v = await d.fun(...d.inputs) //fun同步拋錯或回傳非promise皆由try與await承接
                        }
                        catch (err) {
                            emit('error', { fun: 'get', key, msg: err })
                            if (!d.cacheError) {
                                //失敗不快取: 值與時間不動, 下次get重新執行, 錯誤拋給執行者與等待中之併發呼叫
                                if (d.gen === gen) {
                                    d.needExec = true
                                }
                                throw err
                            }
                            v = undefined //失敗快取: 值為undefined並保留整個timeExpired
                        }
                        if (d.gen === gen) {
                            d.value = v
                            d.time = (d.timeFrom === 'end') ? Date.now() : t //timeFrom為end時自執行完畢起算, 否則自執行開始起算
                        }
                    }
                    finally {
                        d.pm = null
                        emit('message', { fun: 'get', key, msg: 'fun end' })
                    }
                }
                d.pm = run() //自get進入至此無await, 故同一tick內之後到者亦可見d.pm而共用
                await d.pm
            }
            else {
                emit('message', { fun: 'get', key, msg: 'use cache' })
            }

            return (useCloneDeep) ? cloneDeep(d.value) : d.value //若為物件可能受外部調用而被修改到快取區的記憶體, 故預設得用cloneDeep複製才回傳, 而useCloneDeep為false時直接回傳快取內之值, 由呼叫端自行確保不修改
        }
        else {
            emit('error', { fun: 'get', key, msg: 'invalid key' })
            return null
        }
    }

    async function getProxy(key, opt = {}) {
        set(key, opt)
        return get(key, opt) //opt一併傳給get, 使useCloneDeep等取值設定於getProxy亦可生效
    }

    function update(key, value) {
        if (haskey(data, key)) {
            emit('message', { fun: 'updateValue', key })
            data[key].value = value
            data[key].time = Date.now()
            data[key].gen += 1 //執行中被update時, 使本次執行結果不覆寫此值與時間
        }
    }

    function clear(key) {
        if (haskey(data, key)) {
            emit('message', { fun: 'clear', key })
            data[key].needExec = true //於執行中呼叫亦有效: 執行中之呼叫仍取得本次結果, 下次get重新執行
        }
    }

    function remove(key) {
        if (haskey(data, key)) {
            emit('message', { fun: 'remove', key })
            delete data[key]
        }
    }

    //save
    ev.set = set
    ev.getProxy = getProxy
    ev.get = get
    ev.update = update
    ev.clear = clear
    ev.remove = remove

    return ev
}


export default cache
