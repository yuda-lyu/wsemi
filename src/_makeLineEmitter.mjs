import isfun from './isfun.mjs'


//makeLineEmitter, 內部共用不對外(使用端: execCliJsonFile): 把串流chunk累積成完整行後逐行回調, 回傳emit(chunk)函數, 其flush()回報殘留之半行
//  chunk邊界不保證落在換行處, 最後的半行留待下個chunk(或呼叫flush)
//  stdout與stderr各建一份(共用緩衝會互相插隊)
//  每行先trim(去除前後空白, 含行尾\r)才處理: trim後為空者不回報(空行與純空白行), 前綴比對與回報皆用trim後之字串(同執行殼之runJsonCli.makeLineEmitter原契約, unit-check-util.test.mjs:60-71)
//  prefix非字串視為''(全收), 為字串時只回報(trim後)以其開頭之行
//  回調拋錯: 同一chunk內其餘行仍照常回報、緩衝狀態維持一致, 全部行回報後原樣重拋第一個錯誤(由呼叫端決定如何處置; execCli之onStdout/onStderr會把它原樣重拋為未捕捉例外)
//  onLine須為函數, 否則拋Error(必須參數)
function makeLineEmitter(onLine, prefix = '') {

    //check
    if (!isfun(onLine)) {
        throw new Error('makeLineEmitter 需要 onLine 函數')
    }

    //prefix, 非字串視為''
    if (typeof prefix !== 'string') {
        prefix = ''
    }

    let buf = ''

    let deliver = (lines) => {
        let bErr = false
        let errFirst = null
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim()
            if (line === '') {
                continue
            }
            if (prefix !== '' && !line.startsWith(prefix)) {
                continue
            }
            try {
                onLine(line)
            }
            catch (err) {
                if (!bErr) {
                    bErr = true
                    errFirst = err
                }
            }
        }
        if (bErr) {
            throw errFirst
        }
    }

    //emit, 輸入chunk(字串或Buffer), 回報其中已完成之行; 可直接當作串流回調(如execCli之onStdout)
    let emit = (chunk) => {
        if (chunk === undefined || chunk === null) {
            return
        }
        chunk = String(chunk)
        buf += chunk
        if (!chunk.includes('\n')) {
            return //新段無換行: 緩衝內不會有新的完整行, 免重新切分整個緩衝(單一長行輸出不致二次方變慢)
        }
        let parts = buf.split('\n')
        buf = parts.pop() //最後一段為尚未結束之半行
        deliver(parts)
    }

    //flush, 回報殘留之半行(串流結束時呼叫)
    emit.flush = () => {
        let rest = buf
        buf = ''
        deliver([rest])
    }

    return emit
}


export default makeLineEmitter
