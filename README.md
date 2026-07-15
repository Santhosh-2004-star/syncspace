# SyncSpace

SyncSpace is a real-time collaborative whiteboard and code editor built using the MERN stack. It enables multiple users to draw, write code, and collaborate simultaneously within shared rooms using real-time synchronization.

---

## Tech Stack

### Frontend
- React
- React-Konva
- Monaco Editor
- Yjs
- Socket.io Client

### Backend
- Node.js
- Express.js
- Socket.io
- Yjs
- JWT Authentication

### Database
- MongoDB

---

## Features

- Real-time collaborative whiteboard
- Real-time collaborative code editor
- Multi-user room support
- Live synchronization using Socket.io
- Conflict-free editing with Yjs
- User authentication
- Session persistence
- Replay previous collaboration sessions

---

## Project Structure

```
syncspace/
│
├── client/
├── server/
├── docs/
├── README.md
└── .gitignore
```

---

## Branches

| Branch | Purpose |
|---------|----------|
| main | Stable integrated project |
| integration | Project setup, Socket.io, Yjs, deployment, integration |
| whiteboard | Whiteboard module |
| editor | Code editor module |
| backend | Express APIs & MongoDB |
| auth | Authentication |
| frontend-ui | UI & Dashboard |

---

## Getting Started

### Clone the repository

```bash
git clone <repository-url>
```

### Install dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

### Run the frontend

```bash
npm run dev
```

### Run the backend

```bash
npm run dev
```

---

## Team Workflow

- Create a feature branch from `main`.
- Work only on your assigned branch.
- Commit changes regularly with meaningful commit messages.
- Open a Pull Request to `main` after testing.
- Pull the latest changes from `main` before continuing development.

---

## Future Enhancements

- Voice and video collaboration
- File sharing
- Export whiteboard as PDF/Image
- Collaborative terminal
- AI-assisted code suggestions

---

## License

This project is intended for academic and learning purposes.
