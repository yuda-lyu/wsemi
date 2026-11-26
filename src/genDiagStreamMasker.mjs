import { MASK, LIM, NONE, BL_AB, tryCall, isProxy, ownData, pickList, getCtx, spansOf, applyIvs, maskStr, addSecrets, splitsPair } from './_diagKit.mjs'


//LINE_MAX, 一列(含其換行)至多此字元數者整列一次遮罩(同maskDiagText不截長度之上限)
const LINE_MAX = LIM.str

//PIECE, 更長之列強制分段時每段至多之字元數
const PIECE = 16000

//LOOK, 判定切點之窗於段上限之後至少多看之字元數(另不少於最長秘密之長度)
const LOOK = 4000


//merge, 區間排序後合併相交者(同applyIvs之合併規則: 起點小於目前結尾者併入)
let merge = (ivs) => {
    let a = ivs.map((x) => [x[0], x[1]]).sort((x, y) => x[0] - y[0] || y[1] - x[1])
    let r = []
    for (let x of a) {
        let l = r[r.length - 1]
        if (l !== undefined && x[0] < l[1]) {
            l[1] = Math.max(l[1], x[1])
        }
        else {
            r.push(x)
        }
    }
    return r
}


/**
 * 串流遮罩器：逐塊收文字(如子行程之stdout、stderr)，逐列以文字遮罩(maskDiagText)之同一套規則遮罩後交出，供寫入檔案或轉交回調；秘密被切在兩塊之間、或跨列之秘密，皆整段遮到
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-02。回傳{ push(chunk), flush() }：push收一塊並回傳此時可安全交出之已遮罩文字(可為'')，flush交出其餘並重設(其後可再push，視為新串流)；兩者永不拋錯(內部失敗回***並捨棄緩衝)
 *
 * 輸出以列為單位：收到換行才交出該列(列含其換行)；每列之輸出等於maskDiagText(該列, secrets, opt)(故與塊之切法無關)，最後無換行之一段於flush交出。
 * 秘密含換行者(已知秘密跨越列尾)，該列尾不作為切點(與下一列合為一段再遮)，判定須等其後至多最長秘密長度之文字到齊(或flush)
 *
 * 長列：一段(列)超過20000字元(同maskDiagText不截長度之上限)者強制分段，每段至多16000字元：於前16000字元內取最後一個空白或定位字元之前為切點(無則16000)，
 * 切點不得落在任一命中之整段範圍(已知秘密、網址帳密〔scheme起至@〕、憑證鍵值對〔鍵起至值之結尾〕與Bearer、opt.patterns之整個命中，於自段首起「16000＋max(4000, 最長秘密長度)＋1」字元之窗上以同一套規則求得)之內(落入者移到該命中之起點，鍵與值不被分在兩段)，亦不切開代理對；
 * 窗內之遮罩依該窗之命中區間輸出(故跨切點之秘密與憑證整段遮到)；段首即落在延伸超過段上限之命中內者，以該命中之結尾為切點，該命中延伸至窗尾而列未結束者(超長之憑證值、未閉合之引號或中括號、scheme://之後至窗尾皆無空白、/、?、#者〔其帳密之@可能在窗外〕)，該列其餘部分(含其鍵)以一個***取代(fail-closed)，列尾之換行照輸出。
 * 長列之分段只依該列之文字決定(等窗內之文字到齊才切)，故輸出亦與塊之切法無關
 *
 * chunk：字串照用；Uint8Array等ArrayBuffer視圖與ArrayBuffer以UTF-8串流解碼(多位元組字元被切在兩塊之間亦正確，flush時補完不完整之位元組為U+FFFD)；數字、布林、bigint以String轉換；undefined與null視為空；
 * 包裝字串解包；其他(Symbol、函數、一般物件、可偵測之Proxy、無法解碼之二進位)無法檢查其內容，以***取代該塊(fail-closed，不執行其toString)
 *
 * secrets同maskDiagText(字串陣列或getDiagSecrets之結果，取其detail清單；各秘密內建其JSON跳脫形，如逐列之JSON紀錄內含引號、反斜線、換行之金鑰亦被遮)，於建立時取快照(其後清單之變動不影響)；清單無法使用(可偵測之Proxy、存取器之項、來源無法讀取之getDiagSecrets結果、型別不合)時每段皆輸出***(fail-closed)。
 * opt同maskDiagText(patterns、credPatterns，只讀自有資料屬性)；opt.credPatterns為false時只遮已知秘密與opt.patterns(供模型輸出等不宜以樣式判定之文字)
 *
 * 與maskDiagText之差異：①長列分段輸出全文而不截斷(maskDiagText對超過20000字元者只輸出前20000字元並接…(len=原長))；②樣式之scope為'message'者在逐列輸入下作用於每一列(單列不含換行加4空白at)；③引號或中括號未閉合之憑證值只遮至該列(段)結尾，不跨列；
 * ④長列之切點之後之文字視為新段之開頭判定(如緊接於英數字之後之Bearer，整列判定時不遮，切點恰在其前時被遮；只會多遮)
 *
 * 已知限制: 未登錄之秘密只依內建樣式盡力遮罩，其跨列者(如引號內含換行之值)第二列起不被視為憑證值；未閉合之憑證值延伸至長列之窗尾者該列其餘皆為***；opt.patterns之樣式依賴命中範圍之前之文字(後顧斷言)者，長列之切點可能落在其前文與命中之間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genDiagStreamMasker.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} [secrets=[]] 輸入秘密清單陣列，或getDiagSecrets回傳之物件(取detail)，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.patterns=[]] 輸入套件樣式陣列，同maskDiagText，預設[]
 * @param {Boolean} [opt.credPatterns=true] 輸入是否使用內建之憑證樣式(網址帳密、憑證鍵值對與Bearer)，須恰為false才不用，同maskDiagText，預設true
 * @returns {Object} 回傳物件{ push, flush }，push(chunk)回傳已遮罩之文字字串，flush()回傳其餘之已遮罩文字字串
 * @example
 *
 * let sm = genDiagStreamMasker(['sk-123456789'])
 * let out = sm.push('key=sk-1234') + sm.push('56789 ok\nnext') + sm.flush()
 * console.log(out)
 * // => 'key=*** ok\nnext'
 *
 * let sm2 = genDiagStreamMasker([])
 * console.log(sm2.push('auth: Bearer abc.def\n'))
 * // => 'auth: Bearer ***\n'
 *
 * let sm3 = genDiagStreamMasker(['sk-123456789'], { credPatterns: false })
 * console.log(sm3.push('password=demo sk-123456789\n'))
 * // => 'password=demo ***\n'
 *
 */
