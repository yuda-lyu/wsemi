//w-orm系列條件(find)白名單之契約案例表(純資料, 內部模組不進index), 規則見CLAUDE_rulebook.md R-FIND-01
//
//用途: 各w-orm-*套件(lmdb、level、lowdb、mongodb、postgresql、reladb、mdb)之測試以
//  import cvOrmFindCases from 'wsemi/src/_cvOrmFindCases.mjs'
//取得種子與案例, 逐案對公開select(find)與delAll(find)執行, 使共用函數cvOrmFind之規則被各套件正確接線而非被後端繞過.
//wsemi之cvOrmFind測試亦逐案執行本表(accept/reject、原因詞彙、複本形狀).
//
//匯出{ columns, seed, cases }:
//  columns: SQL後端建表用之欄位型別(id為主鍵字串)
//  seed(): 回傳全新之6列種子(a1~a6; undefined之欄於NoSQL不寫入、於SQL為NULL; 每次呼叫回傳新物件與新Date)
//  cases: 案例陣列, 每案為
//    { id, group, rule, label, find, expect, why, ids, schema, need }
//    id        案例代號(群組字母加序號, T頂層/E等值與純量/C比較/I in-nin/L邏輯/N null/F欄名/X白名單外/V運算子值/H異常結構與規模)
//    rule      對應之規則代號(WL-xx, 見方案run01-審計與方案.md §3與帳本R-FIND-01)
//    label     說明
//    find()    每次呼叫回傳全新之find值(含Date、Symbol、Proxy、函數等不可JSON化者)
//    expect    'ALL'(全部: select回全部、delAll刪全部) | 'OK'(白名單內: 接受並依ids命中) | 'REJ'(整批reject)
//    why       expect為REJ時, cvOrmFind訊息應含之原因詞彙(供wsemi自身測試; 各後端只須斷言訊息以'invalid find: '開頭)
//    ids       expect為ALL或OK時, select(find)預期命中之id集合(升冪):
//                mongo: lmdb、level、lowdb、mongodb($ne/$nin遇NULL或缺欄之列時含該列, MongoDB式)
//                sql:   postgresql、reladb、mdb(不含NULL列, SQL三值; 字串對數字依欄型轉換)
//                mdb:   覆寫鍵, 僅N08與E25有(Jet: 布林欄無NULL故$ne:true含該列, 字串等值不分大小寫), 其餘案mdb同sql
//              level與lowdb須於自身轉譯層把find內之Date轉為ISO字串(與寫入一致), 使E05 C09 I17命中
//    schema    true表SQL族可因欄位不存在或欄位型別檢核而reject(屬各後端轉譯層), 亦可回ids.sql; NoSQL族須回ids.mongo
//    need      { maxIn: N }表須後端之$in/$nin上限 >= N才接受, 否則應reject(w-orm-mdb傳maxIn:2000, 故5000元素之案對mdb應reject)
//
//各後端對OK案之共同斷言: select(find)命中集合 = 依族別之ids; delAll(find)刪除之集合 = select(find)命中之集合(delAll前以seed()重建);
//對REJ案之共同斷言: select與delAll皆reject且訊息以'invalid find: '開頭, 資料表不變.
//例外: T38與T39(Proxy包空物件)以環境有可用之structuredClone為前提(Node 17以上、主流瀏覽器皆有); 無者cvOrmFind視為全部(帳本R-FIND-01已知限制9).


let columns = {
    id: 'string (primary key)',
    name: 'string',
    age: 'integer',
    g: 'string',
    t: 'string',
    flag: 'boolean',
    d: 'date',
}

let seed = () => {
    let d1 = new Date(Date.UTC(2026, 0, 1))
    let d2 = new Date(Date.UTC(2026, 1, 1))
    return [
        { id: 'a1', name: 'Peter', age: 20, g: 'A', t: null, flag: true, d: d1 },
        { id: 'a2', name: 'peter', age: 30, g: 'A', t: 'q', flag: false, d: d2 },
        { id: 'a3', name: 'Mary', age: 40, g: 'B', t: 'q', flag: true },
        { id: 'a4', name: 'Tom', age: null, g: 'B', t: null, flag: null },
        { id: 'a5', name: 'John', age: 50, g: 'B', t: 'r', flag: false },
        { id: 'a6', name: 'Zed' },
    ]
}

//原因詞彙(須與src/cvOrmFind.mjs之R表一致)
let W = {
    plain: 'condition must be a plain object',
    sym: 'symbol key is not allowed',
    nonenum: 'non-enumerable',
    acc: 'accessor',
    undef: 'undefined is not allowed',
    nul: 'null is not allowed here',
    type: 'unsupported value type',
    num: 'number is not finite',
    date: 'invalid Date',
    nuls: 'string contains NUL',
    lone: 'string contains lone surrogate',
    arrval: 'array value is not supported',
    op: 'unsupported operator',
    key: 'unexpected key',
    col: 'unsupported column name',
    collen: 'column name is too long',
    emptyop: 'empty operator object',
    emptydoc: 'empty condition',
    emptylist: 'with empty array',
    nin: 'with empty array is always true',
    isarr: 'value must be an array',
    arrbig: 'array is too large',
    deep: 'nesting is too deep',
    big: 'condition is too large',
    hole: 'sparse array hole',
    extra: 'array carries extra properties',
    exc: 'an exception was thrown',
    emptyodd: 'an empty find must be an ordinary object',
}

let A6 = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']
let I = (mongo, sql = mongo, mdb = undefined) => {
    let o = { mongo, sql }
    if (mdb !== undefined) {
        o.mdb = mdb
    }
    return o
}

class Cond {
    constructor() {
        this.id = 'a1'
    }
}

let D1 = () => new Date(Date.UTC(2026, 0, 1))
let D2 = () => new Date(Date.UTC(2026, 1, 1))

//chain, 以$and包n層, 最內層為{g:'A'}(深度n)
let chain = (n) => {
    let o = { g: 'A' }
    for (let i = 0; i < n; i++) {
        o = { $and: [o] }
    }
    return o
}

//fills, 產生n個不命中任何列之填充字串
let fills = (n) => Array.from({ length: n }, (_, i) => `k${i}`)

let list = []
let S = (id, rule, label, find, expect, extra = {}) => {
    list.push({ id, group: id[0], rule, label, find, expect, ...extra })
}


