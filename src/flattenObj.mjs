import get from 'lodash/get'
import map from 'lodash/map'
import join from 'lodash/join'
import size from 'lodash/size'
import isSymbol from 'lodash/isSymbol'
import cloneDeep from 'lodash/cloneDeep'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import isnum from './isnum.mjs'
import cstr from './cstr.mjs'
import treeObj from './treeObj.mjs'
import isobj from './isobj.mjs'
import isarr from './isarr.mjs'


/**
 * 展平物件成為關聯陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/flattenObj.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} obj 輸入項目物件
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [bindKey='id'] 輸入識別用欄位字串，預設'id'
 * @param {String} [bindParent='parentId'] 輸入存放父節點欄位字串，預設'parentId'
 * @param {String} [bindText='text'] 輸入存放值欄位字串，預設'text'
 * @param {String} [bindType='type'] 輸入存放值種類欄位字串，預設'type'
 * @param {String} [bindNumOfChilren='numOfChilren'] 輸入存放值為物件或陣列時所屬子節點數量欄位字串，預設'numOfChilren'
 * @returns {Array} 回傳關聯陣列
 * @example
 *
 * let obj = {
 *     a: 1,
 *     b: 12.3,
 *     c: 'abc',
 *     d: '45-de',
 *     x: true,
 *     y: null,
 *     z: function() {},
 *     e: [],
 *     f: [
 *         91,
 *         912.3,
 *         'abc',
 *         '945-de',
 *         true,
 *         null,
 *         function() {},
 *         [
 *             5,
 *             54.3,
 *             'xyz',
 *         ]
 *     ],
 *     g: {},
 *     h: {
 *         ga: 81,
 *         gb: 812.3,
 *         gc: 'abc',
 *         gd: '845-de',
 *         ge: [
 *             71,
 *             712.3,
 *             'abc',
 *             '745-de',
 *             true,
 *             null,
 *             function() {},
 *         ],
 *         gf: {
 *             gfa: 61,
 *             gfb: 612.3,
 *             gfc: 'abc',
 *             gfd: '645-de',
 *             gfe: true,
 *             gff: null,
 *             gfg: function() {},
 *         },
 *         gx: true,
 *         gy: null,
 *         gz: function() {},
 *     },
 *     i: Symbol('foo'),
 *     [Symbol('i-sym-key-a')]: 'i-sym-value',
 *     [Symbol('i-sym-key-b')]: {
 *         symfa: 61,
 *         symfb: 612.3,
 *         symfc: 'abc',
 *         symfd: '645-de',
 *         symfe: true,
 *         symff: null,
 *         symfg: function() {},
 *     },
 * }
 *
 * let r
 * r = flattenObj(obj)
 * console.log(r)
 * // => [
 * //   { id: 'a', parentId: '', type: 'node', text: 1 },
 * //   { id: 'b', parentId: '', type: 'node', text: 12.3 },
 * //   { id: 'c', parentId: '', type: 'node', text: 'abc' },
 * //   { id: 'd', parentId: '', type: 'node', text: '45-de' },
 * //   { id: 'x', parentId: '', type: 'node', text: true },
 * //   { id: 'y', parentId: '', type: 'node', text: null },
 * //   { id: 'z', parentId: '', type: 'node', text: [Function: z] },
 * //   { id: 'e', parentId: '', type: 'array', numOfChilren: 0 },
 * //   { id: 'f', parentId: '', type: 'array', numOfChilren: 8 },
 * //   { id: 'f-0', parentId: 'f', type: 'node', text: 91 },
 * //   { id: 'f-1', parentId: 'f', type: 'node', text: 912.3 },
 * //   { id: 'f-2', parentId: 'f', type: 'node', text: 'abc' },
 * //   { id: 'f-3', parentId: 'f', type: 'node', text: '945-de' },
 * //   { id: 'f-4', parentId: 'f', type: 'node', text: true },
 * //   { id: 'f-5', parentId: 'f', type: 'node', text: null },
 * //   {
 * //     id: 'f-6',
 * //     parentId: 'f',
 * //     type: 'node',
 * //     text: [Function (anonymous)]
 * //   },
 * //   { id: 'f-7', parentId: 'f', type: 'array', numOfChilren: 3 },
 * //   { id: 'f-7-0', parentId: 'f-7', type: 'node', text: 5 },
 * //   { id: 'f-7-1', parentId: 'f-7', type: 'node', text: 54.3 },
 * //   { id: 'f-7-2', parentId: 'f-7', type: 'node', text: 'xyz' },
 * //   { id: 'g', parentId: '', type: 'object', numOfChilren: 0 },
 * //   { id: 'h', parentId: '', type: 'object', numOfChilren: 9 },
 * //   { id: 'h-ga', parentId: 'h', type: 'node', text: 81 },
 * //   { id: 'h-gb', parentId: 'h', type: 'node', text: 812.3 },
 * //   { id: 'h-gc', parentId: 'h', type: 'node', text: 'abc' },
 * //   { id: 'h-gd', parentId: 'h', type: 'node', text: '845-de' },
 * //   { id: 'h-ge', parentId: 'h', type: 'array', numOfChilren: 7 },
 * //   { id: 'h-ge-0', parentId: 'h-ge', type: 'node', text: 71 },
 * //   { id: 'h-ge-1', parentId: 'h-ge', type: 'node', text: 712.3 },
 * //   { id: 'h-ge-2', parentId: 'h-ge', type: 'node', text: 'abc' },
 * //   { id: 'h-ge-3', parentId: 'h-ge', type: 'node', text: '745-de' },
 * //   { id: 'h-ge-4', parentId: 'h-ge', type: 'node', text: true },
 * //   { id: 'h-ge-5', parentId: 'h-ge', type: 'node', text: null },
 * //   {
 * //     id: 'h-ge-6',
 * //     parentId: 'h-ge',
 * //     type: 'node',
 * //     text: [Function (anonymous)]
 * //   },
 * //   { id: 'h-gf', parentId: 'h', type: 'object', numOfChilren: 7 },
 * //   { id: 'h-gf-gfa', parentId: 'h-gf', type: 'node', text: 61 },
 * //   { id: 'h-gf-gfb', parentId: 'h-gf', type: 'node', text: 612.3 },
 * //   { id: 'h-gf-gfc', parentId: 'h-gf', type: 'node', text: 'abc' },
 * //   { id: 'h-gf-gfd', parentId: 'h-gf', type: 'node', text: '645-de' },
 * //   { id: 'h-gf-gfe', parentId: 'h-gf', type: 'node', text: true },
 * //   { id: 'h-gf-gff', parentId: 'h-gf', type: 'node', text: null },
 * //   {
 * //     id: 'h-gf-gfg',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     text: [Function: gfg]
 * //   },
 * //   { id: 'h-gx', parentId: 'h', type: 'node', text: true },
 * //   { id: 'h-gy', parentId: 'h', type: 'node', text: null },
 * //   { id: 'h-gz', parentId: 'h', type: 'node', text: [Function: gz] },
 * //   { id: 'i', parentId: '', type: 'node', text: Symbol(foo) },
 * //   {
 * //     id: 'Symbol(i-sym-key-a)',
 * //     parentId: '',
 * //     type: 'node',
 * //     text: 'i-sym-value'
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)',
 * //     parentId: '',
 * //     type: 'object',
 * //     numOfChilren: 7
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfa',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: 61
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfb',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: 612.3
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfc',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfd',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: '645-de'
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfe',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: true
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symff',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: null
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfg',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     text: [Function: symfg]
 * //   }
 * // ]
 *
 */
