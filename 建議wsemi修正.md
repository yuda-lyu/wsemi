# 建議 wsemi 修正:obj2u8arr / u8arr2obj 之二進位標記碰撞與靜默失敗

- 來源:w-converhp 第四輪審計(2026-09-09),外部複審 gpt-5.6-sol 提出,經 Opus 5 重跑其探針、Fable 5.1 以純 codec 層探針獨立確認
- 受測版本:wsemi 1.8.87(本專案 node_modules 內)
- 證據探針:`tmp/probe_r4_codec.mjs`(純 codec,不起伺服器)、`tmp/sol_probe_r4_envelope_roundtrip_8372.mjs`(經 w-converhp 之端到端)
- 相關檔案:`src/obj2stru8arr.mjs`、`src/stru8arr2obj.mjs`(`obj2u8arr` / `u8arr2obj` 之底層)

## 優先序(2026-09-09 三審後修正)

- **問題二(靜默失敗)優先**:不需任何特殊輸入,應用端回傳含 BigInt 之物件即發生;是 w-converhp 探針中實際出現「HTTP 200 + success 但本體為 `{}`」的那條路。
  - 值的來源:w-converhp 自身從不產生 BigInt 或循環物件,進 codec 的只有應用端作者給的值 —— 伺服器端 `execute` 監聽器之 resolve/reject 值,與客戶端 `execute(func, input)` 之 `input`。
  - BigInt 真實會出現:Prisma 對 BigInt 欄位回 JS `BigInt`、Drizzle `bigint({mode:'bigint'})`、better-sqlite3 `safeIntegers()`、`fs.stat(fp,{bigint:true})`;處理器直接 resolve 一筆帶 bigint id 之 DB 列即中。循環物件較罕見(樹狀結構帶 parent 指標、ORM 實體雙向關聯);Error 物件 replacer 已以 `toString` 處理,不在此列。
  - 缺陷的本質不是「codec 不支援 BigInt」(那是應用端之錯),而是原生 `JSON.stringify` 會大聲拋錯、wsemi 之 `catch (err) { }` 把它藏起來回空包 —— 應用端在伺服器端看不到任何跡象。修法因此與型別無關:catch 內不吞,回可辨識之失敗值。
- **問題一(標記碰撞)為低機率之正確性缺口**:`obj2u8arr` 與 `u8arr2obj` 是一組,標記為其內部訊號;碰撞只在應用資料本身恰含 `[Uint8Array]::N` 這段文字時發生(使用者輸入之文字經 execute 傳輸、或應用端把中間產物當文字存回),機率極低。列出是因 codec 對合法字串無法 round-trip 屬正確性缺口且修法便宜(不改線上格式),建議併入例行改版,不急。

## 問題一(解碼端):應用字串含標記文字即被當成二進位參照,靜默毀損(低機率)

### 現況

編碼端以 `JSON.stringify` 之 replacer 把 Uint8Array / Uint16Array / ArrayBuffer 抽出,原位置換成字串 `[Uint8Array]::<i>`(`obj2stru8arr.mjs:63-82`)。
解碼端之 reviver 對**任何**字串值做子字串比對(`stru8arr2obj.mjs:58-71`):

```js
if (isestr(value)) {
    if (value.indexOf('[Uint8Array]::') >= 0) {
        let id = cint(value.replace('[Uint8Array]::', ''))
        return binarys[id]
    }
    ...
}
```

三個缺口:①`indexOf >= 0` 是子字串比對,非精確格式;②`cint(value.replace(...))` 對 `'prefix [Uint8Array]::0 suffix'` 得 `cint('prefix 0 suffix')`,結果為 0;③`binarys[id]` 無界線檢查,越界得 `undefined`,而 reviver 回 `undefined` 即**刪除該鍵**。

### 實測(`tmp/probe_r4_codec.mjs` 第一段,round-trip `u8arr2obj(obj2u8arr(o))`)

| 輸入 | 解回 | 結果 |
|---|---|---|
| `{text:'hello'}`(對照) | `{text:'hello'}` | ✓ |
| `{text:'prefix [Uint8Array]::0 suffix'}` | `{}` | **鍵消失** |
| `{text:'see [Uint8Array]::0', bin:Uint8Array[65,66]}` | `{text:<u8a 2>, bin:<u8a 2>}` | **字串被換成旁邊的 binary** |
| `{text:'x [Uint8Array]::99', bin:Uint8Array[1]}` | `{text:<u8a 1>, bin:<u8a 1>}` | 越界索引經 `cint` 成 0,換成 binary 0 |
| `{text:'note: [ArrayBuffer]::0'}` | `{}` | 鍵消失 |
| `{text:'[Uint16Array]::0'}` | `{}` | 鍵消失 |
| `{arr:['a','[Uint8Array]::0','c']}` | `{arr:['a',null,'c']}` | 陣列元素變 null |

