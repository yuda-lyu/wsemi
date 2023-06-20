import pseudoRandom from './src/pseudoRandom.mjs'
import pseudoRandomRange from './src/pseudoRandomRange.mjs'
import pseudoRandomIntRange from './src/pseudoRandomIntRange.mjs'
import waitFun from './src/waitFun.mjs'


async function topAsync() {

    let n = 0
    await waitFun(() => {
        n++
        console.log('call waitFun', n)
        return n >= 2
    })

}
topAsync()
    .catch((err) => {
        console.log(err)
    })

//node --experimental-modules --es-module-specifier-resolution=node g.mjs

