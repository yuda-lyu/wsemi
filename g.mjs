import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsSrlog from './src/fsSrlog.mjs'

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
console.log('c', c)

let t = `[/src/fsSrlog.mjs:140:21]
abcꓹ 123ꓹ 4.56ꓹ {"xyz":["a","bc",true,{"xy":"z"}]}`
console.log('c===t', _.trim(c) === _.trim(t))
//c===t true

fsDeleteFolder(`./syslog`)

//node g.mjs
