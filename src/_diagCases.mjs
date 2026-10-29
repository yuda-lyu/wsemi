/* eslint-disable no-new-wrappers, no-extend-native */ //語料刻意產生包裝物件, C10暫時於Object.prototype定義唯讀屬性(結束即刪)
//診斷輸出與遮罩之共用測試語料(純資料與產生函數, 內部模組不進index, 隨npm發布), 規則見sgud/rule/rulebook_diag.md R-DIAG-01
//
//用途: wsemi之getDiag系列測試逐案執行本表(有util與無util兩種環境各一次); 各套件之接線測試以
//  import diagCases from 'wsemi/src/_diagCases.mjs'
//取得語料, 以make(ctx)產生之輸入經本套件之真實呼叫點執行(例: 後端拋出make()之值 → 斷言funLog收到之detail或對外之reject值符合expect), 新發現之形態先入本表再修實作
//
//匯出{ secrets, cases, mkCtx, verify, collect }:
//  secrets(): 固定之測試秘密組{ url, username, password, num, token, path }(每次新物件)
//  cases: 案例陣列, 每案為
//    { id, group, fn, label, make(ctx), call(api, ctx), expect, need, wire }
//    id      案例代號(T文字/K鍵/V值/B二進位/E錯誤/P使用端程式/S結構/C摘要/U秘密導出/R對外值/O出口/A轉接器)
//    fn      主要受測之函數名
//    make    回傳全新之輸入(含Symbol、Proxy、跨realm物件、getter計數器ctx.hit())
//    call    wsemi自身測試之執行方式: api為{ getDiag, getDiagSecrets, maskDiagText, maskDiagCopy, maskDiagErr, maskDiagUrl, getDiagBriefErr, genDiagFunLog }, 回傳輸出(可為Promise)
//    expect  { noSecret: 'detail'|'reject'(輸出之一切字串、鍵、Symbol描述與單字元字串之依序串接皆不含該類秘密), userCode: 0(ctx.hits為0), check(out, ctx)(回傳true或失敗原因字串) }
//    need    'util'(只在util.types可用時適用其期望; 無util環境以check內之ctx.util分支記錄實際行為)、'realm'(需跨realm產生器ctx.realm)、'child'(需子行程, 由測試另行執行)
//    wire    true者為各套件接線測試應以其呼叫點重跑之案
//  mkCtx(env): 建立單案之ctx; env為{ util, realm(code), isNativeError(v), unhandled(), tick() }(皆可省略, 省略者相關檢查略過)
//  verify(c, out, ctx): 依expect判定, 回傳null(通過)或失敗原因字串
//  collect(out): 收集輸出內之全部字串(值、鍵、Symbol描述、錯誤之自有屬性、Map與Set之內容), 及單字元字串之依序串接


//secrets, 固定之測試秘密組
let secrets = () => {
    return {
        url: 'postgres://dbuser:Pw9xQ!z7@db.example.com:5432/app?sslpassword=Ssl8kLm3&application_name=svc',
        username: 'dbuser',
        password: 'Pw9xQ!z7',
        num: 48213579,
        token: 'tk_Z8y7X6w5V4',
        path: 'C:\\data\\store\\db01',
    }
}


//collect, 收集輸出內之全部字串與單字元串接(有界走訪; 函數之自有屬性亦走訪; 超過走訪上限者trunc為true, 由verify判失敗而不視未走訪者為乾淨)
let collect = (out) => {
    let ss = []
    let chars = ''
    let seen = new Set()
    let n = 0
    let trunc = false
    let walk = (v) => {
        if (n++ > 200000) {
            trunc = true
            return
        }
        if (typeof v === 'string') {
            ss.push(v)
            if (v.length === 1) {
                chars += v
            }
            return
        }
        if (typeof v === 'number' || typeof v === 'bigint') {
            ss.push(String(v))
            return
        }
        if (typeof v === 'symbol') {
            ss.push(String(v.description))
            return
        }
        if (v === null || (typeof v !== 'object' && typeof v !== 'function')) {
            return
        }
        if (seen.has(v)) {
            return
        }
        seen.add(v)
        //Map、Set以內建迭代之品牌檢查辨識(含跨realm、原型被改者; 非該型別拋TypeError)
        let it = null
        try {
            it = Map.prototype.entries.call(v)
        }
        catch (err) {
            it = null
        }
        if (it !== null) {
            for (let [k, x] of it) {
                walk(k)
                walk(x)
            }
        }
        try {
            it = Set.prototype.values.call(v)
        }
        catch (err) {
            it = null
        }
        if (it !== null) {
            for (let x of it) {
                walk(x)
            }
        }
        for (let k of Reflect.ownKeys(v)) {
            walk(k)
            let d = Object.getOwnPropertyDescriptor(v, k)
            if (d && Object.prototype.hasOwnProperty.call(d, 'value')) {
                walk(d.value)
            }
        }
    }
    walk(out)
    return { ss, chars, trunc }
}


//win5, 字串之每個5字元窗
let win5 = (s) => {
    let r = []
    for (let i = 0; i + 5 <= s.length; i++) {
        r.push(s.slice(i, i + 5))
    }
    return r
}


//needlesOf, 秘密原文: reject類(憑證)與detail類(憑證＋單獨帳號＋儲存路徑)
let needlesOf = (sec, kind) => {
    let r = [sec.password, `${sec.username}:${sec.password}`, sec.token, 'Ssl8kLm3']
    //憑證之5字元片段(部分遮罩殘留之可還原片段亦判失敗): 密碼、權杖、查詢秘密值之每個5字元窗
    for (let s of [sec.password, sec.token, 'Ssl8kLm3']) {
        r.push(...win5(s))
    }
    if (kind === 'detail') {
        r.push(sec.username, sec.path, sec.path.replace(/\\/g, '/'))
    }
    return r
}


//mkCtx, 建立單案之ctx
let mkCtx = (env = {}) => {
    let ctx = {
        sec: secrets(),
        hits: 0,
        util: env.util === true,
        realm: typeof env.realm === 'function' ? env.realm : null,
        isNativeError: typeof env.isNativeError === 'function' ? env.isNativeError : null,
        unhandled: typeof env.unhandled === 'function' ? env.unhandled : null,
        tick: typeof env.tick === 'function' ? env.tick : () => Promise.resolve(),
        extra: [],
    }
    ctx.hit = () => {
        ctx.hits++
    }
    ctx.src = () => ({ urls: [ctx.sec.url], username: ctx.sec.username, password: ctx.sec.password, paths: [ctx.sec.path], values: [ctx.sec.token] })
    return ctx
}


//verify, 依expect判定
let verify = (c, out, ctx) => {
    let e = c.expect || {}
    if (e.noSecret) {
        //案例另登錄之秘密(ctx.extra)同取5字元片段(部分遮罩殘留之可還原片段亦判失敗)
        let ns = [...needlesOf(ctx.sec, e.noSecret), ...ctx.extra, ...ctx.extra.flatMap((s) => win5(s))]
        let { ss, chars, trunc } = collect(out)
        if (trunc) {
            return 'checker walk limit exceeded (output not fully inspected)'
        }
        for (let s of ss) {
            for (let x of ns) {
                if (s.indexOf(x) >= 0) {
                    return `secret leaked: ${JSON.stringify(x)}`
                }
            }
        }
        for (let x of ns) {
            if (x.length > 1 && chars.indexOf(x) >= 0) {
                return `secret leaked char by char: ${JSON.stringify(x)}`
            }
        }
    }
    if (e.userCode === 0 && ctx.hits !== 0) {
        return `user code executed ${ctx.hits} times`
    }
    if (typeof e.check === 'function') {
        let r
        try {
            r = e.check(out, ctx)
        }
        catch (err) {
            return `check threw: ${err && err.message}`
        }
        if (r !== true) {
            return typeof r === 'string' ? r : 'check failed'
        }
    }
    return null
}


//工具
let jeq = (a, b) => JSON.stringify(a) === JSON.stringify(b)
let has = (o, k) => o !== null && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k)
let eq = (a, b) => (a === b ? true : `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`)
let b64 = (s) => {
    let bs = new TextEncoder().encode(s)
    let bin = ''
    for (let x of bs) {
        bin += String.fromCharCode(x)
    }
    return btoa(bin)
}

//呼叫捷徑
let txt = (api, ctx, s, list, opt) => api.maskDiagText(s, list === undefined ? api.getDiagSecrets(ctx.src()) : list, opt)
let cpy = (api, ctx, v, list, opt) => api.maskDiagCopy(v, list === undefined ? api.getDiagSecrets(ctx.src()) : list, opt)
let rej = (api, ctx, v, list, opt) => api.maskDiagErr(v, list === undefined ? api.getDiagSecrets(ctx.src()) : list, opt)

//capture, 暫時替換console之log與error以收集輸出(結束時還原)
let capture = async (fn) => {
    let rs = []
    let ol = console.log
    let oe = console.error
    console.log = (...args) => rs.push({ m: 'log', args })
    console.error = (...args) => rs.push({ m: 'error', args })
    try {
        await fn()
    }
    finally {
        console.log = ol
        console.error = oe
    }
    return rs
}


let cases = []
let add = (id, fn, label, o) => {
    cases.push({ id, group: id[0], fn, label, make: o.make || (() => undefined), call: o.call, expect: o.expect || {}, need: o.need || null, wire: o.wire === true })
}


