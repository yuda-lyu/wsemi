import _ from 'lodash-es'
import pseudoRandomIntsNdpRange from './src/pseudoRandomIntsNdpRange.mjs'


let rs

rs = pseudoRandomIntsNdpRange()
console.log('pseudoRandomIntsNdpRange', rs)
// => pseudoRandomIntsNdpRange [ 1 ] (預設範圍為0至100)

rs = pseudoRandomIntsNdpRange(0, 100)
console.log('pseudoRandomIntsNdpRange(0,100)', rs)
// => pseudoRandomIntsNdpRange(0,100) [ 85 ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同

rs = pseudoRandomIntsNdpRange(0, 100, 2)
console.log('pseudoRandomIntsNdpRange(0,100)', rs)
// => pseudoRandomIntsNdpRange(0,100) [ 59, 20 ]

rs = pseudoRandomIntsNdpRange(123, 4567)
console.log('pseudoRandomIntsNdpRange(123,4567)', rs)
// => pseudoRandomIntsNdpRange(123,4567) [ 3951 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 123)
console.log('pseudoRandomIntsNdpRange(null,null,2,123)', rs)
// => pseudoRandomIntsNdpRange(null,null,2,123) [ 94, 76 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 12.3)
console.log('pseudoRandomIntsNdpRange(null,null,2,12.3)', rs)
// => pseudoRandomIntsNdpRange(null,null,2,12.3) [ 69, 82 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
console.log('pseudoRandomIntsNdpRange(null,null,2,"abc")', rs)
// => pseudoRandomIntsNdpRange(null,null,2,"abc") [ 20, 28 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
console.log('pseudoRandomIntsNdpRange(null,null,2,"abc")', rs)
// => pseudoRandomIntsNdpRange(null,null,2,"abc") [ 20, 28 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 'def')
console.log('pseudoRandomIntsNdpRange(null,null,2,"def")', rs)
// => pseudoRandomIntsNdpRange(null,null,2,"def") [ 64, 34 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 'BH01S123')
console.log('pseudoRandomIntsNdpRange(null,null,2,"BH01S123")', rs)
// => pseudoRandomIntsNdpRange(null,null,2,"BH01S123") [ 0, 26 ]

rs = pseudoRandomIntsNdpRange(null, null, 2, 'BH-01:S-123')
console.log('pseudoRandomIntsNdpRange(null,null,2,"BH-01:S-123")', rs)
// => pseudoRandomIntsNdpRange(null,null,2,"BH-01:S-123") [ 71, 77 ]

rs = pseudoRandomIntsNdpRange(0, 100, 2, 123)
console.log('pseudoRandomIntsNdpRange(0,100,2,123)', rs)
// => pseudoRandomIntsNdpRange(0,100,2,123) [ 94, 76 ]

rs = pseudoRandomIntsNdpRange(0, 100, 2, 12.3)
console.log('pseudoRandomIntsNdpRange(0,100,2,12.3)', rs)
// => pseudoRandomIntsNdpRange(0,100,2,12.3) [ 69, 82 ]

rs = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
console.log('pseudoRandomIntsNdpRange(0,100,2,"abc")', rs)
// => pseudoRandomIntsNdpRange(0,100,2,"abc") [ 20, 28 ]

rs = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
console.log('pseudoRandomIntsNdpRange(0,100,2,"abc")', rs)
// => pseudoRandomIntsNdpRange(0,100,2,"abc") [ 20, 28 ]

rs = pseudoRandomIntsNdpRange(0, 100, 2, 'def')
console.log('pseudoRandomIntsNdpRange(0,100,2,"def")', rs)
// => pseudoRandomIntsNdpRange(0,100,2,"def") [ 64, 34 ]

rs = pseudoRandomIntsNdpRange(0, 100, 2, 'BH-01:S-123')
console.log('pseudoRandomIntsNdpRange(0,100,2,"BH-01:S-123")', rs)
// => pseudoRandomIntsNdpRange(0,100,2,"BH-01:S-123") [ 71, 77 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 123)
console.log('pseudoRandomIntsNdpRange(123,4567,2,123)', rs)
// => pseudoRandomIntsNdpRange(123,4567,2,123) [ 2528, 3854 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)
console.log('pseudoRandomIntsNdpRange(123,4567,2,12.3)', rs)
// => pseudoRandomIntsNdpRange(123,4567,2,12.3) [ 1818, 4334 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
console.log('pseudoRandomIntsNdpRange(123,456.7,2,"abc")', rs)
// => pseudoRandomIntsNdpRange(123,456.7,2,"abc") [ 478, 3303 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
console.log('pseudoRandomIntsNdpRange(123,456.7,2,"abc")', rs)
// => pseudoRandomIntsNdpRange(123,456.7,2,"abc") [ 478, 3303 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'def')
console.log('pseudoRandomIntsNdpRange(123,456.7,2,"def")', rs)
// => pseudoRandomIntsNdpRange(123,456.7,2,"def") [ 983, 3133 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH01S123')
console.log('pseudoRandomIntsNdpRange(123,456.7,2,"BH01S123")', rs)
// => pseudoRandomIntsNdpRange(123,456.7,2,"BH01S123") [ 2866, 183 ]

rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH-01:S-123')
console.log('pseudoRandomIntsNdpRange(123,456.7,2,"BH-01:S-123")', rs)
// => pseudoRandomIntsNdpRange(123,456.7,2,"BH-01:S-123") [ 3888, 249 ]

//node --experimental-modules g.mjs
