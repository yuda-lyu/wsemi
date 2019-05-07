import binstr from './binstr.mjs'


/**
 * 前端判斷是否為開發階段
 * 主要判斷location.href內是否含有localhost
 * @export
 * @returns {Boolean} 回傳是否為開發階段
 */
export default function isdev() {

    //check
    if (location) {
        return binstr(location.href, 'localhost')
    }

    return false
}
