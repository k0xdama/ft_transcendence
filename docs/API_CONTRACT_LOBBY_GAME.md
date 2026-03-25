# API Contract — Lobby Service & Game Service

## Connexion WebSocket

Les deux services nécessitent un JWT au handshake :

```javascript
const socket = io('http://<host>:<port>', {
  auth: { token: accessToken }
});
```

Si le token est invalide ou manquant, `connect_error` est déclenché avec `"Token manquant"` ou `"Token invalide"`.

---

## LOBBY SERVICE (WebSocket — port 3003)

### Events Client → Serveur

#### `lobby:create`

```json
{
  "gameMode": "CLASSIC | LINKED",
  "gameType": "SOLO | TEAM_UP",
  "maxUsers": 3 | 4 | 5 | 6
}
```

`maxUsers` doit être un number, pas un string. Utiliser `parseInt()` si la valeur vient d'un `<select>`.

---

#### `lobby:join`

```json
{
  "lobbyId": "A3F9K2"
}
```

Code de 6 caractères, majuscules + chiffres (sans I, O, 0, 1).

---

#### `lobby:ready`

```json
{
  "lobbyId": "A3F9K2"
}
```

Toggle : appeler une fois = ready, une deuxième fois = pas ready.

---

#### `lobby:start`

```json
{
  "lobbyId": "A3F9K2"
}
```

Conditions : le socket doit être le créateur, le lobby doit être plein, tous les joueurs doivent être ready.

---

#### `matchmaking:join`

```json
{
  "gameMode": "CLASSIC | LINKED",
  "gameType": "SOLO | TEAM_UP",
  "maxUsers": 3 | 4 | 5 | 6
}
```

Le joueur est placé dans une file d'attente. Quand assez de joueurs avec les mêmes critères sont présents, un lobby est créé automatiquement et la partie est lancée directement (pas de ready/start).

---

#### `matchmaking:leave`

Aucun payload. Quitte la file d'attente.

---

### Events Serveur → Client

#### `lobby:created`

Destinataire : créateur uniquement.

```json
{
  "lobbyId": "A3F9K2"
}
```

Le front doit stocker ce `lobbyId` pour tous les events suivants.

---

#### `lobby:joined`

Destinataire : tout le lobby (y compris le joueur qui vient de rejoindre).

```json
{
  "lobbyStruct": {
    "lobbyId": "A3F9K2",
    "lobbyType": "PRIVATE | PUBLIC",
    "creatorId": "user-uuid",
    "createdAt": 1710000000000,
    "state": "WAITING | FULL | GAME_STARTED",
    "gameId": null,
    "users": [
      { "id": "user-uuid-1", "ready": false },
      { "id": "user-uuid-2", "ready": false }
    ],
    "rules": {
      "gameMode": "CLASSIC",
      "gameType": "SOLO",
      "maxUsers": 3
    },
    "teams": {}
  }
}
```

---

#### `lobby:readyChanged`

Destinataire : tout le lobby.

Même payload que `lobby:joined` — le `lobbyStruct` complet avec les `ready` mis à jour.

---

#### `lobby:disconnected`

Destinataire : joueurs restants dans le lobby.

```json
{
  "userId": "user-uuid"
}
```

Si le créateur quitte, `creatorId` est réassigné au premier joueur restant. Si le lobby était FULL, il repasse à WAITING.

---

#### `lobby:gameStarting`

Destinataire : tout le lobby. Émis après partie privée (lobby:start) ou matchmaking.

