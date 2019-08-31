function pmSeries(pms) {
    return new Promise((resolve, reject) => {
        pms.reduce(function(pmm, pm) {
            return pmm.then(function() {
                return pm
            })
        }, Promise.resolve()).then(function() {
            resolve()
        }).catch(function(err) {
            reject(err)
        })
    })
}


export default pmSeries
