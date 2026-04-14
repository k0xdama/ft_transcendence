*This project has been created as part of the 42 curriculum by [morajaon], [annabrag], [agremill], [pmateo].*

# ft_transcendence

## Description

Our **ft_transcendence** is a full-stack, real-time multiplayer web application built around an online card game. Players can register, chat, add friends, join public or private lobbies, and face each other in live matches supporting **3 to 6 players** simultaneously. The platform is designed as a distributed set of microservices communicating over REST and Redis Pub/Sub, with WebSocket channels handling all real-time interactions (presence, chat, matchmaking, game state...).


### Key features

- Real-time multiplayer card game (3–6 players, live matches, 1v1 and team modes)
- Two game modes: **Classic** and **Linked**, with multiple player counts
- Public matchmaking queue and private lobbies with 6-character invite codes
- Graceful disconnection handling with a 30-second reconnection window
- Full user management: registration, login, JWT authentication, profile, avatar upload
- Friends system with online/offline presence
- Direct messaging, in-lobby chat and in-game chat
- User blocking, game invites from chat
- Match history, per-player statistics, achievements and leaderboard
- Custom-designed reusable component library with a consistent visual identity and mobile-first responsive layouts
- HTTPS everywhere (self-signed certificates generated at setup)
- Containerized microservices orchestrated with Docker Compose

---

## Instructions

### Prerequisites

- **Docker** (≥ 24.x) and **Docker Compose v2**
- **GNU Make**
- **Bash** (scripts use bash)
- **OpenSSL** (used by the certificate-generation script)
- A free port `4000` (API gateway) and `8443` (frontend) on the host
- Unix-like environment (tested on Linux and macOS)


### Installation and launch

Clone the repository and run:

```bash
make
```

This single command will:

1. Generate self-signed SSL certificates (`scripts/generate-cert.sh`)
2. Create the `.env` file with default values (`scripts/create-env.sh`)
3. Generate Docker secrets for DB, Redis and JWT (`scripts/create-secrets.sh` — non-interactive: reads values from an optional `.env.secrets` file if present, otherwise auto-generates strong random passwords with `openssl`). An interactive fallback (`scripts/interactive-secrets-setup.sh`) is also available to create `.env.secrets` from keyboard input.
4. Build all Docker images
5. Start the full stack in detached mode

Once the containers are up, open **https://localhost:8443** in your browser and accept the self-signed certificate warning.


### Useful Make targets

| Command | Description |
|---|---|
| `make` | Full setup + build + launch |
| `make dev` | Same as `make` but with Vite hot-reload for the frontend |
| `make down` | Stop all containers |
| `make down-v` | Stop containers and erase volumes |
| `make logs-rt` | Follow logs in real time |
| `make status` | Show container status |
| `make clean` / `make fclean` | Teardown (volumes + images / + builder prune) |
| `make re` | Full clean rebuild |
| `make shell-<service>` | Open a shell inside a service container (`gateway`, `auth`, `player`, `chat`, `lobby`, `game`, `db`, `redis`, `frontend`) |

Run `make help` for the full list.


### Environment configuration

The `.env` file is generated automatically by `scripts/create-env.sh` with sensible defaults (service URLs, ports, CORS origin). Secrets (DB passwords, JWT signing key, Redis password, SSL key/cert) are stored under `./secrets/` and mounted as **Docker secrets** — they are never exposed as environment variables.

Secret generation (`scripts/create-secrets.sh`) is fully non-interactive: if a `.env.secrets` file is present at the project root it is sourced to populate the values; any missing password is auto-generated with `openssl rand`, and the JWT signing key is always generated if not provided. This lets `make` run end-to-end without any keyboard input. If you prefer entering values by hand, run `scripts/interactive-secrets-setup.sh` first to produce `.env.secrets`.

---

## Team Information

| Member | Login | Role(s) | Responsibilities |
|---|---|---|---|
| Morgan | `@morajaon` | Product Owner / Frontend | API Gateway + the whole web application esthetic (HTML, Tailwind CSS) |
| Ana | `@itsbraga` | Project Manager / Backend | DevOps (DB, Redis, Docker Compose) + Auth and Chat microservices + Mobile responsive |
| Mateo | `@k0xdama` | Technical Lead / Backend | Lobby and Game services + search for bugs, warnings |
| Antoine | `@agremill` | Developer Backend | Player service + game statistics and match history |

---

## Project Management

- **Methodology**: One or two services per person, sync-ups when something was blocking, every merge to `main` went through a PR review (except for the project finishes)
- **Task tracking**: TODO list with daily checks
- **Meetings**: One or two weekly meetings depending on our advances in the features we were working on
- **Communication**: Discord for daily chat, meetups for brainstorming
- **Version control**: Git + GitHub, feature branches merged into `main` via pull requests with peer review
- **Design**: Diagrams authored in Excalidraw / Mermaid — see `./docs/` (`archi_v3.pdf`, `GameTheory.excalidraw`, `LobbyService.excalidraw`, etc.)

