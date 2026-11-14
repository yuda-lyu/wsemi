import get from 'lodash-es/get.js'
import set from 'lodash-es/set.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import max from 'lodash-es/max.js'
import values from 'lodash-es/values.js'
import groupBy from 'lodash-es/groupBy.js'
import join from 'lodash-es/join.js'
import find from 'lodash-es/find.js'
import sortBy from 'lodash-es/sortBy.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import sep from './sep.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'
import haskey from './haskey.mjs'


/**
 * 轉換檔案路徑陣列成為樹狀物件與關聯資料物件
 *
 * 路徑以'/'或'\'分段(各段去頭尾空白、略過空段)，'.'與'..'視為一般名稱，不做路徑解析；不改動呼叫端之項目
 * 下列情形同步拋出Error，訊息指出第幾個項目(如'invalid fps[2].path: ...')，不含路徑：項目非物件；path(自有欄位)缺少、非字串、為空字串，或分段後無任何段(如'/'、'///'、'   '、'\\'，同空字串)；type(自有欄位)缺少或非'folder'、'file'；路徑任一段含分隔字串(opt.delimiter，預設'❯'，請改用路徑中不會出現之opt.delimiter)；
 * 路徑重複(兩個檔案、兩個皆有數據之資料夾)；同一路徑既是資料夾又是檔案(含檔案路徑被其他項目當作上層資料夾)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/filepathToTree.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} fps 輸入項目陣列，每個項目需為物件，並提供path與type兩鍵值，其中type需為'folder'或'file'；非陣列或空陣列回傳同形之空結果{ treeItems: [], treeItemsFolder: [], kpPath: {}, fpsNormalize: [] }
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.delimiter='❯'] 輸入路徑分隔字串，預設'❯'
 * @param {String} [opt.bindRoot=''] 輸入指定根目錄字串，預設''
 * @param {Function} [opt.soryItems=null] 輸入排序產生樹狀物件函數，預設null
 * @returns {Object} 回傳結果物件，其內treeItems為資料夾與檔案之樹狀物件，treeItemsFolder為僅資料夾之樹狀物件，kpPath為各項目id之取樹狀物件路徑物件，fpsNormalize為重新正規化之檔案路徑陣列
 * @example
 *
 * let fps1 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }]
 * let r1 = filepathToTree(fps1)
 * fs.writeFileSync('r1.json', JSON.stringify(r1), 'utf8')
 * console.log(r1)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯aaa❯mmm': '0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0.children.0'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'folder', path: '/root/aaa/mmm' },
 * //     { type: 'file', path: '/root/aaa/mmm/z1.txt' }
 * //   ]
 * // }
 *
 * let fps2 = [{ 'type': 'file', 'path': '/aaa/za.txt' }, { 'type': 'file', 'path': '/bbb/zb.txt' }]
 * let r2 = filepathToTree(fps2)
 * fs.writeFileSync('r2.json', JSON.stringify(r2), 'utf8')
 * console.log(r2)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯bbb': '0.children.1',
 * //     'root❯aaa❯za.txt': '0.children.0.children.0',
 * //     'root❯bbb❯zb.txt': '0.children.1.children.0'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'file', path: '/root/aaa/za.txt' },
 * //     { type: 'folder', path: '/root/bbb' },
 * //     { type: 'file', path: '/root/bbb/zb.txt' }
 * //   ]
 * // }
 *
 * let fps3 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }]
 * let r3 = filepathToTree(fps3, { delimiter: '>' })
 * fs.writeFileSync('r3.json', JSON.stringify(r3), 'utf8')
 * console.log(r3)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root>aaa': '0.children.0',
 * //     'root>aaa>mmm': '0.children.0.children.0',
 * //     'root>aaa>mmm>z1.txt': '0.children.0.children.0.children.0'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'folder', path: '/root/aaa/mmm' },
 * //     { type: 'file', path: '/root/aaa/mmm/z1.txt' }
 * //   ]
 * // }
 *
 * let fps4 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }]
 * let r4 = filepathToTree(fps4, { bindRoot: 'root' })
 * fs.writeFileSync('r4.json', JSON.stringify(r4), 'utf8')
 * console.log(r4)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯aaa❯mmm': '0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0.children.0'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'folder', path: '/root/aaa/mmm' },
 * //     { type: 'file', path: '/root/aaa/mmm/z1.txt' }
 * //   ]
 * // }
 *
 * let fps5 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa1.txt' }, { 'type': 'file', 'path': '/aaa2.txt' }, { 'type': 'folder', 'path': '/aaa/aaammm' }, { 'type': 'file', 'path': '/aaa/aaammm.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/aaammmccc.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd/abcde.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef1.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef2.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg01.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg02.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg03.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg04.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg05.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg06.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg07.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg08.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg09.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg10.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg11.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg12.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg13.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg14.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg15.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg16.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg17.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg18.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg19.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcde/abcdefg20.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd1.txt' }, { 'type': 'file', 'path': '/aaa/aaammm/abc/abcd2.txt' }, { 'type': 'folder', 'path': '/mmm' }, { 'type': 'file', 'path': '/ccc/cccddd/cccdddeee.txt' }, { 'type': 'folder', 'path': '/eee' }, { 'type': 'folder', 'path': '/eee/eeefff1' }, { 'type': 'folder', 'path': '/eee/eeefff2' }, { 'type': 'folder', 'path': '/ggg/' }, { 'type': 'folder', 'path': 'c:\\hhh' }, { 'type': 'folder', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'type': 'file', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt' }, { 'type': 'file', 'path': '/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt' }, { 'type': 'folder', 'path': 'd:\\中文路徑1' }, { 'type': 'folder', 'path': '/中文路徑2' }, { 'type': 'file', 'path': '/中文路徑2/aaa/aaammm/abc/測試.txt' }]
 * let r5 = filepathToTree(fps5)
 * fs.writeFileSync('r5.json', JSON.stringify(r5), 'utf8')
 * console.log(r5)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯aaaa': '0.children.1',
 * //     'root❯c:': '0.children.2',
 * //     'root❯ccc': '0.children.3',
 * //     'root❯d:': '0.children.4',
 * //     'root❯eee': '0.children.5',
 * //     'root❯ggg': '0.children.6',
 * //     'root❯mmm': '0.children.7',
 * //     'root❯中文路徑2': '0.children.8',
 * //     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff': '0.children.1.children.0',
 * //     'root❯aaa❯aaammm': '0.children.0.children.0',
 * //     'root❯c:❯hhh': '0.children.2.children.0',
 * //     'root❯ccc❯cccddd': '0.children.3.children.0',
 * //     'root❯d:❯中文路徑1': '0.children.4.children.0',
 * //     'root❯eee❯eeefff1': '0.children.5.children.0',
 * //     'root❯eee❯eeefff2': '0.children.5.children.1',
 * //     'root❯中文路徑2❯aaa': '0.children.8.children.0',
 * //     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg': '0.children.1.children.0.children.0',
 * //     'root❯aaa❯aaammm❯abc': '0.children.0.children.0.children.0',
 * //     'root❯中文路徑2❯aaa❯aaammm': '0.children.8.children.0.children.0',
 * //     'root❯aaa❯aaammm❯abc❯abcd': '0.children.0.children.0.children.0.children.0',
 * //     'root❯aaa❯aaammm❯abc❯abcde': '0.children.0.children.0.children.0.children.1',
 * //     'root❯中文路徑2❯aaa❯aaammm❯abc': '0.children.8.children.0.children.0.children.0',
 * //     'root❯aaa1.txt': '0.children.9',
 * //     'root❯aaa2.txt': '0.children.10',
 * //     'root❯aaa❯aaammm.txt': '0.children.0.children.1',
 * //     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯gfedcba.txt': '0.children.1.children.0.children.1',
 * //     'root❯aaa❯aaammm❯aaammmccc.txt': '0.children.0.children.0.children.1',
 * //     'root❯ccc❯cccddd❯cccdddeee.txt': '0.children.3.children.0.children.0',
 * //     'root❯aaaa❯mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg❯hhh.txt': '0.children.1.children.0.children.0.children.0',
 * //     'root❯aaa❯aaammm❯abc❯abcd1.txt': '0.children.0.children.0.children.0.children.2',
 * //     'root❯aaa❯aaammm❯abc❯abcd2.txt': '0.children.0.children.0.children.0.children.3',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdef1.txt': '0.children.0.children.0.children.0.children.1.children.0',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdef2.txt': '0.children.0.children.0.children.0.children.1.children.1',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt': '0.children.0.children.0.children.0.children.1.children.2',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg01.txt': '0.children.0.children.0.children.0.children.1.children.3',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg02.txt': '0.children.0.children.0.children.0.children.1.children.4',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg03.txt': '0.children.0.children.0.children.0.children.1.children.5',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg04.txt': '0.children.0.children.0.children.0.children.1.children.6',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg05.txt': '0.children.0.children.0.children.0.children.1.children.7',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg06.txt': '0.children.0.children.0.children.0.children.1.children.8',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg07.txt': '0.children.0.children.0.children.0.children.1.children.9',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg08.txt': '0.children.0.children.0.children.0.children.1.children.10',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg09.txt': '0.children.0.children.0.children.0.children.1.children.11',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg10.txt': '0.children.0.children.0.children.0.children.1.children.12',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg11.txt': '0.children.0.children.0.children.0.children.1.children.13',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg12.txt': '0.children.0.children.0.children.0.children.1.children.14',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg13.txt': '0.children.0.children.0.children.0.children.1.children.15',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg14.txt': '0.children.0.children.0.children.0.children.1.children.16',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg15.txt': '0.children.0.children.0.children.0.children.1.children.17',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg16.txt': '0.children.0.children.0.children.0.children.1.children.18',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg17.txt': '0.children.0.children.0.children.0.children.1.children.19',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg18.txt': '0.children.0.children.0.children.0.children.1.children.20',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg19.txt': '0.children.0.children.0.children.0.children.1.children.21',
 * //     'root❯aaa❯aaammm❯abc❯abcde❯abcdefg20.txt': '0.children.0.children.0.children.0.children.1.children.22',
 * //     'root❯aaa❯aaammm❯abc❯abcd❯abcde.txt': '0.children.0.children.0.children.0.children.0.children.0',
 * //     'root❯中文路徑2❯aaa❯aaammm❯abc❯測試.txt': '0.children.8.children.0.children.0.children.0.children.0'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'file', path: '/root/aaa1.txt' },
 * //     { type: 'file', path: '/root/aaa2.txt' },
 * //     { type: 'folder', path: '/root/aaa/aaammm' },
 * //     { type: 'file', path: '/root/aaa/aaammm.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/aaammmccc.txt' },
 * //     { type: 'folder', path: '/root/aaa/aaammm/abc' },
 * //     { type: 'folder', path: '/root/aaa/aaammm/abc/abcd' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcd/abcde.txt' },
 * //     { type: 'folder', path: '/root/aaa/aaammm/abc/abcde' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdef1.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdef2.txt' },
 * //     {
 * //       type: 'file',
 * //       path: '/root/aaa/aaammm/abc/abcde/abcdef3 aaa mmm ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt'
 * //     },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg01.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg02.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg03.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg04.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg05.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg06.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg07.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg08.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg09.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg10.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg11.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg12.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg13.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg14.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg15.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg16.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg17.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg18.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg19.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcde/abcdefg20.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcd1.txt' },
 * //     { type: 'file', path: '/root/aaa/aaammm/abc/abcd2.txt' },
 * //     { type: 'folder', path: '/root/mmm' },
 * //     { type: 'folder', path: '/root/ccc' },
 * //     { type: 'folder', path: '/root/ccc/cccddd' },
 * //     { type: 'file', path: '/root/ccc/cccddd/cccdddeee.txt' },
 * //     { type: 'folder', path: '/root/eee' },
 * //     { type: 'folder', path: '/root/eee/eeefff1' },
 * //     { type: 'folder', path: '/root/eee/eeefff2' },
 * //     { type: 'folder', path: '/root/ggg' },
 * //     { type: 'folder', path: '/root/c:' },
 * //     { type: 'folder', path: '/root/c:/hhh' },
 * //     { type: 'folder', path: '/root/aaaa' },
 * //     {
 * //       type: 'folder',
 * //       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff'
 * //     },
 * //     {
 * //       type: 'file',
 * //       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt'
 * //     },
 * //     {
 * //       type: 'folder',
 * //       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg'
 * //     },
 * //     {
 * //       type: 'file',
 * //       path: '/root/aaaa/mmmmmm cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt'
 * //     },
 * //     { type: 'folder', path: '/root/d:' },
 * //     { type: 'folder', path: '/root/d:/中文路徑1' },
 * //     { type: 'folder', path: '/root/中文路徑2' },
 * //     { type: 'folder', path: '/root/中文路徑2/aaa' },
 * //     { type: 'folder', path: '/root/中文路徑2/aaa/aaammm' },
 * //     { type: 'folder', path: '/root/中文路徑2/aaa/aaammm/abc' },
 * //     { type: 'file', path: '/root/中文路徑2/aaa/aaammm/abc/測試.txt' }
 * //   ]
 * // }
 *
 * let fps6 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z2.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z10.txt' }]
 * let soryItems6 = (rs, pid, ns) => {
 *     // console.log('soryItems', 'pid=', pid, 'ns=', ns, 'rs=', rs)
 *     rs = arrSort(rs, { compareKey: 'text' })
 *     return rs
 * }
 * let r6 = filepathToTree(fps6, { soryItems: soryItems6 })
 * fs.writeFileSync('r6.json', JSON.stringify(r6), 'utf8')
 * console.log(r6)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯aaa1': '0.children.1',
 * //     'root❯aaa10': '0.children.2',
 * //     'root❯aaa2': '0.children.3',
 * //     'root❯aaa❯mmm': '0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z2.txt': '0.children.0.children.0.children.1',
 * //     'root❯aaa❯mmm❯z10.txt': '0.children.0.children.0.children.2'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa1' },
 * //     { type: 'folder', path: '/root/aaa2' },
 * //     { type: 'folder', path: '/root/aaa10' },
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'folder', path: '/root/aaa/mmm' },
 * //     { type: 'file', path: '/root/aaa/mmm/z1.txt' },
 * //     { type: 'file', path: '/root/aaa/mmm/z2.txt' },
 * //     { type: 'file', path: '/root/aaa/mmm/z10.txt' }
 * //   ]
 * // }
 *
 * let fps7 = [{ 'type': 'folder', 'path': '/aaa1' }, { 'type': 'folder', 'path': '/aaa2' }, { 'type': 'folder', 'path': '/aaa10' }, { 'type': 'file', 'path': '/aaa/mmm/z1.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z2.txt' }, { 'type': 'file', 'path': '/aaa/mmm/z10.txt' }]
 * let soryItems7 = (rs, pid, ns) => {
 *     // console.log('soryItems', 'pid=', pid, 'ns=', ns, 'rs=', rs)
 *     rs = arrSort(rs, { compareKey: 'text', localeCompare: true })
 *     return rs
 * }
 * let r7 = filepathToTree(fps7, { soryItems: soryItems7 })
 * fs.writeFileSync('r7.json', JSON.stringify(r7), 'utf8')
 * console.log(r7)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯aaa1': '0.children.1',
 * //     'root❯aaa2': '0.children.2',
 * //     'root❯aaa10': '0.children.3',
 * //     'root❯aaa❯mmm': '0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z2.txt': '0.children.0.children.0.children.1',
 * //     'root❯aaa❯mmm❯z10.txt': '0.children.0.children.0.children.2'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa1' },
 * //     { type: 'folder', path: '/root/aaa2' },
 * //     { type: 'folder', path: '/root/aaa10' },
 * //     { type: 'folder', path: '/root/aaa' },
 * //     { type: 'folder', path: '/root/aaa/mmm' },
 * //     { type: 'file', path: '/root/aaa/mmm/z1.txt' },
 * //     { type: 'file', path: '/root/aaa/mmm/z2.txt' },
 * //     { type: 'file', path: '/root/aaa/mmm/z10.txt' }
 * //   ]
 * // }
 *
 * //先建虛擬資料夾再補建資料夾
 * let fps8 = [
 *     { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
 *     { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
 *     { 'type': 'folder', 'path': '/aaa/mmm', 'ext': 'ext3' },
 * ]
 * let r8 = filepathToTree(fps8)
 * fs.writeFileSync('r8.json', JSON.stringify(r8), 'utf8')
 * console.log(r8)
 * console.log('\n\n')
 * // => {
 * //   treeItems: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       _indOri: null,
 * //       _indNormalize: null,
 * //       ns: 1,
 * //       ts: [Array],
 * //       pathInfors: [Array],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: 'root',
 * //       parentId: '',
 * //       text: 'root',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     root: '0',
 * //     'root❯aaa': '0.children.0',
 * //     'root❯aaa❯mmm': '0.children.0.children.0',
 * //     'root❯aaa❯mmm❯z1.txt': '0.children.0.children.0.children.0'
 * //   },
 * //   fpsNormalize: [
 * //     { type: 'folder', path: '/root/aaa', ext: 'ext1' },
 * //     { type: 'folder', path: '/root/aaa/mmm', ext: 'ext3' },
 * //     { type: 'file', path: '/root/aaa/mmm/z1.txt', ext: 'ext2' }
 * //   ]
 * // }
 *
 * //先建虛擬資料夾再補建檔案須報錯
 * let fps9 = [
 *     { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
 *     { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
 *     { 'type': 'file', 'path': '/aaa/mmm', 'ext': 'ext3' },
 * ]
 * let r9
 * try {
 *     r9 = filepathToTree(fps9)
 * }
 * catch (err) {
 *     r9 = err.toString()
 * }
 * fs.writeFileSync('r9.json', JSON.stringify(r9), 'utf8')
 * console.log(r9)
 * console.log('\n\n')
 * // => Error: invalid fps[2].path: conflicts with fps[1], the same path is both a folder and a file
 *
 * //先建檔案再補建虛擬資料夾須報錯
 * let fps10 = [
 *     { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
 *     { 'type': 'file', 'path': '/aaa/mmm', 'ext': 'ext3' },
 *     { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
 * ]
 * let r10
 * try {
 *     r10 = filepathToTree(fps10)
 * }
 * catch (err) {
 *     r10 = err.toString()
 * }
 * fs.writeFileSync('r10.json', JSON.stringify(r10), 'utf8')
 * console.log(r10)
 * console.log('\n\n')
 * // => Error: invalid fps[2].path: conflicts with fps[1], the same path is both a file and a folder
 *
 * //先建檔案再補建資料夾須報錯
 * let fps11 = [
 *     { 'type': 'folder', 'path': '/aaa', 'ext': 'ext1' },
 *     { 'type': 'file', 'path': '/aaa/mmm', 'ext': 'ext3' },
 *     { 'type': 'folder', 'path': '/aaa/mmm', 'ext': 'ext4' },
 *     { 'type': 'file', 'path': '/aaa/mmm/z1.txt', 'ext': 'ext2' },
 * ]
 * let r11
 * try {
 *     r11 = filepathToTree(fps11)
 * }
 * catch (err) {
 *     r11 = err.toString()
 * }
 * fs.writeFileSync('r11.json', JSON.stringify(r11), 'utf8')
 * console.log(r11)
 * console.log('\n\n')
 * // => Error: invalid fps[2].path: conflicts with fps[1], the same path is both a file and a folder
 *
 * //項目無效須報錯(指出第幾個項目, 不含路徑)
 * try {
 *     filepathToTree([{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'abc', 'path': '/aaa/b.txt' }])
 * }
 * catch (err) {
 *     console.log(err.toString())
 * }
 * // => Error: invalid fps[1].type: must be 'folder' or 'file'
 *
 * //非陣列或空陣列回傳同形之空結果
 * console.log(filepathToTree([]))
 * // => { treeItems: [], treeItemsFolder: [], kpPath: {}, fpsNormalize: [] }
 *
 */