//T 頂層(WL-01、WL-02)
S('T01', 'WL-01', '未給', () => undefined, 'ALL', { ids: I(A6) })
S('T02', 'WL-01', '{}', () => ({}), 'ALL', { ids: I(A6) })
S('T03', 'WL-02', 'null', () => null, 'REJ', { why: W.plain })
S('T04', 'WL-02', '[]', () => [], 'REJ', { why: W.plain })
S('T05', 'WL-02', '[{id:\'a1\'}]', () => [{ id: 'a1' }], 'REJ', { why: W.plain })
S('T06', 'WL-02', '\'a1\'', () => 'a1', 'REJ', { why: W.plain })
S('T07', 'WL-02', '123', () => 123, 'REJ', { why: W.plain })
S('T08', 'WL-02', 'true', () => true, 'REJ', { why: W.plain })
S('T09', 'WL-02', 'function', () => () => ({ id: 'a1' }), 'REJ', { why: W.plain })
S('T10', 'WL-02', 'new Date', () => new Date(), 'REJ', { why: W.plain })
S('T11', 'WL-02', '/re/', () => /a1/, 'REJ', { why: W.plain })
S('T12', 'WL-02', 'new Map', () => new Map([['id', 'a1']]), 'REJ', { why: W.plain })
S('T13', 'WL-02', 'new Set', () => new Set(['a1']), 'REJ', { why: W.plain })
S('T14', 'WL-02', '類別實例(自有鍵id)', () => new Cond(), 'REJ', { why: W.plain })
S('T15', 'WL-H2', '僅Symbol鍵之物件', () => ({ [Symbol('x')]: 1 }), 'REJ', { why: W.sym })
S('T16', 'WL-02', 'Object.create({id:a1}) 條件在原型', () => Object.create({ id: 'a1' }), 'REJ', { why: W.plain })
S('T17', 'WL-H1', 'null原型物件{id:a1}', () => Object.assign(Object.create(null), { id: 'a1' }), 'OK', { ids: I(['a1']) })
S('T18', 'WL-02', 'new String(\'a1\')', () => new String('a1'), 'REJ', { why: W.plain }) // eslint-disable-line no-new-wrappers
S('T19', 'WL-02', 'BigInt 1n', () => BigInt(1), 'REJ', { why: W.plain })
S('T20', 'WL-02', 'Symbol()', () => Symbol('s'), 'REJ', { why: W.plain })
S('T21', 'WL-01', 'Object.create(null) 空物件', () => Object.create(null), 'ALL', { ids: I(A6) })
S('T22', 'WL-02', 'Promise.resolve({})', () => Promise.resolve({}), 'REJ', { why: W.plain })
S('T23', 'WL-02', 'new Error(\'x\')', () => new Error('x'), 'REJ', { why: W.plain })
S('T24', 'WL-02', 'Buffer', () => Buffer.from('x'), 'REJ', { why: W.plain })
S('T25', 'WL-H2', 'null原型且僅Symbol鍵', () => Object.assign(Object.create(null), { [Symbol('s')]: 1 }), 'REJ', { why: W.sym })
S('T26', 'WL-02', 'Proxy包陣列', () => new Proxy([], {}), 'REJ', { why: W.plain })
S('T27', 'WL-02', 'new Number(5)', () => new Number(5), 'REJ', { why: W.plain }) // eslint-disable-line no-new-wrappers
S('T28', 'WL-H5', '已撤銷之Proxy', () => {
    let r = Proxy.revocable({}, {})
    r.revoke()
    return r.proxy
}, 'REJ', { why: W.exc })
S('T29', 'WL-02', '原型改為null之Map(標籤被誤判為一般物件, 無自有鍵會成為「全部」)', () => Object.setPrototypeOf(new Map([['id', 'a1']]), null), 'REJ', { why: W.plain })
S('T30', 'WL-02', '原型改為Object.prototype之Set', () => Object.setPrototypeOf(new Set(['a1']), Object.prototype), 'REJ', { why: W.plain })
S('T31', 'WL-02', '原型改為null之Uint8Array(4)', () => Object.setPrototypeOf(new Uint8Array(4), null), 'REJ', { why: W.plain })
S('T32', 'WL-02', '原型改為null之Map且帶自有鍵g(曾被當成條件{g:\'A\'})', () => Object.assign(Object.setPrototypeOf(new Map(), null), { g: 'A' }), 'REJ', { why: W.plain })
S('T33', 'WL-02', '原型改為Object.prototype之Set且帶自有鍵g', () => Object.assign(Object.setPrototypeOf(new Set(), Object.prototype), { g: 'A' }), 'REJ', { why: W.plain })
S('T34', 'WL-02', '原型改為null之Promise且帶自有鍵g', () => Object.assign(Object.setPrototypeOf(Promise.resolve(1), null), { g: 'A' }), 'REJ', { why: W.plain })
S('T35', 'WL-02', '原型改為null之ArrayBuffer且帶自有鍵g', () => Object.assign(Object.setPrototypeOf(new ArrayBuffer(4), null), { g: 'A' }), 'REJ', { why: W.plain })
S('T36', 'WL-02', '原型改為null之Uint8Array(2)且帶自有鍵g', () => Object.assign(Object.setPrototypeOf(new Uint8Array(2), null), { g: 'A' }), 'REJ', { why: W.plain })
S('T37', 'WL-02', '原型改為null之WeakMap且帶自有鍵g', () => Object.assign(Object.setPrototypeOf(new WeakMap(), null), { g: 'A' }), 'REJ', { why: W.plain })
S('T38', 'WL-02', 'Proxy包原型改為null之Map(無自有鍵, 曾被當成空條件而使delAll刪光全表; 前提: 環境有可用之structuredClone, 無者視為全部)', () => new Proxy(Object.setPrototypeOf(new Map(), null), {}), 'REJ', { why: W.emptyodd })
S('T39', 'WL-01', 'Proxy包空物件(空即全部, 須為可證明之真實空物件, Proxy不視為全部; 前提: 環境有可用之structuredClone, 無者視為全部)', () => new Proxy({}, {}), 'REJ', { why: W.emptyodd })

