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
            console.log('test1 then', res)
            // test1 then abc
        })
        .catch((res) => {
            console.log('test1 catch', res)
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
            console.log('test2 then', res)
        })
        .catch((res) => {
            console.log('test2 catch', res)
            // test2 catch abc
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
            console.log('test3 then', res)
        })
        .catch((res) => {
            console.log('test3 catch', res)
            // test3 catch { reason: 'cancelled' }
        })
}
test3()

async function test4() {
    let pmInp = genPm()
    pmInp.resolve({
        data: {
            state: 'success',
            msg: 'abc',
        },
    })
    let pmOut = pmInvResolve(pmInp, { thenExtractData: true })
    await pmOut
        .then((res) => {
            console.log('test4 then', res)
            // test4 then abc
        })
        .catch((res) => {
            console.log('test4 catch', res)
        })
}
test4()

//node --experimental-modules --es-module-specifier-resolution=node g.mjs
