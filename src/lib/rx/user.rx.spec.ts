import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { CrudApi } from '@berglund/firebase';
import { expectEmission } from '@berglund/rx/testing';
import { AuthApi, GameApi, QueryApi, UserApi } from '@d2qs/api';
import { BAAL, Game, Query, User } from '@d2qs/model';
import {
  AngularFireDatabaseMock,
  AuthServiceMock,
  createGameApiMock,
  createQueryApiMock,
  createUserApiMock,
  MOCK_USER_DATABASE,
  MOCK_USER_ID,
} from '@d2qs/testing';
import { UserRx } from './user.rx';

describe('user rx', () => {
  let userRx: UserRx;
  let gameServiceMock: jasmine.SpyObj<CrudApi<Game>>;
  let userServiceMock: jasmine.SpyObj<CrudApi<User>>;
  let queryServiceMock: jasmine.SpyObj<CrudApi<Query>>;

  beforeEach(() => {
    gameServiceMock = createGameApiMock();
    userServiceMock = createUserApiMock();
    queryServiceMock = createQueryApiMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useClass: AuthServiceMock },
        { provide: GameApi, useValue: gameServiceMock },
        { provide: UserApi, useValue: userServiceMock },
        { provide: QueryApi, useValue: queryServiceMock },
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

      expect(userServiceMock.update).toHaveBeenCalledWith(MOCK_USER_ID, {
        nick,
        region: MOCK_USER_DATABASE[MOCK_USER_ID].region,
        areas: MOCK_USER_DATABASE[MOCK_USER_ID].areas,
        refreshMode: MOCK_USER_DATABASE[MOCK_USER_ID].refreshMode,
        hintsMode: MOCK_USER_DATABASE[MOCK_USER_ID].hintsMode,
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