//T 文字遮罩
add('T01', 'maskDiagText', '字串含密碼', {
    make: (ctx) => `failed: password ${ctx.sec.password} rejected`,
    call: (api, ctx) => txt(api, ctx, `failed: password ${ctx.sec.password} rejected`),
    expect: { noSecret: 'detail', check: (out) => out.indexOf('***') >= 0 || 'no mask' },
    wire: true,
})
add('T02', 'maskDiagText', '長短秘密首尾重疊(abcdef與defghi)', {
    call: (api) => api.maskDiagText('x abcdefghi y', ['abcdef', 'defghi']),
    expect: { check: (out) => eq(out, 'x *** y') },
})
add('T03', 'maskDiagText', '網址帳密scheme://u:p@host(未登錄)', {
    call: (api) => api.maskDiagText('connect mysql://alice:s3cr3t@host:3306/db', []),
    expect: { check: (out) => eq(out, 'connect mysql://***@host:3306/db') },
})
add('T04', 'maskDiagText', '帳密含多個@取至最後一個@', {
    call: (api) => api.maskDiagText('mongodb://al@ce:p@ss@h1:27017/x', []),
    expect: { check: (out) => eq(out, 'mongodb://***@h1:27017/x') },
})
add('T05', 'maskDiagText', '無路徑連線字串後接?, 主機不被吞', {
    call: (api) => api.maskDiagText('mongodb://h1:27017?replicaSet=a@b', []),
    expect: { check: (out) => eq(out, 'mongodb://h1:27017?replicaSet=a@b') },
})
add('T06', 'maskDiagText', '密碼含引號(含後接分隔符者)之未登錄網址、已登錄秘密必遮', {
    call: (api) => [api.maskDiagText('url mysql://bob:pa\'ss@h/db and pa"x,y', ['pa"x,y']), api.maskDiagText('https://alice:p",x@host/a', [])],
    expect: { check: (out) => (out[0].indexOf('pa\'ss') < 0 && out[0].indexOf('pa"x,y') < 0 && out[1] === 'https://***@host/a') || `leak: ${JSON.stringify(out)}` },
})
add('T07', 'maskDiagText', 'Bearer、token=、"password":、authorization: Basic', {
    make: () => 'h Bearer abc.def t token=xyz123 j {"password":"qq"} a authorization: Basic dXNlcjpwdw==',
    call: (api) => api.maskDiagText('h Bearer abc.def t token=xyz123 j {"password":"qq"} a authorization: Basic dXNlcjpwdw==', []),
    expect: { check: (out) => eq(out, 'h Bearer *** t token=*** j {"password":"***"} a authorization: ***') },
    wire: true,
})
add('T08', 'maskDiagText', '一般文字含Bearer字樣(前接英數)不誤遮', {
    call: (api) => api.maskDiagText('notBearer abc123 and xBearer zzz', []),
    expect: { check: (out) => eq(out, 'notBearer abc123 and xBearer zzz') },
})
add('T09', 'maskDiagText', '已遮之值再遮(冪等)', {
    call: (api, ctx) => {
        let s = 'a postgres://***@h token=*** Bearer *** "password":"***" PRAGMA key=\'***\''
        return [s, txt(api, ctx, s, undefined, { patterns: ['pragmaKey'] })]
    },
    expect: { check: (out) => eq(out[1], out[0]) },
})
add('T10', 'maskDiagText', '空字串與非字串秘密不切碎', {
    call: (api) => api.maskDiagText('abc zz9q def', ['', null, 123, {}, 'zz9q']),
    expect: { check: (out) => eq(out, 'abc *** def') },
})
add('T11', 'maskDiagText', '套件樣式PRAGMA key三語法', {
    call: (api) => api.maskDiagText('PRAGMA key=\'k1\'; PRAGMA main.rekey = "k2"; PRAGMA hexkey(k3)', [], { patterns: ['pragmaKey'] }),
    expect: { check: (out) => eq(out, 'PRAGMA key=\'***\'; PRAGMA main.rekey = "***"; PRAGMA hexkey(***)') },
})
add('T12', 'maskDiagText', '20001字元字串先遮後截', {
    call: (api, ctx) => txt(api, ctx, 'a'.repeat(19990) + ctx.sec.password + 'b'.repeat(3)),
    expect: { noSecret: 'detail', check: (out) => (out.endsWith('…(len=20001)') && out.length <= 20000 + 12) || `bad tail: ${out.slice(-30)}` },
})
add('T13', 'maskDiagText', '百分比編碼大小寫混用', {
    call: (api) => api.maskDiagText('login a%2Fb%3fc x', api.getDiagSecrets({ password: 'a/b?c' })),
    expect: { check: (out) => eq(out, 'login *** x') },
})
add('T14', 'maskDiagText', '帳號:密碼之base64單獨出現', {
    call: (api, ctx) => {
        ctx.extra.push(b64(`${ctx.sec.username}:${ctx.sec.password}`))
        return txt(api, ctx, `hdr ${b64(`${ctx.sec.username}:${ctx.sec.password}`)} end`)
    },
    expect: { noSecret: 'reject' },
})
add('T15', 'maskDiagText', '套件樣式與已知秘密跨界重疊無殘留', {
    call: (api) => api.maskDiagText('PRAGMA key=\'abc\'SECRET', ['abc\'SECRET'], { patterns: ['pragmaKey'] }),
    expect: { check: (out) => (out.indexOf('SECRET') < 0 && out.indexOf('abc') < 0) || `residue: ${out}` },
})
add('T16', 'maskDiagText', '1MB字串、秘密跨20000截點; 窗內大量命中使遮後變短時截點仍以原文位置計', {
    call: (api, ctx) => [
        txt(api, ctx, 'x'.repeat(19995) + ctx.sec.password + 'y'.repeat(1e6)),
        api.maskDiagText(`x${ctx.sec.password.repeat(2700)}`, [ctx.sec.password]),
    ],
    expect: {
        check: (out, ctx) => {
            let p = ctx.sec.password
            let ok0 = out[0].indexOf(p.slice(0, 3)) < 0 && out[0].endsWith(`…(len=${19995 + p.length + 1e6})`) && out[0].length < 20100
            let ok1 = out[1].indexOf(p.slice(0, 3)) < 0 && out[1].endsWith(`…(len=${1 + p.length * 2700})`)
            return (ok0 && ok1) || `bad: ${out[0].slice(19990, 20030)} | ${out[1].slice(-40)}`
        },
    },
})
add('T17', 'maskDiagText', '具名樣式mongoHostEcho、fsPathTail、receivedTail、mdbUrl', {
    call: (api) => [
        api.maskDiagText('Unable to parse u:pw@@x with URL', [], { patterns: ['mongoHostEcho'] }),
        api.maskDiagText('ENOENT: no such file or directory, open \'D:\\x\\y.mdb\'\n    at open (node:fs)', [], { patterns: ['fsPathTail'] }),
        api.maskDiagText('The "path" argument must be of type string. Received \'D:\\q\'', [], { patterns: ['receivedTail'] }),
        api.maskDiagText('bad mdb://user:p@ss:w end', [], { patterns: ['mdbUrl'] }),
    ],
    expect: { check: (out) => jeq(out, ['Unable to parse *** with URL', 'ENOENT: no such file or directory, open \'***\'\n    at open (node:fs)', 'The "path" argument must be of type string. Received ***', 'bad mdb://*** end']) || JSON.stringify(out) },
})
add('T18', 'maskDiagText', 'when判定為安全之主機不遮; when拋錯視為要遮', {
    call: (api) => [
        api.maskDiagText('Unable to parse h1:27017,h2:27018 with URL', [], { patterns: ['mongoHostEcho'] }),
        api.maskDiagText('id=ab12 x', [], {
            patterns: [{
                re: /id=(?<v>\w+)/,
                group: 'v',
                when: () => {
                    throw new Error('x')
                }
            }]
        }),
    ],
    expect: { check: (out) => jeq(out, ['Unable to parse h1:27017,h2:27018 with URL', 'id=*** x']) || JSON.stringify(out) },
})
add('T19', 'maskDiagText', '比對器之內容快取鍵一對一: 含\\u0000之秘密與以之分段之兩個秘密不共用比對器(兩種先後)', {
    call: (api) => [
        api.maskDiagText('x qZ7\u0000wV8 y', ['qZ7\u0000wV8']),
        api.maskDiagText('x qZ7 y wV8 z', ['qZ7', 'wV8']),
        api.maskDiagText('x mK4 y jR2 z', ['mK4', 'jR2']),
        api.maskDiagText('x mK4\u0000jR2 y mK4 z', ['mK4\u0000jR2']),
    ],
    expect: { check: (out) => jeq(out, ['x *** y', 'x *** y *** z', 'x *** y *** z', 'x *** y mK4 z']) || JSON.stringify(out) },
})
add('T20', 'maskDiagText', '秘密清單為可偵測之Proxy: maskDiagText、maskDiagCopy、maskDiagErr不當作空清單(util可用時fail-closed; 無util時經轉發讀取而遮)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let p = new Proxy([pw], {})
        return [api.maskDiagText(`x ${pw}`, p), api.maskDiagCopy({ msg: `x ${pw}` }, p), api.maskDiagErr(`x ${pw}`, p), api.maskDiagErr(new Error(`x ${pw}`), p).message]
    },
    expect: { noSecret: 'reject', check: (out, ctx) => (ctx.util ? jeq(out, ['***', '[Uncopyable]', '***', '***']) : true) || JSON.stringify(out) },
})
add('T21', 'maskDiagText', '秘密清單含存取器之項: getter不執行, 各函數與diag.mask皆fail-closed(無法檢查之清單不當作較短之清單)', {
    call: (api, ctx) => {
        let l = [ctx.sec.password]
        Object.defineProperty(l, 1, {
            get: () => {
                ctx.hit()
                return 'zzOther9'
            },
            enumerable: true
        })
        return [api.maskDiagText('x zzOther9', l), api.maskDiagCopy({ m: 'x zzOther9' }, l), api.maskDiagErr('x zzOther9', l), api.getDiag({}, { secrets: l }).mask('x zzOther9')]
    },
    expect: { userCode: 0, check: (out) => jeq(out, ['***', '[Uncopyable]', '***', '***']) || JSON.stringify(out) },
})
add('T22', 'maskDiagText', '憑證鍵值對之巢狀陣列值遮至對應之](引號內之]不提早結束)', {
    call: (api) => [api.maskDiagText('password=[["abcDEF"],"hunter22"] next', []), api.maskDiagText('token: [ \'a]b\', \'zz9yy\' ] end', [])],
    expect: { check: (out) => jeq(out, ['password=[***] next', 'token: [***] end']) || JSON.stringify(out) },
})
add('T23', 'maskDiagText', 'mongoHostEcho之回顯含重複起始字樣與同行兩段回顯皆遮(文字與對外值); 跳脫引號(\\"; 其內\\\\\\"不結束)之陣列值與內含撇號之陣列值遮至對應之](不吃掉其後之狀態與路徑); 中括號未閉合之陣列值遮至結尾', {
    call: (api) => {
        let pt = { patterns: ['mongoHostEcho'] }
        let arr = 'password=[\\"zzA1x\\",\\"zzB2y\\"] STATUS_OK C:\\STORE_A\\FILE_B'
        return [api.maskDiagText('Unable to parse zzQ1 Unable to parse HOST_A with URL', [], pt), api.maskDiagText('Unable to parse u:pw@@x with URL; Unable to parse v:pw@@y with URL', [], pt),
            api.maskDiagErr('Unable to parse zzQ1 Unable to parse HOST_A with URL', [], pt), api.maskDiagText(arr, []), api.maskDiagErr(arr, []), api.maskDiagText('password=[it\'s, zzA1x] tail', []),
            api.maskDiagText('password=[\\"zzA1]x\\"] tail', []), api.maskDiagText('password=[\\"A\\\\\\"B]zzV1x\\"] STATUS_OK', []), api.maskDiagText('password=[["zzV1x"],"zzI2y"', [])]
    },
    expect: {
        check: (out) => jeq(out, ['Unable to parse *** with URL', 'Unable to parse *** with URL; Unable to parse *** with URL', 'Unable to parse *** with URL',
            'password=[***] STATUS_OK C:\\STORE_A\\FILE_B', 'password=[***] STATUS_OK C:\\STORE_A\\FILE_B', 'password=[***] tail', 'password=[***] tail', 'password=[***] STATUS_OK', 'password=[***']) || JSON.stringify(out),
    },
})
add('T24', 'maskDiagText', '秘密清單之項: 包裝字串解包後列入; 其他物件與原始值略過(同T10); 可偵測之Proxy之項無法檢查而清單視為無法使用(util可用時); 清單無法使用時非字串之輸入亦回***; 失敗結果之項包裝為字串物件者仍fail-closed', {
    call: (api, ctx) => {
        let w = new String('zzA1x') // eslint-disable-line no-new-wrappers
        let src = { values: ['zzA1x'] }
        Object.defineProperty(src, 'password', { get: () => 'qqPw88', enumerable: true })
        let wrapped = api.getDiagSecrets(src).reject.map((x) => new String(x)) // eslint-disable-line no-new-wrappers
        let acc = ['zzA1x']
        Object.defineProperty(acc, 1, { get: () => 'zzB2y', enumerable: true })
        let px = [new Proxy(new String('zzA1x'), {})]
        return [api.maskDiagText('x zzA1x', [w]), api.maskDiagText('x zzA1x', [{}, 'zzA1x']), api.maskDiagText('x zzA1x', [new URL('http://h/q'), 'zzA1x']), api.maskDiagText('x 1234 true zzA1x', [null, 1234, true, 'zzA1x']),
            ctx.util ? [api.maskDiagText('x zzA1x', px), api.maskDiagErr('x zzA1x', px), api.maskDiagCopy({ m: 'x zzA1x' }, px)] : ['***', '***', '[Uncopyable]'],
            api.maskDiagText({ m: 'zzA1x' }, acc), api.maskDiagText('qqPw88', wrapped), api.maskDiagErr('qqPw88', wrapped)]
    },
    expect: { check: (out) => jeq(out, ['x ***', 'x ***', 'x ***', 'x 1234 true ***', ['***', '***', '[Uncopyable]'], '***', '***', '***']) || JSON.stringify(out) },
})


//K 鍵
add('K01', 'maskDiagCopy', '字串鍵含秘密', {
    make: (ctx) => ({ [`k_${ctx.sec.password}`]: 1 }),
    call: (api, ctx) => cpy(api, ctx, { [`k_${ctx.sec.password}`]: 1 }),
    expect: { noSecret: 'detail' },
    wire: true,
})
add('K02', 'maskDiagCopy', 'Symbol鍵描述含秘密', {
    call: (api, ctx) => cpy(api, ctx, { [Symbol(`s ${ctx.sec.password}`)]: 1 }),
    expect: { noSecret: 'detail' },
})
add('K03', 'maskDiagCopy', '陣列非索引字串鍵', {
    call: (api, ctx) => {
        let a = [1]
        a[`x${ctx.sec.password}`] = 2
        return cpy(api, ctx, a)
    },
    expect: { noSecret: 'detail', check: (out) => (Array.isArray(out) && out[0] === 1) || 'index lost' },
})
add('K04', 'maskDiagCopy', '陣列索引4294967295為非索引鍵', {
    call: (api, ctx) => {
        let a = [1]
        a['4294967295'] = 'v'
        return cpy(api, ctx, a)
    },
    expect: { check: (out) => (out.length === 1 && out['4294967295'] === 'v') || 'non-index key mishandled' },
})
add('K05', 'maskDiagCopy', '兩鍵遮罩後同名皆保留', {
    call: (api, ctx) => cpy(api, ctx, { [`a${ctx.sec.password}`]: 1, [`a${ctx.sec.username}`]: 2 }),
    expect: { noSecret: 'detail', check: (out) => (out['a***'] === 1 && out['a***#2'] === 2) || JSON.stringify(out) },
})
add('K06', 'maskDiagCopy', '__proto__自有鍵(JSON.parse產生)', {
    call: (api, ctx) => cpy(api, ctx, JSON.parse('{"__proto__":{"x":1},"a":2}')),
    expect: { check: (out) => (has(out, '__proto__') && Object.getPrototypeOf(out) === Object.prototype && out.a === 2) || 'proto changed' },
})
add('K07', 'maskDiagCopy', 'length鍵之物件(非陣列, R-OBJ-ITER-01)', {
    call: (api, ctx) => cpy(api, ctx, { length: 2, a: ctx.sec.password }),
    expect: { noSecret: 'detail', check: (out) => (!Array.isArray(out) && out.length === 2 && out.a === '***') || JSON.stringify(out) },
})
add('K08', 'maskDiagCopy', '數字秘密作陣列鍵4294967295', {
    call: (api) => {
        let a = []
        a['4294967295'] = 1
        return api.maskDiagCopy(a, ['4294967295'])
    },
    expect: { check: (out) => (has(out, '***') && !has(out, '4294967295')) || 'not masked' },
})
add('K09', 'maskDiagCopy', '憑證鍵名之值(未登錄秘密)整體***', {
    make: (ctx) => {
        ctx.extra.push('zzunreg1', 'qq9w', 'zzunreg2', 'zzunreg3')
        return { token: 'zzunreg1', Authorization: 'Basic qq9w', m: new Map([['password', 'zzunreg2']]), [Symbol('apiKey')]: 'zzunreg3', id: 'u-1' }
    },
    call: (api, ctx) => {
        ctx.extra.push('zzunreg1', 'qq9w', 'zzunreg2', 'zzunreg3')
        return api.maskDiagCopy({ token: 'zzunreg1', Authorization: 'Basic qq9w', m: new Map([['password', 'zzunreg2']]), [Symbol('apiKey')]: 'zzunreg3', id: 'u-1' }, [])
    },
    expect: { noSecret: 'detail', check: (out) => out.id === 'u-1' || 'id masked' },
    wire: true,
})
add('K10', 'maskDiagCopy', 'Map之非字串鍵解包後相同(1與new Number(1)、true與new Boolean(true))者各筆保留', {
    call: (api) => [...api.maskDiagCopy(new Map([[1, 'A'], [new Number(1), 'B'], [true, 'C'], [new Boolean(true), 'D']]), []).entries()],
    expect: { check: (out) => jeq(out, [[1, 'A'], ['1', 'B'], [true, 'C'], ['true', 'D']]) || JSON.stringify(out) },
})


//V 值
add('V01', 'maskDiagCopy', 'Symbol值描述', {
    call: (api, ctx) => cpy(api, ctx, { s: Symbol(ctx.sec.password) }),
    expect: { noSecret: 'detail' },
})
add('V02', 'maskDiagCopy', 'new String(秘密)解包', {
    make: (ctx) => new String(ctx.sec.password),
    call: (api, ctx) => cpy(api, ctx, new String(ctx.sec.password)),
    expect: { check: (out) => eq(out, '***') },
    wire: true,
})
add('V03', 'maskDiagCopy', '跨realm之new String', {
    need: 'realm',
    call: (api, ctx) => cpy(api, ctx, ctx.realm(`new String(${JSON.stringify(ctx.sec.password)})`)),
    expect: { check: (out) => eq(out, '***') },
})
add('V04', 'maskDiagCopy', 'new Number(數字秘密)、new Boolean', {
    call: (api, ctx) => api.maskDiagCopy({ n: new Number(ctx.sec.num), b: new Boolean(true) }, api.getDiagSecrets({ password: ctx.sec.num })),
    expect: { check: (out) => (out.n === '***' && out.b === true) || JSON.stringify(out) },
})
add('V05', 'maskDiagCopy', 'Object(Symbol(秘密))、Object(10n)', {
    call: (api, ctx) => cpy(api, ctx, { s: Object(Symbol(`x ${ctx.sec.password}`)), b: Object(BigInt(10)) }),
    expect: { noSecret: 'detail', check: (out) => out.b === BigInt(10) || 'bigint lost' },
})
add('V06', 'maskDiagCopy', '數字等於數字秘密(含負數、小數)', {
    call: (api) => api.maskDiagCopy({ a: -12345, b: 1234.5, c: 48213579, d: BigInt(48213579) }, ['-12345', '1234.5', '48213579']),
    expect: { check: (out) => jeq(out, { a: '***', b: '***', c: '***', d: '***' }) || JSON.stringify(out, (k, v) => (typeof v === 'bigint' ? String(v) : v)) },
})
add('V07', 'maskDiagCopy', '3位數字不足門檻', {
    call: (api) => api.maskDiagCopy({ a: 123 }, ['123']),
    expect: { check: (out) => out.a === 123 || 'masked' },
})
add('V08', 'maskDiagCopy', 'bigint', {
    call: (api) => api.maskDiagCopy({ a: BigInt('98765432109876543210'), b: BigInt(5) }, ['98765432109876543210']),
    expect: { check: (out) => (out.a === '***' && out.b === BigInt(5)) || 'bad' },
})
add('V09', 'getDiagSecrets', '數字帳密(password: 12345、bigint)導出並遮', {
    call: (api) => {
        let s1 = api.getDiagSecrets({ password: 12345 })
        let s2 = api.getDiagSecrets({ password: BigInt(6789012345) })
        return [api.maskDiagCopy({ a: 12345, b: BigInt(12345), s: 'code 12345' }, s1), api.maskDiagCopy({ a: 6789012345 }, s2), s2.reject.includes('6789012345')]
    },
    expect: { check: (out) => (jeq(out[0], { a: '***', b: '***', s: 'code ***' }) && out[1].a === '***' && out[2] === true) || 'bad' },
})
add('V10', 'maskDiagCopy', 'Map、Set、Date之額外自有屬性一併複製(值依規則遮)', {
    call: (api, ctx) => {
        let m = Object.assign(new Map([['id', 12]]), { note: `x ${ctx.sec.password}`, status: 'available' })
        let s = Object.assign(new Set([1]), { status: 'ok' })
        let d = Object.assign(new Date(0), { status: 'ok', token: 'zz' })
        let r = cpy(api, ctx, { m, s, d })
        return { r, own: [r.m.get('id'), r.m.note, r.m.status, r.s.status, r.d.status, r.d.token, r.d.getTime()] }
    },
    expect: { noSecret: 'detail', check: (out) => jeq(out.own, [12, 'x ***', 'available', 'ok', 'ok', '***', 0]) || JSON.stringify(out.own) },
})


