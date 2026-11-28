import assert from 'assert'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import fsSyncFolderCore from '../src/fsSyncFolderCore.mjs'
import fsSyncFolder from '../src/fsSyncFolder.mjs'
import makeMemFs from './tools/memPathFs.mjs'


//規則: R-FS-SYNC-PATH-01(sgud/rule/rulebook_fs.md)
//  1. 比對用之相對路徑僅於path.sep為反斜線時把反斜線換成'/'; 其他平台之反斜線為合法之檔名字元, 原樣保留
//  2. 將刪除或寫入之目標路徑須嚴格位於目標資料夾內(path.relative結果不為空、非'..'、不以'..'加分隔字元起首、非絕對路徑), 任一不合即reject固定訊息(不帶路徑), 先於任何刪除與寫入
//  3. 注入之path須另提供relative、isAbsolute(R-FS-DEPS-01)
let MSG = 'invalid sync target: must be strictly inside fdTar'

//run, 呼叫並回報結果(resolve值或reject值), 不讓reject外拋
let run = (pm) => pm.then((r) => ({ state: 'resolved', value: r }), (e) => ({ state: 'rejected', value: e }))

let px = path.posix
let wn = path.win32


describe(`fsSyncFolderCore posix: 反斜線為檔名字元(R-FS-SYNC-PATH-01)`, function() {

    let SRC = '/r/temp'
    let TAR = '/r/storage'
    let sync = (m) => run(fsSyncFolderCore(SRC, TAR, { path: px, fs: m.fs, crypto }))

    it(`目標端多出之字面檔'..\\item1': 刪除目標內之該檔, 目標資料夾外之同名路徑不受影響(規則1: posix之反斜線原樣保留)`, async function() {
        let m = makeMemFs(px, { files: { '/r/item1': 'keep', '/r/storage/..\\item1': 'x', '/r/storage/a': 'a', '/r/temp/a': 'a' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside) //目標資料夾外無任何變動
        assert.deepStrictEqual(m.ops, ['unlink /r/storage/..\\item1'])
        assert.strictEqual(m.has('/r/storage/..\\item1'), false)
    })

    it(`來源端新增之字面檔'..\\item2': 寫入目標內之同名字面檔, 目標資料夾外之同名路徑不受影響(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/item2': 'outside', '/r/temp/..\\item2': 'inside', '/r/temp/a': 'a', '/r/storage/a': 'a' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.deepStrictEqual(m.ops, ['write /r/storage/..\\item2'])
        assert.strictEqual(m.read('/r/storage/..\\item2'), 'inside')
    })

    it(`目標端多出之字面資料夾'..\\vd'(含檔): 刪除目標內之該資料夾, 目標資料夾外之資料夾'vd'與其內容不受影響(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/vd/f': 'keep', '/r/storage/..\\vd/f': 'x', '/r/temp/a': 'a', '/r/storage/a': 'a' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.strictEqual(m.has('/r/storage/..\\vd'), false)
        assert.strictEqual(m.has('/r/storage/..\\vd/f'), false)
        assert.ok(m.ops.every((v) => v.includes(' /r/storage/')))
    })

    it(`兩端同名而內容不同之字面檔: 以來源內容覆寫目標內之該檔, 目標資料夾外之同名路徑不受影響(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/same': 'outside', '/r/temp/..\\same': 'new-content', '/r/storage/..\\same': 'old' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.deepStrictEqual(m.ops, ['write /r/storage/..\\same'])
        assert.strictEqual(m.read('/r/storage/..\\same'), 'new-content')
    })

    it(`來源同時有'a/b'(資料夾a內之檔b)與字面檔'a\\b': 為不同之兩檔, 各自同步, 再同步回false(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/temp/a/b': 'sub', '/r/temp/a\\b': 'literal', '/r/storage/z': 'z', '/r/temp/z': 'z' } })
        let r1 = await sync(m)
        assert.deepStrictEqual(r1, { state: 'resolved', value: true })
        assert.strictEqual(m.read('/r/storage/a/b'), 'sub')
        assert.strictEqual(m.read('/r/storage/a\\b'), 'literal')
        let r2 = await sync(m)
        assert.deepStrictEqual(r2, { state: 'resolved', value: false })
    })

    it(`多層與巢狀之字面反斜線名稱('..\\..\\x'、'sub/..\\..\\y'): 全部只動目標資料夾內(規則1)`, async function() {
        let m = makeMemFs(px, {
            files: {
                '/x': 'root-x',
                '/r/x': 'r-x',
                '/r/y': 'r-y',
                '/r/temp/a': 'a',
                '/r/temp/sub/..\\..\\y': 'src-y',
                '/r/storage/a': 'a',
                '/r/storage/..\\..\\x': 'tar-x',
            },
        })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.strictEqual(m.read('/r/storage/sub/..\\..\\y'), 'src-y')
        assert.strictEqual(m.has('/r/storage/..\\..\\x'), false)
    })

    it(`目標資料夾不存在而整份複製: 字面名稱照原樣複製(行為保持)`, async function() {
        let m = makeMemFs(px, { files: { '/r/temp/..\\w': 'w', '/r/temp/d/e': 'e' } })
        let outside = m.outsideOf(TAR)
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.strictEqual(m.read('/r/storage/..\\w'), 'w')
        assert.strictEqual(m.read('/r/storage/d/e'), 'e')
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
    })

    it(`以'..'起首之合法名稱('..a'、'...'、'..d/f')於目標資料夾內: 照常同步, 不視為越界(規則2)`, async function() {
        let m = makeMemFs(px, { files: { '/r/temp/..a': '1', '/r/temp/...': '2', '/r/temp/..d/f': '3', '/r/storage/..old': 'o' } })
        let r1 = await sync(m)
        assert.deepStrictEqual(r1, { state: 'resolved', value: true })
        assert.strictEqual(m.read('/r/storage/..a'), '1')
        assert.strictEqual(m.read('/r/storage/...'), '2')
        assert.strictEqual(m.read('/r/storage/..d/f'), '3')
        assert.strictEqual(m.has('/r/storage/..old'), false)
        let r2 = await sync(m)
        assert.deepStrictEqual(r2, { state: 'resolved', value: false })
    })

    it(`對外函數fsSyncFolder經opt.path、opt.fs注入posix實作: 同上, 目標資料夾外不受影響(規則1)`, async function() {
        let m = makeMemFs(px, { files: { '/r/item1': 'keep', '/r/storage/..\\item1': 'x', '/r/temp/a': 'a', '/r/storage/a': 'a' } })
        let outside = m.outsideOf(TAR)
        let r = await run(fsSyncFolder(SRC, TAR, { path: px, fs: m.fs }))
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.deepStrictEqual(m.ops, ['unlink /r/storage/..\\item1'])
    })

})


describe(`fsSyncFolderCore 落點核對: 刪除與寫入須嚴格位於目標資料夾內(R-FS-SYNC-PATH-01)`, function() {

    //以win32語意之記憶體fs, 由listExtra模擬自訂fs於列舉時回傳不合平台檔名規則之名稱(含反斜線、'..'、另一磁碟機), 解析後落在目標資料夾外; 內建fs在Windows上不可能列出這類名稱, 本核對為其他轉換或自訂fs之防線
    let SRC = 'C:\\r\\temp'
    let TAR = 'C:\\r\\tar'
    let base = () => ({
        'C:\\r\\temp\\keep': 'k',
        'C:\\r\\tar\\keep': 'k',
        'C:\\r\\tar\\extra': 'e', //extra為合法之多出項目(核對通過時應刪除)
        'C:\\r\\temp\\new': 'n', //合法之新增項目(核對通過時應寫入)
    })
    let sync = (m) => run(fsSyncFolderCore(SRC, TAR, { path: wn, fs: m.fs, crypto }))

    //expectRejected, 越界: reject固定訊息(不帶路徑), 且任何刪除與寫入皆未發生(含其他合法之刪除與寫入)
    let expectRejected = async (m) => {
        let before = m.snapshot()
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'rejected', value: MSG })
        assert.deepStrictEqual(m.ops, [])
        assert.deepStrictEqual(m.snapshot(), before)
    }

    it(`對照: 不含越界名稱時, 刪除extra、寫入new(落點核對不擋合法項目)`, async function() {
        let m = makeMemFs(wn, { files: base() })
        let r = await sync(m)
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.ops, ['unlink C:\\r\\tar\\extra', 'write C:\\r\\tar\\new'])
    })

    it(`目標端列舉出解析到目標外之檔案名稱('..\\item1'): reject, 不刪除任何項目(規則2: 刪除之目標)`, async function() {
        let m = makeMemFs(wn, { files: { ...base(), 'C:\\r\\item1': 'keep' }, listExtra: { 'C:\\r\\tar': ['..\\item1'] } })
        await expectRejected(m)
    })

    it(`目標端列舉出解析到目標外之資料夾名稱('..\\vd'): reject, 不刪除任何資料夾(規則2: 刪除之目標)`, async function() {
        let m = makeMemFs(wn, { files: { ...base(), 'C:\\r\\vd\\f': 'keep' }, listExtra: { 'C:\\r\\tar': ['..\\vd'] } })
        await expectRejected(m)
    })

    it(`來源端列舉出解析到來源外、對應目標外之名稱('..\\item2'): reject, 不寫入任何檔案(規則2: 寫入之目標)`, async function() {
        let m = makeMemFs(wn, { files: { ...base(), 'C:\\r\\item2': 'keep' }, listExtra: { 'C:\\r\\temp': ['..\\item2'] } })
        await expectRejected(m)
    })

    it(`目標端列舉出解析到另一磁碟機之名稱('D:\\x'): path.relative回絕對路徑, reject(規則2: 刪除之目標)`, async function() {
        let m = makeMemFs(wn, { files: { ...base(), 'D:\\x': 'keep' }, listExtra: { 'C:\\r\\tar': ['D:\\x'] } })
        await expectRejected(m)
    })

    it(`來源端列舉出解析到另一磁碟機之名稱('D:\\y'): reject, 不寫入任何檔案(規則2: 寫入之目標)`, async function() {
        let m = makeMemFs(wn, { files: { ...base(), 'D:\\y': 'keep' }, listExtra: { 'C:\\r\\temp': ['D:\\y'] } })
        await expectRejected(m)
    })

    it(`解析到目標資料夾本身之資料夾名稱('x\\..'): 非嚴格位於其內, reject, 目標資料夾不得被刪除(規則2)`, async function() {
        let m = makeMemFs(wn, { files: { 'C:\\r\\temp\\keep': 'k', 'C:\\r\\temp\\new': 'n' }, dirs: [TAR], listExtra: { 'C:\\r\\tar': ['x\\..'] } })
        await expectRejected(m)
    })

    it(`posix語意: 目標端列舉出解析到目標資料夾本身之名稱('x/..'): reject, 目標資料夾不得被刪除(規則2於各平台皆成立)`, async function() {
        let m = makeMemFs(px, { files: { '/r/temp/keep': 'k' }, dirs: ['/r/storage'], listExtra: { '/r/storage': ['x/..'] } })
        let before = m.snapshot()
        let r = await run(fsSyncFolderCore('/r/temp', '/r/storage', { path: px, fs: m.fs, crypto }))
        assert.deepStrictEqual(r, { state: 'rejected', value: MSG })
        assert.deepStrictEqual(m.ops, [])
        assert.deepStrictEqual(m.snapshot(), before)
    })

    it(`兩端同鍵而內容不同(變更)且目標落在目標資料夾外: reject, 不寫入(規則2: 寫入之目標含變更項)`, async function() {
        //同層而字首同為temp、tar之資料夾: 去掉各自字首後兩端得同一相對路徑, 屬變更項, 其目標在目標資料夾外
        let m = makeMemFs(wn, {
            files: { 'C:\\r\\temp..\\x': '1', 'C:\\r\\tar..\\x': '22' },
            dirs: [SRC, TAR],
            listExtra: { 'C:\\r\\temp': ['..\\temp..\\x'], 'C:\\r\\tar': ['..\\tar..\\x'] },
        })
        await expectRejected(m)
    })

    it(`目標端列舉出UNC名稱: 核對之字串即操作之字串, 目標在目標資料夾外即reject(規則2、3)`, async function() {
        let m = makeMemFs(wn, { files: { ...base(), '\\\\srv\\share\\x': 'keep' }, listExtra: { 'C:\\r\\tar': ['\\\\srv\\share\\x'] } })
        await expectRejected(m)
    })

    it(`注入之path缺relative或isAbsolute: 相依無效, reject固定訊息且不做任何刪除與寫入(規則3, R-FS-DEPS-01)`, async function() {
        let want = 'invalid opt.path: must be an object providing resolve, dirname, join, basename, relative, isAbsolute, sep'
        for (let k of ['relative', 'isAbsolute']) {
            let m = makeMemFs(wn, { files: base() })
            let p2 = { resolve: wn.resolve, dirname: wn.dirname, join: wn.join, basename: wn.basename, relative: wn.relative, isAbsolute: wn.isAbsolute, sep: wn.sep }
            delete p2[k]
            let before = m.snapshot()
            let r = await run(fsSyncFolderCore(SRC, TAR, { path: p2, fs: m.fs, crypto }))
            assert.deepStrictEqual(r, { state: 'rejected', value: want }, k)
            assert.deepStrictEqual(m.ops, [], k)
            assert.deepStrictEqual(m.snapshot(), before, k)
        }
    })

    it(`注入之path.relative回傳非字串或isAbsolute回傳非false: 無法證明在目標內, 一律reject且不做任何刪除與寫入(規則2: 預設拒絕)`, async function() {
        let cases = [
            ['relative回undefined', { relative: () => undefined }],
            ['relative回null', { relative: () => null }],
            ['relative回空字串', { relative: () => '' }],
            ['isAbsolute回undefined', { isAbsolute: () => undefined }],
            ['isAbsolute回true', { isAbsolute: () => true }],
        ]
        for (let [name, over] of cases) {
            let m = makeMemFs(wn, { files: base() })
            let p2 = { ...wn, ...over }
            let before = m.snapshot()
            let r = await run(fsSyncFolderCore(SRC, TAR, { path: p2, fs: m.fs, crypto }))
            assert.deepStrictEqual(r, { state: 'rejected', value: MSG }, name)
            assert.deepStrictEqual(m.ops, [], name)
            assert.deepStrictEqual(m.snapshot(), before, name)
        }
    })

})


