import assert from 'assert'
import execProcessPortPids from '../src/execProcessPortPids.mjs'
import execProcessPortPidsSync from '../src/execProcessPortPidsSync.mjs'
import kit from '../src/_execPortPids.mjs'
import { INVALID } from './tools/enumInputs.mjs'
import { resetWarned, capture, stubWarn } from './tools/numOptKit.mjs'


//execProcessPortPids、execProcessPortPidsSync(共用內部_execPortPids.readInput) 之 port:
//  必須參數(無預設、無回退): iseint(port, { use: 'port' }) 判定(有效整數且在1~65535, 數字字串亦可, 去頭尾空白), 取值Number(port); 非預期(含包裝物件、小數、0、超出範圍、Infinity、'0x50'、非數字、不可讀之值)報錯, 不視為未給、不改用預設
//  處置不變: 非同步版reject 'port is not an integer between 1 and 65535'; 同步版回傳null且訊息由onTrace之settle事件取得; 皆不拋錯、不執行子指令(exec不被呼叫)
//  原: 包裝物件(new Number、new String)以原型之valueOf拆包後判定而接受, 且'0x50'等經isint被接受; 現iseint不解包、不收其他進位寫法
const MSG = 'port is not an integer between 1 and 65535'

//有效埠號: [標籤, 輸入, 期望之埠號]
const VALID = [
    ['1 (lower bound)', 1, 1],
    ['80', 80, 80],
    ['8080', 8080, 8080],
    ['65535 (upper bound)', 65535, 65535],
    [`'80'`, '80', 80],
    [`' 80 ' (trimmed)`, ' 80 ', 80],
    [`'\\t8080\\n' (trimmed)`, '\t8080\n', 8080],
    [`'0080' (leading zeros)`, '0080', 80],
    [`'+80'`, '+80', 80],
    [`'1e2'`, '1e2', 100],
    [`'80.0' (an integer written with a decimal point)`, '80.0', 80],
    [`'65535'`, '65535', 65535],
]

//非預期之埠號: 共用矩陣(含undefined、null、new Number(30)、new String('30')等)與埠號特有者
let pv = Proxy.revocable({}, {})
pv.revoke()
let calls = { n: 0, s: 0 }
const INVALID_PORT = [
    ...INVALID,
    ['0 (not a port; use safe + min 0 for a system-assigned port)', 0],
    [`'0'`, '0'],
    ['-1', -1],
    [`'-1'`, '-1'],
    ['65536 (upper bound + 1)', 65536],
    [`'65536'`, '65536'],
    ['4294967295', 4294967295],
    ['80.5', 80.5],
    [`'80.5'`, '80.5'],
    [`'0x50' (hexadecimal, the old isint accepted it)`, '0x50'],
    [`'0b1010000'`, '0b1010000'],
    [`'0o120'`, '0o120'],
    [`'1e5' (100000)`, '1e5'],
    [`'1.0000000000000001' (precision loss)`, '1.0000000000000001'],
    [`'9007199254740993'`, '9007199254740993'],
    ['2 ** 53', 2 ** 53],
    ['Object(80) (wrapper, the old code unwrapped it)', Object(80)],
    [`Object('80') (wrapper, the old code unwrapped it)`, Object('80')],
    ['new Number(8080)', new Number(8080)], // eslint-disable-line no-new-wrappers
    [`new String('8080')`, new String('8080')], // eslint-disable-line no-new-wrappers
    ['Proxy over a wrapper', new Proxy(Object(80), {})],
    ['revoked Proxy', pv.proxy],
    ['[80]', [80]],
    [`['80']`, ['80']],
    ['{ valueOf: () => 80 }', {
        valueOf() {
            calls.n++
            return 80
        },
    }],
    [`{ toString: () => '80' }`, {
        toString() {
            calls.s++
            return '80'
        },
    }],
    ['{ valueOf throws }', {
        valueOf() {
            throw new Error('valueOf boom')
        },
    }],
]

//假exec(同形於spawnSync結果), 記錄被呼叫之引數
function mkExec() {
    let rec = []
    let exec = (prog, args) => {
        rec.push({ prog, args })
        return { status: 0, stdout: '42\n', error: null }
    }
    return { exec, rec }
}


