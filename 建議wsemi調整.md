# 建議 wsemi 調整：domDetect 的 smode、sold 未依容許誤差與比較基準，及行內元素判定後不再重判

- 提出者：w-component-vue（2026-09-25，升級 wsemi 1.9.4 後驗證各組件行為時發現）
- 對象版本：wsemi 1.9.4 `src/domDetect.mjs`。repo 工作副本與 npm 1.9.4 只差註解（repo 已刪去 2020 年的註解舊碼），函式本體相同。下文行號以 repo 工作副本為準（npm 版行號為其加 123），附錄的 patch 也以它為基底。
- 1.9.3 原碼以 `git show 72ce1d03a^:src/domDetect.mjs` 取得，下文標「1.9.3 `:行號`」者依該版。
- 實測環境：Chromium 151.0.7922.34（Playwright 1.62.1）、Vue 2.7.16、@vue/cli-service 5.0.9、Node v24.19.0、mocha 11.8.0。驗證素材在 w-component-vue 專案的 `tmp/wsemi-adjust/`（原型、單元測試、patch）與 `tmp/domresize/`（探針、組件情境、全頁掃描）；兩處都是暫存區，關鍵數字已抄錄於下文。

## 結論

1. **這是缺陷，不是待支援。** 1.9.4 的 JSDoc 寫明「sold 為比較基準（上次發出事件時之尺寸）、smode 為相對比較基準之變化方向」（`:406`），視窗事件的實作與此不符（第一節 B）；方向的算法也與容許誤差的語義矛盾（A）；另有一處行內元素的判定遺漏（C）。
2. **處置是調整，不是新增選項或擴充欄位。** 錯的是預設行為本身，使用端 WDrawer 用的就是預設；事件欄位已足夠，只是值不對（第二節）。
3. **提案四處修改，全在 `src/domDetect.mjs`**，並新增 6 條單元測試（第三節，patch 見附錄）。
4. **驗證**（第五節）：
   - 單元測試：新增 6 條對 1.9.4 全紅、對調整版全綠；原有 30 條對調整版全綠。
   - 真瀏覽器原語層 17 個情境：缺陷情境調整後的事件序列與方向與 1.9.3 相同，其餘與 1.9.4 相同；1.9.4 的改進（緩慢的連續小變化也會發出）保留。
   - 效能：等待中的偵測器，調整版與 1.9.4 無差。
   - w-component-vue 組件層：WDrawer 自動切換 6 個情境，調整後全部正確；其餘 7 個情境與 84 個元件的全頁掃描不變。
5. **升版影響**：讀 `smode` 的使用端只有 WDrawer（由誤切換變為正確），沒有使用端讀 `sold`。w-component-vue 在 1.9.4 下加的指令端過渡處理，調整發佈後可以移除，保留也無害（第六節）。

## 一、問題

| # | 問題 | 位置 | 實測 | 對使用端的後果 |
|---|---|---|---|---|
| A | **方向未依容許誤差。** `check` 先以原始差值算出 `smode`（`:170-174`），之後才判斷是否超過容許誤差（`:181`），所以容許誤差內的差值（例如 1px）也有方向。該軸單獨變化時不發事件，這個方向卻會在另一軸觸發的事件中一起送出（`:188`）。 | `:163-174`、`:181-188` | 原語層 P14：寬 300→301（不發），再把高 40→60 → 1.9.4 事件的 `smode.width` 為 `'larger'`；1.9.3 與調整版為 `''` | WDrawer 以 `smode.width` 判斷變寬或變窄（`WDrawer.vue:534`）。組件層 T1e、T1f：拖曳分隔條使抽屜寬跨過切換寬度、最後一步只移 1px，手動切回後抽屜高度改變，抽屜又被自動切換 |
| B | **視窗事件送出過期方向，且 `sold` 不是比較基準。** `fWindowResize` 送出 `sold: st`（前次量測，`:214`）與閉包內的 `smode`（最近一次 `check` 所算，`:216`）。發事件的 `check` 已把比較基準更新成最新量測（`:187`），此時相對比較基準的方向其實是空；不發事件的 `check` 留下的則是 A 的殘餘方向。 | `:109-117`、`:177`、`:204-219` | 原語層 P13：寬 +1px 後視窗 resize → 1.9.4 視窗事件的 `smode.width` 為 `'larger'`；P12：只改 padding（ResizeObserver 只有 border-box 回報一次）後視窗 resize → 同樣是 `'larger'`；兩者 1.9.3 與調整版皆為 `''`。單元測試：+1px 後的視窗事件，1.9.4 的 `sold.offsetWidth` 為 301（前次量測），比較基準為 300 | 組件層 T1a、T1b、T1c：拖曳後手動切回，接著一次尺寸不變的視窗 resize，抽屜被自動顯示、隱藏或改為浮動 |
| C | **行內元素在「不在頁面中」時被判為非行內，之後不再重判。** `syncInline` 以 `getComputedStyle(ele).display` 判定（`:300`），元素不在頁面中時取到 `''`；`retarget` 對同一元素直接返回（`:322-324`），`onDomChange` 也不重判（`:353-356`）；行內元素 ResizeObserver 又不回報，於是永不量測。移出頁面時，定期量測也會在 `onResize` 結尾的重判中停掉（`:366`）。 | `:296-313`、`:322-324`、`:353-356`、`:366` | 原語層 P2：元素插入前建立偵測器（Vue 指令 bind 的時序）→ 1.9.4 沒有任何事件；P17：量測中的行內元素移出後插回（如 keep-alive）→ 1.9.4 只有移出前那一次。兩者 1.9.3 與調整版皆正常 | 目前沒有使用端把 `v-domresize` 綁在行內元素上（第六節），屬潛在缺陷；`<span v-domresize>` 一類寫法即會踩到 |

