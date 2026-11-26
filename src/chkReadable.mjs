//可讀性探針(單一擁有者), 規則見sgud/rule/rulebook_readable.md R-READABLE-01
//
//背景: 判斷函數(isobj、isarr、iseobj、isearr、isfun、haskey等)對「讀取即拋錯」之值(拋錯之Symbol.toStringTag、已撤銷之Proxy、陷阱拋錯之Proxy、元素讀取拋錯之陣列)一律回false而不拋錯(C2),
//呼叫端因而無從分辨「型別不符」與「不可讀」; 使用端各自實作探針(w-dispatch-ai、w-converhp、w-orm-lowdb、w-orm-level、w-serv-webdata)使讀取範圍與詞彙分歧, 故收斂為本函數.
//語意: 近驗證器(C11, 同chkOrmStr): 可讀回''、不可讀回固定原因字串(不回顯值、不帶原例外訊息), 永不拋錯; 不呼叫存取器(accessor)與toJSON, 不改寫受檢物.
//讀取範圍與wsemi判斷函數之內部讀取同源(逐項見JSDoc), 呼叫端於判斷函數之前先探針, 可讀者才交判斷函數.
//純JS: 不import任何模組、不用Node API; Reflect之方法、Object.prototype.toString、Array.isArray、WeakSet與WeakMap之方法、hasOwnProperty於模組載入時取得, 載入後被覆寫不影響結果(陣列迭代等語言層面之機制不在此保證內); 描述子之檢查一律用自有性(不受Object.prototype之汙染影響); 無模組層可變狀態(可重入).


//內建函數(模組載入時取得, 不受其後之全域汙染影響)
let call = Function.prototype.call
let toStr = call.bind(Object.prototype.toString)
let rOwnKeys = Reflect.ownKeys
let rGetProto = Reflect.getPrototypeOf
let rGetDesc = Reflect.getOwnPropertyDescriptor
let rGet = Reflect.get
let rHas = Reflect.has
let hasOwn = call.bind(Object.prototype.hasOwnProperty)
let isArray = Array.isArray
let isView = ArrayBuffer.isView
let strValueOf = call.bind(String.prototype.valueOf)
let isSafeInt = Number.isSafeInteger
let NewWeakSet = WeakSet
let NewWeakMap = WeakMap
let seenAdd = call.bind(WeakSet.prototype.add)
let seenHas = call.bind(WeakSet.prototype.has)
let wmGet = call.bind(WeakMap.prototype.get)
let wmSet = call.bind(WeakMap.prototype.set)
let symTag = Symbol.toStringTag

//原因詞彙(單一出處; 固定字串, 不回顯值)
let R = {
    tag: 'tag is unreadable',
    keys: 'keys are unreadable',
    key: 'key is unreadable',
    fun: 'function type is unreadable',
    length: 'length is unreadable',
    badLength: 'length is not a non-negative safe integer',
    many: 'too many elements',
    element: 'element is unreadable',
    prop: 'property is unreadable',
    large: 'structure is too large',
    fail: 'unreadable',
}

//原型鏈之走訪上限(Proxy之getPrototypeOf陷阱可回傳循環, 以此上限終止並視為不可讀)
let PROTO_MAX = 1000

//陣列長度預設上限
let ELEMENTS_MAX = 1000000

//深探之讀取總量預設上限(走訪之節點、陣列元素、物件鍵各計一次; 防止多個各自未逾maxElements之稀疏陣列或陷阱不斷產生新節點之圖使深探近乎無限)
let READS_MAX = 50000000

//elements之合法值
let ELEMENTS = ['none', 'first', 'all']


//isRef, 非null之物件或函數(其餘為原始值, 無可讀取者)
let isRef = (v) => v !== null && (typeof v === 'object' || typeof v === 'function')