//B 二進位
add('B01', 'maskDiagCopy', 'Buffer、Uint8Array、DataView、ArrayBuffer、SharedArrayBuffer', {
    call: (api, ctx) => cpy(api, ctx, {
        u: new Uint8Array(4),
        d: new DataView(new ArrayBuffer(4)),
        a: new ArrayBuffer(4),
        s: typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(4) : new ArrayBuffer(4),
        f: new Float64Array(2),
        b: typeof Buffer === 'function' ? Buffer.alloc(4) : new Uint8Array(4),
    }),
    expect: { check: (out) => jeq(out, { u: '[Binary 4 bytes]', d: '[Binary 4 bytes]', a: '[Binary 4 bytes]', s: '[Binary 4 bytes]', f: '[Binary 16 bytes]', b: '[Binary 4 bytes]' }) || JSON.stringify(out) },
})
add('B02', 'maskDiagCopy', '覆寫byteLength getter不執行', {
    call: (api, ctx) => {
        let u = new Uint8Array(4)
        Object.defineProperty(u, 'byteLength', {
            get() {
                ctx.hit()
                return 999
            }
        })
        return cpy(api, ctx, u)
    },
    expect: { userCode: 0, check: (out) => eq(out, '[Binary 4 bytes]') },
})
add('B03', 'maskDiagCopy', '偽造原型之二進位樣物件不拋、不執行', {
    call: (api, ctx) => {
        let o = Object.create(Uint8Array.prototype)
        Object.defineProperty(o, 'x', {
            enumerable: true,
            get() {
                ctx.hit()
                return 1
            }
        })
        return cpy(api, ctx, o)
    },
    expect: { userCode: 0, check: (out) => (out !== null && typeof out === 'object' && out.x === '[Getter/Setter]') || JSON.stringify(out) },
})


//E 錯誤
add('E01', 'maskDiagCopy', '錯誤訊息含秘密', {
    make: (ctx) => new Error(`auth ${ctx.sec.password}`),
    call: (api, ctx) => cpy(api, ctx, new Error(`auth ${ctx.sec.password}`)),
    expect: { noSecret: 'detail', check: (out) => out instanceof Error || 'not error' },
    wire: true,
})
add('E02', 'maskDiagCopy', 'stack含秘密', {
    call: (api, ctx) => {
        let e = new Error(`boom ${ctx.sec.password}`)
        return cpy(api, ctx, e)
    },
    expect: { noSecret: 'detail', check: (out) => (typeof out.stack === 'string' && out.stack.indexOf('***') >= 0) || `stack: ${out.stack}` },
})
add('E03', 'maskDiagCopy', '自訂類別(原型上name)保留類別名', {
    call: (api, ctx) => {
        class DbErr extends Error {}
        DbErr.prototype.name = 'DbErr'
        class NoName extends Error {}
        return [cpy(api, ctx, new DbErr('x')), cpy(api, ctx, new NoName('y'))]
    },
    expect: { check: (out) => (out[0].name === 'DbErr' && out[1].name === 'NoName' && out[0] instanceof Error) || `${out[0].name} ${out[1].name}` },
})
add('E04', 'maskDiagCopy', 'name、message為存取器不執行, stack不可讀', {
    call: (api, ctx) => {
        let e = new Error('x')
        Object.defineProperty(e, 'message', {
            get() {
                ctx.hit()
                return ctx.sec.password
            }
        })
        Object.defineProperty(e, 'name', {
            get() {
                ctx.hit()
                return 'N'
            }
        })
        return cpy(api, ctx, e)
    },
    expect: { userCode: 0, noSecret: 'detail', check: (out) => (out.stack === '[Stack unavailable]' && out.message === '[Getter/Setter]') || `${out.stack}` },
})
add('E05', 'maskDiagCopy', '掛Error.prepareStackTrace後新建之錯誤, hook未被呼叫', {
    call: (api, ctx) => {
        let d = Object.getOwnPropertyDescriptor(Error, 'prepareStackTrace')
        Error.prepareStackTrace = () => {
            ctx.hit()
            return ctx.sec.password
        }
        try {
            return cpy(api, ctx, new Error('x'))
        }
        finally {
            if (d === undefined) {
                delete Error.prepareStackTrace
            }
            else {
                Object.defineProperty(Error, 'prepareStackTrace', d)
            }
        }
    },
    expect: { userCode: 0, noSecret: 'detail', check: (out) => eq(out.stack, '[Stack unavailable]') },
})
add('E06', 'maskDiagCopy', '自訂stack getter不執行', {
    call: (api, ctx) => {
        let e = new Error('x')
        Object.defineProperty(e, 'stack', {
            get() {
                ctx.hit()
                return ctx.sec.password
            }
        })
        return cpy(api, ctx, e)
    },
    expect: { userCode: 0, check: (out) => eq(out.stack, '[Stack unavailable]') },
})
add('E07', 'maskDiagCopy', 'cause鏈含秘密(深度3)', {
    make: (ctx) => new Error('a', { cause: new Error('b', { cause: new Error(`c ${ctx.sec.password}`) }) }),
    call: (api, ctx) => cpy(api, ctx, new Error('a', { cause: new Error('b', { cause: new Error(`c ${ctx.sec.password}`) }) })),
    expect: { noSecret: 'detail', check: (out) => (out.cause.cause.message === 'c ***') || JSON.stringify(out.cause.cause.message) },
    wire: true,
})
add('E08', 'maskDiagCopy', 'AggregateError.errors逐項遮', {
    call: (api, ctx) => cpy(api, ctx, new AggregateError([new Error(`x ${ctx.sec.password}`), `y ${ctx.sec.password}`], 'agg')),
    expect: { noSecret: 'detail', check: (out) => (out instanceof AggregateError && Array.isArray(out.errors) && out.errors.length === 2) || 'bad' },
})
add('E09', 'maskDiagCopy', '跨realm之Error', {
    need: 'realm',
    call: (api, ctx) => cpy(api, ctx, ctx.realm(`new TypeError(${JSON.stringify(`auth ${'Pw9xQ!z7'}`)})`)),
    expect: { noSecret: 'detail', check: (out) => (out instanceof TypeError && out.name === 'TypeError') || `${out && out.name} ${out instanceof TypeError}` },
})
add('E10', 'maskDiagCopy', '無自有stack之錯誤, 副本不帶偽造stack', {
    call: (api, ctx) => {
        let e = new Error('x')
        delete e.stack
        return cpy(api, ctx, e)
    },
    expect: { check: (out) => !has(out, 'stack') || 'fake stack' },
})
add('E11', 'maskDiagCopy', 'message為帶toString之物件', {
    call: (api, ctx) => {
        let e = new Error('x')
        e.message = {
            toString() {
                ctx.hit()
                return ctx.sec.password
            }
        }
        return cpy(api, ctx, e)
    },
    expect: { userCode: 0, check: (out) => (out.message === '[Object]' && out.stack === '[Stack unavailable]') || `${out.message} ${out.stack}` },
})
add('E12', 'maskDiagCopy', '原型上get name()(MongoError型)', {
    call: (api, ctx) => {
        class MErr extends Error {
            get name() {
                ctx.hit()
                return 'MErr'
            }
        }
        return cpy(api, ctx, new MErr('x'))
    },
    expect: { userCode: 0, check: (out) => eq(out.name, 'MErr') },
})
add('E13', 'maskDiagErr', '含私有欄位getter之錯誤經副本(已知限制: getter於副本拋TypeError)', {
    call: (api, ctx) => {
        class PErr extends Error {
            #x = 1
            get x() {
                return this.#x
            }
        }
        let e = new PErr(`auth ${ctx.sec.password}`)
        let r = rej(api, ctx, e)
        let threw = null
        try {
            r.x // eslint-disable-line no-unused-expressions
        }
        catch (err) {
            threw = err instanceof TypeError
        }
        return { copied: r !== e, inst: r instanceof PErr, threw }
    },
    expect: { check: (out) => jeq(out, { copied: true, inst: true, threw: true }) || JSON.stringify(out) },
})
add('E14', 'maskDiagCopy', '載入前已掛名為ErrorPrepareStackTrace之hook(已知限制: 子行程記錄)', {
    need: 'child',
    call: () => null,
    expect: {},
})


//P 使用端程式
add('P01', 'maskDiagCopy', '存取器屬性不執行', {
    make: (ctx) => ({
        get a() {
            ctx.hit()
            return ctx.sec.password
        }
    }),
    call: (api, ctx) => cpy(api, ctx, {
        get a() {
            ctx.hit()
            return ctx.sec.password
        }
    }),
    expect: { userCode: 0, check: (out) => eq(out.a, '[Getter/Setter]') },
    wire: true,
})
add('P02', 'maskDiagCopy', 'Proxy(陷阱計數): util可用時[Proxy]且陷阱0次', {
    need: 'util',
    call: (api, ctx) => {
        let h = {}
        for (let t of ['get', 'getOwnPropertyDescriptor', 'ownKeys', 'getPrototypeOf', 'has']) {
            h[t] = (...args) => {
                ctx.hit()
                return Reflect[t](...args)
            }
        }
        return cpy(api, ctx, { p: new Proxy({ a: ctx.sec.password }, h) })
    },
    expect: { noSecret: 'detail', check: (out, ctx) => (ctx.util ? (out.p === '[Proxy]' && ctx.hits === 0) || `${out.p} hits=${ctx.hits}` : true) },
})
add('P03', 'maskDiagCopy', 'Proxy(new String(秘密))不逐字元', {
    call: (api, ctx) => cpy(api, ctx, { p: new Proxy(new String(ctx.sec.password), {}) }),
    expect: { noSecret: 'detail', check: (out, ctx) => eq(out.p, ctx.util ? '[Proxy]' : '[Object]') },
})
add('P04', 'maskDiagCopy', '已撤銷之Proxy只標記該節點', {
    call: (api, ctx) => {
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        return cpy(api, ctx, { a: proxy, b: 'ok' })
    },
    expect: { check: (out, ctx) => (out.b === 'ok' && out.a === (ctx.util ? '[Proxy]' : '[Uncopyable]')) || JSON.stringify(out) },
})
add('P05', 'maskDiagCopy', '原型上util.inspect.custom, 副本無該原型', {
    call: (api, ctx) => {
        let o = Object.create({
            [Symbol.for('nodejs.util.inspect.custom')]() {
                ctx.hit()
                return 'x'
            }
        })
        o.a = 1
        return cpy(api, ctx, o)
    },
    expect: { userCode: 0, check: (out) => (Object.getPrototypeOf(out) === Object.prototype && out.a === 1) || 'proto kept' },
})
add('P06', 'maskDiagCopy', 'toJSON方法不執行', {
    call: (api, ctx) => cpy(api, ctx, {
        toJSON() {
            ctx.hit()
            return 'x'
        },
        a: 1
    }),
    expect: { userCode: 0, check: (out) => eq(out.toJSON, '[Function]') },
})
add('P07', 'maskDiagCopy', '覆寫valueOf、toString、Symbol.toStringTag getter不執行', {
    call: (api, ctx) => {
        class K {
            valueOf() {
                ctx.hit()
                return 1
            }

            toString() {
                ctx.hit()
                return 'k'
            }

            get [Symbol.toStringTag]() {
                ctx.hit()
                return 'K'
            }
        }
        let o = {
            valueOf: () => ctx.hit(),
            toString: () => ctx.hit(),
            get [Symbol.toStringTag]() {
                ctx.hit()
                return 'X'
            }
        }
        return cpy(api, ctx, { k: new K(), o })
    },
    expect: { userCode: 0 },
})
add('P08', 'maskDiagCopy', '循環getPrototypeOf陷阱之Proxy不卡死', {
    call: (api, ctx) => {
        let p = new Proxy({}, {
            getPrototypeOf() {
                ctx.hit()
                return p
            }
        })
        return cpy(api, ctx, { p })
    },
    //無util時之實際行為(已知限制, 記錄之): 陷阱被執行但次數有界(原型鏈走訪上限), 節點為一般物件之空副本
    expect: { check: (out, ctx) => (ctx.util ? out.p === '[Proxy]' && ctx.hits === 0 : jeq(out.p, {}) && ctx.hits > 0 && ctx.hits <= 100) || `${JSON.stringify(out.p)} hits=${ctx.hits}` },
})
add('P09', 'maskDiagCopy', 'setPrototypeOf(new String(秘密), null)與Proxy(new String(秘密))不逐字元', {
    call: (api, ctx) => cpy(api, ctx, { a: Object.setPrototypeOf(new String(ctx.sec.password), null), b: new Proxy(new String(ctx.sec.password), {}) }),
    expect: { noSecret: 'detail', check: (out, ctx) => (ctx.util ? (out.a === '***' && out.b === '[Proxy]') : (out.a === '***' && out.b === '[Object]')) || JSON.stringify(out) },
})


