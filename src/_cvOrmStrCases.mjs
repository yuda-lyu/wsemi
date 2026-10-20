//w-orm系列字串良構檢核之契約案例表(純資料, 內部模組不進index), 規則見CLAUDE_rulebook.md R-ORMSTR-01
//
//用途: 各w-orm-*套件(lmdb、level、lowdb、mongodb、postgresql、reladb、mdb)之測試以
//  import cvOrmStrCases from 'wsemi/src/_cvOrmStrCases.mjs'
//取得案例, 逐案對公開API執行, 使共用函數chkOrmStr、chkOrmData被各套件正確接線而非各寫一份. wsemi之chkOrmStr、chkOrmData測試亦逐案執行本表(單元層).
//
//匯出{ reasons, forms, cases, next }:
//  reasons: 原因詞彙{ notStr, nul, lone }, 與chkOrmStr之回傳值同
//  forms:   字串形態表{ 代號: { label, str, lone, nul, unit, long } }, lone表含孤立代理碼元(非良構), nul表含NUL(U+0000), unit表僅供單元層(API層不產生案例,
//           因部分資料庫對該碼點另有限制), long表長字串(不用於主鍵與名稱位置, 因鍵長度上限); 旗標為獨立標註(測試以獨立預言機核對)
//  cases:   案例陣列(平坦), 每案至少有{ id, group, label, expect }, 依group分兩層:
//  next:    增補案例陣列(2026-10-21起, 形狀同cases的API層; **不在cases內**, 使已發布後端既有之harness以cases.filter(...)取案時不受影響), 見(五)
//
//(一) 單元層 group='str'與'data': 直接呼叫wsemi函數(w-orm-*後端不必執行)
//    str:  { fn:'chkOrmStr', input, opt, expect }               expect為null或原因字串, 即chkOrmStr(input, opt)之回傳
//    data: { fn:'chkOrmData', make(), opt, expect }             make()每次回傳全新之輸入; expect為null或{ reason, path }
//
//(二) API層 group='id'|'single'|'val'|'free'|'type'|'toctou'|'order'|'opt'|'gfs': 逐案對後端公開API執行(見下方[後端套用方式])
//    { id, group, label, api, pos, form, str, variant, need, pre(mk), args(mk, base), expect }
//    api:     公開API名: insert | insertBulk | save | del | selectByPk | insertGfs | selectByPkGfs | delGfs | new(建構函數)
//    pos:     字串所在位置: id(主鍵) | name(頂層字串欄值) | nested(巢狀物件內字串值) | array(陣列元素) | arrayObj(陣列內物件之字串值) |
//             key(頂層資料鍵名) | nestedKey(巢狀物件之鍵名) | opt.db | opt.cl | opt.url
//    form:    forms之代號; str為該形態之字串(獨立列出, 供除錯)
//    variant: save專用: 'insert'(文件原不存在)或'update'(文件原已存在); 其餘為null
//    need:    後端須具備之能力, 缺者略過該案並於測試中註記: 'doc'=[接受後讀回]須資料可帶任意欄位名與巢狀結構(lmdb、level、lowdb、mongodb; 固定欄位之reladb、mdb與postgresql略過),
//             'gfs'=GridFS(mongodb), 空陣列表所有後端皆須通過. **拒收案一律不需'doc'**: 檢核(D1)先於欄位過濾與序列化, 固定欄位之後端對model外欄位、postgresql與reladb對JSON欄之不合格字串同樣須拒收
//             (僅next內之案使用, 2026-10-21增) 'inh'=後端把帶自訂原型之輸入(含繼承之可列舉存取器)複製後交給chkOrmData, 由[檢查之值即寫入之值]一組案(toctou:*:inh-getter-*)驗證其於獨立複本上走訪;
//             'event'=後端有change/error事件(wo.on), 由[事件交出之物件不影響其後各筆、訂閱函數拋錯不影響操作]一組案(toctou:save:event-*、listener-throws)驗證. 此二旗標僅供不採納該組案之後端於harness以caps宣告略過(須在測試註記並列入回報),
//             略過不等於合格
//    前提:    所有後端之測試夾具須提供[字串型主鍵欄id]與[字串欄name](reladb、mdb之model含id、name欄; postgresql傳opt.pk='id'且表含name欄); 不同的主鍵欄名或欄位型別由夾具與mk吸收
//    pre(mk): 回傳測前須以該後端之insertBulk(need含'gfs'之案為insertGfs)預存之文件陣列(皆良構, 先於被測呼叫)
//    args(mk, base): 回傳呼叫公開API之引數陣列(可含第二個option引數), 每次呼叫皆為全新值; base為後端之合法建構設定(僅api='new'使用)
//    afterCall(args): (選用, group='toctou')harness於呼叫API之後、await其結果之前同步呼叫, 模擬呼叫端立即改動原輸入; 後端須已複製輸入, 其改動不得影響寫入值
//    listen:  (選用, next內group='toctou', need含'event'){ event: 'change'|'error', fn, minCalls }: harness於呼叫API之前以wo.on(listen.event, 計數包裝之fn)註冊訂閱函數,
//             fn簽章同後端事件(mode, data, res), 模擬訂閱者同步改動事件交出之物件(或拋錯); 後端交出之data須與其後待處理(已檢核、待寫入)之筆互相獨立(快照), 訂閱者之改動不得影響其後各筆之寫入值與呼叫端原物件,
//             訂閱函數拋錯不得影響操作. 呼叫結束後harness須斷言fn至少被呼叫minCalls次(證明確有施壓, 避免後端不發該事件而案例空過); fn為無狀態純函數(可重複註冊);
//             不認得listen之harness視同無訂閱者, 該案退化為一般之成功案(仍須通過)
//    mk(id, extra): 由後端測試提供之文件工廠, 回傳一份可被該後端寫入之文件{ id, name:'n', ...extra }(extra之欄位覆蓋預設);
//                  need含'gfs'之案(group='gfs'與single組之insertGfs/delGfs)改傳mkGfs(同簽章, 另補該API必要之欄位, 如mongodb之u8a: new Uint8Array(…)); 案例表只經由mk/mkGfs建文件, 不假設後端之欄位結構
//    expect:  依kind:
//      kind='ok'        : 呼叫成功(insert*不reject且結果ok為1; save/del之每筆ok為1; selectByPk/selectByPkGfs回傳含result之文件)
//      kind='free'      : (group='free', 資料值與鍵名含NUL)後端可接受(讀回不限), 亦可因自身限制(如資料庫拒收NUL)拒收; 但拒收之訊息不得符合notMsg(正則字串,
//                         即不得以共用檢核之詞彙invalid id|invalid data: string contains lone surrogate|NUL拒收): 值與鍵名之NUL不屬共用檢核之範圍(D2); 預存之k0列須維持原樣(rows)
//      kind='rejectAll' : insert/insertBulk/insertGfs整批reject, 不寫任何一筆; reject值之訊息(Error.message, 或字串本身)全等於msg
//      kind='itemErr'   : save/del/delGfs逐筆: 回傳陣列與輸入等長且依序對應(輸入為單一物件時視為長度1之陣列); bad所列索引之項目ok為0且err全等於msg
//                         (bad含多個索引時以msgs依bad順序逐項給定), 其餘項目ok為1(同批照常處理)
//      kind='null'      : selectByPk/selectByPkGfs回傳null(不reject)
//      kind='throw'     : 建構函數同步throw, 訊息全等於msg
//      msg:  完整訊息; why: 原因詞彙(reasons之值), msg為其組成(invalid id|invalid data|invalid opt.<名>: 原因 at [路徑]); msgs: bad含多個索引時之逐項訊息陣列
//      bad:  含不合格字串之項目索引(0起算)
//      ids:  呼叫後集合內全部id(升冪; 以JS預設sort排序, 即UTF-16碼元序), 後端測試以select()取全部後比對; 無此欄者(Gfs)不比對
//      rows: 呼叫後須成立之文件(id對部分文件): 後端測試以selectByPk(id)取回, 每個預期鍵須存在且深度相等(其餘鍵不論)
//      unchanged: id陣列; 後端測試於呼叫前以selectByPk取其完整文件, 呼叫後須與之深度全等(證明失敗之呼叫不改動既有列, 含不得多出鍵; 鍵名改寫後撞鍵或新增即現形)
//      gfsIds: 呼叫後GridFS內全部id(升冪); 後端自備列舉方式(如另以WOrmMongodb實例對cl+'.files'之select取id, 或filename), 證明整批reject未寫入、逐筆未誤刪鄰近檔
//      result: kind='ok'之selectByPk, 取回文件須含之部分文件
//
//(三) 錯誤訊息詞彙(不回顯值, 路徑不含不合格之鍵名):
//    主鍵:   invalid id: <原因> at [data[<k>].id]
//    資料:   invalid data: <原因> at [data[<k>].<路徑>]   路徑之鍵名為物件鍵, 陣列元素為[索引], 不合格之鍵名以<invalid key>標示
//    名稱:   invalid opt.<db|cl|url>: <原因>
//    各後端須以[主鍵欄id為字串、欄位name為字串]為最小夾具, 並對id/single/val/order各組案例再以autoGenPk:false跑一次(檢核不隨autoGenPk改變, dspec〈一之三〉9.6); 後端特有選項路徑(如lmdb之merge:false)由各後端以同一批案例另跑.
//    同一文件內主鍵先於資料檢查; 同一物件內鍵名先於其值(自有鍵名、繼承鍵名、再自有值、繼承值); 同批以最小索引之不合格文件為準; 單一物件呼叫(group='single')之索引為data[0]
//    各後端之save/del逐筆迴圈須取得批次索引(如pmSeries回呼之第二參數)以組成data[<k>]; 去回顯: 不得以主鍵值或欄位值組成訊息
//
//(四) 範圍(刻意不涵蓋, 後端自行處理): NUL出現在資料值與資料鍵名之接受與否(group='free'只約束[不得以共用檢核之詞彙拒收], 因部分資料庫自身會拒收NUL)、
//    opt.db/opt.cl/opt.url含NUL、空字串主鍵、主鍵長度上限、非字串主鍵. 預存列用於證明[被拒絕之字串不會命中預存之U+FFFD等鄰近列];
//    主鍵含NUL且截斷後為空字串者(NUL_LEAD、NUL_ONLY)無鄰近列可預存, 其selectByPk只能以[回null]斷言(無法由鄰近列證偽).
//    next內[帶繼承之可列舉存取器的文件]以[成功且寫入被檢查之值]為期望(文件良構, 以含存取器為由另行拒收屬額外之拒收理由,
//    與[只因良構性拒收]之系列原則相斥); 選擇拒收此類文件之後端須於harness宣告caps.inh=false略過該組並說明.
//
//(五) 增補案例next(2026-10-21, R-ORMSTR-01規則17): 形狀同cases之API層, 另可帶listen. **不在cases內**: 既有harness皆以cases.filter(...)取案且只認need之doc、gfs,
//    若併入cases, 尚未套用[走訪獨立複本]之後端於升wsemi當下即紅(實測lmdb、level、lowdb、mongodb、reladb於inh-getter-*案紅). 各後端於套用修正後自行納入:
//      for (let c of [...cvOrmStrCases.cases.filter(...), ...cvOrmStrCases.next]) { ... }   (harness須認得need之inh、event與listen, 見下方[後端套用方式])
//    next之案以cases既有案之同一組mk/pre/args/expect語意撰寫, 不依賴任何後端; wsemi之測試對next逐案執行參考後端與其變異.
//
//[後端套用方式](以w-orm-lmdb風格為例, 其他後端換掉wo之建構與select取全部之寫法):
//  import cvOrmStrCases from 'wsemi/src/_cvOrmStrCases.mjs'
//  let mk = (id, extra) => ({ id, name: 'n', ...extra })
//  for (let c of [...cvOrmStrCases.cases, ...cvOrmStrCases.next].filter((v) => v.group !== 'str' && v.group !== 'data')) {   //只跑cases者去掉next
//      it(c.id, async () => {
//          if (c.need.some((n) => caps[n] === false)) { return this.skip() }  // 後端以caps宣告不具備之能力(doc、gfs、inh、event); it的callback須為async function(非箭頭函數)才有this.skip
//          let mkx = c.need.includes('gfs') ? mkGfs : mk
//          let wo = c.api === 'new' ? null : await freshBackend()               //每案全新資料夾/集合
//          if (wo) { await (c.need.includes('gfs') ? wo.insertGfs : wo.insertBulk)(c.pre(mkx)) }
//          let args = c.args(mkx, baseOpt)
//          let before = {}
//          for (let id of (c.expect.unchanged || [])) { before[id] = await (c.need.includes('gfs') ? wo.selectByPkGfs : wo.selectByPk)(id) }
//          let e = c.expect
//          if (e.kind === 'throw') {
//              assert.throws(() => ctor(...args), (err) => msgOf(err) === e.msg)
//              return
//          }
//          let r, rej
//          let nCalls = 0
//          if (c.listen) { wo.on(c.listen.event, (...a) => { nCalls++; return c.listen.fn(...a) }) }
//          try { let p = wo[c.api](...args); if (c.afterCall) { c.afterCall(args) } r = await p } catch (err) { rej = err }
//          if (c.listen) { assert.ok(nCalls >= c.listen.minCalls, 'listener was not called') }
//          if (e.kind === 'free') { /* 見kind='free': 若rej則msgOf(rej)不得符合new RegExp(e.notMsg); save/del之項目亦同 */ }
//          else if (e.kind === 'rejectAll') { assert.strictEqual(msgOf(rej), e.msg) }
//          else {
//              assert.ok(!rej, 'must not reject')
//              if (e.kind === 'null') { assert.strictEqual(r, null) }
//              if (e.kind === 'itemErr') { r.forEach((x, i) => e.bad.includes(i) ? assert.deepStrictEqual([x.ok, x.err], [0, e.msgs ? e.msgs[e.bad.indexOf(i)] : e.msg]) : assert.strictEqual(x.ok, 1)) }
//          }
//          if (e.kind === 'ok' && /^insert/.test(c.api)) { assert.strictEqual(r.ok, 1) }
//          if (e.ids) { assert.deepStrictEqual((await wo.select()).map((v) => v.id).sort(), e.ids) }
//          if (e.gfsIds) { assert.deepStrictEqual((await listGfs()).sort(), e.gfsIds) }
//          for (let id of (e.unchanged || [])) { assert.deepStrictEqual(await (c.need.includes('gfs') ? wo.selectByPkGfs : wo.selectByPk)(id), before[id]) }
//          if (e.kind === 'ok' && e.result) { assertPartial(r, e.result) }
//          for (let [id, part] of Object.entries(e.rows || {})) { assertPartial(await wo.selectByPk(id), part) }
//      })
//  }
//  其中msgOf(err)=err instanceof Error ? err.message : String(err); 單元層之str與data案由wsemi自身測試執行.