---

## Technical Stack

### Frontend

- **React** (SPA) + **Vite** (dev server and bundler)
- **Tailwind CSS** + PostCSS + custom CSS modules for the design system
- **ESLint** for linting
- **Socket.IO client** for real-time WebSocket communication
- **nginx** serving the production build behind HTTPS (port 8443)


### Backend

- **Node.js** microservices
- **Express** (lightweight HTTP layer across all services)
- **Socket.IO** server for real-time WebSocket channels (chat, lobby, game)
- **JWT** (access tokens) for stateless authentication propagated via the API gateway
- **bcrypt** for password hashing


### Database and caching

- **PostgreSQL 18** — the main database where all persistent data is stored (accounts, stats, friendships, chat history). It was chosen because it guarantees that data stays reliable and consistent even if something crashes in the middle of an operation (ACID*). The database is split into three schemas (`auth`, `player`, `chat`), and each service logs in with its own user (`auth_user`, `player_user`, `chat_user`) and its own password — that can only access its own schema, so if one service is compromised, the others remain safe. `lobby` and `game` services are excluded since they only rely on Redis.
- **Redis 8** — a fast in-memory store used for short-lived real-time data (matchmaking queues, online presence, current lobby state, etc.). It also acts as a **Pub/Sub*** bus that lets services talk to each other without being directly connected (e.g. the game service announces `game:ended` and the player service picks it up to update stats).

> \* **ACID** = four guarantees that make a database trustworthy:
> - **Atomicity**: a transaction either fully succeeds or is fully cancelled — no half-done operations.
> - **Consistency**: the database always respects its rules (unique usernames, valid references between tables, etc.).
> - **Isolation**: two operations happening at the same time don't interfere with each other.
> - **Durability**: once data is saved, it survives a crash or power loss.
>
> \* **Pub/Sub** (Publish/Subscribe) = a messaging pattern where a service "publishes" an event on a channel without knowing who will read it, and any other service can "subscribe" to that channel to receive it. It keeps services independent from each other.


### Infrastructure

- **Docker** + **Docker Compose** — multi-service orchestration
- **Docker secrets** for credentials and TLS material
- **Self-signed TLS** across every HTTP and WebSocket endpoint
- Private bridge network (`triple_network`) — only the API gateway and the frontend expose ports to the host


### Justification of major technical choices

- **Microservices over a monolith**: each service (auth, player, chat, lobby, game) has a single responsibility. It forces explicit contracts, allows independent deployment, and isolates fault domains — a disconnected chat service cannot take down an in-progress match.
- **React + Vite**: React for component-driven UI with shared state via Context (AuthContext, LobbyContext, GameContext, ChatContext); Vite for ????
- **Socket.IO**: built-in reconnection, rooms, and JWT-based handshake, which mapped cleanly onto our lobby/game model.
- **Redis Pub/Sub**: keeps services loosely coupled without introducing a heavy message broker.
- **PostgreSQL schemas**: one schema per bounded context, with a dedicated role per service.

---

## Database Schema

The database is split across **three PostgreSQL schemas**, one per bounded context that needs persistent data (`lobby` and `game` are excluded — they only rely on Redis for their ephemeral state). Each schema is owned by a dedicated role (`auth_user`, `player_user`, `chat_user`) with its own password, enforcing least privilege between services.

### `auth` schema
| Table | Key fields |
|---|---|
| `auth.users` | `id UUID PK`, `email UNIQUE`, `username UNIQUE`, `password_hash` (bcrypt), `created_at`, `updated_at` |
| `auth.refresh_tokens` | `id UUID PK`, `user_id → auth.users(id) ON DELETE CASCADE`, `token_hash`, `expires_at` |

### `player` schema
| Table | Key fields |
|---|---|
| `player.users` | `id SERIAL PK`, `auth_user_id UUID` (logical FK to `auth.users`), `username`, `pp_path` (avatar), stats: `won`, `rank`, `score`, `actions_played`, `combo`, `trio_of_7`, `perfect_game`, `played_game` |
| `player.friendships` | `requester_id`, `addressee_id`, `status ENUM('pending','accepted','blocked')`, unique pair, no self-friendship |
| `player.blocked` | `requester_id`, `addressee_id`, `requested_at` |
| `player.match_history` | `id SERIAL PK`, `game_id`, `player_id UUID` (logical FK to `auth.users`), `won BOOLEAN`, `game_mode`, `game_type`, `played_at` — powers the per-user match history and feeds the global leaderboard |