A 與 B 同源。1.9.4 為了讓緩慢的連續小變化也能發出（原語層 P7），把比較基準改為「上次發出事件時之尺寸」（`:99`、`:186-187`），容許誤差內的差值因此會一直留到下一次發出；方向卻沒有跟著改成只看超過容許誤差的軸。1.9.3 每 20ms 以前次量測重算一次方向（1.9.3 `:221`、1.9.3 `:243`、1.9.3 `:274-275`），元素一靜止差值就是 0、方向就是空，所以沒有這個問題——這就是「閒置時 smode 恆為空」的由來。

## 二、判定：調整，而不是新增或擴充

1. **違反自身契約。** `:406`：「sold為比較基準(上次發出事件時之尺寸)…smode為寬與高相對比較基準之變化方向」。B 的視窗事件兩個欄位都不符。
2. **與容許誤差的語義不一致。** `:402`：「以offsetWidth、offsetHeight與比較基準之差超過容許誤差即發出」。容許誤差內的差值單獨出現時被當成沒有變化（不發事件），同一個差值在另一軸觸發時卻被報成變化（A）。「有沒有變化」與「往哪個方向變」必須用同一個判準。
3. **偏離 1.9.4 的設計目標。** 1.9.4 的提案寫明事件內容與輪詢版相同（w-echarts-vue `建議wsemi-domDetect調整.md:40`）；A、B 的方向與 C 的量測，每個情境 1.9.3 的結果都與本提案相同（第五節）。B 的 `sold` 例外：1.9.3 以前次量測比較，沒有獨立的比較基準，視窗事件的 `sold` 是前次量測；本提案依 1.9.4 的 JSDoc 定義改為比較基準。
4. **不新增選項**：錯的是預設行為，WDrawer 用的就是預設；加一個選項讓使用端選擇正確行為沒有意義。
5. **不擴充欄位**：使用端不需要新資訊，原始差值已可由 `sold`、`snew` 算出。
6. **不在使用端修**：w-component-vue 已在指令端先把視窗事件的 `smode` 清空作為過渡（`src/js/domResize.mjs:29-41`），但只能處理 B 的方向部分；A 發生在 dom 事件，指令端要分辨就得把容許誤差規則再寫一次，變成同一規則兩處手寫。組件層實測：現況（1.9.4＋指令端過渡）T1e、T1f 仍然誤切換（第五節）。w-aggrid-vue 與日後改用本函數的套件也都得各自再補。

## 三、提案

四處修改，全在 `src/domDetect.mjs`。輪詢與 ResizeObserver 兩種模式共用 `createCore`（`:251`、`:287`），修改 1、2 對兩種模式都生效。

**1. 方向只給超過容許誤差的軸**（`check`）

```js
//sold, sb
let sold = sb
sb = snew

//sm, 方向只於該軸超過容許誤差時給: 容許誤差內之差值視同未變化(不發事件), 若仍給方向, 另一軸觸發之事件會帶出該軸之殘餘方向
let sm = {
    width: bw ? (dw > 0 ? 'smaller' : 'larger') : '',
    height: bh ? (dh > 0 ? 'smaller' : 'larger') : '',
}
```

`sm` 在 `if (!bw && !bh) return`（`:181`）之後才算。`resize` 與 `resizeWithWindow`（`from` 為 `'dom'`）兩個事件帶的是同一個 `sm`（`:121-151`），一併生效。原本的閉包 `smode` 與 `st` 不再使用，一併刪除。`tolerancePixel: 0` 時任何非 0 差值都超過容許誤差，結果與 1.9.4 相同。

