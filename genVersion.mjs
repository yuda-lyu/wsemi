import _ from 'lodash'
import fs from 'fs'


let fn_pks = 'package.json'


function getPks(fn) {
    let c = fs.readFileSync(fn, 'utf8')
    return JSON.parse(c)
}


function setPks(fn, c) {
    fs.writeFileSync(fn, c, 'utf8')
}


async function main() {

    //read
    let pks = getPks(fn_pks)
    //console.log(pks)

    //v
    let v = pks.version
    let s = _.split(v, '.')
    s[2] = _.toString(_.toNumber(s[2]) + 1)
    pks.version = _.join(s, '.')

    //save
    console.log('now version: ' + pks.version)
    setPks(fn_pks, JSON.stringify(pks, null, 2))

}
main()
