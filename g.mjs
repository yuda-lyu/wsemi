import _ from 'lodash-es'
// import bbb from './src/bbb.mjs'
import arrPull from './src/arrPull.mjs'

console.log(arrPull([1, 2, 3, 4, 5, 'abc'], [1, 4]))
// => [ 2, 3, 5, 'abc' ]

console.log(arrPull([1, 2, 3, '4', 5, 'abc'], [1, 4]))
// => [ 2, 3, '4', 5, 'abc' ]

console.log(arrPull([1, 2, 3, '4', 5, 'abc'], [6, 7]))
// => [ 1, 2, 3, '4', 5, 'abc' ]

//node --experimental-modules g.mjs
