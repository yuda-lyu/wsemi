import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsIsFile from './src/fsIsFile.mjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsIsFolder from './src/fsIsFolder.mjs'
import fsCleanFolder from './src/fsCleanFolder.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsWriteText from './src/fsWriteText.mjs'
import fsWriteJson from './src/fsWriteJson.mjs'
import filepathToTree from './src/filepathToTree.mjs'
import arrSort from './src/arrSort.mjs'


let fps1 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }]
let r1 = filepathToTree(fps1)
fs.writeFileSync('r1.json', JSON.stringify(r1), 'utf8')
console.log(r1)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   kpPath: {
//     'root❯aaa': '0',
//     'root❯aaa❯mmm': '0.children.0',
//     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/mmm' },
//     { type: 'file', path: '/root/aaa/mmm/z1.txt' }
//   ]
// }

let fps2 = [{ 'type': 'file', 'path': '/aaa/za.txt' }, { 'type': 'file', 'path': '/bbb/zb.txt' }]
let r2 = filepathToTree(fps2)
fs.writeFileSync('r2.json', JSON.stringify(r2), 'utf8')
console.log(r2)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯bbb',
//       parentId: 'root',
//       text: 'bbb',
//       children: [Array],
//       data: null
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯bbb',
//       parentId: 'root',
//       text: 'bbb',
//       children: [],
//       data: null
//     }
//   ],
//   kpPath: {
//     'root❯aaa': '0',
//     'root❯bbb': '1',
//     'root❯aaa❯za.txt': '0.children.0',
//     'root❯bbb❯zb.txt': '1.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'file', path: '/root/aaa/za.txt' },
//     { type: 'folder', path: '/root/bbb' },
//     { type: 'file', path: '/root/bbb/zb.txt' }
//   ]
// }

let fps3 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }]
let r3 = filepathToTree(fps3, { delimiter: '>' })
fs.writeFileSync('r3.json', JSON.stringify(r3), 'utf8')
console.log(r3)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root>aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root>aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   kpPath: {
//     'root>aaa': '0',
//     'root>aaa>mmm': '0.children.0',
//     'root>aaa>mmm>z1.txt': '0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/mmm' },
//     { type: 'file', path: '/root/aaa/mmm/z1.txt' }
//   ]
// }

let fps4 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }]
let r4 = filepathToTree(fps4, { bindRoot: 'root' })
fs.writeFileSync('r4.json', JSON.stringify(r4), 'utf8')
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
//     'root❯aaa❯mmm': '0.children.0.children.0',
//     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/mmm' },
//     { type: 'file', path: '/root/aaa/mmm/z1.txt' }
//   ]
// }

