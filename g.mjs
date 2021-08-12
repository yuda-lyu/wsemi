import istimemsTZ from './src/istimemsTZ.mjs'


// console.log(istimemsTZ('2019-01-01T12:34:56.789+08:00'))
// // => true

// console.log(istimemsTZ('2019-01-01T12:34:56:789+08:00'))
// // => false

// console.log(istimemsTZ('2019-01-01T12:34:56+08:00'))
// // => false

// console.log(istimemsTZ('2019-01-01'))
// // => false

console.log(istimemsTZ('2019-01-01T12:34:56.321Z'))

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
