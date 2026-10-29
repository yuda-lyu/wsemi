//_diagCases之E14(已知限制)子行程: 於載入maskDiagCopy前掛Error.prepareStackTrace, 記錄hook是否被呼叫
//用法: node diagPrepHookChild.mjs <hook函數名>; 結果以一行JSON寫至stdout


let name = process.argv[2] || 'ErrorPrepareStackTrace'
let hits = 0
let hook = {
    [name]: function(e, frames) {
        hits++
        return 'hooked-stack'
    },
}[name]
Error.prepareStackTrace = hook
let { default: maskDiagCopy } = await import('../../src/maskDiagCopy.mjs')
let r = maskDiagCopy(new Error('x'), [])
process.stdout.write(`${JSON.stringify({ hits, stack: r.stack })}\n`)
