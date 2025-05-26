import fs from 'fs'
import assert from 'assert'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsSrlog from '../src/fsSrlog.mjs'


describe(`fsSrlog`, function() {

    let test = () => {

        let gneFp = () => {
            let cdday = ot().format('YYYY-MM-DD')
            let fp = `./syslog/${cdday}.log`
            return fp
        }
        let fp = gneFp()

        fsDeleteFile(fp)

        let opt = {
            useTime: false,
        }
        let srlog = fsSrlog(opt)
        srlog('abc', 123, 4.56, { xyz: ['a', 'bc', true, { xy: 'z' }] })

        let c = fs.readFileSync(fp, 'utf8')
        // console.log('c', c)

        fsDeleteFolder(`./syslog`)

        return _.trim(c)
    }

    let t = `[/test/fsSrlog.test.mjs:27:9]
abcꓹ 123ꓹ 4.56ꓹ {"xyz":["a","bc",true,{"xy":"z"}]}`
    t = _.trim(t)

    it(`should return '${t}' when run test`, async function() {
        let r = test()
        let rr = t
        assert.strict.deepStrictEqual(r, rr)
    })

})
