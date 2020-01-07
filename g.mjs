import str2u8arr from './src/str2u8arr.mjs'
import u8arr2str from './src/u8arr2str.mjs'

console.log(str2u8arr('test中文'))
// => Uint8Array [116, 101, 115, 116, 228, 184, 173, 230, 150, 135]

console.log(u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])))
// => test中文


//node --experimental-modules --es-module-specifier-resolution=node g.mjs

