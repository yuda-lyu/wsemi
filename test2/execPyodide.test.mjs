import fs from 'fs'
import assert from 'assert'
import execPyodide from '../src/execPyodide.mjs'

describe(`execPyodide`, function() {

    //現在execPyodide下載套件檔過慢, 不列入標準測試
    it(`need test in nodejs.`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})