//原因詞彙(須與src/chkOrmStr.mjs之R表一致)
let reasons = {
    notStr: 'not a string',
    nul: 'string contains NUL',
    lone: 'string contains lone surrogate',
}

//字串形態(旗標獨立標註: lone=含孤立代理碼元, nul=含U+0000)
let F = (label, str, lone, nul, unit, long) => ({ label, str, lone, nul, unit: unit === true, long: long === true })
let forms = {
    ASCII: F('良構ASCII', 'abc', false, false),
    CJK: F('良構中文', '中文字串', false, false),
    EMOJI: F('良構emoji(成對代理)', 'a\u{1F600}b', false, false),
    EXTB: F('良構CJK擴充B區字(成對代理)', '\u{20BB7}野家', false, false),
    FFFD: F('良構U+FFFD', 'a�b', false, false),
    FFFD3: F('良構三個U+FFFD(lmdb讀回形)', 'a���', false, false),
    EDGE_PAIR: F('良構最小與最大代理對相接(僅單元層)', '𐀀􏿿', false, false, true),
    HI_END: F('孤立高位(尾)', 'a\uD800', true, false),
    HI_MID: F('孤立高位(中)', 'x\uD800y', true, false),
    HI_LEAD: F('孤立高位(首)', '\uD800x', true, false),
    HI_ONLY: F('僅一個孤立高位', '\uD800', true, false),
    LO_END: F('孤立低位(尾)', 'a\uDC00', true, false),
    LO_MID: F('孤立低位(中)', 'x\uDC00y', true, false),
    LO_LEAD: F('孤立低位(首)', '\uDC00x', true, false),
    LO_ONLY: F('僅一個孤立低位', '\uDC00', true, false),
    REV: F('反序代理對(低位在前高位在後, 兩個皆孤立)', 'a\uDC00\uD800', true, false),
    HI_HI: F('兩個連續高位', 'a\uD800\uD800', true, false),
    PAIR_LO: F('成對代理後多一個低位', 'a😀\uDE00', true, false),
    HI_PAIR: F('孤立高位後接成對代理', 'a\uD83D😀', true, false),
    HI_MAX: F('孤立高位上界DBFF', 'a\uDBFF', true, false),
    LO_MAX: F('孤立低位上界DFFF', 'a\uDFFF', true, false),
    LO_LO: F('兩個連續低位', 'a\uDC00\uDC00', true, false),
    FFFD_HI: F('U+FFFD與孤立高位混合', 'a\uFFFD\uD800', true, false),
    COMB: F('良構組合字元', 'e\u0301', false, false),
    ZWJ: F('良構ZWJ序列', '\u{1F468}\u200D\u{1F469}', false, false),
    SINGLE: F('良構單一字元', 'x', false, false),
    LONG_OK: F('良構長字串(1000碼元; 僅值/鍵名/單元層)', 'a'.repeat(1000), false, false, false, true),
    LONG_LONE: F('長字串末尾孤立高位(1000碼元; 僅值/鍵名/單元層)', `${'a'.repeat(1000)}\uD800`, true, false, false, true),
    NUL_LEAD: F('NUL(首)', '\u0000a', false, true),
    NUL_MID: F('NUL(中)', 'a\u0000b', false, true),
    NUL_END: F('NUL(尾)', 'a\u0000', false, true),
    NUL_ONLY: F('僅一個NUL', '\u0000', false, true),
    NUL_LONE: F('NUL加孤立高位(NUL先報)', 'a\u0000\uD800', true, true),
}
let formKeys = Object.keys(forms)

