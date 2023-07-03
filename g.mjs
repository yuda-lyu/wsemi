import pseudoRandom from './src/pseudoRandom.mjs'
import pseudoRandomRange from './src/pseudoRandomRange.mjs'
import pseudoRandomIntRange from './src/pseudoRandomIntRange.mjs'
import filepathToTree from './src/filepathToTree.mjs'
import treeToFilepath from './src/treeToFilepath.mjs'


let fps1 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
let r1 = filepathToTree(fps1)
console.log('r1.treeItems', JSON.stringify(r1.treeItems) + '\n\n')
// => r1.treeItems [
//   {
//     ns: 1,
//     ts: [ 'root' ],
//     pathInfors: [ [Object] ],
//     _type: 'folder',
//     type: 'array',
//     numOfChilren: -1,
//     id: 'root',
//     parentId: '',
//     text: 'root',
//     children: [ [Object] ],
//     data: null
//   }
// ]

let rfps1 = treeToFilepath(r1.treeItems, {})
// console.log('rfps1', JSON.stringify(rfps1))
// => rfps1 [
//   { type: 'folder', path: '/aaa' },
//   { type: 'folder', path: '/aaa/bbb' },
//   { type: 'file', path: '/aaa/bbb/z1.txt' }
// ]

let fps2 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa1.txt' }, { 'type': 'file', 'path': '/aaa2.txt' }, { 'type': 'folder', 'path': '/aaa/aaabbb' }, { 'type': 'file', 'path': '/aaa/aaabbb.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/aaabbbccc.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd/abcde.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef1.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef2.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg01.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg02.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg03.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg04.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg05.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg06.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg07.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg08.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg09.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg10.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg11.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg12.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg13.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg14.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg15.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg16.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg17.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg18.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg19.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg20.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd1.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd2.txt' }, { 'type': 'folder', 'path': '/bbb' }, { 'type': 'file', 'path': '/ccc/cccddd/cccdddeee.txt' }, { 'type': 'folder', 'path': '/eee' }, { 'type': 'folder', 'path': '/eee/eeefff1' }, { 'type': 'folder', 'path': '/eee/eeefff2' }, { 'type': 'folder', 'path': '/ggg/' }, { 'type': 'folder', 'path': 'c:\\\\hhh' }, { 'type': 'folder', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'type': 'file', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt' }, { 'type': 'file', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt' }, { 'type': 'folder', 'path': 'd:\\\\中文路徑1' }, { 'type': 'folder', 'path': '/中文路徑2' }, { 'type': 'file', 'path': '/中文路徑2/aaa/aaabbb/abc/測試.txt' }]
let r2 = filepathToTree(fps2, { delimiter: '>' })
console.log('r2.treeItems', JSON.stringify(r2.treeItems) + '\n\n')
// => r2.treeItems [
//   {
//     ns: 1,
//     ts: [ 'root' ],
//     pathInfors: [ [Object] ],
//     _type: 'folder',
//     type: 'array',
//     numOfChilren: -1,
//     id: 'root',
//     parentId: '',
//     text: 'root',
//     children: [
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object]
//     ],
//     data: null
//   }
// ]

let rfps2 = treeToFilepath(r2.treeItems, {})
// console.log('rfps2', JSON.stringify(rfps2))
// rfps2 [
//   { type: 'folder', path: '/aaa' },
//   { type: 'folder', path: '/aaa/aaabbb' },
//   { type: 'folder', path: '/aaa/aaabbb/abc' },
//   { type: 'folder', path: '/aaa/aaabbb/abc/abcd' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcd/abcde.txt' },
//   { type: 'folder', path: '/aaa/aaabbb/abc/abcde' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdef1.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdef2.txt' },
//   {
//     type: 'file',
//     path: '/aaa/aaabbb/abc/abcde/abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt'
//   },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg01.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg02.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg03.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg04.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg05.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg06.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg07.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg08.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg09.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg10.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg11.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg12.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg13.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg14.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg15.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg16.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg17.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg18.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg19.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcde/abcdefg20.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcd1.txt' },
//   { type: 'file', path: '/aaa/aaabbb/abc/abcd2.txt' },
//   { type: 'file', path: '/aaa/aaabbb/aaabbbccc.txt' },
//   { type: 'file', path: '/aaa/aaabbb.txt' },
//   { type: 'folder', path: '/aaaa' },
//   {
//     type: 'folder',
//     path: '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff'
//   },
//   {
//     type: 'folder',
//     path: '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg'
//   },
//   {
//     type: 'file',
//     path: '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt'
//   },
//   {
//     type: 'file',
//     path: '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt'
//   },
//   { type: 'folder', path: '/bbb' },
//   { type: 'folder', path: '/c:' },
//   { type: 'folder', path: '/c:/hhh' },
//   { type: 'folder', path: '/ccc' },
//   { type: 'folder', path: '/ccc/cccddd' },
//   { type: 'file', path: '/ccc/cccddd/cccdddeee.txt' },
//   { type: 'folder', path: '/d:' },
//   { type: 'folder', path: '/d:/中文路徑1' },
//   { type: 'folder', path: '/eee' },
//   { type: 'folder', path: '/eee/eeefff1' },
//   { type: 'folder', path: '/eee/eeefff2' },
//   { type: 'folder', path: '/ggg' },
//   { type: 'folder', path: '/中文路徑2' },
//   { type: 'folder', path: '/中文路徑2/aaa' },
//   { type: 'folder', path: '/中文路徑2/aaa/aaabbb' },
//   { type: 'folder', path: '/中文路徑2/aaa/aaabbb/abc' },
//   { type: 'file', path: '/中文路徑2/aaa/aaabbb/abc/測試.txt' },
//   { type: 'file', path: '/aaa1.txt' },
//   { type: 'file', path: '/aaa2.txt' }
// ]