//ownData, 取opt之自有資料屬性值(存取器不呼叫、繼承值不採用), 無或讀取拋錯回undefined
let ownData = (o, k) => {
    try {
        let d = rGetDesc(o, k)
        return d !== undefined && hasOwn(d, 'value') ? d.value : undefined
    }
    catch (err) {
        return undefined
    }
}


//readOpt, 解析opt(每鍵只讀一次, 非預期之輸入視為未給改用預設; opt本身非物件視為{})
let readOpt = (opt) => {
    let o = { deep: false, fun: false, ownKeys: false, has: [], elements: 'none', maxElements: ELEMENTS_MAX, maxReads: READS_MAX }
    if (!isRef(opt) || typeof opt === 'function') {
        return o
    }
    let deep = ownData(opt, 'deep')
    let fun = ownData(opt, 'fun')
    let ownKeys = ownData(opt, 'ownKeys')
    let has = ownData(opt, 'has')
    let elements = ownData(opt, 'elements')
    let maxElements = ownData(opt, 'maxElements')
    let maxReads = ownData(opt, 'maxReads')
    o.deep = deep === true
    o.fun = fun === true
    o.ownKeys = ownKeys === true
    if (typeof elements === 'string' && ELEMENTS.includes(elements)) {
        o.elements = elements
    }
    if (typeof maxElements === 'number' && isSafeInt(maxElements) && maxElements >= 0) {
        o.maxElements = maxElements
    }
    if (typeof maxReads === 'number' && isSafeInt(maxReads) && maxReads >= 0) {
        o.maxReads = maxReads
    }
    try {
        if (isArray(has)) {
            let n = ownData(has, 'length')
            if (typeof n === 'number' && isSafeInt(n) && n > 0 && n <= 1000) {
                for (let i = 0; i < n; i++) {
                    let k = ownData(has, String(i))
                    if (typeof k === 'string' || typeof k === 'symbol') {
                        o.has.push(k)
                    }
                    else if (typeof k === 'number') {
                        o.has.push(String(k)) //haskey亦收數字鍵(0 in obj與'0' in obj同)
                    }
                }
            }
        }
    }
    catch (err) {
        //has之讀取失敗視為未給
    }
    return o
}


//readData, 讀取自有屬性k之值, 存取器不呼叫: { err } 讀取拋錯; { absent } 非自有; { accessor } 存取器(略過); { value } 資料屬性
//  先取描述子再取值: 一般物件為資料屬性時Reflect.get不執行任何使用端程式, Proxy則觸發其getOwnPropertyDescriptor與get陷阱(與判斷函數以v[k]讀取者同源)
let readData = (v, k) => {
    let d
    try {
        d = rGetDesc(v, k)
    }
    catch (err) {
        return { err: true }
    }
    if (d === undefined) {
        return { absent: true }
    }
    if (!hasOwn(d, 'value')) {
        return { accessor: true }
    }
    try {
        return { value: rGet(v, k) }
    }
    catch (err) {
        return { err: true }
    }
}


//hasToJSON, 沿原型鏈查toJSON(只看描述子, 不讀值、不呼叫); 查詢拋錯視為無
let hasToJSON = (x, cache) => {
    try {
        let chain = []
        let p = x
        let n = 0
        while (p !== null && p !== undefined && n < PROTO_MAX) {
            let c = wmGet(cache, p)
            if (c !== undefined) {
                for (let q of chain) {
                    wmSet(cache, q, c)
                }
                return c
            }
            chain.push(p)
            let d = rGetDesc(p, 'toJSON')
            if (d !== undefined) {
                let r = (hasOwn(d, 'value') && typeof d.value === 'function') || (hasOwn(d, 'get') && d.get !== undefined)
                for (let q of chain) {
                    wmSet(cache, q, r)
                }
                return r
            }
            p = rGetProto(p)
            n++
        }
        for (let q of chain) {
            wmSet(cache, q, false)
        }
        return false
    }
    catch (err) {
        return false
    }
}