//形態在各位置之期望原因: 主鍵併入NUL(NUL先於孤立代理); 資料值與鍵名只檢孤立代理(NUL不在範圍); opt不產生NUL形態之案例
let whyId = (f) => (f.nul ? reasons.nul : f.lone ? reasons.lone : null)
let whyVal = (f) => (f.lone ? reasons.lone : null)

//sibling, 鄰近列: 被拒字串經UTF-8/BSON改寫後會撞到之良構字串(孤立代理碼元改為U+FFFD; NUL之C字串型截斷為NUL之前), 預存供證明不命中
let sibling = (s) => {
    let out = ''
    for (let c of s) {
        out += c.length === 1 && c.charCodeAt(0) >= 0xD800 && c.charCodeAt(0) <= 0xDFFF ? '�' : c
    }
    let cut = out.indexOf('\u0000')
    if (cut !== -1) {
        out = out.slice(0, cut)
    }
    return out
}

let ids = (a) => [...new Set(a)].sort()

let cases = []
let add = (c) => {
    cases.push(c)
}


//(一) 單元層: chkOrmStr
for (let k of formKeys) {
    let f = forms[k]
    add({ id: `str:${k}`, group: 'str', label: `chkOrmStr ${f.label}(預設)`, fn: 'chkOrmStr', form: k, input: f.str, opt: undefined, expect: whyId(f) })
    add({ id: `str:${k}:nul-off`, group: 'str', label: `chkOrmStr ${f.label}(opt.nul=false)`, fn: 'chkOrmStr', form: k, input: f.str, opt: { nul: false }, expect: whyVal(f) })
}
for (let [n, v] of [['undefined', undefined], ['null', null], ['number', 1], ['boolean', true], ['object', {}], ['array', ['a']], ['function', () => {}], ['String包裝物件', new String('abc')]]) { // eslint-disable-line no-new-wrappers
    add({ id: `str:non:${n}`, group: 'str', label: `chkOrmStr 非字串(${n})`, fn: 'chkOrmStr', form: null, input: v, opt: undefined, expect: reasons.notStr })
}


