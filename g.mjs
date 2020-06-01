import arr2dt from './src/arr2dt.mjs'

console.log(arr2dt(['a', 'b']))
// => { 'a': '', 'b': '' }
console.log(arr2dt(['a', 'b'], 'xyz'))
// => { a: 'xyz', b: 'xyz' }
console.log(arr2dt(['a', 'b'], null))
// => { a: null, b: null }
console.log(arr2dt(['a', 'b'], [12.3, '456a']))
// => { 'a': 12.3, 'b': '456a' }
console.log(arr2dt(['a', 'b'], [null, '456a']))
// => { 'a': null, 'b': '456a' }
console.log(arr2dt(['a', 'b'], [12.3]))
// => {}
console.log(arr2dt(['a', 'b'], {}))
// => { a: {}, b: {} }
//node --experimental-modules --es-module-specifier-resolution=node g.mjs

