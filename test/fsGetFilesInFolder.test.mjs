import assert from 'assert'
import _ from 'lodash-es'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFilesInFolder from '../src/fsGetFilesInFolder.mjs'


describe(`fsGetFilesInFolder`, function() {

    let test = () => {

        let ms = []

        let t = '_test_fsGetFilesInFolder'
        let fdt = './_test_fsGetFilesInFolder'
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

        let r1 = fsGetFilesInFolder(fdt, 1)
        // console.log('fsGetFilesInFolder(levelLimit=1)', ftpaths(r1))
        ms.push({ 'fsGetFilesInFolder(evelLimit=1)': ftpaths(r1) })

        let rall = fsGetFilesInFolder(fdt, null)
        // console.log('fsGetFilesInFolder(levelLimit=null)', ftpaths(rall))
        ms.push({ 'fsGetFilesInFolder(evelLimit=null)': ftpaths(rall) })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', JSON.stringify(ms))
        return ms
    }
    // test()
    // fsGetFilesInFolder(levelLimit=1) [ { level: 1, path: './z1.txt', name: 'z1.txt' } ]
    // fsGetFilesInFolder(levelLimit=null) [
    //   { level: 2, path: './abc/z2.txt', name: 'z2.txt' },
    //   { level: 3, path: './def/ijk/z3.txt', name: 'z3.txt' },
    //   { level: 1, path: './z1.txt', name: 'z1.txt' }
    // ]
    let ms = [{ 'fsGetFilesInFolder(evelLimit=1)': [{ 'level': 1, 'path': './z1.txt', 'name': 'z1.txt' }] }, { 'fsGetFilesInFolder(evelLimit=null)': [{ 'level': 2, 'path': './abc/z2.txt', 'name': 'z2.txt' }, { 'level': 3, 'path': './def/ijk/z3.txt', 'name': 'z3.txt' }, { 'level': 1, 'path': './z1.txt', 'name': 'z1.txt' }] }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
