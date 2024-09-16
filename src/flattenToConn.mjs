import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import join from 'lodash-es/join.js'
import size from 'lodash-es/size.js'
import keys from 'lodash-es/keys.js'
import isNumber from 'lodash-es/isNumber.js'
import isSymbol from 'lodash-es/isSymbol.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import isearr from './isearr.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import cstr from './cstr.mjs'
import treeObj from './treeObj.mjs'


/**
 * 展平物件或陣列成為關聯陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/flattenToConn.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} data 輸入項目物件或陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [bindKey='id'] 輸入識別用欄位字串，預設'id'
 * @param {String} [bindParent='parentId'] 輸入存放父節點識別用欄位字串，預設'parentId'
 * @param {String} [bindBelong='key'] 輸入當父節點為物件或陣列時，存放自身所屬鍵值字串，預設'key'
 * @param {String} [bindText='text'] 輸入存放值欄位字串，預設'text'
 * @param {String} [bindType='type'] 輸入存放值種類欄位字串，預設'type'
 * @param {String} [bindNumOfChilren='numOfChilren'] 輸入存放值為物件或陣列時所屬子節點數量欄位字串，預設'numOfChilren'
 * @returns {Array} 回傳關聯陣列
 * @example
 *
 * let r
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
 * r = flattenToConn(obj)
 * console.log('flattenToConn obj', r)
 * // => flattenToConn obj [
 * //   { id: 'a', parentId: '', type: 'node', key: 'a', text: 1 },
 * //   { id: 'b', parentId: '', type: 'node', key: 'b', text: 12.3 },
 * //   { id: 'c', parentId: '', type: 'node', key: 'c', text: 'abc' },
 * //   { id: 'd', parentId: '', type: 'node', key: 'd', text: '45-de' },
 * //   { id: 'x', parentId: '', type: 'node', key: 'x', text: true },
 * //   { id: 'y', parentId: '', type: 'node', key: 'y', text: null },
 * //   {
 * //     id: 'z',
 * //     parentId: '',
 * //     type: 'node',
 * //     key: 'z',
 * //     text: [Function: z]
 * //   },
 * //   { id: 'e', parentId: '', type: 'array', key: 'e', numOfChilren: 0 },
 * //   { id: 'f', parentId: '', type: 'array', key: 'f', numOfChilren: 8 },
 * //   { id: 'f-0', parentId: 'f', type: 'node', key: 0, text: 91 },
 * //   { id: 'f-1', parentId: 'f', type: 'node', key: 1, text: 912.3 },
 * //   { id: 'f-2', parentId: 'f', type: 'node', key: 2, text: 'abc' },
 * //   { id: 'f-3', parentId: 'f', type: 'node', key: 3, text: '945-de' },
 * //   { id: 'f-4', parentId: 'f', type: 'node', key: 4, text: true },
 * //   { id: 'f-5', parentId: 'f', type: 'node', key: 5, text: null },
 * //   {
 * //     id: 'f-6',
 * //     parentId: 'f',
 * //     type: 'node',
 * //     key: 6,
 * //     text: [Function (anonymous)]
 * //   },
 * //   { id: 'f-7', parentId: 'f', type: 'array', key: 7, numOfChilren: 3 },
 * //   { id: 'f-7-0', parentId: 'f-7', type: 'node', key: 0, text: 5 },
 * //   { id: 'f-7-1', parentId: 'f-7', type: 'node', key: 1, text: 54.3 },
 * //   { id: 'f-7-2', parentId: 'f-7', type: 'node', key: 2, text: 'xyz' },
 * //   { id: 'g', parentId: '', type: 'object', key: 'g', numOfChilren: 0 },
 * //   { id: 'h', parentId: '', type: 'object', key: 'h', numOfChilren: 9 },
 * //   { id: 'h-ga', parentId: 'h', type: 'node', key: 'ga', text: 81 },
 * //   { id: 'h-gb', parentId: 'h', type: 'node', key: 'gb', text: 812.3 },
 * //   { id: 'h-gc', parentId: 'h', type: 'node', key: 'gc', text: 'abc' },
 * //   {
 * //     id: 'h-gd',
 * //     parentId: 'h',
 * //     type: 'node',
 * //     key: 'gd',
 * //     text: '845-de'
 * //   },
 * //   {
 * //     id: 'h-ge',
 * //     parentId: 'h',
 * //     type: 'array',
 * //     key: 'ge',
 * //     numOfChilren: 7
 * //   },
 * //   { id: 'h-ge-0', parentId: 'h-ge', type: 'node', key: 0, text: 71 },
 * //   { id: 'h-ge-1', parentId: 'h-ge', type: 'node', key: 1, text: 712.3 },
 * //   { id: 'h-ge-2', parentId: 'h-ge', type: 'node', key: 2, text: 'abc' },
 * //   {
 * //     id: 'h-ge-3',
 * //     parentId: 'h-ge',
 * //     type: 'node',
 * //     key: 3,
 * //     text: '745-de'
 * //   },
 * //   { id: 'h-ge-4', parentId: 'h-ge', type: 'node', key: 4, text: true },
 * //   { id: 'h-ge-5', parentId: 'h-ge', type: 'node', key: 5, text: null },
 * //   {
 * //     id: 'h-ge-6',
 * //     parentId: 'h-ge',
 * //     type: 'node',
 * //     key: 6,
 * //     text: [Function (anonymous)]
 * //   },
 * //   {
 * //     id: 'h-gf',
 * //     parentId: 'h',
 * //     type: 'object',
 * //     key: 'gf',
 * //     numOfChilren: 7
 * //   },
 * //   {
 * //     id: 'h-gf-gfa',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gfa',
 * //     text: 61
 * //   },
 * //   {
 * //     id: 'h-gf-gfb',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gfb',
 * //     text: 612.3
 * //   },
 * //   {
 * //     id: 'h-gf-gfc',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gfc',
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: 'h-gf-gfd',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gfd',
 * //     text: '645-de'
 * //   },
 * //   {
 * //     id: 'h-gf-gfe',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gfe',
 * //     text: true
 * //   },
 * //   {
 * //     id: 'h-gf-gff',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gff',
 * //     text: null
 * //   },
 * //   {
 * //     id: 'h-gf-gfg',
 * //     parentId: 'h-gf',
 * //     type: 'node',
 * //     key: 'gfg',
 * //     text: [Function: gfg]
 * //   },
 * //   { id: 'h-gx', parentId: 'h', type: 'node', key: 'gx', text: true },
 * //   { id: 'h-gy', parentId: 'h', type: 'node', key: 'gy', text: null },
 * //   {
 * //     id: 'h-gz',
 * //     parentId: 'h',
 * //     type: 'node',
 * //     key: 'gz',
 * //     text: [Function: gz]
 * //   },
 * //   { id: 'i', parentId: '', type: 'node', key: 'i', text: Symbol(foo) },
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
 * //     key: 'symfa',
 * //     text: 61
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfb',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfb',
 * //     text: 612.3
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfc',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfc',
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfd',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfd',
 * //     text: '645-de'
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfe',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfe',
 * //     text: true
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symff',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symff',
 * //     text: null
 * //   },
 * //   {
 * //     id: 'Symbol(i-sym-key-b)-symfg',
 * //     parentId: 'Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfg',
 * //     text: [Function: symfg]
 * //   }
 * // ]
 *
 * let arr = [
 *     91,
 *     912.3,
 *     'abc',
 *     '945-de',
 *     true,
 *     null,
 *     function() {},
 *     [
 *         5,
 *         54.3,
 *         'xyz',
 *         {
 *             gf: {
 *                 gfa: 61,
 *                 gfb: 612.3,
 *                 gfc: 'abc',
 *                 gfd: '645-de',
 *                 gfe: true,
 *                 gff: null,
 *                 gfg: function() {},
 *             },
 *         },
 *     ],
 *     {
 *         h: {
 *             ga: 81,
 *             gb: 812.3,
 *             gc: 'abc',
 *             gd: '845-de',
 *             ge: [
 *                 71,
 *                 712.3,
 *                 'abc',
 *                 '745-de',
 *                 true,
 *                 null,
 *                 function() {},
 *             ],
 *             gx: true,
 *             gy: null,
 *             gz: function() {},
 *         },
 *         i: Symbol('foo'),
 *         [Symbol('i-sym-key-a')]: 'i-sym-value',
 *         [Symbol('i-sym-key-b')]: {
 *             symfa: 61,
 *             symfb: 612.3,
 *             symfc: 'abc',
 *             symfd: '645-de',
 *             symfe: true,
 *             symff: null,
 *             symfg: function() {},
 *         },
 *     },
 * ]
 * r = flattenToConn(arr)
 * console.log('flattenToConn arr', r)
 * // => flattenToConn arr [
 * //   { id: '0', parentId: '', type: 'node', key: 0, text: 91 },
 * //   { id: '1', parentId: '', type: 'node', key: 1, text: 912.3 },
 * //   { id: '2', parentId: '', type: 'node', key: 2, text: 'abc' },
 * //   { id: '3', parentId: '', type: 'node', key: 3, text: '945-de' },
 * //   { id: '4', parentId: '', type: 'node', key: 4, text: true },
 * //   { id: '5', parentId: '', type: 'node', key: 5, text: null },
 * //   {
 * //     id: '6',
 * //     parentId: '',
 * //     type: 'node',
 * //     key: 6,
 * //     text: [Function (anonymous)]
 * //   },
 * //   { id: '7', parentId: '', type: 'array', key: 7, numOfChilren: 4 },
 * //   { id: '7-0', parentId: '7', type: 'node', key: 0, text: 5 },
 * //   { id: '7-1', parentId: '7', type: 'node', key: 1, text: 54.3 },
 * //   { id: '7-2', parentId: '7', type: 'node', key: 2, text: 'xyz' },
 * //   { id: '7-3', parentId: '7', type: 'object', key: 3, numOfChilren: 1 },
 * //   {
 * //     id: '7-3-gf',
 * //     parentId: '7-3',
 * //     type: 'object',
 * //     key: 'gf',
 * //     numOfChilren: 7
 * //   },
 * //   {
 * //     id: '7-3-gf-gfa',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gfa',
 * //     text: 61
 * //   },
 * //   {
 * //     id: '7-3-gf-gfb',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gfb',
 * //     text: 612.3
 * //   },
 * //   {
 * //     id: '7-3-gf-gfc',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gfc',
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: '7-3-gf-gfd',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gfd',
 * //     text: '645-de'
 * //   },
 * //   {
 * //     id: '7-3-gf-gfe',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gfe',
 * //     text: true
 * //   },
 * //   {
 * //     id: '7-3-gf-gff',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gff',
 * //     text: null
 * //   },
 * //   {
 * //     id: '7-3-gf-gfg',
 * //     parentId: '7-3-gf',
 * //     type: 'node',
 * //     key: 'gfg',
 * //     text: [Function: gfg]
 * //   },
 * //   { id: '8', parentId: '', type: 'object', key: 8, numOfChilren: 2 },
 * //   {
 * //     id: '8-h',
 * //     parentId: '8',
 * //     type: 'object',
 * //     key: 'h',
 * //     numOfChilren: 8
 * //   },
 * //   { id: '8-h-ga', parentId: '8-h', type: 'node', key: 'ga', text: 81 },
 * //   {
 * //     id: '8-h-gb',
 * //     parentId: '8-h',
 * //     type: 'node',
 * //     key: 'gb',
 * //     text: 812.3
 * //   },
 * //   {
 * //     id: '8-h-gc',
 * //     parentId: '8-h',
 * //     type: 'node',
 * //     key: 'gc',
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: '8-h-gd',
 * //     parentId: '8-h',
 * //     type: 'node',
 * //     key: 'gd',
 * //     text: '845-de'
 * //   },
 * //   {
 * //     id: '8-h-ge',
 * //     parentId: '8-h',
 * //     type: 'array',
 * //     key: 'ge',
 * //     numOfChilren: 7
 * //   },
 * //   {
 * //     id: '8-h-ge-0',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 0,
 * //     text: 71
 * //   },
 * //   {
 * //     id: '8-h-ge-1',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 1,
 * //     text: 712.3
 * //   },
 * //   {
 * //     id: '8-h-ge-2',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 2,
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: '8-h-ge-3',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 3,
 * //     text: '745-de'
 * //   },
 * //   {
 * //     id: '8-h-ge-4',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 4,
 * //     text: true
 * //   },
 * //   {
 * //     id: '8-h-ge-5',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 5,
 * //     text: null
 * //   },
 * //   {
 * //     id: '8-h-ge-6',
 * //     parentId: '8-h-ge',
 * //     type: 'node',
 * //     key: 6,
 * //     text: [Function (anonymous)]
 * //   },
 * //   {
 * //     id: '8-h-gx',
 * //     parentId: '8-h',
 * //     type: 'node',
 * //     key: 'gx',
 * //     text: true
 * //   },
 * //   {
 * //     id: '8-h-gy',
 * //     parentId: '8-h',
 * //     type: 'node',
 * //     key: 'gy',
 * //     text: null
 * //   },
 * //   {
 * //     id: '8-h-gz',
 * //     parentId: '8-h',
 * //     type: 'node',
 * //     key: 'gz',
 * //     text: [Function: gz]
 * //   },
 * //   {
 * //     id: '8-i',
 * //     parentId: '8',
 * //     type: 'node',
 * //     key: 'i',
 * //     text: Symbol(foo)
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-a)',
 * //     parentId: '8',
 * //     type: 'node',
 * //     text: 'i-sym-value'
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)',
 * //     parentId: '8',
 * //     type: 'object',
 * //     numOfChilren: 7
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symfa',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfa',
 * //     text: 61
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symfb',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfb',
 * //     text: 612.3
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symfc',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfc',
 * //     text: 'abc'
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symfd',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfd',
 * //     text: '645-de'
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symfe',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfe',
 * //     text: true
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symff',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symff',
 * //     text: null
 * //   },
 * //   {
 * //     id: '8-Symbol(i-sym-key-b)-symfg',
 * //     parentId: '8-Symbol(i-sym-key-b)',
 * //     type: 'node',
 * //     key: 'symfg',
 * //     text: [Function: symfg]
 * //   }
 * // ]
 *
 */
