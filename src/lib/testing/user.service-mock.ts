import { CrudApi } from '@berglund/firebase';
import { createCrudApiSpyObj } from '@berglund/firebase/testing';
import { ANCIENT_TUNNELS, MAUSOLEUM, TRAVINCAL, User } from '@d2qs/model';
import { MOCK_USER_ID } from './auth-mock';

export const MOCK_USER_NICK = 'Mitch';

export const MOCK_USER_DATABASE: Record<string, User> = {
  [MOCK_USER_ID]: {
    nick: MOCK_USER_NICK,
    id: MOCK_USER_ID,
    areas: [ANCIENT_TUNNELS, MAUSOLEUM, TRAVINCAL],
    hintsMode: 'always',
    refreshMode: 'auto',
    platform: 'pc',
    region: 'eu',
    switchFriendCode: '',
    playStationId: '',
    xboxGamertag: '',
  },
};

export function createUserApiMock(): jasmine.SpyObj<CrudApi<User>> {
  return createCrudApiSpyObj<User>(MOCK_USER_DATABASE);
}
