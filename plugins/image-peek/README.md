# image-peek

See the images you paste into Claude Code. image-peek draws a thumbnail of each pasted image right under the prompt you pasted it into, so the transcript shows the picture instead of a bare `[Image #1]`. · [繁體中文](README.zh-TW.md)

## Requirements

| Requirement | Why | If missing |
| --- | --- | --- |
| A terminal that supports the kitty graphics protocol: **Ghostty** or **kitty** | The terminal displays the thumbnail inline | A one-line note appears where the thumbnail would be |
| **Python 3** with **Pillow** | Clipboard pastes reach Claude Code as JPEG; Pillow converts them and scales them down to a PNG thumbnail | No thumbnail; a line in the transcript tells you how to install it |
| The Claude Code **terminal** app | The thumbnail is drawn in the terminal transcript | The desktop app and IDE extensions display images as usual |

iTerm2 and Apple Terminal do not support the kitty graphics protocol, so they get the one-line note.

Install Pillow if you don't have it:

```sh
python3 -m pip install Pillow
```

## Install

```sh
claude plugin marketplace add coolthor/cc-dash-kit
claude plugin install --scope user image-peek@cc-dash-kit
```

Skip the first line if you already added the cc-dash-kit marketplace. Reload plugins (or restart Claude Code) after installing. Use `--scope local` instead of `--scope user` to try it in a single project.

## Usage

Nothing to configure. Paste an image the way you normally do, either from the clipboard or as a file, and send the prompt. The thumbnail appears under that prompt. Each thumbnail is at most 48 columns wide and 24 rows tall, keeping the image's aspect ratio. If a prompt has several images, each gets its own thumbnail.

## How it works

1. When a message is added to the session, image-peek looks for images in it: a file path for a pasted file, or the image bytes for a clipboard paste.
2. `hooks/preview.py` turns each one into a PNG thumbnail, at most 1024 px on its longest side, in your system temp folder.
3. When Claude Code renders your message, image-peek adds the thumbnail below it.

A pasted file's attachment can reach the mod before or after the prompt it belongs to, so the two are paired when they arrive within 5 seconds of each other.

## Privacy

Thumbnails are written to your system temp folder and never leave your machine. image-peek makes no network requests. It remembers thumbnails for the last 30 messages of the session.

## Troubleshooting

- **No thumbnail and no note:** look for a line starting with `image-peek:` in the transcript. It names the problem, such as Pillow not being installed. `claude --debug` keeps the same lines in the debug log.
- **A one-line note instead of a thumbnail:** your terminal does not support the kitty graphics protocol. Try Ghostty or kitty.
- **Images pasted before you installed image-peek** have no thumbnail. Thumbnails start with your next paste.

## Uninstall

```sh
claude plugin uninstall image-peek@cc-dash-kit
```

## Development

```sh
claude plugin validate plugins/image-peek
claude plugin test plugins/image-peek
```

The test kit cannot drive `session.append`, so pasting is verified in a live session.

## License

[MIT](../../LICENSE) © coolthor.
