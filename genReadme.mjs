import _ from 'lodash'
import fs from 'fs'


let fn_pks = 'package.json'
let fn_rdme = 'README.md'


function getPks(fn) {
    let c = fs.readFileSync(fn, 'utf8')
    return JSON.parse(c)
}


function getReadme(fn) {
    let c = fs.readFileSync(fn, 'utf8')
    return {
        content: c,
        lines: _.split(c, '\r\n')
    }
}

async function main() {

    let pks = getPks(fn_pks)
    //console.log(pks)

    //rdme
    let rdme = getReadme(fn_rdme)

    //rdmever
    let rdmever = ''
    _.each(rdme.lines, function(v) {
        if (v.indexOf('dist/wsemi.umd.js') >= 0) {
            rdmever = v
        }
    })

    //replace
    let c = ''
    if (rdmever !== '') {
        let r = `<script src="https://cdn.jsdelivr.net/npm/wsemi@${pks.version}/dist/wsemi.umd.js"></script>`
        c = rdme.content.replace(rdmever, r)
    }

    //write content
    //console.log(c)
    if (c !== '') {
        fs.writeFileSync(fn_rdme, c, 'utf8')
    }

}
main()
