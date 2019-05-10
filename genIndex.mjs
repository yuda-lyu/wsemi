import _ from 'lodash'
import fs from 'fs'


let fd = './src/'
let fnidx = 'index.mjs'


async function getFiles() {
    let fsp = fs.promises
    let ltfs = await fsp.readdir(fd)
    return ltfs
}


async function main() {

    //getFiles
    let ltfs = await getFiles()

    //pull
    _.pull(ltfs, 'index.mjs')

    //get names
    let scs = []
    _.each(ltfs, function(v) {

        //name
        let name = v.replace('.mjs', '')

        //sc
        let sc = `export ${name} from './${name}.mjs'`

        //push
        scs.push(sc)

    })

    //merge content
    let c = _.join(scs, '\r\n')

    //add jsdoc class
    let h = `
/**
 * @class wsemi
 */
 `
    c = h + '\r\n' + c

    //write content
    fs.writeFileSync(fd + fnidx, c, 'utf8')

}
main()
