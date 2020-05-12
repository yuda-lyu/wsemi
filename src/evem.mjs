import EventEmitter from 'eventemitter3'


/**
 * EventEmitter from eventemitter3
 *
 * See: {@link https://github.com/primus/eventemitter3 eventemitter3}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evem.test.js Github}
 * @memberOf wsemi
 * @example
 * let ev = evem()
 */
function evem() {
    return new EventEmitter()
}


export default evem