**2. 視窗事件的 `sold` 改為比較基準，`smode` 固定為空**（`fWindowResize`）

```js
ev.emit('resizeWithWindow', {
    sold: sb,
    snew: sd,
    smode: {
        width: '',
        height: '',
    },
    from: 'window',
})
```

任何超過容許誤差的變化，`check` 都已立即把比較基準更新為該次量測，所以最新量測與比較基準之差必在容許誤差內；依修改 1 的定義，方向恆為空。`snew`（最新量測＋當下視窗尺寸）不變。視窗事件沒有 `ele`，1.9.3 與 1.9.4 皆如此，本提案不改，只寫進 JSDoc。

**3. 元素插入或移出頁面時重判是否為行內**（`onDomChange`）

```js
let onDomChange = () => {
    retarget()
    if (ele && ele.isConnected !== inlineConn) {
        syncInline()
    }
    updateWaiting()
}
```

新增 `inlineConn`，由 `syncInline` 記錄判定當下元素是否在頁面中。只在這個狀態改變時才重判，等待期間其他的 DOM 變動不重讀樣式。第一版曾在每次 DOM 變動都重判，效能探針量到明顯成本（5.3），才改成現在這樣。

**4. JSDoc**

- 事件內容：補「僅該軸之差超過容許誤差時給方向，否則為''」，以及視窗事件「無ele…其smode寬與高恆為''」。
- 行內元素：補「是否為行內於取得元素、ResizeObserver回報及元素插入或移出頁面時判定」。
- 已知限制：補「行內元素於取得時自身為display:none、之後僅以style或class改為顯示者不會開始量測」（第七節）。

不改：比較基準與發出規則、`sync`、`watchIdentity`、`tolerancePixel`、輪詢退回、`clear`、事件名稱與欄位。

## 四、套用方式

附錄的 patch 含 `src/domDetect.mjs` 與 `test/domDetect.test.mjs` 兩檔（119 行新增、21 行刪除）。把 diff 區塊的內容存成檔案，於 wsemi repo 根目錄執行 `git apply <檔名>`。已驗證：

- 對 repo 工作副本 `git apply --check` 通過。
- 以 GNU patch 套到 repo 原檔的副本後，結果與實測所用的原型逐位元組相同。
- 兩檔以 wsemi 的 `.eslintrc.js` 檢查為 0 問題，`node --check` 通過。

## 五、驗證結果

### 5.1 單元測試（wsemi `test/domDetect.test.mjs`）

假環境的 `getComputedStyle` 改為：元素不在頁面中時回傳空字串，與瀏覽器一致。原有 30 條不受影響。

| 測試 | 1.9.4 | 調整版 |
|---|---|---|
| 原有 30 條 | 30 通過 | 30 通過 |
| should give no direction for an axis within the tolerance when the other axis triggers | 失敗：第 2 個事件的寬方向為 `'larger'` | 通過 |
| should measure an inline element that was taken before being connected | 失敗：沒有任何事件 | 通過 |
| should resume measuring an inline element after it is removed and inserted again | 失敗：只收到移出前的 1 個事件 | 通過 |
| should give no direction on window events after a change within the tolerance | 失敗：`smode.width` 為 `'larger'` | 通過 |
| should give no direction on window events after a change of the border box only | 失敗：`smode.width` 為 `'larger'` | 通過 |
| should carry the comparison baseline as sold on window events | 失敗：`sold.offsetWidth` 為 301 | 通過 |

合計：1.9.4 為 30 通過、6 失敗；調整版 36 通過。

### 5.2 原語層（真瀏覽器，頁面直接載入 domDetect，不經 Vue）

事件以「寬×高（寬方向／高方向）」表示，`—` 表示 `''`。

| 情境 | 1.9.3 | 1.9.4 | 調整版 |
|---|---|---|---|
| P14 寬 300→301（不發），再把高 40→60：dom 事件 | 301×60（—／larger） | 301×60（**larger**／larger） | 301×60（—／larger） |
| P13 寬 +1px 後，一次尺寸不變的視窗 resize：視窗事件 | 301×40（—／—） | 301×40（**larger**／—） | 301×40（—／—） |
| P12 只加 `padding-left: 20px`（border-box 300→320）後，視窗 resize：視窗事件 | 320×40（—／—） | 320×40（**larger**／—） | 320×40（—／—） |
| P2 行內元素，插入前建立偵測器，插入後改文字 | 129×21、254×21 | **沒有事件** | 129×21、254×21 |
| P17 行內元素，量測中移出後插回，再改文字 | 129×21、129×21、254×21 | 129×21（**插回後沒有事件**） | 129×21、129×21、254×21 |
| P15 行內元素，建立偵測器時自身 `display:none`，之後只以 style 顯示 | 129×21、254×21 | 沒有事件 | 沒有事件（已知限制，第七節） |
| P15p 同 P15，`mode: 'polling'` | 129×21、254×21 | 129×21、254×21 | 129×21、254×21 |
| P7 每 30ms 寬 +1px，共 10 次 | 300（之後漂移 10px 都沒發出） | 300、302、304、306、308、310 | 同 1.9.4 |

