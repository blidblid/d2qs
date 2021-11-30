import { CrudApi } from '@berglund/firebase';
import { createCrudApiSpyObj } from '@berglund/firebase/testing';
import { User } from '@d2qs/model';
import { MOCK_USER_ID } from './auth-mock';

export const MOCK_USER_NICK = 'Mitch';

export function createUserServiceMock(): jasmine.SpyObj<CrudApi<User>> {
  return createCrudApiSpyObj<User>({
    [MOCK_USER_ID]: {
      nick: MOCK_USER_NICK,
      id: MOCK_USER_ID,
      areas: [],
      refreshMode: 'auto',
      region: 'eu',
    },
  });
}
