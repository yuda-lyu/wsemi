import cttc from '@ctrl/tinycolor'
import isFunction from 'lodash/isFunction'

console.log('cttc', isFunction(cttc))
let TinyColor = cttc.default
console.log('TinyColor', TinyColor)

let r = new TinyColor({
    h: 0.5 * 100,
    s: 0.5 * 100,
    l: 0.5 * 100
}).toHexString()

console.log(r)
