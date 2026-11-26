import assert from 'assert'
import fs from 'fs'
import path from 'path'
import fsTreeFolder from '../src/fsTreeFolder.mjs'
import fsTreeFolderCore from '../src/fsTreeFolderCore.mjs'
import fsGetFilesInFolder from '../src/fsGetFilesInFolder.mjs'
import fsGetFilesInFolderCore from '../src/fsGetFilesInFolderCore.mjs'
import fsGetFoldersInFolder from '../src/fsGetFoldersInFolder.mjs'
import fsGetFoldersInFolderCore from '../src/fsGetFoldersInFolderCore.mjs'
import { hostileValues, withGetter, partialProxy } from './tools/hostileValues.mjs'


//第663項(排程第492項批11): fs列舉家族同步6函數(fsTreeFolder、fsGetFilesInFolder、fsGetFoldersInFolder與其Core)讀opt之鍵拋錯 → 視為未給(dspec〈輸入參數之檢測機制〉K3、V11)
//  原狀(R-LEVEL-LIMIT-02規則7之已知缺陷): 同步函數讀opt.levelLimit之存取器(或陷阱)拋錯者原樣外拋(含呼叫端所拋之文字); Core讀opt.path、opt.fs、opt.optDbg亦然
//  修後: opt.levelLimit讀取拋錯 → 視為未給, 窮舉全部; opt.fs、opt.path讀取拋錯 → 視為未給, 由相依檢查fail-closed(R-FS-DEPS-01, 同步拋固定訊息), 不轉出呼叫端所拋之文字
//  非同步2函數(fsGetFilesWithHashInFolder、fsTreeFolderWithHash與其Core)讀opt之鍵拋錯一律reject(含安全相關之opt.type, 無效即拒絕不改用預設), 本批不改
//  oracle: 讀取拋錯之opt之結果須同「未給該鍵」之結果; 夾具各名稱逐層相異


describe(`第663項: fs列舉家族同步6函數之opt鍵讀取拋錯視為未給`, function() {

    let fdRoot = path.resolve('./test/_tmp/fsEnumOptRead663')
    let fd = path.join(fdRoot, 't')

    before(function() {
        fs.rmSync(fdRoot, { recursive: true, force: true })
        fs.mkdirSync(path.join(fd, 'a', 'b'), { recursive: true })
        fs.writeFileSync(path.join(fd, 'f1.txt'), 'f1')
        fs.writeFileSync(path.join(fd, 'a', 'f2.txt'), 'f2')
        fs.writeFileSync(path.join(fd, 'a', 'b', 'f3.txt'), 'f3')
    })

    after(function() {
        fs.rmSync(fdRoot, { recursive: true, force: true })
    })

    let SECRET = 'boom' //withGetter、partialProxy之拋出值之訊息
    let real = { fs, path }

    //defs: 名稱、函數、是否為Core(須注入fs、path)
    let pubs = [['fsTreeFolder', fsTreeFolder], ['fsGetFilesInFolder', fsGetFilesInFolder], ['fsGetFoldersInFolder', fsGetFoldersInFolder]]
    let cores = [['fsTreeFolderCore', fsTreeFolderCore], ['fsGetFilesInFolderCore', fsGetFilesInFolderCore], ['fsGetFoldersInFolderCore', fsGetFoldersInFolderCore]]

    //call, 回傳{ threw, msg, r }
    let call = (f, a) => {
        try {
            return { threw: false, r: f(...a) }
        }
        catch (err) {
            return { threw: true, msg: String(err && err.message), r: null }
        }
    }

    //夾具有鑑別力: 限1層與窮舉之結果不同(層數3、各層名稱相異)
    it(`對照(夾具之鑑別力): levelLimit為1與未給之結果不同; 有效之levelLimit仍限定層數`, function() {
        for (let [n, f] of pubs) {
            let all = f(fd, {})
            let one = f(fd, { levelLimit: 1 })
            assert.ok(all.length > one.length, `${n} fixture must separate level 1 from all`)
        }
        for (let [n, f] of cores) {
            let all = f(fd, { ...real })
            let one = f(fd, { ...real, levelLimit: 1 })
            assert.ok(all.length > one.length, `${n} fixture must separate level 1 from all`)
        }
    })

    for (let [n, f] of pubs) {
        it(`${n}: opt.levelLimit之存取器拋錯、或Proxy之get陷阱對該鍵拋錯 → 視為未給(窮舉全部)、不拋錯; 其他鍵照常`, function() {
            let ref = call(f, [fd, {}])
            assert.ok(!ref.threw, `${n} reference`)

            let c1 = call(f, [fd, withGetter({}, 'levelLimit')])
            assert.ok(!c1.threw, `${n} getter levelLimit must not throw`)
            assert.strict.deepStrictEqual(c1.r, ref.r, `${n} getter levelLimit`)

            let c2 = call(f, [fd, partialProxy({}, [], ['levelLimit'])])
            assert.ok(!c2.threw, `${n} proxy levelLimit must not throw`)
            assert.strict.deepStrictEqual(c2.r, ref.r, `${n} proxy levelLimit`)

            //另一無關鍵之存取器拋錯, levelLimit為有效值 → 照常限定層數
            let c3 = call(f, [fd, withGetter({ levelLimit: 1 }, 'unrelatedKeyForTest')])
            assert.ok(!c3.threw, `${n} unrelated getter must not throw`)
            assert.strict.deepStrictEqual(c3.r, f(fd, { levelLimit: 1 }), `${n} unrelated getter`)
        })
    }

    for (let [n, f] of cores) {
        it(`${n}: opt.levelLimit、opt.optDbg之存取器拋錯 → 視為未給(窮舉全部)、不拋錯; opt.fs、opt.path之存取器拋錯 → 視為未給而fail-closed(固定訊息, 不帶呼叫端所拋之文字)`, function() {
            let ref = call(f, [fd, { ...real }])
            assert.ok(!ref.threw, `${n} reference`)

            for (let k of ['levelLimit', 'optDbg']) {
                let c = call(f, [fd, withGetter({ ...real }, k)])
                assert.ok(!c.threw, `${n} getter ${k} must not throw`)
                assert.strict.deepStrictEqual(c.r, ref.r, `${n} getter ${k}`)
            }

            let cp = call(f, [fd, withGetter({ fs }, 'path')])
            assert.ok(cp.threw, `${n} getter path must fail closed`)
            assert.strict.deepStrictEqual(cp.msg, 'invalid opt.path: must be an object providing resolve, basename')
            assert.ok(!cp.msg.includes(SECRET), `${n} path message must not echo the getter text`)

            let cf = call(f, [fd, withGetter({ path }, 'fs')])
            assert.ok(cf.threw, `${n} getter fs must fail closed`)
            assert.ok(/^invalid opt\.fs: must be an object providing /.test(cf.msg), `${n} fs message`)
            assert.ok(!cf.msg.includes(SECRET), `${n} fs message must not echo the getter text`)
        })
    }

    it(`惡意值全集(19種)作opt: 非物件者依既有契約報'invalid opt: must be an object'(同步拋固定訊息), 可判為物件者(讀取鍵才拋錯)不外拋呼叫端之文字`, function() {
        let hv = hostileValues()
        for (let [n, f] of pubs) {
            for (let h of hv) {
                let c = call(f, [fd, h.value])
                if (c.threw) {
                    assert.ok(c.msg === 'invalid opt: must be an object', `${n} ${h.name}: only the fixed migration message may be thrown`)
                }
            }
        }
    })

})
