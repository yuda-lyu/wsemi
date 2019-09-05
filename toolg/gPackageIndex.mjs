import fs from 'fs'
import _ from 'lodash'
import getFiles from 'w-package-tools/src/getFiles.mjs'


let fd = './src/'
let fnIndex = 'index.mjs'


async function main() {
    //由src內取得指定函數檔案, 再自動產生index.mjs, 供rollup編譯之用

    //getFiles
    let ltfs = getFiles(fd)

    //pull
    _.pull(ltfs, '_class.mjs', '_jsonType.mjs', 'index.mjs')

    //get names
    let ns = _.map(ltfs, function(v) {
        return v.replace('.mjs', '')
    })

    //scs
    let scs = []
    _.each(ns, function(name) {
        //let sc = `import ${name} from './${name}.mjs'`
        let sc = `export ${name} from './${name}.mjs'`
        scs.push(sc)
    })
    // if (true) {
    //     let c = _.join(ns, ', ')
    //     let sc = `export { ${c} }`
    //     scs.push(sc)
    // }

    //merge content
    let c = _.join(scs, '\r\n')

    //add polyfill, 若為IE11直接於script引入babel-polyfill即可
    //https://github.com/zloirock/core-js
    //core-js integrated with babel and is the base for polyfilling-related babel
    //As a full equal of @babel/polyfill, you can use this:
    //let h = `import '@babel/polyfill'\r\n` //import '@babel/polyfill' is deprecated
    //let h = `import 'core-js/stable'\r\n` + `import 'regenerator-runtime/runtime'\r\n`
    //c = h + c

    //write
    //console.log(c)
    fs.writeFileSync(fd + fnIndex, c, 'utf8')

}
main()
