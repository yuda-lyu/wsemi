import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'


//第559項④(V20): 下列函數之失敗路徑不得以console輸出錯誤本體(其訊息可能帶路徑、分頁名稱、輸入內容); 診斷一律經getDiag出口(固定詞彙label與安全摘要, 細節只在opt.logDetail或opt.funLog)
//  靜態防線: 去除註解後之原始碼不含console呼叫; 動態行為見各函數之測試(fsWatchFolder、fsWatchFile之unwatch/close/error事件、downloadExcelFileFromData、o2j、obj2str、obj2stru8arr、fsReadJson、getExcelU8ArrFromWorkbook、getExcelU8ArrFromData)
let srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')


//stripComments, 去除區塊註解與行註解(行註解以前方非冒號、引號、反引號者為界, 避免誤傷網址字串)
function stripComments(s) {
    return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')
}


describe(`第559項④: 失敗路徑不直接console輸出錯誤本體(靜態防線)`, function() {

    let names = [
        'fsWatchFolder', 'fsWatchFile', 'downloadExcelFileFromData', 'o2j', 'obj2str', 'obj2stru8arr', 'fsReadJson',
        'getExcelU8ArrFromWorkbook', 'getExcelU8ArrFromData', '_writeXlsxSafe', '_diagIfAsked', 'fsEnsureBinsCore',
    ]

    for (let n of names) {
        it(`${n}.mjs 去除註解後不含console呼叫`, function() {
            let s = fs.readFileSync(path.join(srcDir, `${n}.mjs`), 'utf8')
            let t = stripComments(s)
            assert.strict.deepStrictEqual(/\bconsole\s*\./.test(t), false, `${n}.mjs must not call console directly`)
        })
    }

    it(`防線自檢: stripComments會去除註解、保留程式碼中之console呼叫`, function() {
        assert.strict.deepStrictEqual(/\bconsole\s*\./.test(stripComments('// console.log(1)\n/* console.log(2) */\nlet a = 1')), false)
        assert.strict.deepStrictEqual(/\bconsole\s*\./.test(stripComments('let a = 1\nconsole.log(err)')), true)
        assert.strict.deepStrictEqual(/\bconsole\s*\./.test(stripComments('f(() => console.log(x)) // tail')), true)
    })

})
