import arradd from './src/arradd.mjs'

let v1 = [1, 2, 3, 4]
let v2 = [0.1, 0.1, 0.1, 0.1]
let v3 = [11, 22, 33, 44]
console.log(arradd(v1, v2))
// => [ 1.1, 2.1, 3.1, 4.1 ]
console.log(arradd(v1, v2, v3))
// => [ 12.1, 24.1, 36.1, 48.1 ]

//node --experimental-modules --es-module-specifier-resolution=node g.mjs

