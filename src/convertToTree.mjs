import get from 'lodash/get'
import isestr from './isestr.mjs'
import iseobj from './iseobj.mjs'
import isearr from './isearr.mjs'
import isbol from './isbol.mjs'
import flattenToConn from './flattenToConn.mjs'
import composeToTree from './composeToTree.mjs'


/**
 * 展開物件或陣列成為樹狀陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/convertToTree.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} data 輸入項目物件或陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [bindKey='id'] 輸入識別用欄位字串，預設'id'
 * @param {String} [bindParent='parentId'] 輸入存放父節點欄位字串，預設'parentId'
 * @param {String} [bindText='value'] 輸入存放值欄位字串，預設'value'
 * @param {String} [bindChildren='children'] 輸入產生樹狀物件時，各節點內存放子節點欄位字串，預設'children'
 * @param {String} [bindType='type'] 輸入存放值種類欄位字串，預設'type'
 * @param {String} [bindNumOfChilren='numOfChilren'] 輸入存放值為物件或陣列時所屬子節點數量欄位字串，預設'numOfChilren'
 * @param {String} [bindRoot='root'] 輸入若為物件時，自動給予根節點鍵值字串，預設'root'
 * @param {Boolean} [saveExtProps=false] 輸入是否儲存項目物件從屬資訊布林值，預設false
 * @returns {Array} 回傳樹狀陣列
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
 * r = convertToTree(obj)
 * console.log('convertToTree obj', JSON.stringify(r, null, 2))
 * // => convertToTree obj [
 * //   {
 * //     "id": "root",
 * //     "parentId": "",
 * //     "type": "object",
 * //     "key": "root",
 * //     "numOfChilren": 12,
 * //     "children": [
 * //       {
 * //         "id": "root-a",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "a",
 * //         "text": 1
 * //       },
 * //       {
 * //         "id": "root-b",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "b",
 * //         "text": 12.3
 * //       },
 * //       {
 * //         "id": "root-c",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "c",
 * //         "text": "abc"
 * //       },
 * //       {
 * //         "id": "root-d",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "d",
 * //         "text": "45-de"
 * //       },
 * //       {
 * //         "id": "root-x",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "x",
 * //         "text": true
 * //       },
 * //       {
 * //         "id": "root-y",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "y",
 * //         "text": null
 * //       },
 * //       {
 * //         "id": "root-z",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "z"
 * //       },
 * //       {
 * //         "id": "root-e",
 * //         "parentId": "root",
 * //         "type": "array",
 * //         "key": "e",
 * //         "numOfChilren": 0
 * //       },
 * //       {
 * //         "id": "root-f",
 * //         "parentId": "root",
 * //         "type": "array",
 * //         "key": "f",
 * //         "numOfChilren": 8,
 * //         "children": [
 * //           {
 * //             "id": "root-f-0",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 0,
 * //             "text": 91
 * //           },
 * //           {
 * //             "id": "root-f-1",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 1,
 * //             "text": 912.3
 * //           },
 * //           {
 * //             "id": "root-f-2",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 2,
 * //             "text": "abc"
 * //           },
 * //           {
 * //             "id": "root-f-3",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 3,
 * //             "text": "945-de"
 * //           },
 * //           {
 * //             "id": "root-f-4",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 4,
 * //             "text": true
 * //           },
 * //           {
 * //             "id": "root-f-5",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 5,
 * //             "text": null
 * //           },
 * //           {
 * //             "id": "root-f-6",
 * //             "parentId": "root-f",
 * //             "type": "node",
 * //             "key": 6
 * //           },
 * //           {
 * //             "id": "root-f-7",
 * //             "parentId": "root-f",
 * //             "type": "array",
 * //             "key": 7,
 * //             "numOfChilren": 3,
 * //             "children": [
 * //               {
 * //                 "id": "root-f-7-0",
 * //                 "parentId": "root-f-7",
 * //                 "type": "node",
 * //                 "key": 0,
 * //                 "text": 5
 * //               },
 * //               {
 * //                 "id": "root-f-7-1",
 * //                 "parentId": "root-f-7",
 * //                 "type": "node",
 * //                 "key": 1,
 * //                 "text": 54.3
 * //               },
 * //               {
 * //                 "id": "root-f-7-2",
 * //                 "parentId": "root-f-7",
 * //                 "type": "node",
 * //                 "key": 2,
 * //                 "text": "xyz"
 * //               }
 * //             ]
 * //           }
 * //         ]
 * //       },
 * //       {
 * //         "id": "root-g",
 * //         "parentId": "root",
 * //         "type": "object",
 * //         "key": "g",
 * //         "numOfChilren": 0
 * //       },
 * //       {
 * //         "id": "root-h",
 * //         "parentId": "root",
 * //         "type": "object",
 * //         "key": "h",
 * //         "numOfChilren": 9,
 * //         "children": [
 * //           {
 * //             "id": "root-h-ga",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "ga",
 * //             "text": 81
 * //           },
 * //           {
 * //             "id": "root-h-gb",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "gb",
 * //             "text": 812.3
 * //           },
 * //           {
 * //             "id": "root-h-gc",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "gc",
 * //             "text": "abc"
 * //           },
 * //           {
 * //             "id": "root-h-gd",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "gd",
 * //             "text": "845-de"
 * //           },
 * //           {
 * //             "id": "root-h-ge",
 * //             "parentId": "root-h",
 * //             "type": "array",
 * //             "key": "ge",
 * //             "numOfChilren": 7,
 * //             "children": [
 * //               {
 * //                 "id": "root-h-ge-0",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 0,
 * //                 "text": 71
 * //               },
 * //               {
 * //                 "id": "root-h-ge-1",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 1,
 * //                 "text": 712.3
 * //               },
 * //               {
 * //                 "id": "root-h-ge-2",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 2,
 * //                 "text": "abc"
 * //               },
 * //               {
 * //                 "id": "root-h-ge-3",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 3,
 * //                 "text": "745-de"
 * //               },
 * //               {
 * //                 "id": "root-h-ge-4",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 4,
 * //                 "text": true
 * //               },
 * //               {
 * //                 "id": "root-h-ge-5",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 5,
 * //                 "text": null
 * //               },
 * //               {
 * //                 "id": "root-h-ge-6",
 * //                 "parentId": "root-h-ge",
 * //                 "type": "node",
 * //                 "key": 6
 * //               }
 * //             ]
 * //           },
 * //           {
 * //             "id": "root-h-gf",
 * //             "parentId": "root-h",
 * //             "type": "object",
 * //             "key": "gf",
 * //             "numOfChilren": 7,
 * //             "children": [
 * //               {
 * //                 "id": "root-h-gf-gfa",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gfa",
 * //                 "text": 61
 * //               },
 * //               {
 * //                 "id": "root-h-gf-gfb",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gfb",
 * //                 "text": 612.3
 * //               },
 * //               {
 * //                 "id": "root-h-gf-gfc",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gfc",
 * //                 "text": "abc"
 * //               },
 * //               {
 * //                 "id": "root-h-gf-gfd",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gfd",
 * //                 "text": "645-de"
 * //               },
 * //               {
 * //                 "id": "root-h-gf-gfe",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gfe",
 * //                 "text": true
 * //               },
 * //               {
 * //                 "id": "root-h-gf-gff",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gff",
 * //                 "text": null
 * //               },
 * //               {
 * //                 "id": "root-h-gf-gfg",
 * //                 "parentId": "root-h-gf",
 * //                 "type": "node",
 * //                 "key": "gfg"
 * //               }
 * //             ]
 * //           },
 * //           {
 * //             "id": "root-h-gx",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "gx",
 * //             "text": true
 * //           },
 * //           {
 * //             "id": "root-h-gy",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "gy",
 * //             "text": null
 * //           },
 * //           {
 * //             "id": "root-h-gz",
 * //             "parentId": "root-h",
 * //             "type": "node",
 * //             "key": "gz"
 * //           }
 * //         ]
 * //       },
 * //       {
 * //         "id": "root-i",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "key": "i"
 * //       },
 * //       {
 * //         "id": "root-Symbol(i-sym-key-a)",
 * //         "parentId": "root",
 * //         "type": "node",
 * //         "text": "i-sym-value"
 * //       },
 * //       {
 * //         "id": "root-Symbol(i-sym-key-b)",
 * //         "parentId": "root",
 * //         "type": "object",
 * //         "numOfChilren": 7,
 * //         "children": [
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symfa",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfa",
 * //             "text": 61
 * //           },
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symfb",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfb",
 * //             "text": 612.3
 * //           },
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symfc",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfc",
 * //             "text": "abc"
 * //           },
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symfd",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfd",
 * //             "text": "645-de"
 * //           },
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symfe",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfe",
 * //             "text": true
 * //           },
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symff",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symff",
 * //             "text": null
 * //           },
 * //           {
 * //             "id": "root-Symbol(i-sym-key-b)-symfg",
 * //             "parentId": "root-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfg"
 * //           }
 * //         ]
 * //       }
 * //     ]
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
 * r = convertToTree(arr)
 * console.log('convertToTree arr', JSON.stringify(r, null, 2))
 * // => convertToTree arr [
 * //   {
 * //     "id": "0",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 0,
 * //     "text": 91
 * //   },
 * //   {
 * //     "id": "1",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 1,
 * //     "text": 912.3
 * //   },
 * //   {
 * //     "id": "2",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 2,
 * //     "text": "abc"
 * //   },
 * //   {
 * //     "id": "3",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 3,
 * //     "text": "945-de"
 * //   },
 * //   {
 * //     "id": "4",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 4,
 * //     "text": true
 * //   },
 * //   {
 * //     "id": "5",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 5,
 * //     "text": null
 * //   },
 * //   {
 * //     "id": "6",
 * //     "parentId": "",
 * //     "type": "node",
 * //     "key": 6
 * //   },
 * //   {
 * //     "id": "7",
 * //     "parentId": "",
 * //     "type": "array",
 * //     "key": 7,
 * //     "numOfChilren": 4,
 * //     "children": [
 * //       {
 * //         "id": "7-0",
 * //         "parentId": "7",
 * //         "type": "node",
 * //         "key": 0,
 * //         "text": 5
 * //       },
 * //       {
 * //         "id": "7-1",
 * //         "parentId": "7",
 * //         "type": "node",
 * //         "key": 1,
 * //         "text": 54.3
 * //       },
 * //       {
 * //         "id": "7-2",
 * //         "parentId": "7",
 * //         "type": "node",
 * //         "key": 2,
 * //         "text": "xyz"
 * //       },
 * //       {
 * //         "id": "7-3",
 * //         "parentId": "7",
 * //         "type": "object",
 * //         "key": 3,
 * //         "numOfChilren": 1,
 * //         "children": [
 * //           {
 * //             "id": "7-3-gf",
 * //             "parentId": "7-3",
 * //             "type": "object",
 * //             "key": "gf",
 * //             "numOfChilren": 7,
 * //             "children": [
 * //               {
 * //                 "id": "7-3-gf-gfa",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gfa",
 * //                 "text": 61
 * //               },
 * //               {
 * //                 "id": "7-3-gf-gfb",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gfb",
 * //                 "text": 612.3
 * //               },
 * //               {
 * //                 "id": "7-3-gf-gfc",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gfc",
 * //                 "text": "abc"
 * //               },
 * //               {
 * //                 "id": "7-3-gf-gfd",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gfd",
 * //                 "text": "645-de"
 * //               },
 * //               {
 * //                 "id": "7-3-gf-gfe",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gfe",
 * //                 "text": true
 * //               },
 * //               {
 * //                 "id": "7-3-gf-gff",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gff",
 * //                 "text": null
 * //               },
 * //               {
 * //                 "id": "7-3-gf-gfg",
 * //                 "parentId": "7-3-gf",
 * //                 "type": "node",
 * //                 "key": "gfg"
 * //               }
 * //             ]
 * //           }
 * //         ]
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "id": "8",
 * //     "parentId": "",
 * //     "type": "object",
 * //     "key": 8,
 * //     "numOfChilren": 2,
 * //     "children": [
 * //       {
 * //         "id": "8-h",
 * //         "parentId": "8",
 * //         "type": "object",
 * //         "key": "h",
 * //         "numOfChilren": 8,
 * //         "children": [
 * //           {
 * //             "id": "8-h-ga",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "ga",
 * //             "text": 81
 * //           },
 * //           {
 * //             "id": "8-h-gb",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "gb",
 * //             "text": 812.3
 * //           },
 * //           {
 * //             "id": "8-h-gc",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "gc",
 * //             "text": "abc"
 * //           },
 * //           {
 * //             "id": "8-h-gd",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "gd",
 * //             "text": "845-de"
 * //           },
 * //           {
 * //             "id": "8-h-ge",
 * //             "parentId": "8-h",
 * //             "type": "array",
 * //             "key": "ge",
 * //             "numOfChilren": 7,
 * //             "children": [
 * //               {
 * //                 "id": "8-h-ge-0",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 0,
 * //                 "text": 71
 * //               },
 * //               {
 * //                 "id": "8-h-ge-1",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 1,
 * //                 "text": 712.3
 * //               },
 * //               {
 * //                 "id": "8-h-ge-2",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 2,
 * //                 "text": "abc"
 * //               },
 * //               {
 * //                 "id": "8-h-ge-3",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 3,
 * //                 "text": "745-de"
 * //               },
 * //               {
 * //                 "id": "8-h-ge-4",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 4,
 * //                 "text": true
 * //               },
 * //               {
 * //                 "id": "8-h-ge-5",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 5,
 * //                 "text": null
 * //               },
 * //               {
 * //                 "id": "8-h-ge-6",
 * //                 "parentId": "8-h-ge",
 * //                 "type": "node",
 * //                 "key": 6
 * //               }
 * //             ]
 * //           },
 * //           {
 * //             "id": "8-h-gx",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "gx",
 * //             "text": true
 * //           },
 * //           {
 * //             "id": "8-h-gy",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "gy",
 * //             "text": null
 * //           },
 * //           {
 * //             "id": "8-h-gz",
 * //             "parentId": "8-h",
 * //             "type": "node",
 * //             "key": "gz"
 * //           }
 * //         ]
 * //       },
 * //       {
 * //         "id": "8-i",
 * //         "parentId": "8",
 * //         "type": "node",
 * //         "key": "i"
 * //       },
 * //       {
 * //         "id": "8-Symbol(i-sym-key-a)",
 * //         "parentId": "8",
 * //         "type": "node",
 * //         "text": "i-sym-value"
 * //       },
 * //       {
 * //         "id": "8-Symbol(i-sym-key-b)",
 * //         "parentId": "8",
 * //         "type": "object",
 * //         "numOfChilren": 7,
 * //         "children": [
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symfa",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfa",
 * //             "text": 61
 * //           },
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symfb",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfb",
 * //             "text": 612.3
 * //           },
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symfc",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfc",
 * //             "text": "abc"
 * //           },
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symfd",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfd",
 * //             "text": "645-de"
 * //           },
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symfe",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfe",
 * //             "text": true
 * //           },
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symff",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symff",
 * //             "text": null
 * //           },
 * //           {
 * //             "id": "8-Symbol(i-sym-key-b)-symfg",
 * //             "parentId": "8-Symbol(i-sym-key-b)",
 * //             "type": "node",
 * //             "key": "symfg"
 * //           }
 * //         ]
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 */
function convertToTree(data, opt = {}) {

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

    //bindText
    let bindText = get(opt, 'bindText', null)
    if (!isestr(bindText)) {
        bindText = 'text'
    }

    //bindChildren
    let bindChildren = get(opt, 'bindChildren', null)
    if (!isestr(bindChildren)) {
        bindChildren = 'children'
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

    //bindRoot
    let bindRoot = get(opt, 'bindRoot', null)
    if (!isestr(bindRoot)) {
        bindRoot = 'root'
    }

    //saveExtProps
    let saveExtProps = get(opt, 'saveExtProps', null)
    if (!isbol(saveExtProps)) {
        saveExtProps = false
    }

    //root
    if (iseobj(data)) {
        data = {
            [bindRoot]: data,
        }
    }

    //flattenToConn
    let arrObj = flattenToConn(data, {
        bindKey,
        bindParent,
        bindText,
        bindType,
        bindNumOfChilren,
    })
    // console.log('arrObj', arrObj)

    //composeToTree
    let nodes = composeToTree(arrObj, {
        bindKey,
        bindParent,
        bindChildren,
        saveExtProps,
    })
    // console.log('nodes', nodes)

    return nodes
}


export default convertToTree
