import chkOrmStr from './chkOrmStr.mjs'
import clean from './_ormMsgClean.mjs'
import ormPathCut from './_ormPathCut.mjs'


//w-orm系列寫入資料(鍵名與字串值, 含巢狀物件與陣列元素)之良構檢核, 單一擁有者, 規則見CLAUDE_rulebook.md R-ORMSTR-01
//
//作用於呼叫端[已複製]之物件(各後端於cloneDeep後、補主鍵與加欄位前呼叫), 以顯式堆疊迭代走訪(不遞迴, 深度不設限), 不改輸入;
//字串之檢核交給chkOrmStr(單一出處), 本函數只負責走訪與路徑: 不設深度/節點/長度上限, 只因良構性拒收(不引入其他拒收理由)
//純JS: 不使用Node API, 僅import wsemi內同為純JS之chkOrmStr、_ormMsgClean(鍵名清除)與_ormPathCut(路徑尾端截斷); 無模組層可變狀態(可重入); 內建於模組載入時取得


//內建函數(模組載入時取得, 不受其後之全域汙染影響)
let call = Function.prototype.call
let reflectApply = Reflect.apply
let ownKeys = Reflect.ownKeys
let getDesc = Object.getOwnPropertyDescriptor
let getProto = Object.getPrototypeOf
let setProto = Object.setPrototypeOf
let isArray = Array.isArray
let objProto = Object.prototype
let hasOwn = call.bind(Object.prototype.hasOwnProperty)
let seenAdd = call.bind(WeakSet.prototype.add)
let seenHas = call.bind(WeakSet.prototype.has)
let NewWeakSet = WeakSet
let NewWeakMap = WeakMap
let wmGet = call.bind(WeakMap.prototype.get)
let wmSet = call.bind(WeakMap.prototype.set)
let NewSet = Set
let setHasM = call.bind(Set.prototype.has)
let setAddM = call.bind(Set.prototype.add)
let getTimeOf = call.bind(Date.prototype.getTime)
let taTag = call.bind(getDesc(getProto(Uint8Array.prototype), Symbol.toStringTag).get)
let abLength = call.bind(getDesc(ArrayBuffer.prototype, 'byteLength').get)
let dvBuffer = call.bind(getDesc(DataView.prototype, 'buffer').get)
let sabLength = typeof SharedArrayBuffer === 'function' ? call.bind(getDesc(SharedArrayBuffer.prototype, 'byteLength').get) : null
let mapSize = call.bind(getDesc(Map.prototype, 'size').get)
let setSize = call.bind(getDesc(Set.prototype, 'size').get)
let strValueOf = call.bind(String.prototype.valueOf)
let reSource = call.bind(getDesc(RegExp.prototype, 'source').get)
let toTag = call.bind(Object.prototype.toString)
let isErrorSlot = typeof Error.isError === 'function' ? Error.isError : null //有內部槽判定者優先(跨領域亦可), 否則以標籤
let mapEntries = call.bind(Map.prototype.entries)
let setValues = call.bind(Set.prototype.values)
let mapIterNext = call.bind(getProto(new Map().entries()).next) //迭代器之next取自內建原型, 不查找呼叫端可覆寫者
let setIterNext = call.bind(getProto(new Set().values()).next)
let fnToString = call.bind(Function.prototype.toString)
let symDesc = call.bind(getDesc(Symbol.prototype, 'description').get)
let isInt = Number.isInteger
let toStr = String

//opt.nul之判定交給chkOrmStr(同樣只認自有資料屬性且嚴格等於false)
let OPT_NO_NUL = { nul: false }
let OPT_NUL = { nul: true }

//稀疏陣列門檻: 長度逾此者改以自有鍵走訪(成本與實際元素數成正比, 不隨length迴圈; length可達2^32-1)
let DENSE_MAX = 4096
let MAX_INDEX = 4294967294 //陣列索引上限(2^32-2)

