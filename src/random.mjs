import pseudoRandom from './pseudoRandom.mjs'


let fr = pseudoRandom(new Date().getTime(), true)


/**
 * 產生隨機數，範圍[0,1)，代表0≦隨機數＜1
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/random.test.mjs Github}
 * @memberOf wsemi
 * @returns {Number} 回傳隨機數字
 * @example
 *
 * let r
 *
 * r = random()
 * console.log('random', r)
 * // => random [0,1) (預設範圍為0至1)
 *
 */
function random() {
    return fr()
}


export default random