describe(`fsSyncFolderCore win32: 既有行為不變(R-FS-SYNC-PATH-01)`, function() {

    let SRC = 'C:\\r\\temp'
    let TAR = 'C:\\r\\tar'

    it(`巢狀資料夾之新增、變更、刪除照常同步, 再同步回false(行為保持)`, async function() {
        let m = makeMemFs(wn, {
            files: {
                'C:\\r\\temp\\sub\\deep\\n': 'n',
                'C:\\r\\temp\\same': 's',
                'C:\\r\\temp\\sub\\chg': 'new',
                'C:\\r\\tar\\same': 's',
                'C:\\r\\tar\\sub\\chg': 'old',
                'C:\\r\\tar\\gone\\g': 'g',
                'C:\\r\\tar\\sub\\old': 'o',
                'C:\\r\\item1': 'keep',
            },
        })
        let outside = m.outsideOf(TAR)
        let r1 = await run(fsSyncFolderCore(SRC, TAR, { path: wn, fs: m.fs, crypto }))
        assert.deepStrictEqual(r1, { state: 'resolved', value: true })
        assert.deepStrictEqual(m.outsideOf(TAR), outside)
        assert.strictEqual(m.read('C:\\r\\tar\\sub\\deep\\n'), 'n')
        assert.strictEqual(m.read('C:\\r\\tar\\sub\\chg'), 'new')
        assert.strictEqual(m.has('C:\\r\\tar\\gone'), false)
        assert.strictEqual(m.has('C:\\r\\tar\\sub\\old'), false)
        let r2 = await run(fsSyncFolderCore(SRC, TAR, { path: wn, fs: m.fs, crypto }))
        assert.deepStrictEqual(r2, { state: 'resolved', value: false })
    })

    it(`目標資料夾為磁碟機根目錄: 同步照常(落點核對於根目錄亦成立)`, async function() {
        let m = makeMemFs(wn, { files: { 'C:\\r\\temp\\n': 'n', 'E:\\old': 'o' }, dirs: ['E:\\'] })
        let r = await run(fsSyncFolderCore(SRC, 'E:\\', { path: wn, fs: m.fs, crypto }))
        assert.deepStrictEqual(r, { state: 'resolved', value: true })
        assert.strictEqual(m.read('E:\\n'), 'n')
        assert.strictEqual(m.has('E:\\old'), false)
    })

    it(`真實fs: 目標內以'..'起首之合法名稱照常刪除與寫入, 目標外之同層項目不動(行為保持)`, async function() {
        let fd = './test/_tmp/fsSyncFolderPath'
        fs.rmSync(fd, { recursive: true, force: true })
        try {
            let w = (fp, c) => {
                fs.mkdirSync(path.dirname(fp), { recursive: true })
                fs.writeFileSync(fp, c)
            }
            w(`${fd}/src/..foo`, 'foo')
            w(`${fd}/src/..bar/x`, 'x')
            w(`${fd}/tar/..old`, 'old')
            w(`${fd}/tar/..odir/y`, 'y')
            w(`${fd}/keep`, 'keep')
            let r1 = await run(fsSyncFolder(`${fd}/src`, `${fd}/tar`))
            assert.deepStrictEqual(r1, { state: 'resolved', value: true })
            assert.strictEqual(fs.readFileSync(`${fd}/tar/..foo`, 'utf8'), 'foo')
            assert.strictEqual(fs.readFileSync(`${fd}/tar/..bar/x`, 'utf8'), 'x')
            assert.strictEqual(fs.existsSync(`${fd}/tar/..old`), false)
            assert.strictEqual(fs.existsSync(`${fd}/tar/..odir`), false)
            assert.strictEqual(fs.readFileSync(`${fd}/keep`, 'utf8'), 'keep')
            let r2 = await run(fsSyncFolder(`${fd}/src`, `${fd}/tar`))
            assert.deepStrictEqual(r2, { state: 'resolved', value: false })
        }
        finally {
            fs.rmSync(fd, { recursive: true, force: true })
        }
    })

})


