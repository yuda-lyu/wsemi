import _ from 'lodash-es'
import arrPullAt from './src/arrPullAt.mjs'


console.log(arrPullAt([1, 2, 3, 4, 5, 'abc'], [0, 2]))
// => [ 2, 4, 5, 'abc' ]

console.log(arrPullAt([1, 2, 3, '4', 5, 'abc'], [1, 3]))
// => [ 1, 3, 5, 'abc' ]

console.log(arrPullAt([1, 2, 3, '4', 5, 'abc'], [4, 7]))
// => [ 1, 2, 3, '4', 'abc' ]

//node --experimental-modules g.mjs
