import assert from 'assert'
import { spawnSync } from 'child_process'
import { Readable } from 'stream'
import { fileURLToPath } from 'url'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFileBasicHash from '../src/fsGetFileBasicHash.mjs'
import fsGetFileBasicHashCore from '../src/fsGetFileBasicHashCore.mjs'
import { thrower, thrownCases, mkFsReadStub } from './tools/codecThrown.mjs'
import { settleShown } from './tools/caseKit.mjs'
import { itFsHashFail, itNoHandler, itOptUnreadable, rejected, RULE } from './tools/fsHashFailRunner.mjs'


describe(`fsGetFileBasicHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsGetFileBasicHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let h1 = await fsGetFileBasicHash(fp)
        // console.log('fsGetFileBasicHash(sha512)', h1)
        ms.push({ 'fsGetFileBasicHash(sha512)': h1 })

        let h2 = await fsGetFileBasicHash(fp, { type: 'sha256' })
        // console.log('fsGetFileBasicHash(sha256)', h2)
        ms.push({ 'fsGetFileBasicHash(sha256)': h2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFileBasicHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
    // fsGetFileBasicHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
    let ms = [
        {
            'fsGetFileBasicHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
        },
        {
            'fsGetFileBasicHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsGetFileBasicHashCore 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    //含子行程案(修正前此案會懸置至腳本內之8秒看門狗), 放寬逾時
    this.timeout(30000)

    //thrownCases(test/tools/codecThrown.mjs)為呼叫端(注入之fs、crypto)可拋出之各種值, msg為_errToStr應得之字串
    //修正前catch內與'error'監聽器內之err.toString()遇其任一皆再拋TypeError

    //fs替身(mkFsReadStub): 僅使fsIsFileCore之前置檢查通過, createReadStream由各案注入; settleShown: 5秒內須settle, 結果值經showValue(非字串帶型別前綴)

    //crypto替身: createHash由各案注入, 預設回傳可用之hash物件
    let hashOk = () => ({ update() {}, digest: () => 'h' })
    let mkCrypto = (createHash = hashOk) => ({ createHash })

    //try內執行呼叫端注入之物: crypto.createHash(先執行)與fs.createReadStream, 由v指定其拋出之值
    let points = [
        {
            name: 'crypto.createHash',
            mkOpt: (v) => ({
                fs: mkFsReadStub(thrower(new Error('createHash拋錯後不應走到createReadStream'))),
                crypto: mkCrypto(thrower(v)),
            }),
        },
        {
            name: 'fs.createReadStream',
            mkOpt: (v) => ({
                fs: mkFsReadStub(thrower(v)),
                crypto: mkCrypto(),
            }),
        },
    ]

    for (let p of points) {
        for (let c of thrownCases) {
            it(`should not throw but reject with '${c.msg}' when ${p.name} throws ${c.name} [R-CODEC-ERR-01之2]`, async function() {
                let pm = null
                assert.doesNotThrow(() => {
                    pm = fsGetFileBasicHashCore('x.bin', p.mkOpt(c.mk()))
                })
                let r = await settleShown(pm)
                assert.strict.deepStrictEqual(r, { s: 'reject', v: c.msg })
            })
        }
    }

    //stream 'error'監聽器(非try內)遇非Error之值: 修正前監聽器內err.toString()再拋TypeError, Promise永不settle
    //同進程: 對fs所產stream同步emit('error', 值), 修正前TypeError自emit外拋(不經事件迴圈, 不污染mocha行程)
    for (let c of thrownCases) {
        it(`should not throw in the 'error' listener but reject with '${c.msg}' when the stream emits an 'error' event whose value is ${c.name} [R-CODEC-ERR-01之2]`, async function() {
            let stream = new Readable({ read() {} })
            let pm = fsGetFileBasicHashCore('x.bin', { fs: mkFsReadStub(() => stream), crypto: mkCrypto() })
            assert.doesNotThrow(() => {
                stream.emit('error', c.mk())
            })
            let r = await settleShown(pm)
            assert.strict.deepStrictEqual(r, { s: 'reject', v: c.msg })
        })
    }

    it(`(守門) should reject with 'Error: boom' (same as err.toString()) when crypto.createHash throws an Error [R-CODEC-ERR-01之2]`, async function() {
        let opt = { fs: mkFsReadStub(null), crypto: mkCrypto(thrower(new Error('boom'))) }
        let r = await settleShown(fsGetFileBasicHashCore('x.bin', opt))
        assert.strict.deepStrictEqual(r, { s: 'reject', v: 'Error: boom' })
    })

    it(`(守門) should reject with 'Error: boom' (same as err.toString()) when the stream ends with an Error [R-CODEC-ERR-01之2]`, async function() {
        let fsFake = mkFsReadStub(() => new Readable({
            read() {
                this.destroy(new Error('boom'))
            },
        }))
        let r = await settleShown(fsGetFileBasicHashCore('x.bin', { fs: fsFake, crypto: mkCrypto() }))
        assert.strict.deepStrictEqual(r, { s: 'reject', v: 'Error: boom' })
    })

    //端到端: fs所產stream自行以destroy(非Error之值)結束(destroy(null)不發出error事件, 故用無原型物件), 'error'事件於nextTick發出
    //修正前監聽器內err.toString()再拋TypeError, 成為未捕捉例外且Promise永不settle; 未捕捉例外會污染mocha行程, 故於子行程執行
    //被測模組路徑由本檔位置推得並以argv傳入, 子行程以pathToFileURL匯入; 腳本(僅含ASCII)輸出一行JSON({ s, v, uncaught })
    //  s為'resolve'、'reject'或'pending'(8秒看門狗逾時), uncaught為未捕捉例外之訊息陣列
    let fpMod = fileURLToPath(new URL('../src/fsGetFileBasicHashCore.mjs', import.meta.url))
    let scriptStreamError = `
import { Readable } from 'stream'
import { pathToFileURL } from 'url'

let uncaught = []
process.on('uncaughtException', (e) => {
    uncaught.push(String(e && e.message))
})

let core = (await import(pathToFileURL(process.argv[1]).href)).default

let fs = {
    statSync: () => ({}),
    lstatSync: () => ({ isDirectory: () => false, isSymbolicLink: () => false }),
    createReadStream: () => new Readable({
        read() {
            this.destroy(Object.create(null))
        },
    }),
}
let crypto = {
    createHash: () => ({ update() {}, digest: () => 'h' }),
}

let out = { s: 'pending', v: null, uncaught }
let wd = null
let done = false
let finish = () => {
    if (done) {
        return
    }
    done = true
    clearTimeout(wd)
    process.stdout.write(JSON.stringify(out) + '\\n', () => process.exit(0))
}
core('x.bin', { fs, crypto }).then(
    (v) => {
        out.s = 'resolve'
        out.v = v
        setTimeout(finish, 300)
    },
    (v) => {
        out.s = 'reject'
        out.v = v
        setTimeout(finish, 300)
    }
)
wd = setTimeout(finish, 8000)
`

    //runChild: 於子行程執行inline腳本(ES module), 回傳其stdout最後一行JSON之剖析結果; 無結果行(崩潰或被逾時終止)則拋出可判讀之錯誤
    let runChild = (script, args) => {
        let cp = spawnSync(process.execPath, ['--input-type=module', '-e', script, ...args], { encoding: 'utf8', timeout: 15000 })
        let line = (cp.stdout || '').split(/\r?\n/).filter((l) => l.startsWith('{')).pop()
        if (!line) {
            throw new Error(`子行程無結果行: status=${cp.status}, signal=${cp.signal}, error=${cp.error && cp.error.message}, stderr=${String(cp.stderr || '').slice(0, 300)}`)
        }
        return JSON.parse(line)
    }

    it(`should reject with 'unknown error' without any uncaught exception or hang when the stream destroys itself with an object without prototype (end-to-end, child process) [R-CODEC-ERR-01之2]`, function() {
        let r = runChild(scriptStreamError, [fpMod])
        assert.strict.deepStrictEqual(r, { s: 'reject', v: 'unknown error', uncaught: [] })
    })

})


describe(`fsGetFileBasicHash 失敗回報(R-FS-REJECT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsHashFailRunner.mjs), 夾具建於test/_tmp/fsHashFail-<案名>/並由執行器刪除(拒讀ACL先以icacls解除)
    //id為審計輸入空間表(tmp/run01-1016/fs/fs-reject-table.md)之列號; want以子行程回報之事實(路徑、同一錯誤直接呼叫所得之String(err))組出期望; rule為期望所對應之規則句
    this.timeout(60000)

    itFsHashFail([
        { id: 'BH01', when: '真實fs: 路徑不存在', want: (o) => rejected(`fp[${o.fp}] is not a file`), rule: RULE.r1pre },
        { id: 'BH02', when: '真實fs: 路徑為資料夾', want: (o) => rejected(`fp[${o.fp}] is not a file`), rule: RULE.r1pre },
        { id: 'BH03', when: '真實fs: 上層為檔案(ENOTDIR)', want: (o) => rejected(`fp[${o.fp}] is not a file`), rule: RULE.r1pre },
        { id: 'BH04', when: '真實crypto: type不支援(createHash拋Error)', want: (o) => rejected(o.errStr), rule: RULE.r1err },
        { id: 'BH05', when: '真實fs: 檔案ACL拒讀(串流error EPERM)', want: (o) => rejected(o.errStr), rule: RULE.r1err, win: true },
        { id: 'BH06', when: '注入fs: createReadStream回真實ReadStream(開檔ENOENT)', want: (o) => rejected(o.errStr), rule: RULE.r1err },
        { id: 'BH07', when: '注入fs: 串流以null出錯', want: () => rejected('null'), rule: RULE.r1any },
        { id: 'BH08', when: '注入crypto: createHash拋null', want: () => rejected('null'), rule: RULE.r1any },
        { id: 'BH09', when: 'Core注入fs: lstatSync拋Error(statSync正常)', want: () => rejected('Error: lstat boom'), rule: RULE.r2 },
        { id: 'BH10', when: '對外函數+opt.fs(展開覆蓋): lstatSync拋null', want: () => rejected('null'), rule: RULE.r2 },
        { id: 'BH11', when: '注入crypto: readable監聽器內hash.update拋Error', want: () => rejected('Error: update boom'), rule: RULE.r3 },
        { id: 'BH12', when: '注入crypto: readable監聽器內hash.update拋null', want: () => rejected('null'), rule: RULE.r3 },
        { id: 'BH13', when: '注入crypto: readable監聽器內hash.digest拋Error', want: () => rejected('Error: digest boom'), rule: RULE.r3 },
        { id: 'BH14', when: '注入fs: readable監聽器內串流read()拋Error', want: () => rejected('Error: read boom'), rule: RULE.r3 },
        { id: 'BH15', when: '輸入: fp為數字123', want: () => rejected('fp[123] is not a file'), rule: RULE.r1pre },
    ])

    //監聽器內注入物拋錯之4形, 無處理器時須不崩潰
    itNoHandler(['BH11', 'BH12', 'BH13', 'BH14'])

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: RULE.r2opt)
    itOptUnreadable(['fsGetFileBasicHash', 'fsGetFileBasicHashCore'])

})
