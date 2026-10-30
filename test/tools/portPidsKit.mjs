//execProcessPortPids與execProcessPortPidsSync之測試共用: 固定輸出之夾具、注入之執行函數、判定流程之案例表(兩版跑同一張表, 驗證共用同一套規則)
//  規格(主控run01規劃): ①監聽列＝TCP、本地埠相符、遠端位址為萬用位址(0.0.0.0/::/[::]/*)且遠端埠0、PID>0, 不依狀態欄; ②Windows先netstat -ano(不加-p TCP), 查無時再以Get-NetTCPConnection -LocalPort確認, 兩者皆查無才判無人;
//  ③Linux/macOS為lsof -nP -iTCP:<port> -sTCP:LISTEN -t, 離開碼1=無人; ④失敗(指令不存在、逾時、非預期之離開碼、輸出無法解析)與無人嚴格分開, 絕不以空清單表示失敗
import assert from 'assert'


//row, 組netstat -ano之一列(欄寬同Windows), state為null時不輸出狀態欄(狀態值錯誤時之缺欄形)
function row(proto, local, remote, state, pid) {
    return `  ${proto.padEnd(7)}${local.padEnd(23)}${remote.padEnd(23)}${state === null ? '' : state.padEnd(16)}${pid}`
}

//HEAD_EN, HEAD_ZH, netstat之表頭; 中文表頭為Big5位元組以latin1解碼後之字串(本機實測之原樣)
let HEAD_EN = ['', 'Active Connections', '', '  Proto  Local Address          Foreign Address        State           PID']
let HEAD_ZH = ['', '¨Ï¥Î¤¤³s½u', '', '  ¨ó©w   ¥»¾÷¦ì§}               ¥~³¡¦ì§}               ª¬ºA            PID']

//ns, 組netstat -ano之輸出
function ns(rows, head = HEAD_EN) {
    return [...head, ...rows].join('\r\n') + '\r\n'
}

//BG, 他埠之背景列(TCP與UDP), 使輸出形同真實
let BG = [
    row('TCP', '0.0.0.0:135', '0.0.0.0:0', 'LISTENING', '1356'),
    row('TCP', '0.0.0.0:445', '0.0.0.0:0', 'LISTENING', '4'),
    row('TCP', '192.168.1.10:51234', '140.82.112.3:443', 'ESTABLISHED', '7000'),
    row('TCP', '[::]:135', '[::]:0', 'LISTENING', '1356'),
    row('UDP', '0.0.0.0:5353', '*:*', null, '3100'),
    row('UDP', '[::]:5353', '*:*', null, '3100'),
]

//ps, 組PowerShell腳本之輸出; rows為[本地埠, 遠端位址, 遠端埠, PID]
function ps(rows, pre = []) {
    return [...pre, 'WSEMI-PORTPIDS-BEGIN', ...rows.map((r) => `R ${r.join(' ')}`), 'WSEMI-PORTPIDS-END'].join('\r\n') + '\r\n'
}

//ok, err, 與spawnSync同形之結果
function ok(stdout, status = 0) {
    return { status, stdout, error: null }
}
function err(code) {
    let e = new Error(`spawn x ${code}`)
    e.code = code
    return { status: null, stdout: '', error: e }
}

//THROW, 注入之執行函數拋錯之標記
let THROW = { throw: true }