//E 等值與純量型別(WL-03、WL-S1、WL-S2)
S('E01', 'WL-03', '{id:\'a1\'}', () => ({ id: 'a1' }), 'OK', { ids: I(['a1']) })
S('E02', 'WL-03', '{age:20}', () => ({ age: 20 }), 'OK', { ids: I(['a1']) })
S('E03', 'WL-03', '{flag:true}', () => ({ flag: true }), 'OK', { ids: I(['a1', 'a3']) })
S('E04', 'WL-03', '{g:\'A\',age:20} 多欄AND', () => ({ g: 'A', age: 20 }), 'OK', { ids: I(['a1']) })
S('E05', 'WL-S1', '{d:Date}', () => ({ d: D1() }), 'OK', { ids: I(['a1']) })
S('E06', 'WL-03', '{age:\'20\'} 字串對數字(NoSQL不命中, SQL依欄型轉換命中)', () => ({ age: '20' }), 'OK', { ids: I([], ['a1']) })
S('E07', 'WL-03', '{name:\'\'} 空字串', () => ({ name: '' }), 'OK', { ids: I([]) })
S('E08', 'WL-03', '{age:0}', () => ({ age: 0 }), 'OK', { ids: I([]) })
S('E09', 'WL-S1', '{age:NaN}', () => ({ age: NaN }), 'REJ', { why: W.num })
S('E10', 'WL-S1', '{age:Infinity}', () => ({ age: Infinity }), 'REJ', { why: W.num })
S('E11', 'WL-S1', '{age:undefined}', () => ({ age: undefined }), 'REJ', { why: W.undef })
S('E12', 'WL-S1', '{age:10n} BigInt', () => ({ age: BigInt(10) }), 'REJ', { why: W.type })
S('E13', 'WL-S1', '{d:Invalid Date}', () => ({ d: new Date(NaN) }), 'REJ', { why: W.date })
S('E14', 'WL-07', '{name:/pet/i} RegExp值', () => ({ name: /pet/i }), 'REJ', { why: W.type })
S('E15', 'WL-S1', '{age:()=>1} 函數值', () => ({ age: () => 1 }), 'REJ', { why: W.type })
S('E16', 'WL-07', '{tags:[x,y]} 陣列等值', () => ({ tags: ['x', 'y'] }), 'REJ', { why: W.arrval })
S('E17', 'WL-07', '{o:{k:1}} 巢狀物件等值', () => ({ o: { k: 1 } }), 'REJ', { why: W.key })
S('E18', 'WL-07', '{g:[\'A\']} 陣列值', () => ({ g: ['A'] }), 'REJ', { why: W.arrval })
S('E19', 'WL-S1', '{age:new Number(20)} 包裝物件', () => ({ age: new Number(20) }), 'REJ', { why: W.type }) // eslint-disable-line no-new-wrappers
S('E20', 'WL-S1', '{name:Symbol()} Symbol值', () => ({ name: Symbol('s') }), 'REJ', { why: W.type })
S('E21', 'WL-03', '{age:-0}', () => ({ age: -0 }), 'OK', { ids: I([]) })
S('E22', 'WL-S2', '{name:\'a\\u0000b\'} 含NUL字串', () => ({ name: 'a\u0000b' }), 'REJ', { why: W.nuls })
S('E23', 'WL-S1', '{name:\'$name$\'} 首尾$字串(共用層為字面值)', () => ({ name: '$name$' }), 'OK', { ids: I([]) })
S('E24', 'WL-S1', '{name:Buffer} 二進位', () => ({ name: Buffer.from('x') }), 'REJ', { why: W.type })
S('E25', 'WL-03', '{name:\'peter\'} 區分大小寫(種子含Peter與peter; mdb之Jet不分大小寫)', () => ({ name: 'peter' }), 'OK', { ids: I(['a2'], ['a2'], ['a1', 'a2']) })
S('E26', 'WL-S2', '{name:\'😀\'} 成對代理字元為合法字串', () => ({ name: '😀' }), 'OK', { ids: I([]) })
S('E27', 'WL-S2', '{name:\'\\uDC00\'} 孤立低代理字元', () => ({ name: '\uDC00' }), 'REJ', { why: W.lone })
S('E28', 'WL-S1', '{name:new String(\'Mary\')} 包裝字串', () => ({ name: new String('Mary') }), 'REJ', { why: W.type }) // eslint-disable-line no-new-wrappers
S('E29', 'WL-S1', '{age:Proxy包Date}', () => ({ age: new Proxy(new Date(0), {}) }), 'REJ', { why: W.type })

//C 比較(WL-04、WL-N1)
S('C01', 'WL-04', '{age:{$eq:20}}', () => ({ age: { $eq: 20 } }), 'OK', { ids: I(['a1']) })
S('C02', 'WL-N2', '{age:{$ne:20}} 遇NULL依族', () => ({ age: { $ne: 20 } }), 'OK', { ids: I(['a2', 'a3', 'a4', 'a5', 'a6'], ['a2', 'a3', 'a5']) })
S('C03', 'WL-04', '{age:{$gt:20}}', () => ({ age: { $gt: 20 } }), 'OK', { ids: I(['a2', 'a3', 'a5']) })
S('C04', 'WL-04', '{age:{$gte:20}}', () => ({ age: { $gte: 20 } }), 'OK', { ids: I(['a1', 'a2', 'a3', 'a5']) })
S('C05', 'WL-04', '{age:{$lt:40}}', () => ({ age: { $lt: 40 } }), 'OK', { ids: I(['a1', 'a2']) })
S('C06', 'WL-04', '{age:{$lte:40}}', () => ({ age: { $lte: 40 } }), 'OK', { ids: I(['a1', 'a2', 'a3']) })
S('C07', 'WL-04', '{age:{$gt:20,$lt:50}} 欄內多運算子', () => ({ age: { $gt: 20, $lt: 50 } }), 'OK', { ids: I(['a2', 'a3']) })
S('C08', 'WL-04', '{name:{$gt:\'M\'}} 字串比較', () => ({ name: { $gt: 'M' } }), 'OK', { ids: I(['a1', 'a2', 'a3', 'a4', 'a6']) })
S('C09', 'WL-S1', '{d:{$gte:Date}}', () => ({ d: { $gte: D1() } }), 'OK', { ids: I(['a1', 'a2']) })
S('C10', 'WL-04', '{age:{$gt:\'x\'}} 跨型別比較(SQL族可因型別檢核reject)', () => ({ age: { $gt: 'x' } }), 'OK', { ids: I([]), schema: true })
S('C11', 'WL-N1', '{age:{$gt:null}}', () => ({ age: { $gt: null } }), 'REJ', { why: W.nul })
S('C12', 'WL-04', '{flag:{$gt:false}} 布林比較', () => ({ flag: { $gt: false } }), 'OK', { ids: I(['a1', 'a3']) })
S('C13', 'WL-S1', '{age:{$eq:undefined}}', () => ({ age: { $eq: undefined } }), 'REJ', { why: W.undef })
S('C14', 'WL-S1', '{age:{$lt:NaN}}', () => ({ age: { $lt: NaN } }), 'REJ', { why: W.num })
S('C15', 'WL-07', '{age:{$gt:20,$foo:1}} 白名單內夾未知運算子', () => ({ age: { $gt: 20, $foo: 1 } }), 'REJ', { why: W.op })
S('C16', 'WL-N1', '{age:{$gte:null}}', () => ({ age: { $gte: null } }), 'REJ', { why: W.nul })
S('C17', 'WL-N1', '{age:{$lt:null}}', () => ({ age: { $lt: null } }), 'REJ', { why: W.nul })
S('C18', 'WL-N1', '{age:{$lte:null}}', () => ({ age: { $lte: null } }), 'REJ', { why: W.nul })