let fps5 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa1.txt' }, { 'type': 'file', 'path': '/aaa2.txt' }, { 'type': 'folder', 'path': '/aaa/aaammm' }, { 'type': 'file', 'path': '/aaa/aaammm.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/aaammmccc.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd/abcde.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef1.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef2.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg01.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg02.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg03.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg04.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg05.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg06.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg07.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg08.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg09.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg10.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg11.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg12.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg13.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg14.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg15.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg16.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg17.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg18.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg19.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg20.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd1.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd2.txt' }, { 'type': 'folder', 'path': '/mmm' }, { 'type': 'file', 'path': '/ccc/cccddd/cccdddeee.txt' }, { 'type': 'folder', 'path': '/eee' }, { 'type': 'folder', 'path': '/eee/eeefff1' }, { 'type': 'folder', 'path': '/eee/eeefff2' }, { 'type': 'folder', 'path': '/ggg/' }, { 'type': 'folder', 'path': 'c:\\hhh' }, { 'type': 'folder', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'type': 'file', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt' }, { 'type': 'file', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt' }, { 'type': 'folder', 'path': 'd:\\中文路徑1' }, { 'type': 'folder', 'path': '/中文路徑2' }, { 'type': 'file', 'path': '/中文路徑2/aaa/aaammm/abc/測試.txt' }]
let r5 = filepathToTree(fps5)
fs.writeFileSync('r5.json', JSON.stringify(r5), 'utf8')
console.log(r5)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     },
//     {
//       _indOri: null,
//       _indNormalize: 45,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaaa',
//       parentId: 'root',
//       text: 'aaaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 43,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯c:',
//       parentId: 'root',
//       text: 'c:',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 36,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯ccc',
//       parentId: 'root',
//       text: 'ccc',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 50,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯d:',
//       parentId: 'root',
//       text: 'd:',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: 34,
//       _indNormalize: 39,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯eee',
//       parentId: 'root',
//       text: 'eee',
//       children: [Array],
//       data: [Object]
//     },
//     {
//       _indOri: 37,
//       _indNormalize: 42,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯ggg',
//       parentId: 'root',
//       text: 'ggg',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 32,
//       _indNormalize: 35,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯mmm',
//       parentId: 'root',
//       text: 'mmm',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 43,
//       _indNormalize: 52,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯中文路徑2',
//       parentId: 'root',
//       text: '中文路徑2',
//       children: [Array],
//       data: [Object]
//     },
//     {
//       _indOri: 1,
//       _indNormalize: 1,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'file',
//       type: 'node',
//       numOfChilren: -1,
//       id: 'root❯aaa1.txt',
//       parentId: 'root',
//       text: 'aaa1.txt',
//       data: [Object]
//     },
//     {
//       _indOri: 2,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'file',
//       type: 'node',
//       numOfChilren: -1,
//       id: 'root❯aaa2.txt',
//       parentId: 'root',
//       text: 'aaa2.txt',
//       data: [Object]
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     },
//     {
//       _indOri: null,
//       _indNormalize: 45,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaaa',
//       parentId: 'root',
//       text: 'aaaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 43,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯c:',
//       parentId: 'root',
//       text: 'c:',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 36,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯ccc',
//       parentId: 'root',
//       text: 'ccc',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: null,
//       _indNormalize: 50,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯d:',
//       parentId: 'root',
//       text: 'd:',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: 34,
//       _indNormalize: 39,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯eee',
//       parentId: 'root',
//       text: 'eee',
//       children: [Array],
//       data: [Object]
//     },
//     {
//       _indOri: 37,
//       _indNormalize: 42,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯ggg',
//       parentId: 'root',
//       text: 'ggg',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 32,
//       _indNormalize: 35,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯mmm',
//       parentId: 'root',
//       text: 'mmm',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 43,
//       _indNormalize: 52,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯中文路徑2',
//       parentId: 'root',
//       text: '中文路徑2',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   kpPath: {
//     'root❯aaa': '0',
//     'root❯aaaa': '1',
//     'root❯c:': '2',
//     'root❯ccc': '3',
//     'root❯d:': '4',
//     'root❯eee': '5',
//     'root❯ggg': '6',
//     'root❯mmm': '7',
//     'root❯中文路徑2': '8',
//     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff': '1.children.0',
//     'root❯aaa❯aaammm': '0.children.0',
//     'root❯c:❯hhh': '2.children.0',
//     'root❯ccc❯cccddd': '3.children.0',
//     'root❯d:❯中文路徑1': '4.children.0',
//     'root❯eee❯eeefff1': '5.children.0',
//     'root❯eee❯eeefff2': '5.children.1',
//     'root❯中文路徑2❯aaa': '8.children.0',
//     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg': '1.children.0.children.0',
//     'root❯aaa❯aaammm❯abc': '0.children.0.children.0',
//     'root❯中文路徑2❯aaa❯aaammm': '8.children.0.children.0',
//     'root❯aaa❯aaammm❯abc❯abcd': '0.children.0.children.0.children.0',
//     'root❯aaa❯aaammm❯abc❯abcde': '0.children.0.children.0.children.1',
//     'root❯中文路徑2❯aaa❯aaammm❯abc': '8.children.0.children.0.children.0',
//     'root❯aaa1.txt': '9',
//     'root❯aaa2.txt': '10',
//     'root❯aaa❯aaammm.txt': '0.children.1',
//     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯gfedcba.txt': '1.children.0.children.1',
//     'root❯aaa❯aaammm❯aaammmccc.txt': '0.children.0.children.1',
//     'root❯ccc❯cccddd❯cccdddeee.txt': '3.children.0.children.0',
//     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg❯hhh.txt': '1.children.0.children.0.children.0',
//     'root❯aaa❯aaammm❯abc❯abcd1.txt': '0.children.0.children.0.children.2',
//     'root❯aaa❯aaammm❯abc❯abcd2.txt': '0.children.0.children.0.children.3',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdef1.txt': '0.children.0.children.0.children.1.children.0',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdef2.txt': '0.children.0.children.0.children.1.children.1',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt': '0.children.0.children.0.children.1.children.2',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg01.txt': '0.children.0.children.0.children.1.children.3',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg02.txt': '0.children.0.children.0.children.1.children.4',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg03.txt': '0.children.0.children.0.children.1.children.5',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg04.txt': '0.children.0.children.0.children.1.children.6',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg05.txt': '0.children.0.children.0.children.1.children.7',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg06.txt': '0.children.0.children.0.children.1.children.8',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg07.txt': '0.children.0.children.0.children.1.children.9',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg08.txt': '0.children.0.children.0.children.1.children.10',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg09.txt': '0.children.0.children.0.children.1.children.11',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg10.txt': '0.children.0.children.0.children.1.children.12',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg11.txt': '0.children.0.children.0.children.1.children.13',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg12.txt': '0.children.0.children.0.children.1.children.14',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg13.txt': '0.children.0.children.0.children.1.children.15',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg14.txt': '0.children.0.children.0.children.1.children.16',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg15.txt': '0.children.0.children.0.children.1.children.17',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg16.txt': '0.children.0.children.0.children.1.children.18',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg17.txt': '0.children.0.children.0.children.1.children.19',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg18.txt': '0.children.0.children.0.children.1.children.20',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg19.txt': '0.children.0.children.0.children.1.children.21',
//     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg20.txt': '0.children.0.children.0.children.1.children.22',
//     'root❯aaa❯aaammm❯abc❯abcd❯abcde.txt': '0.children.0.children.0.children.0.children.0',
//     'root❯中文路徑2❯aaa❯aaammm❯abc❯測試.txt': '8.children.0.children.0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'file', path: '/root/aaa1.txt' },
//     { type: 'file', path: '/root/aaa2.txt' },
//     { type: 'folder', path: '/root/aaa/aaammm' },
//     { type: 'file', path: '/root/aaa/aaammm.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/aaammmccc.txt' },
//     { type: 'folder', path: '/root/aaa/aaammm/abc' },
//     { type: 'folder', path: '/root/aaa/aaammm/abc/abcd' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcd/abcde.txt' },
//     { type: 'folder', path: '/root/aaa/aaammm/abc/abcde' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdef1.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdef2.txt' },
//     {
//       type: 'file',
//       path: '/root/aaa/aaammm/abc/abcde/abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt'
//     },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg01.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg02.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg03.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg04.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg05.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg06.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg07.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg08.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg09.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg10.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg11.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg12.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg13.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg14.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg15.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg16.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg17.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg18.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg19.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg20.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcd1.txt' },
//     { type: 'file', path: '/root/aaa/aaammm/abc/abcd2.txt' },
//     { type: 'folder', path: '/root/mmm' },
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
//       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff'
//     },
//     {
//       type: 'file',
//       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt'
//     },
//     {
//       type: 'folder',
//       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg'
//     },
//     {
//       type: 'file',
//       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt'
//     },
//     { type: 'folder', path: '/root/d:' },
//     { type: 'folder', path: '/root/d:/中文路徑1' },
//     { type: 'folder', path: '/root/中文路徑2' },
//     { type: 'folder', path: '/root/中文路徑2/aaa' },
//     { type: 'folder', path: '/root/中文路徑2/aaa/aaammm' },
//     { type: 'folder', path: '/root/中文路徑2/aaa/aaammm/abc' },
//     { type: 'file', path: '/root/中文路徑2/aaa/aaammm/abc/測試.txt' }
//   ]
// }