//資料位置(API層與data單元層共用): extra(s)為加入文件之欄位, path為chkOrmData以root為data時之路徑(不合格鍵名以<invalid key>標示)
let POS = {
    name: { need: [], extra: (s) => ({ name: s }), path: 'name', rows: (s) => ({ name: s }) },
    nested: { need: ['doc'], extra: (s) => ({ meta: { a: { s } } }), path: 'meta.a.s', rows: (s) => ({ meta: { a: { s } } }) },
    array: { need: ['doc'], extra: (s) => ({ tags: ['ok', s] }), path: 'tags[1]', rows: (s) => ({ tags: ['ok', s] }) },
    arrayObj: { need: ['doc'], extra: (s) => ({ list: [{ s }] }), path: 'list[0].s', rows: (s) => ({ list: [{ s }] }) },
    key: { need: ['doc'], extra: (s) => ({ [s]: 1 }), path: '<invalid key>', rows: (s) => ({ [s]: 1 }) },
    nestedKey: { need: ['doc'], extra: (s) => ({ meta: { [s]: 1 } }), path: 'meta.<invalid key>', rows: (s) => ({ meta: { [s]: 1 } }) },
}
let posKeys = Object.keys(POS)

//(一) 單元層: chkOrmData(位置 x 形態; 僅含NUL而無孤立代理之形態不產生, 其NUL之接受與否見group='free')
for (let p of posKeys) {
    for (let k of formKeys) {
        let f = forms[k]
        if (f.nul && !f.lone) {
            continue
        }
        let why = whyVal(f)
        add({
            id: `data:${p}:${k}`,
            group: 'data',
            label: `chkOrmData ${p} ${f.label}`,
            fn: 'chkOrmData',
            pos: p,
            form: k,
            make: () => ({ id: 'g1', name: 'n', ...POS[p].extra(f.str) }),
            opt: undefined,
            expect: why === null ? null : { reason: why, path: `data.${POS[p].path}` },
        })
    }
}


//(二) API層

//apiCase, API層案例(欄位齊備; str取自形態表)
let apiCase = (id, group, label, api, pos, form, variant, need, pre, args, expect) => ({ id, group, label, api, pos, form, str: forms[form].str, variant, need, pre, args, expect })

//ex, 期望(kind加其餘欄位)
let ex = (kind, fields) => ({ kind, ...fields })

