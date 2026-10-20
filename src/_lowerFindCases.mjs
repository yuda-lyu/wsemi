//SQL族後端共用之方言中立條件IR(lowerFind輸出)之契約案例表(純資料加兩個轉換函數, 內部模組不進index), 規則見CLAUDE_rulebook.md R-LOWER-01
//
//用途: 契約本文為src/lowerFind.mjs檔頭(六種節點、語意、opt); 本表是其[節點語意期望表]: 以固定資料列seed()為準, 逐筆給出
//  find(輸入條件) -> ir(期望之IR) -> hits(期望命中之id集合). 三者皆**手寫**(命中集合依SQL三值邏輯手推), 不由被測碼產生.
//  wsemi之測試(test/lowerFind.test.mjs、test/_lowerFindCases.test.mjs)逐筆核對:
//    (a) lowerFind(cvOrmFind(find())) 之IR(經norm) = ir
//    (b) 以獨立之IR求值器(test/tools/irEval.mjs)對seed()求ir之命中集合 = hits(表內部一致)
//  reladb、mdb等後端遷移為[IR -> 自有發射器]時, 以同一張表獨立對拍(不經過本層): 依columns對seed()建表, 對每筆以denorm(ir)發射條件並執行,
//  命中之id集合須 = hits; 另以lowerFind(cvOrmFind(find()))取得IR後同樣發射, 結果須相同. 如:
//    import cases from 'wsemi/src/_lowerFindCases.mjs'
//    import cvOrmFind from 'wsemi/src/cvOrmFind.mjs'
//    import lowerFind from 'wsemi/src/lowerFind.mjs'
//    for (let s of cases.semantics) { ... emit(cases.denorm(s.ir)) ... assert.deepStrictEqual(ids, s.hits) }
//  IR快照(共用案例表_cvOrmFindCases之接受案 -> IR)見src/_lowerFindSnapshots.mjs(產生檔).
//
//匯出{ columns, seed, semantics, norm, denorm }:
//  columns:   SQL後端建表用之欄位型別(id為主鍵整數; s文字、n整數、b布林、d時間; 欄可為NULL)
//  seed():    回傳全新之6列種子(id 1~6, 含NULL列; 每次呼叫回傳新物件與新Date), 欄:
//               id  s      n     b      d
//               1   'a'    1     true   2020-01-01
//               2   'b'    2     false  2021-01-01
//               3   null   null  null   null
//               4   'a'    3     true   2022-01-01
//               5   '$x$'  4     false  null
//               6   ''     0     null   2023-01-01
//  semantics: 案例陣列, 每筆{ id, node, find, ir, hits }:
//               id    案例代號(唯一; 方言端可用同一代號掛接自己的期望, 如pg之where/values)
//               node  涵蓋之節點與語意說明
//               find  函數, 每次回傳全新之find值(可含Date)
//               ir    期望之IR, 為純JSON形狀(Date以{ $date: 毫秒 }表示, null原型以一般物件表示), 以denorm還原為真Date後可餵發射器; and/or不帶p
//               hits  期望命中之id集合(升冪), 依seed()手推; 恆假為[]; null表命中集合依資料庫排序規則而異(字串之gt/gte/lt/lte, 見下), 只驗ir不驗命中
//               schema (選用)true表型別化後端可因欄位型別檢核而拒收該find(拒收亦屬合格), 同_cvOrmFindCases之schema旗標; 未拒收時命中集合須為hits
//  norm(x):   任一含Date、-0與null原型之結構 -> 純JSON形狀(Date -> { $date: 毫秒 }; -0 -> { $negZero: true }; null原型 -> 一般物件); 比對IR前先norm
//  denorm(x): norm之反函數(純JSON形狀 -> Date、-0與一般物件), 供發射器消費期望IR
//
//值域與比較約定(契約的一部分):
//  IR之值恆為cvOrmFind輸出之值: string、有限number(含-0)、boolean、有效Date; 欄位型別不在IR內.
//  比較語意以columns宣告之欄型為準: 數值格式字串(如'2')對integer欄先轉為數字再比較(同_cvOrmFindCases之ids.sql約定, 見numeric-string-*案);
//  不可轉換者(如'x')不命中, 型別化後端亦可改為拒收(案標schema:true); Date以毫秒瞬間比較, 不得截斷為日或秒(見date-ms-*案);
//  -0與0相等(見eq-negative-zero); 字串之順序比較(gt/gte/lt/lte)依資料庫排序規則(collation), 結果因collation而異者hits為null, 只驗IR(seed含'$x$', 其與字母之先後依collation而異).
//方言端承擔(不在IR內, 由各後端之發射器或型別化階段自行負責, 不屬本表對拍範圍):
//  ①欄位schema型別化與值正規化(如reladb之chkScalar: 日期字串與epoch轉Date、DATEONLY只收日期字串、DECIMAL小數位、0/1布林、嚴格數值字串; 正規化後之值才是交給發射器之值)
//  ②主鍵正規化 ③欄名解析與存在性檢核(opt.checkColumn僅為掛鉤, 只得欄名) ④空in是否引用欄位(以回報不存在之欄名; 結果集恆空) ⑤and/or之寬度與深度重新分組(如平衡二分)
//  ⑥bool節點之字面值與各op之寫法(IS TRUE僅表eq/ne, 其餘op須自選寫法, 語意為NULL列不命中) ⑦識別字引用、參數標記與參數上限(maxParams之計數為綁定參數語意, 不綁定參數者傳Infinity)
//  ⑧型別化階段之錯誤訊息格式與是否回顯值(lowerFind自身之訊息不回顯值)
//求值器test/tools/irEval.mjs之適用範圍: 僅限本表seed()之抽象語意(上列值域與比較約定), 不是全域SQL求值器; 型別化階段之正規化與拒收由各後端依自身schema另行對拍.
//與方言端契約資料之掛接協定: 方言端(如pg之irSemantics.mjs的where/values骨架)須以本表semantics之id為鍵, 並在其測試斷言: 每個方言id皆存在於本表、本表每個id皆有方言骨架或明列免除、
//  方言端不另存find/ir/hits之副本(改為import本表), 以免兩邊各自漂移.
//
//節點語意期望表(節點 -> 命中規則 -> ANSI SQL骨架示意; 骨架僅示意, 各方言之識別字引用、參數標記、布林字面值、恆假寫法由其發射器自選, **不屬契約**, 契約為ir與hits):
//  cmp  {c,op,v}      : c非NULL且 c op v 為真(op: eq ne gt gte lt lte); NULL列不命中任何比較(含ne)       c <op> ?
//  bool {c,op,v}      : c為布林且非NULL, 以false < true比較; NULL列不命中任何布林比較(含ne)                c = TRUE / c IS TRUE (方言自選)
//  null {c,not}       : not=false命中NULL列; not=true命中非NULL列                                          c IS [NOT] NULL
//  in   {c,vs,not}   : not=false命中c非NULL且c在vs內; not=true命中c非NULL且c不在vs內(NULL列兩者皆不命中)   c [NOT] IN (?, ...)
//                       vs為空且not=false = 恆假(結果集為空); 是否引用欄位由發射器自決, 不得影響結果集         (恆假) 1 = 0
//  and  {a}           : a內全部命中(n元, a至少2項, 同型已攤平)                                              (A AND B AND ...)
//  or   {a}           : a內任一命中(n元, a至少2項, 同型已攤平)                                              (A OR B OR ...)
//  null(節點本身)     : 無條件, 命中全部(IR根為null)
//  葉節點p            : 來源路徑(如find.$or[0].age.$gt), 僅供診斷, 不參與語意(比對/快取鍵須忽略)
//  深度/寬度上限、平衡二分等重新分組是發射器之責(lowerFind不因方言上限限制and/or之寬度); 綁定參數計數見lowerFind檔頭(cmp 1、in每元素1、bool/null/空in 0)