function genDiagStreamMasker(secrets, opt) {

    //ctx, 建立時之快照(清單無法使用者為null: 每段輸出***)
    let ctx = null
    let nl = 0 //含換行之已知秘密之最長長度(0為無: 列尾恆可為切點)
    let W = PIECE + LOOK + 1 //長列判定切點之窗長
    try {
        //比對器於此建成一次(即快照: 其後清單之變動不影響)
        ctx = getCtx(pickList(secrets, 'detail'), opt, 'detail', ownData(opt, 'credPatterns') !== false)
        for (let s of ctx.mt.ss) {
            if (s.indexOf('\n') >= 0 && s.length > nl) {
                nl = s.length
            }
        }
        W = PIECE + Math.max(LOOK, ctx.mt.maxLen) + 1
    }
    catch (err) {
        ctx = null
    }

    //狀態: buf之[p, 結尾)為尚未交出之文字(p之前保留至多nl-1字元供跨列判定); scan之前已無列尾; skip為本列其餘已以***取代
    let buf = ''
    let p = 0
    let scan = 0
    let skip = false
    let dec = null
    let waitUndec = false //上次停在尚不能判定之換行(其後文字到達即須重判)

    let reset = () => {
        buf = ''
        p = 0
        scan = 0
        skip = false
        dec = null
        waitUndec = false
    }

    //take, 交出至位置k(絕對位置)
    let take = (k) => {
        p = k
        if (scan < p) {
            scan = p
        }
    }

    //compact, 捨棄p之前之文字(保留nl-1字元供跨列判定)
    let compact = () => {
        let k = Math.max(0, p - Math.max(0, nl - 1))
        if (k > 0) {
            buf = buf.slice(k)
            p -= k
            scan -= k
        }
    }

    //crossed, 列尾e(換行之後之位置)是否位於某個已知秘密之命中區間內(該秘密含換行)
    let crossed = (e) => {
        let a = Math.max(0, e - nl + 1)
        let ivs = []
        addSecrets(buf.slice(a, Math.min(buf.length, e + nl - 1)), ctx.mt, ivs)
        for (let x of ivs) {
            if (a + x[0] < e && e < a + x[1]) {
                return true
            }
        }
        return false
    }

    //findEnd, 自p起第一個列尾(絕對位置e): { e }為已確定者; e為-1且undec>=0為該處換行尚不能判定(其後文字未到齊); 皆-1為無換行
    let findEnd = (final) => {
        let from = Math.max(scan, p)
        for (;;) {
            let i = buf.indexOf('\n', from)
            if (i < 0) {
                scan = buf.length
                return { e: -1, undec: -1 }
            }
            let e = i + 1
            if (nl > 0) {
                if (!final && buf.length < e + nl - 1) {
                    scan = i
                    return { e: -1, undec: e }
                }
                if (crossed(e)) {
                    from = e
                    scan = e
                    continue
                }
            }
            scan = i
            return { e, undec: -1 }
        }
    }

    //maskSeg, 一段(至多LINE_MAX字元)之遮罩, 同maskDiagText
    let maskSeg = (seg) => {
        if (ctx === null) {
            return MASK
        }
        try {
            return maskStr(seg, ctx)
        }
        catch (err) {
            return MASK
        }
    }

    //forced, 長列之一段: 窗為[p, wEnd), atEnd為窗尾即列尾
    let forced = (wEnd, atEnd) => {
        let len = wEnd - p
        if (ctx === null) {
            let c = Math.min(PIECE, len)
            if (c < len && splitsPair(buf, p + c)) {
                c--
            }
            take(p + c)
            return MASK
        }
        let wt = buf.slice(p, wEnd)
        let ext = []
        let ivs = spansOf(wt, ctx, ext)
        let ms = merge(ext.concat(ivs)) //切點避開各命中之整段範圍(含鍵、scheme等判定所需之前文), 不只遮罩區間: 否則鍵與值被分在兩段, 後段無鍵而不被遮
        //avoid, 落在合併區間內之切點移到該區間之起點; 不切開代理對(移前一位後再判)
        let avoid = (c) => {
            for (let k = 0; k < 4 && c > 0; k++) {
                let moved = false
                for (let x of ms) {
                    if (x[0] >= c) {
                        break
                    }
                    if (x[0] < c && c < x[1]) {
                        c = x[0]
                        moved = true
                        break
                    }
                }
                if (c < len && splitsPair(wt, c)) {
                    c--
                    moved = true
                }
                if (!moved) {
                    break
                }
            }
            return c
        }
        //候選切點: 前PIECE字元內最後一個空白或定位字元之前(該字元歸下一段), 無則PIECE
        let c = 0
        for (let k = Math.min(PIECE, len - 1); k > 0; k--) {
            let cc = wt.charCodeAt(k)
            if (cc === 32 || cc === 9) {
                c = avoid(k)
                break
            }
        }
        if (c <= 0) {
            c = avoid(Math.min(PIECE, len))
        }
        if (c <= 0) {
            //段首即落在延伸超過段上限之命中區間內(ms[0]起於0)
            let b = ms.length > 0 && ms[0][0] === 0 ? ms[0][1] : len
            if (b < len || atEnd) {
                c = b
            }
            else {
                //命中區間延伸至窗尾而列未結束: 本列其餘以***取代(fail-closed)
                skip = true
                take(wEnd)
                return MASK
            }
        }
        let o = applyIvs(wt, ivs, c)
        take(p + c)
        return o
    }

    //run, 交出可確定之段; final為收尾(其後無文字)
    let run = (final) => {
        let out = ''
        waitUndec = false
        for (;;) {
            if (p >= buf.length) {
                break
            }
            let r = findEnd(final)
            waitUndec = r.undec >= 0
            let e = r.e
            if (e < 0 && final) {
                e = buf.length
            }
            if (skip) {
                if (e > 0) {
                    if (buf.charCodeAt(e - 1) === 10) {
                        out += '\n'
                    }
                    take(e)
                    skip = false
                    continue
                }
                if (r.undec < 0) {
                    take(buf.length) //丟棄未見列尾之文字
                }
                break
            }
            if (e > 0 && e - p <= LINE_MAX) {
                out += maskSeg(buf.slice(p, e))
                take(e)
                continue
            }
            let wEnd = -1
            if (e > 0) {
                wEnd = Math.min(p + W, e)
            }
            else if (buf.length - p >= W && (r.undec < 0 || r.undec > p + W)) {
                wEnd = p + W
            }
            if (wEnd < 0) {
                break //等待其後之文字
            }
            out += forced(wEnd, e > 0 && wEnd === e)
        }
        compact()
        return out
    }

    //toText, 一塊之文字(二進位以UTF-8串流解碼; 非二進位之塊先補完解碼器中不完整之位元組)
    let toText = (chunk) => {
        if (typeof chunk === 'string' && dec === null) {
            return chunk //常見之字串塊不做二進位之品牌試探(試探以拋錯判定, 成本較高)
        }
        let bin = false
        if (typeof chunk === 'object' && chunk !== null) {
            try {
                bin = ArrayBuffer.isView(chunk) || tryCall(BL_AB, chunk) !== NONE
            }
            catch (err) {
                bin = false
            }
        }
        if (bin) {
            if (typeof TextDecoder !== 'function') {
                return MASK
            }
            if (dec === null) {
                dec = new TextDecoder('utf-8')
            }
            try {
                return dec.decode(chunk, { stream: true })
            }
            catch (err) {
                dec = null
                return MASK
            }
        }
        let pre = ''
        if (dec !== null) {
            pre = dec.decode()
            dec = null
        }
        let t = typeof chunk
        if (t === 'string') {
            return pre + chunk
        }
        if (chunk === undefined || chunk === null) {
            return pre
        }
        if (t === 'number' || t === 'boolean' || t === 'bigint') {
            return pre + String(chunk)
        }
        if (t !== 'object' || isProxy(chunk)) {
            return pre + MASK
        }
        let s = tryCall(String.prototype.valueOf, chunk)
        return pre + (typeof s === 'string' ? s : MASK)
    }

    let push = (chunk) => {
        try {
            let t = toText(chunk)
            buf += t
            //無換行、無待判定之換行且未達長列之窗長: 此時必無可交出者, 不重掃緩衝(逐字元之小塊亦為攤銷線性)
            if (t.indexOf('\n') < 0 && !waitUndec && buf.length - p < W) {
                return ''
            }
            return run(false)
        }
        catch (err) {
            reset()
            return MASK
        }
    }

    let flush = () => {
        try {
            if (dec !== null) {
                buf += dec.decode()
                dec = null
            }
            let o = run(true)
            reset()
            return o
        }
        catch (err) {
            reset()
            return MASK
        }
    }

    return { push, flush }
}


export default genDiagStreamMasker
