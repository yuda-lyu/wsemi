import fsMissFns from './_fsMissFns.mjs'


/**
 * fs系Core之注入相依檢查，內部共用不對外(R-FS-DEPS-01)
 *
 * Core不自行匯入fs、path、crypto、stream(可被打包至無此內建模組之環境)，須由呼叫端經opt注入；缺漏(未給、null、非物件、缺少必要方法)為相依無效，不可被當成「不存在」「不是檔案」或成功，須依各函數原有失敗通道回報
 * 回傳之說明字串不帶輸入值，格式依輸入規格V19: `invalid opt.<名稱>: must be <種類描述>`
 *
 * 必要方法之取捨(各Core之spec): ①只讀類(判斷、讀檔、列舉、雜湊)列「判斷前置」(statSync、lstatSync)與其無條件使用之主操作方法(readFileSync、readdirSync)，串流建立方法缺少時於用到之處依原通道reject(失敗無副作用、不會回成功；既有測試以局部替身只提供各案路徑所需之方法)；
 * ②寫入、刪除、複製、合併、同步類(失敗前可能已有不可逆之副作用，或缺方法時回成功而未完成)列其於成功路徑上無條件使用之全部操作方法(含串流建立方法與切片刪除之unlinkSync)，於第一個破壞性動作之前齊備；
 * 兩類皆不預先檢查「僅特定分支才用」之方法(上層資料夾不存在時之mkdirSync、連結之readlinkSync與symlinkSync、失敗清理之unlinkSync)
 *
 * @param {Object} deps 輸入已取出之相依物件，如{ fs, path, crypto, Readable, pipeline }
 * @param {Object} spec 輸入各相依之需求，鍵為相依名稱，值為必要成員名稱陣列(相依須為物件或函數，各成員須為函數；名稱以':string'結尾者須為非空字串，如'sep:string')，或字串'function'(相依須為函數)，依鍵順序檢查，回報第一個不合者
 * @returns {String|null} 全部合格回傳null，否則回傳說明字串
 */
function chkFsDeps(deps, spec) {
    for (let key of Object.keys(spec)) {
        let need = spec[key]
        let v = null
        try {
            v = deps[key]
        }
        catch (err) {
            v = null
        }
        if (need === 'function') {
            if (typeof v !== 'function') {
                return `invalid opt.${key}: must be a function`
            }
            continue
        }

        //fns與strs, 名稱以':string'結尾者為非空字串成員(如path.sep), 其餘為函數成員
        let fns = need.filter((n) => !n.endsWith(':string'))
        let strs = need.filter((n) => n.endsWith(':string')).map((n) => n.slice(0, -':string'.length))
        let bad = fsMissFns(v, fns).length > 0 //fsMissFns: 非物件(含null)視為全部缺少; 各Core之函數成員清單皆非空
        if (!bad) {
            for (let n of strs) {
                try {
                    if (typeof v[n] !== 'string' || v[n] === '') {
                        bad = true
                    }
                }
                catch (err) {
                    bad = true
                }
            }
        }
        if (bad) {
            return `invalid opt.${key}: must be an object providing ${[...fns, ...strs].join(', ')}`
        }
    }
    return null
}


export default chkFsDeps