//S 結構
add('S01', 'maskDiagCopy', '自我循環為[Circular]且可JSON.stringify', {
    call: (api, ctx) => {
        let o = { a: 1 }
        o.self = o
        return cpy(api, ctx, o)
    },
    expect: { check: (out) => (out.self === '[Circular]' && JSON.stringify(out) === '{"a":1,"self":"[Circular]"}') || 'bad' },
})
add('S02', 'maskDiagCopy', 'DAG共享參照於預算內重新拷貝(輸出為樹)', {
    call: (api, ctx) => {
        let x = { v: 1 }
        return cpy(api, ctx, { a: x, b: x })
    },
    expect: { check: (out) => (jeq(out, { a: { v: 1 }, b: { v: 1 } }) && out.a !== out.b) || JSON.stringify(out) },
})
add('S03', 'maskDiagCopy', '深度20於第8層[Truncated]', {
    call: (api, ctx) => {
        let o = { end: 1 }
        for (let i = 0; i < 20; i++) {
            o = { c: o }
        }
        return cpy(api, ctx, o)
    },
    expect: {
        check: (out) => {
            let x = out
            for (let i = 0; i < 8; i++) {
                x = x.c
            }
            return x === '[Truncated]' || `depth8=${JSON.stringify(x)}`
        }
    },
})
add('S04', 'maskDiagCopy', '10000元素陣列截短並以[Truncated]收尾, 無空洞; 陣列元素計入共用之節點預算', {
    call: (api, ctx) => {
        let b = {}
        for (let i = 0; i < 2000; i++) {
            b[`k${i}`] = i
        }
        let sib = cpy(api, ctx, { a: Array.from({ length: 4000 }, (v, i) => i), b })
        return Object.assign(cpy(api, ctx, Array.from({ length: 10000 }, (v, i) => i)), { sib })
    },
    expect: {
        check: (out) => {
            if (!(out.sib.b['[Truncated]'] > 0)) {
                return 'array elements not counted in the node budget'
            }
            if (out[out.length - 1] !== '[Truncated]' || out.length > 5001) {
                return `len=${out.length}`
            }
            for (let i = 0; i < out.length; i++) {
                if (!(i in out)) {
                    return `hole at ${i}`
                }
            }
            return true
        }
    },
})
add('S05', 'maskDiagCopy', '6000鍵物件加[Truncated]鍵記略去數', {
    call: (api, ctx) => {
        let o = {}
        for (let i = 0; i < 6000; i++) {
            o[`k${i}`] = i
        }
        return cpy(api, ctx, o)
    },
    expect: { check: (out) => (typeof out['[Truncated]'] === 'number' && out['[Truncated]'] > 0 && Object.keys(out).length - 1 + out['[Truncated]'] === 6000) || `${out['[Truncated]']}` },
})
add('S06', 'maskDiagCopy', '稀疏陣列空洞不補值', {
    call: (api, ctx) => cpy(api, ctx, [1, , 3]), // eslint-disable-line no-sparse-arrays
    expect: { check: (out) => (out.length === 3 && !(1 in out) && out[0] === 1 && out[2] === 3) || JSON.stringify(out) },
})
add('S07', 'maskDiagCopy', 'Map、Set含秘密', {
    make: (ctx) => ({ m: new Map([['k', ctx.sec.password], [ctx.sec.password, 'v']]), s: new Set([ctx.sec.password]) }),
    call: (api, ctx) => cpy(api, ctx, { m: new Map([['k', ctx.sec.password], [ctx.sec.password, 'v']]), s: new Set([ctx.sec.password]) }),
    expect: { noSecret: 'detail', check: (out) => (out.m instanceof Map && out.s instanceof Set && out.m.size === 2) || 'bad' },
    wire: true,
})
add('S08', 'maskDiagCopy', 'Date、無效Date、RegExp、Promise、WeakMap、函數各標記', {
    call: (api, ctx) => cpy(api, ctx, { d: new Date(1000), i: new Date(NaN), r: /x/g, p: Promise.resolve(1), w: new WeakMap(), f: () => 1 }),
    expect: { check: (out) => (out.d instanceof Date && out.d.getTime() === 1000 && out.i === '[Invalid Date]' && out.r === '[RegExp]' && out.p === '[Promise]' && out.w === '[Object]' && out.f === '[Function]') || JSON.stringify(out) },
})
add('S09', 'maskDiagCopy', '200列×3欄×100次之耗時(相對基準, 本行程CPU時間)', {
    call: (api, ctx) => {
        let rows = Array.from({ length: 200 }, (v, i) => ({ id: `id${i}`, name: `n${i} ${i % 7 === 0 ? ctx.sec.password : ''}`, v: i }))
        let ss = api.getDiagSecrets(ctx.src())
        let cpu = () => (typeof process !== 'undefined' && process.cpuUsage ? process.cpuUsage() : null)
        let t0 = cpu()
        let out = null
        for (let i = 0; i < 100; i++) {
            out = api.maskDiagCopy(rows, ss)
        }
        let t1 = cpu()
        for (let i = 0; i < 2000; i++) {
            JSON.parse(JSON.stringify(rows)) //基準取2000次(CPU時間之計量粒度於Windows約15.6ms), 換算為100次
        }
        let t2 = cpu()
        let us = (a, b) => (a === null ? null : (b.user + b.system) - (a.user + a.system))
        return { out, mine: us(t0, t1), base: t1 === null ? null : us(t1, t2) / 20 }
    },
    expect: {
        check: (r, ctx) => {
            ctx.extra.length = 0
            let leak = collect(r.out).ss.some((s) => s.indexOf(ctx.sec.password) >= 0)
            if (leak || r.out.length !== 200) {
                return 'bad output'
            }
            //相對基準(同次數之JSON往返)之倍數上限60(2026-10-29本機實測約5～17倍): 擋數量級之退化(每節點產生例外、平方成本)
            return r.mine === null || r.mine <= Math.max(r.base, 1000) * 60 || `cpu ${r.mine}us vs base ${r.base}us`
        },
    },
})
add('S10', 'maskDiagCopy', 'new Array(1e7)與1e6元素陣列: 有界、成本與長度無關(結構)', {
    call: (api, ctx) => {
        let a = api.maskDiagCopy(new Array(1e7), [])
        let b = api.maskDiagCopy(new Array(1e6).fill(0), [])
        let c = api.maskDiagCopy(new Array(1e6), [])
        return { a, b, c }
    },
    expect: {
        check: (r) => {
            //有界且與長度無關: 1e7與1e6之空陣列輸出逐項相同(空洞保留, 只在截點以[Truncated]收尾), 1e6元素之陣列輸出為0與[Truncated]
            let holes = (a) => a.slice(0, -1).every((v, i) => !(i in a))
            let ok = r.a.length <= 5001 && r.a.length === r.c.length && holes(r.a) && holes(r.c) && r.a[r.a.length - 1] === '[Truncated]' &&
                r.b.length === r.a.length && r.b.slice(0, -1).every((v) => v === 0) && r.b[r.b.length - 1] === '[Truncated]'
            return ok || `${r.a.length} ${r.b.length} ${r.c.length}`
        },
    },
})
add('S11', 'maskDiagCopy', '6層×20個指向同一子節點(DAG)展開不超過節點上限', {
    call: (api, ctx) => {
        let o = { leaf: 1 }
        for (let i = 0; i < 6; i++) {
            let n = {}
            for (let j = 0; j < 20; j++) {
                n[`k${j}`] = o
            }
            o = n
        }
        return cpy(api, ctx, o)
    },
    expect: {
        check: (out) => {
            let n = 0
            let walk = (v) => {
                if (v !== null && typeof v === 'object') {
                    for (let k of Object.keys(v)) {
                        n++
                        walk(v[k])
                    }
                }
            }
            walk(out)
            return n <= 5000 || `nodes=${n}`
        }
    },
})


//C 摘要
add('C01', 'getDiagBriefErr', 'ECONNREFUSED、EAI_AGAIN、E2BIG收', {
    make: () => ['ECONNREFUSED', 'EAI_AGAIN', 'E2BIG'].map((c) => Object.assign(new Error('x'), { code: c })),
    call: (api) => ['ECONNREFUSED', 'EAI_AGAIN', 'E2BIG'].map((c) => api.getDiagBriefErr(Object.assign(new Error('x'), { code: c }))),
    expect: { check: (out) => jeq(out, [{ errType: 'Error', errCode: 'ECONNREFUSED' }, { errType: 'Error', errCode: 'EAI_AGAIN' }, { errType: 'Error', errCode: 'E2BIG' }]) || JSON.stringify(out) },
    wire: true,
})
add('C02', 'getDiagBriefErr', '整數12345不收', {
    call: (api) => api.getDiagBriefErr(Object.assign(new Error('x'), { code: 12345 })),
    expect: { check: (out) => jeq(out, { errType: 'Error' }) || JSON.stringify(out) },
})
add('C03', 'getDiagBriefErr', 'E123456789、EMP04、ERR_ACCOUNT_ALICE01不收', {
    call: (api) => ['E123456789', 'EMP04', 'ERR_ACCOUNT_ALICE01'].map((c) => api.getDiagBriefErr(Object.assign(new Error('x'), { code: c }))),
    expect: { check: (out) => (out.length === 3 && out.every((o) => jeq(o, { errType: 'Error' }))) || JSON.stringify(out) },
})
add('C04', 'getDiagBriefErr', '套件集合之代碼: 宣告者收、未宣告者不收', {
    call: (api) => {
        let cs = [['23505', 'sqlstate'], ['SQLITE_BUSY', 'sqlite'], ['MDB_NOTFOUND', 'lmdb'], ['ER_DUP_ENTRY', 'mysql'], ['LEVEL_DATABASE_NOT_OPEN', 'level'], ['ELOGIN', 'mssql']]
        return cs.map(([c, n]) => [api.getDiagBriefErr(Object.assign(new Error('x'), { code: c }), { codes: [n] }).errCode, api.getDiagBriefErr(Object.assign(new Error('x'), { code: c })).errCode])
    },
    expect: { check: (out) => (jeq(out.map(([a]) => a), ['23505', 'SQLITE_BUSY', 'MDB_NOTFOUND', 'ER_DUP_ENTRY', 'LEVEL_DATABASE_NOT_OPEN', 'ELOGIN']) && out.every(([, b]) => b === undefined)) || JSON.stringify(out) },
})
add('C05', 'getDiagBriefErr', 'original.code(nested宣告)收', {
    call: (api) => {
        let e = new Error('x')
        e.original = { code: 'SQLITE_BUSY' }
        return [api.getDiagBriefErr(e, { codes: ['sqlite'], nested: ['original', 'parent'] }), api.getDiagBriefErr(e, { codes: ['sqlite'] })]
    },
    expect: { check: (out) => (out[0].errCode === 'SQLITE_BUSY' && out[1].errCode === undefined) || JSON.stringify(out) },
})
add('C06', 'getDiagBriefErr', '非Error物件之code依集合', {
    call: (api) => [api.getDiagBriefErr({ code: 'ENOENT' }), api.getDiagBriefErr({ code: 'alice' }), api.getDiagBriefErr('s'), api.getDiagBriefErr(null), api.getDiagBriefErr(() => 1), api.getDiagBriefErr(BigInt(1))],
    expect: { check: (out) => jeq(out, [{ errType: 'object', errCode: 'ENOENT' }, { errType: 'object' }, { errType: 'string' }, { errType: 'null' }, { errType: 'function' }, { errType: 'bigint' }]) || JSON.stringify(out) },
})
add('C07', 'getDiagBriefErr', '自訂類別名為Error、宣告之DatabaseError照列', {
    call: (api) => {
        class Alice01Error extends Error {}
        class DatabaseError extends Error {}
        return [api.getDiagBriefErr(new Alice01Error('x')), api.getDiagBriefErr(new DatabaseError('x'), { types: ['DatabaseError'] }), api.getDiagBriefErr(new TypeError('x'))]
    },
    expect: { check: (out) => jeq(out, [{ errType: 'Error' }, { errType: 'DatabaseError' }, { errType: 'TypeError' }]) || JSON.stringify(out) },
})
add('C08', 'getDiagBriefErr', 'Proxy錯誤: util可用時為Proxy且陷阱0次', {
    need: 'util',
    call: (api, ctx) => {
        let h = {}
        for (let t of ['get', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'has', 'ownKeys']) {
            h[t] = (...args) => {
                ctx.hit()
                return Reflect[t](...args)
            }
        }
        return api.getDiagBriefErr(new Proxy(Object.assign(new Error('x'), { code: 'ENOENT' }), h))
    },
    //無util時之實際行為(已知限制, 記錄之): Proxy不可偵測, 陷阱被執行, 依其目標判為Error與代碼
    expect: { check: (out, ctx) => (ctx.util ? (jeq(out, { errType: 'Proxy' }) && ctx.hits === 0) : (jeq(out, { errType: 'Error', errCode: 'ENOENT' }) && ctx.hits > 0)) || `${JSON.stringify(out)} hits=${ctx.hits}` },
})
add('C09', 'getDiagBriefErr', 'code為getter不執行', {
    call: (api, ctx) => api.getDiagBriefErr(Object.defineProperty(new Error('x'), 'code', {
        get() {
            ctx.hit()
            return 'ENOENT'
        }
    })),
    expect: { userCode: 0, check: (out) => jeq(out, { errType: 'Error' }) || JSON.stringify(out) },
})
add('C10', 'getDiagBriefErr', 'Object.prototype上有同名唯讀屬性不拋', {
    call: (api) => {
        let ks = ['errType', 'errCode']
        for (let k of ks) {
            Object.defineProperty(Object.prototype, k, { value: 'x', writable: false, configurable: true })
        }
        try {
            let e = new Error('x')
            e.code = 'ENOENT'
            let r = api.getDiagBriefErr(e)
            return { own: Object.prototype.hasOwnProperty.call(r, 'errType') && Object.prototype.hasOwnProperty.call(r, 'errCode'), t: r.errType, c: r.errCode }
        }
        finally {
            for (let k of ks) {
                delete Object.prototype[k]
            }
        }
    },
    expect: { check: (out) => jeq(out, { own: true, t: 'Error', c: 'ENOENT' }) || JSON.stringify(out) },
})
add('C11', 'getDiagBriefErr', 'MongoServerError之code 11000(宣告mongoServer)收、未宣告之整數不收', {
    call: (api) => {
        let e = Object.assign(new Error('E11000 duplicate key'), { code: 11000 })
        let e2 = Object.assign(new Error('x'), { code: 99999 })
        return [api.getDiagBriefErr(e, { codes: ['mongoServer'] }).errCode, api.getDiagBriefErr(e).errCode, api.getDiagBriefErr(e2, { codes: ['mongoServer'] }).errCode]
    },
    expect: { check: (out) => jeq(out, [11000, undefined, undefined]) || JSON.stringify(out) },
})
add('C12', 'getDiagBriefErr', '跨realm之Error依類別名規則', {
    need: 'realm',
    call: (api, ctx) => [api.getDiagBriefErr(ctx.realm('new TypeError("x")')), api.getDiagBriefErr(ctx.realm('Object.assign(new Error("x"), { code: "ENOENT" })'))],
    expect: { check: (out) => jeq(out, [{ errType: 'TypeError' }, { errType: 'Error', errCode: 'ENOENT' }]) || JSON.stringify(out) },
})
add('C13', 'getDiagBriefErr', '宣告陣列(codes、types、nested)之存取器之項不執行', {
    call: (api, ctx) => {
        let a = ['sqlstate']
        Object.defineProperty(a, 1, {
            get: () => {
                ctx.hit()
                return 'mysql'
            },
            enumerable: true
        })
        return api.getDiagBriefErr(Object.assign(new Error('x'), { code: '23505' }), { codes: a, types: a, nested: a })
    },
    expect: { userCode: 0, check: (out) => jeq(out, { errType: 'Error', errCode: '23505' }) || JSON.stringify(out) },
})


