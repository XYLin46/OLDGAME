# OLDGAME

每款經典遊戲各自放在一個資料夾，首頁提供遊戲入口。純 HTML / CSS / JavaScript，無需建置或後端。

**[直接開啟 OLDGAME](https://xylin46.github.io/OLDGAME/)**

| 遊戲 | 資料夾 | 直接遊玩 |
| --- | --- | --- |
| SAMEGAME | `SAMEGAME/` | [開始消除方塊](https://xylin46.github.io/OLDGAME/SAMEGAME/) |
| 接龍 | `SOL/` | [開始玩接龍](https://xylin46.github.io/OLDGAME/SOL/) |

SAMEGAME 使用 12 欄 × 10 列、A～E 五種字母與不同顏色。點擊至少兩個上下左右相連的同字母方塊即可消除；方塊向下掉落，空欄向左靠攏。每次得分為 `(消除數量 - 2)²`，全清額外獲得 1,000 分。支援滑鼠、觸控、方向鍵與 Enter / Space，提供多步復原、新的一局與瀏覽器本機最佳成績。

本機使用靜態 HTTP 伺服器開啟目錄。規則檢查：`node SAMEGAME/verify.cjs`。

新增遊戲時建立新的獨立資料夾，並在根目錄 `index.html` 與本表新增入口。GitHub Pages 使用 `main` 分支根目錄發布。

接龍位於 `SOL/`，以 Windows 95/98 風格重現 Klondike：預設 640 × 480 視窗、71 × 96 像素牌面、綠色牌桌、藍色標題列、經典選單與狀態列。牌面使用使用者提供的 `SOL_CARDPIC` 素材，花色對應 1–13 梅花、14–26 方塊、27–39 紅心、40–52 黑桃；原素材保留於 `SOL/assets/SOL_CARDPIC/`。

支援拖曳／點選移牌、雙擊收牌、翻一張／翻三張、循環重發、多步復原、13 款牌背、計時、計分與過關判定。桌面預設使用原尺寸，放大按鈕可擴展牌桌；窄螢幕可橫向捲動以保留原始牌面比例。F2 開新遊戲、Ctrl+Z 復原、F1 說明。每局隨機發牌，不保證可解。規則檢查：`node SOL/verify.cjs`。