//I in-nin(WL-05、WL-E1、WL-E2、WL-N1)
S('I01', 'WL-05', '{g:{$in:[\'A\']}}', () => ({ g: { $in: ['A'] } }), 'OK', { ids: I(['a1', 'a2']) })
S('I02', 'WL-N2', '{g:{$nin:[\'A\']}} 遇NULL依族', () => ({ g: { $nin: ['A'] } }), 'OK', { ids: I(['a3', 'a4', 'a5', 'a6'], ['a3', 'a4', 'a5']) })
S('I03', 'WL-05', '{id:{$in:[\'a1\',\'a2\']}}', () => ({ id: { $in: ['a1', 'a2'] } }), 'OK', { ids: I(['a1', 'a2']) })
S('I04', 'WL-05', '{age:{$in:[20,30]}}', () => ({ age: { $in: [20, 30] } }), 'OK', { ids: I(['a1', 'a2']) })
S('I05', 'WL-E1', '{g:{$in:[]}} 空$in恆假', () => ({ g: { $in: [] } }), 'OK', { ids: I([]) })
S('I06', 'WL-E2', '{g:{$nin:[]}} 空$nin', () => ({ g: { $nin: [] } }), 'REJ', { why: W.nin })
S('I07', 'WL-N1', '{t:{$in:[\'q\',null]}} $in含null', () => ({ t: { $in: ['q', null] } }), 'REJ', { why: W.nul })
S('I08', 'WL-N1', '{t:{$nin:[\'q\',null]}} $nin含null', () => ({ t: { $nin: ['q', null] } }), 'REJ', { why: W.nul })
S('I09', 'WL-N1', '{t:{$in:[null]}}', () => ({ t: { $in: [null] } }), 'REJ', { why: W.nul })
S('I10', 'WL-N1', '{t:{$nin:[null]}}', () => ({ t: { $nin: [null] } }), 'REJ', { why: W.nul })
S('I11', 'WL-05', '{g:{$in:\'A\'}} 非陣列', () => ({ g: { $in: 'A' } }), 'REJ', { why: W.isarr })
S('I12', 'WL-05', '{g:{$in:[[\'A\']]}} 陣列內陣列', () => ({ g: { $in: [['A']] } }), 'REJ', { why: W.type })
S('I13', 'WL-05', '{g:{$in:[{a:1}]}} 陣列內物件', () => ({ g: { $in: [{ a: 1 }] } }), 'REJ', { why: W.type })
S('I14', 'WL-05', '{g:{$in:[/A/]}} 陣列內RegExp', () => ({ g: { $in: [/A/] } }), 'REJ', { why: W.type })
S('I15', 'WL-S1', '{g:{$in:[undefined]}}', () => ({ g: { $in: [undefined] } }), 'REJ', { why: W.undef })
S('I16', 'WL-H3', '{g:{$in:[\'A\',,\'B\']}} 稀疏陣列', () => ({ g: { $in: ['A', , 'B'] } }), 'REJ', { why: W.hole }) // eslint-disable-line no-sparse-arrays
S('I17', 'WL-S1', '{d:{$in:[Date,Date]}}', () => ({ d: { $in: [D1(), D2()] } }), 'OK', { ids: I(['a1', 'a2']) })
S('I18', 'WL-S1', '{age:{$in:[NaN]}}', () => ({ age: { $in: [NaN] } }), 'REJ', { why: W.num })
S('I19', 'WL-05', '{id:{$in:["a1","a1"]}} 重複元素', () => ({ id: { $in: ['a1', 'a1'] } }), 'OK', { ids: I(['a1']) })
S('I20', 'WL-E2', '{$or:[{g:{$nin:[]}}]} 空$nin於邏輯內', () => ({ $or: [{ g: { $nin: [] } }] }), 'REJ', { why: W.nin })
S('I21', 'WL-S1', '{g:{$in:[1n]}} BigInt元素', () => ({ g: { $in: [BigInt(1)] } }), 'REJ', { why: W.type })

//L 邏輯(WL-06、WL-E3、WL-E4、WL-E1)
S('L01', 'WL-06', '{$and:[{g:\'A\'},{age:{$gt:20}}]}', () => ({ $and: [{ g: 'A' }, { age: { $gt: 20 } }] }), 'OK', { ids: I(['a2']) })
S('L02', 'WL-06', '{$or:[{g:\'A\'},{age:50}]}', () => ({ $or: [{ g: 'A' }, { age: 50 }] }), 'OK', { ids: I(['a1', 'a2', 'a5']) })
S('L03', 'WL-E3', '{$and:[]} 空', () => ({ $and: [] }), 'REJ', { why: W.emptylist })
S('L04', 'WL-E3', '{$or:[]} 空', () => ({ $or: [] }), 'REJ', { why: W.emptylist })
S('L05', 'WL-E4', '{$and:[{}]} 含空條件', () => ({ $and: [{}] }), 'REJ', { why: W.emptydoc })
S('L06', 'WL-E4', '{$or:[{}]} 含空條件', () => ({ $or: [{}] }), 'REJ', { why: W.emptydoc })
S('L07', 'WL-06', '{$and:[{$or:[{g:\'A\'},{g:\'B\'}]},{age:{$lt:40}}]} 巢狀', () => ({ $and: [{ $or: [{ g: 'A' }, { g: 'B' }] }, { age: { $lt: 40 } }] }), 'OK', { ids: I(['a1', 'a2']) })
S('L08', 'WL-06', '{g:\'A\',$or:[{age:20},{age:30}]} 欄位與$or並列', () => ({ g: 'A', $or: [{ age: 20 }, { age: 30 }] }), 'OK', { ids: I(['a1', 'a2']) })
S('L09', 'WL-06', '{$and:{g:\'A\'}} 非陣列', () => ({ $and: { g: 'A' } }), 'REJ', { why: W.isarr })
S('L10', 'WL-06', '{$or:[\'x\']} 元素非物件', () => ({ $or: ['x'] }), 'REJ', { why: W.plain })
S('L11', 'WL-06', '{$or:[null]}', () => ({ $or: [null] }), 'REJ', { why: W.plain })
S('L12', 'WL-06', '{$or:[[{g:\'A\'}]]} 元素為陣列', () => ({ $or: [[{ g: 'A' }]] }), 'REJ', { why: W.plain })
S('L13', 'WL-06', '{$or:[{g:"A"},undefined]}', () => ({ $or: [{ g: 'A' }, undefined] }), 'REJ', { why: W.plain })
S('L14', 'WL-06', '{$and:[{g:\'A\'}],$or:[{age:20}]} 兩個邏輯鍵', () => ({ $and: [{ g: 'A' }], $or: [{ age: 20 }] }), 'OK', { ids: I(['a1']) })
S('L15', 'WL-06', '{$or:[{g:"A"}],g:"B"} 邏輯與欄位矛盾', () => ({ $or: [{ g: 'A' }], g: 'B' }), 'OK', { ids: I([]) })
S('L16', 'WL-06', '{$and:[new Cond()]} 元素為類別實例', () => ({ $and: [new Cond()] }), 'REJ', { why: W.plain })
S('L17', 'WL-E1', '{$or:[{g:{$in:[]}},{id:\'a1\'}]} 恆假之分支不使其他分支失效', () => ({ $or: [{ g: { $in: [] } }, { id: 'a1' }] }), 'OK', { ids: I(['a1']) })
S('L18', 'WL-E1', '{$and:[{g:{$in:[]}}]} 恆假於$and內不得變全部', () => ({ $and: [{ g: { $in: [] } }] }), 'OK', { ids: I([]) })
S('L19', 'WL-E4', '{$and:[{$or:[{}]}]} 巢狀之空條件', () => ({ $and: [{ $or: [{}] }] }), 'REJ', { why: W.emptydoc })
S('L20', 'WL-E4', '{$and:[{g:\'A\'},{}]} 空條件混於有效條件間', () => ({ $and: [{ g: 'A' }, {}] }), 'REJ', { why: W.emptydoc })
S('L21', 'WL-E3', '{$and:[{g:\'A\'}],$or:[]} 一個有效另一個為空', () => ({ $and: [{ g: 'A' }], $or: [] }), 'REJ', { why: W.emptylist })