//U 秘密導出
let incl = (arr, xs) => xs.every((x) => arr.includes(x))
add('U01', 'getDiagSecrets', '一般網址: 帳、密、帳:密、整串; 一個來源無法讀取(已撤銷之Proxy)不影響其他來源', {
    call: (api, ctx) => {
        let { proxy, revoke } = Proxy.revocable([], {})
        revoke()
        return [api.getDiagSecrets({ urls: [ctx.sec.url] }), api.getDiagSecrets({ urls: proxy, password: 'zzPw77' })]
    },
    expect: {
        check: (r, ctx) => {
            let s = r[0]
            return (incl(s.detail, ['dbuser', 'Pw9xQ!z7', 'dbuser:Pw9xQ!z7', ctx.sec.url]) && incl(s.reject, ['Pw9xQ!z7', 'dbuser:Pw9xQ!z7', ctx.sec.url]) && !s.reject.includes('dbuser') && Object.isFrozen(s.detail) &&
                r[1].reject.includes('zzPw77')) || 'missing'
        },
    },
})
add('U02', 'getDiagSecrets', '查詢參數user/password、pwd、token之值入列', {
    call: (api) => api.getDiagSecrets({ urls: ['postgres://h/db?user=quser1&password=qpass1&pwd=qpwd12&token=qtok12&checkKeys=true&tokenRequired=false&passwordless=TRUE&usernull=null&x=plain1'] }),
    expect: { check: (s) => (incl(s.detail, ['quser1', 'qpass1', 'qpwd12', 'qtok12']) && incl(s.reject, ['qpass1', 'qtok12']) && !s.reject.includes('quser1') && !['true', 'false', 'TRUE', 'null', 'plain1'].some((x) => s.detail.includes(x))) || 'bad' },
})
add('U03', 'getDiagSecrets', '畸形網址(密碼含@、/)之片段入列(等於帳號之片段不入reject)', {
    call: (api) => api.getDiagSecrets({ urls: ['postgres://alice_u:p@ss/w0rd@h/db'] }),
    expect: { check: (s) => (incl(s.detail, ['w0rd', 'p@ss/w0rd', 'alice_u']) && incl(s.reject, ['w0rd', 'p@ss/w0rd']) && !s.reject.includes('alice_u')) || 'bad' },
})
add('U04', 'getDiagSecrets', '百分比編碼密碼之解碼形入列', {
    call: (api) => api.getDiagSecrets({ urls: ['postgres://u1:p%40ss%2Fx@h/db'] }),
    expect: { check: (s) => incl(s.reject, ['p@ss/x', 'p%40ss%2Fx']) || 'bad' },
})
add('U05', 'getDiagSecrets', '單引號、反斜線、JSON、inspect跳脫之各形入列', {
    call: (api) => api.getDiagSecrets({ password: 'a\'b\\c"d\n' }),
    expect: { check: (s) => incl(s.detail, ['a\'\'b\\c"d\n', 'a\'b\\\\c\\"d\\n', 'a\\\'b\\\\c"d\n', 'a\\\'b\\\\c"d\\n', 'a\'b\\\\c"d\\n']) || 'bad' },
})
add('U06', 'getDiagSecrets', '短帳號(2字元)單獨不入列、並列形入列', {
    call: (api) => api.getDiagSecrets({ username: 'sa', password: 'Pw9x' }),
    expect: { check: (s) => (!s.detail.includes('sa') && s.detail.includes('sa:Pw9x') && s.reject.includes('sa:Pw9x') && s.reject.includes(b64('sa:Pw9x'))) || 'bad' },
})
add('U07', 'getDiagSecrets', '路徑之斜線、磁碟機大小寫、UNC各形入列', {
    call: (api) => api.getDiagSecrets({ paths: ['C:\\data\\db', '\\\\srv\\share\\db'] }),
    expect: { check: (s) => (incl(s.detail, ['C:\\data\\db', 'C:/data/db', 'c:\\data\\db', '//srv/share/db', 'UNC\\srv\\share\\db', 'C:\\\\data\\\\db']) && !s.reject.includes('C:\\data\\db')) || 'bad' },
})
add('U08', 'getDiagSecrets', '包裝字串之url解包後導出', {
    call: (api) => api.getDiagSecrets({ urls: [new String('postgres://u1:pwZZ9@h/db')] }),
    expect: { check: (s) => s.detail.includes('pwZZ9') || 'bad' },
})
add('U09', 'getDiagSecrets', 'authMechanismProperties之AWS_SESSION_TOKEN入列', {
    call: (api) => api.getDiagSecrets({ urls: ['mongodb://h/?authMechanism=MONGODB-AWS&authMechanismProperties=SERVICE_NAME:svc1,AWS_SESSION_TOKEN:xyz'] }),
    expect: { check: (s) => (s.detail.includes('xyz') && !s.detail.includes('svc1')) || 'bad' },
})
add('U10', 'getDiagSecrets', '不完整百分比編碼a100%sure%21之寬鬆解碼形入列', {
    call: (api) => api.getDiagSecrets({ urls: ['mongodb://u1:a100%sure%21@h'] }),
    expect: { check: (s) => incl(s.reject, ['a100%sure!', 'a100%sure%21']) || 'bad' },
})
add('U11', 'getDiagSecrets', '無@之mongodb://u:p與反向筆誤host:1@u:12345(帳號部分形如主機者); 一般帳號配短數字密碼不判反向', {
    call: (api) => [
        api.getDiagSecrets({ urls: ['mongodb://u:p'] }),
        api.getDiagSecrets({ urls: ['mongodb://db.example.com:1@u:12345'] }),
        api.getDiagSecrets({ urls: ['mongodb://admin:12345'] }),
        api.getDiagSecrets({ urls: ['postgres://admin:1234@localhost:5432/app'] }),
        api.getDiagSecrets({ urls: ['mongodb://host:1@u:12345'] }),
    ],
    expect: {
        check: (s) => (s[0].detail.includes('u:p') && s[0].reject.includes('u:p') && incl(s[1].detail, ['db.example.com:1', 'u:12345', '12345']) && incl(s[1].reject, ['db.example.com:1', 'u:12345', '12345']) &&
            s[2].reject.includes('admin:12345') && !s[3].reject.includes('localhost:5432') && !s[3].reject.includes('5432') && s[4].reject.includes('host:1')) || 'bad',
    },
})
add('U12', 'getDiagSecrets', '../與...之路徑不入列', {
    call: (api) => api.getDiagSecrets({ paths: ['../', '...', '.', './'] }),
    expect: { check: (s) => (s.detail.length === 0) || JSON.stringify(s.detail) },
})
add('U13', 'getDiagSecrets', '2字元密碼: detail入列、reject不入列', {
    call: (api) => api.getDiagSecrets({ password: 'ab' }),
    expect: { check: (s) => (s.detail.includes('ab') && !s.reject.includes('ab')) || 'bad' },
})
add('U14', 'getDiagSecrets', '只有帳號或密碼為空之網址: reject不含「帳號:」各形與其base64(單獨帳號), 對外值不遮; 只有密碼者其並列形仍入列', {
    call: (api) => {
        let ss = [api.getDiagSecrets({ urls: ['mongodb://admin1@h/db'] }), api.getDiagSecrets({ urls: ['mongodb://admin1:@h/db'] }), api.getDiagSecrets({ urls: ['mongodb://:pw12345@h/db'] })]
        return { ss, err: ss.slice(0, 2).map((s) => api.maskDiagErr('user admin1: denied', s)) }
    },
    expect: {
        check: (r) => (r.ss.slice(0, 2).every((s) => s.detail.includes('admin1') && !s.reject.some((x) => x.startsWith('admin1')) && !s.reject.includes(b64('admin1:'))) &&
            jeq(r.err, ['user admin1: denied', 'user admin1: denied']) && incl(r.ss[2].reject, ['pw12345', ':pw12345'])) || JSON.stringify([r.err, r.ss.map((s) => s.reject.filter((x) => x.length < 12))]),
    },
})
add('U15', 'getDiagSecrets', '來源之鍵為存取器(getter不執行): 其餘來源照列, 結果標記無法使用, 各函數與getDiag.with取用時fail-closed', {
    call: (api, ctx) => {
        let src = { urls: ['postgres://u1:zzPw77@h/db'] }
        Object.defineProperty(src, 'password', {
            get: () => {
                ctx.hit()
                return 'qqPw88'
            },
            enumerable: true
        })
        let s = api.getDiagSecrets(src)
        let d = api.getDiag({}, {}).with(src)
        //來源陣列之項為存取器者亦同
        let vs = ['zzVal1234']
        Object.defineProperty(vs, 1, {
            get: () => {
                ctx.hit()
                return 'qqVal5678'
            },
            enumerable: true
        })
        let s2 = api.getDiagSecrets({ values: vs })
        return { inList: s.reject.includes('zzPw77'), keys: Object.keys(s), out: [api.maskDiagText('x qqPw88', s), api.maskDiagCopy({ m: 'x qqPw88' }, s), api.maskDiagErr('x qqPw88', s), d.mask('x qqPw88'), d.copy({ m: 'x qqPw88' }), d.err(new Error('x qqPw88')).message, api.maskDiagText('x qqVal5678', s2)] }
    },
    expect: { userCode: 0, check: (r) => (r.inList && jeq(r.keys, ['detail', 'reject']) && jeq(r.out, ['***', '[Uncopyable]', '***', '***', '[Uncopyable]', '***', '***'])) || JSON.stringify(r) },
})
add('U16', 'getDiagSecrets', '查詢參數之帳號與密碼: 並列形式與其base64入reject(帳號單獨不入)', {
    call: (api) => {
        let s = api.getDiagSecrets({ urls: ['postgres://host/db?user=alice9&password=zzQp5512'] })
        return { s, err: api.maskDiagErr(`bad ${b64('alice9:zzQp5512')}`, s) }
    },
    expect: { check: (r) => (incl(r.s.reject, ['alice9:zzQp5512', b64('alice9:zzQp5512')]) && !r.s.reject.includes('alice9') && r.err === 'bad ***') || JSON.stringify(r.err) },
})
add('U17', 'getDiagSecrets', '畸形網址之帳號為百分比編碼(%61lice9): 其解碼形之片段不入reject, 對外值不遮', {
    call: (api) => {
        let s = api.getDiagSecrets({ urls: ['postgres://%61lice9:pw1234zz@host/alice9@host'] })
        return { s, err: api.maskDiagErr('role alice9 not found', s) }
    },
    expect: { check: (r) => (!r.s.reject.includes('alice9') && r.s.detail.includes('alice9') && r.s.reject.includes('pw1234zz') && r.err === 'role alice9 not found') || JSON.stringify(r.err) },
})
add('U18', 'getDiagSecrets', '帳密為陣列: 各項皆列, 並列形式依索引成對(一方一項者與另一方各項成對)', {
    call: (api) => [api.getDiagSecrets({ username: ['alice9', 'bobuser'], password: ['firstPw1', 'secondPw2'] }), api.getDiagSecrets({ username: 'carol9', password: ['p1Zz99', 'p2Zz99'] })],
    expect: {
        check: (r) => (incl(r[0].detail, ['alice9', 'bobuser']) && incl(r[0].reject, ['firstPw1', 'secondPw2', 'alice9:firstPw1', 'bobuser:secondPw2']) && !r[0].reject.includes('alice9:secondPw2') &&
            incl(r[1].reject, ['carol9:p1Zz99', 'carol9:p2Zz99'])) || 'bad',
    },
})
add('U19', 'getDiagSecrets', '來源為類別實例(原型上之存取器)或以Object.create繼承: 存取器不執行且結果標記無法使用(fail-closed), 繼承之資料屬性照列', {
    call: (api, ctx) => {
        class Src {
            get password() {
                ctx.hit()
                return 'qqPw88'
            }
        }
        let s1 = api.getDiagSecrets(new Src())
        let s2 = api.getDiagSecrets(Object.create({ values: ['zzTok4455'] }))
        //跨realm之Object.prototype為終點(其上之存取器非宣告, 不使空來源與空cfg fail-closed)
        let far = ctx.realm === null ? null : ctx.realm('Object.defineProperty(Object.prototype, "values", { get() { return ["x"] } }); Object.defineProperty(Object.prototype, "secrets", { get() { return ["x"] } }); ({})')
        let farOut = far === null ? ['HELLO', 'HELLO'] : [api.maskDiagText('HELLO', api.getDiagSecrets(far)), api.getDiag({}, far).mask('HELLO')]
        //名為Object而原型為null之一般函數之prototype非根原型(其上之宣告照讀)
        let Fake = function Object() {}
        Object.setPrototypeOf(Fake.prototype, null)
        Fake.prototype.values = ['zzTok7788']
        Fake.prototype.secrets = ['zzTok7788']
        let fx = Object.create(Fake.prototype)
        let fakeOut = [api.maskDiagText('x zzTok7788', api.getDiagSecrets(fx)), api.getDiag({}, fx).mask('x zzTok7788')]
        return { keys: Object.keys(s1), out: [api.maskDiagText('x qqPw88', s1), api.maskDiagErr('x qqPw88', s1), api.getDiag({}, {}).with(new Src()).mask('x qqPw88')], inh: s2.reject.includes('zzTok4455'), inhOut: api.maskDiagText('x zzTok4455', s2), farOut, fakeOut }
    },
    expect: { userCode: 0, check: (r) => (jeq(r.keys, ['detail', 'reject']) && jeq(r.out, ['***', '***', '***']) && r.inh && r.inhOut === 'x ***' && jeq(r.farOut, ['HELLO', 'HELLO']) && jeq(r.fakeOut, ['x ***', 'x ***'])) || JSON.stringify(r) },
})
add('U20', 'getDiagSecrets', '來源無法讀取之結果經展開或單獨傳其detail、reject陣列: 各函數與getDiag取用時仍fail-closed', {
    call: (api, ctx) => {
        let src = { values: ['zzTok4455'] }
        Object.defineProperty(src, 'password', {
            get: () => {
                ctx.hit()
                return 'qqPw88'
            },
            enumerable: true
        })
        let s = api.getDiagSecrets(src)
        return [api.maskDiagText('x qqPw88', { ...s }), api.maskDiagText('x qqPw88', s.detail), api.maskDiagCopy({ m: 'x qqPw88' }, s.detail), api.maskDiagErr('x qqPw88', s.reject),
            api.getDiag({}, { secrets: s.detail }).mask('x qqPw88'), api.getDiag({}, { secrets: () => ({ ...s }) }).err(new Error('x qqPw88')).message]
    },
    expect: { userCode: 0, check: (out) => jeq(out, ['***', '***', '[Uncopyable]', '***', '***', '***']) || JSON.stringify(out) },
})
add('U21', 'getDiagSecrets', '來源陣列之項為可偵測之Proxy(包裝字串)者結果標記無法使用(util可用時); 帳密陣列有空洞或轉不成字串之項時仍依原索引成對; 失敗結果經複製或JSON往返仍fail-closed', {
    call: (api, ctx) => {
        let s1 = api.getDiagSecrets({ values: ['zzTok4455', new Proxy(new String('qqVal5678'), {})] })
        let us = []
        us[1] = 'bobuser'
        us[2] = 'carol9'
        let pw = ['firstPw1', 'secondPw2', 'thirdPw3']
        let s2 = api.getDiagSecrets({ username: us, password: pw })
        let s3 = api.getDiagSecrets({ username: [null, 'bobuser', 'carol9'], password: pw })
        let src = { values: ['zzTok4455'] }
        Object.defineProperty(src, 'password', { get: () => 'qqPw88', enumerable: true })
        let f = api.getDiagSecrets(src)
        return {
            out1: ctx.util ? [api.maskDiagText('x qqVal5678', s1), api.maskDiagErr('x qqVal5678', s1)] : null,
            s2: s2.reject,
            s3: s3.reject,
            copies: [structuredClone(f), JSON.parse(JSON.stringify(f)), [...f.reject]].map((x) => api.maskDiagText('x qqPw88', x)),
        }
    },
    expect: {
        check: (r, ctx) => ((ctx.util ? jeq(r.out1, ['***', '***']) : true) && [r.s2, r.s3].every((x) => incl(x, ['bobuser:secondPw2', b64('bobuser:secondPw2'), 'carol9:thirdPw3', b64('carol9:thirdPw3')]) && !x.includes('bobuser:firstPw1')) &&
            jeq(r.copies, ['***', '***', '***'])) || JSON.stringify(r),
    },
})


