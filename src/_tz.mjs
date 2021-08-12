import strdelright from './strdelright.mjs'
import strright from './strright.mjs'


function checkTZ(t) {
    let tz

    //Z
    tz = strright(t, 1)
    if (tz === 'Z') {
        return true
    }

    //general
    tz = strright(t, 6)
    if (!/[+|-]\d\d:\d\d/.test(tz)) {
        return false
    }

    return true
}


function delTZ(t) {
    let tz

    //Z
    tz = strright(t, 1)
    if (tz === 'Z') {
        return strdelright(t, 1)
    }

    return strdelright(t, 6)
}


// function normTZ(t) {
//     let tz

//     //Z
//     tz = strright(t, 1)
//     if (tz === 'Z') {
//         t=strdelright(t, 1)
//         return `${t}+00:00`
//     }

//     return t
// }


let tz = {
    checkTZ,
    delTZ,
    // normTZ,
}


export default tz
