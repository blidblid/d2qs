import { Lobby } from './lobby-model';
import { Query } from './query-model';

export function toLobbies(queries: Query[]): Lobby[] {
  const lobbies: Record<string, Lobby> = {};

  for (const query of [...queries].sort((a, b) => b.timestamp - a.timestamp)) {
    const identifier = [
      query.act,
      query.type,
      query.quest,
      query.region,
      query.runArea,
      query.difficulty,
      query.maxPlayers,
    ].join('');

    if (lobbies[identifier]) {
      lobbies[identifier].queries.push(query);
    } else {
      lobbies[identifier] = {
        ...query,
        queries: [query],
      };
    }
  }

  return Object.values(lobbies);
}

export function lobbyComparator(
  a: Lobby,
  b: Lobby,
  toString: (lobby: Lobby) => string,
  playerId?: string
) {
  if (a.queries.some((query) => query.playerId === playerId)) {
    return -1;
  }

  if (b.queries.some((query) => query.playerId === playerId)) {
    return 1;
  }

  return toString(a).localeCompare(toString(b));
}
