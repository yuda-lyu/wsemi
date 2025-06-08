import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'


describe(`fsIsFolder`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsIsFolder'

        let b1 = fsIsFolder(fdt)
        // console.log('fsIsFolder(before)', b1)
        ms.push({ 'fsIsFolder(before)': b1 })

        fsCreateFolder(fdt)

        let b2 = fsIsFolder(fdt)
        // console.log('fsIsFolder(after)', b2)
        ms.push({ 'fsIsFolder(after)': b2 })

        fsDeleteFolder(fdt)

        // console.log('ms', ms)

        return ms
    }
    // test()
    // fsIsFolder(before) false
    // fsIsFolder(after) true
    let ms = [{ 'fsIsFolder(before)': false }, { 'fsIsFolder(after)': true }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