### `chat` schema
| Table | Key fields |
|---|---|
| `chat.ws_messages` | Lobby/game chat — `lobby_id`, `sender_id`, `content`, `message_type ∈ {user_text, quick_reply, game_invite}`, auto-expiry after **7 days** via trigger |
| `chat.direct_conversations` | Paired conversation between two users, ordered `user1_id < user2_id` to deduplicate |
| `chat.direct_messages` | DMs — `conversation_id`, `sender_id`, `content`, `read_at`, auto-expiry after **30 days** |
| `chat.blocked_users` | DM-level blocking |

### Logical relationships between schemas

> Arrows marked `──logical──>` represent application-level references between service-owned schemas (no SQL foreign keys — each microservice owns its schema exclusively, and cross-schema links are resolved at the application layer to preserve service isolation). Plain arrows (`──>`) represent standard SQL foreign keys between tables of the same schema.

```
auth.users (1) ──logical──> (1) player.users
auth.users (1) ──logical──> (N) player.match_history (via player_id)
player.users (N) <──> (N) player.users (via friendships, blocked)
auth.users (1) ──logical──> (N) chat.direct_conversations ──> (N) chat.direct_messages
auth.users (1) ──logical──> (N) chat.ws_messages (per lobby_id)
```

Architecture diagrams are available in `./docs/` (`archi_v3.pdf`, `DevOps.excalidraw`, `LobbyService.excalidraw`, `GameTheory.excalidraw`).

---

## Features List

| Feature | Description | Contributor(s) |
|---|---|---|
| Registration & login | Email + username + password, bcrypt hashing, JWT issuance | [annabrag] |
| Profile page | Display user info, avatar, stats, match history, achievements | [agremill] |
| Profile settings | Update username, email, password; delete account | [agremill, annabrag] |
| Avatar upload | Upload custom avatar, default avatar if none | [agremill] |
| Friends system | Send/accept/decline requests, list friends, online status | [agremill] |
| User blocking | Block/unblock users (DM + chat filtered) | [agremill, annabrag] |
| Direct messaging | 1-to-1 DM with history persistence and read receipts | [annabrag] |
| Lobby chat | Per-lobby chat overlay during wait and in-game | [annabrag, morajaon] |
| Game invites from chat | Send a clickable game invite as a chat message | [annabrag] |
| Private lobby | Create lobby, share 6-char code, ready-check, host starts game | [pmateo] |
| Public matchmaking | Queue by mode/type/player count, auto-start when full | [pmateo] |
| Real-time game | Card game for 3–6 players, Classic and Linked modes, Solo/Team | [pmateo] |
| Reconnection | 30s grace window on disconnect, full state resync on return | [?????????? pmateo, morajaon ?????????] |
| Match history | Per-user log of past games, opponents, outcomes | [????????? agremill, pmateo ????????] |
| Stats & achievements | Wins, combos, trio-of-7, perfect games, progression | [pmateo, agremill] |
| Leaderboard | Global ranking by score | [pmateo] |
| Mobile responsive UI | Adaptive layouts for phone and desktop, including dedicated mobile chat overlays, split desktop/mobile NavBar and responsive size dictionaries per breakpoint | [morajaon, annabrag] |
| Icon set & design tokens | Named icon components (`Icons.jsx`), custom Tailwind palette, typography and shadows | [morajaon, annabrag] |
| Legal pages | Privacy Policy & Terms of Service | [pmateo] |


---

## Modules (14+ points required)

### Major modules (2 pts each)

| # | Category | Module |
|---|---|---|
| 1 | WEB | Implement real-time features using WebSockets or similar technology.<br>• Real-time updates across clients<br>• Handle connection/disconnection gracefully.<br>• Efficient message broadcasting. |
| 2 | WEB | Allow users to interact with other users. The minimum requirements are:<br>• A basic chat system (send/receive messages between users).<br>• A profile system (view user information).<br>• A friends system (add/remove friends, see friends list). |
| 3 | USER MANAGEMENT | Standard user management and authentication.<br>• Users can update their profile information.<br>• Users can upload an avatar (with a default avatar if none provided).<br>• Users can add other users as friends and see their online status.<br>• Users have a profile page displaying their information. |
| 4 | GAMING AND USER EXPERIENCE | Implement a complete web-based game where users can play against each other.<br>• The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card games, etc.).<br>• Players must be able to play live matches.<br>• The game must have clear rules and win/loss conditions.<br>• The game can be 2D or 3D. |
| 5 | GAMING AND USER EXPERIENCE | Remote players — Enable two players on separate computers to play the same game in real-time.<br>• Handle network latency and disconnections gracefully.<br>• Provide a smooth user experience for remote gameplay.<br>• Implement reconnection logic. |
| 6 | GAMING AND USER EXPERIENCE | Multiplayer game (more than two players).<br>• Support for three or more players simultaneously.<br>• Fair gameplay mechanics for all participants.<br>• Proper synchronization across all clients. |
| 7 | DEVOPS | Backend as microservices.<br>• Design loosely-coupled services with clear interfaces.<br>• Use REST APIs or message queues for communication.<br>• Each service should have a single responsibility. |