```json
{
  "gameId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Action requise du front :** ouvrir une connexion WebSocket vers le Game Service (port 3002) avec le même token, puis émettre `game:join` avec ce `gameId`.

---

#### `error`

Destinataire : socket concerné.

Messages possibles :
- `"Aucun lobby avec cet identifiant n'existe"`
- `"Vous avez déjà rejoint ce lobby"`
- `"Ce lobby est déjà complet"`
- `"Vous ne pouvez pas rejoindre ce lobby, la partie a déjà commencé"`
- `"L'utilisateur {userId} ne fait pas parti du lobby {lobbyId}"`
- `"Seul l'hôte du lobby peut lancer la partie"`
- `"Le lobby n'est pas complet au vu du nombre de joueur voulu dans les règles de la partie"`
- `"Tout les joueurs du lobby se sont pas prêts, la partie ne peut être lancée"`
- `"Impossible de lancer la partie, le game-service est injoignable."`

---

## GAME SERVICE (WebSocket — port 3002)

La connexion au game-service se fait APRÈS avoir reçu `lobby:gameStarting`.

### Events Client → Serveur

#### `game:join`

Émis immédiatement après connexion au game-service.

```json
{
  "gameId": "550e8400-e29b-41d4-..."
}
```

Seuls les joueurs qui étaient dans le lobby sont acceptés. Sert aussi pour la reconnexion — si le joueur était déjà dans la partie et s'est déconnecté, il est automatiquement reconnecté.

---

#### `game:action`

```json
{
  "gameId": "550e8400-e29b-...",
  "actionType": "PLAYER_HIGHEST | PLAYER_LOWEST | FLIP_MIDDLE",
  "target": "user-uuid ou index"
}
```

| actionType | target | Description |
|-----------|--------|-------------|
| `"PLAYER_HIGHEST"` | userId du joueur ciblé | Révèle sa carte la plus haute |
| `"PLAYER_LOWEST"` | userId du joueur ciblé | Révèle sa carte la plus basse |
| `"FLIP_MIDDLE"` | index en string ("0", "1", ...) | Retourne une carte du milieu |

Le joueur doit être le `currentPlayer` pour pouvoir jouer.

---

### Events Serveur → Client

#### `game:joined`

Destinataire : tout le monde dans la partie.

```json
{
  "gameId": "550e8400-e29b-..."
}
```

---

#### `game:started`

Destinataire : tout le monde. Émis automatiquement quand tous les joueurs attendus ont rejoint via `game:join`.

```json
{
  "gameStruct": {
    "gameId": "550e8400-e29b-...",
    "currentPlayer": "user-uuid",
    "currentAction": "FIRST",
    "players": [
      {
        "id": "user-uuid-1",
        "hand": [ { "value": 7, "id": "7-1" }, ... ],
        "connected": true,
        "eliminated": false
      }
    ],
    "cardsInMiddle": [
      { "value": 5, "id": "5-1", "revealed": false },
      ...
    ],
    "cardsRevealed": [],
    "trioWonArray": {
      "user-uuid-1": [],
      "user-uuid-2": [],
      "user-uuid-3": []
    },
    "stats": {
      "user-uuid-1": { "actionsPlayed": 0, "combo": 0, "trioOf7": 0 }
    }
  }
}
```

**IMPORTANT :** le `gameStruct` contient les mains de TOUS les joueurs. Le front ne doit afficher que la main du joueur local. Cacher les valeurs des mains adverses.

---

#### `game:update`

Destinataire : tout le monde. Après chaque action.

```json
{
  "action_result": {
    "event": "PAIR_FOUND | PAIR_MISSED | TRIO_FOUND | TRIO_MISSED | null",
    "revealedCard": { "value": 7, "id": "7-1", "revealed": true },
    "actionDone": "PLAYER_HIGHEST | PLAYER_LOWEST | FLIP_MIDDLE",
    "target": "user-uuid ou index",
    "turnEnded": false,
    "nextAction": "FIRST | SECOND | BONUS",
    "winner": null
  },
  "gameStruct": { ... }
}
```

Si `action_result.winner` n'est pas null :

```json
{
  "winner": {
    "winnerId": "user-uuid",
    "reason": "THREE_TRIOS | TRIO_OF_7"
  }
}
```

---

#### `game:ended`

Destinataire : tout le monde. Partie terminée.

```json
{
  "winnerId": "user-uuid",
  "reason": "THREE_TRIOS | TRIO_OF_7 | FORFEIT"
}
```

---

#### `game:reconnected`

Destinataire : uniquement le joueur qui se reconnecte.

```json
{
  "gameStruct": { ... }
}
```

Le front doit remettre à jour toute l'interface avec le gameStruct complet.

---

#### `game:playerReconnected`

Destinataire : les autres joueurs.

```json
{
  "userId": "user-uuid"
}
```

---

#### `game:playerDisconnected`

Destinataire : les autres joueurs. Timer de 30s lancé côté serveur.

```json
{
  "userId": "user-uuid"
}
```

Afficher "Joueur X déconnecté — 30s pour revenir".

---

#### `game:playerEliminated`

Destinataire : les autres joueurs. Timer expiré, joueur définitivement éliminé.

```json
{
  "userId": "user-uuid"
}
```

Si un seul joueur reste actif après cette élimination, `game:ended` avec `reason: "FORFEIT"` est émis juste après.

---

#### `error`

Messages possibles :
- `"Aucune partie avec cet identifiant n'existe"`
- `"Vous n'êtes pas attendu dans cette partie"`
- `"Vous êtes déjà connecté à cette partie"`
- `"Ce n'est pas ton tour !"`
- `"La partie n'existe plus...Quelque chose a tourné au vinaigre..."`

---

## FLUX COMPLETS

### Partie privée

```
1. Client connecté au lobby-service (WS port 3003 avec token)
2. emit lobby:create → reçoit lobby:created { lobbyId }
3. Autres clients emit lobby:join → tout le monde reçoit lobby:joined
4. Chaque client emit lobby:ready → tout le monde reçoit lobby:readyChanged
5. Créateur emit lobby:start → tout le monde reçoit lobby:gameStarting { gameId }
6. Chaque client ouvre WS vers game-service:3002 (avec token)
7. Chaque client emit game:join → tout le monde reçoit game:joined
8. Quand tous ont rejoint → tout le monde reçoit game:started { gameStruct }
9. Joueur actif emit game:action → tout le monde reçoit game:update
10. Répéter 9 jusqu'à game:ended
```

### Matchmaking

```
1. Client connecté au lobby-service (WS port 3003 avec token)
2. emit matchmaking:join { gameMode, gameType, maxUsers }
3. Attend... (afficher "Recherche en cours")
4. Quand assez de joueurs → tout le monde reçoit lobby:gameStarting { gameId }
5. Suite identique à la partie privée à partir de l'étape 6
```

### Reconnexion en partie

```
1. Joueur se déconnecte → autres reçoivent game:playerDisconnected
2. Timer 30s côté serveur
3a. Le joueur revient avant 30s :
    → WS game-service:3002 (avec token)
    → emit game:join { gameId }
    → reçoit game:reconnected { gameStruct }
    → autres reçoivent game:playerReconnected
3b. Timer expire :
    → autres reçoivent game:playerEliminated
    → si 1 seul joueur reste : game:ended { reason: "FORFEIT" }
    → si 0 joueur : partie supprimée silencieusement
```
