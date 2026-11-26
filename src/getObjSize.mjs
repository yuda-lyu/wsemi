/**
 * 計算物件記憶體大小
 *
 * 為估算值(數字8 bytes、字串每字元2 bytes、布林4 bytes，一般物件與陣列逐一累計自有可列舉鍵之值，其餘物件以toString之字串長度估算)，並非實際配置量。
 * 無原型之物件(Object.create(null))與含自有鍵hasOwnProperty之物件照常計算(不依賴物件自身之方法)；循環參照之物件無法計算，會拋出呼叫堆疊溢位之RangeError。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getObjSize.test.mjs Github}
 * @memberOf wsemi
 * @param {*} obj 傳入欲計算大小的任意數據
 * @returns {Object} 回傳記憶體大小物件, int屬性為記憶體所使用的bytes整數, str屬性為自動處理單位後的字串
 * @example
 *
 * console.log(getObjSize('abc123'))
 * // => { int: 12, str: '12 bytes' }
 *
 * console.log(getObjSize({ a: 123, b: 'xyz', c: '45op', d: null }))
 * // => { int: 22, str: '22 bytes' }
 *
 * console.log(getObjSize(Object.assign(Object.create(null), { a: 123 })).int)
 * // => 8
 *
 */
function getObjSize(obj) {

    let hasOwn = Object.prototype.hasOwnProperty
    let bytes = 0

    function sizeOf(obj) {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
            case 'number':
                bytes += 8
                break
            case 'string':
                bytes += obj.length * 2
                break
            case 'boolean':
                bytes += 4
                break
            case 'object':
                let objClass = Object.prototype.toString.call(obj).slice(8, -1)
                if (objClass === 'Object' || objClass === 'Array') {
                    for (let key in obj) {
                        if (!hasOwn.call(obj, key)) continue //不用obj.hasOwnProperty: 無原型之物件無此方法, 自有鍵hasOwnProperty亦會覆蓋之
                        sizeOf(obj[key])
                    }
                }
                else {
                    //無toString之物件(無原型而帶其他內部標籤者)改取內部標籤字串, 不拋錯
                    let str = ''
                    try {
                        str = obj.toString()
                    }
                    catch (err) {
                        str = Object.prototype.toString.call(obj)
                    }
                    bytes += String(str).length * 2
                }
                break
            }
        }
        return bytes
    }

    function formatByteSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes'
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KiB'
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MiB'
        else return (bytes / 1073741824).toFixed(3) + ' GiB'
    }

    let isize = sizeOf(obj)
    let csize = formatByteSize(isize)

    return {
        int: isize,
        str: csize
    }
}


export default getObjSize