//路徑節點{ up, k, t }: t=0鍵名(k為字串)、1陣列索引或Map/Set項目序號(k為數字)、2不合格鍵名(k為null, 不保存原字串)、3 Map項目之鍵(k為null; 鍵若為字串, 檢核但不顯示)
let T_KEY = 0
let T_IDX = 1
let T_BAD = 2
let T_MK = 3

//框架種類
let K_OBJ = 0 //物件: vs為鍵值交錯之已讀取資料
let K_ARR = 1 //陣列(長度不逾門檻): 依索引走訪
let K_ARRK = 2 //陣列(長度逾門檻): 依自有鍵走訪
let K_SEQ = 3 //已具現之小型值序列(Error、RegExp之文字): vs為值, ns為路徑節點
let K_MAP = 4 //Map: 以迭代器逐項走訪(先鍵後值), 不預先具現
let K_SET = 5 //Set: 以迭代器逐元素走訪

//render, 路徑鏈結轉字串: root、.鍵名、[索引]、.<invalid key>、.<key>; 迭代(路徑深度不限);
//過長者由ormPathCut截為...加末100碼元(切點避開代理對, 使訊息本身不含孤立代理)
let render = (root, p) => {
    let segs = setProto([], null) //null原型: 直接指派不查找Array.prototype之索引setter
    let n = 0
    for (let q = p; q !== null; q = q.up) {
        segs[n] = q.t === T_IDX ? `[${q.k}]` : q.t === T_BAD ? '.<invalid key>' : q.t === T_MK ? '.<key>' : `.${clean(q.k, 30)}`
        n++
    }
    let s = root
    for (let i = n - 1; i >= 0; i--) {
        s += segs[i]
    }
    return ormPathCut(s)
}

//okRoot, root標籤是否可原樣用於訊息: 非空、不逾200碼元、不含控制(含NUL)/格式/私用/孤立代理等字元(clean以Cc、Cf、Co、Cs等類別取代, 與原字串比對; 方括號為內部索引語法, 不在此限)
let okRoot = (s) => {
    if (s.length === 0 || s.length > 200) {
        return false
    }
    let a = ''
    for (let i = 0; i < s.length; i++) {
        let ch = s[i]
        a += ch === '[' || ch === ']' ? '(' : ch
    }
    return clean(a, 1000) === a
}

//has, 以品牌方法確認內部槽(對不具該槽者拋錯)
let has = (fn, v) => {
    try {
        fn(v)
        return true
    }
    catch (err) {
        return false
    }
}

//物件種類(細碼): 0=一般物件, 11=Date、12=ArrayBuffer、13=DataView、14=SharedArrayBuffer、1=TypedArray(以上略過), 2=Map, 3=Set, 4=String包裝, 5=RegExp, 6=Error
let confirmKind = (c, v) => {
    switch (c) {
    case 11:
        return has(getTimeOf, v)
    case 12:
        return has(abLength, v)
    case 13:
        return has(dvBuffer, v)
    case 14:
        return sabLength !== null && has(sabLength, v)
    case 2:
        return has(mapSize, v)
    case 3:
        return has(setSize, v)
    case 4:
        return has(strValueOf, v)
    case 5:
        return has(reSource, v)
    case 6:
        return isErrorSlot !== null ? isErrorSlot(v) === true : toTag(v) === '[object Error]'
    default:
        return false
    }
}
let KINDS = [11, 12, 13, 14, 2, 3, 4, 5, 6]

//sweepKind, 依序以內部槽確認(與標籤無關: 標籤可被改寫, 內部槽不能), 皆非則為一般物件
let sweepKind = (v) => {
    for (let i = 0; i < KINDS.length; i++) {
        if (confirmKind(KINDS[i], v)) {
            return KINDS[i]
        }
    }
    return 0
}

//readAcc, 存取器屬性之值(以descriptor取得getter, 呼叫一次; 無getter為undefined)
let readAcc = (d, recv) => (d.get === undefined ? undefined : reflectApply(d.get, recv, []))

