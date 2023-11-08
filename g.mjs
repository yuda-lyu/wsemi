import fs from 'fs'
import filepathToTree from './src/filepathToTree.mjs'
import arrSort from './src/arrSort.mjs'

// let psSrc = [
//     [-0.1, -0.1, -0.1, 0],
//     [1, 0, 0, 0],
//     [1, 1, 0, 0],
//     [0, 0, 1, 0],
//     [1, 0, 1, 0],
//     [1, 1, 1, 10],
// ]
// let psTar = [
//     0.1, 0.1, 0.95
// ]
let psSrc = [
    [-0.1, -0.1, -0.1],
    [1, 0, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
]
let psTar = [
    [0.1, 0.1],
]
let r = {
    src: psSrc,
    pred: psTar,
}
console.log(JSON.stringify(r))

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
