/**
 * 雜湊演算法opt.type(或opt.typeHash)之檢核，內部共用不對外(R-HASH-TYPE-01，W-08)
 *
 * 雜湊演算法決定校驗值之意義，屬安全相關opt，為K3(非預期視為未給而改用預設)之例外：給了而無效即拒絕(fail-closed)，不改用預設，免得靜默換演算法而回傳呼叫端非預期之雜湊
 *
 * 規則：undefined與null為未給(回傳null，由呼叫端取預設)；給了須為原始字串(包裝物件、數字、布林、物件、空字串皆無效)且為允許集合之成員；成員判定以陣列includes比對(不經物件鍵查找，故'constructor'、'toString'、'__proto__'等原型鏈名稱不會被誤判為有效)
 *
 * 允許集合：opt.list(固定集合，如以hash-wasm計算者)優先；否則為crypto.getHashes()之回傳(crypto未提供getHashes或其拋錯時無從核對集合，其餘字串視為通過，交createHash核對)，opt.xx為true時另允許'xxhash64'(依路徑，不經crypto)
 *
 * 訊息格式依V19且不帶值(V20)：`invalid <名稱>: must be one of <允許集合>`
 *
 * @param {*} type 輸入opt.type之值
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.name='opt.type'] 輸入訊息之名稱，預設'opt.type'
 * @param {Object} [opt.crypto=null] 輸入crypto物件，取其getHashes，預設null
 * @param {Boolean} [opt.xx=false] 輸入是否另允許'xxhash64'，預設false
 * @param {Array} [opt.list=null] 輸入固定允許集合(字串陣列)，預設null
 * @returns {String|null} 回傳null代表未給或有效，字串為無效時之說明字串
 */
function chkHashType(type, opt = {}) {
    if (type === undefined || type === null) {
        return null
    }
    let name = typeof opt.name === 'string' ? opt.name : 'opt.type'
    let xx = opt.xx === true
    let list = Array.isArray(opt.list) ? opt.list : null

    //msg, 允許集合之描述為固定詞彙(不含給定之值)
    let msg = list !== null ? `invalid ${name}: must be one of ${list.map((s) => `'${s}'`).join(', ')}` : (xx ? `invalid ${name}: must be 'xxhash64' or one of crypto.getHashes()` : `invalid ${name}: must be one of crypto.getHashes()`)

    //原始字串, 空字串無效
    if (typeof type !== 'string' || type === '') {
        return msg
    }

    //固定集合
    if (list !== null) {
        return list.includes(type) ? null : msg
    }

    //xxhash64
    if (xx && type === 'xxhash64') {
        return null
    }

    //crypto.getHashes()
    let hashes = null
    try {
        let crypto = opt.crypto
        if (crypto !== null && crypto !== undefined && typeof crypto.getHashes === 'function') {
            hashes = crypto.getHashes()
        }
    }
    catch (e) {
        hashes = null
    }
    if (Array.isArray(hashes)) {
        return hashes.includes(type) ? null : msg
    }

    return null //注入之crypto未提供getHashes, 無從核對集合, 交createHash核對
}


export default chkHashType
