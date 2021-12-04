import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { environment as devEnvironment } from '../../src/environments/environment';
import { environment } from '../../src/environments/environment.prod';
import { FARM, Game, Query, QUEST, toLobbies } from '../../src/lib/model';
import {
  generateGameName,
  getUnassignedAreas,
  lobbyToPlayers,
} from './function-util';

admin.initializeApp(
  (functions.config().app.environment === 'dev' ? devEnvironment : environment)
    .firebase
);

exports.createLobbyFromUpdate = functions.database
  .ref('queries')
  .onUpdate(async (data) => await createGame(data.after.val()));

exports.createLobbyFromCreate = functions.database
  .ref('queries')
  .onCreate(async (data) => await createGame(data.val()));

async function createGame(
  value: functions.database.DataSnapshot
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
        admin.database().ref(`users/${query.playerId}/gameId`).set(ref.key);
        admin.database().ref(`queries/${query.playerId}`).remove();
      }
    }
  }
}