//isVirtualKeyed, 自有索引鍵為虛擬者: 型別陣列(含Buffer)、DataView與String包裝物件; 其索引鍵不存在於物件中, Reflect.ownKeys會一次配置全部索引字串(長度大時耗盡記憶體), 且非Proxy之此類物件讀鍵與描述子不可能拋錯, 故不列舉(有界)
//  以內部槽判定(ArrayBuffer.isView、String.prototype.valueOf), 偽造Symbol.toStringTag者不受影響; Proxy包裝者非此類(其鍵經陷阱讀取, 為呼叫端之程式, 無從先行得知大小), 照常讀取
let isVirtualKeyed = (x) => {
    try {
        if (isView(x)) {
            return true
        }
        strValueOf(x)
        return true
    }
    catch (err) {
        return false
    }
}


//readKeys, ownKeys之讀取: 所有物件與函數讀自有鍵(Reflect.ownKeys); 標籤為[object Object]者另沿原型鏈逐層讀自有鍵與全部自有鍵(字串與Symbol)之描述子(iseobj之for...in讀取之超集)
//  有界: 虛擬索引鍵者(isVirtualKeyed)不列舉; 描述子之讀取總量超過maxReads回'structure is too large'(同opt.deep); 原型鏈超過PROTO_MAX層回'keys are unreadable'; 回傳''或原因
let readKeys = (v, tag, maxReads) => {
    try {
        if (!isVirtualKeyed(v)) {
            rOwnKeys(v)
        }
        if (tag === '[object Object]') {
            let p = v
            let n = 0
            let reads = 0
            while (p !== null) {
                if (n >= PROTO_MAX) {
                    return R.keys
                }
                if (!isVirtualKeyed(p)) {
                    let ks = rOwnKeys(p)
                    for (let k of ks) {
                        reads++
                        if (reads > maxReads) {
                            return R.large
                        }
                        rGetDesc(p, k)
                    }
                }
                p = rGetProto(p)
                n++
            }
        }
        return ''
    }
    catch (err) {
        return R.keys
    }
}


//readElements, 陣列之長度與元素: first同isearr(讀length, 為1時讀[0]), all讀length並逐一讀取元素(存取器略過)
//  回傳''或原因
let readElements = (v, mode, max) => {
    let L = readData(v, 'length')
    if (L.err) {
        return R.length
    }
    if (mode === 'first') {
        if (L.value === 1) {
            let E = readData(v, '0')
            if (E.err) {
                return R.element
            }
        }
        return ''
    }
    let n = L.value
    if (!(typeof n === 'number' && isSafeInt(n) && n >= 0)) {
        return R.badLength
    }
    if (n > max) {
        return R.many
    }
    for (let i = 0; i < n; i++) {
        let E = readData(v, String(i))
        if (E.err) {
            return R.element
        }
    }
    return ''
}