let fps6 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z2.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z10.txt' }]
let soryItems6 = (rs, pid, ns) => {
    // console.log('soryItems', 'pid=', pid, 'ns=', ns, 'rs=', rs)
    rs = arrSort(rs, { compareKey: 'text' })
    return rs
}
let r6 = filepathToTree(fps6, { soryItems: soryItems6 })
fs.writeFileSync('r6.json', JSON.stringify(r6), 'utf8')
console.log(r6)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: 3,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa1',
//       parentId: 'root',
//       text: 'aaa1',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 2,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa10',
//       parentId: 'root',
//       text: 'aaa10',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 1,
//       _indNormalize: 1,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa2',
//       parentId: 'root',
//       text: 'aaa2',
//       children: [],
//       data: [Object]
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: 3,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa1',
//       parentId: 'root',
//       text: 'aaa1',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 2,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa10',
//       parentId: 'root',
//       text: 'aaa10',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 1,
//       _indNormalize: 1,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa2',
//       parentId: 'root',
//       text: 'aaa2',
//       children: [],
//       data: [Object]
//     }
//   ],
//   kpPath: {
//     'root❯aaa': '0',
//     'root❯aaa1': '1',
//     'root❯aaa10': '2',
//     'root❯aaa2': '3',
//     'root❯aaa❯mmm': '0.children.0',
//     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0',
//     'root❯aaa❯mmm❯z2.txt': '0.children.0.children.1',
//     'root❯aaa❯mmm❯z10.txt': '0.children.0.children.2'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa1' },
//     { type: 'folder', path: '/root/aaa2' },
//     { type: 'folder', path: '/root/aaa10' },
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/mmm' },
//     { type: 'file', path: '/root/aaa/mmm/z1.txt' },
//     { type: 'file', path: '/root/aaa/mmm/z2.txt' },
//     { type: 'file', path: '/root/aaa/mmm/z10.txt' }
//   ]
// }

