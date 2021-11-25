import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { environment } from '../../src/environments/environment.prod';
import {
  Area,
  FARM,
  Game,
  Lobby,
  Player,
  Query,
  QUEST,
  toLobbies,
} from '../../src/lib/model';

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
  const numberOfAreas = 2;
  const playerDensity: Partial<Record<Area, number>> = {};
  const preferenceDensity: Partial<Record<Area, number>> = {};

  if (lobby.type === 'farm') {
    for (const query of lobby.queries) {
      for (const area of query.areas) {
        preferenceDensity[area] = (preferenceDensity[area] ?? 0) + 1;
      }
    }
  }

  function assignAreas(query: Query): Area[] {
    const areas = shuffleArray(query.areas)
      .sort((a, b) => {
        return (
          (preferenceDensity[a] ?? 0) -
          (preferenceDensity[b] ?? 0) +
          (playerDensity[a] ?? 0) -
          (playerDensity[b] ?? 0)
        );
      })
      .slice(0, numberOfAreas)
      .sort();

    for (const area of areas) {
      playerDensity[area] = (playerDensity[area] ?? 0) + 1;
    }

    return areas;
  }

  return lobby.queries.map((query) => {
    return {
      nick: query.nick,
      areas: query.type === 'farm' ? assignAreas(query) : [],
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

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
