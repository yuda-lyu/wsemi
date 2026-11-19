import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ispint from '../src/ispint.mjs'
import isp0int from '../src/isp0int.mjs'
import isnint from '../src/isnint.mjs'
import isn0int from '../src/isn0int.mjs'
import isint from '../src/isint.mjs'
import isnum from '../src/isnum.mjs'
import iseint from '../src/iseint.mjs'
import isenum from '../src/isenum.mjs'


//is*依數學定義判斷, ise*判斷可用值(使用者2026-11-12定, 2026-10-31定isnum('0x10')為true; 下游ftp492提出ispint(Infinity)、ispint(1e10)、ispint('0x10')為true,
//  主控裁定(2026-11-16 W-20/W-21批, 第4點): 已由上列裁定涵蓋, 不改; 要可用、可計算之整數請用iseint)
describe(`ispint 族依數學定義(ftp492 核實, 不改)`, function() {

    it(`ispint(Infinity), ispint(1e10), ispint('0x10') are true; the safe, usable integer judge iseint gives true only for 1e10`, function() {
        assert.strict.deepStrictEqual([ispint(Infinity), ispint(1e10), ispint('0x10')], [true, true, true])
        //可用、可計算之整數用iseint: Infinity與'0x10'為false(1e10為安全整數而為true)
        assert.strict.deepStrictEqual([iseint(Infinity), iseint(1e10), iseint('0x10')], [false, true, false])
    })

    it(`isp0int(Infinity), isp0int('0x10') are true; isnint(-Infinity), isn0int(-Infinity) are true; isint(Infinity) is true (mathematical definition)`, function() {
        assert.strict.deepStrictEqual([isp0int(Infinity), isp0int('0x10'), isnint(-Infinity), isn0int(-Infinity), isint(Infinity), isint(-Infinity)], [true, true, true, true, true, true])
        assert.strict.deepStrictEqual([isnum('0x10'), isnum('Infinity'), isenum('0x10'), isenum('Infinity')], [true, true, false, false])
    })

    it(`opt.useLimitSafe excludes what is out of the safe integer range (Infinity, 2 ** 60) but keeps 1e10`, function() {
        assert.strict.deepStrictEqual([ispint(Infinity, { useLimitSafe: true }), ispint(2 ** 60, { useLimitSafe: true }), ispint(1e10, { useLimitSafe: true })], [false, false, true])
    })

    it(`a wrapper object in opt.useLimitSafe (new Boolean(true)) is not a boolean (W-20): opt is treated as not given, so Infinity stays true; and a hostile opt is treated as not given`, function() {
        // eslint-disable-next-line no-new-wrappers
        let w = { useLimitSafe: new Boolean(true) }
        for (let f of [isint, ispint, isp0int]) {
            assert.strict.deepStrictEqual([f.name, f(Infinity, w), f(Infinity, { useLimitSafe: true })], [f.name, true, false])
        }
        let r = Proxy.revocable({}, {})
        r.revoke()
        for (let f of [isint, ispint, isp0int]) {
            assert.strict.deepStrictEqual([f.name, f(Infinity, r.proxy)], [f.name, true])
        }
    })

    it(`the JSDoc of ispint, isp0int, isnint, isn0int, isint points to iseint for usable, calculable integers`, function() {
        let dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
        for (let n of ['ispint', 'isp0int', 'isnint', 'isn0int', 'isint']) {
            let s = fs.readFileSync(path.join(dir, `${n}.mjs`), 'utf8')
            assert.strict.ok(/要判可用、可計算之整數[^\n]*iseint/.test(s), n)
        }
    })

})