function filepathToTree(fps, opt = {}) {

    //check, 參數層: 非陣列或空陣列回傳同形之空結果(使用者2026-11-14, 第430項第二批: 原回傳{})
    if (!isarr(fps) || fps.length === 0) {
        return {
            treeItems: [],
            treeItemsFolder: [],
            kpPath: {},
            fpsNormalize: [],
        }
    }

    //delimiter
    let delimiter = get(opt, 'delimiter')
    if (!isestr(delimiter)) {
        delimiter = '❯' //使用特殊符號區分階層
    }

    //bindRoot
    let bindRoot = get(opt, 'bindRoot')
    if (!isestr(bindRoot)) {
        bindRoot = ''
    }

    //useBindRoot, bindRootTemp
    let useBindRoot = isestr(bindRoot)
    let bindRootTemp = ''
    if (useBindRoot) {
        bindRootTemp = bindRoot
    }
    else {
        bindRootTemp = 'root'
    }
    // console.log('useBindRoot', useBindRoot)
    // console.log('bindRootTemp', bindRootTemp)

    //soryItems
    let soryItems = get(opt, 'soryItems')

    //parseFp
    let parseFp = (fp) => {

        //replace
        // fp = replace(fp, '\\\\', '\\')
        fp = fp.replace(/\\\\/g, '\\')
        // fp = replace(fp, '\\', '/')
        fp = fp.replace(/\\/g, '/')

        //sep
        let ss = sep(fp, '/')

        //cfp, 組裝成字串路徑
        let cfp = join(ss, delimiter)

        return {
            ss,
            cfp,
        }
    }

    //getOwn, 只取自有可列舉欄位之值(不取繼承之欄位)
    let getOwn = (o, k) => {
        return Object.prototype.propertyIsEnumerable.call(o, k) ? o[k] : undefined
    }

    //check, 元素層: 各項目須為物件, path須為非空字串, type須為'folder'或'file', 路徑之各段不得含分隔字串; 不符即拋錯並指出第幾個項目, 訊息不含路徑(使用者2026-11-14, 第430項第二批)
    //  不改動呼叫端之項目(原對無效type寫回v.type = 'file')
    let vps = []
    for (let k = 0; k < fps.length; k++) {
        let v = fps[k]
        if (!isobj(v)) {
            throw new Error(`invalid fps[${k}]: must be an object`)
        }
        let p = getOwn(v, 'path')
        if (typeof p !== 'string' || p === '') {
            throw new Error(`invalid fps[${k}].path: must be a non-empty string`)
        }
        let r = parseFp(p)
        if (r.ss.length === 0) {
            //分段(去頭尾空白、略過空段)後無任何段者('/'、'///'、'   '等)比照空字串(主控2026-11-14裁定, 第430項第二批ws430b2: 原靜默略過該項目)
            throw new Error(`invalid fps[${k}].path: must be a non-empty string`)
        }
        let t = getOwn(v, 'type')
        if (t !== 'folder' && t !== 'file') {
            throw new Error(`invalid fps[${k}].type: must be 'folder' or 'file'`)
        }
        for (let s of r.ss) {
            if (s.indexOf(delimiter) >= 0) {
                throw new Error(`invalid fps[${k}].path: a path segment must not contain the delimiter, set opt.delimiter to another string`)
            }
        }
        vps.push({ type: t, ss: r.ss })
    }

    //parseFp
    let vfps = map(fps, (v, k) => {

        //r, 已檢測之路徑段與type(檢測之值即使用之值)
        let r = vps[k]
        // console.log('parseFp', v.path, r)

        // //ns
        // let ns = size(r.ss)

        // //pas
        // let pas = []
        // if (ns - 1 > 0) {
        //     pas = take(r.s, ns - 1)
        // }

        // //pacfp
        // let pacfp = ''
        // if (size(pas) > 0) {
        //     pacfp = join(pas, delimiter)
        // }

        //t
        let t = {
            ind: k,
            type: r.type,
            // name: r.name,
            // ns,
            ss: r.ss,
            // id: r.cfp,
            // pas,
            // parentId: pacfp,
            data: cloneDeep(v),
        }

        return t
    })
    // console.log('vfps', vfps)

    //genParentIds
    let genParentIds = (ts) => {

        //n
        let n = size(ts)

        //pathInfors, 各父層(含自己)資訊
        let pathInfors = []
        for (let i = 0; i < n; i++) {

            //tss
            let tss = []
            for (let j = 0; j <= i; j++) {
                tss.push(ts[j])
            }

            //id
            let id = join(tss, delimiter)
            // console.log(id, id)

            //push
            pathInfors.push({
                id,
                name: ts[i],
            })

        }

        // //剔除root
        // pathInfors = drop(pathInfors)

        return pathInfors
    }

    //fpsNormalize, kpLv
    let ind = -1
    let fpsNormalize = []
    let kpLv = {}
    let kpBy = {}
    each(vfps, (v) => {

        //ts
        let ts = null
        // if (useBindRoot) {
        //     ts = [bindRootTemp] //先由root當最上層
        // }
        // else {
        //     ts = []
        // }
        ts = [bindRootTemp] //先由root當最上層

        //id0
        let id0 = null
        // if (useBindRoot) {
        //     id0 = bindRootTemp //先由root當最上層
        // }
        // else {
        //     id0 = ''
        // }
        id0 = bindRootTemp //先由root當最上層

        //nsm1
        let nsm1 = size(v.ss) - 1

        //偵測各層
        each(v.ss, (s, ks) => {

            //isFolder, 當ks小於ns-1時一定為資料夾, 因有些是直接提供深層檔案沒有父層資料夾, 故得另外計算
            let isFolder = ks < nsm1 || v.type === 'folder'

            //ts
            ts.push(s)

            //indOri, data
            let indOri = null
            let data = null
            if (ks === nsm1) {
                indOri = v.ind
                data = v.data
            }

            //id
            let id = join(ts, delimiter)
            // console.log(id, ks, 'isFolder', isFolder)

            //pathInfors
            let pathInfors = genParentIds(ts)

            //check
            if (!haskey(kpLv, id)) {
                ind++

                //indNormalize
                let indNormalize = ind

                //r
                let r = null
                if (isFolder) {
                    r = {
                        _indOri: indOri,
                        _indNormalize: indNormalize,
                        ns: size(ts),
                        ts: cloneDeep(ts),
                        pathInfors,
                        _type: 'folder',
                        type: 'array',
                        numOfChilren: -1, //無法計算
                        id,
                        parentId: id0,
                        text: s,
                        children: [], //資料夾預先建置children
                        data,
                    }
                }
                else {
                    r = {
                        _indOri: indOri,
                        _indNormalize: indNormalize,
                        ns: size(ts),
                        ts: cloneDeep(ts),
                        pathInfors,
                        _type: 'file',
                        type: 'node',
                        numOfChilren: -1, //無法計算
                        id,
                        parentId: id0,
                        text: s,
                        // children,
                        data,
                    }
                }
                kpLv[id] = r
                kpBy[id] = v.ind //建立此路徑之項目

                //push, 新增項目所儲存指標為ind
                fpsNormalize.push({
                    ...get(kpLv[id], 'data', {}), //預先填入原始數據, 之後再複寫type與path, 因可能無data故得要預設為{}
                    type: kpLv[id]._type,
                    path: '/' + join(ts, '/'),
                })

            }
            else {
                //若因為給予數據未排序導致先建立虛擬資料夾時, 得偵測與更新數據

                //r, 因id可能有「.」得使用[]預先取出物件, 再進行後續處理
                let r = kpLv[id]

                //_typeOld
                let _typeOld = get(r, '_type', '')

                //isFolderOld
                let isFolderOld = _typeOld === 'folder'

                //nameOld, 先前建立此路徑之項目(有原始數據者取其索引, 虛擬資料夾取建立它之項目)
                let nameOld = `fps[${r._indOri !== null ? r._indOri : kpBy[id]}]`

                //update, 拋錯訊息不含路徑、指出第幾個項目, 不輸出內部物件至console(使用者2026-11-14, 第430項第二批)
                if (!isFolderOld && isFolder) {
                    //過去已建檔案, 但現在須新建資料夾, 非預期須報錯
                    throw new Error(`invalid fps[${v.ind}].path: conflicts with ${nameOld}, the same path is both a file and a folder`)
                }
                else if (!isFolderOld && !isFolder) {
                    //過去已建檔案, 但現在又須新建為檔案, 數據有重複, 非預期須報錯
                    throw new Error(`invalid fps[${v.ind}].path: duplicate file path of ${nameOld}`)
                }
                else if (isFolderOld && !isFolder) {
                    //過去已建資料夾或虛擬資料夾, 但現在又須新建為檔案, 數據不一致, 非預期須報錯
                    throw new Error(`invalid fps[${v.ind}].path: conflicts with ${nameOld}, the same path is both a folder and a file`)
                }
                else { //isFolderOld && isFolder
                    //過去已建資料夾但現在又須新建為資料夾, 預期上是兩次被視為虛擬資料夾

                    if (iseobj(kpLv[id].data) && iseobj(data)) {
                        //因視為資料夾data已為實際data, 但又出現新data, 非預期須報錯
                        throw new Error(`invalid fps[${v.ind}].path: duplicate folder path of ${nameOld}`)
                    }
                    else if (kpLv[id].data === null && iseobj(data)) {
                        //之前資料夾無data, 但出現資料夾且有data, 預期是原始數據先建置虛擬資料夾, 且後面又提供指定為資料夾數據

                        //update kpLv[id]
                        kpLv[id]._indOri = indOri
                        kpLv[id].data = data

                        //update fpsNormalize
                        let ind = kpLv[id]._indNormalize
                        let t = fpsNormalize[ind]
                        fpsNormalize[ind] = {
                            ...data,
                            type: t.type,
                            path: t.path,
                        }

                    }
                    else { //kpLv[id].data !== null && data === null
                        //無data代表不須更新data
                    }
                }

            }

            //update id0
            id0 = id

        })

    })
    // console.log('kpLv', kpLv)
    // console.log('fpsNormalize', fpsNormalize)

    //vLv
    let vLv = values(kpLv)
    // console.log('vLv', vLv)

    //sortBy
    vLv = sortBy(vLv, 'id') //用id排序
    vLv = sortBy(vLv, 'ns') //用階層數排序, 少的放前
    // console.log('vLv', vLv)

    //soryItems
    if (isfun(soryItems)) {
        let vLvTemp = []
        let g1Lv = groupBy(vLv, 'ns')
        each(g1Lv, (g1v, g1k) => {
            let g2Lv = groupBy(g1v, 'parentId')
            each(g2Lv, (g2v, g2k) => {

                //soryItems
                // console.log('soryItems before', map(g2v, 'text'))
                let r = soryItems(g2v, g2k, g1k)
                // console.log('soryItems after', map(r, 'text'))

                //merge
                vLvTemp = [
                    ...vLvTemp,
                    ...r,
                ]

            })
        })
        vLv = vLvTemp
    }

    //vLvFd, vLvFl
    let vLvFd = []
    let vLvFl = []
    each(vLv, (v) => {
        if (v._type === 'folder') {
            vLvFd.push(v)
        }
        else {
            vLvFl.push(v)
        }
    })
    // console.log('vLvFd', vLvFd)
    // console.log('vLvFl', vLvFl)

    //gdataFd, gdataFl
    let gdataFd = groupBy(vLvFd, 'ns')
    let gdataFl = groupBy(vLvFl, 'ns')
    // console.log('gdataFd', gdataFd)
    // console.log('gdataFl', gdataFl)

    //nsMaxFd, nsMaxFl 最大層數
    let nsMaxFd = max(map(vLvFd, 'ns'))
    let nsMaxFl = max(map(vLvFl, 'ns'))

    //treeItems
    let treeItems = null
    if (true) {
        let ts = [bindRootTemp]
        treeItems = [
            {
                _indOri: null,
                _indNormalize: null,
                ns: size(ts),
                ts: cloneDeep(ts),
                pathInfors: genParentIds(ts),
                _type: 'folder',
                type: 'array',
                numOfChilren: -1, //無法計算
                id: bindRootTemp, //給予root為主鍵
                parentId: '', //無上層id
                text: bindRootTemp,
                children: [], //未避免後續為最末端資料夾不能靠偵測建置, 一律改成預設建置
                data: null,
            }
        ]
    }

    //kpPathFd, kpPath, 從上層開始建構folder, file之後再建
    let kpPathFd = {}
    kpPathFd[bindRootTemp] = `0.children` //儲存自己子資料夾路徑, 預建root故為第1個也只有1個
    let kpPath = {}
    kpPath[bindRootTemp] = `0` //儲存自己(資料夾)路徑
    for (let i = 2; i <= nsMaxFd; i++) { //有root在故從2開始

        //data
        let data = gdataFd[i]
        // console.log(i, 'folder data', data)

        each(data, (v) => {
            // console.log('each folder', v, v.id)

            //k, 父層取鍵
            let k = get(kpPathFd, v.parentId, '')
            // console.log('父層取鍵', k)

            //check
            if (!isestr(k)) {
                console.log('kpPathFd', kpPathFd)
                console.log('v', v, v.parentId)
                throw new Error(`invalid parentId[${v.parentId}] in folder`)
            }

            //chds
            let chds = get(treeItems, k)
            // console.log('chds', chds, map(chds, 'id'))

            //set
            if (!isarr(chds)) { //因先處理資料夾, 故此處一定需為資料夾
                set(treeItems, k, [])
            }

            //重取chds, 因若有重建則須重取
            chds = get(treeItems, k)

            //chd
            let chd = find(chds, { id: v.id })

            //check
            if (!iseobj(chd)) {

                //push, 加入本層資料夾
                chds.push({
                    ...v,
                    children: [], //未避免後續為最末端資料夾不能靠偵測建置, 一律改成預設建置
                })

                //save
                let c = `${k}.${size(chds) - 1}`
                kpPathFd[v.id] = `${c}.children` //儲存自己子資料夾路徑
                kpPath[v.id] = c //儲存自己(資料夾)路徑

            }

        })

    }
    // console.log('treeItems(add folder)', cloneDeep(treeItems))
    // console.log('kpPathFd', kpPathFd)

    //cloneDeep
    let treeItemsFolder = cloneDeep(treeItems)
    // console.log('treeItemsFolder', treeItemsFolder)

    //kpPathFl, 從上層開始建構file
    let kpPathFl = {}
    for (let i = 2; i <= nsMaxFl; i++) { //有root在故從2開始

        //data
        let data = gdataFl[i]
        // console.log(i, 'file data', data)

        each(data, (v) => {
            // console.log('each file', v, v.id)

            //k, 父層取鍵
            let k = get(kpPathFd, v.parentId, '')
            // console.log('父層取鍵', k)

            //check
            if (!isestr(k)) {
                console.log('kpPathFd', kpPathFd)
                console.log('v', v, v.parentId)
                throw new Error(`invalid parentId[${v.parentId}] in file`)
            }

            //chds
            let chds = get(treeItems, k)
            // console.log('chds', chds, map(chds, 'id'))

            //set
            if (!isarr(chds)) { //因先處理資料夾, 故此處一定需為資料夾
                console.log('treeItems', treeItems)
                console.log('k', k)
                console.log('v', v)
                throw new Error('無預先建置資料夾')
            }

            //chd
            let chd = find(chds, { id: v.id })

            //check
            if (!iseobj(chd)) {

                //push, 加入本層檔案
                chds.push(v)

                //save
                let c = `${k}.${size(chds) - 1}`
                kpPathFl[v.id] = c //儲存自己檔案路徑
                kpPath[v.id] = c //儲存自己(檔案)路徑

            }

        })

    }
    // console.log('treeItems(add file)', cloneDeep(treeItems))
    // console.log('kpPathFl', kpPathFl)

    // //check
    // if (!useBindRoot) {

    //     //取root的children當作最上層, 但其內id相關(id,parentId,pathInfors,ts)皆有bindRootTemp
    //     treeItems = get(treeItems, '0.children', [])
    //     treeItemsFolder = get(treeItemsFolder, '0.children', [])

    //     // // kpPath
    //     // let _kpPath = {}
    //     // each(kpPath, (v, k) => {
    //     //     // console.log(k, v)

    //     //     //不保留root
    //     //     if (k === bindRootTemp) {
    //     //         return true //跳出換下一個
    //     //     }

    //     //     //刪除前綴
    //     //     if (isestr(v) && v.startsWith('0.children.')) {
    //     //         _kpPath[k] = v.slice('0.children.'.length)
    //     //         return true //跳出換下一個
    //     //     }

    //     //     //save
    //     //     _kpPath[k] = v

    //     // })
    //     // kpPath = _kpPath

    //     //rootPrefix
    //     let rootPrefix = `${bindRootTemp}${delimiter}`

    //     let stripId = (id) => {

    //         //check
    //         if (!isestr(id)) {
    //             return id
    //         }

    //         //root自己
    //         if (id === bindRootTemp) {
    //             throw new Error(`非預期錯誤: 應該已剔除root`)
    //         }

    //         //移除開頭rootPrefix
    //         if (id.startsWith(rootPrefix)) {
    //             return id.slice(rootPrefix.length)
    //         }

    //         return id
    //     }

    //     let stripTs = (ts) => {

    //         //check
    //         if (!isarr(ts)) {
    //             return ts
    //         }

    //         //移除開頭的root
    //         if (ts.length > 0 && ts[0] === bindRootTemp) {
    //             return ts.slice(1)
    //         }

    //         return ts
    //     }

    //     let stripPathInfors = (pathInfors) => {

    //         //check
    //         if (!isarr(pathInfors)) {
    //             return pathInfors
    //         }

    //         //移除開頭的root
    //         let pinf = pathInfors
    //         if (pinf.length > 0 && get(pinf, '0.id') === bindRootTemp) {
    //             pinf = pinf.slice(1)
    //         }

    //         //修正每筆id
    //         return pinf.map((p) => {
    //             let pp = { ...p }
    //             if (isestr(pp.id)) {
    //                 pp.id = stripId(pp.id)
    //             }
    //             return pp
    //         })
    //     }

    //     let normalizeNode = (node) => {

    //         //check
    //         if (!node || typeof node !== 'object') {
    //             return node
    //         }

    //         // copy（避免意外改到外部引用）
    //         let n = { ...node }

    //         // strip fields
    //         if (isestr(n.id)) n.id = stripId(n.id)
    //         if (isestr(n.parentId)) n.parentId = stripId(n.parentId)

    //         if (isarr(n.ts)) n.ts = stripTs(n.ts)
    //         if (isarr(n.pathInfors)) n.pathInfors = stripPathInfors(n.pathInfors)

    //         // ns 依照 ts 重算（若沒有 ts 就保留原值）
    //         if (isarr(n.ts)) n.ns = n.ts.length

    //         // children recursive
    //         if (isarr(n.children)) {
    //             n.children = n.children.map(normalizeNode)

    //             // 防護：若你的資料來源有異常導致 children 出現空 id，可在這裡過濾掉
    //             // （正常情況不會發生）
    //             n.children = n.children.filter((c) => !isestr(c.id) || c.id !== '')
    //         }

    //         return n
    //     }

    //     // normalize treeItems / treeItemsFolder
    //     treeItems = treeItems.map(normalizeNode)
    //     treeItemsFolder = treeItemsFolder.map(normalizeNode)

    //     // --- kpPath：同時處理 key 與 value ---
    //     let _kpPath = {}
    //     each(kpPath, (v, k) => {

    //         // 不保留 root
    //         if (k === bindRootTemp) {
    //             return true
    //         }

    //         // key 去 root 化（只去開頭那段）
    //         let kk = stripId(k)

    //         // 若 key 變空（代表原本就是 root），跳過
    //         if (isestr(kk) && kk === '') {
    //             return true
    //         }

    //         // value 去掉 0.children. 前綴（你原本的邏輯）
    //         if (isestr(v) && v.startsWith('0.children.')) {
    //             _kpPath[kk] = v.slice('0.children.'.length)
    //             return true
    //         }

    //         // save
    //         _kpPath[kk] = v
    //         return true
    //     })
    //     kpPath = _kpPath

    // }

    return {
        treeItems,
        treeItemsFolder,
        kpPath,
        fpsNormalize,
    }
}


export default filepathToTree