//主鍵位置: insert/insertBulk/save/del/selectByPk與GridFS三函數
for (let k of formKeys) {
    let f = forms[k]
    if (f.unit || f.long) {
        continue
    }
    let why = whyId(f)
    let s = f.str
    let sib = sibling(s)
    let label = f.label
    let hasSib = why !== null && sib !== '' && sib !== s
    let sibIds = hasSib ? [sib] : []
    let sibRow = hasSib ? { [sib]: { name: 'pre-sib' } } : {}
    let pre = (mk) => [mk('k0', { name: 'pre' }), ...(hasSib ? [mk(sib, { name: 'pre-sib' })] : [])]
    let preIds = ids(['k0', ...sibIds])
    let msg = (i) => `invalid id: ${why} at [data[${i}].id]`

    for (let api of ['insert', 'insertBulk']) {
        let args = (mk) => [[mk('g0'), mk(s), mk('g2')]]
        let okEx = ex('ok', { ids: ids(['k0', 'g0', s, 'g2']), rows: { k0: { name: 'pre' } } })
        let rejEx = ex('rejectAll', { why, msg: msg(1), bad: [1], ids: preIds, rows: { k0: { name: 'pre' }, ...sibRow }, unchanged: ['k0', ...sibIds] })
        add(apiCase(`id:${api}:${k}`, 'id', `${api} 主鍵 ${label}`, api, 'id', k, null, [], pre, args, why === null ? okEx : rejEx))
    }

    //save: 主鍵不存在(插入路徑)
    let saveArgs = (mk) => [[mk('k0', { name: 'saved0' }), mk(s, { name: 'x' }), mk('k2', { name: 'saved2' })]]
    let saveOk = ex('itemErr', { bad: [], ids: ids(['k0', s, 'k2']), rows: { k0: { name: 'saved0' }, [s]: { name: 'x' }, k2: { name: 'saved2' } } })
    let saveRej = ex('itemErr', { why, msg: msg(1), bad: [1], ids: ids(['k0', 'k2', ...sibIds]), rows: { k0: { name: 'saved0' }, k2: { name: 'saved2' }, ...sibRow }, unchanged: sibIds })
    add(apiCase(`id:save:${k}`, 'id', `save 主鍵 ${label}`, 'save', 'id', k, 'insert', [], pre, saveArgs, why === null ? saveOk : saveRej))

    //save(option autoInsert:false): 主鍵不合格者不得命中鄰近列; 其餘項目(原已存在)照常更新
    if (why !== null) {
        let nsPre = (mk) => [...pre(mk), mk('k1', { name: 'pre1' })]
        let nsArgs = (mk) => [[mk('k0', { name: 'saved0' }), mk(s, { name: 'x' }), mk('k1', { name: 'saved1' })], { autoInsert: false }]
        let nsRej = ex('itemErr', { why, msg: msg(1), bad: [1], ids: ids(['k0', 'k1', ...sibIds]), rows: { k0: { name: 'saved0' }, k1: { name: 'saved1' }, ...sibRow }, unchanged: sibIds })
        add(apiCase(`id:save-noinsert:${k}`, 'id', `save(autoInsert:false) 主鍵 ${label}`, 'save', 'id', k, 'update', [], nsPre, nsArgs, nsRej))
    }

    //del
    let delPre = (mk) => [...pre(mk), mk('k1', { name: 'pre1' }), mk('k2', { name: 'pre2' }), ...(why === null ? [mk(s, { name: 'row' })] : [])]
    let delArgs = (mk) => [[mk('k0'), mk(s), mk('k2')]]
    let delOk = ex('itemErr', { bad: [], ids: ['k1'], rows: { k1: { name: 'pre1' } } })
    let delRej = ex('itemErr', { why, msg: msg(1), bad: [1], ids: ids(['k1', ...sibIds]), rows: { k1: { name: 'pre1' }, ...sibRow }, unchanged: ['k1', ...sibIds] })
    add(apiCase(`id:del:${k}`, 'id', `del 主鍵 ${label}`, 'del', 'id', k, null, [], delPre, delArgs, why === null ? delOk : delRej))

    //selectByPk
    let selPre = (mk) => [...pre(mk), ...(why === null ? [mk(s, { name: 'row' })] : [])]
    let selOk = ex('ok', { result: { id: s, name: 'row' } })
    let selRej = ex('null', { why, ids: preIds, rows: { k0: { name: 'pre' }, ...sibRow }, unchanged: ['k0', ...sibIds] })
    add(apiCase(`id:selectByPk:${k}`, 'id', `selectByPk 主鍵 ${label}`, 'selectByPk', 'id', k, null, [], selPre, () => [s], why === null ? selOk : selRej))

    //GridFS(mongodb): 主鍵位置, 文件由mk補上該API必要之欄位; 不比對集合內容
    let gfsSibs = (mk) => (why === null ? [mk(s)] : hasSib ? [mk(sib)] : [])
    let gfsIns = (mk) => [[mk('g0'), mk(s), mk('g2')]]
    add(apiCase(`gfs:insertGfs:${k}`, 'gfs', `insertGfs 主鍵 ${label}`, 'insertGfs', 'id', k, null, ['gfs'], (mk) => [mk('k0')], gfsIns, why === null ? ex('ok', { gfsIds: ids(['k0', 'g0', s, 'g2']) }) : ex('rejectAll', { why, msg: msg(1), bad: [1], gfsIds: ['k0'] })))
    add(apiCase(`gfs:selectByPkGfs:${k}`, 'gfs', `selectByPkGfs 主鍵 ${label}`, 'selectByPkGfs', 'id', k, null, ['gfs'], (mk) => [mk('k0'), ...gfsSibs(mk)], () => [s], why === null ? ex('ok', { result: { id: s }, gfsIds: ids(['k0', s]) }) : ex('null', { why, gfsIds: ids(['k0', ...sibIds]), unchanged: ['k0', ...sibIds] })))
    add(apiCase(`gfs:delGfs:${k}`, 'gfs', `delGfs 主鍵 ${label}`, 'delGfs', 'id', k, null, ['gfs'], (mk) => [mk('k0'), mk('k2'), ...gfsSibs(mk)], (mk) => [[mk('k0'), mk(s), mk('k2')]], why === null ? ex('itemErr', { bad: [], gfsIds: [] }) : ex('itemErr', { why, msg: msg(1), bad: [1], gfsIds: ids(sibIds), unchanged: sibIds })))

    //單一物件呼叫(非陣列): 批次索引為data[0]
    let msg0 = `invalid id: ${why} at [data[0].id]`
    for (let api of ['insert', 'insertBulk']) {
        let okEx = ex('ok', { ids: ids(['k0', s]), rows: { k0: { name: 'pre' } } })
        let rejEx = ex('rejectAll', { why, msg: msg0, bad: [0], ids: preIds, rows: { k0: { name: 'pre' }, ...sibRow }, unchanged: ['k0', ...sibIds] })
        add(apiCase(`single:${api}:${k}`, 'single', `${api}(單一物件) 主鍵 ${label}`, api, 'id', k, null, [], pre, (mk) => [mk(s)], why === null ? okEx : rejEx))
    }
    let sgSaveOk = ex('itemErr', { bad: [], ids: ids(['k0', s]), rows: { [s]: { name: 'x' } } })
    let sgSaveRej = ex('itemErr', { why, msg: msg0, bad: [0], ids: preIds, rows: { k0: { name: 'pre' }, ...sibRow }, unchanged: ['k0', ...sibIds] })
    add(apiCase(`single:save:${k}`, 'single', `save(單一物件) 主鍵 ${label}`, 'save', 'id', k, 'insert', [], pre, (mk) => [mk(s, { name: 'x' })], why === null ? sgSaveOk : sgSaveRej))
    let sgDelOk = ex('itemErr', { bad: [], ids: ['k0'], rows: { k0: { name: 'pre' } } })
    let sgDelRej = ex('itemErr', { why, msg: msg0, bad: [0], ids: preIds, rows: { k0: { name: 'pre' }, ...sibRow }, unchanged: ['k0', ...sibIds] })
    add(apiCase(`single:del:${k}`, 'single', `del(單一物件) 主鍵 ${label}`, 'del', 'id', k, null, [], (mk) => [...pre(mk), ...(why === null ? [mk(s, { name: 'row' })] : [])], (mk) => [mk(s)], why === null ? sgDelOk : sgDelRej))
    add(apiCase(`single:insertGfs:${k}`, 'single', `insertGfs(單一物件) 主鍵 ${label}`, 'insertGfs', 'id', k, null, ['gfs'], (mk) => [mk('k0')], (mk) => [mk(s)], why === null ? ex('ok', { gfsIds: ids(['k0', s]) }) : ex('rejectAll', { why, msg: msg0, bad: [0], gfsIds: ['k0'] })))
    add(apiCase(`single:delGfs:${k}`, 'single', `delGfs(單一物件) 主鍵 ${label}`, 'delGfs', 'id', k, null, ['gfs'], (mk) => [mk('k0'), ...gfsSibs(mk)], (mk) => [mk(s)], why === null ? ex('itemErr', { bad: [], gfsIds: ['k0'] }) : ex('itemErr', { why, msg: msg0, bad: [0], gfsIds: ids(['k0', ...sibIds]), unchanged: ['k0', ...sibIds] })))
}

//資料位置: 頂層字串欄值、巢狀、陣列、鍵名; 僅含NUL而無孤立代理之形態不產生(值與鍵名之NUL不屬共用檢核, 見group='free'); NUL加孤立代理者以孤立代理拒收
for (let p of posKeys) {
    for (let k of formKeys) {
        let f = forms[k]
        if ((f.nul && !f.lone) || f.unit) {
            continue
        }
        let why = whyVal(f)
        let s = f.str
        let pos = POS[p]
        let extra = () => pos.extra(s)
        let msg = (i) => `invalid data: ${why} at [data[${i}].${pos.path}]`
        let need = pos.need
        let pre = (mk) => [mk('k0', { name: 'pre' })]
        for (let api of ['insert', 'insertBulk']) {
            let okEx = ex('ok', { ids: ['g0', 'g1', 'g2', 'k0'], rows: { k0: { name: 'pre' }, g1: pos.rows(s) } })
            let rejEx = ex('rejectAll', { why, msg: msg(1), bad: [1], ids: ['k0'], rows: { k0: { name: 'pre' } }, unchanged: ['k0'] })
            add(apiCase(`val:${api}:${p}:${k}`, 'val', `${api} ${p} ${f.label}`, api, p, k, null, why === null ? need : [], pre, (mk) => [[mk('g0'), mk('g1', extra()), mk('g2')]], why === null ? okEx : rejEx))
        }
        for (let variant of ['insert', 'update']) {
            let upd = variant === 'update'
            let savePre = (mk) => [mk('k0', { name: 'pre' }), ...(upd ? [mk('g1', { name: 'pre-g1' })] : [])]
            let saveArgs = (mk) => [[mk('k0', { name: 'saved0' }), mk('g1', extra()), mk('k2', { name: 'saved2' })]]
            let okEx = ex('itemErr', { bad: [], ids: ['g1', 'k0', 'k2'], rows: { k0: { name: 'saved0' }, g1: pos.rows(s), k2: { name: 'saved2' } } })
            let rejEx = ex('itemErr', { why, msg: msg(1), bad: [1], ids: upd ? ['g1', 'k0', 'k2'] : ['k0', 'k2'], rows: { k0: { name: 'saved0' }, k2: { name: 'saved2' }, ...(upd ? { g1: { name: 'pre-g1' } } : {}) }, unchanged: upd ? ['g1'] : [] })
            add(apiCase(`val:save:${variant}:${p}:${k}`, 'val', `save(${variant}) ${p} ${f.label}`, 'save', p, k, variant, why === null ? need : [], savePre, saveArgs, why === null ? okEx : rejEx))
        }
    }
}