//N null語意(WL-N1; $ne/$nin遇NULL之族別差異為設計, WL-N2)
S('N01', 'WL-N1', '{t:null}', () => ({ t: null }), 'OK', { ids: I(['a1', 'a4', 'a6']) })
S('N02', 'WL-N1', '{t:{$eq:null}}', () => ({ t: { $eq: null } }), 'OK', { ids: I(['a1', 'a4', 'a6']) })
S('N03', 'WL-N1', '{t:{$ne:null}}', () => ({ t: { $ne: null } }), 'OK', { ids: I(['a2', 'a3', 'a5']) })
S('N04', 'WL-N2', '{t:{$ne:\'q\'}} $ne遇NULL依族', () => ({ t: { $ne: 'q' } }), 'OK', { ids: I(['a1', 'a4', 'a5', 'a6'], ['a5']) })
S('N05', 'WL-N2', '{t:{$nin:[\'q\']}} $nin遇NULL依族', () => ({ t: { $nin: ['q'] } }), 'OK', { ids: I(['a1', 'a4', 'a5', 'a6'], ['a5']) })
S('N06', 'WL-N1', '{t:{$gt:\'a\'}} 比較不含NULL', () => ({ t: { $gt: 'a' } }), 'OK', { ids: I(['a2', 'a3', 'a5']) })
S('N07', 'WL-N1', '{age:null}', () => ({ age: null }), 'OK', { ids: I(['a4', 'a6']) })
S('N08', 'WL-N2', '{flag:{$ne:true}} $ne布林遇NULL依族(mdb之Jet布林欄無NULL)', () => ({ flag: { $ne: true } }), 'OK', { ids: I(['a2', 'a4', 'a5', 'a6'], ['a2', 'a5'], ['a2', 'a4', 'a5', 'a6']) })
S('N09', 'WL-N2', '{g:{$ne:\'A\'}} $ne遇缺欄依族', () => ({ g: { $ne: 'A' } }), 'OK', { ids: I(['a3', 'a4', 'a5', 'a6'], ['a3', 'a4', 'a5']) })
S('N10', 'WL-N1', '{$or:[{t:null},{t:\'q\'}]}', () => ({ $or: [{ t: null }, { t: 'q' }] }), 'OK', { ids: I(['a1', 'a2', 'a3', 'a4', 'a6']) })
S('N11', 'WL-N2', '可攜寫法(排除NULL): {$and:[{t:{$ne:null}},{t:{$ne:\'q\'}}]}', () => ({ $and: [{ t: { $ne: null } }, { t: { $ne: 'q' } }] }), 'OK', { ids: I(['a5']) })
S('N12', 'WL-N2', '可攜寫法(含NULL): {$or:[{t:null},{t:{$ne:\'q\'}}]}', () => ({ $or: [{ t: null }, { t: { $ne: 'q' } }] }), 'OK', { ids: I(['a1', 'a4', 'a5', 'a6']) })
S('N13', 'WL-N2', '可攜寫法(排除NULL): {$and:[{g:{$ne:null}},{g:{$nin:[\'A\']}}]}', () => ({ $and: [{ g: { $ne: null } }, { g: { $nin: ['A'] } }] }), 'OK', { ids: I(['a3', 'a4', 'a5']) })
S('N14', 'WL-N2', '可攜寫法(含NULL): {$or:[{g:null},{g:{$nin:[\'A\']}}]}', () => ({ $or: [{ g: null }, { g: { $nin: ['A'] } }] }), 'OK', { ids: I(['a3', 'a4', 'a5', 'a6']) })

