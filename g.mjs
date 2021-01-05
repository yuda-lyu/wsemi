import treeObj from './src/treeObj.mjs'

let r
let data = {
    a: 123,
    b: 145.67,
    c: 'test中文1',
    d: true,
    e: function() {},
    f: [11, 'xyz', false, new Uint8Array([166, 197, 215])],
    g: {
        ga: 223,
        gb: 245.67,
        gc: 'test中文2',
        gd: new Uint8Array([66, 97, 115]),
    },
    h: Symbol('foo'),
    [Symbol('i-sym-key')]: 'i-sym-value',
}

r = treeObj(data, (value, key, nk) => {
    console.log('=>', value, key, nk)
    return value
})
console.log('force: false', r)
// => 123 a []
// => 145.67 b []
// => test中文1 c []
// => true d []
// => [Function: e] e []
// => [ 11, 'xyz', false, Uint8Array(3) [ 166, 197, 215 ] ] f []
// => 11 0 [ 'f' ]
// => xyz 1 [ 'f' ]
// => false 2 [ 'f' ]
// => Uint8Array(3) [ 166, 197, 215 ] 3 [ 'f' ]
// => {
//   ga: 223,
//   gb: 245.67,
//   gc: 'test中文2',
//   gd: Uint8Array(3) [ 66, 97, 115 ]
// } g []
// => 223 ga [ 'g' ]
// => 245.67 gb [ 'g' ]
// => test中文2 gc [ 'g' ]
// => Uint8Array(3) [ 66, 97, 115 ] gd [ 'g' ]
// => Symbol(foo) h []
// force: false {
//   a: 123,
//   b: 145.67,
//   c: 'test中文1',
//   d: true,
//   e: [Function: e],
//   f: [ 11, 'xyz', false, Uint8Array(3) [ 166, 197, 215 ] ],
//   g: {
//     ga: 223,
//     gb: 245.67,
//     gc: 'test中文2',
//     gd: Uint8Array(3) [ 66, 97, 115 ]
//   },
//   h: Symbol(foo)
// }

r = treeObj(data, (value, key, nk) => {
    console.log('=>', value, key, nk)
    return value
}, { force: true })
console.log('force: true', r)
// => 123 a []
// => 145.67 b []
// => test中文1 c []
// => true d []
// => [Function: e] e []
// => [ 11, 'xyz', false, Uint8Array(3) [ 166, 197, 215 ] ] f []
// => 11 0 [ 'f' ]
// => xyz 1 [ 'f' ]
// => false 2 [ 'f' ]
// => Uint8Array(3) [ 166, 197, 215 ] 3 [ 'f' ]
// => {
//   ga: 223,
//   gb: 245.67,
//   gc: 'test中文2',
//   gd: Uint8Array(3) [ 66, 97, 115 ]
// } g []
// => 223 ga [ 'g' ]
// => 245.67 gb [ 'g' ]
// => test中文2 gc [ 'g' ]
// => Uint8Array(3) [ 66, 97, 115 ] gd [ 'g' ]
// => Symbol(foo) h []
// => i-sym-value Symbol(i-sym-key) []
// force: true {
//   a: 123,
//   b: 145.67,
//   c: 'test中文1',
//   d: true,
//   e: [Function: e],
//   f: [ 11, 'xyz', false, Uint8Array(3) [ 166, 197, 215 ] ],
//   g: {
//     ga: 223,
//     gb: 245.67,
//     gc: 'test中文2',
//     gd: Uint8Array(3) [ 66, 97, 115 ]
//   },
//   h: Symbol(foo),
//   [Symbol(i-sym-key)]: 'i-sym-value'
// }