//資料值與鍵名含NUL(無孤立代理): 值可含NUL(D2), 共用檢核不得拒收; 後端因資料庫自身限制拒收者, 訊息不得為共用檢核之詞彙
let notMsg = '^invalid (id|data): string contains (lone surrogate|NUL)'
for (let p of posKeys) {
    for (let k of formKeys) {
        let f = forms[k]
        if (!f.nul || f.lone || f.unit) {
            continue
        }
        let s = f.str
        let pos = POS[p]
        let pre = (mk) => [mk('k0', { name: 'pre' })]
        for (let api of ['insert', 'insertBulk', 'save']) {
            let expect = ex('free', { notMsg, rows: { k0: { name: 'pre' } } })
            add(apiCase(`free:${api}:${p}:${k}`, 'free', `${api} ${p} ${f.label}(NUL不屬共用檢核)`, api, p, k, api === 'save' ? 'insert' : null, [], pre, (mk) => [[mk('g0'), mk('g1', pos.extra(s)), mk('g2')]], expect))
        }
    }
}

//實存型別(盤點: lmdb存Map/Set/Error/RegExp文字、mongodb存Map、cloneDeep保留原型與String包裝): 不合格字串位於各型別之內容, 一律拒收
let TYPE = {
    map: { extra: (s) => ({ m: new Map([['k', s]]) }), path: 'm[0]' },
    mapKey: { extra: (s) => ({ m: new Map([[s, 'v']]) }), path: 'm[0].<key>' },
    set: { extra: (s) => ({ st: new Set(['ok', s]) }), path: 'st[1]' },
    strobj: { extra: (s) => ({ w: new String(s) }), path: 'w' }, // eslint-disable-line no-new-wrappers
    error: { extra: (s) => ({ e: new Error(s) }), path: 'e.message' },
    regexp: { extra: (s) => ({ r: new RegExp(s) }), path: 'r.source' },
    inherit: { extra: (s) => ({ o: Object.create({ inh: s }) }), path: 'o.inh' },
    arrObjKey: { extra: (s) => ({ list: [{ [s]: 1 }] }), path: 'list[0].<invalid key>' },
}
for (let tp of Object.keys(TYPE)) {
    for (let k of ['HI_END', 'LO_MID', 'REV']) {
        let s = forms[k].str
        let msgT = `invalid data: ${reasons.lone} at [data[1].${TYPE[tp].path}]`
        let pre = (mk) => [mk('k0', { name: 'pre' })]
        let args = (mk) => [[mk('g0'), mk('g1', TYPE[tp].extra(s)), mk('g2')]]
        add(apiCase(`type:insert:${tp}:${k}`, 'type', `insert ${tp} 內含${forms[k].label}`, 'insert', tp, k, null, [], pre, args, ex('rejectAll', { why: reasons.lone, msg: msgT, bad: [1], ids: ['k0'], rows: { k0: { name: 'pre' } }, unchanged: ['k0'] })))
        add(apiCase(`type:save:${tp}:${k}`, 'type', `save ${tp} 內含${forms[k].label}`, 'save', tp, k, 'insert', [], pre, args, ex('itemErr', { why: reasons.lone, msg: msgT, bad: [1], ids: ['g0', 'g2', 'k0'], rows: { g0: { name: 'n' } } })))
    }
}

let H0 = forms.HI_END.str

//取值一致: 檢查之值即寫入之值(後端須複製後只用複本); 存取器每次讀取回不同值、呼叫後立即改動原輸入皆不得使寫入值與被檢值不同
let flipDoc = (mk, first, later) => {
    let n = 0
    let d = mk('g1')
    Object.defineProperty(d, 'name', {
        get() {
            n++
            return n === 1 ? first : later
        },
        enumerable: true,
        configurable: true
    })
    return d
}
for (let api of ['insert', 'insertBulk', 'save']) {
    let isSave = api === 'save'
    let variant = isSave ? 'insert' : null
    let pre = (mk) => [mk('k0', { name: 'pre' })]
    let badMsg = `invalid data: ${reasons.lone} at [data[1].name]`
    let rejEx = isSave
        ? ex('itemErr', { why: reasons.lone, msg: badMsg, bad: [1], ids: ['g0', 'g2', 'k0'], rows: { g0: { name: 'n' } } })
        : ex('rejectAll', { why: reasons.lone, msg: badMsg, bad: [1], ids: ['k0'], rows: { k0: { name: 'pre' } }, unchanged: ['k0'] })
    let okEx = isSave
        ? ex('itemErr', { bad: [], ids: ['g0', 'g1', 'g2', 'k0'], rows: { g1: { name: 'ok' } } })
        : ex('ok', { ids: ['g0', 'g1', 'g2', 'k0'], rows: { g1: { name: 'ok' } } })
    add(apiCase(`toctou:${api}:bad-first`, 'toctou', `${api} 存取器第一次讀到不合格值(其後為良構): 以第一次為準而拒收`, api, 'name', 'HI_END', variant, [], pre, (mk) => [[mk('g0'), flipDoc(mk, H0, 'ok'), mk('g2')]], rejEx))
    add(apiCase(`toctou:${api}:good-first`, 'toctou', `${api} 存取器第一次讀到良構值(其後為不合格): 寫入值為第一次所讀`, api, 'name', 'HI_END', variant, [], pre, (mk) => [[mk('g0'), flipDoc(mk, 'ok', H0), mk('g2')]], okEx))
    let after = apiCase(`toctou:${api}:mutate-after-call`, 'toctou', `${api} 呼叫後立即改動原輸入為不合格值: 寫入值仍為呼叫當時之值`, api, 'name', 'HI_END', variant, [], pre, (mk) => [[mk('g0'), mk('g1', { name: 'ok' }), mk('g2')]], okEx)
    after.afterCall = (args) => {
        args[0][1].name = H0
    }
    add(after)
}

