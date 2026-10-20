//chkOrmDataRunner.mjs: chkOrmData之極大輸入子行程執行器(經runChildCase, 以--max-old-space-size=64限制堆積)
//  node chkOrmDataRunner.mjs <案例名> -> 輸出一行@@R@@{ ok, clean, dirty, ms }
//  clean為合格輸入之結果(須為null), dirty為同形狀但末端含孤立代理之結果({ reason, path })
import chkOrmData from '../../src/chkOrmData.mjs'


let H = String.fromCharCode(0xD800)

//各案回傳[合格輸入, 不合格輸入]之產生函數(逐一建構, 不同時持有兩份, 以免堆積加倍)
let makers = {
    //一百萬元素之陣列(同一字串重複引用, 陣列本身約8MB)
    array: (bad) => {
        let a = new Array(1000000).fill('v')
        if (bad) {
            a[999999] = H
        }
        return a
    },
    //三十萬個鍵之物件
    wide: (bad) => {
        let o = {}
        for (let i = 0; i < 300000; i++) {
            o[`k${i}`] = 'v'
        }
        if (bad) {
            o.zlast = H
        }
        return o
    },
    //二十萬層巢狀物件
    deep: (bad) => {
        let o = { z: bad ? H : 'ok' }
        for (let i = 0; i < 200000; i++) {
            o = { c: o }
        }
        return o
    },
    //六十層共享參照(展開為2^60)
    dag: (bad) => {
        let n = { v: bad ? H : 'leaf' }
        for (let i = 0; i < 60; i++) {
            n = { l: n, r: n }
        }
        return n
    },
    //六十萬項之Map(首項之值不合格; 逐項迭代故不因項目數耗盡堆積)
    map: (bad) => {
        let m = new Map()
        m.set(0, bad ? H : 'ok')
        for (let i = 1; i < 600000; i++) {
            m.set(i, 1)
        }
        return m
    },
    //六十萬元素之Set(首元素不合格)
    set: (bad) => {
        let s = new Set()
        s.add(bad ? H : 'ok')
        for (let i = 1; i < 600000; i++) {
            s.add(i)
        }
        return s
    },
    //length為2^32-1之稀疏陣列
    sparse: (bad) => {
        let a = []
        a.length = 4294967295
        a[5] = 'ok'
        a[4000000000] = bad ? H : 'ok'
        return a
    },
}

let name = process.argv[2]
let mk = makers[name]
//管線輸出為非同步, 寫畢才結束(否則結果行可能被截斷)
let finish = (obj, code) => {
    process.stdout.write(`@@R@@${JSON.stringify(obj)}
`, () => process.exit(code))
}
if (!mk) {
    finish({ ok: false, err: `unknown case ${name}` }, 1)
}
else {
    let t0 = Date.now()
    let clean = chkOrmData(mk(false))
    let dirty = chkOrmData(mk(true))
    finish({ ok: true, clean, dirty, ms: Date.now() - t0 }, 0)
}
