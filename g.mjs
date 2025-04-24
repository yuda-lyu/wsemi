import fs from 'fs'
import _ from 'lodash-es'
import obj2u8arr from './src/obj2u8arr.mjs'
import u8arr2obj from './src/u8arr2obj.mjs'
import str2aes from './src/str2aes.mjs'
import aes2str from './src/aes2str.mjs'


let inp = {
    browsername: 'Chrome',
    browserversion: '135.0.0.0',
    cpuarchitecture: 'amd64',
    devicetype: '',
    engineinfor: 'Blink135.0.0.0',
    ip: '223.26.109.157',
    platform: 'Windows10',
}
let inp2 = JSON.stringify(inp)
console.log('inp2', inp2)
let inp3 = str2aes(inp2, 'frliq')
console.log('inp3', inp3)
let inp4 = {
    sct: inp3
}
console.log('inp4', inp4)
let u8a = obj2u8arr(inp4)
let out1 = u8arr2obj(u8a)
let out2 = aes2str(out1.sct, 'frliq')
let out3 = JSON.parse(out2)
console.log('inp', inp)
console.log('out3', out3)


//node g.mjs
