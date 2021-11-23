import { Query } from '../query/query-model';
import { Lobby } from './lobby-model';

export function toLobbies(queries: Query[]): Lobby[] {
  const lobbies: Record<string, Lobby> = {};

  for (const query of [...queries].sort((a, b) => b.timestamp - a.timestamp)) {
    const lobbyIdentifier = {
      act: query.act,
      type: query.type,
      quest: query.quest,
      areas: query.areas,
      region: query.region,
      runArea: query.runArea,
      difficulty: query.difficulty,
      maxPlayers: query.maxPlayers,
    };

    const identifier = JSON.stringify(lobbyIdentifier);

    if (lobbies[identifier]) {
      lobbies[identifier].queries.push(query);
    } else {
      lobbies[identifier] = {
        ...lobbyIdentifier,
        queries: [query],
      };
    }
  }

  return Object.values(lobbies);
}
