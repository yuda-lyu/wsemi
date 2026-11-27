import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { runChildCase } from './tools/runChildCase.mjs'
import { scanCpHide } from './tools/cpHideScan.mjs'


//排程第681項: execProcessKillPid於Windows不得以不帶windowsHide之方式起子行程(原經tree-kill以exec起「taskkill /pid N /T /F」而不帶windowsHide, 由無主控台之detached背景行程呼叫時閃出主控台視窗)
//  規格來源: 全域技能role-command-windows §7.1(背景行程再起之子行程, 每一處child_process呼叫皆設windowsHide: true)與主控派工第681項
//  實測(非自動化: 會於桌面閃出視窗, 只於派工期間以detached行程取3次樣本): 修前detached之worker呼叫execProcessKillPid約0.5秒時新出現WindowsTerminal與OpenConsole視窗(2次皆重現), 修後0個; 見報告
//  驗法: 子行程(test/tools/killWinRunner.mjs)以攔截替身取代child_process之spawn、exec、execFile與process.kill(不呼叫真實函數, 不可能真的殺程序), 記錄呼叫之選項;
//    另以AST掃描src內全部child_process之呼叫皆帶windowsHide: true(本庫自身之呼叫點)
//  修前紅: 環境變數WSEMI_KILL681_SRC指向修前之src資料夾時, 子行程改載該處之模組(掃描同樣改掃該處)


let SRC = process.env.WSEMI_KILL681_SRC ? path.resolve(process.env.WSEMI_KILL681_SRC) : path.resolve(import.meta.dirname, '..', 'src')
let runner = fileURLToPath(new URL('./tools/killWinRunner.mjs', import.meta.url))
let runCase = (name) => {
    let { r } = runChildCase(runner, name, { timeout: 120000, env: { ...process.env, WSEMI_KILL681_SRC: SRC } })
    assert.ok(r && r.out && !r.out.runnerError, JSON.stringify(r).slice(0, 300))
    return r.out
}


