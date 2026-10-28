import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import assert from 'assert'
import { spawn } from 'child_process'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsGetBinManifestEntry from '../src/fsGetBinManifestEntry.mjs'
import fsEnsureBinsCore from '../src/fsEnsureBinsCore.mjs'


//規格: 外部執行檔之存放下載校驗與離線(制式規格)M1「清單由toolg/genBinManifest.mjs依repo內實檔產生, 不手寫sha256」; 規則帳本R-BIN-ENSURE-01
describe(`fsGetBinManifestEntry with files`, function() {

    let fdt = path.resolve('./test/_tmp/fsGetBinManifestEntry')
    let body = Buffer.from(Array.from({ length: 70000 }, (v, i) => (i * 5) % 256))
    let sha = crypto.createHash('sha256').update(body).digest('hex')
    let catchErr = async (pm) => {
        try {
            await pm
        }
        catch (err) {
            return err
        }
        return null
    }

    before(function() {
        fsDeleteFolder(fdt)
        fsCreateFolder(fdt)
        fs.writeFileSync(path.join(fdt, 'tool.exe'), body)
        fs.writeFileSync(path.join(fdt, 'empty.bin'), Buffer.alloc(0))
    })

    after(function() {
        fsDeleteFolder(fdt)
    })

    it(`should give name (the file name by default), sha256 in lowercase and size of the real file (M1, M2)`, async function() {
        let r = await fsGetBinManifestEntry(path.join(fdt, 'tool.exe'))
        assert.strict.deepStrictEqual(r, { name: 'tool.exe', sha256: sha, size: body.length })
        let r0 = await fsGetBinManifestEntry(path.join(fdt, 'empty.bin'))
        assert.strict.deepStrictEqual(r0, { name: 'empty.bin', sha256: crypto.createHash('sha256').update(Buffer.alloc(0)).digest('hex'), size: 0 })
    })

    it(`should put opt.name, opt.path and opt.url in the entry in the order of the manifest fields (M1)`, async function() {
        let r = await fsGetBinManifestEntry(path.join(fdt, 'tool.exe'), { name: 'connLDAP.exe', path: 'bin/tool.exe' })
        assert.strict.deepStrictEqual(Object.keys(r), ['name', 'path', 'sha256', 'size'])
        assert.strict.deepStrictEqual([r.name, r.path], ['connLDAP.exe', 'bin/tool.exe'])
        let r2 = await fsGetBinManifestEntry(path.join(fdt, 'tool.exe'), { url: 'https://github.com/a/b/releases/download/v1/tool.exe' })
        assert.strict.deepStrictEqual(Object.keys(r2), ['name', 'url', 'sha256', 'size'])
    })

    it(`should reject a message string for a missing file, a folder or invalid arguments (R-FS-REJECT-01)`, async function() {
        let fpTool = path.join(fdt, 'tool.exe')
        let bads = [
            [path.join(fdt, 'none.exe'), {}],
            [fdt, {}],
            ['', {}],
            [1, {}],
            [fpTool, { name: '' }],
            [fpTool, { path: 1 }],
            //fsEnsureBins會拒收之項目不產生(與其共用同一白名單)
            [fpTool, { path: 'bin/tool.exe', url: 'https://github.com/a/b/releases/download/v1/tool.exe' }],
            [fpTool, { name: 'CON.exe' }],
            [fpTool, { name: '../tool.exe' }],
            [fpTool, { path: 'bin/../tool.exe' }],
            [fpTool, { name: new String('tool.exe') }], // eslint-disable-line no-new-wrappers
            [fpTool, { url: 'http://github.com/a/b/releases/download/v1/tool.exe' }],
            [fpTool, { url: 'https://github.com/a/b/releases/latest/download/tool.exe' }],
            [fpTool, { url: 'https://raw.githubusercontent.com/a/b/main/bin/tool.exe' }],
        ]
        for (let [fp, opt] of bads) {
            let e = await catchErr(fsGetBinManifestEntry(fp, opt))
            assert.strict.equal(typeof e, 'string', String(fp))
        }
    })

    it(`should make an entry that fsEnsureBins accepts and verifies (M1, E2)`, async function() {
        //以產生之清單項組成清單, 自本地鏡像取得: 清單有效且校驗通過
        let e = await fsGetBinManifestEntry(path.join(fdt, 'tool.exe'), { path: 'bin/tool.exe' })
        let manifest = { schema: 1, pkg: 'w-gen', mode: 'pinned', repo: 'yuda-lyu/w-gen', commit: '0123456789abcdef0123456789abcdef01234567', files: [e] }
        let mirror = path.join(fdt, 'mirror')
        fs.mkdirSync(path.join(mirror, 'w-gen', e.sha256), { recursive: true })
        fs.copyFileSync(path.join(fdt, 'tool.exe'), path.join(mirror, 'w-gen', e.sha256, 'tool.exe'))
        let r = await fsEnsureBinsCore(manifest, {
            fs,
            path,
            crypto,
            Readable,
            pipeline,
            spawn,
            env: {},
            pkgRoot: fdt,
            mirror,
            offline: true,
        })
        assert.strict.equal(fs.readFileSync(r['tool.exe']).equals(body), true)
    })

})


describe(`fsGetBinManifestEntry`, function() {

    let test = async () => {
        let ms = []

        let fdt = './_test_fsGetBinManifestEntry'
        fsCreateFolder(fdt) //創建任務資料夾

        fs.writeFileSync(`${fdt}/tool.exe`, 'MZ-tool')

        let r1 = await fsGetBinManifestEntry(`${fdt}/tool.exe`, { path: 'bin/tool.exe' })
        // console.log('r1', r1)
        ms.push(r1)

        let r2 = await fsGetBinManifestEntry(`${fdt}/tool.exe`)
        // console.log('r2', r2)
        ms.push(r2)

        await fsGetBinManifestEntry(`${fdt}/none.exe`)
            .catch((err) => {
                ms.push({ err: typeof err })
            })

        fsDeleteFolder(fdt) //最終階段清除任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    let ms = [
        {
            name: 'tool.exe',
            path: 'bin/tool.exe',
            sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913',
            size: 7
        },
        {
            name: 'tool.exe',
            sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913',
            size: 7
        },
        { err: 'string' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