//netstat之固定輸出(本地埠8080)
let NS = {
    v4: ns([...BG, row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111')]),
    v6: ns([...BG, row('TCP', '[::]:8080', '[::]:0', 'LISTENING', '2222')]),
    star: ns([...BG, row('TCP', '0.0.0.0:8080', '*:*', 'LISTENING', '5555')]),
    none: ns(BG), //他埠有列, 目標埠整列缺漏(本機實測之異常形)
    empty: '',
}

//PowerShell之固定輸出(本地埠8080)
let PS = {
    v4: ps([[8080, '0.0.0.0', 0, 1111]]),
    v6: ps([[8080, '::', 0, 2222]]),
    other: ps([[8080, '0.0.0.0', 0, 3333]]),
    none: ps([]),
    errCmd: 'WSEMI-PORTPIDS-ERR CommandNotFoundException\r\n',
}

//fakeExec, 注入之同步執行函數: outs為{ netstat, powershell, lsof }之結果(THROW為拋錯, 'promise'為回傳Promise), calls記錄各次呼叫之src與參數
function fakeExec(outs, calls) {
    return (prog, args, o) => {
        calls.push({ src: o.src, prog, args, timeout: o.timeout, maxBuffer: o.maxBuffer })
        let r = outs[o.src]
        if (r === undefined) {
            throw new Error(`unexpected src ${o.src}`)
        }
        if (r === THROW) {
            throw new Error(`boom ${o.src}`)
        }
        return r
    }
}

//fakeExecAsync, 非同步版之注入: 結果以Promise回傳, THROW為reject
function fakeExecAsync(outs, calls) {
    let f = fakeExec(outs, calls)
    return async (prog, args, o) => {
        return f(prog, args, o)
    }
}

//CASES, 判定流程之案例表: outs為注入之結果, pids為預期之PID陣列(null代表須為失敗), srcs為預期依序執行之資料來源, by為settle事件之src
//  win32: 規格②; 其餘平台: 規格③; 失敗: 規格④
let CASES = [
    //netstat查到即採用, 不再執行powershell(規格②)
    { name: 'D01 netstat found IPv4 listener', outs: { netstat: ok(NS.v4) }, pids: [1111], srcs: ['netstat'], by: 'netstat' },
    { name: 'D02 netstat found IPv6 listener', outs: { netstat: ok(NS.v6) }, pids: [2222], srcs: ['netstat'], by: 'netstat' },
    { name: 'D03 netstat found * form listener', outs: { netstat: ok(NS.star) }, pids: [5555], srcs: ['netstat'], by: 'netstat' },
    //netstat整列缺漏而Get-NetTCPConnection有(本機實測之異常, 規格②之備援)
    { name: 'D04 netstat row missing but Get-NetTCPConnection has it', outs: { netstat: ok(NS.none), powershell: ok(PS.v4) }, pids: [1111], srcs: ['netstat', 'powershell'], by: 'powershell' },
    { name: 'D05 netstat row missing, Get-NetTCPConnection IPv6', outs: { netstat: ok(NS.none), powershell: ok(PS.v6) }, pids: [2222], srcs: ['netstat', 'powershell'], by: 'powershell' },
    //兩者皆查無才判無人(規格②)
    { name: 'D06 both none -> nobody', outs: { netstat: ok(NS.none), powershell: ok(PS.none) }, pids: [], srcs: ['netstat', 'powershell'], by: 'powershell' },
    //netstat失敗: 其查無本即不採信, 同樣轉查Get-NetTCPConnection, 最終以其結果為準
    { name: 'D07 netstat not found(ENOENT), Get-NetTCPConnection found', outs: { netstat: err('ENOENT'), powershell: ok(PS.v4) }, pids: [1111], srcs: ['netstat', 'powershell'], by: 'powershell' },
    { name: 'D08 netstat timeout, Get-NetTCPConnection none', outs: { netstat: err('ETIMEDOUT'), powershell: ok(PS.none) }, pids: [], srcs: ['netstat', 'powershell'], by: 'powershell' },
    { name: 'D09 netstat unparseable, Get-NetTCPConnection found', outs: { netstat: ok('garbage \u0000ÿ output'), powershell: ok(PS.v4) }, pids: [1111], srcs: ['netstat', 'powershell'], by: 'powershell' },
    { name: 'D10 netstat exit code 1, Get-NetTCPConnection found', outs: { netstat: ok(NS.v4, 1), powershell: ok(PS.other) }, pids: [3333], srcs: ['netstat', 'powershell'], by: 'powershell' },
    //Get-NetTCPConnection失敗即整體失敗, 不以netstat之查無代替(規格④)
    { name: 'D11 netstat none, powershell not found(ENOENT) -> failure', outs: { netstat: ok(NS.none), powershell: err('ENOENT') }, pids: null, srcs: ['netstat', 'powershell'], msg: /powershell error\[ENOENT\]/ },
    { name: 'D12 netstat none, powershell timeout -> failure', outs: { netstat: ok(NS.none), powershell: err('ETIMEDOUT') }, pids: null, srcs: ['netstat', 'powershell'], msg: /powershell timeout\[\d+ms\]/ },
    { name: 'D13 netstat none, powershell exit 3 (cmdlet missing) -> failure', outs: { netstat: ok(NS.none), powershell: ok(PS.errCmd, 3) }, pids: null, srcs: ['netstat', 'powershell'], msg: /powershell code\[3\]: CommandNotFoundException/ },
    { name: 'D14 netstat none, powershell exit 0 without markers -> failure', outs: { netstat: ok(NS.none), powershell: ok('') }, pids: null, srcs: ['netstat', 'powershell'], msg: /powershell unparseable output/ },
    { name: 'D15 netstat none, powershell exec throws -> failure', outs: { netstat: ok(NS.none), powershell: THROW }, pids: null, srcs: ['netstat', 'powershell'], msg: /powershell exec failed: boom powershell/ },
    { name: 'D16 netstat none, powershell killed by signal -> failure', outs: { netstat: ok(NS.none), powershell: ok('', null) }, pids: null, srcs: ['netstat', 'powershell'], msg: /powershell code\[null\]/ },
    { name: 'D17 both fail -> failure', outs: { netstat: err('ENOENT'), powershell: err('ENOENT') }, pids: null, srcs: ['netstat', 'powershell'], msg: /netstat error\[ENOENT\].*powershell error\[ENOENT\]/ },
    { name: 'D18 netstat empty output, powershell non-object -> failure', outs: { netstat: ok(NS.empty), powershell: 'abc' }, pids: null, srcs: ['netstat', 'powershell'], msg: /netstat unparseable output, powershell exec failed/ },
    //useBoth: 兩者皆查並取聯集; Get-NetTCPConnection失敗即失敗(不以netstat之部分結果代替)
    { name: 'D19 useBoth union', useBoth: true, outs: { netstat: ok(NS.v4), powershell: ok(PS.v6) }, pids: [1111, 2222], srcs: ['netstat', 'powershell'], by: 'netstat+powershell' },
    { name: 'D20 useBoth powershell none keeps netstat rows', useBoth: true, outs: { netstat: ok(NS.v4), powershell: ok(PS.none) }, pids: [1111], srcs: ['netstat', 'powershell'], by: 'netstat+powershell' },
    { name: 'D21 useBoth powershell fails -> failure', useBoth: true, outs: { netstat: ok(NS.v4), powershell: err('ETIMEDOUT') }, pids: null, srcs: ['netstat', 'powershell'], msg: /netstat found 1, powershell timeout/ },
    { name: 'D22 useBoth netstat none', useBoth: true, outs: { netstat: ok(NS.none), powershell: ok(PS.v4) }, pids: [1111], srcs: ['netstat', 'powershell'], by: 'powershell' },
    { name: 'D29 useBoth same pid from both -> once', useBoth: true, outs: { netstat: ok(NS.v4), powershell: ok(ps([[8080, '::', 0, 1111], [8080, '0.0.0.0', 0, 999]])) }, pids: [999, 1111], srcs: ['netstat', 'powershell'], by: 'netstat+powershell' },
    { name: 'D30 useBoth netstat fails, powershell found', useBoth: true, outs: { netstat: err('ENOENT'), powershell: ok(PS.v4) }, pids: [1111], srcs: ['netstat', 'powershell'], by: 'powershell' },
    { name: 'D31 useBoth both fail -> failure', useBoth: true, outs: { netstat: err('ETIMEDOUT'), powershell: ok('', 2) }, pids: null, srcs: ['netstat', 'powershell'], msg: /netstat timeout\[\d+ms\], powershell code\[2\]/ },
    //其他平台: lsof, 離開碼1=無人, 其餘失敗(規格③④)
    { name: 'D32 lsof exit 0 with empty output -> nobody', platform: 'linux', outs: { lsof: ok('') }, pids: [], srcs: ['lsof'], by: 'lsof' },
    { name: 'D33 lsof exit 1 with pids -> pids', platform: 'linux', outs: { lsof: ok('321\n', 1) }, pids: [321], srcs: ['lsof'], by: 'lsof' },
    { name: 'D34 lsof killed by signal -> failure', platform: 'darwin', outs: { lsof: ok('', null) }, pids: null, srcs: ['lsof'], msg: /lsof code\[null\]/ },
    { name: 'D23 lsof found and dedup', platform: 'linux', outs: { lsof: ok('1234\n5678\n1234\n') }, pids: [1234, 5678], srcs: ['lsof'], by: 'lsof' },
    { name: 'D24 lsof exit 1 -> nobody', platform: 'darwin', outs: { lsof: ok('', 1) }, pids: [], srcs: ['lsof'], by: 'lsof' },
    { name: 'D25 lsof exit 2 -> failure', platform: 'linux', outs: { lsof: ok('', 2) }, pids: null, srcs: ['lsof'], msg: /lsof code\[2\]/ },
    { name: 'D26 lsof not found -> failure', platform: 'linux', outs: { lsof: err('ENOENT') }, pids: null, srcs: ['lsof'], msg: /lsof error\[ENOENT\]/ },
    { name: 'D27 lsof timeout -> failure', platform: 'linux', outs: { lsof: err('ETIMEDOUT') }, pids: null, srcs: ['lsof'], msg: /lsof timeout/ },
    { name: 'D28 lsof unparseable -> failure', platform: 'linux', outs: { lsof: ok('COMMAND PID USER\nnode 1234 semi\n') }, pids: null, srcs: ['lsof'], msg: /lsof unparseable output/ },
]


//recEvents, 觀察回調之紀錄器
function recEvents() {
    let evs = []
    let on = (e) => {
        evs.push(e)
    }
    return { evs, on }
}


//checkEvents, 事件之共同斷言: 凍結、各type欄位固定、run/result成對且src依序、settle恰一個且在最後
let FIELDS = {
    run: ['type', 'src', 'timeout'],
    result: ['type', 'src', 'ok', 'reason', 'code', 'count'],
    settle: ['type', 'ok', 'reason', 'src', 'count', 'msg'],
}
function checkEvents(evs, srcs) {
    for (let e of evs) {
        assert.strict.deepStrictEqual(Object.isFrozen(e), true)
        assert.strict.deepStrictEqual(Object.keys(e).sort(), [...FIELDS[e.type]].sort(), `fields of ${e.type}`)
    }
    let runs = evs.filter((e) => e.type === 'run').map((e) => e.src)
    let results = evs.filter((e) => e.type === 'result').map((e) => e.src)
    assert.strict.deepStrictEqual(runs, srcs)
    assert.strict.deepStrictEqual(results, srcs)
    for (let i = 0; i < srcs.length; i++) {
        //每個run之後緊接其result
        assert.strict.deepStrictEqual(evs[i * 2].type, 'run')
        assert.strict.deepStrictEqual(evs[i * 2 + 1].type, 'result')
    }
    assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'settle').length, 1)
    assert.strict.deepStrictEqual(evs[evs.length - 1].type, 'settle')
}


export {
    row,
    HEAD_EN,
    HEAD_ZH,
    ns,
    BG,
    ps,
    ok,
    err,
    THROW,
    NS,
    PS,
    fakeExec,
    fakeExecAsync,
    CASES,
    recEvents,
    checkEvents
}
