import EventEmitter from 'eventemitter3'


/**
 * EventEmitter from eventemitter3
 *
 * See: {@link https://github.com/primus/eventemitter3 eventemitter3}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/evem.test.mjs Github}
 * @memberOf wsemi
 * @example
 *
 * let ev = wsemi.evem()
 * ev.on('evName',function(msg){
 *     console.log(msg)
 *     // => {abc: 12.34}
 * })
 * let data = {abc:12.34}
 * ev.emit('evName',data)
 *
 */
function evem() {
    return new EventEmitter()
}


export default evem