//F 欄名(WL-F1、WL-F2、WL-L4; 欄是否存在屬各後端轉譯層, 故符合文法而種子無此欄者標schema)
S('F01', 'WL-F1', '{\'o.k\':1} 點路徑', () => ({ 'o.k': 1 }), 'REJ', { why: W.col })
S('F02', 'WL-F1', '{\'\':1} 空欄名', () => ({ '': 1 }), 'REJ', { why: W.col })
S('F03', 'WL-F2', '{\'__proto__\':\'x\'} 自有__proto__鍵', () => JSON.parse('{"__proto__":"x"}'), 'REJ', { why: W.col })
S('F04', 'WL-F2', '{constructor:\'x\'} 符合文法, 共用層不擋', () => ({ constructor: 'x' }), 'OK', { ids: I([]), schema: true })
S('F05', 'WL-F2', '{toString:\'x\'} 符合文法, 共用層不擋', () => ({ toString: 'x' }), 'OK', { ids: I([]), schema: true })
S('F06', 'WL-F1', '{\'first-name\':\'x\'} 含連字號', () => ({ 'first-name': 'x' }), 'REJ', { why: W.col })
S('F07', 'WL-F1', '{\'姓名\':\'x\'} 中文欄名', () => ({ 姓名: 'x' }), 'OK', { ids: I([]), schema: true })
S('F08', 'WL-F1', '{\'a b\':\'x\'} 含空白', () => ({ 'a b': 'x' }), 'REJ', { why: W.col })
S('F09', 'WL-F1', '{\'$name$\':\'x\'} 首尾$欄名($開頭)', () => ({ $name$: 'x' }), 'REJ', { why: W.op })
S('F10', 'WL-F1', '{\'g->>k\':\'x\'} JSON取值鍵', () => ({ 'g->>k': 'x' }), 'REJ', { why: W.col })
S('F11', 'WL-F1', '{\'age::text\':\'20\'} 轉型鍵', () => ({ 'age::text': '20' }), 'REJ', { why: W.col })
S('F12', 'WL-F3', '{\'nocol\':\'x\'} 不存在之欄(NoSQL無命中, SQL可reject)', () => ({ nocol: 'x' }), 'OK', { ids: I([]), schema: true })
S('F13', 'WL-F1', '{\'0\':\'x\'} 數字欄名', () => ({ 0: 'x' }), 'REJ', { why: W.col })
S('F14', 'WL-F1', '{\'a"b\':\'x\'} 含引號欄名', () => ({ 'a"b': 'x' }), 'REJ', { why: W.col })
S('F15', 'WL-L4', '{\'x\'+\'y\'*200:1} 201字元欄名', () => ({ [`x${'y'.repeat(200)}`]: 1 }), 'REJ', { why: W.collen })
S('F16', 'WL-F3', '{\'ID\':\'a1\'} 大小寫不同之欄名(區分大小寫, 欄存在性屬各後端)', () => ({ ID: 'a1' }), 'OK', { ids: I([]), schema: true })
S('F17', 'WL-F2', '{length:3} length為一般欄名', () => ({ length: 3 }), 'OK', { ids: I([]), schema: true })
S('F18', 'WL-F2', '{prototype:\'x\'}', () => ({ prototype: 'x' }), 'OK', { ids: I([]), schema: true })
S('F19', 'WL-F2', '{length:3,id:\'a1\'} length與其他欄並列', () => ({ length: 3, id: 'a1' }), 'OK', { ids: I([]), schema: true })
S('F20', 'WL-F2', '{hasOwnProperty:\'x\'}', () => ({ hasOwnProperty: 'x' }), 'OK', { ids: I([]), schema: true })
S('F21', 'WL-L4', '{\'x\'*128:1} 128字元欄名(上限內)', () => ({ ['x'.repeat(128)]: 1 }), 'OK', { ids: I([]), schema: true })
S('F22', 'WL-L4', '{\'x\'*129:1} 129字元欄名', () => ({ ['x'.repeat(129)]: 1 }), 'REJ', { why: W.collen })
S('F23', 'WL-F1', '{\'a\\nb\':\'x\'} 含換行欄名', () => ({ 'a\nb': 'x' }), 'REJ', { why: W.col })
S('F24', 'WL-F1', '{"\\u0301a":1} 組合附加符號不可作首字元', () => ({ '́a': 1 }), 'REJ', { why: W.col })
S('F25', 'WL-F1', '{"a\\u0301":1} 字母後接組合附加符號為合法欄名', () => ({ 'á': 1 }), 'OK', { ids: I([]), schema: true })
S('F26', 'WL-F1', '{Infinity:1} 符合欄名文法(pg因mongo-sql以+key>=0判為陣列索引, 屬pg第二階段須自行擋下)', () => ({ Infinity: 1 }), 'OK', { ids: I([]), schema: true })