//R 對外值
add('R01', 'maskDiagErr', '不含憑證之錯誤回傳同一物件', {
    make: () => Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' }),
    call: (api, ctx) => {
        let e = new Error('timeout')
        e.code = 'ETIMEDOUT'
        return [e, rej(api, ctx, e)]
    },
    expect: { check: (out) => out[0] === out[1] || 'identity changed' },
    wire: true,
})
add('R02', 'maskDiagErr', '訊息含密碼片段之錯誤(PG-R3型, 畸形網址之片段): 副本、instanceof同類、片段遮罩、帳號不遮', {
    make: (ctx) => {
        //密碼含未編碼之/時, pg把其後片段當成資料庫名而回顯於後端訊息
        class DbErr extends Error {}
        ctx.extra.push('w0rdQ9')
        let e = new DbErr(`database "w0rdQ9@db.example.com/app" does not exist for user "dbuser" (${ctx.sec.password})`)
        e.code = '3D000'
        return { e, DbErr, src: { urls: ['postgres://u1:p@ss/w0rdQ9@db.example.com/app', ctx.sec.url] } }
    },
    call: (api, ctx) => {
        let { e, DbErr, src } = cases.find((c) => c.id === 'R02').make(ctx)
        let r = api.maskDiagErr(e, api.getDiagSecrets(src))
        return { r, same: r === e, inst: r instanceof DbErr, code: r.code }
    },
    expect: { noSecret: 'reject', check: (o) => (!o.same && o.inst && o.code === '3D000' && o.r.message.indexOf('dbuser') >= 0 && o.r.message.indexOf('***') >= 0) || o.r.message },
    wire: true,
})
add('R03', 'maskDiagErr', '不可設定屬性(凍結)之錯誤, 副本不失敗', {
    call: (api, ctx) => {
        let e = new Error(`x ${ctx.sec.password}`)
        Object.defineProperty(e, 'code', { value: 'E1', configurable: false, writable: false, enumerable: true })
        Object.freeze(e)
        return rej(api, ctx, e)
    },
    expect: { noSecret: 'reject', check: (r) => (r instanceof Error && r.code === 'E1' && r.message === 'x ***') || `${r.message}` },
})
add('R04', 'maskDiagErr', '字串reject', {
    make: (ctx) => `failed ${ctx.sec.password}`,
    call: (api, ctx) => rej(api, ctx, `failed ${ctx.sec.password}`),
    expect: { noSecret: 'reject', check: (r) => eq(r, 'failed ***') },
    wire: true,
})
add('R05', 'maskDiagErr', 'cause含憑證之巢狀遮罩', {
    call: (api, ctx) => {
        let e = new Error('top', { cause: new Error(`inner ${ctx.sec.password}`) })
        return [e, rej(api, ctx, e)]
    },
    expect: { check: (o, ctx) => (o[1] !== o[0] && o[1].message === 'top' && o[1].cause.message === 'inner ***' && o[1].cause instanceof Error) || `${o[1].cause && o[1].cause.message}` },
})
add('R06', 'maskDiagUrl', 'maskDiagUrl之四型(含反向筆誤)', {
    call: (api) => [
        api.maskDiagUrl('postgres://u:p@h/db', { schemes: ['postgres'] }),
        api.maskDiagUrl('host:5432@u:12345', { schemes: ['postgres'] }),
        api.maskDiagUrl('MYSQL://x', { schemes: ['mysql'] }),
        api.maskDiagUrl('postgres://h:1@u:12345', { schemes: ['postgres'] }),
        api.maskDiagUrl(new String('mssql://a:b@c'), { schemes: ['mssql'] }),
        api.maskDiagUrl(123, { schemes: ['postgres'] }),
    ],
    expect: { check: (out) => jeq(out, ['postgres://***', '***', 'mysql://***', 'postgres://***', 'mssql://***', '***']) || JSON.stringify(out) },
})
add('R07', 'maskDiagErr', '固定詞彙之reject不得經遮罩(密碼為其子字串時經遮罩即被切碎; 各套件接線測試斷言其固定reject原樣)', {
    make: () => ({ fixed: 'failed to insert data', src: { password: 'insert' } }),
    call: (api, ctx) => {
        let { fixed, src } = cases.find((c) => c.id === 'R07').make(ctx)
        //wsemi層: 記錄「若經遮罩即被切碎」之事實(呼叫點不得包diag.err之理由); 短密碼(<4)不入reject清單故不切碎
        return [api.maskDiagErr(fixed, api.getDiagSecrets(src)), api.maskDiagErr(fixed, api.getDiagSecrets({ password: 'ins' }))]
    },
    expect: { check: (o) => jeq(o, ['failed to *** data', 'failed to insert data']) || JSON.stringify(o) },
    wire: true,
})
add('R08', 'maskDiagErr', '巢狀非錯誤物件(errorResponse)含密碼; 只有憑證鍵名之值(未登錄)者亦為副本', {
    call: (api, ctx) => {
        let e = new Error('srv')
        e.errorResponse = { errmsg: `auth ${ctx.sec.password}`, ok: 0 }
        let e2 = new Error('srv2')
        e2.config = { token: 'zzunregT9' }
        return [e, rej(api, ctx, e), e2, rej(api, ctx, e2)]
    },
    expect: { check: (o) => (o[1] !== o[0] && o[1].errorResponse.errmsg === 'auth ***' && o[1].errorResponse.ok === 0 && o[3] !== o[2] && o[3].config.token === '***') || JSON.stringify([o[1].errorResponse, o[3].config]) },
})
add('R09', 'maskDiagErr', '自有message存取器之錯誤: fail-closed副本, getter 0次', {
    call: (api, ctx) => {
        let e = new Error('x')
        Object.defineProperty(e, 'message', {
            get() {
                ctx.hit()
                return ctx.sec.password
            }
        })
        return [e, rej(api, ctx, e)]
    },
    expect: { userCode: 0, check: (o) => (o[1] !== o[0] && o[1].message === '[Getter/Setter]') || `${o[1].message}` },
})
add('R10', 'maskDiagErr', '副本之util.types.isNativeError與instanceof皆為true', {
    call: (api, ctx) => {
        class X extends RangeError {}
        let r = rej(api, ctx, new X(`a ${ctx.sec.password}`))
        return { inst: r instanceof X && r instanceof RangeError, native: ctx.isNativeError === null ? true : ctx.isNativeError(r), brief: api.getDiagBriefErr(r).errType }
    },
    expect: { check: (o) => jeq(o, { inst: true, native: true, brief: 'RangeError' }) || JSON.stringify(o) },
})
add('R11', 'maskDiagErr', '錯誤自帶path為儲存路徑: detail遮、reject不遮(Q3)', {
    make: () => Object.assign(new Error('ENOENT: no such file or directory, open \'D:\\other\\store\\db02\''), { path: 'D:\\other\\store\\db02', code: 'ENOENT' }),
    call: (api, ctx) => {
        let p = 'D:\\other\\store\\db02'
        let e = new Error(`ENOENT: no such file or directory, open '${p}'`)
        e.path = p
        e.code = 'ENOENT'
        return { p, e, r: rej(api, ctx, e), c: cpy(api, ctx, e) }
    },
    expect: { check: (o) => (o.r === o.e && o.c.path === '***' && o.c.message.indexOf(o.p) < 0 && o.c.message.indexOf('***') >= 0) || `${o.c.path} ${o.c.message}` },
    wire: true,
})
add('R12', 'maskDiagErr', '單獨帳號出現於後端訊息: reject不遮、detail遮', {
    make: () => new Error('role "dbuser" does not exist'),
    call: (api, ctx) => {
        let e = new Error('role "dbuser" does not exist')
        return { e, r: rej(api, ctx, e), c: cpy(api, ctx, e) }
    },
    expect: { check: (o) => (o.r === o.e && o.c.message === 'role "***" does not exist') || o.c.message },
    wire: true,
})
add('R13', 'maskDiagUrl', 'maskDiagUrl之myPasswordXYZ://host為***', {
    call: (api) => api.maskDiagUrl('myPasswordXYZ://host', { schemes: ['postgres'] }),
    expect: { check: (out) => eq(out, '***') },
})
add('R14', 'maskDiagErr', '子物件指回進行中之祖先(錯誤、純物件、陣列、Map之值、隔一層五形)而祖先需處理: 副本不同參照交出該子物件(其經原祖先可達之憑證不外露)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let e1 = new Error('ok')
        Object.assign(e1, { first: { back: e1 }, note: pw })
        let o2 = {}
        Object.assign(o2, { a: { back: o2 }, note: pw })
        let e3 = new Error('ok')
        e3.list = [{ back: e3 }, pw]
        let e4 = new Error('ok')
        Object.assign(e4, { m: new Map([['k', { back: e4 }]]), note: pw })
        let e5 = new Error('ok')
        Object.assign(e5, { first: { mid: { back: e5 } }, note: pw })
        let ins = [e1, o2, e3, e4, e5]
        let outs = ins.map((x) => rej(api, ctx, x))
        return { same: ins.map((x, i) => outs[i] === x), outs }
    },
    expect: { noSecret: 'reject', check: (out) => jeq(out.same, [false, false, false, false, false]) || JSON.stringify(out.same) },
})
add('R15', 'maskDiagErr', '函數值之自有屬性含憑證時為[Function](巢狀與頂層); 不含者(箭頭、sloppy函數、類別)原樣', {
    call: (api, ctx) => {
        let f = function() {}
        f.note = ctx.sec.password
        let cb = () => 1
        let g = function() {}
        class Dao {}
        let e1 = Object.assign(new Error('ok'), { fn: f, cb })
        let e2 = Object.assign(new Error('ok'), { cb, g, C: Dao })
        let r1 = rej(api, ctx, e1)
        //可呼叫之Proxy(其目標函數帶憑證): 頂層與巢狀皆不交出原參照(util可用時頂層為new Error('***'))
        let pf = new Proxy(Object.assign(() => 1, { token: ctx.sec.password }), {})
        let rp = rej(api, ctx, { v: pf })
        let tp = rej(api, ctx, pf)
        return { r1, rp, top: rej(api, ctx, f), keep: [r1 !== e1, r1.cb === cb, rej(api, ctx, e2) === e2, rej(api, ctx, g) === g, rp.v !== pf, tp !== pf] }
    },
    expect: { noSecret: 'reject', check: (out) => (out.r1.fn === '[Function]' && out.top === '[Function]' && jeq(out.keep, [true, true, true, true, true, true])) || JSON.stringify([out.r1.fn, out.top, out.keep]) },
})
add('R16', 'maskDiagErr', '內容無法同步檢查者(WeakMap、WeakSet、WeakRef、Promise)視為需處理: 巢狀與頂層皆不原樣交出, 替換為[Object]、[Promise]', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let k = {}
        let forms = { wm: new WeakMap([[k, pw]]), ws: new WeakSet([k]), wr: new WeakRef({ s: pw }), pm: Promise.resolve(pw) }
        let nested = Object.entries(forms).map(([n, x]) => {
            let e = Object.assign(new Error('ok'), { x })
            let r = rej(api, ctx, e)
            return [n, r !== e, r.x]
        })
        return { nested, top: Object.values(forms).map((x) => rej(api, ctx, x)) }
    },
    expect: {
        noSecret: 'reject',
        check: (out) => (jeq(out.nested, [['wm', true, '[Object]'], ['ws', true, '[Object]'], ['wr', true, '[Object]'], ['pm', true, '[Promise]']]) && jeq(out.top, ['[Object]', '[Object]', '[Object]', '[Promise]'])) || JSON.stringify(out),
    },
})
add('R21', 'maskDiagErr', '陣列、字串與正規式之迭代器、FinalizationRegistry、內容在內部槽位之URL、原型為null且另帶自有鍵之WeakRef、跨realm之WeakRef與陣列迭代器視為需處理(兩種環境): 巢狀與頂層皆替換為[Object]; 類別原型以指定定義Symbol.toStringTag之一般實例照常檢查, 以defineProperty預設旗標定義者與內建無從區分而視為不透明(已知限制)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let wr = Object.setPrototypeOf(Object.assign(new WeakRef({ s: pw }), { note: 'n1' }), null)
        let forms = [[pw].values(), [pw].entries(), pw[Symbol.iterator](), `x${pw}`.matchAll(/x/g), new FinalizationRegistry(() => {}), new URL('http://u1:zzPw4471@h/x'), wr]
        //內容在內部槽位之宿主物件(Headers、Request、Response、Blob、FormData; 可攜帶憑證)
        let fd = new FormData()
        fd.append('auth_field', pw)
        let hosts = [new Headers([['authorization', `Bearer ${pw}`]]), new Request(`https://h.example/${encodeURIComponent(pw)}`), new Response(pw), new Blob([pw]), fd]
        let hostOut = hosts.map((x) => {
            let e = Object.assign(new Error('ok'), { x })
            let r = rej(api, ctx, e)
            return [rej(api, ctx, x), r !== e && r.x === '[Object]', api.maskDiagCopy({ x }, [])]
        })
        if (ctx.realm !== null) {
            forms.push(ctx.realm(`new WeakRef({ s: ${JSON.stringify(pw)} })`), ctx.realm(`[${JSON.stringify(pw)}].values()`))
        }
        let nested = forms.map((x) => {
            let e = Object.assign(new Error('ok'), { x })
            let r = rej(api, ctx, e)
            return [r !== e, r.x]
        })
        class Rec {
            constructor() {
                this.note = 'ok1'
            }
        }
        Rec.prototype[Symbol.toStringTag] = 'Record'
        let rec = new Rec()
        class Rec2 {
            constructor() {
                this.note = 'ok2'
            }
        }
        Object.defineProperty(Rec2.prototype, Symbol.toStringTag, { value: 'RecordB', configurable: true })
        let rec2 = new Rec2()
        return { n: forms.length, nested, top: forms.map((x) => rej(api, ctx, x)), copy: api.maskDiagCopy({ u: forms[5] }, []), rec: [rej(api, ctx, rec) === rec, api.maskDiagCopy(rec, []), rej(api, ctx, rec2) === rec2, api.maskDiagCopy(rec2, [])], hostOut }
    },
    expect: {
        noSecret: 'reject',
        check: (out, ctx) => (out.n === (ctx.realm !== null ? 9 : 7) && out.nested.length === out.n && out.top.length === out.n && out.nested.every(([c, x]) => c && x === '[Object]') && out.top.every((x) => x === '[Object]') &&
            jeq(out.copy, { u: '[Object]' }) && jeq(out.rec, [true, { note: 'ok1' }, false, '[Object]']) && out.hostOut.length === 5 && out.hostOut.every(([t, n, cp]) => t === '[Object]' && n && jeq(cp, { x: '[Object]' }))) || JSON.stringify(out),
    },
})
add('R22', 'maskDiagErr', '替換為[Promise]或[Object]之原生rejected Promise(頂層、巢狀、getDetail回傳物件之巢狀、safe之欄位)標記已處理: 無unhandledRejection', {
    call: async (api, ctx) => {
        let base = ctx.unhandled === null ? 0 : ctx.unhandled()
        let r1 = api.maskDiagErr(Promise.reject(new Error('x')), [])
        let r2 = api.maskDiagErr({ node: Promise.reject(new Error('x')) }, [])
        let r3 = api.maskDiagCopy({ node: Promise.reject(new Error('x')) }, [])
        let got = []
        api.getDiag({ funLog: (l, s, det) => got.push(s, det) }, { safeKeys: ['p'] })('lb', { p: Promise.reject(new Error('x')) }, () => ({ node: Promise.reject(new Error('x')) }))
        let w = []
        api.genDiagFunLog((x) => w.push(x.safe)).funLog('lb', { p: Promise.reject(new Error('x')) })
        //憑證鍵名之值整體替換為***時亦標記(拷貝、對外值、Map之憑證鍵)
        let r4 = api.maskDiagCopy({ password: Promise.reject(new Error('x')) }, [])
        let r5 = api.maskDiagErr({ password: Promise.reject(new Error('x')) }, [])
        let r6 = api.maskDiagCopy(new Map([['token', Promise.reject(new Error('x'))]]), [])
        //錯誤之非字串message(拷貝與對外值)、清單無法使用時直接捨棄之輸入(三函數與getDiag之mask)、自有資料constructor恰為Promise者
        let em = () => {
            let e = new Error('ok')
            e.message = Promise.reject(new Error('x'))
            return e
        }
        let r7 = api.maskDiagCopy(em(), [])
        let r8 = api.maskDiagErr(em(), [])
        let acc = () => {
            let a = ['zzA1x']
            Object.defineProperty(a, 1, { get: () => 'zzB2y', enumerable: true })
            return a
        }
        let r9 = [api.maskDiagCopy(Promise.reject(new Error('x')), acc()), String(api.maskDiagErr(Promise.reject(new Error('x')), acc())), api.maskDiagText(Promise.reject(new Error('x')), acc()),
            String(api.getDiag({}, { secrets: acc() }).mask(Promise.reject(new Error('x'))))]
        let pc = Promise.reject(new Error('x'))
        Object.defineProperty(pc, 'constructor', { value: Promise })
        let r10 = api.maskDiagCopy({ node: pc }, [])
        await ctx.tick()
        return {
            outs: [r1, r2.node, r3.node, got[1].node, got[0].p, w[0].p, r4.password, r5.password, r6.get('token'), r7.message, r8.message, ...r9, r10.node],
            unhandled: ctx.unhandled === null ? 0 : ctx.unhandled() - base,
        }
    },
    expect: {
        check: (out) => (jeq(out.outs, ['[Promise]', '[Promise]', '[Promise]', '[Promise]', '[Object]', '[Object]', '***', '***', '***', '[Object]', '[Object]', '[Uncopyable]', 'Error: ***', '***', 'Error: ***', '[Promise]']) &&
            out.unhandled === 0) || JSON.stringify(out),
    },
})
add('R17', 'maskDiagErr', 'Map與Set之迭代器、生成器視為需處理(util可用時; 無util時不可辨識列已知限制)', {
    need: 'util',
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let gen = (function* () {
            yield pw
        })()
        return [new Map([['k', pw]]).entries(), new Set([pw]).values(), gen].map((x) => {
            let e = Object.assign(new Error('ok'), { x })
            return rej(api, ctx, e) !== e
        })
    },
    expect: { check: (out, ctx) => (ctx.util ? jeq(out, [true, true, true]) : true) || JSON.stringify(out) },
})
add('R18', 'maskDiagErr', '原型被改為null之Map、Set、Uint8Array(含另帶非索引自有鍵者): 兩種環境皆辨識並處理其內容(無util時以內建getter之品牌檢查)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let m = Object.setPrototypeOf(new Map([['a', pw]]), null)
        let s = Object.setPrototypeOf(new Set([pw]), null)
        let b = Object.setPrototypeOf(new TextEncoder().encode(pw), null)
        let m2 = Object.setPrototypeOf(Object.assign(new Map([['a', pw]]), { note: 'n1' }), null)
        let s2 = Object.setPrototypeOf(Object.assign(new Set([pw]), { note: 'n1' }), null)
        let b2 = Object.setPrototypeOf(Object.assign(new TextEncoder().encode(pw), { note: 'n1' }), null)
        return [m, s, b, m2, s2, b2].map((x) => {
            let e = Object.assign(new Error('ok'), { data: x })
            let r = rej(api, ctx, e)
            return { copied: r !== e, data: r.data }
        })
    },
    expect: { noSecret: 'reject', check: (out) => out.every((x) => x.copied) || JSON.stringify(out.map((x) => x.copied)) },
})
add('R19', 'maskDiagUrl', 'schemes之存取器之項不執行', {
    call: (api, ctx) => {
        let a = ['postgres']
        Object.defineProperty(a, 1, {
            get: () => {
                ctx.hit()
                return 'mysql'
            },
            enumerable: true
        })
        return [api.maskDiagUrl('postgres://u:p@h', { schemes: a }), api.maskDiagUrl('mysql://u:p@h', { schemes: a })]
    },
    expect: { userCode: 0, check: (out) => jeq(out, ['postgres://***', '***']) || JSON.stringify(out) },
})
add('R20', 'maskDiagErr', '不含憑證之子物件被多處共用且指回祖先(錯誤之200鍵共用一子物件、每層8鍵之有向圖): 回傳同一物件(不因重複檢查耗盡節點預算); 同形含憑證者為副本; 指回祖先之暫定結果不跨檢查沿用且沿用時傳遞其祖先(錯誤鏈末層指回含憑證之頂層、兩兄弟共用指回頂層之錯誤)', {
    call: (api, ctx) => {
        let mk = (dirty) => {
            let e = new Error('ok')
            let w = { back: e }
            for (let i = 0; i < 30; i++) {
                w['k' + i] = 'v' + i
            }
            for (let i = 0; i < 200; i++) {
                e['a' + i] = w
            }
            if (dirty) {
                e.note = ctx.sec.password
            }
            return e
        }
        //有向圖: 每層8鍵皆指向下一層, 末層指回根(至末層之路徑數為8的4次方)
        let g = new Error('ok')
        let cur = g
        for (let i = 0; i < 4; i++) {
            let nx = { up: g }
            for (let j = 0; j < 8; j++) {
                cur['b' + j] = nx
            }
            cur = nx
        }
        let e1 = mk(false)
        let e2 = mk(true)
        let r2 = rej(api, ctx, e2)
        //錯誤鏈: 頂層→a→p→w, w.t指回頂層, 頂層之note含憑證(修補階段重查各層時, 檢查前之暫定結果不可沿用)
        let t = new Error('ok')
        let w = Object.assign(new Error('ok'), { t })
        let p = Object.assign(new Error('ok'), { w })
        Object.assign(t, { a: Object.assign(new Error('ok'), { p }), note: ctx.sec.password })
        let rt = rej(api, ctx, t)
        //兩兄弟(錯誤)共用指回頂層之錯誤: 第二個兄弟沿用暫定結果時仍記其依賴頂層(不可記為不需處理而於副本同參照交出)
        let s0 = new Error('ok')
        let sw = Object.assign(new Error('ok'), { t: s0 })
        Object.assign(s0, { a: Object.assign(new Error('ok'), { w: sw }), b: Object.assign(new Error('ok'), { w: sw }), note: ctx.sec.password })
        let rs = rej(api, ctx, s0)
        return { same: [rej(api, ctx, e1) === e1, rej(api, ctx, g) === g], copied: [r2 !== e2 && r2.a0 !== e2.a0, rt.a !== t.a, rs.a !== s0.a && rs.b !== s0.b], r2, rt, rs }
    },
    expect: { noSecret: 'reject', check: (out) => (jeq(out.same, [true, true]) && jeq(out.copied, [true, true, true])) || JSON.stringify([out.same, out.copied]) },
})