### Minor modules (1 pt each)

| # | Category | Module |
|---|---|---|
| 8 | WEB | Use a frontend framework (React, Vue, Angular, Svelte, etc.). |
| 9 | WEB | Use a backend framework (Express, Fastify, NestJS, Django, etc.). |
| 10 | WEB | Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components). |
| 11 | USER MANAGEMENT | Game statistics and match history (requires a game module).<br>• Track user game statistics (wins, losses, ranking, level, etc.).<br>• Display match history (1v1 games, dates, results, opponents).<br>• Show achievements and progression.<br>• Leaderboard integration. |
| 12 | GAMING AND USER EXPERIENCE | Advanced chat features (enhances the basic chat from "User interaction" module).<br>• Ability to block users from messaging you.<br>• Invite users to play games directly from chat.<br>• Game/tournament notifications in chat.<br>• Access to user profiles from chat interface.<br>• Chat history persistence.<br>• Typing indicators and read receipts. |


### Point calculation

- **Major**: 7 × 2 = **14 pts**
- **Minor**: 5 × 1 = **5 pts**
- **Total**: **19 / 19 pts** (14 mandatory + 5 bonus)

---

## Individual Contributions

### Morgan @morajaon
- **Owned**: api-gateway, frontend design system and game????
- **Modules**: #4, #8, #10  A VERIFIER
- **Challenges**: ?????

### Ana @annabrag
- **Owned**: infrastructure, auth-service, chat-service, mobile responsive
- **Modules**: #2, #7, #8, #9, #10, #12
- **Challenges**: ?????

### Antoine @agremill
- **Owned**: player-service, some frontend pages????
- **Modules**: #1, #2, #3, #4, #9, #11  A VERIFIER
- **Challenges**: ????

### Mateo @pmateo
- **Owned**: lobby-service, matchmaking, game-service
- **Modules**: #1, #4, #5, #6, #9, #11  A VERIFIER
- **Challenges**: ????

---

## Resources

### Official documentation

- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — dev server and bundler
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/docs/v4/) — WebSocket rooms, handshake middleware, reconnection
- [PostgreSQL 18](https://www.postgresql.org/docs/)
- [Redis](https://redis.io/docs/) — Pub/Sub and ephemeral state
- [Docker Compose v2](https://docs.docker.com/compose/) and [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [JWT](https://jwt.io/introduction) — stateless authentication
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — password hashing


### Articles & tutorials

- Middlewares in Express JS
- Redis Pub/Sub in-depth (how it works)
- MDN docs — WebSockets, HTTPS, Fetch API, CORS
- Socket.IO "Rooms and namespaces" and "Authentication" guides
- PostgreSQL "Schemas and privileges" documentation


### Use of AI

AI assistants (Claude and Copilot) were used as a **pair-programming and reviewing tool**, never as an autonomous generator of deliverables. Specifically:

- **Rubber-ducking and design reviews**: challenging our microservice boundaries, our WebSocket event naming, and reviewing the shape of our API contract (e.g. `docs/API_CONTRACT_LOBBY_GAME.md`).
- **Debugging assistance**: explaining cryptic error messages (Postgres errors, TLS handshake issues, and ????).
- **Documentation**: review this README and improve phrasing where it was needed, same for our diagram
- **Writing tests**: help in generating additional tests we did not thought about (`backend/*/tests/`), always reviewed and completed by the team.

AI was **not** used to generate the core game logic, the database schema design decisions, the overall architecture, or commits without human review. Every AI-assisted change was read, understood, tested and validated by every team member before being merged.

---

## Known limitations

- Self-signed TLS certificates — users must accept the browser warning on first visit.
- No spectator mode.
- Cross-schema references between `auth.users` and `player.users` are **logical only** (not enforced by a PostgreSQL foreign key), to keep schema ownership clean; consistency is maintained at the service layer.
- Service-to-service HTTPS calls use `NODE_TLS_REJECT_UNAUTHORIZED=0` in the `auth` and `lobby` services to accept the self-signed certs on the private `triple_network`


## Privacy Policy & Terms of Service

Available in-app under `/legal` (see `frontend/src/components/legal/`). The platform stores only the minimum information required to operate the game (email, username, hashed password, avatar path, game statistics, chat history with automatic expiry). Users can delete their account at any time from the profile settings, which cascades to all dependent records.


## License

Educational project — 42 cursus. Not intended for production use.