//readDeep, 深探: 迭代堆疊走訪(不遞迴), WeakSet去重(循環與共享參照不算不可讀), 走訪範圍對齊序列化器會走到者
//  葉節點(不展開): 函數、型別陣列與DataView、ArrayBuffer、SharedArrayBuffer、Error、DOMException、有toJSON者; 陣列逐元素(含長度檢查), 其他物件取自有可列舉字串鍵之資料屬性值; 存取器不呼叫、其回傳值不在範圍
let readDeep = (root, max, maxReads) => {
    let reads = 0
    let seen = new NewWeakSet()
    let cache = new NewWeakMap()
    let stack = [root]
    while (stack.length > 0) {
        let x = stack.pop()
        if (seenHas(seen, x)) {
            continue
        }
        reads++
        if (reads > maxReads) {
            return R.large
        }
        seenAdd(seen, x)
        let tag = ''
        try {
            tag = toStr(x)
        }
        catch (err) {
            return R.tag
        }
        if (typeof x === 'function') {
            continue
        }
        let leaf = false
        try {
            leaf = isView(x) || tag === '[object ArrayBuffer]' || tag === '[object SharedArrayBuffer]' || tag === '[object Error]' || tag === '[object DOMException]' || isVirtualKeyed(x) //String包裝物件(序列化器取其原始字串)亦為葉節點, 其虛擬索引鍵不列舉(有界)
        }
        catch (err) {
            leaf = false
        }
        if (leaf || hasToJSON(x, cache)) {
            continue
        }
        let isArr = false
        try {
            isArr = isArray(x)
        }
        catch (err) {
            return R.tag
        }
        if (isArr) {
            let L = readData(x, 'length')
            if (L.err) {
                return R.length
            }
            let n = L.value
            if (!(typeof n === 'number' && isSafeInt(n) && n >= 0)) {
                return R.badLength
            }
            if (n > max) {
                return R.many
            }
            for (let i = 0; i < n; i++) {
                reads++
                if (reads > maxReads) {
                    return R.large
                }
                let E = readData(x, String(i))
                if (E.err) {
                    return R.element
                }
                if (hasOwn(E, 'value') && isRef(E.value)) {
                    stack.push(E.value)
                }
            }
        }
        else {
            let ks
            try {
                ks = rOwnKeys(x)
            }
            catch (err) {
                return R.keys
            }
            for (let k of ks) {
                if (typeof k !== 'string') {
                    continue
                }
                reads++
                if (reads > maxReads) {
                    return R.large
                }
                let d
                try {
                    d = rGetDesc(x, k)
                }
                catch (err) {
                    return R.prop
                }
                if (d !== undefined && d.enumerable === true && hasOwn(d, 'value')) {
                    //與序列化器同讀(JSON.stringify經[[Get]]): 資料屬性取值經Reflect.get(一般物件不執行任何使用端程式, Proxy則觸發get陷阱), 走訪取此值而非描述子之value
                    let val
                    try {
                        val = rGet(x, k)
                    }
                    catch (err) {
                        return R.prop
                    }
                    if (isRef(val)) {
                        stack.push(val)
                    }
                }
            }
        }
    }
    return ''
}