//readChain, 沿原型鏈取第一個同名屬性之值(存取器呼叫一次); Error之message在實例上、name常在原型上
let readChain = (v, k) => {
    for (let q = v; q !== null; q = getProto(q)) {
        let d = getDesc(q, k)
        if (d !== undefined) {
            return hasOwn(d, 'value') ? d.value : readAcc(d, v)
        }
    }
    return undefined
}

//isIdxKey, k是否為小於n之標準陣列索引字串(String包裝物件之字元索引鍵)
let isIdxKey = (k, n) => {
    let x = +k
    return isInt(x) && x >= 0 && x < n && toStr(x) === k
}

//textOf, 值被後端自動轉為文字者之文字: 字串本身、函數之原始碼(postgresql、mdb以toString寫入)、Symbol之描述; 其餘undefined
let textOf = (v) => {
    switch (typeof v) {
    case 'string':
        return v
    case 'function':
        try {
            return fnToString(v)
        }
        catch (err) {
            return undefined
        }
    case 'symbol': {
        let d = symDesc(v)
        return typeof d === 'string' ? d : undefined
    }
    default:
        return undefined
    }
}


/**
 * w-orm系列寫入資料(鍵名與字串值，含巢狀物件與陣列元素)之良構檢核，回傳null(合格)或{ reason, path }
 *
 * 輸入為各後端於複製(如cloneDeep)後、補主鍵與加欄位前之寫入資料(單一文件、文件陣列或任何值)，本函數不修改輸入(但會呼叫可列舉存取器，見第7點)，並假設後端其後寫入的就是被檢查之值；存取器屬性(自有或繼承之可列舉者)於檢核時呼叫其getter一次取值，有狀態之getter須由後端於複製後轉為資料屬性。
 *
 * 1. 走訪範圍：一般物件與類別實例之自有可列舉字串鍵(鍵名與值)及繼承自Object.prototype以外原型之可列舉字串鍵(lodash merge、sequelize update、mdb取值皆經原型鏈，自有同名或較近原型同名者含不可列舉者遮蔽之)、陣列元素(依索引)、Map之項目(字串鍵、物件鍵之內容與值，逐項迭代)、Set之元素、String包裝物件之字串值與其額外屬性(字元索引鍵除外)、RegExp之source、Error之name/message/cause；Map、Set、RegExp、Error另走訪其自有與繼承之可列舉屬性；被後端自動轉成文字之函數(原始碼)與Symbol值(描述)；字串經chkOrmStr檢核，預設只檢孤立代理(值之NUL不檢查，opt.nul為true時一併檢查NUL)。內建物件依內部槽判型(與標籤無關，標籤被改寫者亦然；原型為Object.prototype或null者直接當一般物件)。
 *
 * 2. 略過：Date、TypedArray、ArrayBuffer、SharedArrayBuffer、DataView、Buffer(整個物件，連其上自有額外屬性)、數字、布林、null、undefined、BigInt、Symbol鍵、不可列舉鍵、陣列之洞與非索引屬性、Object.prototype上之屬性、Number/Boolean包裝與Promise/WeakMap/WeakSet(無可列舉內容)；toJSON或自訂序列化之輸出不檢查。
 *
 * 3. 走訪順序固定為文件順序(深度優先)：同一物件內鍵名先於其值(自有鍵名、由近至遠之繼承鍵名、自有值、繼承值)，各值依自有鍵序(陣列依索引、整數樣鍵依引擎規定先於其他鍵)；回傳首個不合格處。
 *
 * 4. 迭代走訪(顯式堆疊，不遞迴)，深度、節點數與字串長度皆不設上限；循環參照與共享參照安全，同一物件出現多處只走訪一次(路徑取首次出現處)；稀疏陣列依實際元素走訪，成本不隨length；Map、Set逐項迭代不預先具現；同一原型(如同一類別之多個實例)之鍵只掃描一次。
 *
 * 5. 回傳{ reason, path }：reason為chkOrmStr之固定原因詞彙(不回顯值)；path以root起始，物件鍵為.鍵名(限30字元並以?取代控制字元、格式字元、方括號)、陣列元素與Set元素為[索引]、Map項目為[序號](其鍵之內容為[序號].<key>…，不合格之字串鍵為[序號].<key>)，**不合格之物件鍵名不出現在path，以.<invalid key>標示**；Error與RegExp之文字為.message、.name、.cause、.source；路徑超過120字元截為...加末100碼元(切點避開代理對中間)；opt.root含控制字元、孤立代理、NUL或過長者改用預設。
 *
 * 6. 不吞例外：讀取過程中Proxy陷阱、getter等拋出之例外原樣拋出；各後端於複製後呼叫則一般資料不會遇到。
 *
 * 7. 會呼叫可列舉存取器(含繼承者)，後端應於獨立複本上走訪：存取器之getter以被走訪者為this執行，其副作用可能改動被走訪之同一份複本——例如繼承之存取器把已檢查之欄位改成不合格字串，或把主鍵改指向既有他列——使其後寫入或刪除的不是被檢查之值(cloneDeep保留原型而不讀繼承存取器，故複製後存取器仍在)。後端須另做一份獨立複本(如再cloneDeep一次)供本函數走訪，寫入用複本不被走訪；交給事件訂閱者之物件亦須為獨立快照(訂閱者的改動不得影響其後各筆)，訂閱函數拋錯不得影響操作。此作法擋得住存取器對寫入複本的直接改動，但擋不住存取器『修好』走訪用複本中的不合格值(寫入用複本仍帶原值而通過檢核)；要連此一併杜絕，須在檢核前把存取器固定為資料(每個可列舉屬性含繼承者只讀一次，產生不含存取器之資料)，檢核並寫入同一份固定後之資料。契約案例表增補案例next之toctou組(inh-getter-*、event-shared*、listener-throws)驗證獨立複本與事件快照；『修好』之情形尚無案例，列為已知限制。
 *
 * 後端依回傳組成訊息：invalid data: reason at [path]；w-orm系列契約案例表見wsemi/src/_cvOrmStrCases.mjs。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/chkOrmData.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入已複製之寫入資料，可為物件、陣列或任意值
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.nul=false] 輸入是否一併檢查鍵名與字串值之NUL布林值，僅嚴格等於true時檢查，預設false
 * @param {String} [opt.root='data'] 輸入path之起始標籤字串，如data[1]，預設'data'
 * @returns {null|Object} 回傳null(合格)，或{ reason, path }
 * @example
 *
 * console.log(chkOrmData({ id: 'a', name: '中文\u{1F600}', tags: ['x', 'y'], meta: { k: 'v' } }))
 * // => null
 *
 * console.log(chkOrmData({ id: 'a', meta: { tags: ['ok', 'b\uD800'] } }))
 * // => { reason: 'string contains lone surrogate', path: 'data.meta.tags[1]' }
 *
 * console.log(chkOrmData({ id: 'a', ['k\uD800']: 1 }, { root: 'data[2]' }))
 * // => { reason: 'string contains lone surrogate', path: 'data[2].<invalid key>' }
 *
 * console.log(chkOrmData({ name: 'a\u0000b' }))
 * // => null
 *
 * console.log(chkOrmData({ name: 'a\u0000b' }, { nul: true }))
 * // => { reason: 'string contains NUL', path: 'data.name' }
 *
 */
