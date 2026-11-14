import isarr from './isarr.mjs'


//isStrObj, 是否為String包裝物件(以內部槽判定: String.prototype.valueOf對非String物件拋TypeError, 不受Symbol.toStringTag偽裝影響)
function isStrObj(v) {
    try {
        String.prototype.valueOf.call(v)
        return true
    }
    catch (err) {
        return false
    }
}


/**
 * 由ltdt提取不重複keys，各列物件只依自有可列舉字串鍵(length視為一般鍵)，依各列與各鍵出現之先後排列
 *
 * 只有非陣列、非函數之物件列貢獻鍵；列為字串(含String包裝物件)、陣列、TypedArray(含DataView)、函數或其他非物件值(null、undefined、數字等)時不貢獻鍵；繼承之鍵與Symbol鍵不取
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getltdtkeys.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列，非陣列或空陣列回傳空陣列[]
 * @returns {Array} 回傳不重複keys陣列
 * @example
 *
 * console.log(getltdtkeys([{ a: 123, b: 'xyz', c: '45op', d: null }, { a: 123.456, b: 'xyz', d: '45op', e: '' }]))
 * // => ['a', 'b', 'c', 'd', 'e']
 *
 * console.log(getltdtkeys([{ a: 1 }, ['x', 'y'], 'str', { b: 2 }]))
 * // => ['a', 'b'] (陣列與字串列不貢獻鍵)
 *
 */
function getltdtkeys(ltdt) {

    //check, 參數層: 非陣列或空陣列回傳空陣列
    if (!isarr(ltdt)) {
        return []
    }

    //ks, 以Set累積不重複鍵, 插入順序即首次出現之順序(同原「逐列併入再去重」之結果與順序)
    let ks = new Set()
    for (let i = 0; i < ltdt.length; i++) {
        let v = ltdt[i]

        //只有非陣列、非函數之物件列貢獻鍵(使用者2026-11-14, 第430項第二批): typeof為object且非null、非陣列、非TypedArray/DataView、非String包裝物件
        if (typeof v !== 'object' || v === null) {
            continue
        }
        if (Array.isArray(v) || ArrayBuffer.isView(v)) {
            continue
        }
        if (isStrObj(v)) {
            continue
        }

        //只取自有可列舉字串鍵(Object.keys, length為一般鍵, R-OBJ-ITER-01)
        for (let k of Object.keys(v)) {
            ks.add(k)
        }
    }

    return [...ks]
}


export default getltdtkeys
