import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { CrudApi } from '@berglund/firebase';
import { expectEmission } from '@berglund/rx/testing';
import { AuthApi, GameApi, QueryApiFactory, UserApi } from '@d2qs/api';
import { BAAL, Game, Query, User } from '@d2qs/model';
import {
  AngularFireDatabaseMock,
  AuthServiceMock,
  createGameApiMock,
  createQueryApiFactoryMock,
  createQueryApiMock,
  createUserApiMock,
  MOCK_USER_DATABASE,
  MOCK_USER_ID,
} from '@d2qs/testing';
import { UserRx } from './user.rx';

describe('user rx', () => {
  let userRx: UserRx;
  let gameApiMock: jasmine.SpyObj<CrudApi<Game>>;
  let userApiMock: jasmine.SpyObj<CrudApi<User>>;
  let queryApiMock: jasmine.SpyObj<CrudApi<Query>>;
  let queryApiFactoryMock: jasmine.SpyObj<QueryApiFactory>;

  beforeEach(() => {
    gameApiMock = createGameApiMock();
    userApiMock = createUserApiMock();
    queryApiMock = createQueryApiMock();
    queryApiFactoryMock = createQueryApiFactoryMock(queryApiMock);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useClass: AuthServiceMock },
        { provide: GameApi, useValue: gameApiMock },
        { provide: UserApi, useValue: userApiMock },
        { provide: QueryApiFactory, useValue: queryApiFactoryMock },
        {
          provide: AngularFireDatabase,
          useClass: AngularFireDatabaseMock,
        },
      ],
    });

    userRx = TestBed.inject(UserRx);
  });

  describe('validation', () => {
    it('should validate nick', fakeAsync(() => {
      userRx.nick$.next('A');
      expectError(true);
    }));

    it('should validate areas', fakeAsync(() => {
      userRx.areas$.next([BAAL]);
      expectError(true);
    }));
  });

  describe('api calls', () => {
    it('should update user info', fakeAsync(() => {
      const nick = 'Connor';
      userRx.nick$.next(nick);
      tick(0);

      expect(userApiMock.update).toHaveBeenCalledWith(MOCK_USER_ID, {
        nick,
        region: MOCK_USER_DATABASE[MOCK_USER_ID].region,
        areas: MOCK_USER_DATABASE[MOCK_USER_ID].areas,
        refreshMode: MOCK_USER_DATABASE[MOCK_USER_ID].refreshMode,
        hintsMode: MOCK_USER_DATABASE[MOCK_USER_ID].hintsMode,
        platform: MOCK_USER_DATABASE[MOCK_USER_ID].platform,
        switchFriendCode: MOCK_USER_DATABASE[MOCK_USER_ID].switchFriendCode,
        playStationId: MOCK_USER_DATABASE[MOCK_USER_ID].playStationId,
        xboxGamertag: MOCK_USER_DATABASE[MOCK_USER_ID].xboxGamertag,
      });
    }));
  });

  const expectError = (hasError: boolean) => {
    expectEmission(
      userRx.hasErrors$,
      (emittedError) => expect(emittedError).toBe(hasError),
      0
    );
  };
});
