import arrMax from './src/arrMax.mjs'

let r

r = arrMax([100000, 1, 30, 4, 21])
console.log(r)
// => 100000

r = arrMax([1, 30, 4, 21, 100000])
console.log(r)
// => 100000

r = arrMax([1, 30, 4, 100000, 21])
console.log(r)
// => 100000

r = arrMax([1, 30, 4, 100000, 21], { returnIndex: true })
console.log(r)
// => 3

r = arrMax(['March', 'Jan', 'Feb', 'Dec'])
console.log(r)
// => null

r = arrMax(['1', '30', '  4  ', '100000', '21'])
console.log(r)
// => 100000

r = arrMax(['1', '30', '  4  ', '100000', 21])
console.log(r)
// => 100000

r = arrMax(['a1', 'b30', '  4  ', '100000', 21])
console.log(r)
// => 100000

r = arrMax(
    [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }, { s: 'Nov', i: 'a25', }],
    { compareKey: 'i' }
)
console.log(r)
// => { s: 'Feb', i: 100000 }

r = arrMax(
    [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }, { s: 'Nov', i: 'a25', }],
    { compareKey: 's' }
)
console.log(r)
// => null

r = arrMax(
    [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }, { s: 'Nov', i: 'a25', }],
    { compareKey: 'i', returnIndex: true }
)
console.log(r)
// => 2


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