//X 白名單外運算子(WL-07)
S('X01', 'WL-07', '{name:{$not:{$eq:\'Peter\'}}}', () => ({ name: { $not: { $eq: 'Peter' } } }), 'REJ', { why: W.op })
S('X02', 'WL-07', '{$nor:[{g:\'A\'}]}', () => ({ $nor: [{ g: 'A' }] }), 'REJ', { why: W.op })
S('X03', 'WL-07', '{name:{$regex:\'^pet\',$options:\'i\'}}', () => ({ name: { $regex: '^pet', $options: 'i' } }), 'REJ', { why: W.op })
S('X04', 'WL-07', '{name:{$regex:\'pet\'}}', () => ({ name: { $regex: 'pet' } }), 'REJ', { why: W.op })
S('X05', 'WL-07', '{name:{$options:"i"}} 單獨$options', () => ({ name: { $options: 'i' } }), 'REJ', { why: W.op })
S('X06', 'WL-07', '{t:{$exists:true}}', () => ({ t: { $exists: true } }), 'REJ', { why: W.op })
S('X07', 'WL-07', '{t:{$exists:false}}', () => ({ t: { $exists: false } }), 'REJ', { why: W.op })
S('X08', 'WL-07', '{age:{$type:\'number\'}}', () => ({ age: { $type: 'number' } }), 'REJ', { why: W.op })
S('X09', 'WL-07', '{$where:function}', () => ({
    $where() {
        return true
    }
}), 'REJ', { why: W.op })
S('X10', 'WL-07', '{$where:\'true\'}', () => ({ $where: 'true' }), 'REJ', { why: W.op })
S('X11', 'WL-07', '{$expr:{$gt:[\'$age\',20]}}', () => ({ $expr: { $gt: ['$age', 20] } }), 'REJ', { why: W.op })
S('X12', 'WL-07', '{age:{$mod:[2,0]}}', () => ({ age: { $mod: [2, 0] } }), 'REJ', { why: W.op })
S('X13', 'WL-07', '{tags:{$elemMatch:{$eq:"x"}}}', () => ({ tags: { $elemMatch: { $eq: 'x' } } }), 'REJ', { why: W.op })
S('X14', 'WL-07', '{tags:{$size:2}}', () => ({ tags: { $size: 2 } }), 'REJ', { why: W.op })
S('X15', 'WL-07', '{tags:{$all:["x"]}}', () => ({ tags: { $all: ['x'] } }), 'REJ', { why: W.op })
S('X16', 'WL-07', '{name:{$like:\'P%\'}}', () => ({ name: { $like: 'P%' } }), 'REJ', { why: W.op })
S('X17', 'WL-07', '{name:{$ilike:\'p%\'}}', () => ({ name: { $ilike: 'p%' } }), 'REJ', { why: W.op })
S('X18', 'WL-07', '{age:{$and:[{$gt:1}]}} 欄位層$and', () => ({ age: { $and: [{ $gt: 1 }] } }), 'REJ', { why: W.op })
S('X19', 'WL-07', '{age:{$or:[{$gt:1}]}} 欄位層$or', () => ({ age: { $or: [{ $gt: 1 }] } }), 'REJ', { why: W.op })
S('X20', 'WL-07', '{$text:{$search:\'a\'}}', () => ({ $text: { $search: 'a' } }), 'REJ', { why: W.op })
S('X21', 'WL-07', '{$custom:\'1=1\'}', () => ({ $custom: '1=1' }), 'REJ', { why: W.op })
S('X22', 'WL-07', '{age:{$foo:1}} 未知欄位運算子', () => ({ age: { $foo: 1 } }), 'REJ', { why: W.op })
S('X23', 'WL-07', '{$foo:[]} 未知文件運算子', () => ({ $foo: [] }), 'REJ', { why: W.op })
S('X24', 'WL-07', '{$comment:"x"}', () => ({ $comment: 'x' }), 'REJ', { why: W.op })
S('X25', 'WL-07', '{$jsonSchema:{}}', () => ({ $jsonSchema: {} }), 'REJ', { why: W.op })
S('X26', 'WL-07', '{age:{$null:true}}', () => ({ age: { $null: true } }), 'REJ', { why: W.op })
S('X27', 'WL-07', '{age:{$notNull:true}}', () => ({ age: { $notNull: true } }), 'REJ', { why: W.op })
S('X28', 'WL-07', '{age:{$equals:20}} (pg別名)', () => ({ age: { $equals: 20 } }), 'REJ', { why: W.op })
S('X29', 'WL-H2', '{id:"a1",[Symbol]:1} 混入Symbol鍵', () => ({ id: 'a1', [Symbol('x')]: 1 }), 'REJ', { why: W.sym })
S('X30', 'WL-H2', '{[Symbol.for("and")]:[...]}(sequelize Op.and)', () => ({ [Symbol.for('and')]: [{ g: 'A' }] }), 'REJ', { why: W.sym })
S('X31', 'WL-07', '{$not:{g:"A"}} 文件層$not', () => ({ $not: { g: 'A' } }), 'REJ', { why: W.op })
S('X32', 'WL-07', '{age:{$not:20}} $not純量', () => ({ age: { $not: 20 } }), 'REJ', { why: W.op })
S('X33', 'WL-07', '{$function:{...}}', () => ({
    $function: {
        body() {
            return true
        },
        args: [],
        lang: 'js'
    }
}), 'REJ', { why: W.op })
S('X34', 'WL-07', '{name:{$regex:/pet/i}}', () => ({ name: { $regex: /pet/i } }), 'REJ', { why: W.op })
S('X35', 'WL-07', '{age:{$nor:[1]}} 欄位層$nor', () => ({ age: { $nor: [1] } }), 'REJ', { why: W.op })
S('X36', 'WL-07', '{age:{$bitsAllSet:2}}', () => ({ age: { $bitsAllSet: 2 } }), 'REJ', { why: W.op })
S('X37', 'WL-07', '{age:{$gt:20,$not:{$gt:30}}} 白名單內夾白名單外', () => ({ age: { $gt: 20, $not: { $gt: 30 } } }), 'REJ', { why: W.op })
S('X38', 'WL-07', '{$expr:true}', () => ({ $expr: true }), 'REJ', { why: W.op })
S('X39', 'WL-07', '{$in:[1]} 文件層欄位運算子', () => ({ $in: [1] }), 'REJ', { why: W.op })
S('X40', 'WL-07', '{$gt:1} 文件層比較運算子', () => ({ $gt: 1 }), 'REJ', { why: W.op })
S('X41', 'WL-07', '{$eq:1} 文件層$eq', () => ({ $eq: 1 }), 'REJ', { why: W.op })
S('X42', 'WL-07', '{$options:"i"} 文件層$options', () => ({ $options: 'i' }), 'REJ', { why: W.op })

//V 白名單內運算子之值形狀(WL-04、WL-E5)
S('V01', 'WL-04', '{age:{$gt:[1]}} 陣列值', () => ({ age: { $gt: [1] } }), 'REJ', { why: W.type })
S('V02', 'WL-04', '{age:{$eq:{a:1}}} 物件值', () => ({ age: { $eq: { a: 1 } } }), 'REJ', { why: W.type })
S('V03', 'WL-E5', '{age:{}} 空運算子物件', () => ({ age: {} }), 'REJ', { why: W.emptyop })
S('V04', 'WL-04', '{age:{$gt:20,name:\'x\'}} 運算子與一般鍵混用', () => ({ age: { $gt: 20, name: 'x' } }), 'REJ', { why: W.key })
S('V05', 'WL-04', '{age:{name:\'x\'}} 巢狀物件(無運算子)', () => ({ age: { name: 'x' } }), 'REJ', { why: W.key })
S('V06', 'WL-04', '{age:{$ne:[20]}} $ne陣列', () => ({ age: { $ne: [20] } }), 'REJ', { why: W.type })
S('V07', 'WL-04', '{age:{$gt:/1/}} RegExp比較', () => ({ age: { $gt: /1/ } }), 'REJ', { why: W.type })
S('V08', 'WL-04', '{age:{$eq:()=>1}} 函數比較', () => ({ age: { $eq: () => 1 } }), 'REJ', { why: W.type })
S('V09', 'WL-04', '{age:Date}(Date當欄值, SQL族可因型別檢核reject)', () => ({ age: D1() }), 'OK', { ids: I([]), schema: true })
S('V10', 'WL-04', '{age:{$gt:Symbol()}}', () => ({ age: { $gt: Symbol('s') } }), 'REJ', { why: W.type })
S('V11', 'WL-04', '{age:{$eq:1n}} BigInt', () => ({ age: { $eq: BigInt(1) } }), 'REJ', { why: W.type })

