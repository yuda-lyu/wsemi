import fs from 'fs'
import pseudoRandom from './src/pseudoRandom.mjs'
import pseudoRandomRange from './src/pseudoRandomRange.mjs'
import pseudoRandomIntRange from './src/pseudoRandomIntRange.mjs'
import arrSort from './src/arrSort.mjs'
import filepathToTree from './src/filepathToTree.mjs'
import treeToFilepath from './src/treeToFilepath.mjs'


let fps1 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
let r1 = filepathToTree(fps1)
//fs.writeFileSync('r1.json', JSON.stringify(r1), 'utf8')
console.log(r1)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   kpPath: {
//     root: '0',
//     'root❯aaa': '0.children.0',
//     'root❯aaa❯bbb': '0.children.0.children.0',
//     'root❯aaa❯bbb❯z1.txt': '0.children.0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/bbb' },
//     { type: 'file', path: '/root/aaa/bbb/z1.txt' }
//   ]
// }

let fps2 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
let r2 = filepathToTree(fps2, { delimiter: '>' })
//fs.writeFileSync('r2.json', JSON.stringify(r2), 'utf8')
console.log(r2)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   kpPath: {
//     root: '0',
//     'root>aaa': '0.children.0',
//     'root>aaa>bbb': '0.children.0.children.0',
//     'root>aaa>bbb>z1.txt': '0.children.0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/bbb' },
//     { type: 'file', path: '/root/aaa/bbb/z1.txt' }
//   ]
// }

let fps3 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
let r3 = filepathToTree(fps3, { bindRoot: '本機' })
//fs.writeFileSync('r3.json', JSON.stringify(r3), 'utf8')
console.log(r3)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: '本機',
//       parentId: '',
//       text: '本機',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: '本機',
//       parentId: '',
//       text: '本機',
//       children: [Array],
//       data: null
//     }
//   ],
//   kpPath: {
//     '本機': '0',
//     '本機❯aaa': '0.children.0',
//     '本機❯aaa❯bbb': '0.children.0.children.0',
//     '本機❯aaa❯bbb❯z1.txt': '0.children.0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/本機/aaa' },
//     { type: 'folder', path: '/本機/aaa/bbb' },
//     { type: 'file', path: '/本機/aaa/bbb/z1.txt' }
//   ]
// }

let fps4 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa1.txt' }, { 'type': 'file', 'path': '/aaa2.txt' }, { 'type': 'folder', 'path': '/aaa/aaabbb' }, { 'type': 'file', 'path': '/aaa/aaabbb.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/aaabbbccc.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd/abcde.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef1.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef2.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg01.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg02.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg03.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg04.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg05.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg06.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg07.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg08.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg09.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg10.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg11.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg12.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg13.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg14.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg15.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg16.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg17.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg18.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg19.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg20.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd1.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd2.txt' }, { 'type': 'folder', 'path': '/bbb' }, { 'type': 'file', 'path': '/ccc/cccddd/cccdddeee.txt' }, { 'type': 'folder', 'path': '/eee' }, { 'type': 'folder', 'path': '/eee/eeefff1' }, { 'type': 'folder', 'path': '/eee/eeefff2' }, { 'type': 'folder', 'path': '/ggg/' }, { 'type': 'folder', 'path': 'c:\\\\hhh' }, { 'type': 'folder', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'type': 'file', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt' }, { 'type': 'file', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt' }, { 'type': 'folder', 'path': 'd:\\\\中文路徑1' }, { 'type': 'folder', 'path': '/中文路徑2' }, { 'type': 'file', 'path': '/中文路徑2/aaa/aaabbb/abc/測試.txt' }]
let r4 = filepathToTree(fps4)
//fs.writeFileSync('r4.json', JSON.stringify(r4), 'utf8')
console.log(r4)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   kpPath: {
//     root: '0',
//     'root❯aaa': '0.children.0',
//     'root❯aaaa': '0.children.1',
//     'root❯bbb': '0.children.2',
//     'root❯c:': '0.children.3',
//     'root❯ccc': '0.children.4',
//     'root❯d:': '0.children.5',
//     'root❯eee': '0.children.6',
//     'root❯ggg': '0.children.7',
//     'root❯中文路徑2': '0.children.8',
//     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff': '0.children.1.children.0',
//     'root❯aaa❯aaabbb': '0.children.0.children.0',
//     'root❯c:❯hhh': '0.children.3.children.0',
//     'root❯ccc❯cccddd': '0.children.4.children.0',
//     'root❯d:❯中文路徑1': '0.children.5.children.0',
//     'root❯eee❯eeefff1': '0.children.6.children.0',
//     'root❯eee❯eeefff2': '0.children.6.children.1',
//     'root❯中文路徑2❯aaa': '0.children.8.children.0',
//     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg': '0.children.1.children.0.children.0',
//     'root❯aaa❯aaabbb❯abc': '0.children.0.children.0.children.0',
//     'root❯中文路徑2❯aaa❯aaabbb': '0.children.8.children.0.children.0',
//     'root❯aaa❯aaabbb❯abc❯abcd': '0.children.0.children.0.children.0.children.0',
//     'root❯aaa❯aaabbb❯abc❯abcde': '0.children.0.children.0.children.0.children.1',
//     'root❯中文路徑2❯aaa❯aaabbb❯abc': '0.children.8.children.0.children.0.children.0',
//     'root❯aaa1.txt': '0.children.9',
//     'root❯aaa2.txt': '0.children.10',
//     'root❯aaa❯aaabbb.txt': '0.children.0.children.1',
//     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯gfedcba.txt': '0.children.1.children.0.children.1',
//     'root❯aaa❯aaabbb❯aaabbbccc.txt': '0.children.0.children.0.children.1',
//     'root❯ccc❯cccddd❯cccdddeee.txt': '0.children.4.children.0.children.0',
//     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg❯hhh.txt': '0.children.1.children.0.children.0.children.0',
//     'root❯aaa❯aaabbb❯abc❯abcd1.txt': '0.children.0.children.0.children.0.children.2',
//     'root❯aaa❯aaabbb❯abc❯abcd2.txt': '0.children.0.children.0.children.0.children.3',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdef1.txt': '0.children.0.children.0.children.0.children.1.children.0',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdef2.txt': '0.children.0.children.0.children.0.children.1.children.1',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt': '0.children.0.children.0.children.0.children.1.children.2',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg01.txt': '0.children.0.children.0.children.0.children.1.children.3',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg02.txt': '0.children.0.children.0.children.0.children.1.children.4',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg03.txt': '0.children.0.children.0.children.0.children.1.children.5',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg04.txt': '0.children.0.children.0.children.0.children.1.children.6',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg05.txt': '0.children.0.children.0.children.0.children.1.children.7',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg06.txt': '0.children.0.children.0.children.0.children.1.children.8',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg07.txt': '0.children.0.children.0.children.0.children.1.children.9',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg08.txt': '0.children.0.children.0.children.0.children.1.children.10',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg09.txt': '0.children.0.children.0.children.0.children.1.children.11',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg10.txt': '0.children.0.children.0.children.0.children.1.children.12',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg11.txt': '0.children.0.children.0.children.0.children.1.children.13',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg12.txt': '0.children.0.children.0.children.0.children.1.children.14',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg13.txt': '0.children.0.children.0.children.0.children.1.children.15',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg14.txt': '0.children.0.children.0.children.0.children.1.children.16',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg15.txt': '0.children.0.children.0.children.0.children.1.children.17',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg16.txt': '0.children.0.children.0.children.0.children.1.children.18',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg17.txt': '0.children.0.children.0.children.0.children.1.children.19',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg18.txt': '0.children.0.children.0.children.0.children.1.children.20',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg19.txt': '0.children.0.children.0.children.0.children.1.children.21',
//     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg20.txt': '0.children.0.children.0.children.0.children.1.children.22',
//     'root❯aaa❯aaabbb❯abc❯abcd❯abcde.txt': '0.children.0.children.0.children.0.children.0.children.0',
//     'root❯中文路徑2❯aaa❯aaabbb❯abc❯測試.txt': '0.children.8.children.0.children.0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'file', path: '/root/aaa1.txt' },
//     { type: 'file', path: '/root/aaa2.txt' },
//     { type: 'folder', path: '/root/aaa/aaabbb' },
//     { type: 'file', path: '/root/aaa/aaabbb.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/aaabbbccc.txt' },
//     { type: 'folder', path: '/root/aaa/aaabbb/abc' },
//     { type: 'folder', path: '/root/aaa/aaabbb/abc/abcd' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcd/abcde.txt' },
//     { type: 'folder', path: '/root/aaa/aaabbb/abc/abcde' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdef1.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdef2.txt' },
//     {
//       type: 'file',
//       path: '/root/aaa/aaabbb/abc/abcde/abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt'
//     },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg01.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg02.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg03.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg04.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg05.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg06.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg07.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg08.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg09.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg10.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg11.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg12.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg13.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg14.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg15.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg16.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg17.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg18.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg19.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcde/abcdefg20.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcd1.txt' },
//     { type: 'file', path: '/root/aaa/aaabbb/abc/abcd2.txt' },
//     { type: 'folder', path: '/root/bbb' },
//     { type: 'folder', path: '/root/ccc' },
//     { type: 'folder', path: '/root/ccc/cccddd' },
//     { type: 'file', path: '/root/ccc/cccddd/cccdddeee.txt' },
//     { type: 'folder', path: '/root/eee' },
//     { type: 'folder', path: '/root/eee/eeefff1' },
//     { type: 'folder', path: '/root/eee/eeefff2' },
//     { type: 'folder', path: '/root/ggg' },
//     { type: 'folder', path: '/root/c:' },
//     { type: 'folder', path: '/root/c:/hhh' },
//     { type: 'folder', path: '/root/aaaa' },
//     {
//       type: 'folder',
//       path: '/root/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff'
//     },
//     {
//       type: 'file',
//       path: '/root/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt'
//     },
//     {
//       type: 'folder',
//       path: '/root/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg'
//     },
//     {
//       type: 'file',
//       path: '/root/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt'
//     },
//     { type: 'folder', path: '/root/d:' },
//     { type: 'folder', path: '/root/d:/中文路徑1' },
//     { type: 'folder', path: '/root/中文路徑2' },
//     { type: 'folder', path: '/root/中文路徑2/aaa' },
//     { type: 'folder', path: '/root/中文路徑2/aaa/aaabbb' },
//     { type: 'folder', path: '/root/中文路徑2/aaa/aaabbb/abc' },
//     { type: 'file', path: '/root/中文路徑2/aaa/aaabbb/abc/測試.txt' }
//   ]
// }

let fps5 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }, { 'type': 'file', 'path': '/aaa/bbb/z2.txt' }, { 'type': 'file', 'path': '/aaa/bbb/z10.txt' }]
let soryItems5 = (rs, pid, ns) => {
    // console.log('soryItems', 'pid=', pid, 'ns=', ns, 'rs=', rs)
    rs = arrSort(rs, { compareKey: 'text' })
    return rs
}
let r5 = filepathToTree(fps5, { soryItems: soryItems5 })
//fs.writeFileSync('r5.json', JSON.stringify(r5), 'utf8')
console.log(r5)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   kpPath: {
//     root: '0',
//     'root❯aaa': '0.children.0',
//     'root❯aaa1': '0.children.1',
//     'root❯aaa10': '0.children.2',
//     'root❯aaa2': '0.children.3',
//     'root❯aaa❯bbb': '0.children.0.children.0',
//     'root❯aaa❯bbb❯z1.txt': '0.children.0.children.0.children.0',
//     'root❯aaa❯bbb❯z2.txt': '0.children.0.children.0.children.1',
//     'root❯aaa❯bbb❯z10.txt': '0.children.0.children.0.children.2'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa1' },
//     { type: 'folder', path: '/root/aaa2' },
//     { type: 'folder', path: '/root/aaa10' },
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/bbb' },
//     { type: 'file', path: '/root/aaa/bbb/z1.txt' },
//     { type: 'file', path: '/root/aaa/bbb/z2.txt' },
//     { type: 'file', path: '/root/aaa/bbb/z10.txt' }
//   ]
// }

let fps6 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }, { 'type': 'file', 'path': '/aaa/bbb/z2.txt' }, { 'type': 'file', 'path': '/aaa/bbb/z10.txt' }]
let soryItems6 = (rs, pid, ns) => {
    // console.log('soryItems', 'pid=', pid, 'ns=', ns, 'rs=', rs)
    rs = arrSort(rs, { compareKey: 'text', localeCompare: true })
    return rs
}
let r6 = filepathToTree(fps6, { soryItems: soryItems6 })
//fs.writeFileSync('r6.json', JSON.stringify(r6), 'utf8')
console.log(r6)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: null,
//       ns: 1,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root',
//       parentId: '',
//       text: 'root',
//       children: [Array],
//       data: null
//     }
//   ],
//   kpPath: {
//     root: '0',
//     'root❯aaa': '0.children.0',
//     'root❯aaa1': '0.children.1',
//     'root❯aaa2': '0.children.2',
//     'root❯aaa10': '0.children.3',
//     'root❯aaa❯bbb': '0.children.0.children.0',
//     'root❯aaa❯bbb❯z1.txt': '0.children.0.children.0.children.0',
//     'root❯aaa❯bbb❯z2.txt': '0.children.0.children.0.children.1',
//     'root❯aaa❯bbb❯z10.txt': '0.children.0.children.0.children.2'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa1' },
//     { type: 'folder', path: '/root/aaa2' },
//     { type: 'folder', path: '/root/aaa10' },
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/bbb' },
//     { type: 'file', path: '/root/aaa/bbb/z1.txt' },
//     { type: 'file', path: '/root/aaa/bbb/z2.txt' },
//     { type: 'file', path: '/root/aaa/bbb/z10.txt' }
//   ]
// }


//node --experimental-modules --es-module-specifier-resolution=node g.mjs
