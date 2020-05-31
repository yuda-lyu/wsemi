import arrpick from './src/arrpick.mjs'
import arrmapping from './src/arrmapping.mjs'

let r = [
    { a: 'a123', b: 123, c: 'abc' },
    { a: '1b23', b: 456, c: '123XYZ' },
    { a: '12c3', b: 789.0123, c: null }
]
console.log(arrmapping(r, ['a', 'b']))
// => [
//     { a: 'a123', b: 123 },
//     { a: '1b23', b: 456 },
//     { a: '12c3', b: 789.0123 }
// ]
console.log(arrmapping(r, ['a', 'c', 'x']))
// => [
//     { a: 'a123', c: 'abc', x: '' },
//     { a: '1b23', c: '123XYZ', x: '' },
//     { a: '12c3', c: null, x: '' }
// ]
