import * as XLSX from 'xlsx' //xlsx於vue-cli匯入時變成modulus而缺少default
import get from 'lodash-es/get'
import iseobj from './iseobj.mjs'
import getGlobal from './getGlobal.mjs'
// console.log('XLSX', XLSX)


function getXLSX() {
    //因動態加載組件又被vue-cli環境引用組件後, 專案內部使用XLSX會引用到空物件, 有可能是打包成瀏覽器端umd添加取default, 導致引用不到有效XLSX

    //g
    let g = getGlobal()

    let XLSXutils = get(XLSX, 'utils')
    if (iseobj(XLSXutils)) {
        return XLSX
    }

    let XLSXDefaultutils = get(XLSX, 'default.utils')
    if (iseobj(XLSXDefaultutils)) {
        return get(XLSX, 'default')
    }

    let gXLSXutils = get(g, 'XLSX.utils')
    if (iseobj(gXLSXutils)) {
        return get(g, 'XLSX')
    }

    let gXLSXDefaultutils = get(g, 'XLSX.default.utils')
    if (iseobj(gXLSXDefaultutils)) {
        return get(g, 'XLSX.default')
    }

    let gxlsxutils = get(g, 'xlsx.utils')
    if (iseobj(gxlsxutils)) {
        return get(g, 'xlsx')
    }

    let gxlsxDefaultutils = get(g, 'xlsx.default.utils')
    if (iseobj(gxlsxDefaultutils)) {
        return get(g, 'xlsx.default')
    }

    console.log('XLSX', XLSX, 'g.XLSX', g.XLSX, 'g.xlsx', g.xlsx)
    throw new Error('invalid XLSX, g.XLSX, g.xlsx')
}


export default getXLSX