//O 出口
add('O01', 'getDiag', 'getDiag(未包裝{logDetail:true})有輸出, 細節遮罩', {
    make: (ctx) => ({ opt: { logDetail: true }, detail: new Error(`auth ${ctx.sec.password}`) }),
    call: async (api, ctx) => capture(() => {
        let diag = api.getDiag({ logDetail: true }, { secrets: api.getDiagSecrets(ctx.src()) })
        diag('select failed', { mode: 'select' }, () => new Error(`auth ${ctx.sec.password}`))
    }),
    expect: { noSecret: 'detail', check: (rs) => (rs.length === 1 && rs[0].m === 'log' && rs[0].args[0] === 'select failed' && rs[0].args[1] instanceof Error) || JSON.stringify(rs) },
    wire: true,
})
add('O02', 'getDiag', 'getDiag(null)、Proxy opt、getter拋錯opt不拋, 用預設', {
    call: async (api, ctx) => capture(() => {
        let opts = [null, undefined, new Proxy({}, {
            get() {
                throw new Error('x')
            }
        }), Object.defineProperty({}, 'logDetail', {
            get() {
                throw new Error('x')
            }
        }), 'str']
        for (let o of opts) {
            api.getDiag(o, { safeKeys: ['n'] })('lb', { n: 1, x: 2 }, () => 'detail')
        }
        //cfg無法讀取(null、Proxy)亦不拋, 未宣告safeKeys者只留errType、errCode
        api.getDiag({}, null)('lb2', { n: 1, errType: 'Error' })
        api.getDiag({}, new Proxy({}, {
            getOwnPropertyDescriptor() {
                throw new Error('x')
            }
        }))('lb3', { n: 1 })
    }),
    expect: { check: (rs) => (rs.length === 7 && rs.slice(0, 5).every((r) => r.args.length === 2 && r.args[0] === 'lb' && jeq(r.args[1], { n: 1 })) && jeq(rs[5].args, ['lb2', { errType: 'Error' }]) && jeq(rs[6].args, ['lb3', {}])) || JSON.stringify(rs) },
})
add('O03', 'getDiag', 'safe帶拋錯getter或已撤銷之Proxy, diag不拋且只影響該格', {
    call: async (api, ctx) => capture(() => {
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        let safe = Object.defineProperty({ a: 1, p: proxy }, 'b', {
            enumerable: true,
            get() {
                ctx.hit()
                throw new Error('x')
            }
        })
        api.getDiag({}, { safeKeys: ['a', 'b', 'p'] })('lb', safe)
    }),
    expect: { userCode: 0, check: (rs, ctx) => (rs.length === 1 && jeq(rs[0].args[1], { a: 1, p: ctx.util ? '[Proxy]' : '[Uncopyable]', b: '[Getter/Setter]' })) || JSON.stringify(rs) },
})
add('O04', 'getDiag', 'funLog同步拋錯吞下', {
    call: (api) => {
        let diag = api.getDiag({
            funLog: () => {
                throw new Error('x')
            }
        }, {})
        diag('lb', {}, () => 1)
        return 'ok'
    },
    expect: { check: (out) => eq(out, 'ok') },
})
add('O05', 'getDiag', 'funLog回傳覆寫then之rejected promise, 無unhandledRejection', {
    call: async (api, ctx) => {
        let base = ctx.unhandled === null ? 0 : ctx.unhandled()
        let diag = api.getDiag({
            funLog: () => {
                let p = Promise.reject(new Error('x'))
                p.then = () => {
                    ctx.hit()
                }
                return p
            }
        }, {})
        diag('lb', {})
        await ctx.tick()
        return ctx.unhandled === null ? 0 : ctx.unhandled() - base
    },
    expect: { userCode: 0, check: (n) => eq(n, 0) },
})
add('O06', 'getDiag', 'funLog回傳稍後呼叫第1參數之thenable, 其then不被呼叫', {
    call: async (api, ctx) => {
        let diag = api.getDiag({
            funLog: () => ({
                then(res) {
                    ctx.hit()
                    res(1)
                }
            })
        }, {})
        diag('lb', {})
        await ctx.tick()
        return 'ok'
    },
    expect: { userCode: 0 },
})
add('O07', 'getDiag', 'funLog回傳自回傳thenable, 不遞迴', {
    call: async (api, ctx) => {
        let t = {
            then() {
                ctx.hit()
                return t
            }
        }
        api.getDiag({ funLog: () => t }, {})('lb', {})
        await ctx.tick()
        return 'ok'
    },
    expect: { userCode: 0 },
})
add('O08', 'getDiag', 'console拋錯時退一次', {
    call: async (api) => {
        let rs = []
        let ol = console.log
        let n = 0
        console.log = (...args) => {
            n++
            if (n === 1) {
                throw new Error('x')
            }
            rs.push(args)
        }
        try {
            api.getDiag({}, {})('lb', { a: 1 })
        }
        finally {
            console.log = ol
        }
        return rs
    },
    expect: { check: (rs) => jeq(rs, [['lb', '(unprintable)']]) || JSON.stringify(rs) },
})
add('O09', 'getDiag', 'getDetail拋錯為(unprintable)', {
    call: (api) => {
        let got = null
        api.getDiag({
            funLog: (...args) => {
                got = args
            }
        }, {})('lb', {}, () => {
            throw new Error('x')
        })
        return got
    },
    expect: { check: (g) => jeq(g, ['lb', {}, '(unprintable)']) || JSON.stringify(g) },
})
add('O10', 'getDiag', '引數個數: 有getDetail為3、無為2', {
    call: (api) => {
        let ns = []
        let diag = api.getDiag({ funLog: (...args) => ns.push(args.length) }, {})
        diag('a', {}, () => 1)
        diag('b', {})
        return ns
    },
    expect: { check: (ns) => jeq(ns, [3, 2]) || JSON.stringify(ns) },
})
add('O11', 'getDiag', 'level為error時寫console.error', {
    call: async (api) => capture(() => {
        api.getDiag({}, {})('lb', undefined, undefined, 'error')
    }),
    expect: { check: (rs) => jeq(rs, [{ m: 'error', args: ['lb'] }]) || JSON.stringify(rs) },
})
add('O12', 'getDiag', 'funLog與logDetail同給時只交funLog', {
    call: async (api) => {
        let got = 0
        let rs = await capture(() => {
            api.getDiag({
                logDetail: true,
                funLog: () => {
                    got++
                }
            }, {})('lb', {}, () => 1)
        })
        return { got, n: rs.length }
    },
    expect: { check: (o) => jeq(o, { got: 1, n: 0 }) || JSON.stringify(o) },
})
add('O13', 'getDiag', 'funLog回傳一般thenable, 其then未被呼叫', {
    call: async (api, ctx) => {
        api.getDiag({
            funLog: () => ({
                then() {
                    ctx.hit()
                }
            })
        }, {})('lb', {})
        await ctx.tick()
        return 'ok'
    },
    expect: { userCode: 0 },
})
add('O14', 'getDiag', 'level為true、warn時為console.log', {
    call: async (api) => capture(() => {
        let diag = api.getDiag({}, {})
        diag('a', undefined, undefined, true)
        diag('b', undefined, undefined, 'warn')
    }),
    expect: { check: (rs) => jeq(rs, [{ m: 'log', args: ['a'] }, { m: 'log', args: ['b'] }]) || JSON.stringify(rs) },
})
add('O15', 'getDiag', 'safe含白名單外之鍵password被丟棄', {
    make: (ctx) => ({ mode: 'select', password: ctx.sec.password, errType: 'Error', n: 3 }),
    call: async (api, ctx) => capture(() => {
        api.getDiag({}, { safeKeys: ['mode'] })('lb', { mode: 'select', password: ctx.sec.password, errType: 'Error', n: 3 })
    }),
    expect: { noSecret: 'detail', check: (rs) => jeq(rs[0].args[1], { mode: 'select', errType: 'Error' }) || JSON.stringify(rs) },
    wire: true,
})
add('O16', 'getDiag', 'secrets函數回傳之陣列被原地增項時, with()所得之diag遮新增之秘密(合併結果不依未凍結清單之身分沿用)', {
    call: (api) => {
        let a = ['oldTok1234']
        let d = api.getDiag({}, { secrets: () => a }).with({})
        let r1 = d.mask('newTok5678')
        a.push('newTok5678')
        return [r1, d.mask('newTok5678'), d.copy({ m: 'newTok5678' }).m, d.err('newTok5678')]
    },
    expect: { check: (out) => jeq(out, ['newTok5678', '***', '***', '***']) || JSON.stringify(out) },
})
add('O17', 'getDiag', '套件宣告之secrets為存取器或cfg為可偵測之Proxy: getter與陷阱不執行, 秘密視為取不到(fail-closed)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let cfg = {}
        Object.defineProperty(cfg, 'secrets', {
            get: () => {
                ctx.hit()
                return [pw]
            },
            enumerable: true
        })
        let d1 = api.getDiag({}, cfg)
        let d2 = api.getDiag({}, new Proxy({ secrets: [pw] }, {}))
        return [d1.mask(`x ${pw}`), d1.copy({ m: 1 }), d1.err(`x ${pw}`), d2.mask(`x ${pw}`)]
    },
    expect: { userCode: 0, noSecret: 'reject', check: (out, ctx) => (jeq(out.slice(0, 3), ['***', '[Uncopyable]', '***']) && (ctx.util ? out[3] === '***' : true)) || JSON.stringify(out) },
})
add('O18', 'getDiag', 'secrets函數回傳undefined或null: 秘密視為取不到(fail-closed), 細節為(unprintable)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        return [null, undefined].map((v) => {
            let got = []
            let d = api.getDiag({ funLog: (l, s, det) => got.push(det) }, { secrets: () => v })
            d('lb', {}, () => ({ m: pw }))
            return [d.mask(pw), d.copy({ m: pw }), d.err(new Error(pw)).message, got[0]]
        })
    },
    expect: { noSecret: 'reject', check: (out) => out.every((x) => jeq(x, ['***', '[Uncopyable]', '***', '(unprintable)'])) || JSON.stringify(out) },
})
add('O19', 'getDiag', 'secrets函數、getDetail、樣式when回傳rejected原生Promise: 無unhandledRejection', {
    call: async (api, ctx) => {
        let base = ctx.unhandled === null ? 0 : ctx.unhandled()
        let d1 = api.getDiag({}, { secrets: () => Promise.reject(new Error('s')) })
        let got = []
        let d2 = api.getDiag({ funLog: (l, s, det) => got.push(det) }, {})
        d2('lb', {}, () => Promise.reject(new Error('d')))
        let t = api.maskDiagText('id=ab12 x', [], { patterns: [{ re: /id=(?<v>\w+)/, group: 'v', when: () => Promise.reject(new Error('w')) }] })
        let m = d1.mask('x')
        await ctx.tick()
        return { n: ctx.unhandled === null ? 0 : ctx.unhandled() - base, m, det: got[0], t }
    },
    expect: { check: (r) => jeq(r, { n: 0, m: '***', det: '[Promise]', t: 'id=*** x' }) || JSON.stringify(r) },
})
add('O20', 'getDiag', 'safe之讀取次數有界: 10001鍵之safe(含無util時不可偵測之Proxy)只讀白名單內之鍵', {
    call: (api, ctx) => {
        let o = {}
        for (let i = 0; i < 10000; i++) {
            o[`k${i}`] = i
        }
        o.errType = 'Error'
        let p = new Proxy(o, {
            getOwnPropertyDescriptor: (t, k) => {
                ctx.hit()
                return Reflect.getOwnPropertyDescriptor(t, k)
            }
        })
        let got = []
        let d = api.getDiag({ funLog: (l, s) => got.push(s) }, { safeKeys: ['k1'] })
        d('lb', p)
        d('lb', o)
        return { hits: ctx.hits, got }
    },
    expect: { check: (r, ctx) => ((ctx.util ? r.hits === 0 && r.got[0] === undefined : r.hits <= 3) && jeq(r.got[1], { k1: 1, errType: 'Error' })) || JSON.stringify([r.hits, r.got]) },
})
add('O21', 'getDiag', 'with合併之清單不經迭代器讀取(存取器之項不執行, 清單視為取不到)', {
    call: (api, ctx) => {
        let a = ['zzTok1234']
        Object.defineProperty(a, 1, {
            get: () => {
                ctx.hit()
                return 'qqTok5678'
            },
            enumerable: true
        })
        let d = api.getDiag({}, { secrets: a }).with({})
        return [d.mask('x qqTok5678'), d.mask('x zzTok1234')]
    },
    expect: { userCode: 0, check: (out) => jeq(out, ['***', '***']) || JSON.stringify(out) },
})
add('O22', 'getDiag', 'cfg為類別實例(secrets為原型上之存取器)或其原型為可偵測之Proxy: getter與陷阱不執行, 秘密視為取不到(fail-closed); 繼承之secrets資料屬性照用', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        class Cfg {
            get secrets() {
                ctx.hit()
                return [pw]
            }
        }
        let d1 = api.getDiag({}, new Cfg())
        let d2 = api.getDiag({}, Object.create(new Proxy({ secrets: [pw] }, {})))
        let d3 = api.getDiag({}, Object.create({ secrets: [pw] }))
        return [d1.mask(`x ${pw}`), d1.copy({ m: 1 }), d1.err(`x ${pw}`), d2.mask(`x ${pw}`), d3.mask(`x ${pw}`), d3.copy({ m: 1 })]
    },
    expect: { userCode: 0, noSecret: 'reject', check: (out, ctx) => (jeq(out.slice(0, 3), ['***', '[Uncopyable]', '***']) && (ctx.util ? out[3] === '***' : true) && out[4] === 'x ***' && jeq(out[5], { m: 1 })) || JSON.stringify(out) },
})
add('O24', 'getDiag', '秘密清單含無法檢查之項(存取器)時視為取不到: 細節為(unprintable)(與其他出口一致)、mask為***、copy為[Uncopyable]、err為new Error(\'***\')', {
    call: (api, ctx) => {
        let got = []
        let acc = [ctx.sec.password]
        Object.defineProperty(acc, 1, {
            get: () => {
                ctx.hit()
                return 'zzB2y'
            },
            enumerable: true
        })
        let d = api.getDiag({ funLog: (l, s, det) => got.push(det) }, { secrets: acc })
        d('op', {}, () => ({ note: ctx.sec.password }))
        let src = new Error(`x ${ctx.sec.password}`)
        let e = d.err(src)
        return [got[0], d.mask(`x ${ctx.sec.password}`), d.copy({ m: 1 }), e instanceof Error && e !== src ? e.message : 'not a new Error']
    },
    expect: { userCode: 0, noSecret: 'reject', check: (out) => jeq(out, ['(unprintable)', '***', '[Uncopyable]', '***']) || JSON.stringify(out) },
})
add('O23', 'getDiag', '宣告類參數(patterns、codes、types、nested、safeKeys)為已撤銷之Proxy時略過: 秘密清單照用、不使輸出fail-closed(maskDiagText之opt.patterns亦同)', {
    call: (api, ctx) => {
        let pw = ctx.sec.password
        let dead = () => {
            let { proxy, revoke } = Proxy.revocable([], {})
            revoke()
            return proxy
        }
        let out = ['patterns', 'codes', 'types', 'nested', 'safeKeys'].map((k) => {
            let d = api.getDiag({}, { secrets: [pw], [k]: dead() })
            return [d.mask(`HELLO ${pw}`), d.copy('HELLO')]
        })
        out.push([api.maskDiagText(`HELLO ${pw}`, [pw], { patterns: dead() })])
        return out
    },
    expect: { noSecret: 'reject', check: (out) => (out.slice(0, 5).every((x) => jeq(x, ['HELLO ***', 'HELLO'])) && jeq(out[5], ['HELLO ***'])) || JSON.stringify(out) },
})


