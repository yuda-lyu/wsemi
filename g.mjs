// import fs from 'fs'
import genPm from './src/genPm.mjs'
import pmInvResolve from './src/pmInvResolve.mjs'


async function test1() {
    let pmInp = genPm()
    pmInp.resolve({
        state: 'success',
        msg: 'abc',
    })
    let pmOut = pmInvResolve(pmInp)
    await pmOut
        .then((res) => {
            console.log('then', res)
            // then abc
        })
        .catch((res) => {
            console.log('catch', res)
        })
}
test1()

async function test2() {
    let pmInp = genPm()
    pmInp.resolve({
        state: 'error',
        msg: 'abc',
    })
    let pmOut = pmInvResolve(pmInp)
    await pmOut
        .then((res) => {
            console.log('then', res)
        })
        .catch((res) => {
            console.log('catch', res)
            // catch abc
        })
}
test2()

async function test3() {
    let pmInp = genPm()
    pmInp.resolve({
        state: 'cancelled',
        msg: 'abc',
    })
    let pmOut = pmInvResolve(pmInp)
    await pmOut
        .then((res) => {
            console.log('then', res)
        })
        .catch((res) => {
            console.log('catch', res)
            // catch { reason: 'cancelled' }
        })
}
test3()

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
