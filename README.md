# [D2QS](https://d2qs.com/)

## About

This is an open-source project to create a modern Diablo 2 lobby.

The project uses an Angular frontend and a Firebase backend.

### How it works

In traditional Diablo 2 lobbies, the game name communicates the purpose of a game.

D2QS uses a slightly different approach: a queue. By queueing with preferences, the server can match players that want to do the same thing. Looking to run Baal on Hell difficulty with 7 other players? Then queue with those preferences. As soon as 8 like-minded players are queueing, the game will fire.

Once a game has fired, it's up to the players to host that game. D2QS will generate a game name and a password, but it _will not host the game_.

### Lobby types

Right now, there are four lobby types:

- Farm - the server distributes players depending on their farming preferences, and tries to minimize player count per area
- Run - all players clear an area together
- Quest - players start at a difficulty, an act and a quest
- Duel - duels for characters under a set max level

## Developing

This is an Angular project. If you're looking to contribute, then look into https://angular.io/start.

### Architecture

The architecture uses the libraries `@berglund/rx` and `@berglund/mixin`. It separates the state architecture into `rx`-files and `operator`-files:

- `rx` is for observables
- `operator` is for stateful components, such `<input>` and `<table>`

All operator components implement `@berglund/rx/Connectable`, which lets them connect to any `rx`-observable that is wrapped with `userInput` or `userTrigger`.

For example:

- `query.rx.ts` contains all observables that relate to querying for a game. It wraps some observables with `userInput`, which makes them connectable
- `query.operators.ts` contains all query components that read or edit state. Operator components uses a `connect`-property to hook into `query.rx.ts`

The app uses horizontal slices. There are six of them:

- `@d2qs/api`
- `@d2qs/core`
- `@d2qs/components`
- `@d2qs/model`
- `@d2qs/testing`
- `@d2qs/rx`

### Backend

The backend is plain Firebase. When developing, a dev-environment is used.