let fps7 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z2.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z10.txt' }]
let soryItems7 = (rs, pid, ns) => {
    // console.log('soryItems', 'pid=', pid, 'ns=', ns, 'rs=', rs)
    rs = arrSort(rs, { compareKey: 'text', localeCompare: true })
    return rs
}
let r7 = filepathToTree(fps7, { soryItems: soryItems7 })
fs.writeFileSync('r7.json', JSON.stringify(r7), 'utf8')
console.log(r7)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: null,
//       _indNormalize: 3,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa1',
//       parentId: 'root',
//       text: 'aaa1',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 1,
//       _indNormalize: 1,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa2',
//       parentId: 'root',
//       text: 'aaa2',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 2,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa10',
//       parentId: 'root',
//       text: 'aaa10',
//       children: [],
//       data: [Object]
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: null,
//       _indNormalize: 3,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: null
//     },
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa1',
//       parentId: 'root',
//       text: 'aaa1',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 1,
//       _indNormalize: 1,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa2',
//       parentId: 'root',
//       text: 'aaa2',
//       children: [],
//       data: [Object]
//     },
//     {
//       _indOri: 2,
//       _indNormalize: 2,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa10',
//       parentId: 'root',
//       text: 'aaa10',
//       children: [],
//       data: [Object]
//     }
//   ],
//   kpPath: {
//     'root❯aaa': '0',
//     'root❯aaa1': '1',
//     'root❯aaa2': '2',
//     'root❯aaa10': '3',
//     'root❯aaa❯mmm': '0.children.0',
//     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0',
//     'root❯aaa❯mmm❯z2.txt': '0.children.0.children.1',
//     'root❯aaa❯mmm❯z10.txt': '0.children.0.children.2'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa1' },
//     { type: 'folder', path: '/root/aaa2' },
//     { type: 'folder', path: '/root/aaa10' },
//     { type: 'folder', path: '/root/aaa' },
//     { type: 'folder', path: '/root/aaa/mmm' },
//     { type: 'file', path: '/root/aaa/mmm/z1.txt' },
//     { type: 'file', path: '/root/aaa/mmm/z2.txt' },
//     { type: 'file', path: '/root/aaa/mmm/z10.txt' }
//   ]
// }

//先建虛擬資料夾再補建資料夾
let fps8 = [
    { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
    { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
    { 'type': 'folder', 'path': '/aaa/mmm', 'ext': 'ext3' },
]
let r8 = filepathToTree(fps8)
fs.writeFileSync('r8.json', JSON.stringify(r8), 'utf8')
console.log(r8)
console.log('\n\n')
// => {
//   treeItems: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   treeItemsFolder: [
//     {
//       _indOri: 0,
//       _indNormalize: 0,
//       ns: 2,
//       ts: [Array],
//       pathInfors: [Array],
//       _type: 'folder',
//       type: 'array',
//       numOfChilren: -1,
//       id: 'root❯aaa',
//       parentId: 'root',
//       text: 'aaa',
//       children: [Array],
//       data: [Object]
//     }
//   ],
//   kpPath: {
//     'root❯aaa': '0',
//     'root❯aaa❯mmm': '0.children.0',
//     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0'
//   },
//   fpsNormalize: [
//     { type: 'folder', path: '/root/aaa', ext: 'ext1' },
//     { type: 'folder', path: '/root/aaa/mmm', ext: 'ext3' },
//     { type: 'file', path: '/root/aaa/mmm/z1.txt', ext: 'ext2' }
//   ]
// }

//先建虛擬資料夾再補建檔案須報錯
let fps9 = [
    { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
    { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
    { 'type': 'file', 'path': '/aaa/mmm', 'ext': 'ext3' },
]
let r9
try {
    r9 = filepathToTree(fps9)
}
catch (err) {
    r9 = err.toString()
}
fs.writeFileSync('r9.json', JSON.stringify(r9), 'utf8')
console.log(r9)
console.log('\n\n')
// => Error: id[root❯aaa❯mmm] is unrecognized from a folder to file

//先建檔案再補建虛擬資料夾須報錯
let fps10 = [
    { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
    { 'type': 'file', 'path': '/aaa/mmm', 'ext': 'ext3' },
    { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
]
let r10
try {
    r10 = filepathToTree(fps10)
}
catch (err) {
    r10 = err.toString()
}
fs.writeFileSync('r10.json', JSON.stringify(r10), 'utf8')
console.log(r10)
console.log('\n\n')
// => Error: id[root❯aaa❯mmm] is unrecognized from a file to folder

//先建檔案再補建資料夾須報錯
let fps11 = [
    { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
    { 'type': 'file', 'path': '/aaa/mmm', 'ext': 'ext3' },
    { 'type': 'folder', 'path': '/aaa/mmm', 'ext': 'ext4' },
    { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
]
let r11
try {
    r11 = filepathToTree(fps11)
}
catch (err) {
    r11 = err.toString()
}
fs.writeFileSync('r11.json', JSON.stringify(r11), 'utf8')
console.log(r11)
console.log('\n\n')
// => Error: id[root❯aaa❯mmm] is unrecognized from a file to folder

//node g.mjs
