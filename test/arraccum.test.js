import assert from 'assert'
import arraccum from '../src/arraccum.mjs'
import _ from 'lodash'


describe('arraccum', function() {

  it("should return [1,3,6,'',10] when input [1,2,3,null,4]", function() {
    let r = arraccum([1,2,3,null,4])
    let rr = [1,3,6,'',10]
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input 123.456", function() {
    let r = arraccum(123.456)
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input '123.456'", function() {
    let r = arraccum('123.456')
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input ''", function() {
    let r = arraccum('')
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input []", function() {
    let r = arraccum([])
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input {}", function() {
    let r = arraccum({})
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input null", function() {
    let r = arraccum(null)
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

  it("should return [] when input undefined", function() {
    let r = arraccum(undefined)
    let rr = []
    r = _.isEqual(r, rr)
    assert.equal(r, true)
  })

})