function chkOrmData(data, opt) {

    //opt, 只讀自有資料屬性(以屬性描述子, 同chkOrmStr之紀律)
    let nul = false
    let root = 'data'
    if (opt !== undefined && opt !== null) {
        let dn = getDesc(opt, 'nul')
        if (dn !== undefined && hasOwn(dn, 'value') && dn.value === true) {
            nul = true
        }
        let dr = getDesc(opt, 'root')
        if (dr !== undefined && hasOwn(dr, 'value') && typeof dr.value === 'string' && okRoot(dr.value)) {
            root = dr.value
        }
    }
    let so = nul ? OPT_NUL : OPT_NO_NUL

    //根值為字串(函數與Symbol亦以其文字檢核)
    let t0 = textOf(data)
    if (t0 !== undefined) {
        let r = chkOrmStr(t0, so)
        return r === null ? null : { reason: r, path: root }
    }
    if (typeof data !== 'object' || data === null) {
        return null
    }

    //走訪: frames為框架堆疊(null原型陣列, 直接指派不查找Array.prototype之索引setter), top為堆疊高度
    let seen = new NewWeakSet()
    let frames = setProto([], null)
    let top = 0

    //mkFrame, 框架(欄位齊備, 形狀一致)
    let mkFrame = (kind, src, vs, ns, n, p) => ({ kind, src, ks: null, vs, ns, i: 0, n, p, it: null, idx: 0, pend: false, pv: undefined, pn: null })

    //protoMemo, 原型物件 -> { all, na, en, ne }(其全部字串鍵與可列舉字串鍵), 同一原型(如同一類別之多個實例)只掃一次
    let protoMemo = null
    let protoEntry = (q) => {
        if (protoMemo === null) {
            protoMemo = new NewWeakMap()
        }
        let ent = wmGet(protoMemo, q)
        if (ent === undefined) {
            let all = setProto([], null)
            let en = setProto([], null)
            let na = 0
            let ne = 0
            let pks = ownKeys(q)
            for (let i = 0; i < pks.length; i++) {
                let pk = pks[i]
                if (typeof pk !== 'string') {
                    continue
                }
                all[na] = pk
                na++
                let pd = getDesc(q, pk)
                if (pd !== undefined && pd.enumerable) {
                    en[ne] = pk
                    ne++
                }
            }
            ent = { all, na, en, ne }
            wmSet(protoMemo, q, ent)
        }
        return ent
    }

    //kindMemo, 原型物件 -> 種類細碼, 同一原型之實例(如同一類別之多個實例、多個Map)只做一次完整判型, 其後以單一品牌方法確認
    let kindMemo = null
    let kindOf = (v) => {
        let proto = getProto(v)
        if (proto === objProto || proto === null) {
            return 0
        }
        if (taTag(v) !== undefined) {
            return 1
        }
        if (kindMemo === null) {
            kindMemo = new NewWeakMap()
        }
        let m = wmGet(kindMemo, proto)
        if (m === 0) {
            return 0
        }
        if (m !== undefined && confirmKind(m, v)) {
            return m
        }
        let c = sweepKind(v)
        wmSet(kindMemo, proto, c)
        return c
    }

    //pushObj, 物件自有與繼承(Object.prototype以外原型)可列舉字串鍵: 鍵名先於值(先檢全部鍵名, 再依序走訪值); 每個描述子只讀一次(存取器之getter呼叫一次); 回傳不合格結果或null
    //skipLen > 0 時略過小於skipLen之字元索引鍵(String包裝物件)
    let pushObj = (v, p, skipLen) => {
        let keys = ownKeys(v)
        let kv = setProto([], null) //鍵與值交錯: [k0, v0, k1, v1, ...]
        let m = 0
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i]
            if (typeof k !== 'string') {
                continue
            }
            let d = getDesc(v, k)
            if (d === undefined || !d.enumerable) {
                continue
            }
            if (skipLen > 0 && isIdxKey(k, skipLen)) {
                continue
            }
            let r = chkOrmStr(k, so)
            if (r !== null) {
                return { reason: r, path: render(root, { up: p, k: null, t: T_BAD }) }
            }
            kv[m] = k
            kv[m + 1] = hasOwn(d, 'value') ? d.value : readAcc(d, v)
            m += 2
        }
        //繼承之可列舉屬性: lodash merge(save合併)、sequelize update、mdb之get皆經原型鏈取值; 自有同名(含不可列舉)與較近原型同名(含不可列舉)者遮蔽之; Object.prototype不走訪
        let proto = getProto(v)
        if (proto !== objProto && proto !== null) {
            let shadow = null
            let nearer = null
            let nn = 0
            for (let q = proto; q !== null && q !== objProto; q = getProto(q)) {
                let ent = protoEntry(q)
                if (shadow === null) {
                    if (ent.ne === 0) {
                        //此原型無可列舉鍵, 但其鍵(含不可列舉)仍可能遮蔽較遠者, 暫存其鍵表
                        if (nearer === null) {
                            nearer = setProto([], null)
                        }
                        nearer[nn] = ent
                        nn++
                        continue
                    }
                    shadow = new NewSet()
                    for (let i = 0; i < keys.length; i++) {
                        if (typeof keys[i] === 'string') {
                            setAddM(shadow, keys[i])
                        }
                    }
                    for (let j = 0; j < nn; j++) {
                        for (let i = 0; i < nearer[j].na; i++) {
                            setAddM(shadow, nearer[j].all[i])
                        }
                    }
                }
                for (let i = 0; i < ent.ne; i++) {
                    let k = ent.en[i]
                    if (setHasM(shadow, k)) {
                        continue
                    }
                    let d = getDesc(q, k)
                    if (d === undefined || !d.enumerable) {
                        continue
                    }
                    let r = chkOrmStr(k, so)
                    if (r !== null) {
                        return { reason: r, path: render(root, { up: p, k: null, t: T_BAD }) }
                    }
                    kv[m] = k
                    kv[m + 1] = hasOwn(d, 'value') ? d.value : readAcc(d, v)
                    m += 2
                }
                for (let i = 0; i < ent.na; i++) {
                    setAddM(shadow, ent.all[i])
                }
            }
        }
        frames[top] = mkFrame(K_OBJ, v, kv, null, m, p)
        top++
        return null
    }

    //enter, 進入容器(物件/陣列/Map/Set/String包裝/RegExp/Error), 回傳不合格結果或null; 通過後框架入堆疊
    let enter = (v, p) => {
        if (seenHas(seen, v)) {
            return null
        }
        seenAdd(seen, v)
        if (isArray(v)) {
            let dl = getDesc(v, 'length')
            let n = dl !== undefined && hasOwn(dl, 'value') && isInt(dl.value) && dl.value >= 0 ? dl.value : 0
            if (n <= DENSE_MAX) {
                frames[top] = mkFrame(K_ARR, v, null, null, n, p)
            }
            else {
                let f = mkFrame(K_ARRK, v, null, null, 0, p)
                f.ks = ownKeys(v)
                f.n = f.ks.length
                frames[top] = f
            }
            top++
            return null
        }
        let c = kindOf(v)
        if (c === 1 || (c >= 11 && c <= 14)) {
            return null
        }
        if (c === 4) {
            //String包裝物件: 字串值, 與額外屬性(字元索引鍵除外; lmdb、mongodb以字元索引為鍵存放, 其餘後端解包)
            let sv = strValueOf(v)
            let r = chkOrmStr(sv, so)
            if (r !== null) {
                return { reason: r, path: render(root, p) }
            }
            return pushObj(v, p, sv.length)
        }
        if (c === 2 || c === 3) {
            //Map/Set(含子類別): 自有可列舉屬性與項目皆走訪(msgpack等會存項目, 子類別則只存自有屬性, 取聯集); 項目先於自有屬性(框架後進先出)
            let r = pushObj(v, p, 0)
            if (r !== null) {
                return r
            }
            let f = mkFrame(c === 2 ? K_MAP : K_SET, v, null, null, 0, p)
            f.it = c === 2 ? mapEntries(v) : setValues(v)
            frames[top] = f
            top++
            return null
        }
        if (c === 5 || c === 6) {
            //RegExp(lmdb、mongodb、mdb存其source)與Error(lmdb存name、message、cause; mdb存String(err))之文字: 自有可列舉屬性之外另走訪這些值
            let r = pushObj(v, p, 0)
            if (r !== null) {
                return r
            }
            let names = c === 5 ? ['source'] : ['message', 'name', 'cause']
            let vs = setProto([], null)
            let ns = setProto([], null)
            let m = 0
            for (let i = 0; i < names.length; i++) {
                let x = c === 5 ? reSource(v) : readChain(v, names[i])
                if (x !== undefined) {
                    vs[m] = x
                    ns[m] = { up: p, k: names[i], t: T_KEY }
                    m++
                }
            }
            frames[top] = mkFrame(K_SEQ, v, vs, ns, m, p)
            top++
            return null
        }
        //一般物件與類別實例
        return pushObj(v, p, 0)
    }

    //根節點之路徑為null(render時只有root標籤)
    let r0 = enter(data, null)
    if (r0 !== null) {
        return r0
    }
    while (top > 0) {
        let f = frames[top - 1]
        //v為本項之值; 路徑節點僅在失敗或進入容器時才建立(通過檢核之純量不配置): K_SEQ已預建於ns, Map由迭代時現建, 其餘由nk、nt現建
        let v
        let nk
        let nt
        let node = null
        if (f.kind === K_MAP) {
            if (f.pend) {
                f.pend = false
                v = f.pv
                node = f.pn
                f.pv = undefined
                f.pn = null
            }
            else {
                let r = mapIterNext(f.it)
                if (r.done) {
                    frames[top - 1] = undefined
                    top--
                    continue
                }
                let ep = { up: f.p, k: f.idx, t: T_IDX }
                f.idx++
                f.pv = r.value[1]
                f.pn = ep
                f.pend = true
                v = r.value[0]
                node = { up: ep, k: null, t: T_MK }
            }
        }
        else if (f.kind === K_SET) {
            let r = setIterNext(f.it)
            if (r.done) {
                frames[top - 1] = undefined
                top--
                continue
            }
            v = r.value
            node = { up: f.p, k: f.idx, t: T_IDX }
            f.idx++
        }
        else if (f.i >= f.n) {
            frames[top - 1] = undefined
            top--
            continue
        }
        else if (f.kind === K_OBJ) {
            nk = f.vs[f.i]
            nt = T_KEY
            v = f.vs[f.i + 1]
            f.i += 2
        }
        else if (f.kind === K_ARR) {
            let d = getDesc(f.src, f.i)
            nk = f.i
            nt = T_IDX
            f.i++
            if (d === undefined || !d.enumerable) {
                continue
            }
            v = hasOwn(d, 'value') ? d.value : readAcc(d, f.src)
        }
        else if (f.kind === K_ARRK) {
            let k = f.ks[f.i]
            f.i++
            let x = typeof k === 'string' ? +k : NaN
            if (!(isInt(x) && x >= 0 && x <= MAX_INDEX && toStr(x) === k)) {
                continue
            }
            let d = getDesc(f.src, k)
            if (d === undefined || !d.enumerable) {
                continue
            }
            v = hasOwn(d, 'value') ? d.value : readAcc(d, f.src)
            nk = x
            nt = T_IDX
        }
        else {
            v = f.vs[f.i]
            node = f.ns[f.i]
            f.i++
        }
        if (typeof v === 'object' && v !== null) {
            let r = enter(v, node !== null ? node : { up: f.p, k: nk, t: nt })
            if (r !== null) {
                return r
            }
        }
        else {
            //字串, 以及被後端自動轉為文字之函數與Symbol
            let tx = textOf(v)
            if (tx !== undefined) {
                let r = chkOrmStr(tx, so)
                if (r !== null) {
                    return { reason: r, path: render(root, node !== null ? node : { up: f.p, k: nk, t: nt }) }
                }
            }
        }
    }
    return null

}


export default chkOrmData
