import pseudoRandomIntRange from './src/pseudoRandomIntRange.mjs'

let r

r = pseudoRandomIntRange()
console.log('pseudoRandomIntRange', r)
// => 43 (預設範圍為0至100)

r = pseudoRandomIntRange(0, 100)
console.log('pseudoRandomIntRange(0,100)', r)
// => 58 //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同

r = pseudoRandomIntRange(123, 4567)
console.log('pseudoRandomIntRange(12.3,456.7)', r)
// => 2572


//node --experimental-modules --es-module-specifier-resolution=node g.mjs