//==== 增補案例next(2026-10-21; 不在cases內, 使既有harness不受影響; 見檔頭[(五)增補案例]) ====
//檢查之值即寫入之值, 擴及繼承存取器與事件訂閱者(R-ORMSTR-01規則17).
let next = []
let addNext = (c) => {
    next.push(c)
}

//繼承存取器副作用: cloneDeep保留原型(不讀繼承存取器), chkOrmData走訪時呼叫繼承之可列舉存取器(this為正被走訪之複本);
//  存取器之副作用若改動[被走訪之同一份複本], 其後寫入/刪除用的就不是被檢查之值(改寫成不合格字串、或把主鍵改指向既有他列).
//  後端須於獨立複本上走訪(寫入用複本不被走訪), 使檢查之值即寫入之值. 存取器掛在文件之原型上(可列舉), 副作用effect(self)作用於呼叫者之this.
//  期望一律為[成功且寫入被檢查之值]: 文件良構(chkOrmData於獨立複本回null), 以[文件含存取器]為由另行拒收屬額外之拒收理由, 與[只因良構性拒收]之系列原則相斥;
//  選擇拒收此類文件之後端須於harness宣告caps.inh=false略過本組並說明(need含'inh').
let inhDoc = (mk, id, extra, effect) => {
    let d = mk(id, extra)
    let proto = Object.create(Object.prototype, {
        inhSide: {
            get() {
                effect(this)
                return 'x'
            },
            enumerable: true,
            configurable: true
        }
    })
    Object.setPrototypeOf(d, proto)
    return d
}
for (let api of ['insert', 'insertBulk', 'save']) {
    let isSave = api === 'save'
    let variant = isSave ? 'insert' : null
    let pre = (mk) => [mk('k0', { name: 'pre' })]
    let okEx = isSave
        ? ex('itemErr', { bad: [], ids: ['g0', 'g1', 'g2', 'k0'], rows: { g1: { name: 'ok' } } })
        : ex('ok', { ids: ['g0', 'g1', 'g2', 'k0'], rows: { g1: { name: 'ok' } } })
    addNext(apiCase(`toctou:${api}:inh-getter-name`, 'toctou', `${api} 繼承存取器於走訪時把已檢查之name改成不合格值: 寫入值仍為被檢查之值`, api, 'name', 'HI_END', variant, ['inh'], pre, (mk) => [[mk('g0'), inhDoc(mk, 'g1', { name: 'ok' }, (self) => {
        self.name = H0
    }), mk('g2')]], okEx))
}
{
    //save(更新): 存取器於主鍵檢查之後把主鍵改指向既有之k0 -> 若與走訪同一份複本, 覆寫的是k0而非g1
    let pre = (mk) => [mk('k0', { name: 'pre' }), mk('g1', { name: 'pre-g1' })]
    addNext(apiCase('toctou:save:inh-getter-id', 'toctou', 'save(更新) 繼承存取器於走訪時把主鍵改指向既有他列: 仍只更新被檢查之主鍵所指之列', 'save', 'id', 'ASCII', 'update', ['inh'], pre, (mk) => [[inhDoc(mk, 'g1', { name: 'saved-g1' }, (self) => {
        self.id = 'k0'
    })]], ex('itemErr', { bad: [], ids: ['g1', 'k0'], rows: { k0: { name: 'pre' }, g1: { name: 'saved-g1' } }, unchanged: ['k0'] })))
    //del: 同上 -> 若與走訪同一份複本, 刪除的是k0而非g1
    addNext(apiCase('toctou:del:inh-getter-id', 'toctou', 'del 繼承存取器於走訪時把主鍵改指向既有他列: 仍只刪除被檢查之主鍵所指之列', 'del', 'id', 'ASCII', null, ['inh'], pre, (mk) => [[inhDoc(mk, 'g1', {}, (self) => {
        self.id = 'k0'
    })]], ex('itemErr', { bad: [], ids: ['k0'], rows: { k0: { name: 'pre' } }, unchanged: ['k0'] })))
}

//事件共享參照: 事件/回呼交出[待處理之複本]時, 訂閱者(同步執行於逐筆處理之間)改動它, 不得影響其後各筆之寫入值.
//  文件共用同一個meta物件(後端一次複製整批會保留其共享參照), 訂閱者於第一個事件把meta.s改成不合格值;
//  後端須交給訂閱者獨立快照, 使其後各筆(已檢核、待寫入)仍寫入meta.s = 'good'. 逐筆處理之後端才會暴露此缺陷, 整批寫完才發事件者必然通過.
//  需harness支援listen(見檔頭): 不支援者視同無訂閱者, 此組案退化為一般之save案(仍須通過); 支援者另驗訂閱函數至少被呼叫minCalls次(證明確有施壓).
let poison = (mode, data) => {
    for (let d of Array.isArray(data) ? data : [data]) {
        if (d !== null && typeof d === 'object' && d.meta !== null && typeof d.meta === 'object') {
            d.meta.s = H0
        }
    }
}
for (let variant of ['insert', 'update']) {
    let upd = variant === 'update'
    let pre = (mk) => [mk('k0', { name: 'pre' }), ...(upd ? ['g0', 'g1', 'g2'].map((id) => mk(id, { name: `pre-${id}` })) : [])]
    let good = () => ({ meta: { s: 'good' } })
    let c = apiCase(`toctou:save:event-shared:${variant}`, 'toctou', `save(${variant}) change事件之訂閱者改動交出之物件: 其後各筆(共用meta)仍寫入原值`, 'save', 'nested', 'HI_END', variant, ['doc', 'event'], pre, (mk) => {
        let meta = { s: 'good' }
        return [[mk('g0', { meta }), mk('g1', { meta }), mk('g2', { meta })]]
    }, ex('itemErr', { bad: [], ids: ['g0', 'g1', 'g2', 'k0'], rows: { k0: { name: 'pre' }, g0: good(), g1: good(), g2: good() } }))
    c.listen = { event: 'change', fn: poison, minCalls: 1 }
    addNext(c)
}
{
    //error事件: 第一筆不合格(其待處理複本經error事件交出), 與其共用meta之第二筆合格; error訂閱者改動第一筆之meta, 第二筆仍須寫入原值
    let c = apiCase('toctou:save:event-shared-error', 'toctou', 'save 不合格項之error事件的訂閱者改動交出之物件: 其後合格項(共用meta)仍寫入原值', 'save', 'nested', 'HI_END', 'insert', ['doc', 'event'], (mk) => [mk('k0', { name: 'pre' })], (mk) => {
        let meta = { s: 'good' }
        return [[mk('g0', { name: H0, meta }), mk('g1', { meta })]]
    }, ex('itemErr', { why: reasons.lone, msg: `invalid data: ${reasons.lone} at [data[0].name]`, bad: [0], ids: ['g1', 'k0'], rows: { k0: { name: 'pre' }, g1: { meta: { s: 'good' } } } }))
    c.listen = { event: 'error', fn: poison, minCalls: 1 }
    addNext(c)
}
{
    //訂閱函數拋錯不得影響操作: change事件之訂閱者拋錯, save仍成功且寫入值不變
    let c = apiCase('toctou:save:listener-throws', 'toctou', 'save change事件之訂閱者拋錯: 操作仍成功, 寫入值不變', 'save', 'name', 'ASCII', 'insert', ['event'], (mk) => [mk('k0', { name: 'pre' })], (mk) => [[mk('g0'), mk('g1', { name: 'ok' }), mk('g2')]], ex('itemErr', { bad: [], ids: ['g0', 'g1', 'g2', 'k0'], rows: { k0: { name: 'pre' }, g1: { name: 'ok' } } }))
    c.listen = {
        event: 'change',
        fn: () => {
            throw new Error('listener failure')
        },
        minCalls: 1,
    }
    addNext(c)
}

