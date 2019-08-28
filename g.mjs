import pmSeries from './src/pmSeries.mjs'


pmSeries([2, 3, 1], function(v, k) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve('pmSeries: ' + v + '(' + k + ')')
        }, 1)
    })
})
    .then(function(r) {
        console.log('then', r)
    })
    .catch(function(r) {
        console.log('catch', r)
    })
