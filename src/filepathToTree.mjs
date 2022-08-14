import get from 'lodash/get'
import set from 'lodash/set'
import each from 'lodash/each'
import map from 'lodash/map'
import size from 'lodash/size'
import max from 'lodash/max'
import last from 'lodash/last'
import values from 'lodash/values'
import drop from 'lodash/drop'
import groupBy from 'lodash/groupBy'
import take from 'lodash/take'
import join from 'lodash/join'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
import cloneDeep from 'lodash/cloneDeep'
import sep from './sep.mjs'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import haskey from './haskey.mjs'
import strdelleft from './strdelleft.mjs'


/**
 * 展開檔案陣列成為樹狀物件與關聯資料物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/filepathToTree.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} data 輸入項目陣列，每個項目需為物件，並提供path與type兩鍵值，其中type需為'folder'或'file'
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [delimiter='❯'] 輸入路徑分隔字串，預設'❯'
 * @param {String} [bindRoot='root'] 輸入臨時封裝用根目錄字串，預設'root'
 * @returns {Object} 回傳結果物件，其內treeItems為資料夾與檔案之樹狀物件，treeItemsFolder為僅資料夾之樹狀物件，kpPath為各項目id之取樹狀物件路徑物件
 * @example
 *
 * let fps1 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
 * let r1 = filepathToTree(fps1)
 * console.log(r1)
 * // => {
 * //   treeItems: [
 * //     {
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
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
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
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
 * //     'root❯aaa': '0',
 * //     'root❯aaa❯bbb': '0.children.0',
 * //     'root❯aaa❯bbb❯z1.txt': '0.children.0.children.0'
 * //   }
 * // }
 *
 * let fps2 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
 * let r2 = filepathToTree(fps2, { delimiter: '>' })
 * console.log(r2)
 * // => {
 * //   treeItems: [
 * //     {
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
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
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
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
 * //     'root>aaa': '0',
 * //     'root>aaa>bbb': '0.children.0',
 * //     'root>aaa>bbb>z1.txt': '0.children.0.children.0'
 * //   }
 * // }
 *
 *
 * let fps3 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa/bbb/z1.txt' }]
 * let r3 = filepathToTree(fps3, { bindRoot: '本機' })
 * console.log(r3)
 * // => {
 * //   treeItems: [
 * //     {
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: '本機',
 * //       parentId: '',
 * //       text: '本機',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   treeItemsFolder: [
 * //     {
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
 * //       _type: 'folder',
 * //       type: 'array',
 * //       numOfChilren: -1,
 * //       id: '本機',
 * //       parentId: '',
 * //       text: '本機',
 * //       children: [Array],
 * //       data: null
 * //     }
 * //   ],
 * //   kpPath: {
 * //     '本機❯aaa': '0',
 * //     '本機❯aaa❯bbb': '0.children.0',
 * //     '本機❯aaa❯bbb❯z1.txt': '0.children.0.children.0'
 * //   }
 * // }
 *
 * let fps4 = [{ 'type': 'folder', 'path': '/aaa' }, { 'type': 'file', 'path': '/aaa1.txt' }, { 'type': 'file', 'path': '/aaa2.txt' }, { 'type': 'folder', 'path': '/aaa/aaabbb' }, { 'type': 'file', 'path': '/aaa/aaabbb.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/aaabbbccc.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd/abcde.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef1.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef2.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg01.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg02.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg03.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg04.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg05.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg06.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg07.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg08.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg09.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg10.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg11.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg12.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg13.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg14.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg15.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg16.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg17.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg18.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg19.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcde/abcdefg20.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd1.txt' }, { 'type': 'file', 'path': '/aaa/aaabbb/abc/abcd2.txt' }, { 'type': 'folder', 'path': '/bbb' }, { 'type': 'file', 'path': '/ccc/cccddd/cccdddeee.txt' }, { 'type': 'folder', 'path': '/eee' }, { 'type': 'folder', 'path': '/eee/eeefff1' }, { 'type': 'folder', 'path': '/eee/eeefff2' }, { 'type': 'folder', 'path': '/ggg/' }, { 'type': 'folder', 'path': 'c:\\\\hhh' }, { 'type': 'folder', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff' }, { 'type': 'file', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/gfedcba.txt' }, { 'type': 'file', 'path': '/aaaa/bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff/ggg/hhh.txt' }, { 'type': 'folder', 'path': 'd:\\\\中文路徑1' }, { 'type': 'folder', 'path': '/中文路徑2' }, { 'type': 'file', 'path': '/中文路徑2/aaa/aaabbb/abc/測試.txt' }]
 * let r4 = filepathToTree(fps4)
 * console.log(r4)
 * // => {
 * //   treeItems: [
 * //     {
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
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
 * //       ns: 0,
 * //       ts: [],
 * //       parentInfors: [],
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
 * //     'root❯aaa': '0',
 * //     'root❯aaaa': '1',
 * //     'root❯bbb': '2',
 * //     'root❯c:': '3',
 * //     'root❯ccc': '4',
 * //     'root❯d:': '5',
 * //     'root❯eee': '6',
 * //     'root❯ggg': '7',
 * //     'root❯中文路徑2': '8',
 * //     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff': '1.children.0',
 * //     'root❯aaa❯aaabbb': '0.children.0',
 * //     'root❯c:❯hhh': '3.children.0',
 * //     'root❯ccc❯cccddd': '4.children.0',
 * //     'root❯d:❯中文路徑1': '5.children.0',
 * //     'root❯eee❯eeefff1': '6.children.0',
 * //     'root❯eee❯eeefff2': '6.children.1',
 * //     'root❯中文路徑2❯aaa': '8.children.0',
 * //     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg': '1.children.0.children.0',
 * //     'root❯aaa❯aaabbb❯abc': '0.children.0.children.0',
 * //     'root❯中文路徑2❯aaa❯aaabbb': '8.children.0.children.0',
 * //     'root❯aaa❯aaabbb❯abc❯abcd': '0.children.0.children.0.children.0',
 * //     'root❯aaa❯aaabbb❯abc❯abcde': '0.children.0.children.0.children.1',
 * //     'root❯中文路徑2❯aaa❯aaabbb❯abc': '8.children.0.children.0.children.0',
 * //     'root❯aaa1.txt': '9',
 * //     'root❯aaa2.txt': '10',
 * //     'root❯aaa❯aaabbb.txt': '0.children.1',
 * //     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯gfedcba.txt': '1.children.0.children.1',
 * //     'root❯aaa❯aaabbb❯aaabbbccc.txt': '0.children.0.children.1',
 * //     'root❯ccc❯cccddd❯cccdddeee.txt': '4.children.0.children.0',
 * //     'root❯aaaa❯bbbbbb cccccccccccc ddd dd ddd ddd ddd eeeeeeeeeeee ffff❯ggg❯hhh.txt': '1.children.0.children.0.children.0',
 * //     'root❯aaa❯aaabbb❯abc❯abcd1.txt': '0.children.0.children.0.children.2',
 * //     'root❯aaa❯aaabbb❯abc❯abcd2.txt': '0.children.0.children.0.children.3',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdef1.txt': '0.children.0.children.0.children.1.children.0',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdef2.txt': '0.children.0.children.0.children.1.children.1',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdef3 aaa bbb ccc dddddd eeeeeee fffffffffff ggggggggggggg.txt': '0.children.0.children.0.children.1.children.2',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg01.txt': '0.children.0.children.0.children.1.children.3',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg02.txt': '0.children.0.children.0.children.1.children.4',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg03.txt': '0.children.0.children.0.children.1.children.5',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg04.txt': '0.children.0.children.0.children.1.children.6',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg05.txt': '0.children.0.children.0.children.1.children.7',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg06.txt': '0.children.0.children.0.children.1.children.8',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg07.txt': '0.children.0.children.0.children.1.children.9',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg08.txt': '0.children.0.children.0.children.1.children.10',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg09.txt': '0.children.0.children.0.children.1.children.11',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg10.txt': '0.children.0.children.0.children.1.children.12',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg11.txt': '0.children.0.children.0.children.1.children.13',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg12.txt': '0.children.0.children.0.children.1.children.14',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg13.txt': '0.children.0.children.0.children.1.children.15',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg14.txt': '0.children.0.children.0.children.1.children.16',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg15.txt': '0.children.0.children.0.children.1.children.17',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg16.txt': '0.children.0.children.0.children.1.children.18',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg17.txt': '0.children.0.children.0.children.1.children.19',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg18.txt': '0.children.0.children.0.children.1.children.20',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg19.txt': '0.children.0.children.0.children.1.children.21',
 * //     'root❯aaa❯aaabbb❯abc❯abcde❯abcdefg20.txt': '0.children.0.children.0.children.1.children.22',
 * //     'root❯aaa❯aaabbb❯abc❯abcd❯abcde.txt': '0.children.0.children.0.children.0.children.0',
 * //     'root❯中文路徑2❯aaa❯aaabbb❯abc❯測試.txt': '8.children.0.children.0.children.0.children.0'
 * //   }
 * // }
 *
 */