其餘 9 個情境——P1 區塊元素插入前建立、P3 行內元素插入後建立、P4 顯隱、P5 變窄後視窗 resize、P6 首次量測後視窗 resize、P8 區塊元素移出後插回、P9 父層隱藏後顯示、P10 快速顯隱 10 次、P11 inline-block 插入前建立——調整版與 1.9.4 的事件序列逐一相同（1.9.3 只有 P10 因輪詢間隔而少發幾次，次數各輪不同，其餘也相同）。

### 5.3 效能（等待中的偵測器）

修改 3 只影響「等待中」的偵測器（元素取不到、不在頁面中或尺寸為 0，`:339-350`），它們在每次 DOM 變動時執行 `onDomChange`。量測方式：300 個偵測器，3 秒內 DOM 每 16ms 變動一處（共 188 次），以 CDP `Performance.getMetrics` 取主執行緒時間的增量，跑兩輪。

| 情境 | 無偵測器 | 1.9.4 | 調整版 |
|---|---|---|---|
| S1 元素在 `display:none` 容器內 | 72～74／10 | 88～89／18 | 86～87／17～18 |
| S2 元素未插入頁面 | 73／10 | 86～91／17 | 87～90／17～18 |
| S3 元素可見（不等待，對照組） | 84～85／10 | 88／9～10 | 91～95／10 |

數字為 TaskDuration／ScriptDuration（ms）。各組的重排版（LayoutCount）與樣式重算（RecalcStyleCount）次數都是 180～181，調整版沒有增加。S3 兩版執行的程式路徑相同（偵測器不等待，`onDomChange` 不會執行），上表 TaskDuration 的差距是量測波動：另跑 5 輪，1.9.4 為 99～109、調整版為 100～108，ScriptDuration 都是 11～12（該次無偵測器組為 91～112，整體偏高）。

第一版（每次 DOM 變動都重判行內）在 S1 為 118～130／46～50、樣式重算 188 次，S2 為 101／29，所以改成只在插入或移出頁面時重判。

### 5.4 組件層（w-component-vue 示範頁，真滑鼠拖曳、點擊與視窗尺寸）

WDrawer 的 autoSwitch 示範（`?cmp=WDrawer`，分類 autoSwitch，switchWidth 600）。每個情境都以真滑鼠拖曳分隔條，使抽屜寬度跨過 600，最後一步只移 1px（在容許誤差內，不發事件）。

| 情境 | 操作 | 1.9.3 | 1.9.4 | 1.9.4＋指令端過渡 | 調整版（移除指令端過渡） |
|---|---|---|---|---|---|
| T1a autoSwitchToShow | 寬 540→721 自動顯示 → 手動隱藏 → 尺寸不變的視窗 resize | 維持隱藏 | **被自動顯示** | 維持隱藏 | 維持隱藏 |
| T1b autoSwitchToHide | 顯示中，寬 540→481 自動隱藏 → 手動顯示 → 視窗 resize | 維持顯示 | **被自動隱藏** | 維持顯示 | 維持顯示 |
| T1c autoSwitchToFloat | 佔版中，寬 540→481 自動浮動 → 手動改回佔版 → 視窗 resize | 維持佔版 | **被自動浮動** | 維持佔版 | 維持佔版 |
| T1d autoSwitchToFix | 寬 540→481 自動浮動 → 481→721 自動佔版 → 視窗 resize | 佔版 | 佔版 | 佔版 | 佔版 |
| T1e 同 T1a，最後改抽屜高度 | 寬 540→721 自動顯示 → 手動隱藏 → 抽屜高度 400→440 | 維持隱藏 | **被自動顯示** | **被自動顯示** | 維持隱藏 |
| T1f 同 T1b，最後改抽屜高度 | 寬 540→481 自動隱藏 → 手動顯示 → 抽屜高度 400→440 | 維持顯示 | **被自動隱藏** | **被自動隱藏** | 維持顯示 |

