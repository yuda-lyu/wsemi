import get from 'lodash-es/get.js'
import diagIfAsked from './_diagIfAsked.mjs'
import isbol from './isbol.mjs'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'
import isab from './isab.mjs'
import pickOpt from './_pickOpt.mjs'


/**
 * 由字串與Uint8Array陣列轉物件，為對obj2stru8arr序列化之數據進行反序列化
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/stru8arr2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} data.results 輸入待反序列化字串，其內二進位數據之標記為'[BlazeForUint8Array]::<i>'、'[BlazeForUint16Array]::<i>'、'[BlazeForArrayBuffer]::<i>'，須完整匹配整個字串值才視為二進位參照，故應用字串內夾雜標記文字者不受影響；恰與標記格式完整相同之應用字串由編碼端前置'[BlazeForPreventEscape]'跳脫，此處會剝除一層還原；標記格式正確但索引越界者視為壞封包。注意不支援還原舊版之'[Uint8Array]::<i>'、'[Uint16Array]::<i>'、'[ArrayBuffer]::<i>'標記
 * @param {Array} data.binarys 輸入Uint8Array陣列
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入讀取呼叫端之值或轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含呼叫端所拋出之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入讀取呼叫端之值或轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi stru8arr2obj] can not read'，同getDiag)，預設null
 * @returns {*} 回傳任意物件，輸入無效或反序列化失敗(如results非合法JSON、同一二進位索引被引用多次)時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空物件{}，而空物件{}亦為合法輸入之結果(如stru8arr2obj({ results: '{}', binarys: [] }))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * let r = {
 *     results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
 *     binarys: [new Uint8Array([66, 97, 115])]
 * }
 * let data = stru8arr2obj(r)
 * console.log(data)
 * // => {
 * //     a: 123,
 * //     b: 45.67,
 * //     c: 'l1-測試中文',
 * //     d: {
 * //         da: 123,
 * //         db: 45.67,
 * //         dc: 'l2-測試中文',
 * //         dd: [ 'a', 'xyz', 321, 76.54 ],
 * //         de: Uint8Array [ 66, 97, 115 ]
 * //     }
 * // }
 *
 * console.log(stru8arr2obj({ results: 'not-json', binarys: [] }, { returnWithStateAndMsg: true }))
 * // => {
 * //     state: 'error',
 * //     msg: 'invalid data.results: must be a valid JSON text'
 * // }
 *
 */