//H 異常結構與規模(WL-H、WL-L; 上限為共用預設: 深度32、$and/$or長度1000、$in/$nin長度10000、節點100000、欄名128)
S('H01', 'WL-H2', 'getter欄位 {get g(){return A}}', () => ({
    get g() {
        return 'A'
    }
}), 'REJ', { why: W.acc })
S('H02', 'WL-H2', '不可列舉欄 defineProperty(enumerable:false)', () => {
    let o = {}
    Object.defineProperty(o, 'g', { value: 'A', enumerable: false })
    return o
}, 'REJ', { why: W.nonenum })
S('H03', 'WL-L1', '循環參照 a.$and=[a]', () => {
    let a = {}
    a.$and = [a]
    return a
}, 'REJ', { why: W.deep })
S('H04', 'WL-L1', '深度40之$and鏈', () => chain(40), 'REJ', { why: W.deep })
S('H05', 'WL-L1', '深度10之$and鏈', () => chain(10), 'OK', { ids: I(['a1', 'a2']) })
S('H06', 'WL-L3', '$in含70000元素', () => ({ name: { $in: fills(70000) } }), 'REJ', { why: W.arrbig })
S('H07', 'WL-L3', '$in含5000元素(首元素\'Mary\', 其餘填充; 後端上限低於5000者應reject)', () => ({ name: { $in: ['Mary', ...fills(4999)] } }), 'OK', { ids: I(['a3']), need: { maxIn: 5000 } })
S('H08', 'WL-H3', '陣列帶額外屬性 $in', () => {
    let a = ['A']
    a.extra = 1
    return { g: { $in: a } }
}, 'REJ', { why: W.extra })
S('H09', 'WL-L2', '$or含5000個子條件', () => ({ $or: fills(5000).map((k) => ({ id: k })) }), 'REJ', { why: W.arrbig })
S('H10', 'WL-L4', '1000個欄位等值', () => Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`f${i}`, i])), 'OK', { ids: I([]), schema: true })
S('H11', 'WL-H1', 'Proxy包一般物件', () => new Proxy({ g: 'A' }, {}), 'OK', { ids: I(['a1', 'a2']) })
S('H12', 'WL-S2', '字串值含孤立代理字元', () => ({ name: '\uD800' }), 'REJ', { why: W.lone })
S('H13', 'WL-L4', '字串值長度10萬', () => ({ name: 'x'.repeat(100000) }), 'OK', { ids: I([]) })
S('H14', 'WL-L2', '$or含1001個子條件', () => ({ $or: fills(1001).map((k) => ({ id: k })) }), 'REJ', { why: W.arrbig })
S('H15', 'WL-L2', '$or含100個子條件(首個id:\'a1\', 其餘填充)', () => ({ $or: [{ id: 'a1' }, ...fills(99).map((k) => ({ id: k }))] }), 'OK', { ids: I(['a1']) })
S('H16', 'WL-L3', '$in含10001元素', () => ({ name: { $in: fills(10001) } }), 'REJ', { why: W.arrbig })
S('H17', 'WL-L1', '深度33之$and鏈', () => chain(33), 'REJ', { why: W.deep })
S('H18', 'WL-L1', '深度32之$and鏈(上限內)', () => chain(32), 'OK', { ids: I(['a1', 'a2']) })
S('H19', 'WL-L4', '共享參照指數展開(深度25之{$and:[x,x]})', () => {
    let x = { g: 'A' }
    for (let i = 0; i < 25; i++) {
        x = { $and: [x, x] }
    }
    return x
}, 'REJ', { why: W.big })
S('H20', 'WL-H3', '$in為length讀得4294967295之Proxy陣列', () => ({
    name: {
        $in: new Proxy([], {
            get(t, k, r) {
                return k === 'length' ? 4294967295 : Reflect.get(t, k, r)
            }
        })
    }
}), 'REJ', { why: W.arrbig })
S('H21', 'WL-H3', '陣列帶Symbol鍵之額外屬性 $in', () => {
    let a = ['A']
    a[Symbol('x')] = 1
    return { g: { $in: a } }
}, 'REJ', { why: W.extra })
S('H22', 'WL-H3', '陣列元素不可列舉 $in', () => {
    let a = ['A']
    Object.defineProperty(a, '0', { value: 'A', enumerable: false, configurable: true, writable: true })
    return { g: { $in: a } }
}, 'REJ', { why: W.nonenum })
S('H23', 'WL-H3', '陣列元素為存取器 $or', () => ({
    $or: Object.defineProperty([], '0', {
        get() {
            return { g: 'A' }
        },
        enumerable: true
    })
}), 'REJ', { why: W.acc })
S('H24', 'WL-F2', '$and元素內之自有__proto__鍵', () => JSON.parse('{"$and":[{"__proto__":"x"}]}'), 'REJ', { why: W.col })
S('H25', 'WL-H5', '欄值為已撤銷之Proxy', () => {
    let r = Proxy.revocable({}, {})
    r.revoke()
    return { a: r.proxy }
}, 'REJ', { why: W.exc })
S('H26', 'WL-H5', 'Proxy之ownKeys陷阱拋錯', () => new Proxy({ a: 1 }, {
    ownKeys() {
        throw new Error('keys trap')
    }
}), 'REJ', { why: W.exc })
S('H27', 'WL-H5', '欄值之Symbol.toStringTag getter拋錯', () => ({
    a: {
        get [Symbol.toStringTag]() {
            throw new Error('tag getter')
        }
    }
}), 'REJ', { why: W.exc })
S('H28', 'WL-L3', '$in含10000元素(上限內; 首元素\'Mary\', 其餘填充; 後端上限低於10000者應reject)', () => ({ name: { $in: ['Mary', ...fills(9999)] } }), 'OK', { ids: I(['a3']), need: { maxIn: 10000 } })
S('H29', 'WL-02', '$or元素為原型改為null之Map且帶自有鍵g', () => ({ $or: [Object.assign(Object.setPrototypeOf(new Map(), null), { g: 'A' })] }), 'REJ', { why: W.plain })
S('H30', 'WL-02', '$and元素為原型改為Object.prototype之Set且帶自有鍵g', () => ({ $and: [{ age: { $gt: 0 } }, Object.assign(Object.setPrototypeOf(new Set(), Object.prototype), { g: 'A' })] }), 'REJ', { why: W.plain })
S('H31', 'WL-02', '欄位運算子物件為原型改為null之Map且帶自有鍵$gt', () => ({ age: Object.assign(Object.setPrototypeOf(new Map(), null), { $gt: 20 }) }), 'REJ', { why: W.type })
S('H32', 'WL-02', '巢狀$or/$and內之原型改為null之Promise且帶自有鍵g', () => ({ $or: [{ g: 'B' }, { $and: [Object.assign(Object.setPrototypeOf(Promise.resolve(1), null), { g: 'A' })] }] }), 'REJ', { why: W.plain })
S('H33', 'WL-02', '$or元素為Proxy包原型改為null之Map(空; 非頂層之空物件本即reject)', () => ({ $or: [new Proxy(Object.setPrototypeOf(new Map(), null), {})] }), 'REJ', { why: W.emptydoc })
S('H34', 'WL-02', '欄位值為Proxy包原型改為null之Map(空運算子物件)', () => ({ age: new Proxy(Object.setPrototypeOf(new Map(), null), {}) }), 'REJ', { why: W.emptyop })


let cases = list

export default { columns, seed, cases }