- T1a～T1c 之後再把視窗高度 900→860→900，各欄結果不變。
- T1e、T1f 的抽屜高度是以程式改 `style.height` 模擬（全高抽屜遇到視窗高度變化的情形），其餘操作都是真滑鼠。
- 1.9.4 的 T1a 事件紀錄：最後一個 dom 事件為寬 720（larger），拖曳最後 1px 到 721 沒有發出，之後 3 次視窗事件都帶著 `'larger'`；調整版同一序列的視窗事件方向為 `''`。

其餘 7 個情境，1.9.4、1.9.4＋指令端過渡、調整版三者逐欄相同，頁面錯誤皆為 0：

- T2 WTextSelect：開關下拉 10 次後再開啟，選單位置與項目數。
- T3 WTextSuggest：輸入與刪除後的建議清單。
- T4 WColorSelect：開啟中把視窗寬 1200→420→1200，版面切換（1.9.3 此項慢一步：420 時仍為橫向、回到 1200 時仍為直向；1.9.4 起即時切換）。
- T5 WTooltip：滑入、滑出 3 輪。
- T6 WSlider：把手提示窗的滑入、拖曳、滑出。
- T7 WDialog：開啟後視窗 1200×900→800×600→還原，面板與內容尺寸。
- T8 WDynamicList：切換高度與滾輪捲動後的可見列。

### 5.5 全頁掃描

w-component-vue 全部 84 個元件示範頁（含分類頁籤共 109 項），每頁依序：載入穩定 → 視窗寬 1200→1000 → 還原 1200 → 單發一次尺寸不變的視窗 resize。每一步記錄全頁元素幾何；後三步另檢查每個 `v-domresize` 綁定點最後收到的事件尺寸與實際尺寸之差是否在 1px 內。

現況（1.9.4＋指令端過渡）與調整版（移除指令端過渡）各跑一次，109 項中 93 項逐元素相同。其餘 16 項的差異，全部在同一版本重跑時也會出現：

- 13 項在調整版連跑兩次之間出現同類差異：載入中的轉圈圖示、進度條動畫、圖片載入順序、地圖圖磚、3D 場景標籤、外部套件（圖表、編輯器）載入快慢。
- 另 3 項（WExplorer-list、WTableDyn、WVditorDyn）在現況連跑兩次之間出現同樣差異，而第二次現況與調整版完全相同。例如 WTableDyn 第一次現況在「載入穩定」時表格尚未載入（860 個元素），之後各步驟兩版都是 7883 個。

兩版在任何一頁都沒有「事件尺寸與實際尺寸不一致」；頁面錯誤只有 WMaplibreglVueDyn 載入外部資源的 1 次 404，兩版相同。

## 六、升版影響

- 使用端（對 `C:\opensrc` 下各 repo 以 grep 查，排除 dist、docs、node_modules 等建置與相依目錄）：
  - 直接呼叫 domDetect 的只有 w-component-vue `src/js/domResize.mjs:23`（`v-domresize` 指令）與 w-aggrid-vue `src/components/WAggridVue.vue:629`。
  - 讀 `smode` 的只有 w-component-vue `src/components/WDrawer.vue:534`，行為由誤切換變為正確。
  - 沒有使用端讀 `sold`（wsemi 自身測試除外）。
  - w-aggrid-vue 的 `resize` 處理函式不讀事件內容，只呼叫 `fitColumns`（`WAggridVue.vue:632-637`），不受影響。
  - 修改 3 只會讓原本收不到事件的行內元素開始收到事件，目前沒有這樣的綁定點：以真瀏覽器逐頁讀出 w-component-vue 84 個元件示範頁（各元件的預設頁）全部 `v-domresize` 綁定元素的 display，可見者為 block 1184 個、inline-block 75 個，載入時隱藏的 5413 個在清除行內 `style.display` 後全為 block，沒有 inline；全頁掃描 109 項記錄到的 9145 個綁定點標籤都是 DIV。外部套件以 grep 查 `span`、`a`、`b`、`i`、`em`、`strong`、`label`、`small`、`code` 等行內標籤上的 `v-domresize`，0 處。
- 與 1.9.4 相比的行為差異只有三項：
  1. dom 事件中，差值在容許誤差內的那一軸，方向由殘餘方向改為 `''`（只發生在另一軸觸發事件時）。因此「只差 1px 就跨過切換寬度」（例如 599→600）不會觸發 WDrawer 自動切換，與 1.9.3 相同；1.9.4 下它會被延到下一個不相關的事件才切換，正是本文所修的誤切換（依程式邏輯推得，機制與 T1a、T1e 相同，未另測此數值）。
  2. 視窗事件：`sold` 由前次量測改為比較基準；`smode` 恆為 `''`（與 1.9.3 閒置時相同）。
  3. 行內元素在插入前建立偵測器、或移出後插回，恢復量測（與 1.9.3 相同）。