function flattenObj(obj, opt = {}) {

    //check
    if (!iseobj(obj)) {
        return []
    }

    //bindKey
    let bindKey = get(opt, 'bindKey', null)
    if (!isestr(bindKey)) {
        bindKey = 'id'
    }

    //bindParent
    let bindParent = get(opt, 'bindParent', null)
    if (!isestr(bindParent)) {
        bindParent = 'parentId'
    }

    //bindText
    let bindText = get(opt, 'bindText', null)
    if (!isestr(bindText)) {
        bindText = 'text'
    }

    //bindType
    let bindType = get(opt, 'bindType', null)
    if (!isestr(bindType)) {
        bindType = 'type'
    }

    //bindNumOfChilren
    let bindNumOfChilren = get(opt, 'bindNumOfChilren', null)
    if (!isestr(bindNumOfChilren)) {
        bindNumOfChilren = 'numOfChilren'
    }

    function genId(nk, k, i) {
        nk = cloneDeep(nk)
        nk = map(nk, (v) => {
            if (isSymbol(v)) {
                return cstr(v)
            }
            return v
        })
        if (isSymbol(k)) {
            k = cstr(k)
        }
        if (isSymbol(i)) {
            i = cstr(i)
        }
        if (isestr(k) || isnum(k)) {
            nk.push(k)
        }
        let c = join(nk, '-')
        if (isestr(i) || isnum(i)) {
            c = `${i}-${c}`
        }
        return c
    }

    //nodes
    let nodes = []
    treeObj(obj, (value, key, nk) => {
        // console.log('nk:', nk, 'key:', key, 'value:', value)

        //idSelf
        let idSelf = genId(nk, key)

        //idParent
        let idParent = genId(nk, null)

        //type
        let type = 'node'
        if (isobj(value)) {
            type = 'object'
        }
        else if (isarr(value)) {
            type = 'array'
        }

        //node
        let node = {
            [bindKey]: idSelf,
            [bindParent]: idParent,
            [bindType]: type,
        }

        //bindText
        if (!isobj(value) && !isarr(value)) {
            let useValue = value
            node[bindText] = useValue
        }

        //bindNumOfChilren
        if (isobj(value) || isarr(value)) {
            let numOfChilren = size(value)
            node[bindNumOfChilren] = numOfChilren
        }

        //push
        nodes.push(node)

        return value
    }, { force: true })
    // console.log('nodes', nodes)

    return nodes
}


export default flattenObj