/**
 * 可讀性探針，回傳''(可讀)或固定原因字串(不可讀)
 *
 * 判斷函數(isobj、isarr、iseobj、isearr、isfun、haskey等)對「讀取即拋錯」之值(拋錯之Symbol.toStringTag、已撤銷之Proxy、陷阱拋錯之Proxy、元素讀取拋錯之陣列)一律回false而不拋錯，
 * 呼叫端因而無從分辨「型別不符」與「不可讀」；本函數於判斷函數之前先探針：回''表示可讀(其後交判斷函數，false即為型別不符)，回原因字串表示不可讀(呼叫端依其失敗通道回報，不當成型別不符或未給)。
 *
 * 1. 永不拋錯：任何輸入(含已撤銷之Proxy、陷阱全拋錯之Proxy、讀取即拋錯之物件)與任何opt(null、非物件、存取器)皆不拋錯；opt非物件視為{}，各鍵只讀一次且只採自有資料屬性(存取器不呼叫、繼承值不採用)，非預期之鍵值視為未給改用預設。
 * 2. 不呼叫存取器(accessor)與toJSON：屬性與元素先取描述子，存取器者略過(不呼叫、不視為不可讀，其拋錯無從偵測)，toJSON只查描述子不讀值；不改寫受檢物。唯一會執行使用端程式者為Proxy之陷阱與Symbol.toStringTag之存取器(Object.prototype.toString之規格行為，與判斷函數同)。
 * 3. 原始值(null、undefined、數字、字串、布林、Symbol、BigInt)無可讀取者，一律回''。
 * 4. 預設(不給opt)之讀取範圍：對物件與函數讀內部標籤Object.prototype.toString.call(v)，與isobj、isarr、isnull、isfun之前置讀取同源；不可讀回'tag is unreadable'。
 * 5. opt.fun：另做函數型之讀取(isfun所用lodash isFunction之讀取，唯不讀Symbol.toStringTag之值、不暫時改寫)，即Symbol.toStringTag之has與描述子；不可讀回'function type is unreadable'。lodash之getRawTag另會暫時改寫與刪除Symbol.toStringTag，本函數不做(不改寫受檢物)，故僅壞set或deleteProperty陷阱之Proxy，isfun為false而本函數回''。
 * 6. opt.has：對各鍵k做k in v(haskey之讀取，觸發Proxy之has陷阱)；不可讀回'key is unreadable'；只收字串、Symbol與數字之鍵(數字同haskey轉為字串鍵)、至多1000個。
 * 7. opt.ownKeys：讀自有鍵(Reflect.ownKeys，觸發ownKeys陷阱)；標籤為[object Object]者另沿原型鏈逐層讀自有鍵與全部自有鍵(字串與Symbol)之描述子(觸發getPrototypeOf、getOwnPropertyDescriptor陷阱，為iseobj之for...in讀取之超集，原型鏈超過1000層視為不可讀)；不可讀回'keys are unreadable'。列舉有界：型別陣列(含Buffer)、DataView與String包裝物件之索引鍵為虛擬(Reflect.ownKeys會一次配置全部索引字串，長度大時耗盡記憶體)，且非Proxy之此類物件讀鍵不可能拋錯，故以內部槽判定後不列舉(原型鏈上之此類物件亦同，偽造Symbol.toStringTag者不受影響；Proxy包裝者照常經陷阱讀取)；描述子之讀取總量超過opt.maxReads回'structure is too large'。
 * 8. opt.elements：陣列之長度與元素。'none'(預設)不讀；'first'同isearr(讀length，為1時讀第0個元素)；'all'讀length(須為非負安全整數，否則回'length is not a non-negative safe integer'，超過opt.maxElements回'too many elements')並逐一讀取各元素(洞與存取器元素略過)。length不可讀回'length is unreadable'、元素不可讀回'element is unreadable'。'first'依內部標籤判陣列(同isarr)，'all'依Array.isArray；'first'以描述子加取值讀取，對Proxy較isearr(只讀length與[0])多觸發一次getOwnPropertyDescriptor陷阱(為其超集)。
 * 9. opt.deep：深探，迭代堆疊走訪(不遞迴，深層不致堆疊溢位)，WeakSet去重(循環與共享參照不算不可讀)；走訪範圍對齊序列化器會走到者：葉節點(函數、型別陣列與DataView、String包裝物件、ArrayBuffer、SharedArrayBuffer、Error、DOMException、有toJSON者)不展開，陣列逐元素(同opt.elements='all'，含長度檢查)，其他物件取自有可列舉字串鍵之資料屬性值(先取描述子，資料屬性再經Reflect.get取值，Proxy之get陷阱拋錯即不可讀，與序列化器經[[Get]]讀取同；Symbol鍵、不可列舉鍵、存取器略過)；葉節點依內部標籤判定，偽造Symbol.toStringTag者其子圖不被走訪(同序列化器，已知限制)；走訪之讀取總量(節點、陣列元素、物件鍵各計一次)超過opt.maxReads回'structure is too large'；不可讀回'tag is unreadable'、'keys are unreadable'、'property is unreadable'、'length is unreadable'、'element is unreadable'等。opt.fun、opt.has、opt.ownKeys、opt.elements只作用於頂層之v，深探走訪之節點只讀標籤、陣列長度與元素。
 * 10. 原因字串為固定詞彙，不回顯輸入值與原例外訊息，供呼叫端組成'invalid args[1]: must be a readable value'等訊息。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/chkReadable.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.deep=false] 輸入是否深探布林值，預設false
 * @param {Boolean} [opt.fun=false] 輸入是否另做函數型讀取布林值，預設false
 * @param {Boolean} [opt.ownKeys=false] 輸入是否讀自有鍵布林值，預設false
 * @param {Array} [opt.has=[]] 輸入需做in探測之鍵(字串、Symbol或數字)陣列，預設[]
 * @param {String} [opt.elements='none'] 輸入陣列長度與元素之讀取方式字串，可選'none'、'first'、'all'，預設'none'
 * @param {Integer} [opt.maxElements=1000000] 輸入陣列長度上限(opt.elements為'all'與opt.deep時)非負整數，預設1000000
 * @param {Integer} [opt.maxReads=50000000] 輸入讀取總量上限(opt.deep之走訪，與opt.ownKeys沿原型鏈之描述子讀取：原型鏈上Object.prototype等之自有鍵亦計入)非負整數，預設50000000，需無上限者傳Number.MAX_SAFE_INTEGER
 * @returns {String} 回傳''(可讀)，或原因字串'tag is unreadable'、'function type is unreadable'、'key is unreadable'、'keys are unreadable'、'length is unreadable'、'length is not a non-negative safe integer'、'too many elements'、'element is unreadable'、'property is unreadable'、'structure is too large'、'unreadable'(保險：未預期之例外)
 * @example
 *
 * let o = { a: 1 }
 * console.log(chkReadable(o))
 * // => ''
 *
 * let r = Proxy.revocable({}, {})
 * r.revoke()
 * console.log(chkReadable(r.proxy))
 * // => 'tag is unreadable'
 * console.log(chkReadable(r.proxy) !== '' ? 'unreadable' : 'readable')
 * // => 'unreadable'
 *
 * let p = new Proxy({ a: 1 }, { ownKeys: () => { throw new Error('x') } })
 * console.log(chkReadable(p))
 * // => ''
 * console.log(chkReadable(p, { ownKeys: true }))
 * // => 'keys are unreadable'
 *
 * let a = [0]
 * Object.defineProperty(a, '0', { get: () => { throw new Error('x') } })
 * console.log(chkReadable(a, { elements: 'first' }))
 * // => '' (存取器不呼叫，拋錯無從偵測)
 *
 * console.log(chkReadable({ x: { y: [1, 2, 3] } }, { deep: true }))
 * // => ''
 *
 * console.log(chkReadable(1))
 * // => ''
 *
 */
