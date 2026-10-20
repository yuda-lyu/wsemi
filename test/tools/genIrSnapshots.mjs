//genIrSnapshots.mjs: 產生IR契約快照 src/_lowerFindSnapshots.mjs(規則見CLAUDE_rulebook.md R-LOWER-01 IR-09)
//
//快照 = 共用案例表(src/_cvOrmFindCases.mjs)中cvOrmFind接受者, 經 cvOrmFind -> lowerFind(maxParams: Infinity) 所得之IR(經norm: Date以{ $date: 毫秒 }表示);
//IR序列化後超過20000字元者(大型$in/$and/$or)不入快照(由性質測試守住). 每筆{ id: 'wsemi:<案例代號>', ir }.
//測試(test/lowerFind.test.mjs)逐筆比對現行lowerFind輸出: 差異即契約變更, 須有意識地重產並審閱 git diff 後再提交:
//  node test/tools/genIrSnapshots.mjs        (直接執行即重產)
//  node test/tools/genIrSnapshots.mjs --check   (唯讀檢查現行檔是否等於產生器輸出; 一致離開碼0, 不一致離開碼1)
import fs from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import cvOrmFind from '../../src/cvOrmFind.mjs'
import cvCases from '../../src/_cvOrmFindCases.mjs'
import lowerFind from '../../src/lowerFind.mjs'
import lowerCases from '../../src/_lowerFindCases.mjs'


let MAX_CHARS = 20000

let buildSnapshots = () => {
    let items = []
    for (let c of cvCases.cases) {
        let ir = null
        try {
            ir = lowerFind(cvOrmFind(c.find()), { maxParams: Infinity })
        }
        catch (err) {
            continue //共用層已拒收者無IR
        }
        let n = lowerCases.norm(ir)
        if (JSON.stringify(n).length <= MAX_CHARS) {
            items.push({ id: `wsemi:${c.id}`, ir: n })
        }
    }
    return items
}

//js, 值 -> 符合專案風格(單引號、鍵後空格、花括號內空格)之JS字面值文字; 只處理JSON形狀(null、布林、有限數字、字串、陣列、物件)
let js = (v) => {
    if (v === null || typeof v === 'boolean') {
        return String(v)
    }
    if (typeof v === 'number') {
        return JSON.stringify(v)
    }
    if (typeof v === 'string') {
        // eslint-disable-next-line no-control-regex
        let t = v.replace(/[\\']/g, '\\$&').replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)
        return `'${t}'`
    }
    if (Array.isArray(v)) {
        return `[${v.map(js).join(', ')}]`
    }
    let ks = Object.keys(v)
    return ks.length === 0 ? '{}' : `{ ${ks.map((k) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : js(k)}: ${js(v[k])}`).join(', ')} }`
}

//renderFile, 快照檔之文字(每筆一行, 便於逐行審閱差異)
let renderFile = (items) => [
    '//IR契約快照(產生檔, 勿手改; 規則見CLAUDE_rulebook.md R-LOWER-01 IR-09)',
    '//共用案例表src/_cvOrmFindCases.mjs中cvOrmFind接受者(IR序列化後<=20000字元) -> cvOrmFind -> lowerFind(maxParams: Infinity) 之IR; Date以{ $date: 毫秒 }表示, ir為null表無條件',
    '//重產: node test/tools/genIrSnapshots.mjs (差異即契約變更, 須審閱 git diff)',
    '',
    'export default [',
    ...items.map((x) => `    ${js(x)},`),
    ']',
    '',
].join('\n')

let file = fileURLToPath(new URL('../../src/_lowerFindSnapshots.mjs', import.meta.url))
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
    let items = buildSnapshots()
    if (process.argv.includes('--check')) {
        //唯讀檢查: 現行檔須等於產生器輸出, 否則離開碼1(不改寫)
        let same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === renderFile(items)
        console.log(same ? `snapshot file is up to date (${items.length} entries)` : 'snapshot file differs from the generator output: regenerate with node test/tools/genIrSnapshots.mjs and review the diff')
        process.exitCode = same ? 0 : 1
    }
    else {
        fs.writeFileSync(file, renderFile(items), 'utf8')
        console.log('wrote', file, items.length)
    }
}


export { buildSnapshots, renderFile }
