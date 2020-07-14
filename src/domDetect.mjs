import get from 'lodash/get'
import ispint from './ispint.mjs'
import evem from './evem.mjs'
import isfun from './isfun.mjs'


/**
 * 前端監聽DOM元素resize、resizeWithWindow事件，其中resizeWithWindow為dom resize與window resize皆會觸發的事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDetect.test.js Github}
 * @memberOf wsemi
 * @param {Function} f 輸入取得dom函數
 * @param {Integer} [opt.timeInterval=20] 輸入定期偵測時間整數，預設20毫秒
 * @param {Integer} [opt.tolerancePixel=1] 輸入容許誤差整數，單位px，預設1
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽resize與resizeWithWindow事件，clear為釋放監聽
 * @example
 *
 * //監聽dom
 * let de = domDetect(() => {
 *     return document.querySelector('#id')
 * })
 * de.on('resize', (s) => {
 *     console.log('resize', s)
 * })
 * de.on('resizeWithWindow', (s) => {
 *     console.log('resizeWithWindow', s)
 * })
 * de.on('display', (s) => {
 *     console.log('display', s)
 * })
 *
 * //釋放監聽
 * de.clear()
 *
 */
function domDetect(f, opt = {}) {

    //timeInterval
    let timeInterval = get(opt, 'timeInterval', null)
    if (!ispint(timeInterval)) {
        timeInterval = 20
    }

    //tolerancePixel
    let tolerancePixel = get(opt, 'tolerancePixel', null)
    if (!ispint(tolerancePixel)) {
        tolerancePixel = 1
    }

    //ev
    let ev = evem()

    //timer, s
    let timer
    let s = {
        offsetWidth: 0,
        offsetHeight: 0,
    }

    //check
    if (!isfun(f)) {
        console.log('invalid f', f)
        return null
    }

    //setInterval
    timer = setInterval(() => {

        //execute
        let p = f()

        //check
        if (p) {

            //new size
            let snew = {
                offsetWidth: p.offsetWidth,
                offsetHeight: p.offsetHeight,
            }

            //detect
            let bw = Math.abs(s.offsetWidth - snew.offsetWidth) > tolerancePixel
            let bh = Math.abs(s.offsetHeight - snew.offsetHeight) > tolerancePixel
            if (bw || bh) {
                let sold = { ...s }
                setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾

                    //detect resize
                    if (snew.offsetWidth > 0 && snew.offsetHeight > 0) {
                        ev.emit('resize', { sold, snew, ele: p })
                        ev.emit('resizeWithWindow', { sold, snew, ele: p, from: 'dom' })
                    }

                }, 1)
            }

            //save
            s = snew

        }


    }, timeInterval)

    //fWindowResize
    let fWindowResize = (e) => {
        ev.emit('resizeWithWindow', { snew: s, from: 'window' })
    }
    window.addEventListener('resize', fWindowResize)

    //clear
    ev.clear = () => {
        clearInterval(timer)
        window.removeEventListener('resize', fWindowResize)
    }

    return ev
}


export default domDetect


//使用IntersectionObserver與ResizeObserver時, 當顯隱頻繁導致元素尚未出現需等待與過快清除時, 會導致WTextSelect下拉選單無法穩定出現內容問題


// /**
//  * @memberOf wsemi
//  * @param {Function} f 輸入取得dom函數
//  */
// function domDetect(f, opt = {}) {
//     let ele = null
//     let obInts = null
//     let obRes = null

//     //tolerancePixel
//     let tolerancePixel = get(opt, 'tolerancePixel', null)
//     if (!ispint(tolerancePixel)) {
//         tolerancePixel = 1
//     }

//     //ev
//     let ev = evem()

//     //timer, sold
//     let timer
//     let sold = {
//         offsetWidth: 0,
//         offsetHeight: 0,
//     }

//     //check
//     if (!isfun(f)) {
//         console.log('invalid f', f)
//         return ev
//     }

//     //check
//     if (!window.IntersectionObserver) {
//         console.log('invalid IntersectionObserver')
//         return ev
//     }

//     //check
//     if (!window.ResizeObserver) {
//         console.log('invalid ResizeObserver')
//         return ev
//     }

//     //setInterval
//     timer = setInterval(() => {

//         //execute
//         let eleTemp = f()

//         //check
//         if (eleTemp) {

//             //save
//             ele = eleTemp

//             //obInts
//             if (!obInts) {
//                 obInts = new window.IntersectionObserver((entries) => {
//                     let entry = entries[0]

//                     setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾
//                         ev.emit('display', { mode: entry.isIntersecting ? 'show' : 'hide', ele })
//                     }, 1)

//                 })
//                 obInts.observe(ele)
//             }

//             //obRes
//             if (!obRes) {
//                 obRes = new window.ResizeObserver((entries) => {
//                     // let entry = entries[0]

//                     //new size
//                     let snew = {
//                         offsetWidth: ele.offsetWidth,
//                         offsetHeight: ele.offsetHeight,
//                     }

//                     //save sold
//                     let soldt = { ...sold }

//                     //tolerancePixel
//                     let bw = Math.abs(sold.offsetWidth - snew.offsetWidth) > tolerancePixel
//                     let bh = Math.abs(sold.offsetHeight - snew.offsetHeight) > tolerancePixel

//                     if (bw || bh) {
//                         setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾
//                             ev.emit('resize', { sold: soldt, snew, ele })
//                             ev.emit('resizeWithWindow', { sold: soldt, snew, ele, from: 'dom' })
//                         }, 1)
//                     }

//                     //save
//                     sold = snew

//                 })
//                 obRes.observe(ele)
//             }

//             //clearInterval
//             clearInterval(timer)

//         }

//     }, 10)

//     //fWindowResize
//     let fWindowResize = (e) => {
//         ev.emit('resizeWithWindow', { snew: sold, from: 'window' })
//     }
//     window.addEventListener('resize', fWindowResize)

//     //clear
//     ev.clear = () => {
//         obInts.unobserve(ele)
//         obRes.unobserve(ele)
//         clearInterval(timer) //若一直沒偵測到元素故也需要強制中止timer
//         window.removeEventListener('resize', fWindowResize)
//     }

//     return ev
// }


// export default domDetect
