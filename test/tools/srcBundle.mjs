import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


//src內模組之文字打包(測試用), 供在vm空領域載入原始碼驗證[純JS、無Node全域、內建被刪或被汙染]之行為
//
//規則: 模組只含 `import 名稱 from './檔.mjs'` 與 `export default 名稱`(單行, 無其他import/export);
//每個模組包成立即執行函數(各自一份頂層變數, 不互撞), 以 const 名稱 = (函數) 接上依賴, export default 改為 return.
//打包結果為一段腳本(非ES module), 最外層以 globalThis[exposeAs] = 入口函數 暴露.
//overrides(選用): { 模組名: 'JS運算式文字' }, 以該運算式取代依賴模組(接線替身, 用來證明入口模組確實呼叫該依賴).

let dirSrc = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src')

let reImport = /^import\s+(\w+)\s+from\s+'\.\/([\w.-]+)\.mjs'\s*$/gm
let reExport = /^export default\s+(\w+)\s*$/m

//wrap, 回傳立即執行函數之文字(依賴先展開)
let wrap = (name, seen, overrides) => {
    if (Object.prototype.hasOwnProperty.call(overrides, name)) {
        return `(${overrides[name]})`
    }
    let fp = path.join(dirSrc, `${name}.mjs`)
    let src = fs.readFileSync(fp, 'utf8')
    if (seen.includes(name)) {
        throw new Error(`circular import: ${name}`)
    }
    let chain = [...seen, name]
    let body = src.replace(reImport, (_, id, dep) => `const ${id} = ${wrap(dep, chain, overrides)}`)
    if (/^\s*(import|export)\s/m.test(body.replace(reExport, ''))) {
        throw new Error(`unsupported import/export in ${name}.mjs`)
    }
    if (!reExport.test(body)) {
        throw new Error(`no export default in ${name}.mjs`)
    }
    body = body.replace(reExport, (_, id) => `return ${id}`)
    return `(function() {\n${body}\n})()`
}

//srcBundle, 回傳腳本文字: globalThis[exposeAs] = 入口模組之預設匯出
let srcBundle = (entry, exposeAs, overrides = {}) => {
    return `globalThis.${exposeAs} = ${wrap(entry, [], overrides)}\n`
}


export { srcBundle }
export default srcBundle
