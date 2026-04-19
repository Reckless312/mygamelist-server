# mygamelist-server

REST API backend for MyGameList, built with Node.js + Express, deployed on Vercel, database on Neon (PostgreSQL).

## API Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and receive session cookie |
| POST | `/api/logout` | Logout and clear session |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | Get all games |
| POST | `/api/games` | Add a new game |
| GET | `/api/games/:id` | Get a game by ID |
| PATCH | `/api/games/:id` | Update a game |
| DELETE | `/api/games/:id` | Delete a game |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:username/list` | Get any user's list (public) |

### List *(requires auth)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/list` | Get the current user's list |
| POST | `/api/list` | Add a game to the list |
| GET | `/api/list/:gameId` | Get a list entry by game ID |
| PATCH | `/api/list/:gameId` | Update a list entry |
| DELETE | `/api/list/:gameId` | Remove a game from the list |

## Setup

```bash
npm install
```

Copy `.env_template` to `.env` and fill in your database URL:

```
DATABASE_URL=your_database_url_here
```

```bash
npm run dev
```