let fps3 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }, { 'type': 'file', 'path': '/aaa/bbb/z2.txt' }, { 'type': 'file', 'path': '/aaa/bbb/z10.txt' }]
let r3 = filepathToTree(fps3)
console.log('r3.treeItems', JSON.stringify(r3.treeItems) + '\n\n')
// => r3.treeItems [
//   {
//     ns: 1,
//     ts: [ 'root' ],
//     pathInfors: [ [Object] ],
//     _type: 'folder',
//     type: 'array',
//     numOfChilren: -1,
//     id: 'root',
//     parentId: '',
//     text: 'root',
//     children: [ [Object], [Object], [Object], [Object] ],
//     data: null
//   }
// ]

let rfps3 = treeToFilepath(r3.treeItems, {})
// console.log('rfps3', JSON.stringify(rfps3))
// => rfps3 [
//   { type: 'folder', path: '/aaa' },
//   { type: 'folder', path: '/aaa/bbb' },
//   { type: 'file', path: '/aaa/bbb/z1.txt' },
//   { type: 'file', path: '/aaa/bbb/z10.txt' },
//   { type: 'file', path: '/aaa/bbb/z2.txt' },
//   { type: 'folder', path: '/aaa1' },
//   { type: 'folder', path: '/aaa10' },
//   { type: 'folder', path: '/aaa2' }
// ]

let fps4 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
let r4 = filepathToTree(fps4)
console.log('r4.treeItems', JSON.stringify(r4.treeItems) + '\n\n')
// => r1.treeItems [
//   {
//     ns: 1,
//     ts: [ 'root' ],
//     pathInfors: [ [Object] ],
//     _type: 'folder',
//     type: 'array',
//     numOfChilren: -1,
//     id: 'root',
//     parentId: '',
//     text: 'root',
//     children: [ [Object] ],
//     data: null
//   }
// ]

let rfps4 = treeToFilepath(r4.treeItems, { delimiter: '>' })
// console.log('rfps4', JSON.stringify(rfps4))
// => rfps4 [
//   { type: 'folder', path: '>aaa' },
//   { type: 'folder', path: '>aaa>bbb' },
//   { type: 'file', path: '>aaa>bbb>z1.txt' }
// ]

let fps5 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
let r5 = filepathToTree(fps5, { bindRoot: 'ROOT' })
console.log('r5.treeItems', JSON.stringify(r5.treeItems) + '\n\n')
// => r5.treeItems [
//   {
//     ns: 1,
//     ts: [ 'ROOT' ],
//     pathInfors: [ [Object] ],
//     _type: 'folder',
//     type: 'array',
//     numOfChilren: -1,
//     id: 'ROOT',
//     parentId: '',
//     text: 'ROOT',
//     children: [ [Object] ],
//     data: null
//   }
// ]

let rfps5 = treeToFilepath(r5.treeItems, { bindRoot: 'ROOT' })
// console.log('rfps5', JSON.stringify(rfps5))
// => rfps5 [
//   { type: 'folder', path: '/aaa' },
//   { type: 'folder', path: '/aaa/bbb' },
//   { type: 'file', path: '/aaa/bbb/z1.txt' }
// ]


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
