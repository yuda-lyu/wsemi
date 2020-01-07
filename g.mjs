import obj2stru8arr from './src/obj2stru8arr.mjs'
import stru8arr2obj from './src/stru8arr2obj.mjs'

let data = {
    a: 123,
    b: 45.67,
    c: 'l1-測試中文',
    d: {
        da: 123,
        db: 45.67,
        dc: 'l2-測試中文',
        dd: ['a', 'xyz', 321, 76.54],
        de: new Uint8Array([66, 97, 115]),
    },
}
let r = obj2stru8arr(data)
console.log(r)
// => {
//     results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}',
//     binarys: [ Uint8Array [ 66, 97, 115 ] ]
// }

let inp = {
    results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}',
    binarys: [new Uint8Array([66, 97, 115])]
}
let d = stru8arr2obj(inp)
console.log(d)
// => {
//     a: 123,
//     b: 45.67,
//     c: 'l1-測試中文',
//     d: {
//         da: 123,
//         db: 45.67,
//         dc: 'l2-測試中文',
//         dd: [ 'a', 'xyz', 321, 76.54 ],
//         de: Uint8Array [ 66, 97, 115 ]
//     }
// }


//node --experimental-modules --es-module-specifier-resolution=node g.mjs

