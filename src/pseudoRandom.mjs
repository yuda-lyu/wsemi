import isNumber from 'lodash-es/isNumber.js'
import cstr from './cstr.mjs'
import str2hint from './str2hint.mjs'


let _seed = 0

/**
 * 產生偽隨機數，範圍[0,1)，代表0≦隨機數＜1
 *
 * Fork: {@link https://gist.github.com/banksean/300494 MersenneTwister}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandom.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Number} 回傳隨機數字
 * @example
 *
 * let r
 *
 * r = pseudoRandom()
 * console.log('pseudoRandom', r)
 * // => pseudoRandom [0,1)
 *
 * r = pseudoRandom(123)
 * console.log('seed=123', r)
 * // => seed=123 0.6964691872708499
 *
 * r = pseudoRandom(12.3)
 * console.log('seed=12.3', r)
 * // => seed=12.3 0.8510874302592129
 *
 * r = pseudoRandom('abc')
 * console.log('seed=abc', r)
 * // => seed=abc 0.6314232510048896
 *
 * r = pseudoRandom('abc')
 * console.log('seed=abc', r)
 * // => seed=abc 0.6314232510048896
 *
 * r = pseudoRandom('def')
 * console.log('seed=def', r)
 * // => seed=def 0.9743434484116733
 *
 * r = pseudoRandom('BH01S123')
 * console.log('seed=BH01S123', r)
 * // => seed=BH01S123 0.007978770649060607
 *
 * r = pseudoRandom('BH-01:S-123')
 * console.log('seed=BH-01:S-123', r)
 * // => seed=BH01S123 0.9579511017072946
 *
 */
function pseudoRandom(seed = 'start1') {

    //seed
    if (seed === undefined) {
        seed = new Date().getTime()
    }
    else if (seed === 'start1') {
        _seed++
        seed = _seed
    }

    /* Period parameters */
    let N = 624
    let M = 397
    let MATRIX_A = 0x9908b0df /* constant vector a */
    let UPPER_MASK = 0x80000000 /* most significant w-r bits */
    let LOWER_MASK = 0x7fffffff /* least significant r bits */

    let mt = new Array(N) /* the array for the state vector */
    let mti = N + 1 /* mti==N+1 means mt[N] is not initialized */

    /* initializes mt[N] with a seed */
    let init_genrand = (s) => {
        if (isNumber(s)) {
            mt[0] = s >>> 0
        }
        else {
            s = cstr(s)
            mt[0] = str2hint(s)
        }
        for (mti = 1; mti < N; mti++) {
            let s = mt[mti - 1] ^ (mt[mti - 1] >>> 30)
            mt[mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + mti
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            mt[mti] >>>= 0 /* for >32 bit machines */
        }
    }

    // /* initialize by an array with array-length */
    // /* init_key is the array for initializing keys */
    // /* key_length is its length */
    // /* slight change for C++, 2004/2/26 */
    // let init_by_array = (init_key, key_length) => {
    //     let i, j, k
    //     init_genrand(19650218)
    //     i = 1; j = 0
    //     k = (N > key_length ? N : key_length)
    //     for (; k; k--) {
    //         let s = mt[i - 1] ^ (mt[i - 1] >>> 30)
    //         mt[i] = (mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
    //     init_key[j] + j /* non linear */
    //         mt[i] >>>= 0 /* for WORDSIZE > 32 machines */
    //         i++; j++
    //         if (i >= N) {
    //             mt[0] = mt[N - 1]; i = 1
    //         }
    //         if (j >= key_length) j = 0
    //     }
    //     for (k = N - 1; k; k--) {
    //         let s = mt[i - 1] ^ (mt[i - 1] >>> 30)
    //         mt[i] = (mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i /* non linear */
    //         mt[i] >>>= 0 /* for WORDSIZE > 32 machines */
    //         i++
    //         if (i >= N) {
    //             mt[0] = mt[N - 1]; i = 1
    //         }
    //     }
    //     mt[0] = 0x80000000 /* MSB is 1; assuring non-zero initial array */
    // }

    /* generates a random number on [0,0xffffffff]-interval */
    let genrand_int32 = () => {
        let y
        let mag01 = new Array(MATRIX_A)
        /* mag01[x] = x * MATRIX_A  for x=0,1 */

        if (mti >= N) { /* generate N words at one time */
            let kk

            if (mti === N + 1) { /* if init_genrand() has not been called, */
                init_genrand(5489)
            } /* a default initial seed is used */

            for (kk = 0; kk < N - M; kk++) {
                y = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK)
                mt[kk] = mt[kk + M] ^ (y >>> 1) ^ mag01[y & 0x1]
            }
            for (;kk < N - 1; kk++) {
                y = (mt[kk] & UPPER_MASK) | (mt[kk + 1] & LOWER_MASK)
                mt[kk] = mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 0x1]
            }
            y = (mt[N - 1] & UPPER_MASK) | (mt[0] & LOWER_MASK)
            mt[N - 1] = mt[M - 1] ^ (y >>> 1) ^ mag01[y & 0x1]

            mti = 0
        }

        y = mt[mti++]

        /* Tempering */
        y ^= (y >>> 11)
        y ^= (y << 7) & 0x9d2c5680
        y ^= (y << 15) & 0xefc60000
        y ^= (y >>> 18)

        return y >>> 0
    }

    // /* generates a random number on [0,0x7fffffff]-interval */
    // let genrand_int31 = () => {
    //     return (genrand_int32() >>> 1)
    // }

    // /* generates a random number on [0,1]-real-interval */
    // let genrand_real1 = () => {
    //     return genrand_int32() * (1.0 / 4294967295.0)
    // /* divided by 2^32-1 */
    // }

    /* generates a random number on [0,1)-real-interval */
    let genrand = () => {
        return genrand_int32() * (1.0 / 4294967296.0)
    /* divided by 2^32 */
    }

    // /* generates a random number on (0,1)-real-interval */
    // let genrand_real3 = () => {
    //     return (genrand_int32() + 0.5) * (1.0 / 4294967296.0)
    // /* divided by 2^32 */
    // }

    // /* generates a random number on [0,1) with 53-bit resolution*/
    // let genrand_res53 = () => {
    //     let a = genrand_int32() >>> 5; let b = genrand_int32() >>> 6
    //     return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0)
    // }

    init_genrand(seed)

    return genrand()
}


export default pseudoRandom