describe(`排程第681項: execProcessKillPid之子行程不開視窗(windowsHide)`, function() {

    describe(`Windows路徑(以攔截替身, 不殺任何程序)`, function() {

        it(`should start taskkill with spawn and windowsHide: true, without a shell and without stdin, and not through exec or execFile`, function() {
            let o = runCase('ok')
            assert.strict.deepStrictEqual(o.r, { s: 'resolve', v: 'pid[424242] killed' })
            assert.strict.deepStrictEqual(o.events, ['start', 'done'])
            let started = o.calls.filter((c) => c.fn !== 'kill')
            //只起一個子行程: taskkill; 不得經exec、execFile(不帶windowsHide之寫法, 亦是修前tree-kill之寫法)
            assert.strict.deepStrictEqual(started.map((c) => c.fn), ['spawn'], JSON.stringify(started))
            assert.strict.deepStrictEqual(started[0].file, 'taskkill')
            assert.strict.deepStrictEqual(started[0].args, ['/pid', '424242', '/T', '/F'])
            assert.strict.deepStrictEqual(started[0].opts.windowsHide, true)
            assert.ok(started[0].opts.shell === false || started[0].opts.shell === undefined, 'no shell')
            assert.strict.deepStrictEqual(started[0].opts.stdio[0], 'ignore')
        })

        it(`should reject 'pid[N] kill failed: Command failed: taskkill /pid N /T /F' plus the taskkill error output when taskkill exits non-zero`, function() {
            let o = runCase('fail')
            assert.strict.deepStrictEqual(o.r.s, 'reject')
            assert.ok(o.r.v.startsWith('pid[424242] kill failed: Command failed: taskkill /pid 424242 /T /F\n'), o.r.v)
            assert.ok(o.r.v.includes('not found'), o.r.v)
            assert.strict.deepStrictEqual(o.events, ['start', 'fail'])
        })

        it(`should reject 'pid[N] kill failed: ...' when taskkill cannot be started (spawn error event), and settle only once when error and close both fire`, function() {
            let o1 = runCase('spawnerr')
            assert.strict.deepStrictEqual(o1.r.s, 'reject')
            assert.ok(o1.r.v.startsWith('pid[424242] kill failed: '), o1.r.v)
            let o2 = runCase('both')
            assert.strict.deepStrictEqual(o2.r.s, 'reject')
            assert.ok(o2.r.v.startsWith('pid[424242] kill failed: '), o2.r.v)
            assert.strict.deepStrictEqual(o1.events, ['start', 'fail'])
            assert.strict.deepStrictEqual(o2.events, ['start', 'fail']) //error與close皆發出時只落定與通知一次
        })

        it(`should reject (not throw synchronously, no unhandled error event) when spawn returns early without stdio (EMFILE, ENFILE)`, function() {
            //複審: EMFILE時child.stderr為null且error事件已排入下一個tick; 須先掛error監聽再判stdio
            let o = runCase('emfile')
            assert.strict.deepStrictEqual(o.r.s, 'reject')
            assert.ok(o.r.v.startsWith('pid[424242] kill failed: '), o.r.v)
            assert.strict.deepStrictEqual(o.events, ['start', 'fail'])
        })

        it(`should keep tree-kill (ps and pgrep, no taskkill, no window concern) on a non-Windows platform`, function() {
            let o = runCase('linux')
            assert.strict.deepStrictEqual(o.r.s, 'resolve')
            let names = o.calls.filter((c) => c.fn === 'spawn' || c.fn === 'exec' || c.fn === 'execFile').map((c) => c.file)
            assert.ok(names.length > 0 && names.every((n) => n === 'ps' || n === 'pgrep'), JSON.stringify(names))
            assert.ok(!o.calls.some((c) => /taskkill/.test(c.file) || c.args.includes('taskkill')), JSON.stringify(o.calls))
        })

    })

    describe(`原始碼掃描(AST): 本庫對child_process之呼叫皆帶windowsHide: true`, function() {

        it(`scanner self-test: should detect the call kinds and the option shapes`, function() {
            let hit = (code) => scanCpHide(code).map((h) => `${h.fn}:${h.hide}`)
            assert.strict.deepStrictEqual(hit(`import { spawn } from 'child_process'\nspawn('a', [], { windowsHide: true })`), ['spawn:yes'])
            assert.strict.deepStrictEqual(hit(`import { spawn } from 'child_process'\nspawn('a', [])`), ['spawn:no'])
            assert.strict.deepStrictEqual(hit(`import { spawn } from 'child_process'\nspawn('a', [], { windowsHide: false })`), ['spawn:no'])
            assert.strict.deepStrictEqual(hit(`import cp from 'child_process'\ncp.exec('x', { windowsHide: true }, () => {})\ncp.execFile('y', [], {})`), ['exec:yes', 'execFile:no'])
            assert.strict.deepStrictEqual(hit(`import * as cp from 'node:child_process'\ncp.spawnSync('x', { ...o })`), ['spawnSync:dynamic'])
            assert.strict.deepStrictEqual(hit(`import { fork as f } from 'child_process'\nf('m.js', [], { windowsHide: true })`), ['fork:yes'])
            assert.strict.deepStrictEqual(hit(`const m = /a/.exec('x')\nlet spawn = () => 1\nspawn('a')`), []) //正規式之exec、非匯入之spawn不計
        })

        it(`should find every child_process call in src with windowsHide: true (the call-site counts per file are pinned)`, function() {
            let files = fs.readdirSync(SRC).filter((f) => f.endsWith('.mjs'))
            assert.ok(files.length > 400, `scanned file count too small: ${files.length}`)
            let found = {}
            let notHidden = []
            for (let f of files) {
                let hits = scanCpHide(fs.readFileSync(path.join(SRC, f), 'utf8'))
                if (hits.length > 0) {
                    found[f] = hits.length
                }
                for (let h of hits) {
                    if (h.hide !== 'yes') {
                        notHidden.push(`${f}:${h.line} ${h.fn} ${h.hide}`)
                    }
                }
            }
            assert.strict.deepStrictEqual(notHidden, [])
            //站點數(新增或消失皆須審視): execProcessKillPid於修前不直接呼叫child_process(經tree-kill), 修後1處
            assert.strict.deepStrictEqual(found, {
                '_execPortPids.mjs': 2,
                '_execProcessCodec.mjs': 1,
                'execCli.mjs': 1,
                'execCliSession.mjs': 1,
                'execProcess.mjs': 3,
                'execProcessKillPid.mjs': 1,
            })
        })

    })

})
