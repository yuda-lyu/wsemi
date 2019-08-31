import _ from 'lodash'
import fs from 'fs'
import getFiles from '../tool/getFiles.mjs'


let fd_src = './examples/'
let fd_tar = './docs/examples/'


async function main() {
    //把example裡面cdn更換, 再複製到docs的example內, 作為日後發佈為靜態網站

    //cdn
    let cdn = `<script src="https://cdn.jsdelivr.net/npm/wsemi@latest/dist/wsemi.umd.js"></script>`

    //mkdirSync
    if (!fs.existsSync(fd_tar)) {
        fs.mkdirSync(fd_tar)
    }

    //getFiles
    let ltfs = getFiles(fd_src)

    _.each(ltfs, function(v) {

        //fn
        let fn = fd_src + v

        //c
        let c = fs.readFileSync(fn, 'utf8')

        //replace
        let r = `<script src="../dist/wsemi.umd.js"></script>`
        c = c.replace(r, cdn)

        //write
        //console.log(c)
        fs.writeFileSync(fd_tar + v, c, 'utf8')

    })

}
main()
