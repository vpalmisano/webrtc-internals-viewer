# WebRTC Internals Viewer

A viewer for `webrtc_internals_dump` JSON files exported from `chrome://webrtc-internals`.

## Development

```bash
npm install
npm run dev
```

Open the URL shown by Vite (typically http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Static output is written to `dist/`.

## Usage

- Choose a dump file via the file picker, or drag and drop a `.json` / `.txt` / `.gz` file.
- Optional URL parameter: `?dump=/path/to/dump.json` (file must be served by the dev server or hosting).
