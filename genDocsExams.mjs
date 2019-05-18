import _ from 'lodash'
import fs from 'fs'


let fn_rdme = 'README.md'
let fd_src = './examples/'
let fd_tar = './docs/examples/'


function getWSemiCDN(fn) {
    let c = fs.readFileSync(fn, 'utf8')
    let s = _.split(c, '\r\n')
    let r = _.find(s, function(v) {
        return v.indexOf('wsemi.umd.js') >= 0
    })
    return r
}


async function getFiles(fd) {
    let fsp = fs.promises
    let ltfs = await fsp.readdir(fd)
    return ltfs
}


async function main() {

    //cdn
    let cdn = getWSemiCDN(fn_rdme)

    //mkdirSync
    fs.mkdirSync(fd_tar)

    //getFiles
    let ltfs = await getFiles(fd_src)

    _.each(ltfs, function(v) {

        //fn
        let fn = fd_src + v

        //c
        let c = fs.readFileSync(fn, 'utf8')

        //replace
        let r = `<script src="../dist/wsemi.umd.js"></script>`
        c = c.replace(r, cdn)

        //write content
        //console.log(c)
        fs.writeFileSync(fd_tar + v, c, 'utf8')

    })

}
main()