- w-component-vue：`src/js/domResize.mjs:29-41` 的過渡處理在調整發佈後就沒有作用（視窗事件的 `smode` 已經是空），可以移除，保留也無害。`test/unit-domResize.test.mjs` 的結果：
  - 1.9.4，移除過渡：5 通過、2 失敗（視窗事件的方向），可作為回歸防線。
  - 調整版，移除過渡：7 通過。
  - 調整版，保留過渡：7 通過。

## 七、未處理與已知限制

- **行內元素建立偵測器時自身為 `display:none`，之後只以 style 或 class 改為顯示**（P15）：ResizeObserver 不回報非替換行內元素，共用 MutationObserver 只觀察 `childList`，兩條路都收不到，調整版與 1.9.4 同樣不會開始量測（1.9.3 的輪詢可以）。要支援得另外觀察屬性或改為輪詢，超出本次修正範圍；已寫進 JSDoc 的已知限制，此類使用端請用 `mode: 'polling'`（P15p 實測可行）。
- 視窗事件沒有 `ele`（1.9.3 與 1.9.4 皆如此），本提案只寫進 JSDoc，不補欄位。
- 1.9.4 JSDoc 已列的其他已知限制（僅屬性變化使 f 改指他元素、Shadow DOM、`sync` 的 ResizeObserver loop 錯誤、Safari 15.4 以前不支援 border-box）不在本次範圍。

## 附錄：patch

