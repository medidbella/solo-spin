# SoloSpin 🎮

*This project has been created as part of the 42 curriculum (ft_transcendence) by `aakouhar`, `midbella`, `abakhcha`, `alaktari`, and `baouragh`.*

---

## Description

**SoloSpin** is a full-stack web application hosting a multiplayer Pong game with integrated social features. The platform enables users to compete against each other, collect XP and achievements, and socialize via real-time chat.

### Key Features
- 🏓 Real-time multiplayer Pong (local & remote)
- 💬 Integrated chat system
- 🏆 Leaderboard & achievement system
- 👤 User profiles with customizable avatars
- 🔐 Secure authentication (JWT, OAuth 2.0, 2FA)
- 📊 Game statistics & match history

---

## Team Information

| Login | Role | Responsibilities |
|-------|------|------------------|
| **midbella** | Product Owner | Defines product vision, prioritizes features, backend user management |
| **aakouhar** | Project Manager | Organizes meetings, ensures team communication, frontend development |
| **baouragh** | Technical Lead | Defines technical architecture, reviews critical code, DevOps |
| **alaktari** | Developer | Game implementation (local & remote Pong) |
| **abakhcha** | Developer | Chat system, responsive frontend |

---

## Project Management

### Task Distribution
| Member | Primary Task |
|--------|--------------|
| midbella | User management & Authentication |
| aakouhar | Frontend & SPA architecture |
| baouragh | DevOps & ELK stack |
| alaktari | Game development |
| abakhcha | Chat system |

### Organization
- **Meetings**: Bi-weekly (in-person and online)
- **Task Tracking**: Shared TLDraw page with major tasks listed; each member manages their to-do list
- **Version Control**: Public GitHub repository with informative commit messages
- **Communication**: Discord, WhatsApp, phone calls, in-person meetings

---

## Technical Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | TypeScript, Tailwind CSS, Vite (dev mode) |
| **Backend** | Node.js, Fastify |
| **Database** | SQLite3 with Prisma ORM |
| **DevOps** | Docker, Docker Compose, Nginx, ELK Stack, Makefile |

### Technical Choices Justification
- **No frontend framework**: To gain deep understanding of core concepts (DOM manipulation, Fetch API, routing)
- **Prisma ORM**: Simplifies database operations and prevents SQL injection
- **Fastify**: Lightweight, high-performance Node.js framework
- **SQLite**: Simple setup, no external database server required

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   USER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK)          		│ INT         │ Auto-increment primary key            │
│ name             		│ STRING      │ User's display name                   │
│ username         		│ STRING      │ Unique username                       │
│ email            		│ STRING      │ Unique email address                  │
│ reg_date         		│ DATETIME    │ Registration timestamp                │
│ password_hash    		│ STRING?     │ Hashed password (null for OAuth)      │
│ avatar_path      		│ STRING      │ Path to avatar image                  │
│ refresh_token    		│ STRING?     │ JWT refresh token                     │
│ two_factor_*     		│ BOOL/STRING │ 2FA enabled flag and secret           │
│ oauth_*          		│ STRING?     │ OAuth provider and ID                 │
│ level            		│ INT         │ Current level (default: 0)            │
│ experience_points		│ INT         │ XP in current level                   │
│ total_xp_points  		│ INT         │ Total XP accumulated                  │
│ games_won/lost   		│ INT         │ Win/loss counters                     │
│ goals_scored/conceded │ INT   	  │ Goal statistics                       │
│ achievement_string 	│ STRING?  	  │ Encoded achievements                  │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ 1:N                │ 1:N                │ 1:N
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   FRIENDSHIP    │  │      GAME       │  │  DIRECTMESSAGE  │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ status (ENUM)   │  │ winner_id (FK)  │  │ content         │
│ createdAt       │  │ loser_id (FK)   │  │ sentAt          │
│ blockerId       │  │ score           │  │ isRead          │
│ senderId (FK)   │  │ match_date      │  │ friendshipId(FK)│
│ receiverId (FK) │  └─────────────────┘  │ senderId (FK)   │
└─────────────────┘                       │ receiverId (FK) │
                                          └─────────────────┘