//A 轉接器
add('A01', 'genDiagFunLog', '第3引數detail不讀(getter 0次)', {
    make: (ctx) => Object.defineProperty({}, 'x', {
        enumerable: true,
        get() {
            ctx.hit()
            return 1
        }
    }),
    call: (api, ctx) => {
        let rs = []
        let { funLog } = api.genDiagFunLog((o) => rs.push(o))
        funLog('lb', { a: 1 }, Object.defineProperty({}, 'x', {
            enumerable: true,
            get() {
                ctx.hit()
                return 1
            }
        }))
        return rs
    },
    expect: { userCode: 0, check: (rs) => jeq(rs, [{ event: 'orm-diag', label: 'lb', safe: { a: 1 } }]) || JSON.stringify(rs) },
    wire: true,
})
add('A02', 'genDiagFunLog', 'label含\\n、\\u0000換?', {
    call: (api) => {
        let rs = []
        api.genDiagFunLog((o) => rs.push(o)).funLog('a\nb\u0000c', {})
        return rs[0].label
    },
    expect: { check: (s) => eq(s, 'a?b?c') },
})
add('A03', 'genDiagFunLog', 'safe含bigint、循環只影響該格', {
    call: (api) => {
        let rs = []
        let o = { n: 1, b: BigInt(2), s: 'x' }
        o.self = o
        api.genDiagFunLog((x) => rs.push(x)).funLog('lb', o)
        return rs[0].safe
    },
    expect: { check: (s) => jeq(s, { n: 1, b: '(bigint)', s: 'x', self: '[Circular]' }) || JSON.stringify(s) },
})
add('A04', 'genDiagFunLog', 'write回傳rejected promise吞下', {
    call: async (api, ctx) => {
        let base = ctx.unhandled === null ? 0 : ctx.unhandled()
        api.genDiagFunLog(() => Promise.reject(new Error('x'))).funLog('lb', {})
        await ctx.tick()
        return ctx.unhandled === null ? 0 : ctx.unhandled() - base
    },
    expect: { check: (n) => eq(n, 0) },
})
add('A05', 'genDiagFunLog', 'close後呼叫不寫', {
    call: (api) => {
        let rs = []
        let { funLog, close } = api.genDiagFunLog((o) => rs.push(o))
        funLog('a', {})
        close()
        funLog('b', {})
        return rs.map((o) => o.label)
    },
    expect: { check: (ls) => jeq(ls, ['a']) || JSON.stringify(ls) },
})
add('A06', 'genDiagFunLog', 'write同步拋錯時funLog不拋', {
    call: (api) => {
        api.genDiagFunLog(() => {
            throw new Error('x')
        }).funLog('lb', {})
        return 'ok'
    },
    expect: { check: (out) => eq(out, 'ok') },
})
add('A07', 'genDiagFunLog', 'genDiagFunLog產生之funLog經getDiag不呼叫getDetail', {
    make: (ctx) => () => {
        ctx.hit()
        return 1
    },
    call: (api, ctx) => {
        let rs = []
        let { funLog } = api.genDiagFunLog((o) => rs.push(o), { event: 'x-diag' })
        api.getDiag({ funLog }, { safeKeys: ['mode'] })('lb', { mode: 'm' }, () => {
            ctx.hit()
            return 1
        })
        return rs
    },
    expect: { userCode: 0, check: (rs) => jeq(rs, [{ event: 'x-diag', label: 'lb', safe: { mode: 'm' } }]) || JSON.stringify(rs) },
    wire: true,
})
add('A08', 'genDiagFunLog', 'write非函數建構即拋TypeError', {
    call: (api) => [null, 'x', {}].map((w) => {
        try {
            api.genDiagFunLog(w)
            return 'no throw'
        }
        catch (err) {
            return err instanceof TypeError
        }
    }),
    expect: { check: (out) => jeq(out, [true, true, true]) || JSON.stringify(out) },
})
add('A09', 'genDiagFunLog', 'safe之頂層鍵數有上限(3000鍵→50鍵加[Truncated])', {
    call: (api) => {
        let got = []
        let o = {}
        for (let i = 0; i < 3000; i++) {
            o[`k${i}`] = i
        }
        api.genDiagFunLog((x) => got.push(x)).funLog('op', o)
        return [Object.keys(got[0].safe).length, got[0].safe['[Truncated]'], got[0].safe.k49]
    },
    expect: { check: (out) => jeq(out, [51, '[Truncated]', 49]) || JSON.stringify(out) },
})
add('A10', 'genDiagFunLog', 'safe之不可列舉鍵不佔輸出名額(頂層50個、巢狀20個不可列舉鍵之後之欄位照留); 既有之[Truncated]鍵不被截斷標記覆寫; 原型為Proxy之欄位值為[Object]且不執行其陷阱', {
    call: (api, ctx) => {
        let got = []
        let a = {}
        for (let i = 0; i < 50; i++) {
            Object.defineProperty(a, `h${i}`, { value: i })
        }
        a.errType = 'TypeError'
        let nest = {}
        for (let i = 0; i < 20; i++) {
            Object.defineProperty(nest, `h${i}`, { value: i })
        }
        nest.shown = 'B1'
        let b = { '[Truncated]': 'A1' }
        for (let i = 0; i < 50; i++) {
            b[`k${i}`] = i
        }
        let w = api.genDiagFunLog((x) => got.push(x.safe))
        w.funLog('op', a)
        w.funLog('op', { entry: nest })
        w.funLog('op', b)
        let pp = new Proxy({}, {
            getPrototypeOf: (t) => {
                ctx.hit()
                return Reflect.getPrototypeOf(t)
            }
        })
        w.funLog('op', { entry: Object.create(pp) })
        let viaDiag = []
        api.getDiag({ funLog: (l, s) => viaDiag.push(s) }, { safeKeys: ['entry'] })('lb', { entry: nest })
        return [got[0], got[1], got[2]['[Truncated]'], got[2]['[Truncated]#2'], Object.keys(got[2]).length, viaDiag[0], got[3]]
    },
    expect: { userCode: 0, check: (out) => jeq(out, [{ errType: 'TypeError' }, { entry: { shown: 'B1' } }, 'A1', '[Truncated]', 51, { entry: { shown: 'B1' } }, { entry: '[Object]' }]) || JSON.stringify(out) },
})


export default { secrets, cases, mkCtx, verify, collect }
