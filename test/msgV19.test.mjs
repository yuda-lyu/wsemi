import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ab2blob from '../src/ab2blob.mjs'
import ab2u8arr from '../src/ab2u8arr.mjs'
import aes2str from '../src/aes2str.mjs'
import str2aes from '../src/str2aes.mjs'
import b642obj from '../src/b642obj.mjs'
import b642str from '../src/b642str.mjs'
import b642u16arr from '../src/b642u16arr.mjs'
import b642u8arr from '../src/b642u8arr.mjs'
import bs2u8arr from '../src/bs2u8arr.mjs'
import str2b64 from '../src/str2b64.mjs'
import str2md5 from '../src/str2md5.mjs'
import str2sha from '../src/str2sha.mjs'
import str2hint from '../src/str2hint.mjs'
import str2u8arr from '../src/str2u8arr.mjs'
import obj2pb64 from '../src/obj2pb64.mjs'
import pb642obj from '../src/pb642obj.mjs'
import obj2str from '../src/obj2str.mjs'
import str2obj from '../src/str2obj.mjs'
import obj2stru8arr from '../src/obj2stru8arr.mjs'
import stru8arr2obj from '../src/stru8arr2obj.mjs'
import obj2u8arr from '../src/obj2u8arr.mjs'
import u8arr2obj from '../src/u8arr2obj.mjs'
import u16arr2b64 from '../src/u16arr2b64.mjs'
import u16arr2u8arr from '../src/u16arr2u8arr.mjs'
import u8arr2ab from '../src/u8arr2ab.mjs'
import u8arr2b64 from '../src/u8arr2b64.mjs'
import u8arr2blob from '../src/u8arr2blob.mjs'
import u8arr2bs from '../src/u8arr2bs.mjs'
import u8arr2str from '../src/u8arr2str.mjs'
import u8arr2u16arr from '../src/u8arr2u16arr.mjs'
import j2o from '../src/j2o.mjs'
import o2j from '../src/o2j.mjs'
import blob2ab from '../src/blob2ab.mjs'
import blob2b64 from '../src/blob2b64.mjs'
import blob2str from '../src/blob2str.mjs'
import blob2u8arr from '../src/blob2u8arr.mjs'
import blobs2b64s from '../src/blobs2b64s.mjs'
import blobs2u8arrs from '../src/blobs2u8arrs.mjs'
import time2day from '../src/time2day.mjs'
import time2hour from '../src/time2hour.mjs'
import time2min from '../src/time2min.mjs'
import timems2day from '../src/timems2day.mjs'
import timems2hour from '../src/timems2hour.mjs'
import timems2min from '../src/timems2min.mjs'
import timems2time from '../src/timems2time.mjs'
import timeTZ2day from '../src/timeTZ2day.mjs'
import timeTZ2hour from '../src/timeTZ2hour.mjs'
import timeTZ2min from '../src/timeTZ2min.mjs'
import timeTZ2expire from '../src/timeTZ2expire.mjs'
import timeTZ2past from '../src/timeTZ2past.mjs'
import timemsTZ2day from '../src/timemsTZ2day.mjs'
import timemsTZ2hour from '../src/timemsTZ2hour.mjs'
import timemsTZ2min from '../src/timemsTZ2min.mjs'
import timemsTZ2time from '../src/timemsTZ2time.mjs'
import timemsTZ2expire from '../src/timemsTZ2expire.mjs'
import timemsTZ2past from '../src/timemsTZ2past.mjs'
import ltdt2vrtsable from '../src/ltdt2vrtsable.mjs'
import ltdtkeys2mat from '../src/ltdtkeys2mat.mjs'
import ltdtkeysheads2mat from '../src/ltdtkeysheads2mat.mjs'
import mat2ltdt from '../src/mat2ltdt.mjs'
import keysmat2ltdt from '../src/keysmat2ltdt.mjs'
import oc from '../src/color.mjs'
import lowerFind from '../src/lowerFind.mjs'
import fsDeleteFileSafeCore from '../src/fsDeleteFileSafeCore.mjs'
import fsDeleteFolderSafeCore from '../src/fsDeleteFolderSafeCore.mjs'
import genDiagFunLog from '../src/genDiagFunLog.mjs'
import fsGetBinManifestEntry from '../src/fsGetBinManifestEntry.mjs'
import verifyValue from '../src/verifyValue.mjs'
import getFileHash from '../src/getFileHash.mjs'
import getFileBasicHash from '../src/getFileBasicHash.mjs'
import getFileXxHash from '../src/getFileXxHash.mjs'
import fsReadJson from '../src/fsReadJson.mjs'
import fsSrlog from '../src/fsSrlog.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'