```

### Relationships
- **User ↔ Friendship**: One-to-many (sender/receiver)
- **User ↔ Game**: One-to-many (winner/loser)
- **User ↔ DirectMessage**: One-to-many (sender/receiver)
- **Friendship ↔ DirectMessage**: One-to-many (messages belong to a friendship)

---

## Features List

| Feature | Description | Implemented By |
|---------|-------------|----------------|
| Single Page Application | Client-side routing without page reloads | aakouhar |
| User Management | Profile data, avatars, game history storage | midbella |
| Secure Authentication | JWT tokens, OAuth 2.0, 2FA (TOTP) | midbella |
| Real-time Chat | Direct messaging between friends | abakhcha |
| Local & Remote Pong | 2D Pong game with multiplayer support | alaktari |
| Leaderboard & Achievements | XP/level system, badges, rankings | midbella (backend), aakouhar (frontend) |
| Responsive Frontend | Mobile-friendly UI | abakhcha |
| ELK Stack | Centralized logging and visualization | baouragh |

---

## Modules

### Major Modules (2 pts each)

| Module | Description | Implemented By |
|--------|-------------|----------------|
| **User Interaction** | Chat, profiles, and friendship system | abakhcha (chat), midbella (backend), aakouhar (frontend) |
| **User Management & Auth** | Profile management, avatars, authentication | midbella (backend), aakouhar & abakhcha (frontend) |
| **Complete Pong Game** | 2D Pong playable on same keyboard | alaktari |
| **Real-time Remote Game** | Multiplayer Pong over network | alaktari |
| **ELK Stack** | Elasticsearch, Logstash, Kibana for logging | baouragh |
| **Backend Microservices** | Isolated containers with REST API communication | baouragh |
| **SPA Frontend** *(Module of Choice)* | Framework-free SPA using TypeScript & Tailwind | aakouhar |

> **SPA Justification**: Building without frameworks ensures deep understanding of DOM, routing, and state management fundamentals rather than relying on abstractions.

### Minor Modules (1 pt each)

| Module | Description | Implemented By |
|--------|-------------|----------------|
| Backend Framework | Fastify for all services | midbella, alaktari, abakhcha |
| ORM for Database | Prisma for safe database operations | midbella |
| Gamification System | XP, levels, badges, leaderboards | midbella (backend), aakouhar (frontend) |
| Game Statistics | Match history, win/loss rates, goals | midbella (backend), aakouhar (frontend) |
| Remote Auth (OAuth 2.0) | Google & GitHub login | midbella |
| Two-Factor Auth | TOTP-based 2FA | midbella |
| JWT Authentication *(Module of Choice)* | Access & refresh token flow | midbella |
| Responsive Design | Mobile-friendly UI | abakhcha |

### Points Summary
- **Major Modules**: 7 × 2 = 14 pts
- **Minor Modules**: 8 × 1 = 8 pts
- **Total**: 22 pts

---

## Individual Contributions

| Member | Contributions |
|--------|---------------|
| **midbella** | Backend architecture, user management API, JWT/OAuth/2FA authentication, friendship system, gamification backend, database schema design |
| **aakouhar** | SPA architecture, frontend routing, UI components, leaderboard frontend, profile pages |
| **alaktari** | Pong game engine, local multiplayer, WebSocket-based remote play, game server |
| **abakhcha** | Real-time chat (frontend & backend), responsive CSS, UI polish |
| **baouragh** | Docker setup, docker-compose orchestration, Nginx configuration, ELK stack, Makefile, development environment |

---

## Instructions

### Prerequisites
- Docker & Docker Compose
- Make
- Git

### Environment Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd solo-spin
   ```

2. Copy and configure environment files:
   ```bash
   cp env.sample .env
   ```

3. Edit `.env` files with your configuration (OAuth keys, secrets, etc.)

### Running the Project

**Production Mode:**
```bash
make prod
```

**Development Mode:**
```bash
make dev
```

**Stop Services:**
```bash
make down
```

**See Command Reference**
```bash
make
```

### Access
- **Application**: https://localhost
- **Kibana** (ELK): https://localhost:5601

---

## Resources

### Documentation & References
- [Fastify Documentation](https://fastify.dev/docs/)
- [Fastify GitHub](https://github.com/fastify) - Plugins and code examples
- [Prisma Client Docs](https://www.prisma.io/docs/orm/prisma-client)
- Backend topics (JWT, OAuth) documented in internal [TLDraw](https://www.tldraw.com/f/eA2YVI10R-3d-cBLjxlpR?d=v-1120.11921.6933.3918.wd64zjeEkxrqQjoKQAoKk)

### AI Usage
AI tools were used to:
- Suggest learning paths during the initial project phase
- Debug tedious configuration errors by narrowing down the error scope
- Automate text-to-markdown conversion
- Provide technical decision guidance and suggest alternatives following best practices

---

## API Documentation

See [api_doc.md](api_doc.md) for complete API reference including:
- Authentication endpoints (`/api/register`, `/api/login`, `/api/logout`)
- User management (`/api/me`, `/api/user/:id`, `/api/user/avatar`)
- Friendship system (`/api/friends/*`)
- 2FA endpoints (`/api/2fa/*`)
- OAuth endpoints (`/api/login/github`, `/api/login/google`)
- Leaderboard & game history (`/api/leaderboard`, `/api/user/games/history`)
- Messaging (`/api/messages`)

---

## License

This project was created for educational purposes at 42 Network (1337).

---

*© 2026 SoloSpin Team*
