import _ from 'lodash-es'
import randomIntsNdpRange from './src/randomIntsNdpRange.mjs'


_.each(_.range(1000), (v) => {
    let rs = randomIntsNdpRange(123, 4567)
    let r = rs[0]
    console.log(r)
    if (r < 123) {
        throw new Error(`r[${r}]<123`)
    }
    else if (r > 4567) {
        throw new Error(`r[${r}]4567`)
    }
})


//node --experimental-modules g.mjs