//失敗訊息之格式(dspec〈輸入參數之檢測機制〉§6 V19、V20; 使用者2026-11-16 W-22「1 甲」: V19為必須之文字格式; 排程第492項第9批, ws492j)
//  V19: 輸入無效之失敗訊息一律為`invalid <名稱>: must …`(英文、固定詞彙), 名稱帶索引或鍵名, 不帶輸入值(V20)
//  本檔: ①靜態防線(src內不得再有不合V19之輸入無效訊息之呼叫形式) ②各函數逐字斷言(期望值皆為手寫之固定訊息) ③V20之console不帶值
//  例外(不屬本檔斷言): C11驗證器之終端使用者訊息(isUserPw、isUserName、isUserIdentify、verifyValue之資料驗證文字)、w-orm系共用詞彙(cvOrmFind、lowerFind之invalid find、chkOrmStr、chkOrmData)、操作失敗與環境缺失


let __dirname = path.dirname(fileURLToPath(import.meta.url))
let fdSrc = path.join(__dirname, '..', 'src')
let fdTmp = path.join(__dirname, '_tmp', 'msgV19')

let V19 = /^invalid [\w.[\]]+: must /

let S = { returnWithStateAndMsg: true }


describe('msgV19', function() {

    describe('static guard over src (no input-invalid message in a non-V19 call form)', function() {

        let files = fs.readdirSync(fdSrc).filter((f) => f.endsWith('.mjs') && f !== 'index.mjs')
        let srcs = {}
        for (let f of files) {
            srcs[f] = fs.readFileSync(path.join(fdSrc, f), 'utf8')
        }

        //內部不變式、環境缺失、操作狀態之 'invalid ...' 字面(非輸入無效之訊息), 逐一登記
        let allow = new Set([
            'now2str.mjs', 'now2strp.mjs', 'nowDay2str.mjs', 'nowms2str.mjs', 'nowms2strp.mjs', 'timemsTZ2expire.mjs', 'timemsTZ2past.mjs', //invalid dayjs: 套件自身相依缺失
            '_dayjs.mjs', '_filterXSS.mjs', '_getDiff2Html.mjs', '_getHtmlToText.mjs', 'getUserAgent.mjs', //UMD須以script載入之環境缺失
            'pmDebounce.mjs', //invalid tLast: 計時器回呼內之內部狀態斷言, 非輸入
            'color.mjs', //invalid colors array / invalid value: 解析器內部不變式
            'cvOrmFind.mjs', 'lowerFind.mjs', '_cvOrmFindCases.mjs', '_lowerFindCases.mjs', //w-orm系共用詞彙(契約案例表)
        ])

        let isCallForm = (s, re) => {
            let bad = []
            for (let [f, c] of Object.entries(srcs)) {
                if (allow.has(f) || (f.startsWith('_') && f !== '_ltdtkeys2matCore.mjs' && f !== '_keysmat2ltdtCore.mjs' && f !== '_execPortPids.mjs' && f !== '_execSpawnError.mjs')) {
                    continue
                }
                let m
                let r = new RegExp(re.source, 'g')
                while ((m = r.exec(c)) !== null) {
                    bad.push(`${f}: ${m[0]}`)
                }
            }
            return bad
        }

        it('no retError/reject/Error call whose message starts with "invalid <name>" but has no ": " after the name', function() {
            // V19: 名稱之後須為': '再接must; 'invalid str'、'invalid b64, xxx'、'invalid data, data is …'等舊式皆不合
            let bad = isCallForm('', /(?:retError|reject|Error)\(\s*(['"`])invalid (?![^'"`]*?: )[^'"`]*\1/)
            assert.strict.deepStrictEqual(bad, [])
        })

        it('every message literal of the form "invalid <name>: …" in a retError/reject/Error call continues with "must " (or "removed")', function() {
            let bad = isCallForm('', /(?:retError|reject|Error)\(\s*(['"`])invalid [\w.[\]${}]+: (?!must |removed|\$\{)[^'"`]*\1/)
            assert.strict.deepStrictEqual(bad, [])
        })

        it('no old-style "<name> is not a(n) …" message in a throw/reject/error:/err:/msg: form for the rewritten functions', function() {
            let bad = isCallForm('', /(?:retError|reject|Error)\(\s*(['"`])(?:wb|wb\.sheets|data|sheet|sheet\.rows|ps|px|v|x1|x2|rmin|rmax|inp|pms|rs|pm|fn|func|fp) (?:is not|can not)[^'"`]*\1|(?:retError|reject|Error)\(\s*(['"`])ele is not[^'"`]*\2/)
            assert.strict.deepStrictEqual(bad, [])
        })

        it('no console call echoes an input object in the getFile*Hash family (V20)', function() {
            for (let f of ['getFileHash.mjs', 'getFileBasicHash.mjs', 'getFileXxHash.mjs']) {
                let code = srcs[f].split('\n').filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('//')).join('\n')
                assert.ok(!/console\.log\(\s*'inp'/.test(code), f)
            }
        })

    })

    describe('state mode ({ state: "error", msg }) of the codec family', function() {

        let rows = [
            ['ab2blob', () => ab2blob('x', S), 'invalid ab: must be an ArrayBuffer'],
            ['ab2u8arr', () => ab2u8arr('x', S), 'invalid ab: must be an ArrayBuffer'],
            ['aes2str(str)', () => aes2str('', 'k', false, S), 'invalid str: must be a non-empty string'],
            ['aes2str(key)', () => aes2str('x', '', false, S), 'invalid key: must be a non-empty string'],
            ['str2aes(str)', () => str2aes('', 'k', false, S), 'invalid str: must be a non-empty string'],
            ['str2aes(key)', () => str2aes('x', '', false, S), 'invalid key: must be a non-empty string'],
            ['b642obj', () => b642obj(NaN, S), 'invalid b64: must be a string'],
            ['b642str', () => b642str('', S), 'invalid b64: must be a non-empty string'],
            ['b642u16arr(type)', () => b642u16arr(NaN, S), 'invalid b64: must be a string'],
            ['b642u16arr(odd bytes)', () => b642u16arr('QQ==', S), 'invalid b64: must decode to an even number of bytes'],
            ['b642u8arr(type)', () => b642u8arr(NaN, S), 'invalid b64: must be a string'],
            ['b642u8arr(alphabet)', () => b642u8arr('!!!!', S), 'invalid b64: must be a base64 string using only the base64 alphabet, with padding only at the end'],
            ['b642u8arr(single char chunk)', () => b642u8arr('QmFzQ', S), 'invalid b64: must be a base64 string whose last chunk is not a single character'],
            ['b642u8arr(1 padding)', () => b642u8arr('QQ=', S), 'invalid b64: must be a base64 string whose last chunk has 3 characters when it has 1 padding'],
            ['b642u8arr(2 paddings)', () => b642u8arr('QUI==', S), 'invalid b64: must be a base64 string whose last chunk has 2 characters when it has 2 paddings'],
            ['bs2u8arr', () => bs2u8arr('', S), 'invalid str: must be a non-empty string'],
            ['str2b64', () => str2b64('', S), 'invalid str: must be a non-empty string'],
            ['str2md5', () => str2md5('', false, S), 'invalid str: must be a non-empty string'],
            ['str2sha(str)', () => str2sha('', 256, false, S), 'invalid str: must be a non-empty string'],
            ['str2sha(n)', () => str2sha('a', 'x', false, S), 'invalid n: must be a positive integer'],
            ['str2hint', () => str2hint(NaN, S), 'invalid str: must be a string'],
            ['str2u8arr(empty)', () => str2u8arr('', S), 'invalid str: must be a non-empty string'],
            ['str2u8arr(lone surrogate)', () => str2u8arr('\uD800', S), 'invalid str: must be a well-formed string without lone surrogates'],
            ['obj2pb64(data)', () => obj2pb64(undefined, 'k', S), 'invalid data: must not be undefined'],
            ['obj2pb64(key)', () => obj2pb64({}, '', S), 'invalid key: must be a non-empty string'],
            ['pb642obj(b64)', () => pb642obj('', 'k', S), 'invalid b64: must be a non-empty string'],
            ['pb642obj(key)', () => pb642obj('x', '', S), 'invalid key: must be a non-empty string'],
            ['obj2str', () => obj2str(undefined, 'Uint8Array', S), 'invalid data: must not be undefined'],
            ['str2obj', () => str2obj(NaN, 'Uint8Array', S), 'invalid data: must be a string'],
            ['obj2stru8arr(type)', () => obj2stru8arr(NaN, S), 'invalid o: must be an object or an array'],
            ['obj2stru8arr(empty)', () => obj2stru8arr({}, S), 'invalid o: must not be an empty object or an empty array'],
            ['stru8arr2obj(data)', () => stru8arr2obj(NaN, S), 'invalid data: must be a non-empty object'],
            ['stru8arr2obj(results)', () => stru8arr2obj({ results: '', binarys: [] }, S), 'invalid data.results: must be a non-empty string'],
            ['stru8arr2obj(binarys)', () => stru8arr2obj({ results: '{}', binarys: 'x' }, S), 'invalid data.binarys: must be an array'],
            ['stru8arr2obj(u16 type)', () => stru8arr2obj({ results: '{"a":"[BlazeForUint16Array]::0"}', binarys: [5] }, S), 'invalid data.binarys[0]: must be a Uint16Array or a Uint8Array'],
            ['stru8arr2obj(u16 odd)', () => stru8arr2obj({ results: '{"a":"[BlazeForUint16Array]::0"}', binarys: [new Uint8Array([1, 2, 3])] }, S), 'invalid data.binarys[0]: must have an even byteLength to be restored to a Uint16Array'],
            ['stru8arr2obj(ab type)', () => stru8arr2obj({ results: '{"a":"[BlazeForArrayBuffer]::0"}', binarys: [5] }, S), 'invalid data.binarys[0]: must be an ArrayBuffer or a Uint8Array'],
            ['stru8arr2obj(index range)', () => stru8arr2obj({ results: '{"a":"[BlazeForUint8Array]::1"}', binarys: [new Uint8Array(1)] }, S), 'invalid data.results: must only reference binary indexes that exist in data.binarys'],
            ['stru8arr2obj(index twice)', () => stru8arr2obj({ results: '{"a":"[BlazeForUint8Array]::0","b":"[BlazeForUint8Array]::0"}', binarys: [new Uint8Array(1)] }, S), 'invalid data.results: must not reference the same binary index more than once'],
            ['obj2u8arr', () => obj2u8arr(NaN, S), 'invalid data: must be a non-empty object or a non-empty array'],
            ['u8arr2obj', () => u8arr2obj(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['u16arr2b64', () => u16arr2b64(NaN, S), 'invalid u16a: must be a Uint16Array'],
            ['u16arr2u8arr', () => u16arr2u8arr(NaN, S), 'invalid u16a: must be a Uint16Array'],
            ['u8arr2ab', () => u8arr2ab(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['u8arr2b64', () => u8arr2b64(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['u8arr2blob', () => u8arr2blob(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['u8arr2bs', () => u8arr2bs(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['u8arr2str', () => u8arr2str(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['u8arr2u16arr', () => u8arr2u16arr(NaN, S), 'invalid u8a: must be a Uint8Array'],
            ['j2o', () => j2o('', S), 'invalid v: must be a non-empty string'],
            ['o2j', () => o2j(undefined, false, S), 'invalid v: must not be undefined'],
            ['ltdt2vrtsable(ltdt)', () => ltdt2vrtsable(NaN, [], S), 'invalid ltdt: must be an array of non-empty objects'],
            ['ltdt2vrtsable(mergerowkeys)', () => ltdt2vrtsable([{ a: 1 }], NaN, S), 'invalid mergerowkeys: must be an array'],
            ['ltdt2vrtsable(element)', () => ltdt2vrtsable([{ a: 1 }, NaN], [], S), 'invalid ltdt[1]: must be a non-empty object'],
            ['ltdtkeys2mat(ltdt)', () => ltdtkeys2mat('x', ['a'], S), 'invalid ltdt: must be an array'],
            ['ltdtkeys2mat(row)', () => ltdtkeys2mat([{ a: 1 }, null], ['a'], S), 'invalid ltdt[1]: must be an object'],
            ['ltdtkeys2mat(keys)', () => ltdtkeys2mat([{ a: 1 }], 'a', S), 'invalid keys: must be an array'],
            ['ltdtkeysheads2mat(ltdt)', () => ltdtkeysheads2mat('x', ['a'], {}, S), 'invalid ltdt: must be an array'],
            ['mat2ltdt(mat)', () => mat2ltdt('x', S), 'invalid mat: must be an array'],
            ['mat2ltdt(row)', () => mat2ltdt([['a'], []], S), 'invalid mat[1]: must be a non-empty array'],
            ['keysmat2ltdt(mat)', () => keysmat2ltdt(['a'], 'x', S), 'invalid mat: must be an array'],
            ['keysmat2ltdt(row)', () => keysmat2ltdt(['a'], [1], S), 'invalid mat[0]: must be a non-empty array'],
            ['keysmat2ltdt(keys)', () => keysmat2ltdt('a', [[1]], S), 'invalid keys: must be a non-empty array'],
        ]
        for (let [label, f, exp] of rows) {
            it(`${label}: { state: 'error', msg: '${exp}' } (V19, no input value)`, function() {
                let r = f()
                assert.strict.deepStrictEqual(r, { state: 'error', msg: exp })
                assert.ok(V19.test(r.msg), r.msg)
            })
        }

        it('time conversions: invalid t', function() {
            let T = 'a time string YYYY-MM-DDTHH:mm:ss'
            let TMS = 'a time string YYYY-MM-DDTHH:mm:ss.SSS'
            let TTZ = 'a time string YYYY-MM-DDTHH:mm:ss with a time zone (Z, +HH:mm or -HH:mm)'
            let TMSTZ = 'a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)'
            let cases = [
                [time2day, T], [time2hour, T], [time2min, T],
                [timems2day, TMS], [timems2hour, TMS], [timems2min, TMS], [timems2time, TMS],
                [timeTZ2day, TTZ], [timeTZ2hour, TTZ], [timeTZ2min, TTZ],
                [timemsTZ2day, TMSTZ], [timemsTZ2hour, TMSTZ], [timemsTZ2min, TMSTZ], [timemsTZ2time, TMSTZ],
            ]
            for (let [f, d] of cases) {
                assert.strict.deepStrictEqual(f(NaN, S), { state: 'error', msg: `invalid t: must be ${d}` }, f.name)
            }
        })

        it('timeTZ2expire / timeTZ2past / timemsTZ2expire / timemsTZ2past: the state-mode msg and the default-mode err are the same V19 message (formerly invalid t / 時間格式錯誤)', function() {
            let TTZ = 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss with a time zone (Z, +HH:mm or -HH:mm)'
            let TMSTZ = 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)'
            for (let [f, m] of [[timeTZ2expire, TTZ], [timeTZ2past, TTZ], [timemsTZ2expire, TMSTZ], [timemsTZ2past, TMSTZ]]) {
                assert.strict.deepStrictEqual(f(NaN, null, S), { state: 'error', msg: m }, f.name)
                let r = f(NaN)
                assert.strict.deepStrictEqual(r.err, m, f.name)
            }
        })

    })

    describe('rejected (Promise) codec functions', function() {

        let rej = async (f) => {
            try {
                await f()
            }
            catch (e) {
                return e
            }
            return 'resolved'
        }

        for (let [label, f, exp] of [
            ['blob2ab', () => blob2ab(1), 'invalid bb: must be a Blob'],
            ['blob2b64', () => blob2b64(1), 'invalid bb: must be a Blob'],
            ['blob2str', () => blob2str(1), 'invalid bb: must be a Blob'],
            ['blob2u8arr', () => blob2u8arr(1), 'invalid bb: must be a Blob'],
            ['blobs2b64s', () => blobs2b64s(1), 'invalid bbs: must be an array'],
            ['blobs2u8arrs', () => blobs2u8arrs(1), 'invalid bbs: must be an array'],
        ]) {
            it(`${label}: rejects the string '${exp}'`, async function() {
                assert.strict.deepStrictEqual(await rej(f), exp)
            })
        }

    })

    describe('functions changed by hand', function() {

        it('color.getBrightness / getLuminance: a translucent color throws "invalid color: must have an alpha of 1"', function() {
            assert.throws(() => oc.getBrightness('rgba(0,0,0,0.5)'), { message: 'invalid color: must have an alpha of 1' })
            assert.throws(() => oc.getLuminance('rgba(0,0,0,0.5)'), { message: 'invalid color: must have an alpha of 1' })
        })

        it('fsDeleteFileSafeCore / fsDeleteFolderSafeCore: an opt.fs without statSync rejects the exact V19 message that names only the checked function', async function() {
            for (let f of [fsDeleteFileSafeCore, fsDeleteFolderSafeCore]) {
                for (let fsx of [null, {}, { lstatSync() {} }]) {
                    let r = await f('x', { fs: fsx }).then(() => 'resolved', (e) => e)
                    assert.strict.deepStrictEqual(r, 'invalid opt.fs: must be an object providing statSync')
                }
            }
        })

        it('lowerFind: an undefined or null copy throws TypeError "invalid copy: must be an object" (formerly the native Object.keys TypeError), after the opt check', function() {
            for (let c of [undefined, null]) {
                assert.throws(() => lowerFind(c, { maxParams: 5 }), (e) => e instanceof TypeError && e.message === 'invalid copy: must be an object')
                //檢測順序: opt先於copy
                assert.throws(() => lowerFind(c, {}), (e) => e instanceof Error && e.message === 'invalid opt.maxParams: must be a positive number (use Infinity for no limit)')
            }
            assert.strict.deepStrictEqual(lowerFind({}, { maxParams: 5 }), null) //空複本(無條件)行為不變
        })

        it('genDiagFunLog: a non-function write throws TypeError "invalid write: must be a function"', function() {
            assert.throws(() => genDiagFunLog(5), (e) => e instanceof TypeError && e.message === 'invalid write: must be a function')
        })

        it('fsGetBinManifestEntry: opt.path and opt.url together are invalid (V10, V19), rejected before any file is read', async function() {
            let r = await fsGetBinManifestEntry('x', { path: 'a/b.bin', url: 'https://example.com/a.bin' }).then(() => 'resolved', (e) => e)
            // 拒絕值為字串(fsErrMsg: Error之toString, 與同函數其他檢測訊息之既有形式一致, 如'Error: invalid fp: must be an existing file')
            assert.strict.deepStrictEqual(String(r && r.message !== undefined ? r.message : r), 'Error: invalid opt.url: must not be given together with opt.path (an entry has exactly one source)')
        })

        it('verifyValue: the four configuration errors of type custom are V19 (data validation texts of the C11 validator are kept)', function() {
            assert.throws(() => verifyValue(1, 'custom', {}), { message: 'invalid opt.funCustom: must be a function when type is \'custom\'' })
            assert.throws(() => verifyValue(1, 'custom', { funCustom: () => ({ err: 'x' }) }), { message: 'invalid return.err: must be a boolean when type is \'custom\'' })
            assert.throws(() => verifyValue(1, 'custom', { funCustom: () => ({ err: true }) }), { message: 'invalid return.errmsg: must be a non-empty string when return.err is true and type is \'custom\'' })
            assert.throws(() => verifyValue(1, 'custom', { funCustom: () => ({ err: false, value: {} }) }), { message: 'invalid return.value: must be a number or a string when type is \'custom\'' })
            // 終端使用者顯示之文字(C11)維持原文
            assert.strict.deepStrictEqual(verifyValue('x', 'pint').errmsg !== undefined, true)
        })

        for (let [name, f] of [['getFileHash', getFileHash], ['getFileBasicHash', getFileBasicHash], ['getFileXxHash', getFileXxHash]]) {
            it(`${name}: a non-Blob input rejects "invalid inp: must be a Blob or a File" and does not print the input (V20)`, async function() {
                let logs = []
                let saved = console.log
                console.log = (...a) => {
                    logs.push(a)
                }
                let secret = { secret: 'SECRET-VALUE-123' }
                let r
                try {
                    r = await f(secret).then(() => 'resolved', (e) => e)
                }
                finally {
                    console.log = saved
                }
                assert.strict.deepStrictEqual(r, 'invalid inp: must be a Blob or a File')
                assert.strict.deepStrictEqual(logs, [])
            })
        }

        describe('with real files (test/_tmp/msgV19)', function() {

            before(function() {
                fs.rmSync(fdTmp, { recursive: true, force: true })
                fs.mkdirSync(fdTmp, { recursive: true })
            })

            after(function() {
                fs.rmSync(fdTmp, { recursive: true, force: true })
            })

            it('fsReadJson: a JSON syntax error is the fixed SyntaxError without a piece of the file (V20)', function() {
                let fp = path.join(fdTmp, 'bad.json')
                fs.writeFileSync(fp, '{"secret": SECRET-FILE-TEXT, }')
                let r = fsReadJson(fp)
                assert.ok(r.error instanceof SyntaxError)
                assert.strict.deepStrictEqual(r.error.message, 'invalid json: must be a valid JSON text')
                assert.ok(!r.error.message.includes('SECRET'))
            })

            it('fsSrlog: a write failure prints the fixed vocabulary without the path of the log folder (V20)', async function() {
                let fpFile = path.join(fdTmp, 'afile.txt')
                fs.writeFileSync(fpFile, 'x')
                let fdLog = path.join(fpFile, 'sublogs-SECRET-PATH') //檔案之下無法建資料夾
                let calls = []
                let saved = console.log
                console.log = (...a) => {
                    calls.push(a)
                }
                try {
                    let srlog = fsSrlog({ fdLog, useTime: false, useLoc: false })
                    srlog('hello')
                    let t0 = Date.now()
                    while (!calls.some((a) => a[0] === 'fsSrlog: can not save log:') && Date.now() - t0 < 8000) {
                        await new Promise((resolve) => setTimeout(resolve, 20))
                    }
                }
                finally {
                    console.log = saved
                }
                let c = calls.find((a) => a[0] === 'fsSrlog: can not save log:')
                assert.ok(c, JSON.stringify(calls))
                assert.ok(typeof c[1] === 'string' && /^(Error: )?operation failed \(code [A-Z]+\)$/.test(c[1]), String(c[1]))
                assert.ok(!String(c[1]).includes('SECRET-PATH'))
            })

            it('fsDeleteFile / fsRenameFile: the parameter names are fp and fpOld/fpNew (formerly the misspelled pah)', function() {
                let fd = path.join(fdTmp, 'adir')
                fs.mkdirSync(fd)
                assert.strict.deepStrictEqual(fsDeleteFile(fd), { error: 'invalid fp: must be a file or not exist' })
                assert.strict.deepStrictEqual(fsDeleteFile(''), { error: 'invalid fp: must be a non-empty string' })
                assert.strict.deepStrictEqual(fsRenameFile(path.join(fdTmp, 'nope.txt'), path.join(fdTmp, 'n2.txt')), { error: 'invalid fpOld: must be an existing file' })
            })

        })

    })

})
