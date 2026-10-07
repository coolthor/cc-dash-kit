# image-peek

在 Claude Code 裡看到自己貼的圖。image-peek 會把每張貼上的圖，畫成縮圖放在那則訊息正下方，對話裡不再只剩一行 `[Image #1]`。 · [English](README.md)

## 需要什麼

| 需要 | 原因 | 沒有的話 |
| --- | --- | --- |
| 支援 kitty 圖形協定的終端機：**Ghostty** 或 **kitty** | 縮圖是用真正的像素畫出來的 | 縮圖的位置會顯示一行說明 |
| **Python 3** 和 **Pillow** | 從剪貼簿貼上的圖，送進 Claude Code 時是 JPEG；Pillow 負責轉檔並縮成 PNG 縮圖 | 不會有縮圖，對話裡會出現一行告訴你怎麼裝 |
| Claude Code **終端機版** | 縮圖畫在終端機的對話裡 | 桌面版和 IDE 擴充套件照原本的樣子顯示 |

iTerm2 和 macOS 內建的「終端機」不支援 kitty 圖形協定，只會看到那一行說明。

還沒裝 Pillow 的話：

```sh
python3 -m pip install Pillow
```

## 安裝

```sh
claude plugin marketplace add coolthor/cc-dash-kit
claude plugin install --scope user image-peek@cc-dash-kit
```

已經加過 cc-dash-kit marketplace 的話，第一行可以跳過。裝好之後重新載入 plugin（或重開 Claude Code）。只想在單一專案試用，把 `--scope user` 換成 `--scope local`。

## 使用

不用任何設定。照平常的方式貼圖，從剪貼簿或從檔案都可以，送出之後縮圖就出現在那則訊息底下。縮圖最寬 48 欄、最高 24 列，保持原圖比例。一則訊息貼了幾張圖，就會有幾張縮圖。

## 運作方式

1. 每當有訊息加進對話，image-peek 會找裡面的圖：從檔案貼上的有檔案路徑，從剪貼簿貼上的有圖片本身的資料。
2. `hooks/preview.py` 把每張圖轉成 PNG 縮圖，最長邊不超過 1024 px，存在系統暫存資料夾。
3. Claude Code 畫你的訊息時，image-peek 先照原樣畫出那一列，再把縮圖畫在下面。

從檔案貼圖時，附件那一列和訊息本身誰先到並不固定，所以兩者只要相隔 5 秒內，就會配成一對。

## 隱私

縮圖只寫在本機的系統暫存資料夾，不會上傳到任何地方，image-peek 也不發任何網路請求。它只記住這個對話最近 30 則訊息的縮圖。

## 疑難排解

- **沒有縮圖，也沒有說明**：在對話裡找開頭是 `image-peek:` 的那一行，它會寫出問題，例如 Pillow 沒裝。用 `claude --debug` 啟動的話，除錯紀錄裡也有同樣的內容。
- **只看到一行說明**：你的終端機不支援 kitty 圖形協定，換 Ghostty 或 kitty 試試。
- **安裝前貼的圖**不會補上縮圖，從下一次貼圖開始才有。

## 移除

```sh
claude plugin uninstall image-peek@cc-dash-kit
```

## 開發

```sh
claude plugin validate plugins/image-peek
claude plugin test plugins/image-peek
```

測試套件無法驅動 `session.append`，所以貼圖這條路要在真實對話裡驗證。

## License

[MIT](../../LICENSE) © coolthor。
