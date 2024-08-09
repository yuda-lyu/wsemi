import _ from 'lodash-es'
import arrReverse from './src/arrReverse.mjs'

console.log(arrReverse([1, 2, 3, 4, 5, 'abc']))
// => [ 'abc', 5, 4, 3, 2, 1 ]

console.log(arrReverse([1, 2, 3, '4', 5, 'abc']))
// => [ 'abc', 5, '4', 3, 2, 1 ]

//node --experimental-modules g.mjs
