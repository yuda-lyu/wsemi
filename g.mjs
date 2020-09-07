import arrhas from './src/arrhas.mjs'

console.log(arrhas([1, 2, 3, '4', 5, 'abc'], 2))
// => true

console.log(arrhas([1, 2, 3, '4', 5, 'abc'], 6))
// => false

console.log(arrhas([1, 2, 3, '4', 5, 'abc'], [2]))
// => true

console.log(arrhas([1, 2, 3, '4', 5, 'abc'], [6]))
// => false

console.log(arrhas([1, 2, 3, '4', 5, 'abc'], ['4', 2]))
// => true

console.log(arrhas([1, 2, 3, '4', 5, 'abc'], ['7', 6]))
// => false

console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], true))
// => true

console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], false))
// => false

console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], [true]))
// => true

console.log(arrhas([1, true, 2, 3, '4', true, 5, 'abc'], [false]))
// => false

console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }))
// => true

console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'opqr' }))
// => false

console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]))
// => true

console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'opqr' }]))
// => false

console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]))
// => true

console.log(arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['7', { x: 'opqr' }]))
// => false