function flattenToConn(data, opt = {}) {

    //check
    if (!iseobj(data) && !isearr(data)) {
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

    //bindBelong
    let bindBelong = get(opt, 'bindBelong', null)
    if (!isestr(bindBelong)) {
        bindBelong = 'key'
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

    function genId(nk, k) {
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
        // if (isSymbol(i)) {
        //     i = cstr(i)
        // }
        if (isestr(k) || isnum(k)) {
            nk.push(k)
        }
        let c = join(nk, '-')
        // if (isestr(i) || isnum(i)) {
        //     c = `${i}-${c}`
        // }
        return c
    }

    //nodes
    let nodes = []
    treeObj(data, (value, key, nk) => {
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

        //bindBelong
        if (isestr(key) || isNumber(key)) {
            node[bindBelong] = key
        }

        //bindText
        if (!isobj(value) && !isarr(value)) {
            node[bindText] = value
        }

        //bindNumOfChilren
        if (isobj(value) || isarr(value)) {
            let numOfChilren = null
            if (isobj(value)) {
                numOfChilren = size(keys(value))
            }
            else if (isarr(value)) {
                numOfChilren = size(value)
            }
            node[bindNumOfChilren] = numOfChilren
        }

        //push
        nodes.push(node)

        return value
    }, { force: true })
    // console.log('nodes', nodes)

    return nodes
}


export default flattenToConn
