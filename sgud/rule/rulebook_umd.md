# 規則帳本(UMD 版對 external 之晚載入)

索引見 `sgud/rule/rulebook.md`〈索引〉.`xss` 之同類處置見 `rulebook_xss.md` R-XSS-01 規則 1.

## R-UMD-EXTERNAL-01 UMD 版之 external 套件(ua-parser-js、xss)於 wsemi 之後才載入時仍須可用: 取用於呼叫時再找全域,不得於載入時固定

- **依據**: 排程第 258 項(2026-11-02,ws265,主控任務 20261102014123).
- **成因**: `toolg/gDistRollup.mjs` 把 `ua-parser-js` 列為 external 且對應全域 `UAParser`.UMD 包裝於 **wsemi 載入當下**取 `global.UAParser` 作為因子,`import { UAParser } from 'ua-parser-js'` 編譯為對該因子之屬性存取 `uaParserJs.UAParser`;ua-parser-js 於 wsemi 之後才載入時因子為 `undefined`,屬性存取拋 `TypeError: Cannot read properties of undefined (reading 'UAParser')`(原碼 `UAParser || g.UAParser` 之回找來不及執行).瀏覽器版 ua-parser-js 只掛 `window.UAParser`(建構子本身無 `UAParser` 屬性,見 `ua-parser-js/dist/ua-parser.min.js` 末段),故先載入時屬性存取得 `undefined` 而落到全域回找.
- **規則**:
  1. `getUserAgent` 之 `getUAParser()` 於**呼叫時**取建構子: 先以 `try` 取 import 進來者(屬性存取拋錯視為未取得),為函數即用;否則以 `get(getGlobal(), 'UAParser', null)` 找全域,為函數即用;皆非函數拋 `Error('invalid UAParser, g.UAParser, use script for import')`(同 `_filterXSS` 之訊息風格,不再是 `Cannot read properties of undefined`／`is not a constructor`).`getGlobal()` 於無 `self`／`window`／`global` 之環境回 `null`,以 `get` 讀取不拋 TypeError.
  2. 結果不快取: 先因缺相依而失敗、其後才載入 ua-parser-js,下一次呼叫即成功.
  3. 全域值非函數(如被覆寫為物件)視為未載入.
  4. README 註明 ua-parser-js 之 script 可先於或晚於 wsemi 載入.
  5. 新增 external 套件時,凡於 UMD 以「import 進來之屬性存取」取用者,須同樣考慮晚載入(`try` 加全域回找),並補順序測試.
- **測試**: `test/getUserAgentUmd.test.mjs`(9 案,含全域污染之防護案): 以 `w-package-tools` 之 `rollupFile`(回傳程式碼模式,設定同 `gDistRollup.mjs` 對 ua-parser-js 者;另以一案比對 `toolg/gDistRollup.mjs` 之 globals／external 仍含該對應)於記憶體把 `src/getUserAgent.mjs` 打包成 UMD,再於 Node `vm` 新環境(`self`、`window` 指向頂層物件,無 `require`／`module`,故 ua-parser-js 走掛 `window.UAParser` 之分支)依序載入真實 `node_modules/ua-parser-js/dist/ua-parser.min.js` 與該 UMD: 先 ua-parser-js 後 wsemi、先 wsemi 後 ua-parser-js、先呼叫失敗後載入、無參數呼叫(`navigator`)兩序、皆未載入、無頂層物件、全域值非函數.臨時檔於 `test/_tmp/getUserAgentUmd/` 並於 `after` 刪除.**全域污染**: `rollupFile` 於打包執行期間把 `Error.prepareStackTrace` 換成其相依之 `stackTraceRewriter` 且不還原(實測;於獨立 node 行程 import 另會把 `stackTraceLimit` 由 10 改 16,mocha 內已為 Infinity 無變),留在行程內會使 `mocha --parallel` 同一 worker 其後之 `maskDiagErr` 之 capi #14 失敗(首次最終碼全套連跑 3 次中 2 次;`getUserAgentUmd.test.mjs` 後接 `maskDiagErr.test.mjs` 單一行程可重現).故 `before` 內動態 import `rollupFile`、打包後於 `finally` 還原兩者,並以一案釘住(變異: 不還原 `prepareStackTrace` 時該案與 `maskDiagErr` 之 capi #14 皆紅;不還原 `stackTraceLimit` 於 mocha 內等價,為防環境不同之保險).
- **已知限制**: 完整 `dist/wsemi.umd.js` 於本輪未重建(`dist/` 為發布管線產物);測試用之 mini UMD 與完整建置之差別僅在打包範圍(同一份 `src/getUserAgent.mjs`、同一組 globals／external).
- **變更紀錄**: 2026-11-02(ws265)新增本規則;破壞性變更第 51 項.
