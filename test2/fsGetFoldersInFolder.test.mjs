import assert from 'assert'
import _ from 'lodash-es'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFoldersInFolder from '../src/fsGetFoldersInFolder.mjs'


describe(`fsGetFoldersInFolder`, function() {

    let test = () => {

        let ms = []

        let t = '_test_fsGetFoldersInFolder'
        let fdt = './_test_fsGetFoldersInFolder'
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

        let r1 = fsGetFoldersInFolder(fdt, 1)
        // console.log('fsGetFoldersInFolder(levelLimit=1)', ftpaths(r1))
        ms.push({ 'fsGetFoldersInFolder(evelLimit=1)': ftpaths(r1) })

        let rall = fsGetFoldersInFolder(fdt, null)
        // console.log('fsGetFoldersInFolder(levelLimit=null)', ftpaths(rall))
        ms.push({ 'fsGetFoldersInFolder(evelLimit=null)': ftpaths(rall) })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', JSON.stringify(ms))
        return ms
    }
    // test()
    // fsGetFoldersInFolder(levelLimit=1) [
    //   { level: 1, path: './abc', name: 'abc' },
    //   { level: 1, path: './def', name: 'def' },
    //   { level: 1, path: './mno', name: 'mno' }
    // ]
    // fsGetFoldersInFolder(levelLimit=null) [
    //   { level: 1, path: './abc', name: 'abc' },
    //   { level: 1, path: './def', name: 'def' },
    //   { level: 2, path: './def/ijk', name: 'ijk' },
    //   { level: 1, path: './mno', name: 'mno' },
    //   { level: 2, path: './mno/pqr', name: 'pqr' }
    // ]
    let ms = [{ 'fsGetFoldersInFolder(evelLimit=1)': [{ 'level': 1, 'path': './abc', 'name': 'abc' }, { 'level': 1, 'path': './def', 'name': 'def' }, { 'level': 1, 'path': './mno', 'name': 'mno' }] }, { 'fsGetFoldersInFolder(evelLimit=null)': [{ 'level': 1, 'path': './abc', 'name': 'abc' }, { 'level': 1, 'path': './def', 'name': 'def' }, { 'level': 2, 'path': './def/ijk', 'name': 'ijk' }, { 'level': 1, 'path': './mno', 'name': 'mno' }, { 'level': 2, 'path': './mno/pqr', 'name': 'pqr' }] }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
