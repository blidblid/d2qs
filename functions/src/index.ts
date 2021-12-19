import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { environment as devEnvironment } from '../../src/environments/environment';
import { environment } from '../../src/environments/environment.prod';
import {
  FARM,
  Game,
  Ladder,
  Platform,
  Query,
  QUEST,
  Region,
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

exports[`createLobbyFromCreate`] = functions.database
  .ref('queries')
  .onCreate((data) => createGame(data.val()));

exports[`createLobbyFromUpdate`] = functions.database
  .ref('queries')
  .onUpdate((data) => createGame(data.after.val()));

async function createGame(
  value: Record<Region, Record<Platform, Record<Ladder, Record<string, Query>>>>
): Promise<void> {
  for (const region of Object.keys(value ?? {}) as Region[]) {
    for (const platform of Object.keys(value[region] ?? {}) as Platform[]) {
      for (const ladder of Object.keys(
        value[region][platform] ?? {}
      ) as Ladder[]) {
        const queries: Query[] = Object.values(
          value[region][platform][ladder] ?? {}
        );

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

              admin
                .database()
                .ref(
                  ['queries', region, platform, ladder, query.playerId].join(
                    '/'
                  )
                )
                .remove();
            }
          }
        }
      }
    }
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