```diff
--- a/src/domDetect.mjs
+++ b/src/domDetect.mjs
@@ -106,15 +106,10 @@
     //sync, 於ResizeObserver回呼內同步發出事件(繪製前), 供須於同一幀更新版面之使用端(例如圖表重繪); 預設以setTimeout脫勾
     let sync = get(opt, 'sync', false) === true
 
-    //cleared, st, sd, sb, smode, timers
+    //cleared, sd, sb, timers
     let cleared = false
-    let st = sizeZero() //前次量測
     let sd = sizeZero() //最新量測
     let sb = sizeZero() //比較基準, 上次發出事件時之尺寸
-    let smode = {
-        width: '',
-        height: '',
-    }
     let timers = new Set()
 
     //emit
@@ -167,14 +162,7 @@
         let bw = Math.abs(dw) > tolerancePixel
         let bh = Math.abs(dh) > tolerancePixel
 
-        //smode
-        smode = {
-            width: dw > 0 ? 'smaller' : (dw < 0 ? 'larger' : ''),
-            height: dh > 0 ? 'smaller' : (dh < 0 ? 'larger' : ''),
-        }
-
         //save
-        st = sd
         sd = snew
 
         //check
@@ -185,7 +173,12 @@
         //sold, sb
         let sold = sb
         sb = snew
-        let sm = { ...smode }
+
+        //sm, 方向只於該軸超過容許誤差時給: 容許誤差內之差值視同未變化(不發事件), 若仍給方向, 另一軸觸發之事件會帶出該軸之殘餘方向
+        let sm = {
+            width: bw ? (dw > 0 ? 'smaller' : 'larger') : '',
+            height: bh ? (dh > 0 ? 'smaller' : 'larger') : '',
+        }
 
         //emit
         if (allowSync && sync) {
@@ -201,6 +194,7 @@
     }
 
     //fWindowResize, 視窗尺寸取當下值, 否則元素尺寸未變時會一直帶著上次量測時之視窗尺寸
+    //  sold為比較基準, 與dom事件同義; 任何超過容許誤差之變化皆已立即更新比較基準, 故最新量測與比較基準之差必在容許誤差內, 方向恆為空
     let fWindowResize = (e) => {
         if (cleared) {
             return
@@ -211,9 +205,12 @@
             windowHeight: window.innerHeight,
         }
         ev.emit('resizeWithWindow', {
-            sold: st,
+            sold: sb,
             snew: sd,
-            smode,
+            smode: {
+                width: '',
+                height: '',
+            },
             from: 'window',
         })
     }
@@ -286,9 +283,10 @@
     let ev = evem()
     let core = createCore(ev, opt)
 
-    //ele, timerInline, roBorder, roContent
+    //ele, timerInline, inlineConn, roBorder, roContent
     let ele = null
     let timerInline = null
+    let inlineConn = false //上次判定是否為行內時元素是否在頁面中
     let roBorder = null
     let roContent = null
 
@@ -303,6 +301,7 @@
                 inline = false
             }
         }
+        inlineConn = !!(ele && ele.isConnected)
         if (inline && timerInline === null) {
             timerInline = setInterval(onResize, timeInterval)
         }
@@ -350,8 +349,13 @@
     }
 
     //onDomChange, 僅重新取得元素不量測, 避免強制重排版; 換新節點後由ResizeObserver之首次回報觸發check
+    //  元素插入或移出頁面時重判是否為行內: 不在頁面中之元素取不到display而判為非行內(如Vue指令之bind時元素尚未插入, 或行內元素移出後定期量測已停止), 行內元素ResizeObserver又不回報, 不於插入後重判則永不量測
+    //  僅於在頁面與否改變時重判, 等待中之其他DOM變動不重複讀取樣式
     let onDomChange = () => {
         retarget()
+        if (ele && ele.isConnected !== inlineConn) {
+            syncInline()
+        }
         updateWaiting()
     }
 
@@ -401,11 +405,11 @@
  *
  * 瀏覽器支援ResizeObserver與MutationObserver時以其偵測(即時且閒置時不耗資源)，否則退回定期輪詢，兩者之比較規則與事件相同：以offsetWidth、offsetHeight與比較基準之差超過容許誤差即發出，比較基準為上次發出事件時之尺寸，故緩慢之連續小變化累積超過容許誤差亦會發出；尺寸為0(隱藏或移出DOM)不發出，由隱藏恢復顯示時會發出，首次取得非0尺寸時會發出
  *
- * 元素可取不到、中途消失或重建為新節點：取不到、不在頁面中或尺寸為0時，於DOM變動時重新以f取得元素並改觀察之。行內元素(display:inline)ResizeObserver不回報，該偵測器改以定期量測
+ * 元素可取不到、中途消失或重建為新節點：取不到、不在頁面中或尺寸為0時，於DOM變動時重新以f取得元素並改觀察之。行內元素(display:inline)ResizeObserver不回報，該偵測器改以定期量測；是否為行內於取得元素、ResizeObserver回報及元素插入或移出頁面時判定
  *
- * 事件內容：sold為比較基準(上次發出事件時之尺寸)，snew為本次量測，smode為寬與高相對比較基準之變化方向('larger'、'smaller'或'')，ele為元素；from為'window'之事件其snew為最新量測，其中視窗尺寸取事件當下之值
+ * 事件內容：sold為比較基準(上次發出事件時之尺寸)，snew為本次量測，smode為寬與高相對比較基準之變化方向('larger'、'smaller'或'')，僅該軸之差超過容許誤差時給方向，否則為''，ele為元素；from為'window'之事件無ele，其snew為最新量測，其中視窗尺寸取事件當下之值，其smode寬與高恆為''(視窗事件不代表元素尺寸變化，且最新量測與比較基準之差必在容許誤差內)
  *
- * 已知限制：ResizeObserver模式下，僅屬性變化(如class)使f改指他元素、或Shadow DOM內之節點被替換時不會跟隨，此類使用端請用mode:'polling'；sync為true時監聽器不得使所監聽元素之尺寸於同一幀內再變，否則瀏覽器回報ResizeObserver loop錯誤；Safari 15.4以前不支援觀察border-box，只改padding或border之變化於該處不會發出
+ * 已知限制：ResizeObserver模式下，僅屬性變化(如class)使f改指他元素、或Shadow DOM內之節點被替換時不會跟隨，行內元素於取得時自身為display:none、之後僅以style或class改為顯示者不會開始量測，此類使用端請用mode:'polling'；sync為true時監聽器不得使所監聽元素之尺寸於同一幀內再變，否則瀏覽器回報ResizeObserver loop錯誤；Safari 15.4以前不支援觀察border-box，只改padding或border之變化於該處不會發出
  *
  * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDetect.test.mjs Github}
  * @memberOf wsemi
--- a/test/domDetect.test.mjs
+++ b/test/domDetect.test.mjs
@@ -90,7 +90,8 @@
             env.listeners = env.listeners.filter((l) => !(l.type === type && l.fn === fn))
         },
         getComputedStyle: (e) => {
-            return { display: e.display }
+            //未插入DOM之元素取不到計算後樣式, display為空字串, 與瀏覽器一致
+            return { display: e.isConnected ? e.display : '' }
         },
     }
     env.document = { documentElement: { name: 'html' } }
@@ -299,6 +300,21 @@
         assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetHeight, m.smode.width, m.smode.height]), [[40, 'larger', 'larger'], [60, '', 'larger']])
     })
 
+    it(`should give no direction for an axis within the tolerance when the other axis triggers`, async function() {
+        //寬先+1px(未超過容許誤差, 不發出), 之後高+20px觸發發出: 寬之方向須為空, 否則依方向判斷變寬或變窄之使用端會誤動作
+        let env = mkEnv()
+        let el = new Ele(300, 40)
+        let r = env.dd(() => el)
+        env.fireRO(el)
+        el.size(301, 40)
+        env.fireRO(el)
+        el.size(301, 60)
+        env.fireRO(el)
+        await sleep(10)
+        assert.strict.deepStrictEqual(r.resize.map((m) => [m.snew.offsetWidth, m.snew.offsetHeight, m.smode.width, m.smode.height]), [[300, 40, 'larger', 'larger'], [301, 60, '', 'larger']])
+        assert.strict.deepStrictEqual([r.resize[1].sold.offsetWidth, r.resize[1].sold.offsetHeight], [300, 40])
+    })
+
     //--- 發出時點與清除 ---
 
     it(`should emit asynchronously by default and synchronously with sync`, async function() {
@@ -530,6 +546,84 @@
         assert.strict.deepStrictEqual([n, nStopped], [2, 2])
     })
 
+    it(`should measure an inline element that was taken before being connected`, async function() {
+        //Vue指令之bind時序: 元素於插入DOM前即建立偵測器, 此時取不到display而判為非行內; 插入後須於DOM變動時重判為行內並改定期量測
+        let env = mkEnv()
+        let el = new Ele(27, 18, { display: 'inline', connected: false })
+        let r = env.dd(() => el, { timeInterval: 5 })
+        await sleep(30)
+        el.isConnected = true
+        env.fireMO()
+        await sleep(30)
+        el.size(137, 18)
+        await sleep(30)
+        assert.strict.deepStrictEqual(ws(r), [27, 137])
+    })
+
+    it(`should resume measuring an inline element after it is removed and inserted again`, async function() {
+        //如keep-alive: 行內元素移出DOM時定期量測量到尺寸0並判為非行內而停止, 插回後須於DOM變動時重判為行內並恢復定期量測
+        let env = mkEnv()
+        let el = new Ele(27, 18, { display: 'inline' })
+        let r = env.dd(() => el, { timeInterval: 5 })
+        await sleep(30)
+        el.isConnected = false
+        el.size(0, 0)
+        await sleep(30)
+        el.isConnected = true
+        el.size(27, 18)
+        env.fireMO()
+        await sleep(30)
+        el.size(137, 18)
+        await sleep(30)
+        assert.strict.deepStrictEqual(ws(r), [27, 27, 137])
+    })
+
+    it(`should give no direction on window events after a change within the tolerance`, async function() {
+        //元素+1px未超過容許誤差而不發出, 其後之視窗事件不得帶出該方向
+        let env = mkEnv()
+        let el = new Ele(300, 40)
+        let r = env.dd(() => el)
+        env.fireRO(el)
+        await sleep(10)
+        el.size(301, 40)
+        env.fireRO(el)
+        await sleep(10)
+        env.resizeWindow(1000, 800)
+        let w = r.rww.filter((m) => m.from === 'window')
+        assert.strict.deepStrictEqual(w.map((m) => [m.snew.offsetWidth, m.smode]), [[301, { width: '', height: '' }]])
+    })
+
+    it(`should give no direction on window events after a change of the border box only`, async function() {
+        //只改padding時只有border-box之觀察器回報, 發出後無第二次回報可把方向歸零; 其後之視窗事件不得帶出該方向
+        let env = mkEnv()
+        let el = new Ele(300, 40)
+        let r = env.dd(() => el)
+        env.fireRO(el)
+        await sleep(10)
+        el.size(340, 40, 300, 40)
+        env.fireRO(el, 'border-box')
+        await sleep(10)
+        env.resizeWindow(1000, 800)
+        let w = r.rww.filter((m) => m.from === 'window')
+        assert.strict.deepStrictEqual(ws(r), [300, 340])
+        assert.strict.deepStrictEqual(w.map((m) => m.smode), [{ width: '', height: '' }])
+    })
+
+    it(`should carry the comparison baseline as sold on window events`, async function() {
+        //sold為比較基準(上次發出事件時之尺寸), 視窗事件與dom事件同義; 未超過容許誤差之最新量測只出現於snew
+        let env = mkEnv()
+        let el = new Ele(300, 40)
+        let r = env.dd(() => el)
+        env.fireRO(el)
+        await sleep(10)
+        el.size(301, 40)
+        env.fireRO(el)
+        await sleep(10)
+        env.resizeWindow(1000, 800)
+        let w = r.rww.filter((m) => m.from === 'window')
+        assert.strict.deepStrictEqual(w.map((m) => [m.sold.offsetWidth, m.snew.offsetWidth]), [[300, 301]])
+    })
+
     it(`should carry the current window size in resizeWithWindow from the window`, async function() {
         //F3、G4 元素尺寸未變時, 視窗事件之視窗尺寸仍須為當下之值
         let env = mkEnv()
```