let columns = {
    id: 'integer (primary key)',
    s: 'string',
    n: 'integer',
    b: 'boolean',
    d: 'date',
}

let seed = () => [
    { id: 1, s: 'a', n: 1, b: true, d: new Date('2020-01-01T00:00:00Z') },
    { id: 2, s: 'b', n: 2, b: false, d: new Date('2021-01-01T00:00:00Z') },
    { id: 3, s: null, n: null, b: null, d: null },
    { id: 4, s: 'a', n: 3, b: true, d: new Date('2022-01-01T00:00:00Z') },
    { id: 5, s: '$x$', n: 4, b: false, d: null },
    { id: 6, s: '', n: 0, b: null, d: new Date('2023-01-01T00:00:00Z') },
]

//norm, Date -> { $date: 毫秒 }, -0 -> { $negZero: true }, null原型 -> 一般物件
let norm = (x) => JSON.parse(JSON.stringify(x, function(k, v) {
    let raw = this[k]
    if (Object.prototype.toString.call(raw) === '[object Date]') {
        return { $date: raw.getTime() }
    }
    if (Object.is(raw, -0)) {
        return { $negZero: true }
    }
    return v
}))

//denorm, { $date: 毫秒 } -> Date, { $negZero: true } -> -0
let denorm = (x) => JSON.parse(JSON.stringify(x), (k, v) => {
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1) {
        if (typeof v.$date === 'number') {
            return new Date(v.$date)
        }
        if (v.$negZero === true) {
            return -0
        }
    }
    return v
})

