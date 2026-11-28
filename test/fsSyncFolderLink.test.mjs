import assert from 'assert'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsSyncFolderCore from '../src/fsSyncFolderCore.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import makeMemFs from './tools/memPathFs.mjs'
import { makeLink, snapshot, removeSandbox } from './tools/linkSandbox.mjs'


//規則: R-FS-SYNC-LINK-01(sgud/rule/rulebook_fssync.md)
//  1. 差異同步於任何刪除與寫入之前, 本次要刪除與寫入之各目標路徑自目標資料夾之下一段起(目標資料夾本身不查)逐段lstat, 任一段(含目標本身)為連結(符號連結、Windows之junction)即整批reject固定訊息
//  2. 目標不是資料夾(不存在、為檔案或本身為連結)而整份複製時, 來源含任何連結即reject固定訊息, 寫入目標之各對應路徑同第1點, 皆先於任何寫入
//  3. lstat回ENOENT、ENOTDIR視為該段不存在, 其他錯誤reject
//  4. 判定所需之lstatSync為必要方法(R-FS-DEPS-01), 缺者於任何刪寫前reject
let MSG_TAR = 'invalid sync target: must not be or cross a link inside fdTar'
let MSG_SRC = 'invalid fdSrc: must not contain a link'

//run, 呼叫並回報結果(resolve值或reject值), 不讓reject外拋
let run = (pm) => pm.then((r) => ({ state: 'resolved', value: r }), (e) => ({ state: 'rejected', value: e }))
let rejected = (value) => ({ state: 'rejected', value })
let resolved = (value) => ({ state: 'resolved', value })

//w, 寫檔(上層資料夾不存在則建立)
let w = (fp, c) => {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    fs.writeFileSync(fp, c)
}


