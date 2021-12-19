import { Area, FARM_AREAS, Lobby, Player, Query } from '../../src/lib/model';

export function lobbyToPlayers(lobby: Lobby): Player[] {
  if (lobby.type !== 'farm') {
    return lobby.queries.map(queryToPlayer);
  }

  const players: Player[] = [];
  const areasInPreference = new Set<Area>();
  const areasByQuery = new Map<Query, Area[]>();
  const playerDensity: Partial<Record<Area, number>> = {};
  const preferenceDensity: Partial<Record<Area, number>> = {};

  for (const query of lobby.queries) {
    areasByQuery.set(query, []);

    for (const area of query.areas ?? []) {
      areasInPreference.add(area);
      preferenceDensity[area] = (preferenceDensity[area] ?? 0) + 1;
    }
  }

  const numberOfAreas = Math.max(
    1,
    Math.floor(areasInPreference.size / lobby.maxPlayers)
  );

  while (areasByQuery.size > 0) {
    for (const query of areasByQuery.keys()) {
      const areas = areasByQuery.get(query)!;
      const pool = (query.areas ?? []).filter((area) => !areas.includes(area));

      if (pool.length > 0 && areas.length < numberOfAreas) {
        const area = pickArea(pool);
        playerDensity[area] = (playerDensity[area] ?? 0) + 1;
        areas.push(area);
      } else {
        players.push({ ...queryToPlayer(query), areas });
        areasByQuery.delete(query);
      }
    }
  }

  return players;

  /**
   * Picks an area to spread players out. Prioritize picking areas that:
   *  - are preferred by few players
   *  - have few players assigned to them
   */
  function pickArea(areas: Area[]): Area {
    return shuffleArray(areas)
      .sort((a, b) => {
        return (preferenceDensity[a] ?? 0) - (preferenceDensity[b] ?? 0);
      })
      .sort((a, b) => {
        return (playerDensity[a] ?? 0) - (playerDensity[b] ?? 0);
      })[0];
  }

  function queryToPlayer(query: Query): Player {
    const player: Player = {
      nick: query.nick,
    };

    if (query.switchFriendCode) {
      player.switchFriendCode = query.switchFriendCode;
    }

    if (query.playStationId) {
      player.playStationId = query.playStationId;
    }

    if (query.xboxGamertag) {
      player.xboxGamertag = query.xboxGamertag;
    }

    return player;
  }
}

export function getUnassignedAreas(players: Player[]): Area[] {
  return FARM_AREAS.filter((area) => {
    return players.every((player) => {
      return !player.areas || !player.areas.includes(area);
    });
  });
}

export function generateGameName(includeCounter: boolean): string {
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
