import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { environment } from '../../src/environments/environment.prod';
import { ALL_AREAS, Area } from '../../src/lib/api/auth/user-model';
import { Game, Player } from '../../src/lib/api/game/game-model';
import { Lobby } from '../../src/lib/api/lobby/lobby-model';
import { toLobbies } from '../../src/lib/api/lobby/lobby-util';
import { FARM, Query, QUEST } from '../../src/lib/api/query/query-model';

admin.initializeApp(environment.firebase);

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

    const game: Game = {
      lobby,
      gameName,
      players: lobbyToPlayers(lobby),
      hostNick: lobby.queries[lobby.queries.length - 1].nick,
    };

    for (const query of queries) {
      const ref = await admin.database().ref('games').push(game);

      if (ref.key) {
        admin.database().ref(`users/${query.playerId}/gameId`).set(ref.key);
        admin.database().ref(`queries/${query.playerId}`).remove();
      }
    }
  }
}

function lobbyToPlayers(lobby: Lobby): Player[] {
  let uniqueAreas = [...ALL_AREAS];
  const areaCapCount = 5;
  const averageAreaCount = Math.round(
    lobby.queries.reduce((acc, curr) => acc + curr.areas.length, 0) /
      lobby.queries.length
  );
  const numberOfAreas = Math.min(areaCapCount, averageAreaCount);

  function assignAreas(preference: Area[]): Area[] {
    let i = numberOfAreas;
    const areas: Area[] = [];

    while (i--) {
      const preferredUniqueAreas = uniqueAreas.filter((area) => {
        return preference.includes(area);
      });

      const pool = (
        preferredUniqueAreas.length > 0
          ? preferredUniqueAreas
          : ALL_AREAS.filter((area) => preference.includes(area))
      ).filter((area) => !areas.includes(area));

      if (pool.length === 0) {
        break;
      }

      const randomArea = pool[Math.floor(Math.random() * pool.length)];

      uniqueAreas = uniqueAreas.filter((area) => area !== randomArea);
      areas.push(randomArea);
    }

    return areas;
  }

  return lobby.queries.map((query) => {
    return {
      nick: query.nick,
      areas: query.type === 'farm' ? assignAreas(query.areas) : [],
    };
  });
}

function generateGameName(includeCounter: boolean): string {
  const names = [
    'El',
    'Eld',
    'Tir',
    'Nef',
    'Eth',
    'Ith',
    'Tal',
    'Ral',
    'Ort',
    'Thul',
    'Amn',
    'Sol',
    'Shael',
    'Dol',
    'Hel',
    'Io',
    'Lum',
    'Ko',
    'Fal',
    'Lem',
    'Pul',
    'Um',
    'Mal',
    'Ist',
    'Gul',
    'Vex',
    'Ohm',
    'Lo',
    'Sur',
    'Ber',
    'Jah',
    'Cham',
    'Zod',
  ];

  const randomNames = Array.from({ length: 3 }).map(
    () => names[Math.floor(Math.random() * names.length)]
  );

  if (includeCounter) {
    randomNames.push('-1');
  }

  return randomNames.join('');
}
