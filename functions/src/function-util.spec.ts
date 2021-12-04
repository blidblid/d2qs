import { Area, Lobby, WORLDSTONE_KEEP } from '../../src/lib/model';
import { getUnassignedAreas, lobbyToPlayers } from './function-util';

describe('functions', () => {
  describe('mapping lobbies to players', () => {
    it('should assign unique areas to solo runners', () => {
      const players = lobbyToPlayers(LOBBY);

      for (const player of players) {
        for (const area of player.areas ?? []) {
          for (const otherPlayer of players) {
            if (player.nick === otherPlayer.nick) {
              continue;
            }

            expect(otherPlayer.areas).not.toContain(area);
          }
        }
      }
    });

    it('should assign group areas when solo areas are impossible', () => {
      const players = lobbyToPlayers(LOBBY_WITH_DUPLICATED_AREAS);

      for (const player of players) {
        expect(player.areas!.length).toBe(1);
      }
    });

    it('should list unassigned areas', () => {
      const players = lobbyToPlayers(LOBBY);
      const unassignedAreas = getUnassignedAreas(players);

      expect(unassignedAreas).toContain(WORLDSTONE_KEEP);
    });
  });
});

const LOBBY: Lobby = {
  areas: ['ancient_tunnels', 'andariel', 'arcane_sanctuary'],
  difficulty: 'nightmare',
  maxPlayers: 5,
  queries: [
    {
      areas: [
        'ancient_tunnels',
        'andariel',
        'arcane_sanctuary',
        'baal',
        'countess',
        'cow',
        'diablo',
        'lower_kurast',
        'mausoleum',
        'nihlathak',
        'mephisto',
        'pit',
        'river_of_flame',
      ],
      difficulty: 'nightmare',
      id: 'ZcXGdREkQchB10lArfWiCAMkHSM2',
      maxPlayers: 5,
      nick: 'blid',
      playerId: 'ZcXGdREkQchB10lArfWiCAMkHSM2',
      region: 'eu',
      timestamp: 1637522487385,
      type: 'farm',
    },
    {
      areas: [
        'ancient_tunnels',
        'andariel',
        'arcane_sanctuary',
        'baal',
        'countess',
        'mausoleum',
        'nihlathak',
        'mephisto',
        'pit',
        'river_of_flame',
      ],
      difficulty: 'nightmare',
      id: 'wsf7zOCdqWNBTNfE6qSzYSvSxzg2',
      maxPlayers: 5,
      nick: 'pastaman',
      playerId: 'wsf7zOCdqWNBTNfE6qSzYSvSxzg2',
      region: 'eu',
      timestamp: 1637522480822,
      type: 'farm',
    },
    {
      areas: [
        'ancient_tunnels',
        'andariel',
        'arcane_sanctuary',
        'baal',
        'countess',
        'cow',
        'diablo',
        'lower_kurast',
        'mausoleum',
        'nihlathak',
        'mephisto',
        'pit',
        'river_of_flame',
      ],
      difficulty: 'nightmare',
      id: 'fTf8N0WGFKQdaDUmoZ4rndG3nV73',
      maxPlayers: 5,
      nick: 'Gadd',
      playerId: 'fTf8N0WGFKQdaDUmoZ4rndG3nV73',
      region: 'eu',
      timestamp: 1637522461619,
      type: 'farm',
    },
    {
      areas: [
        'ancient_tunnels',
        'andariel',
        'arcane_sanctuary',
        'baal',
        'countess',
        'cow',
        'diablo',
        'lower_kurast',
        'mausoleum',
        'nihlathak',
        'mephisto',
        'pit',
        'river_of_flame',
      ],
      difficulty: 'nightmare',
      id: 'fTf8N0WGFKQdaDUmoZ4rndG3nV74',
      maxPlayers: 5,
      nick: 'Fei',
      playerId: 'fTf8N0WGFKQdaDUmoZ4rndG3nV73',
      region: 'eu',
      timestamp: 1637522461619,
      type: 'farm',
    },
    {
      areas: [
        'ancient_tunnels',
        'andariel',
        'arcane_sanctuary',
        'baal',
        'countess',
        'cow',
        'diablo',
        'lower_kurast',
        'mausoleum',
        'nihlathak',
        'mephisto',
        'pit',
        'river_of_flame',
      ],
      difficulty: 'nightmare',
      id: 'fTf8N0WGFKQdaDUmoZ4rndG3nV74',
      maxPlayers: 5,
      nick: 'Noa',
      playerId: 'fTf8N0WGFKQdaDUmoZ4rndG3nV75',
      region: 'eu',
      timestamp: 1637522461619,
      type: 'farm',
    },
  ],
  region: 'eu',
  type: 'farm',
};

const DUPLICATED_AREAS: Area[] = ['baal', 'diablo', 'mephisto'];

const LOBBY_WITH_DUPLICATED_AREAS: Lobby = {
  ...LOBBY,
  queries: LOBBY.queries.map((query) => {
    return {
      ...query,
      areas: DUPLICATED_AREAS,
    };
  }),
};