function stru8arr2obj(data, opt = {}) {

    //opt, 取快照: 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(C1/K3: 無法轉型回預設值, 不拋錯)
    let optSnap = pickOpt(opt, ['returnWithStateAndMsg'], [])

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(optSnap, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return {}
        }
    }

    //check
    if (!iseobj(data)) {
        return retError('invalid data: must be a non-empty object')
    }

    //results, binarys, 取值須攔截非預期錯誤(如data之getter拋錯), 否則會外拋至呼叫端
    let results = null
    let binarys = null
    try {
        results = data.results
        binarys = data.binarys
    }
    catch (err) {
        //data之getter可拋出任意值(含其文字); 訊息為固定詞彙(V19、V20), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi stru8arr2obj] can not read', err)
        return retError('invalid data: must be a readable object')
    }

    //check
    if (!isestr(results)) {
        return retError('invalid data.results: must be a non-empty string')
    }
    if (!isarr(binarys)) {
        return retError('invalid data.binarys: must be an array')
    }

    //reMark, 標記須完整匹配整個字串(錨定^與$), 否則應用字串內只要夾雜標記文字即被誤判為二進位參照; 索引直接取自捕獲組, 不再以replace去頭後交cint推算(殘留文字會被cint吃成0而取到錯誤之binary)
    let reMark = /^\[BlazeFor(Uint8Array|Uint16Array|ArrayBuffer)\]::(\d+)$/

    //own, 本函數自己拋出之Error(訊息已為V19固定詞彙), 於catch原樣取message; 其餘拋出值(Proxy陣列之陷阱等)為呼叫端所拋, 不轉出其文字, 改固定訊息(第663項)
    let own = new WeakSet()
    let bad = (msg) => {
        let e = new Error(msg)
        own.add(e)
        return e
    }

    //restoreBin, 依標記所記之原型別還原二進位
    //經obj2u8arr打包者, binarys內為切出之原始位元組Uint8Array, 須依型別重建; 未經打包者(直接呼叫obj2stru8arr)binarys內即為原物件, 已是該型別故原樣回傳
    let restoreBin = (type, id, b) => {
        if (type === 'Uint16Array' && !isu16arr(b)) {
            if (!isu8arr(b)) {
                throw bad(`invalid data.binarys[${id}]: must be a Uint16Array or a Uint8Array`)
            }
            if (b.byteLength % 2 !== 0) {
                throw bad(`invalid data.binarys[${id}]: must have an even byteLength to be restored to a Uint16Array`)
            }
            //Uint16Array之視圖要求byteOffset對齊且長度相符, 不符者複製一份以取得對齊之buffer
            let bb = (b.byteOffset === 0 && b.byteLength === b.buffer.byteLength) ? b : new Uint8Array(b)
            return new Uint16Array(bb.buffer)
        }
        if (type === 'ArrayBuffer' && !isab(b)) {
            if (!isu8arr(b)) {
                throw bad(`invalid data.binarys[${id}]: must be an ArrayBuffer or a Uint8Array`)
            }
            return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
        }
        return b
    }

    //reEsced, 編碼端對「與標記格式完整相同之應用字串」前置了跳脫記號, 此處剝掉一層還原; 允許重複跳脫故以*涵蓋多層
    let tagEsc = '[BlazeForPreventEscape]'
    let reEsced = /^\[BlazeForPreventEscape\](?:\[BlazeForPreventEscape\])*\[BlazeFor(?:Uint8Array|Uint16Array|ArrayBuffer)\]::\d+$/

    //used, 已被引用之二進位索引; 合法編碼端(obj2stru8arr)每個二進位值都配新索引, 同一索引被引用多次只可能為異常封包, 且ArrayBuffer標記每次引用都複製一份堆外記憶體(配置量=引用次數乘分塊大小), 故視為壞封包
    let used = new Set()

    let o = {}
    try {

        o = JSON.parse(results, function(key, value) {

            //check, 以首字元'['(charCode 91)快篩, 避免對每個字串都跑regex
            if (!isestr(value) || value.charCodeAt(0) !== 91) {
                return value
            }

            //m
            let m = reMark.exec(value)
            if (m === null) {

                //反跳脫, 剝掉一層跳脫記號還原應用字串
                if (reEsced.test(value)) {
                    return value.slice(tagEsc.length)
                }

                return value
            }

            //id, 須做界線檢查; 標記格式正確但索引不存在, 只可能為封包損毀或results與binarys不匹配, 故視為壞封包直接拋錯交由外層catch, 不可回undefined(reviver回undefined會使該鍵消失、陣列元素變null)而靜默毀損
            let id = Number(m[2])
            if (id >= binarys.length) {
                throw bad('invalid data.results: must only reference binary indexes that exist in data.binarys')
            }

            if (used.has(id)) {
                throw bad('invalid data.results: must not reference the same binary index more than once')
            }
            used.add(id)

            return restoreBin(m[1], id, binarys[id])
        })

    }
    catch (err) {
        //own為本函數自己拋出(訊息已為固定詞彙); results非合法JSON之SyntaxError與巢狀過深之RangeError(引擎自身之錯誤)為固定詞彙;
        //其餘為reviver內讀呼叫端之binarys(Proxy陣列、元素存取拋錯等)所拋之任意值(含其文字), 不可轉出(V20), 訊息為固定詞彙, 細節經opt之診斷出口(預設靜默)
        if (own.has(err)) {
            return retError(err.message)
        }
        let isEngine = false
        try {
            isEngine = err instanceof SyntaxError || err instanceof RangeError
        }
        catch (err2) {
            //instanceof對呼叫端拋出之Proxy會觸發其getPrototypeOf陷阱而拋錯, 視為非引擎自身之錯誤(不外拋)
        }
        if (isEngine) {
            return retError('invalid data.results: must be a valid JSON text')
        }
        diagIfAsked(opt, '[wsemi stru8arr2obj] can not read', err)
        return retError('invalid data.binarys: must be a readable array')
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: o,
        }
    }
    else {
        return o
    }
}


export default stru8arr2obj
