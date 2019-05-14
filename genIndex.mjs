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
    _.pull(ltfs, '_class.mjs', 'index.mjs')

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

    //add polyfill
    //https://github.com/zloirock/core-js
    //core-js integrated with babel and is the base for polyfilling-related babel
    //As a full equal of @babel/polyfill, you can use this:
    //let h = `import '@babel/polyfill'\r\n` //import '@babel/polyfill' is deprecated
    //let h = `import 'core-js/stable'\r\n` + `import 'regenerator-runtime/runtime'\r\n`
    //c = h + c

    //write content
    fs.writeFileSync(fd + fnidx, c, 'utf8')

}
main()
