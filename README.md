# SyncSpace — Local Mode (Week 1 Preview)

This is the **local, no-backend version** of SyncSpace. It's a split-screen
React app with:

- **Left pane** — Whiteboard (React + Konva.js): pen, rectangle, text, eraser tools
- **Right pane** — Code Editor (Monaco, the VS Code engine)

State is saved to your browser's `localStorage`, so your drawing and code
survive a page refresh — but nothing is synced between browser tabs or users
yet. That's exactly what Week 1–3 of the plan (Socket.io + Yjs CRDTs) will add.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed URL (usually `http://localhost:5173`).

## What's next (per the roadmap)

| Step | What changes |
|---|---|
| Add Socket.io backend | Shapes/code broadcast live between browser tabs/users instead of just `localStorage` |
| Add Yjs | Replace the local `shapes` array and Monaco's plain string with CRDT types (`Y.Array`, `Y.Text`) so concurrent edits merge automatically |
| Add MongoDB persistence | Save the Yjs binary doc periodically so sessions survive server restarts |
| Add JWT auth + rooms | Restrict who can join which session |

## Project structure

```
src/
  App.jsx              # split-screen layout
  App.css              # styling
  components/
    Whiteboard.jsx      # Konva canvas + toolbar, localStorage-backed
    CodeEditor.jsx       # Monaco editor, localStorage-backed
```
