/**
 * 計算物件記憶體大小
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getObjSize.test.js Github}
 * @memberOf wsemi
 * @param {*} obj 傳入欲計算大小的任意數據
 * @returns {Object} 回傳記憶體大小物件, int屬性為記憶體所使用的bytes整數, str屬性為自動處理單位後的字串
 * @example
 * console.log(getObjSize('abc123'))
 * // => 12
 *
 * console.log(getObjSize({ a: 123, b: 'xyz', c: '45op', d: null }))
 * // => 22
 */
function getObjSize(obj) {

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
                        if (!obj.hasOwnProperty(key)) continue
                        sizeOf(obj[key])
                    }
                }
                else {
                    bytes += obj.toString().length * 2
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
