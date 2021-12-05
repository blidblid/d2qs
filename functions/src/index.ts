import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { environment as devEnvironment } from '../../src/environments/environment';
import { environment } from '../../src/environments/environment.prod';
import {
  ALL_PLATFORMS,
  ALL_REGIONS,
  FARM,
  Game,
  Query,
  QUEST,
  toLobbies,
} from '../../src/lib/model';
import {
  generateGameName,
  getUnassignedAreas,
  lobbyToPlayers,
} from './function-util';

admin.initializeApp(
  (functions.config().app.environment === 'dev' ? devEnvironment : environment)
    .firebase
);

// dynamically export functions for all regions and platforms
for (const region of ALL_REGIONS) {
  for (const platform of ALL_PLATFORMS) {
    const path = [region, platform].join('/');
    const name = [region, platform].map(capitalize).join('');

    exports[`create${name}LobbyFromCreate`] = functions.database
      .ref(path)
      .onCreate((data) => gameFromCreate(data, path));

    exports[`create${name}LobbyFromUpdate`] = functions.database
      .ref(path)
      .onUpdate((data) => gameFromUpdate(data, path));
  }
}

async function gameFromUpdate(
  data: functions.Change<functions.database.DataSnapshot>,
  path: string
): Promise<void> {
  return await createGame(data.after.val(), path);
}

async function gameFromCreate(
  data: functions.database.DataSnapshot,
  path: string
): Promise<void> {
  return await createGame(data.val(), path);
}

async function createGame(
  value: functions.database.DataSnapshot,
  path: string
): Promise<void> {
  const queries: Query[] = Object.values(value ?? {});

  for (const lobby of toLobbies(queries)) {
    if (lobby.queries.length < lobby.maxPlayers) {
      continue;
    }

    const gameName = generateGameName(
      lobby.type === QUEST || lobby.type === FARM
    );

    const queries = lobby.queries.filter((_, index) => {
      return index < lobby.maxPlayers;
    });

    const players = lobbyToPlayers(lobby);

    const game: Game = {
      lobby,
      gameName,
      players,
      timestamp: admin.database.ServerValue.TIMESTAMP as number,
    };

    if (lobby.type === 'farm') {
      game.unassignedAreas = getUnassignedAreas(players);
    }

    for (const query of queries) {
      const ref = await admin.database().ref('games').push(game);

      if (ref.key) {
        admin
          .database()
          .ref(['users', query.playerId, 'gameId'].join('/'))
          .set(ref.key);

        admin.database().ref([path, query.playerId].join('/')).remove();
      }
    }
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
