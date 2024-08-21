import _ from 'lodash-es'
import randomIntsNdpRange from './src/randomIntsNdpRange.mjs'


let rs

rs = randomIntsNdpRange()
console.log('randomIntsNdpRange', rs)
// => randomIntsNdpRange [ [0,100] ] (預設範圍為0至100)

rs = randomIntsNdpRange(0, 100)
console.log('randomIntsNdpRange(0,100)', rs)
// => randomIntsNdpRange(0,100) [ [0,100] ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同

rs = randomIntsNdpRange(0, 100, 2)
console.log('randomIntsNdpRange(0,100)', rs)
// => randomIntsNdpRange(0,100) [ [0,100], [0,100] ]

rs = randomIntsNdpRange(123, 4567)
console.log('randomIntsNdpRange(123,4567)', rs)
// => randomIntsNdpRange(123,4567) [ [123,4567], [123,4567] ]

//node --experimental-modules g.mjs