//同批多個不合格: 以最小索引之文件為準; 同文件主鍵先於資料; 同物件鍵名先於值
let H = forms.HI_END.str
let L = forms.LO_END.str
let order = (id, label, api, docsOf, bad, msg, extraExpect, need) => {
    let isBatch = api === 'insert' || api === 'insertBulk'
    let pre = (mk) => [mk('k0', { name: 'pre' })]
    let expect = isBatch
        ? ex('rejectAll', { why: reasons.lone, msg, bad: [bad], ids: ['k0'], rows: { k0: { name: 'pre' } }, unchanged: ['k0'], ...extraExpect })
        : ex('itemErr', { why: reasons.lone, msg, bad: [bad], ...extraExpect })
    add(apiCase(`order:${api}:${id}`, 'order', `${api} ${label}`, api, 'id', 'HI_END', api === 'save' ? 'insert' : null, need, pre, (mk) => [docsOf(mk)], expect))
}
for (let api of ['insert', 'insertBulk']) {
    order('two-bad-docs', '兩份文件皆不合格(以索引小者為準)', api, (mk) => [mk('g0'), mk('g1', { name: H }), mk(L)], 1, `invalid data: ${reasons.lone} at [data[1].name]`, {}, [])
    order('id-before-data', '同一文件主鍵與資料皆不合格(主鍵先報)', api, (mk) => [mk('g0'), mk(H, { name: L })], 1, `invalid id: ${reasons.lone} at [data[1].id]`, {}, [])
    order('key-before-value', '同一物件鍵名與值皆不合格(鍵名先報)', api, (mk) => [mk('g0'), mk('g1', { name: L, [H]: 1 })], 1, `invalid data: ${reasons.lone} at [data[1].<invalid key>]`, {}, [])
    order('document-order', '同一文件兩個巢狀物件皆不合格(依文件順序先出現者先報)', api, (mk) => [mk('g0', { a: { s: H }, b: L })], 0, `invalid data: ${reasons.lone} at [data[0].a.s]`, {}, [])
}
//逐筆處置: 同批多筆不合格各自 ok:0 與各自訊息, 其餘照常
let idMsg = (i) => `invalid id: ${reasons.lone} at [data[${i}].id]`
add(apiCase('order:del:two-bad', 'order', 'del 同批兩筆主鍵不合格(逐筆ok:0, 其餘照常)', 'del', 'id', 'HI_END', null, [], (mk) => [mk('k0', { name: 'pre' }), mk('k1')], (mk) => [[mk(H), mk('k1'), mk(L)]], ex('itemErr', { why: reasons.lone, msgs: [idMsg(0), idMsg(2)], bad: [0, 2], ids: ['k0'], rows: { k0: { name: 'pre' } } })))
add(apiCase('order:save:two-bad', 'order', 'save 同批兩筆主鍵不合格(逐筆ok:0, 其餘照常)', 'save', 'id', 'HI_END', 'insert', [], (mk) => [mk('k0', { name: 'pre' })], (mk) => [[mk(H, { name: 'x' }), mk('g1', { name: 'ok' }), mk(L, { name: 'y' })]], ex('itemErr', { why: reasons.lone, msgs: [idMsg(0), idMsg(2)], bad: [0, 2], ids: ['g1', 'k0'], rows: { k0: { name: 'pre' }, g1: { name: 'ok' } } })))
for (let api of ['insert', 'insertBulk']) {
    add(apiCase(`order:${api}:first-bad`, 'order', `${api} 首筆(索引0)主鍵不合格`, api, 'id', 'HI_END', null, [], (mk) => [mk('k0', { name: 'pre' })], (mk) => [[mk(H), mk('g1'), mk('g2')]], ex('rejectAll', { why: reasons.lone, msg: idMsg(0), bad: [0], ids: ['k0'], rows: { k0: { name: 'pre' } } })))
}
add(apiCase('order:save:first-bad', 'order', 'save 首筆(索引0)主鍵不合格', 'save', 'id', 'HI_END', 'insert', [], (mk) => [mk('k0', { name: 'pre' })], (mk) => [[mk(H, { name: 'x' }), mk('k2', { name: 's2' })]], ex('itemErr', { why: reasons.lone, msg: idMsg(0), bad: [0], ids: ['k0', 'k2'], rows: { k2: { name: 's2' } } })))
add(apiCase('order:del:first-bad', 'order', 'del 首筆(索引0)主鍵不合格', 'del', 'id', 'HI_END', null, [], (mk) => [mk('k0')], (mk) => [[mk(H), mk('k0')]], ex('itemErr', { why: reasons.lone, msg: idMsg(0), bad: [0], ids: [] })))
order('save-id-before-data', '同一文件主鍵與資料皆不合格(主鍵先報)', 'save', (mk) => [mk('k0', { name: 'saved0' }), mk(H, { name: L })], 1, `invalid id: ${reasons.lone} at [data[1].id]`, { ids: ['k0'], rows: { k0: { name: 'saved0' } } }, [])

//建構設定: opt.db、opt.cl、opt.url之孤立代理於建構時throw(僅孤立形態; 良構名稱是否可用屬各後端之命名規則)
for (let p of ['db', 'cl', 'url']) {
    for (let k of formKeys) {
        let f = forms[k]
        if (f.nul || !f.lone || f.unit || f.long) {
            continue
        }
        let args = (mk, base) => [{ ...base, [p]: p === 'url' ? `${base.url}${f.str}` : f.str }]
        add(apiCase(`opt:${p}:${k}`, 'opt', `建構 opt.${p} ${f.label}`, 'new', `opt.${p}`, k, null, [], () => [], args, ex('throw', { why: reasons.lone, msg: `invalid opt.${p}: ${reasons.lone}` })))
    }
}


export default { reasons, forms, cases, next }