function filepathToTree(data, opt = {}) {

    //check
    if (!isearr(data)) {
        return {}
    }

    //delimiter
    let delimiter = get(opt, 'delimiter')
    if (!isestr(delimiter)) {
        delimiter = '❯' //使用特殊符號區分階層
    }

    //bindRoot
    let bindRoot = get(opt, 'bindRoot')
    if (!isestr(bindRoot)) {
        bindRoot = 'root'
    }

    //parseFp
    let parseFp = (fp) => {

        //replace
        // fp = replace(fp, '\\\\', '\\')
        fp = fp.replace(/\\\\/g, '\\')
        // fp = replace(fp, '\\', '/')
        fp = fp.replace(/\\/g, '/')

        //sep
        let ss = sep(fp, '/')

        // //add root
        // ss = [bindRoot, ...ss]

        //cfp, 組裝成字串路徑
        let cfp = join(ss, delimiter)

        //name
        let name = last(ss)

        return {
            ss,
            cfp,
            name,
        }
    }

    //parseFp
    let vdata = map(data, (v) => {

        //check
        if (v.type !== 'folder' && v.type !== 'file') {
            v.type = 'file'
        }

        //parseFp
        let r = parseFp(v.path)
        // console.log('parseFp', v.path, r)

        //ns
        let ns = size(r.ss)

        //pas
        let pas = []
        if (ns - 1 > 0) {
            pas = take(r.s, ns - 1)
        }

        //pacfp
        let pacfp = ''
        if (size(pas) > 0) {
            pacfp = join(pas, delimiter)
        }

        //t
        let t = {
            type: v.type,
            name: r.name,
            ns,
            ss: r.ss,
            id: r.cfp,
            pas,
            parentId: pacfp,
            data: cloneDeep(v),
        }

        return t
    })
    // console.log('vdata', vdata)

    //genParentIds
    let genParentIds = (ts) => {

        //n
        let n = size(ts)

        //parentInfors
        let parentInfors = []
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
            parentInfors.push({
                id,
                name: ts[i],
            })

        }

        //剔除root
        parentInfors = drop(parentInfors)

        return parentInfors
    }

    //kpLv
    let kpLv = {}
    each(vdata, (v) => {

        //update
        let ts = [bindRoot] //由bindRoot當最上層
        let id0 = bindRoot //由bindRoot當最上層
        each(v.ss, (s, ks) => {

            //isFolder, 當ks小於ns-1時一定為資料夾, 因有些是直接提供深層檔案沒有父層資料夾, 故得另外計算
            let isFolder = ks < v.ns - 1 || v.type === 'folder'

            //ts
            ts.push(s)

            //data
            let data = null
            if (ks === v.ns - 1) {
                data = v.data
            }

            //id
            let id = join(ts, delimiter)
            // console.log(id, ks, v.ns - 1, 'isFolder', isFolder)

            //parentInfors
            let parentInfors = genParentIds(ts)

            //check
            if (!haskey(kpLv, id)) {
                if (isFolder) {
                    kpLv[id] = {
                        ns: size(ts),
                        ts: cloneDeep(ts),
                        parentInfors,
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
                    kpLv[id] = {
                        ns: size(ts),
                        ts: cloneDeep(ts),
                        parentInfors,
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
            }

            //update id0
            id0 = id

        })

    })
    // console.log('kpLv', kpLv)

    //vLv
    let vLv = values(kpLv)
    // console.log('vLv', vLv)

    //treeItems
    let treeItems = [
        {
            ns: 0,
            ts: [],
            parentInfors: [],
            _type: 'folder',
            type: 'array',
            numOfChilren: -1, //無法計算
            id: bindRoot, //給予bindRoot為主鍵
            parentId: '', //無上層id
            text: bindRoot,
            children: [], //未避免後續為最末端資料夾不能靠偵測建置, 一律改成預設建置
            data: null,
        }
    ]

    //sortBy
    vLv = sortBy(vLv, 'ns') //用階層數排序, 少的放前
    vLv = sortBy(vLv, 'id') //用id排序
    // console.log('vLv', vLv)

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

    //kpPath
    let kpPath = {}

    //kpPathFd, 從上層開始建構folder, file之後再建
    let kpPathFd = {}
    kpPathFd[bindRoot] = `0.children` //預建bindRoot故為第1個也只有1個
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
                kpPathFd[v.id] = `${c}.children`
                kpPath[v.id] = c

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
                kpPathFl[v.id] = c
                kpPath[v.id] = c

            }

        })

    }
    // console.log('treeItems(add file)', cloneDeep(treeItems))
    // console.log('kpPathFl', kpPathFl)

    //remove root for kpPath
    each(kpPath, (v, k) => {
        // console.log(k, 'v1', v)
        v = strdelleft(v, 11)
        // console.log(k, 'v2', v)
        kpPath[k] = v
    })
    // console.log('kpPath', kpPath)

    // //remove root for treeItems, treeItemsFolder
    // treeItems = get(treeItems, '0.children')
    // treeItemsFolder = get(treeItemsFolder, '0.children')

    return {
        treeItems,
        treeItemsFolder,
        kpPath,
    }
}


export default filepathToTree
