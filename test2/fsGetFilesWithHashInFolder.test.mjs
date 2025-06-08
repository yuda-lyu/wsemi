import assert from 'assert'
import _ from 'lodash-es'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFilesWithHashInFolder from '../src/fsGetFilesWithHashInFolder.mjs'


describe(`fsGetFilesWithHashInFolder`, function() {

    let test = async () => {

        let ms = []

        let t = '_test_fsGetFilesWithHashInFolder'
        let fdt = './_test_fsGetFilesWithHashInFolder'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let ftpath = (v) => {
            // console.log(v, 'v.path', v.path)
            let ss = _.split(v.path, t)
            // console.log('ss', ss)
            let p = ss[1]
            p = p.replaceAll('\\', '/')
            p = `.${p}`
            // console.log('p', p)
            v.path = p
            return v
        }

        let ftpaths = (vs) => {
            return _.map(_.cloneDeep(vs), ftpath)
        }

        fsWriteText(`${fdt}/z1.txt`, 'z1')
        fsWriteText(`${fdt}/abc/z2.txt`, 'z2')
        fsWriteText(`${fdt}/def/ijk/z3.txt`, 'z3')
        fsCreateFolder(`${fdt}/mno/pqr`)

        let r1 = await fsGetFilesWithHashInFolder(fdt, 1)
        // console.log('fsGetFilesWithHashInFolder(levelLimit=1)', ftpaths(r1))
        ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=1)': ftpaths(r1) })

        let rall = await fsGetFilesWithHashInFolder(fdt, null)
        // console.log('fsGetFilesWithHashInFolder(levelLimit=null)', ftpaths(rall))
        ms.push({ 'fsGetFilesWithHashInFolder(evelLimit=null)': ftpaths(rall) })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', JSON.stringify(ms))
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFilesWithHashInFolder(levelLimit=1) [
    //   {
    //     level: 1,
    //     path: './z1.txt',
    //     name: 'z1.txt',
    //     hashType: 'md5',
    //     hash: '3b770ebe9b04f171f0ead0e07d8e2882'
    //   }
    // ]
    // fsGetFilesWithHashInFolder(levelLimit=null) [
    //   {
    //     level: 2,
    //     path: './abc/z2.txt',
    //     name: 'z2.txt',
    //     hashType: 'md5',
    //     hash: '5cb7e380d019de63c643aef55b8534d0'
    //   },
    //   {
    //     level: 3,
    //     path: './def/ijk/z3.txt',
    //     name: 'z3.txt',
    //     hashType: 'md5',
    //     hash: 'a61d1457beb4684e254ce60379c8ae7b'
    //   },
    //   {
    //     level: 1,
    //     path: './z1.txt',
    //     name: 'z1.txt',
    //     hashType: 'md5',
    //     hash: '3b770ebe9b04f171f0ead0e07d8e2882'
    //   }
    // ]
    let ms = [{ 'fsGetFilesWithHashInFolder(evelLimit=1)': [{ 'level': 1, 'path': './z1.txt', 'name': 'z1.txt', 'hashType': 'md5', 'hash': '3b770ebe9b04f171f0ead0e07d8e2882' }] }, { 'fsGetFilesWithHashInFolder(evelLimit=null)': [{ 'level': 2, 'path': './abc/z2.txt', 'name': 'z2.txt', 'hashType': 'md5', 'hash': '5cb7e380d019de63c643aef55b8534d0' }, { 'level': 3, 'path': './def/ijk/z3.txt', 'name': 'z3.txt', 'hashType': 'md5', 'hash': 'a61d1457beb4684e254ce60379c8ae7b' }, { 'level': 1, 'path': './z1.txt', 'name': 'z1.txt', 'hashType': 'md5', 'hash': '3b770ebe9b04f171f0ead0e07d8e2882' }] }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