describe(`_isPathInside 嚴格位於資料夾內(R-FS-SYNC-PATH-01)`, function() {

    let isPathInside = null
    before(async function() {
        let m = await import('../src/_isPathInside.mjs')
        isPathInside = m.default
    })

    //[root, 目標, 期望]
    let casesPosix = [
        ['/r/t', '/r/t/a', true],
        ['/r/t', '/r/t/a/b', true],
        ['/r/t', '/r/t/..a', true],
        ['/r/t', '/r/t/...', true],
        ['/r/t', '/r/t/..\\x', true],
        ['/r/t', '/r/t/..a/b', true],
        ['/', '/a', true],
        ['/r/t', '/r/t', false], //本身
        ['/r/t', '/r', false], //上層
        ['/r/t', '/', false],
        ['/r/t', '/r/tx/a', false], //同層而字首相同
        ['/r/t', '/r/t2', false],
        ['/r/t', '/r/t/../u', false],
        ['/r/t', '/r/u/a', false],
    ]
    let casesWin32 = [
        ['C:\\r\\t', 'C:\\r\\t\\a', true],
        ['C:\\r\\t', 'c:\\R\\T\\a', true], //win32之比較不分大小寫
        ['C:\\r\\t', 'C:\\r\\t\\..a', true],
        ['C:\\', 'C:\\a', true],
        ['\\\\srv\\share\\t', '\\\\srv\\share\\t\\a', true],
        ['C:\\r\\t', 'C:\\r\\t', false],
        ['C:\\r\\t', 'C:\\r\\tx\\a', false], //同層而字首相同
        ['C:\\r\\t', 'C:\\r', false],
        ['C:\\r\\t', 'C:\\r\\t\\..\\u', false],
        ['C:\\r\\t', 'D:\\x', false], //另一磁碟機
        ['C:\\r\\t', '\\\\srv\\share\\x', false],
    ]

    for (let [name, p, cases] of [['posix', px, casesPosix], ['win32', wn, casesWin32]]) {
        for (let [root, fp, want] of cases) {
            it(`${name}: ${JSON.stringify(root)}對${JSON.stringify(fp)}為${want}`, function() {
                assert.strictEqual(isPathInside(root, fp, { path: p }), want)
            })
        }
    }

})
