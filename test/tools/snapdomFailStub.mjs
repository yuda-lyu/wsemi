//snapdomFailStub, 以此檔取代頁面內之@zumer/snapdom(browserKit.openPage之overrides), 使截圖必定失敗, 供測試失敗路徑(不留DOM殘留)
//不於頂層註冊任何測試
let fail = async () => {
    throw new Error('stub snapdom failure')
}

let snapdom = {
    toPng: fail,
    toJpg: fail,
    toSvg: fail,
}

export { snapdom }
