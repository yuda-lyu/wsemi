// import * as pd from 'pyodide'
// console.log('pd', pd)
// let loadPyodide = pd.loadPyodide //無法使用import, 會出現Error: Could not extract indexURL path from pyodide module location

let _loadPyodide = null
try {
    let { loadPyodide } = require('pyodide') //require於瀏覽器運行時因沒有require會報錯, 前端得要自行加載或使用Dyn版
    // console.log('loadPyodide', loadPyodide)
    _loadPyodide = loadPyodide
}
catch (err) {
    // console.log(err)
}

module.exports = _loadPyodide
