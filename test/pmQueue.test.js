import assert from 'assert'
import pmQueue from '../src/pmQueue.mjs'


describe(`pmQueue`, function() {

    async function fun1(v) {
        console.log('call fun1')
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('#' + v)
            }, 300)
        })
    }

    async function fun2(v) {
        console.log('call fun2')
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject('#' + v)
            }, 200)
        })
    }

    async function fun3(v) {
        console.log('call fun3')
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('#' + v)
            }, 100)
        })
    }

    setTimeout(function() {
        //console.log('test q1')
        let ms1 = []
        let q1 = pmQueue(1)
        q1.run(fun1, 'inp1')
            .then(function(msg) {
                ms1.push('fun1 then ' + msg)
                //console.log('fun1 then', msg)
            })
            .catch(function(msg) {
                ms1.push('fun1 catch ' + msg)
                //console.log('fun1 catch', msg)
            })
        q1.run(fun2, 'inp2')
            .then(function(msg) {
                ms1.push('fun2 then ' + msg)
                //console.log('fun2 then', msg)
            })
            .catch(function(msg) {
                ms1.push('fun2 catch ' + msg)
                //console.log('fun2 catch', msg)
            })
        q1.run(fun3, 'inp3')
            .then(function(msg) {
                ms1.push('fun3 then ' + msg)
                //console.log('fun3 then', msg)
            })
            .catch(function(msg) {
                ms1.push('fun3 catch ' + msg)
                //console.log('fun3 catch', msg)
            })
        setTimeout(function() {
            //console.log(JSON.stringify(ms1))
            assert.strict.deepEqual(JSON.stringify(ms1), '["fun1 then #inp1","fun2 catch #inp2","fun3 then #inp3"]')
        }, 650)
    }, 1)

    setTimeout(function() {
        //console.log('test q2')
        let ms2 = []
        let q2 = pmQueue(2)
        q2.run(fun1, 'inp1')
            .then(function(msg) {
                ms2.push('fun1 then ' + msg)
                //console.log('fun1 then', msg)
            })
            .catch(function(msg) {
                ms2.push('fun1 catch ' + msg)
                //console.log('fun1 catch', msg)
            })
        q2.run(fun2, 'inp2')
            .then(function(msg) {
                ms2.push('fun2 then ' + msg)
                //console.log('fun2 then', msg)
            })
            .catch(function(msg) {
                ms2.push('fun2 catch ' + msg)
                //console.log('fun2 catch', msg)
            })
        q2.run(fun3, 'inp3')
            .then(function(msg) {
                ms2.push('fun3 then ' + msg)
                //console.log('fun3 then', msg)
            })
            .catch(function(msg) {
                ms2.push('fun3 catch ' + msg)
                //console.log('fun3 catch', msg)
            })
        setTimeout(function() {
            //console.log(JSON.stringify(ms2))
            assert.strict.deepEqual(JSON.stringify(ms2), '["fun2 catch #inp2","fun1 then #inp1","fun3 then #inp3"]')
        }, 450)
    }, 700)

})
