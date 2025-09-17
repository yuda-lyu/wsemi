import assert from 'assert'
import _ from 'lodash-es'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsTreeFolderWithHash from '../src/fsTreeFolderWithHash.mjs'


describe(`fsTreeFolderWithHash`, function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsTreeFolderWithHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fp

        fp = `${fdt}/t0.txt`
        fsWriteText(fp, 't0')

        fp = `${fdt}/abc/t1.txt`
        fsWriteText(fp, 'abc-t1')

        fp = `${fdt}/def/xyz/t2.txt`
        fsWriteText(fp, 'def-xyz-t2')

        let clns = (vfps) => {
            vfps = _.map(vfps, (v) => {
                delete v.path
                return v
            })
            return vfps
        }

        let vfps1 = await fsTreeFolderWithHash(fdt)
        vfps1 = clns(vfps1)
        // console.log('fsTreeFolderWithHash(1,file,md5)', vfps1)
        ms.push({ 'fsTreeFolderWithHash(1,file,md5)': vfps1 })

        let vfps2 = await fsTreeFolderWithHash(fdt, null)
        vfps2 = clns(vfps2)
        // console.log('fsTreeFolderWithHash(null,file,md5)', vfps2)
        ms.push({ 'fsTreeFolderWithHash(null,file,md5)': vfps2 })

        let vfps3 = await fsTreeFolderWithHash(fdt, 1, { type: 'sha256' })
        vfps3 = clns(vfps3)
        // console.log('fsTreeFolderWithHash(1,file,sha256)', vfps3)
        ms.push({ 'fsTreeFolderWithHash(1,file,sha256)': vfps3 })

        let vfps4 = await fsTreeFolderWithHash(fdt, null, { forFile: true, forFolder: true })
        vfps4 = clns(vfps4)
        // console.log('fsTreeFolderWithHash(null,file+folder,md5)', vfps4)
        ms.push({ 'fsTreeFolderWithHash(null,file+folder,md5)': vfps4 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', JSON.stringify(ms, null, 2))
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsTreeFolderWithHash(1,file,md5) [
    //   { isFolder: true, level: 1, name: 'abc', hash: '' },
    //   { isFolder: true, level: 1, name: 'def', hash: '' },
    //   {
    //     isFolder: false,
    //     level: 1,
    //     name: 't0.txt',
    //     hash: '809d4580aaed41565abc38d58f77f840'
    //   }
    // ]
    // fsTreeFolderWithHash(null,file,md5) [
    //   { isFolder: true, level: 1, name: 'abc', hash: '' },
    //   {
    //     isFolder: false,
    //     level: 2,
    //     name: 't1.txt',
    //     hash: '45d11ad27b97bc3bb664260189ec0dcc'
    //   },
    //   { isFolder: true, level: 1, name: 'def', hash: '' },
    //   { isFolder: true, level: 2, name: 'xyz', hash: '' },
    //   {
    //     isFolder: false,
    //     level: 3,
    //     name: 't2.txt',
    //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
    //   },
    //   {
    //     isFolder: false,
    //     level: 1,
    //     name: 't0.txt',
    //     hash: '809d4580aaed41565abc38d58f77f840'
    //   }
    // ]
    // fsTreeFolderWithHash(1,file,sha256) [
    //   { isFolder: true, level: 1, name: 'abc', hash: '' },
    //   { isFolder: true, level: 1, name: 'def', hash: '' },
    //   {
    //     isFolder: false,
    //     level: 1,
    //     name: 't0.txt',
    //     hash: '512f26ada3c3d634ac3c6b12b7b33cb50bb0963c3f6d9924241619c84ec78ff2'
    //   }
    // ]
    // fsTreeFolderWithHash(null,file+folder,md5) [
    //   {
    //     isFolder: true,
    //     level: 1,
    //     name: 'abc',
    //     hash: '45d11ad27b97bc3bb664260189ec0dcc'
    //   },
    //   {
    //     isFolder: false,
    //     level: 2,
    //     name: 't1.txt',
    //     hash: '45d11ad27b97bc3bb664260189ec0dcc'
    //   },
    //   {
    //     isFolder: true,
    //     level: 1,
    //     name: 'def',
    //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
    //   },
    //   {
    //     isFolder: true,
    //     level: 2,
    //     name: 'xyz',
    //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
    //   },
    //   {
    //     isFolder: false,
    //     level: 3,
    //     name: 't2.txt',
    //     hash: 'ac8cf7366d7adf0743d6561133d404b3'
    //   },
    //   {
    //     isFolder: false,
    //     level: 1,
    //     name: 't0.txt',
    //     hash: '809d4580aaed41565abc38d58f77f840'
    //   }
    // ]
    // ms [
    //   {
    //     "fsTreeFolderWithHash(1,file,md5)": [
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "abc",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "def",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 1,
    //         "name": "t0.txt",
    //         "hash": "809d4580aaed41565abc38d58f77f840"
    //       }
    //     ]
    //   },
    //   {
    //     "fsTreeFolderWithHash(null,file,md5)": [
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "abc",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 2,
    //         "name": "t1.txt",
    //         "hash": "45d11ad27b97bc3bb664260189ec0dcc"
    //       },
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "def",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": true,
    //         "level": 2,
    //         "name": "xyz",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 3,
    //         "name": "t2.txt",
    //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 1,
    //         "name": "t0.txt",
    //         "hash": "809d4580aaed41565abc38d58f77f840"
    //       }
    //     ]
    //   },
    //   {
    //     "fsTreeFolderWithHash(1,file,sha256)": [
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "abc",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "def",
    //         "hash": ""
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 1,
    //         "name": "t0.txt",
    //         "hash": "512f26ada3c3d634ac3c6b12b7b33cb50bb0963c3f6d9924241619c84ec78ff2"
    //       }
    //     ]
    //   },
    //   {
    //     "fsTreeFolderWithHash(null,file+folder,md5)": [
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "abc",
    //         "hash": "45d11ad27b97bc3bb664260189ec0dcc"
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 2,
    //         "name": "t1.txt",
    //         "hash": "45d11ad27b97bc3bb664260189ec0dcc"
    //       },
    //       {
    //         "isFolder": true,
    //         "level": 1,
    //         "name": "def",
    //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
    //       },
    //       {
    //         "isFolder": true,
    //         "level": 2,
    //         "name": "xyz",
    //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 3,
    //         "name": "t2.txt",
    //         "hash": "ac8cf7366d7adf0743d6561133d404b3"
    //       },
    //       {
    //         "isFolder": false,
    //         "level": 1,
    //         "name": "t0.txt",
    //         "hash": "809d4580aaed41565abc38d58f77f840"
    //       }
    //     ]
    //   }
    // ]
    let ms = [
        {
            'fsTreeFolderWithHash(1,file,md5)': [
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'abc',
                    'hash': ''
                },
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'def',
                    'hash': ''
                },
                {
                    'isFolder': false,
                    'level': 1,
                    'name': 't0.txt',
                    'hash': '809d4580aaed41565abc38d58f77f840'
                }
            ]
        },
        {
            'fsTreeFolderWithHash(null,file,md5)': [
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'abc',
                    'hash': ''
                },
                {
                    'isFolder': false,
                    'level': 2,
                    'name': 't1.txt',
                    'hash': '45d11ad27b97bc3bb664260189ec0dcc'
                },
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'def',
                    'hash': ''
                },
                {
                    'isFolder': true,
                    'level': 2,
                    'name': 'xyz',
                    'hash': ''
                },
                {
                    'isFolder': false,
                    'level': 3,
                    'name': 't2.txt',
                    'hash': 'ac8cf7366d7adf0743d6561133d404b3'
                },
                {
                    'isFolder': false,
                    'level': 1,
                    'name': 't0.txt',
                    'hash': '809d4580aaed41565abc38d58f77f840'
                }
            ]
        },
        {
            'fsTreeFolderWithHash(1,file,sha256)': [
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'abc',
                    'hash': ''
                },
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'def',
                    'hash': ''
                },
                {
                    'isFolder': false,
                    'level': 1,
                    'name': 't0.txt',
                    'hash': '512f26ada3c3d634ac3c6b12b7b33cb50bb0963c3f6d9924241619c84ec78ff2'
                }
            ]
        },
        {
            'fsTreeFolderWithHash(null,file+folder,md5)': [
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'abc',
                    'hash': '45d11ad27b97bc3bb664260189ec0dcc'
                },
                {
                    'isFolder': false,
                    'level': 2,
                    'name': 't1.txt',
                    'hash': '45d11ad27b97bc3bb664260189ec0dcc'
                },
                {
                    'isFolder': true,
                    'level': 1,
                    'name': 'def',
                    'hash': 'ac8cf7366d7adf0743d6561133d404b3'
                },
                {
                    'isFolder': true,
                    'level': 2,
                    'name': 'xyz',
                    'hash': 'ac8cf7366d7adf0743d6561133d404b3'
                },
                {
                    'isFolder': false,
                    'level': 3,
                    'name': 't2.txt',
                    'hash': 'ac8cf7366d7adf0743d6561133d404b3'
                },
                {
                    'isFolder': false,
                    'level': 1,
                    'name': 't0.txt',
                    'hash': '809d4580aaed41565abc38d58f77f840'
                }
            ]
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
