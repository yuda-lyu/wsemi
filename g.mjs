// import fs from 'fs'
import genPm from './src/genPm.mjs'
import at from './src/attstr.mjs'


let c
let c1
let c2
let r

//parse
console.log('parse')

c = 'abc123'
r = at.parse(c)
console.log(r)
// => [ 'abc123' ]

c = 'abc123;abc123'
r = at.parse(c)
console.log(r)
// => [ 'abc123' ]

c = 'abc123;def456'
r = at.parse(c)
console.log(r)
// => [ 'abc123', 'def456' ]

c = 'abc@123'
r = at.parse(c)
console.log(r)
// => [ { item: 'abc@123', table: 'abc', id: '123' } ]

c = 'abc@123;abc@123'
r = at.parse(c)
console.log(r)
// => [ { item: 'abc@123', table: 'abc', id: '123' } ]

c = 'abc@123;def@456'
r = at.parse(c)
console.log(r)
// => [
//   { item: 'abc@123', table: 'abc', id: '123' },
//   { item: 'def@456', table: 'def', id: '456' }
// ]

c = ''
r = at.parse(c)
console.log(r)
// => []

//join
console.log('join')

c = ['abc123']
r = at.join(c)
console.log(r)
// => 'abc123'

c = ['abc123', 'def456']
r = at.join(c)
console.log(r)
// => 'abc123;def456'

c = ['abc@123']
r = at.join(c)
console.log(r)
// => 'abc@123'

c = ['abc@123', 'def@456']
r = at.join(c)
console.log(r)
// => 'abc@123;def@456'

c = [{ table: 'abc', id: '123' }, { table: 'def', id: '456' }]
r = at.join(c)
console.log(r)
// => 'abc@123;def@456'

c = []
r = at.join(c)
console.log(r)
// => ''

//add
console.log('add')

c1 = 'abc123'
c2 = 'def456'
r = at.add(c1, c2)
console.log(r)
// => abc123;def456

c1 = 'abc123'
c2 = 'def456;ghi789'
r = at.add(c1, c2)
console.log(r)
// => abc123;def456;ghi789

c1 = 'abc123'
c2 = 'abc123'
r = at.add(c1, c2)
console.log(r)
// => abc123

c1 = 'abc123'
c2 = 'abc123;def456'
r = at.add(c1, c2)
console.log(r)
// => abc123;def456

c1 = 'abc123;ghi789'
c2 = 'abc123;def456'
r = at.add(c1, c2)
console.log(r)
// => abc123;ghi789;def456

c1 = ''
c2 = 'abc123'
r = at.add(c1, c2)
console.log(r)
// => abc123

c1 = ''
c2 = 'abc123;def456'
r = at.add(c1, c2)
console.log(r)
// => abc123;def456

c1 = 'abc@123'
c2 = 'def@456'
r = at.add(c1, c2)
console.log(r)
// => abc@123;def@456

c1 = 'abc@123'
c2 = 'def@456;ghi@789'
r = at.add(c1, c2)
console.log(r)
// => abc@123;def@456;ghi@789

c1 = 'abc@123;ghi@789'
c2 = 'abc@123;def@456'
r = at.add(c1, c2)
console.log(r)
// => abc@123;ghi@789;def@456

c1 = ''
c2 = 'abc@123'
r = at.add(c1, c2)
console.log(r)
// => abc@123

c1 = ''
c2 = 'abc@123;def@456'
r = at.add(c1, c2)
console.log(r)
// => abc@123;def@456

//remove
console.log('remove')

c1 = 'abc123'
c2 = 'abc123'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = 'abc123;def456'
c2 = 'abc123'
r = at.remove(c1, c2)
console.log(r)
// => def456

c1 = 'abc123'
c2 = 'def456'
r = at.remove(c1, c2)
console.log(r)
// => abc123

c1 = 'abc123'
c2 = 'ghi789;jkl012'
r = at.remove(c1, c2)
console.log(r)
// => abc123

c1 = 'abc123'
c2 = 'abc123;jkl012'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = 'abc123;def456'
c2 = 'ghi789;jkl012'
r = at.remove(c1, c2)
console.log(r)
// => abc123;def456

c1 = 'abc123;def456'
c2 = 'def456;jkl012'
r = at.remove(c1, c2)
console.log(r)
// => abc123

c1 = ''
c2 = 'ghi789'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = ''
c2 = 'ghi789;jkl012'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = 'abc@123'
c2 = 'abc@123'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = 'abc@123;def@456'
c2 = 'abc@123'
r = at.remove(c1, c2)
console.log(r)
// => def@456

c1 = 'abc@123'
c2 = 'def@456'
r = at.remove(c1, c2)
console.log(r)
// => abc@123

c1 = 'abc@123'
c2 = 'ghi@789;jkl@012'
r = at.remove(c1, c2)
console.log(r)
// => abc@123

c1 = 'abc@123'
c2 = 'abc@123;jkl@012'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = 'abc@123;def@456'
c2 = 'ghi@789;jkl@012'
r = at.remove(c1, c2)
console.log(r)
// => abc@123;def@456

c1 = 'abc@123;def@456'
c2 = 'def@456;jkl@012'
r = at.remove(c1, c2)
console.log(r)
// => abc@123

c1 = ''
c2 = 'ghi@789'
r = at.remove(c1, c2)
console.log(r)
// => ''

c1 = ''
c2 = 'ghi@789;jkl@012'
r = at.remove(c1, c2)
console.log(r)
// => ''


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