//期望IR之建構輔助(僅供本檔組表)
let D = (iso) => ({ $date: new Date(iso).getTime() })
let NZ = { $negZero: true }
let cmp = (c, op, v, p) => ({ t: 'cmp', c, op, v, p })
let bool = (c, op, v, p) => ({ t: 'bool', c, op, v, p })
let nul = (c, not, p) => ({ t: 'null', c, not, p })
let inn = (c, vs, not, p) => ({ t: 'in', c, vs, not, p })
let and = (...a) => ({ t: 'and', a })
let or = (...a) => ({ t: 'or', a })

let semantics = [
    //---- cmp
    { id: 'eq-string', node: 'cmp eq', find: () => ({ s: 'a' }), ir: cmp('s', 'eq', 'a', 'find.s'), hits: [1, 4] },
    { id: 'eq-string-explicit', node: 'cmp eq', find: () => ({ s: { $eq: 'a' } }), ir: cmp('s', 'eq', 'a', 'find.s.$eq'), hits: [1, 4] },
    { id: 'eq-empty-string', node: 'cmp eq', find: () => ({ s: '' }), ir: cmp('s', 'eq', '', 'find.s'), hits: [6] },
    { id: 'eq-number-zero', node: 'cmp eq', find: () => ({ n: 0 }), ir: cmp('n', 'eq', 0, 'find.n'), hits: [6] },
    { id: 'ne-string', node: 'cmp ne (three-valued: NULL row never hits)', find: () => ({ s: { $ne: 'a' } }), ir: cmp('s', 'ne', 'a', 'find.s.$ne'), hits: [2, 5, 6] },
    { id: 'gt', node: 'cmp gt', find: () => ({ n: { $gt: 1 } }), ir: cmp('n', 'gt', 1, 'find.n.$gt'), hits: [2, 4, 5] },
    { id: 'gte', node: 'cmp gte', find: () => ({ n: { $gte: 2 } }), ir: cmp('n', 'gte', 2, 'find.n.$gte'), hits: [2, 4, 5] },
    { id: 'lt', node: 'cmp lt', find: () => ({ n: { $lt: 2 } }), ir: cmp('n', 'lt', 2, 'find.n.$lt'), hits: [1, 6] },
    { id: 'lte', node: 'cmp lte', find: () => ({ n: { $lte: 1 } }), ir: cmp('n', 'lte', 1, 'find.n.$lte'), hits: [1, 6] },
    { id: 'date-eq', node: 'cmp eq Date', find: () => ({ d: new Date('2020-01-01T00:00:00Z') }), ir: cmp('d', 'eq', D('2020-01-01T00:00:00Z'), 'find.d'), hits: [1] },
    { id: 'date-gt', node: 'cmp gt Date', find: () => ({ d: { $gt: new Date('2021-06-01T00:00:00Z') } }), ir: cmp('d', 'gt', D('2021-06-01T00:00:00Z'), 'find.d.$gt'), hits: [4, 6] },
    { id: 'dollar-eq', node: 'cmp eq: $..$ string is a literal', find: () => ({ s: '$x$' }), ir: cmp('s', 'eq', '$x$', 'find.s'), hits: [5] },
    { id: 'dollar-ne', node: 'cmp ne: $..$ string is a literal', find: () => ({ s: { $ne: '$x$' } }), ir: cmp('s', 'ne', '$x$', 'find.s.$ne'), hits: [1, 2, 4, 6] },
    { id: 'dollar-gte', node: 'cmp gte: $..$ string is a literal (no longer rejected)', find: () => ({ s: { $gte: '$x$' } }), ir: cmp('s', 'gte', '$x$', 'find.s.$gte'), hits: null }, //字串順序比較之命中集合依資料庫排序規則(collation)而異, 不寫死, 只驗IR
    //---- bool(SQL三值: NULL列不命中任何布林比較, 含ne)
    { id: 'bool-eq-true', node: 'bool eq', find: () => ({ b: true }), ir: bool('b', 'eq', true, 'find.b'), hits: [1, 4] },
    { id: 'bool-eq-false', node: 'bool eq', find: () => ({ b: false }), ir: bool('b', 'eq', false, 'find.b'), hits: [2, 5] },
    { id: 'bool-ne-true', node: 'bool ne (three-valued)', find: () => ({ b: { $ne: true } }), ir: bool('b', 'ne', true, 'find.b.$ne'), hits: [2, 5] },
    { id: 'bool-ne-false', node: 'bool ne (three-valued)', find: () => ({ b: { $ne: false } }), ir: bool('b', 'ne', false, 'find.b.$ne'), hits: [1, 4] },
    { id: 'bool-gt-false', node: 'bool gt (false < true)', find: () => ({ b: { $gt: false } }), ir: bool('b', 'gt', false, 'find.b.$gt'), hits: [1, 4] },
    { id: 'bool-lte-true', node: 'bool lte (false < true)', find: () => ({ b: { $lte: true } }), ir: bool('b', 'lte', true, 'find.b.$lte'), hits: [1, 2, 4, 5] },
    { id: 'bool-gte-true', node: 'bool gte (false < true)', find: () => ({ b: { $gte: true } }), ir: bool('b', 'gte', true, 'find.b.$gte'), hits: [1, 4] },
    { id: 'bool-lt-true', node: 'bool lt (false < true)', find: () => ({ b: { $lt: true } }), ir: bool('b', 'lt', true, 'find.b.$lt'), hits: [2, 5] },
    //---- null
    { id: 'null-eq', node: 'null', find: () => ({ s: null }), ir: nul('s', false, 'find.s'), hits: [3] },
    { id: 'null-eq-explicit', node: 'null', find: () => ({ s: { $eq: null } }), ir: nul('s', false, 'find.s.$eq'), hits: [3] },
    { id: 'null-ne', node: 'null not', find: () => ({ s: { $ne: null } }), ir: nul('s', true, 'find.s.$ne'), hits: [1, 2, 4, 5, 6] },
    //---- in
    { id: 'in', node: 'in', find: () => ({ n: { $in: [1, 3] } }), ir: inn('n', [1, 3], false, 'find.n.$in'), hits: [1, 4] },
    { id: 'in-empty', node: 'in empty = constant false (no binding, column reference is the emitter\'s choice)', find: () => ({ n: { $in: [] } }), ir: inn('n', [], false, 'find.n.$in'), hits: [] },
    { id: 'nin', node: 'in not (three-valued: NULL row never hits)', find: () => ({ n: { $nin: [1, 3] } }), ir: inn('n', [1, 3], true, 'find.n.$nin'), hits: [2, 5, 6] },
    { id: 'in-bool-elements', node: 'in with boolean elements (bound as parameters)', find: () => ({ b: { $in: [true] } }), ir: inn('b', [true], false, 'find.b.$in'), hits: [1, 4] },
    { id: 'nin-bool-elements', node: 'in not with boolean elements (NULL row never hits)', find: () => ({ b: { $nin: [true] } }), ir: inn('b', [true], true, 'find.b.$nin'), hits: [2, 5] },
    { id: 'in-dollar', node: 'in: $..$ string is a literal', find: () => ({ s: { $in: ['$x$'] } }), ir: inn('s', ['$x$'], false, 'find.s.$in'), hits: [5] },
    { id: 'in-date', node: 'in with Date elements', find: () => ({ d: { $in: [new Date('2020-01-01T00:00:00Z'), new Date('2023-01-01T00:00:00Z')] } }), ir: inn('d', [D('2020-01-01T00:00:00Z'), D('2023-01-01T00:00:00Z')], false, 'find.d.$in'), hits: [1, 6] },
    //---- and / or / 展開 / 攤平 / 隱含AND
    { id: 'multi-column-and', node: 'implicit AND of columns', find: () => ({ s: 'a', b: true }), ir: and(cmp('s', 'eq', 'a', 'find.s'), bool('b', 'eq', true, 'find.b')), hits: [1, 4] },
    { id: 'multi-column-three', node: 'implicit AND of three columns, key order kept', find: () => ({ s: 'a', n: { $gte: 1 }, b: true }), ir: and(cmp('s', 'eq', 'a', 'find.s'), cmp('n', 'gte', 1, 'find.n.$gte'), bool('b', 'eq', true, 'find.b')), hits: [1, 4] },
    { id: 'same-column-ops', node: 'implicit AND of operators on one column', find: () => ({ n: { $gt: 0, $lt: 3 } }), ir: and(cmp('n', 'gt', 0, 'find.n.$gt'), cmp('n', 'lt', 3, 'find.n.$lt')), hits: [1, 2] },
    { id: 'multi-op-eq-ne', node: 'implicit AND of eq and ne on one column', find: () => ({ s: { $eq: 'a', $ne: 'b' } }), ir: and(cmp('s', 'eq', 'a', 'find.s.$eq'), cmp('s', 'ne', 'b', 'find.s.$ne')), hits: [1, 4] },
    { id: 'multi-op-in-nin', node: 'implicit AND of in and not in on one column', find: () => ({ n: { $in: [1, 2, 3], $nin: [2] } }), ir: and(inn('n', [1, 2, 3], false, 'find.n.$in'), inn('n', [2], true, 'find.n.$nin')), hits: [1, 4] },
    { id: 'multi-op-in-empty', node: 'empty in inside an AND makes the whole AND false', find: () => ({ n: { $in: [], $gt: 0 } }), ir: and(inn('n', [], false, 'find.n.$in'), cmp('n', 'gt', 0, 'find.n.$gt')), hits: [] },
    { id: 'and-contradict', node: 'and of contradicting equalities', find: () => ({ $and: [{ s: 'a' }, { s: 'b' }] }), ir: and(cmp('s', 'eq', 'a', 'find.$and[0].s'), cmp('s', 'eq', 'b', 'find.$and[1].s')), hits: [] },
    { id: 'and-ne-null', node: 'and of two not-null', find: () => ({ s: { $ne: null }, b: { $ne: null } }), ir: and(nul('s', true, 'find.s.$ne'), nul('b', true, 'find.b.$ne')), hits: [1, 2, 4, 5] },
    { id: 'or', node: 'or', find: () => ({ $or: [{ s: 'b' }, { n: { $gt: 3 } }] }), ir: or(cmp('s', 'eq', 'b', 'find.$or[0].s'), cmp('n', 'gt', 3, 'find.$or[1].n.$gt')), hits: [2, 5] },
    { id: 'or-null', node: 'or with a null node', find: () => ({ $or: [{ s: null }, { n: 4 }] }), ir: or(nul('s', false, 'find.$or[0].s'), cmp('n', 'eq', 4, 'find.$or[1].n')), hits: [3, 5] },
    { id: 'or-ne-null', node: 'or of not-null and null covers every row', find: () => ({ $or: [{ s: { $ne: null } }, { n: null }] }), ir: or(nul('s', true, 'find.$or[0].s.$ne'), nul('n', false, 'find.$or[1].n')), hits: [1, 2, 3, 4, 5, 6] },
    { id: 'and', node: 'and', find: () => ({ $and: [{ s: 'a' }, { n: { $gt: 1 } }] }), ir: and(cmp('s', 'eq', 'a', 'find.$and[0].s'), cmp('n', 'gt', 1, 'find.$and[1].n.$gt')), hits: [4] },
    { id: 'or-single-item', node: 'single-item or is unwrapped', find: () => ({ $or: [{ s: 'b' }] }), ir: cmp('s', 'eq', 'b', 'find.$or[0].s'), hits: [2] },
    { id: 'and-single-item', node: 'single-item and is unwrapped', find: () => ({ $and: [{ n: { $in: [1] } }] }), ir: inn('n', [1], false, 'find.$and[0].n.$in'), hits: [1] },
    { id: 'single-item-chain', node: 'single-item and/or chain is unwrapped at every level', find: () => ({ $and: [{ $or: [{ $and: [{ s: 'a' }] }] }] }), ir: cmp('s', 'eq', 'a', 'find.$and[0].$or[0].$and[0].s'), hits: [1, 4] },
    { id: 'or-flatten', node: 'same-type nesting is flattened (n-ary)', find: () => ({ $or: [{ $or: [{ s: 'a' }, { s: 'b' }] }, { s: '' }] }), ir: or(cmp('s', 'eq', 'a', 'find.$or[0].$or[0].s'), cmp('s', 'eq', 'b', 'find.$or[0].$or[1].s'), cmp('s', 'eq', '', 'find.$or[1].s')), hits: [1, 2, 4, 6] },
    { id: 'and-flatten', node: 'same-type nesting is flattened (n-ary)', find: () => ({ $and: [{ $and: [{ s: 'a' }, { b: true }] }, { n: { $gt: 1 } }] }), ir: and(cmp('s', 'eq', 'a', 'find.$and[0].$and[0].s'), bool('b', 'eq', true, 'find.$and[0].$and[1].b'), cmp('n', 'gt', 1, 'find.$and[1].n.$gt')), hits: [4] },
    { id: 'and-flatten-implicit', node: 'a multi-key document inside $and is flattened into the enclosing and', find: () => ({ $and: [{ s: 'a', b: true }, { n: { $gt: 1 } }] }), ir: and(cmp('s', 'eq', 'a', 'find.$and[0].s'), bool('b', 'eq', true, 'find.$and[0].b'), cmp('n', 'gt', 1, 'find.$and[1].n.$gt')), hits: [4] },
    { id: 'nested-and-in-or', node: 'and inside or keeps its grouping', find: () => ({ $or: [{ $and: [{ s: 'a' }, { n: { $lt: 3 } }] }, { s: '' }] }), ir: or(and(cmp('s', 'eq', 'a', 'find.$or[0].$and[0].s'), cmp('n', 'lt', 3, 'find.$or[0].$and[1].n.$lt')), cmp('s', 'eq', '', 'find.$or[1].s')), hits: [1, 6] },
    { id: 'nested-or-in-and', node: 'or inside and keeps its grouping', find: () => ({ $and: [{ $or: [{ s: 'a' }, { s: 'b' }] }, { $or: [{ n: 1 }, { n: 2 }] }] }), ir: and(or(cmp('s', 'eq', 'a', 'find.$and[0].$or[0].s'), cmp('s', 'eq', 'b', 'find.$and[0].$or[1].s')), or(cmp('n', 'eq', 1, 'find.$and[1].$or[0].n'), cmp('n', 'eq', 2, 'find.$and[1].$or[1].n'))), hits: [1, 2] },
    { id: 'column-beside-or', node: 'column key beside $or is ANDed with it', find: () => ({ b: true, $or: [{ s: 'a' }, { n: 3 }] }), ir: and(bool('b', 'eq', true, 'find.b'), or(cmp('s', 'eq', 'a', 'find.$or[0].s'), cmp('n', 'eq', 3, 'find.$or[1].n'))), hits: [1, 4] },
    { id: 'same-column-and-or', node: 'range on a column ANDed with an or on the same column', find: () => ({ n: { $gt: 0 }, $or: [{ n: { $lt: 2 } }, { n: { $gt: 3 } }] }), ir: and(cmp('n', 'gt', 0, 'find.n.$gt'), or(cmp('n', 'lt', 2, 'find.$or[0].n.$lt'), cmp('n', 'gt', 3, 'find.$or[1].n.$gt'))), hits: [1, 5] },
    { id: 'bool-ne-in-or', node: 'or of a three-valued bool ne and an in', find: () => ({ $or: [{ b: { $ne: true } }, { n: { $in: [0, 3] } }] }), ir: or(bool('b', 'ne', true, 'find.$or[0].b.$ne'), inn('n', [0, 3], false, 'find.$or[1].n.$in')), hits: [2, 4, 5, 6] },
    //---- 增補(2026-10-21 外審後): 完整度矩陣之缺格——bool 六運算子 x true/false、Date 六運算子與毫秒精度、字串六運算子、in/not in x 各值型別、or 內恆假、-0、值順序、數值字串
    { id: 'bool-gt-true', node: 'bool gt true: nothing is greater than true', find: () => ({ b: { $gt: true } }), ir: bool('b', 'gt', true, 'find.b.$gt'), hits: [] },
    { id: 'bool-gte-false', node: 'bool gte false: every non-NULL boolean', find: () => ({ b: { $gte: false } }), ir: bool('b', 'gte', false, 'find.b.$gte'), hits: [1, 2, 4, 5] },
    { id: 'bool-lt-false', node: 'bool lt false: nothing is less than false', find: () => ({ b: { $lt: false } }), ir: bool('b', 'lt', false, 'find.b.$lt'), hits: [] },
    { id: 'bool-lte-false', node: 'bool lte false', find: () => ({ b: { $lte: false } }), ir: bool('b', 'lte', false, 'find.b.$lte'), hits: [2, 5] },
    { id: 'in-bool-false', node: 'in with the boolean element false', find: () => ({ b: { $in: [false] } }), ir: inn('b', [false], false, 'find.b.$in'), hits: [2, 5] },
    { id: 'in-bool-both', node: 'in with both boolean elements (NULL rows still never hit)', find: () => ({ b: { $in: [true, false] } }), ir: inn('b', [true, false], false, 'find.b.$in'), hits: [1, 2, 4, 5] },
    { id: 'nin-bool-false', node: 'in not with the boolean element false (three-valued)', find: () => ({ b: { $nin: [false] } }), ir: inn('b', [false], true, 'find.b.$nin'), hits: [1, 4] },
    { id: 'date-ne', node: 'cmp ne Date (three-valued: NULL rows never hit)', find: () => ({ d: { $ne: new Date('2020-01-01T00:00:00Z') } }), ir: cmp('d', 'ne', D('2020-01-01T00:00:00Z'), 'find.d.$ne'), hits: [2, 4, 6] },
    { id: 'date-gte', node: 'cmp gte Date', find: () => ({ d: { $gte: new Date('2022-01-01T00:00:00Z') } }), ir: cmp('d', 'gte', D('2022-01-01T00:00:00Z'), 'find.d.$gte'), hits: [4, 6] },
    { id: 'date-lt', node: 'cmp lt Date', find: () => ({ d: { $lt: new Date('2022-01-01T00:00:00Z') } }), ir: cmp('d', 'lt', D('2022-01-01T00:00:00Z'), 'find.d.$lt'), hits: [1, 2] },
    { id: 'date-lte', node: 'cmp lte Date', find: () => ({ d: { $lte: new Date('2021-01-01T00:00:00Z') } }), ir: cmp('d', 'lte', D('2021-01-01T00:00:00Z'), 'find.d.$lte'), hits: [1, 2] },
    { id: 'date-ms-eq', node: 'cmp eq Date compares the instant to the millisecond (no truncation to the day or second)', find: () => ({ d: new Date('2020-01-01T00:00:00.001Z') }), ir: cmp('d', 'eq', D('2020-01-01T00:00:00.001Z'), 'find.d'), hits: [] },
    { id: 'date-ms-gt', node: 'cmp gt Date at millisecond precision', find: () => ({ d: { $gt: new Date('2020-01-01T00:00:00.001Z') } }), ir: cmp('d', 'gt', D('2020-01-01T00:00:00.001Z'), 'find.d.$gt'), hits: [2, 4, 6] },
    { id: 'date-ms-lt', node: 'cmp lt Date at millisecond precision', find: () => ({ d: { $lt: new Date('2020-01-01T00:00:00.001Z') } }), ir: cmp('d', 'lt', D('2020-01-01T00:00:00.001Z'), 'find.d.$lt'), hits: [1] },
    { id: 'date-nonmidnight', node: 'cmp gt Date with a non-midnight time of day', find: () => ({ d: { $gt: new Date('2021-06-15T13:45:30.250Z') } }), ir: cmp('d', 'gt', D('2021-06-15T13:45:30.250Z'), 'find.d.$gt'), hits: [4, 6] },
    { id: 'nin-date', node: 'in not with a Date element (NULL rows never hit)', find: () => ({ d: { $nin: [new Date('2020-01-01T00:00:00Z')] } }), ir: inn('d', [D('2020-01-01T00:00:00Z')], true, 'find.d.$nin'), hits: [2, 4, 6] },
    { id: 'ne-number', node: 'cmp ne number (three-valued: NULL row never hits)', find: () => ({ n: { $ne: 2 } }), ir: cmp('n', 'ne', 2, 'find.n.$ne'), hits: [1, 4, 5, 6] },
    { id: 'eq-negative-zero', node: 'cmp eq -0 keeps the negative zero in the IR and equals 0', find: () => ({ n: -0 }), ir: cmp('n', 'eq', NZ, 'find.n'), hits: [6] },
    { id: 'string-gt-empty', node: 'cmp gt the empty string (every non-empty string, in any collation)', find: () => ({ s: { $gt: '' } }), ir: cmp('s', 'gt', '', 'find.s.$gt'), hits: [1, 2, 4, 5] },
    { id: 'string-lte-empty', node: 'cmp lte the empty string (only the empty string, in any collation)', find: () => ({ s: { $lte: '' } }), ir: cmp('s', 'lte', '', 'find.s.$lte'), hits: [6] },
    { id: 'string-lt-collation', node: 'cmp lt string: the order of \'$x$\' against letters depends on the collation', find: () => ({ s: { $lt: 'b' } }), ir: cmp('s', 'lt', 'b', 'find.s.$lt'), hits: null },
    { id: 'nin-string', node: 'in not with a string element (NULL row never hits)', find: () => ({ s: { $nin: ['a'] } }), ir: inn('s', ['a'], true, 'find.s.$nin'), hits: [2, 5, 6] },
    { id: 'in-unsorted-duplicates', node: 'in keeps the element order and the duplicates of the find', find: () => ({ n: { $in: [3, 1, 3, 2] } }), ir: inn('n', [3, 1, 3, 2], false, 'find.n.$in'), hits: [1, 2, 4] },
    { id: 'or-empty-in', node: 'always-false branch inside or: the other branch decides', find: () => ({ $or: [{ n: { $in: [] } }, { s: 'b' }] }), ir: or(inn('n', [], false, 'find.$or[0].n.$in'), cmp('s', 'eq', 'b', 'find.$or[1].s')), hits: [2] },
    { id: 'or-empty-in-null', node: 'always-false branch inside or beside a null node', find: () => ({ $or: [{ n: { $in: [] } }, { s: null }] }), ir: or(inn('n', [], false, 'find.$or[0].n.$in'), nul('s', false, 'find.$or[1].s')), hits: [3] },
    { id: 'numeric-string-eq', node: 'cmp eq with a numeric-format string on an integer column converts to the number (typed column)', find: () => ({ n: '2' }), ir: cmp('n', 'eq', '2', 'find.n'), hits: [2] },
    { id: 'numeric-string-in', node: 'in with numeric-format strings and numbers on an integer column', find: () => ({ n: { $in: ['1', 3] } }), ir: inn('n', ['1', 3], false, 'find.n.$in'), hits: [1, 4] },
    { id: 'numeric-string-nonconvertible', node: 'cmp gt with a non-numeric string on an integer column: no hit, or a rejection by the typed backend', find: () => ({ n: { $gt: 'x' } }), ir: cmp('n', 'gt', 'x', 'find.n.$gt'), hits: [], schema: true },
    //---- 無條件
    { id: 'empty-object', node: 'no condition = null IR (all rows)', find: () => ({}), ir: null, hits: [1, 2, 3, 4, 5, 6] },
    { id: 'undefined', node: 'no condition = null IR (all rows)', find: () => undefined, ir: null, hits: [1, 2, 3, 4, 5, 6] },
]


export default { columns, seed, semantics, norm, denorm }
