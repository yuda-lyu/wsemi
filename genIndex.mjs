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
    let ns = _.map(ltfs, function(v) {
        return v.replace('.mjs', '')
    })

    //scs
    let scs = []
    _.each(ns, function(name) {
        let sc = `import ${name} from './${name}.mjs'`
        scs.push(sc)
    })
    if (true) {
        let c = _.join(ns, ', ')
        let sc = `export { ${c} }`
        scs.push(sc)
    }

    //merge content
    let c = _.join(scs, '\r\n')

    //add polyfill, 若為IE11直接於script引入babel-polyfill即可
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