端到端(經 w-converhp 之 execute):client 送 `{text:'prefix [Uint8Array]::0 suffix'}`,**伺服器應用端收到 `{}`,client 仍 resolve 成功**;無任何錯誤或事件。這是唯一一種「呼叫端與應用端都以為成功、資料卻已毀損」的路徑。

### 建議修法(兩層,可分階段)

**最小修(不改線上格式,向後相容):精確比對 + 界線檢查**

```js
//stru8arr2obj.mjs 之 reviver
let m = /^\[(Uint8Array|Uint16Array|ArrayBuffer)\]::(\d+)$/.exec(value)
if (m) {
    let id = Number(m[2])
    if (id < binarys.length) {
        return binarys[id]
    }
    //標記格式正確但索引越界: 為壞封包, 不可靜默刪鍵(見問題二之處置)
}
return value
```

改為錨定整個字串(`^...$`)後,`'prefix [Uint8Array]::0 suffix'` 不再命中;應用字串**恰好等於**整個標記(如 `'[Uint8Array]::0'`)仍會碰撞,機率極低但非零。

**徹底修(改線上格式,須版本化):以物件哨兵取代字串哨兵**

replacer 回傳 `{ '[wsemi.bin]': i }` 這類物件而非字串;reviver 只對「恰有此一鍵且值為整數」之物件還原。普通字串在任何情況下都不可能碰撞;應用物件要碰撞須恰好有該鍵,可再以極不可能之鍵名壓低。
代價:既有以舊格式落地之封包(如 w-converhp 之 `.ro` 檔)解不回來,須同時保留舊格式之解碼分支或標明版本。

## 問題二(編碼端與解碼端):失敗被靜默吞掉,呼叫端無從得知

### 現況

`obj2stru8arr.mjs` 之 `try { r = JSON.stringify(...) } catch (err) { }` 於 BigInt、循環物件等不可序列化輸入時,`r` 維持 `''`,回 `{results:'', binarys:[]}`,不拋錯。
`stru8arr2obj.mjs` 之 `try { o = JSON.parse(...) } catch (err) { }` 於非法 JSON 時回 `{}`,不拋錯。

### 實測(`tmp/probe_r4_codec.mjs` 第三段)

```
obj2stru8arr({id:1n})           = {"results":"","binarys":[]}   ← 不拋錯
stru8arr2obj("not-json", [])     = {}                            ← 不拋錯
stru8arr2obj('{"a":"[Uint8Array]::0"}', []) = {}                 ← binarys[0] 為 undefined, 鍵被刪
```

round-trip:`{id:1n, name:'x'}` 編成 14 bytes(對照組巢狀物件 39 bytes),解回 `{}` —— 整包塌陷,連 `name` 這個可序列化的鍵也一起消失。

### 在 w-converhp 之後果(供理解嚴重度)

- 應用端 execute resolve 含 BigInt 之物件(現代 DB 驅動之 bigint 欄位常見)→ 伺服器封包編碼結果為空 → 回 HTTP 200 + `Return-Type: success` 但本體為 `{}` → client reject `data is not an effective object`,**伺服器 error 事件 0 則**,應用端不知道自己回了不可序列化的值。
- 合併佇列以 codec 落地應用端結果(`.ro` 檔)供重送時重播:第一次回 `1n`(記憶體內原值),重播時解回 `null`(落檔為 `{}`)—— 「重送得同一結果」之保證因 codec 靜默失敗而破。

### 建議修法

`obj2u8arr` 對非陣列非物件之輸入**已經回 `null`**(`obj2u8arr.mjs` 開頭之 check),所以「失敗回 `null`」與其既有契約一致、不引入拋錯:

- `obj2stru8arr`:catch 內回 `null`(或 `{results:null, binarys:[]}`),`obj2u8arr` 據以回 `null`。
- `stru8arr2obj` / `u8arr2obj`:JSON.parse 失敗回 `null`;問題一之「標記格式正確但索引越界」亦視為壞封包回 `null`,不刪鍵。
- 若顧慮既有呼叫端依賴「永不回 null / 永遠得物件」,可改為新增 `strict` 選項或另出 `obj2u8arrStrict` / `u8arr2objStrict`,由呼叫端選用;w-converhp 會改用嚴格版。

呼叫端(如 w-converhp)得到 `null` 後即可走既有錯誤路徑:回錯誤封包、發 error 事件、不落地壞的 `.ro`。

## 影響範圍提示

- 兩個問題都只需改 `obj2stru8arr.mjs` 與 `stru8arr2obj.mjs` 兩檔;`obj2u8arr` / `u8arr2obj` 之包裝層不動(除非採「失敗回 null」須在包裝層傳遞)。
- 問題一之最小修不改線上格式,既有落地封包仍可解;徹底修改格式則須版本化。
- 建議 wsemi 側補單元測試:上表 7 種碰撞輸入須 round-trip 一致;BigInt / 循環 / 非法 JSON 三種失敗須得到可辨識之失敗值而非 `{}`。