function chkReadable(v, opt = {}) {
    try {

        //原始值無可讀取者
        if (!isRef(v)) {
            return ''
        }

        //opt
        let o = readOpt(opt)

        //標籤, 判斷函數(isobj、isarr、isnull、isfun等)之共同前置讀取
        let tag = ''
        try {
            tag = toStr(v)
        }
        catch (err) {
            return R.tag
        }

        //fun
        if (o.fun) {
            try {
                if (rHas(v, symTag)) {
                    rGetDesc(v, symTag)
                }
            }
            catch (err) {
                return R.fun
            }
        }

        //has
        for (let k of o.has) {
            try {
                rHas(v, k) //與k in v同觸發has陷阱
            }
            catch (err) {
                return R.key
            }
        }

        //ownKeys
        if (o.ownKeys) {
            let r = readKeys(v, tag, o.maxReads)
            if (r !== '') {
                return r
            }
        }

        //elements
        if (o.elements !== 'none') {
            let isArr = false
            if (o.elements === 'first') {
                isArr = tag === '[object Array]'
            }
            else {
                try {
                    isArr = isArray(v)
                }
                catch (err) {
                    return R.tag
                }
            }
            if (isArr) {
                let r = readElements(v, o.elements, o.maxElements)
                if (r !== '') {
                    return r
                }
            }
        }

        //deep
        if (o.deep) {
            let r = readDeep(v, o.maxElements, o.maxReads)
            if (r !== '') {
                return r
            }
        }

        return ''
    }
    catch (err) {
        //保險: 任何未預期之例外皆視為不可讀, 不外拋
        return R.fail
    }
}


export default chkReadable
