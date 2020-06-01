import ltdtpull from './src/ltdtpull.mjs'

console.log(ltdtpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'))
// => [ { x: 2, y: 'y2' } ]
console.log(ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id'))
// => [ { id: 2, v: 'v2' } ]
//node --experimental-modules --es-module-specifier-resolution=node g.mjs