describe('optVal execProcessPortPids / execProcessPortPidsSync port (required parameter)', function() {

    describe('valid ports are used as the converted number (K4)', function() {

        for (let [label, v, n] of VALID) {

            it(`execProcessPortPidsSync: should query the port ${n} for ${label}`, function() {
                let { exec, rec } = mkExec()
                let r = execProcessPortPidsSync(v, { platform: 'linux', exec })
                assert.strict.deepStrictEqual(r, [42])
                assert.strict.deepStrictEqual(rec.length, 1)
                assert.strict.deepStrictEqual(rec[0].args, ['-nP', `-iTCP:${n}`, '-sTCP:LISTEN', '-t'])
            })

            it(`execProcessPortPids: should query the port ${n} for ${label}`, async function() {
                let { exec, rec } = mkExec()
                let r = await execProcessPortPids(v, { platform: 'linux', exec: async (...a) => exec(...a) })
                assert.strict.deepStrictEqual(r, [42])
                assert.strict.deepStrictEqual(rec.length, 1)
                assert.strict.deepStrictEqual(rec[0].args, ['-nP', `-iTCP:${n}`, '-sTCP:LISTEN', '-t'])
            })

            it(`readInput: should give the port ${n} for ${label}`, function() {
                assert.strict.deepStrictEqual(kit.readInput(v, {}, () => {}).port, n)
            })

        }

    })

    describe('unexpected ports are errors (a required parameter is never replaced by a default), the channel is unchanged', function() {

        for (let [label, v] of INVALID_PORT) {

            it(`execProcessPortPidsSync: should return null with the settle message and not run any command for ${label}`, function() {
                let { exec, rec } = mkExec()
                let evs = []
                let r
                assert.doesNotThrow(() => {
                    r = execProcessPortPidsSync(v, { platform: 'linux', exec, onTrace: (e) => evs.push(e) })
                })
                assert.strict.deepStrictEqual(r, null)
                assert.strict.deepStrictEqual(rec.length, 0)
                assert.strict.deepStrictEqual(evs, [{ type: 'settle', ok: false, reason: 'port', src: null, count: null, msg: MSG }])
            })

            it(`execProcessPortPids: should reject the message string, not throw synchronously and not run any command for ${label}`, async function() {
                let { exec, rec } = mkExec()
                let evs = []
                let pm
                assert.doesNotThrow(() => {
                    pm = execProcessPortPids(v, { platform: 'linux', exec: async (...a) => exec(...a), onTrace: (e) => evs.push(e) })
                })
                let r = await pm.then((x) => ({ ok: x }), (e) => ({ rej: e }))
                assert.strict.deepStrictEqual(r, { rej: MSG })
                assert.strict.deepStrictEqual(rec.length, 0)
                assert.strict.deepStrictEqual(evs, [{ type: 'settle', ok: false, reason: 'port', src: null, count: null, msg: MSG }])
            })

            it(`readInput: should give port null (and no error) for ${label}`, function() {
                let r = kit.readInput(v, {}, () => {})
                assert.strict.deepStrictEqual(r.err, null)
                assert.strict.deepStrictEqual(r.port, null)
            })

        }

    })

    it('should not unwrap wrapper objects nor call any method of the given value (iseint does not touch the value)', function() {
        // 修前以原型之valueOf拆包包裝物件; 現不解包, 物件自身之valueOf與toString皆不被呼叫
        assert.strict.deepStrictEqual(calls.n, 0)
        assert.strict.deepStrictEqual(calls.s, 0)
    })

    it('should not warn for an unexpected port even when opt.debug is true (a required parameter reports an error; it has no default to warn about)', async function() {
        // 必須參數不走「改用預設並警告」之通道(optVal): debug與funLog不接收任何警告
        resetWarned()
        let { funLog, logs } = capture()
        let { warns } = stubWarn(() => {
            execProcessPortPidsSync('abc', { debug: true, funLog })
        })
        await execProcessPortPids('abc', { debug: true, funLog }).catch(() => {})
        assert.strict.deepStrictEqual(logs.length, 0)
        assert.strict.deepStrictEqual(warns.length, 0)
        resetWarned()
    })

    it('should still use the default for the opt keys that are not in this batch (timeout: unchanged non-positive and non-number handling)', function() {
        // 同函數之opt.timeout不在本批(readInput內isnum與ceil與夾限維持原樣)
        let ex = () => {}
        assert.strict.deepStrictEqual(kit.readInput(80, {}, ex).cfg.timeout, 10000)
        assert.strict.deepStrictEqual(kit.readInput(80, { timeout: '300' }, ex).cfg.timeout, 300)
        assert.strict.deepStrictEqual(kit.readInput(80, { timeout: 1500.5 }, ex).cfg.timeout, 1501)
        assert.strict.deepStrictEqual(kit.readInput(80, { timeout: 2 ** 40 }, ex).cfg.timeout, 2147483647)
    })

})
