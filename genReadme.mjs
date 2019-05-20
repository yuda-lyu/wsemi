import _ from 'lodash'
import fs from 'fs'


let fn_rdme = 'README.md'


function getReadme() {
    let c = fs.readFileSync(fn_rdme, 'utf8')
    return {
        content: c,
        lines: _.split(c, '\r\n')
    }
}


async function main() {
    //由package.json取得版本, 再更換readme內cdn版本

    //pkg
    let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    //rdme
    let rdme = getReadme()

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
        let r = `<script src="https://cdn.jsdelivr.net/npm/wsemi@${pkg.version}/dist/wsemi.umd.js"></script>`
        c = rdme.content.replace(rdmever, r)
    }

    //write
    //console.log(c)
    fs.writeFileSync(fn_rdme, c, 'utf8')

}
main()