describe(`fsSyncFolder 實體檔案系統: 目標內之目錄連結與來源之連結(Windows之junction; 其他平台為符號連結)(R-FS-SYNC-LINK-01)`, function() {

    let root = path.resolve('./test/_tmp/fsSyncFolderLink')
    let n = 0

    //box, 每案專屬之沙盒, 回傳組路徑函數
    let box = () => {
        n++
        let b = path.join(root, `c${n}`)
        fs.mkdirSync(b, { recursive: true })
        return (...a) => path.join(b, ...a)
    }

    before(function() {
        removeSandbox(root)
    })

    after(function() {
        removeSandbox(root)
    })

    //swapInject, 列舉完成後(落點核對第一次呼叫path.relative時)執行fnSwap一次, 模擬列舉後目標被置換
    let swapInject = (p, fnSwap) => {
        let done = false
        return {
            ...p,
            relative: (a, b) => {
                if (!done) {
                    done = true
                    fnSwap()
                }
                return p.relative(a, b)
            },
        }
    }

    it(`寫入經過目標內之連結(新增與變更之檔案): reject固定訊息, 連結指向之資料夾與目標資料夾皆無任何變動(規則1)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a-new')
        w(J('src', 'link', 'x'), 'FROM-SRC')
        w(J('src', 'link', 'n'), 'NEW')
        w(J('tar', 'a'), 'a-old')
        w(J('tar', 'old-dir', 'f'), 'f') //可刪除之多出資料夾與檔案: 只有寫入經過連結時亦不得先做刪除
        w(J('tar', 'old-file'), 'o')
        makeLink(J('outside'), J('tar', 'link'))
        let o = snapshot(J('outside'))
        let t = snapshot(J('tar'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), o)
        assert.deepStrictEqual(snapshot(J('tar')), t) //全部核對先於任何刪除與寫入
    })

    it(`連結位於較深層(tar/p/q/link): 同樣reject, 指向處無變動(規則1)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'p', 'q', 'link', 'x'), 'FROM-SRC')
        fs.mkdirSync(J('tar', 'p', 'q'), { recursive: true })
        makeLink(J('outside'), J('tar', 'p', 'q', 'link'))
        let o = snapshot(J('outside'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), o)
    })

    it(`目標多出之連結(來源無): 於任何刪除之前reject, 排在其前之多出資料夾仍在(規則1)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a')
        w(J('tar', 'a'), 'a')
        w(J('tar', 'aaa', 'f'), 'extra')
        makeLink(J('outside'), J('tar', 'zlink'))
        let t = snapshot(J('tar'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('tar')), t)
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`列舉後目標內資料夾被換成連結, 刪除其下之檔案與資料夾: reject, 連結指向處無任何刪除(規則1)`, async function() {
        let J = box()
        w(J('outside', 'f'), 'OUT-F')
        w(J('outside', 'sub', 'g'), 'OUT-G')
        w(J('outside', 'keep'), 'k')
        w(J('src', 'd', 'keep'), 'k')
        w(J('tar', 'd', 'keep'), 'k')
        w(J('tar', 'd', 'f'), 'f')
        w(J('tar', 'd', 'sub', 'g'), 'g')
        let o = snapshot(J('outside'))
        let p2 = swapInject(path, () => {
            fs.rmSync(J('tar', 'd'), { recursive: true })
            makeLink(J('outside'), J('tar', 'd'))
        })
        let r = await run(fsSyncFolder(J('src'), J('tar'), { path: p2 }))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), o)
    })

    it(`一般資料夾與檔案照常; 目標內之連結未被任何刪除或寫入經過(來源同名為空資料夾)時照常同步, 指向處無變動`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a-new')
        w(J('src', 'd', 'e'), 'e')
        fs.mkdirSync(J('src', 'link'))
        w(J('tar', 'a'), 'a-old')
        w(J('tar', 'd', 'old'), 'old')
        makeLink(J('outside'), J('tar', 'link'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, resolved(true))
        assert.deepStrictEqual(snapshot(J('tar')), ['f a=a-new', 'd d', 'f d/e=e', 'l link'])
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`目標資料夾本身為使用者給定之連結: 允許, 依既有行為整份複製且不刪除多出之項目`, async function() {
        let J = box()
        w(J('real', 'old'), 'old')
        w(J('src', 'a'), 'a')
        w(J('src', 'd', 'e'), 'e')
        makeLink(J('real'), J('tar'))
        let r1 = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r1, resolved(true))
        assert.deepStrictEqual(snapshot(J('real')), ['f a=a', 'd d', 'f d/e=e', 'f old=old'])
        let r2 = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r2, resolved(true))
        assert.deepStrictEqual(snapshot(J('real')), ['f a=a', 'd d', 'f d/e=e', 'f old=old'])
    })

    it(`目標資料夾本身為連結且其內另有連結, 來源寫到該處: reject, 兩處皆無任何寫入(規則2)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        fs.mkdirSync(J('real'))
        makeLink(J('outside'), J('real', 'sub'))
        w(J('src', 'a'), 'a')
        w(J('src', 'sub', 'x'), 'FROM-SRC')
        makeLink(J('real'), J('tar'))
        let t = snapshot(J('real'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
        assert.deepStrictEqual(snapshot(J('real')), t)
    })

    it(`目標資料夾本身為連結, 其內之連結未被來源經過: 照常整份複製`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        fs.mkdirSync(J('real'))
        makeLink(J('outside'), J('real', 'other'))
        w(J('src', 'a'), 'a')
        makeLink(J('real'), J('tar'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, resolved(true))
        assert.deepStrictEqual(snapshot(J('real')), ['f a=a', 'l other'])
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`目標資料夾本身為連結且以分隔字元結尾: 其內之連結仍受檢(規則1、2)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        fs.mkdirSync(J('real'))
        makeLink(J('outside'), J('real', 'sub'))
        w(J('src', 'sub', 'x'), 'FROM-SRC')
        makeLink(J('real'), J('tar'))
        let r = await run(fsSyncFolder(J('src'), `${J('tar')}${path.sep}`))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`整份複製途中才出現經過目標內連結之路徑(來源位於目標指向處之內): 該次建立與寫入前reject, 指向處無任何寫入(規則2)`, async function() {
        let J = box()
        w(J('outside', 'k'), 'k')
        w(J('P', 's', 's', 'z', 'n', 'm', 'f'), 'FROM-SRC') //先複製之s寫入來源內之z, 使輪到z時出現n
        fs.mkdirSync(J('P', 's', 'z'))
        fs.mkdirSync(J('P', 'z'))
        makeLink(J('outside'), J('P', 'z', 'n'))
        makeLink(J('P'), J('tar'))
        let r = await run(fsSyncFolder(J('P', 's'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), ['f k=k']) //資料夾m與檔案f皆未建到指向處
    })

    //fsPriv, 模擬有建立符號連結權限之環境(Windows之symlinkSync未指定型別時需開發人員模式或系統管理員): 以junction代替
    let fsPriv = () => ({ ...fs, symlinkSync: (to, fp) => fs.symlinkSync(to, fp, 'junction') })

    it(`整份複製而來源含連結: reject固定訊息, 目標資料夾不建立; 下一輪來源同名處換成真資料夾後之同步不越界(規則2)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a')
        makeLink(J('outside'), J('src', 'link'))
        let r1 = await run(fsSyncFolder(J('src'), J('tar'), { fs: fsPriv() }))
        assert.deepStrictEqual(r1, rejected(MSG_SRC))
        assert.strictEqual(fs.existsSync(J('tar')), false)
        fs.rmdirSync(J('src', 'link')) //只移除連結本身
        w(J('src', 'link', 'x'), 'FROM-SRC')
        let r2 = await run(fsSyncFolder(J('src'), J('tar'), { fs: fsPriv() }))
        assert.deepStrictEqual(r2, resolved(true))
        assert.deepStrictEqual(snapshot(J('tar')), ['f a=a', 'd link', 'f link/x=FROM-SRC'])
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`整份複製而來源深層含連結: reject, 排在其前之檔案亦不寫入(規則2)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a')
        w(J('src', 'd', 'e'), 'e')
        makeLink(J('outside'), J('src', 'd', 'zlink'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_SRC))
        assert.strictEqual(fs.existsSync(J('tar')), false)
    })

    it(`目標內留有指向外部之連結(舊版整份複製所建者), 來源同名處為真資料夾: reject, 不越界(規則1)`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a')
        w(J('src', 'link', 'x'), 'FROM-SRC')
        w(J('tar', 'a'), 'a')
        makeLink(J('outside'), J('tar', 'link'))
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`差異同步而來源含目錄連結(行為未改): 不寫入連結指向處, 指向處無變動`, async function() {
        let J = box()
        w(J('outside', 'x'), 'OUT')
        w(J('src', 'a'), 'a-new')
        makeLink(J('outside'), J('src', 'link'))
        w(J('tar', 'a'), 'a-old')
        w(J('tar', 'link', 'y'), 'y')
        let r = await run(fsSyncFolder(J('src'), J('tar')))
        assert.deepStrictEqual(r, resolved(true))
        assert.strictEqual(fs.readFileSync(J('tar', 'a'), 'utf8'), 'a-new')
        assert.deepStrictEqual(snapshot(J('outside')), ['f x=OUT'])
    })

    it(`判定連結時lstat回非不存在類之錯誤: reject固定詞彙加錯誤碼, 不做任何刪除與寫入(規則3)`, async function() {
        let J = box()
        w(J('src', 'a'), 'a-new')
        w(J('tar', 'a'), 'a-old')
        w(J('tar', 'aaa', 'f'), 'f') //資料夾之刪除先於檔案之刪除; 判定須先於任何刪除
        w(J('tar', 'extra'), 'extra')
        let armed = false
        let p2 = swapInject(path, () => {
            armed = true
        })
        let fs2 = {
            ...fs,
            lstatSync: (fp, ...args) => {
                if (armed && fp === J('tar', 'extra')) {
                    throw Object.assign(new Error('denied'), { code: 'EPERM' })
                }
                return fs.lstatSync(fp, ...args)
            },
        }
        let t = snapshot(J('tar'))
        let r = await run(fsSyncFolder(J('src'), J('tar'), { path: p2, fs: fs2 }))
        assert.deepStrictEqual(r, rejected('operation failed (code EPERM)'))
        assert.deepStrictEqual(snapshot(J('tar')), t)
    })

    it(`注入之fs缺lstatSync: 兩分支皆於任何刪除與寫入之前reject相依無效(規則4)`, async function() {
        let J = box()
        w(J('src', 'a'), 'a-new')
        w(J('tar', 'a'), 'a-old')
        w(J('tar', 'extra'), 'extra')
        let fs2 = { ...fs, lstatSync: undefined }
        let t = snapshot(J('tar'))
        for (let fdTar of [J('tar'), J('tar-new')]) {
            let r = await run(fsSyncFolder(J('src'), fdTar, { fs: fs2 }))
            assert.strictEqual(r.state, 'rejected')
            assert.match(r.value, /^invalid opt\.fs: must be an object providing .*lstatSync/)
        }
        assert.deepStrictEqual(snapshot(J('tar')), t)
        assert.strictEqual(fs.existsSync(J('tar-new')), false)
    })

})


describe(`fsSyncFolderCore posix(記憶體fs): 符號連結(R-FS-SYNC-LINK-01)`, function() {

    let px = path.posix
    let SRC = '/r/temp'
    let TAR = '/r/storage'
    let sync = (m, o = {}) => run(fsSyncFolderCore(SRC, TAR, { path: px, fs: m.fs, crypto, ...o }))

    //writeOps, 寫入與刪除之紀錄(略去mkdir)
    let writeOps = (m) => m.ops.filter((v) => !v.startsWith('mkdir '))

    //check, reject固定訊息且記憶體fs無任何變動
    let checkRejected = async (m, msg) => {
        let s = m.snapshot()
        let r = await sync(m)
        assert.deepStrictEqual(r, rejected(msg))
        assert.deepStrictEqual(m.ops, [])
        assert.deepStrictEqual(m.snapshot(), s)
    }

    it(`目標內之目錄符號連結, 來源寫到其下: reject, 指向處與目標皆無變動(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a': 'new', '/r/temp/link/x': 'src-x', '/r/temp/link/n': 'n', '/r/storage/a': 'old' }, links: { '/r/storage/link': '/r/outside' } })
        await checkRejected(m, MSG_TAR)
    })

    it(`列舉後目標內之檔案被換成指向外部之檔案符號連結, 寫入該檔: reject, 外部檔不被覆寫(規則1含目標本身)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outfile': 'OUT', '/r/temp/f': 'src-f', '/r/storage/f': 'old' } })
        let done = false
        let p2 = {
            ...px,
            relative: (a, b) => {
                if (!done) {
                    done = true
                    m.setLink('/r/storage/f', '/r/outfile')
                }
                return px.relative(a, b)
            },
        }
        let r = await sync(m, { path: p2 })
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(m.ops, [])
        assert.strictEqual(m.read('/r/outfile'), 'OUT')
    })

    it(`任一端之檔案符號連結: 沿既有行為於列舉雜湊時reject, 無任何寫入與刪除(行為保持)`, async function() {
        for (let links of [{ '/r/storage/f': '/r/outfile' }, { '/r/temp/f2': '/r/outfile' }]) {
            let m = makeMemFs(px, { files: { '/r/outfile': 'OUT', '/r/temp/f': 'src-f', '/r/storage/extra': 'e' }, links })
            await checkRejected(m, 'invalid fp: must be an existing file')
        }
    })

    it(`相對指向之連結(storage/a/link -> ../../outside), 位於第二層: reject(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a/link/x': 'src-x' }, dirs: ['/r/storage/a'], links: { '/r/storage/a/link': '../../outside' } })
        await checkRejected(m, MSG_TAR)
    })

    it(`同名之段於不同上層分屬一般資料夾與連結(a/n為資料夾、b/n為連結): 逐路徑判定而reject(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a/n/x': '1', '/r/temp/b/n/x': '2' }, dirs: ['/r/storage/a/n', '/r/storage/b'], links: { '/r/storage/b/n': '/r/outside' } })
        await checkRejected(m, MSG_TAR)
    })

    it(`目標多出之目錄符號連結(來源無): 於任何刪除之前reject, 排在其前之多出項目仍在(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a': 'a', '/r/storage/a': 'a', '/r/storage/aaa/f': 'extra', '/r/storage/b': 'e' }, links: { '/r/storage/zl': '/r/outside' } })
        await checkRejected(m, MSG_TAR)
    })

    it(`列舉後目標內資料夾被換成符號連結, 刪除其下之檔案與資料夾: reject, 指向處無任何刪除(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/f': 'OUT-F', '/r/outside/sub/g': 'OUT-G', '/r/temp/d/keep': 'k', '/r/storage/d/keep': 'k', '/r/storage/d/f': 'f', '/r/storage/d/sub/g': 'g' } })
        let done = false
        let p2 = {
            ...px,
            relative: (a, b) => {
                if (!done) {
                    done = true
                    m.setLink('/r/storage/d', '/r/outside')
                }
                return px.relative(a, b)
            },
        }
        let outside = m.outsideOf(TAR)
        let r = await sync(m, { path: p2 })
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(m.ops, [])
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
    })

    it(`目標內之連結未被任何刪除或寫入經過(來源同名為空資料夾): 照常, 只動其他項目, 指向處無變動`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/g': 'g' }, dirs: ['/r/temp/link', '/r/storage'], links: { '/r/storage/link': '/r/outside' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, resolved(true))
        assert.deepStrictEqual(writeOps(m), ['write /r/storage/g'])
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.strictEqual(m.isLink('/r/storage/link'), true)
    })

    it(`一般巢狀同步(含檔案換成資料夾、資料夾換成檔案): 照常(行為保持)`, async function() {
        let m = makeMemFs(px, { files: { '/r/temp/a/x': 'a-x', '/r/temp/b': 'b-file', '/r/temp/c/d/e': 'e', '/r/storage/a': 'a-file', '/r/storage/b/y': 'b-y', '/r/storage/c/d/e': 'old' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, resolved(true))
        assert.strictEqual(m.read('/r/storage/a/x'), 'a-x')
        assert.strictEqual(m.read('/r/storage/b'), 'b-file')
        assert.strictEqual(m.read('/r/storage/c/d/e'), 'e')
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
    })

    it(`整份複製(目標不存在)而來源含目錄或檔案符號連結: reject固定訊息, 無任何寫入(規則2)`, async function() {
        for (let [fp, to] of [['/r/temp/link', '/r/outside'], ['/r/temp/d/e/fl', '/r/outfile']]) {
            let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/outfile': 'OUT', '/r/temp/a': 'a', '/r/temp/d/e/b': 'b' }, links: { [fp]: to } })
            await checkRejected(m, MSG_SRC)
        }
    })

    it(`整份複製來源含連結之後, 下一輪來源同名處換成真資料夾: 同步不越界(規則2)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a': 'a' }, links: { '/r/temp/link': '/r/outside' } })
        let r1 = await sync(m)
        assert.deepStrictEqual(r1, rejected(MSG_SRC))
        m.fs.unlinkSync('/r/temp/link')
        m.fs.mkdirSync('/r/temp/link')
        let s = m.fs.createWriteStream('/r/temp/link/x')
        await new Promise((resolve) => s.end('FROM-SRC', resolve))
        let outside = m.outsideOf(TAR)
        let r2 = await sync(m)
        assert.deepStrictEqual(r2, resolved(true))
        assert.strictEqual(m.read('/r/storage/link/x'), 'FROM-SRC')
        assert.strictEqual(m.isLink('/r/storage/link'), false)
        assert.deepStrictEqual(m.outsideOf(TAR).filter((v) => v.includes('/r/outside')), outside.filter((v) => v.includes('/r/outside')))
    })

    it(`整份複製而目標資料夾本身為連結: 其內之連結(任一層)受檢, reject且無任何寫入(規則2)`, async function() {
        for (let [inner, src] of [['/r/real/sub', '/r/temp/sub/x'], ['/r/real/p/sub', '/r/temp/p/sub/x'], ['/r/real/f', '/r/temp/f']]) {
            let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a': 'a', [src]: 'src' }, dirs: ['/r/real/p'], links: { '/r/storage': '/r/real', [inner]: inner.endsWith('f') ? '/r/outside/x' : '/r/outside' } })
            await checkRejected(m, MSG_TAR)
        }
    })

    it(`整份複製途中才出現經過目標內符號連結之寫檔(來源位於目標指向處之內): 寫檔前reject, 指向處無任何寫入(規則2)`, async function() {
        //來源/r/P/s: 先複製s而寫入/r/P/s/z/n/f(來源內), 輪到z時列舉出n, 其目標/r/P/z/n為指向外部之連結
        let m = makeMemFs(px, { files: { '/r/outside/k': 'k', '/r/P/s/s/z/n/f': 'FROM-SRC' }, dirs: ['/r/P/s/z', '/r/P/z'], links: { '/r/storage': '/r/P', '/r/P/z/n': '/r/outside' } })
        let r = await run(fsSyncFolderCore('/r/P/s', TAR, { path: px, fs: m.fs, crypto }))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(m.snapshot().filter((v) => /^[df] \/r\/outside/.test(v)), ['d /r/outside', 'f /r/outside/k=k'])
    })

    it(`整份複製途中來源項目變成符號連結: 不建到目標, reject來源訊息(規則2)`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/a': 'a', '/r/temp/b': 'b' } })
        let fs2 = {
            ...m.fs,
            createReadStream: (fp) => {
                if (fp === '/r/temp/a') {
                    m.setLink('/r/temp/b', '/r/outside')
                }
                return m.fs.createReadStream(fp)
            },
        }
        let r = await run(fsSyncFolderCore(SRC, TAR, { path: px, fs: fs2, crypto }))
        assert.deepStrictEqual(r, rejected(MSG_SRC))
        assert.strictEqual(m.has('/r/storage/b'), false)
    })

    it(`整份複製之事前走訪發生錯誤: 固定詞彙加錯誤碼reject, 非Error之值同複製失敗之轉換, 無任何寫入(規則3)`, async function() {
        for (let [thrown, want] of [[Object.assign(new Error('denied'), { code: 'EPERM' }), 'operation failed (code EPERM)'], ['', 'unknown error'], [null, 'null']]) {
            for (let fn of ['readdirSync', 'lstatSync']) {
                let m = makeMemFs(px, { files: { '/r/temp/a': 'a', '/r/temp/d/e': 'e', '/r/real/old': 'o' }, links: { '/r/storage': '/r/real' } }) //a排在d之前: 走訪須於寫入a之前即失敗
                let target = fn === 'readdirSync' ? '/r/temp/d' : '/r/storage/d' //來源子資料夾之列舉、目標對應路徑之判定
                let fs2 = {
                    ...m.fs,
                    [fn]: (fp) => {
                        if (fp === target) {
                            throw thrown
                        }
                        return m.fs[fn](fp)
                    },
                }
                let r = await run(fsSyncFolderCore(SRC, TAR, { path: px, fs: fs2, crypto }))
                assert.deepStrictEqual(r, rejected(want), `${fn} ${want}`)
                assert.deepStrictEqual(m.ops, [])
            }
        }
    })

    it(`差異同步而目標資料夾本身為連結(路徑以分隔字元結尾, lstat跟進): 允許, 照常刪寫其指向之資料夾`, async function() {
        let m = makeMemFs(px, { files: { '/r/real/old': 'o', '/r/temp/a': 'a' }, links: { '/r/storage': '/r/real' } })
        let r = await run(fsSyncFolderCore(SRC, `${TAR}/`, { path: px, fs: m.fs, crypto }))
        assert.deepStrictEqual(r, resolved(true))
        assert.strictEqual(m.read('/r/real/a'), 'a')
        assert.strictEqual(m.has('/r/real/old'), false)
    })

    it(`整份複製而目標資料夾本身為連結: 允許(只檢其內), 寫入其指向之資料夾`, async function() {
        let m = makeMemFs(px, { files: { '/r/real/old': 'old', '/r/temp/a': 'a', '/r/temp/d/e': 'e' }, links: { '/r/storage': '/r/real' } })
        let r = await sync(m)
        assert.deepStrictEqual(r, resolved(true))
        assert.strictEqual(m.read('/r/real/a'), 'a')
        assert.strictEqual(m.read('/r/real/d/e'), 'e')
        assert.strictEqual(m.read('/r/real/old'), 'old')
    })

    it(`整份複製而目標為既有檔案(上層非資料夾, lstat回ENOTDIR): 視為不存在, 結果同原行為(規則3)`, async function() {
        let m = makeMemFs(px, { files: { '/r/storage': 'a-file' }, dirs: ['/r/temp/only-folder'] })
        let r = await sync(m)
        assert.deepStrictEqual(r, resolved(true))
    })

    it(`對外函數fsSyncFolder經opt.path、opt.fs注入: 同受檢核`, async function() {
        let m = makeMemFs(px, { files: { '/r/outside/x': 'OUT', '/r/temp/link/x': 'src' }, dirs: ['/r/storage'], links: { '/r/storage/link': '/r/outside' } })
        let r = await run(fsSyncFolder(SRC, TAR, { path: px, fs: m.fs }))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(m.ops, [])
    })

})


describe(`fsSyncFolderCore Windows語意(記憶體fs): 目錄連結(R-FS-SYNC-LINK-01)`, function() {

    let wn = path.win32

    it(`連結下之寫入: reject, 指向處無變動(規則1)`, async function() {
        let m = makeMemFs(wn, { files: { 'C:\\r\\outside\\x': 'OUT', 'C:\\r\\temp\\p\\link\\x': 'src' }, dirs: ['C:\\r\\storage\\p'], links: { 'C:\\r\\storage\\p\\link': 'C:\\r\\outside' } })
        let s = m.snapshot()
        let r = await run(fsSyncFolderCore('C:\\r\\temp', 'C:\\r\\storage', { path: wn, fs: m.fs, crypto }))
        assert.deepStrictEqual(r, rejected(MSG_TAR))
        assert.deepStrictEqual(m.snapshot(), s)
    })

})
