//colorSpreadRunner.mjs: 子行程執行器, 供 test/isenumCallersCalc.test.mjs 驗 color.spreadHue/spreadMonochromatic 對 Infinity 類輸入不會掛住或記憶體耗盡
//  約定: node colorSpreadRunner.mjs <fn:spreadHue|spreadMonochromatic>/<輸入代號> -> stdout一行'@@R@@'+JSON({ ok, msg|len })
//  為何用子行程: 修前之isint收Infinity(cdbl後為Number.MAX_VALUE), for(i<num)不會結束而記憶體耗盡(離開碼134), 在測試行程內直接呼叫會拖垮整個mocha
import color from '../../src/color.mjs'


let INPUTS = {
    'inf': Infinity,
    'ninf': -Infinity,
    'infstr': 'Infinity',
    'e400': '1e400',
    'hex': '0x10',
    'wrapper': new Number(3), // eslint-disable-line no-new-wrappers
    'three': 3,
    'threestr': ' 3 ',
}

let [fn, key] = String(process.argv[2] || '').split('/')
let r = null
try {
    let out = color[fn]('#336699', INPUTS[key])
    r = { ok: true, len: out.length }
}
catch (err) {
    r = { ok: false, msg: err.message }
}
console.log('@@R@@' + JSON.stringify(r))
