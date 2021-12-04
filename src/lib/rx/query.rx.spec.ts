import { fakeAsync, TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { CrudApi } from '@berglund/firebase';
import { expectEmission } from '@berglund/rx/testing';
import { AuthApi, GameApi, QueryApi, UserApi } from '@d2qs/api';
import { Game, Query, User } from '@d2qs/model';
import {
  AngularFireDatabaseMock,
  AuthServiceMock,
  createGameApiMock,
  createQueryApiMock,
  createUserApiMock,
} from '@d2qs/testing';
import { QueryRx } from './query.rx';

describe('query rx', () => {
  let queryRx: QueryRx;
  let gameApiMock: jasmine.SpyObj<CrudApi<Game>>;
  let userApiMock: jasmine.SpyObj<CrudApi<User>>;
  let queryApiMock: jasmine.SpyObj<CrudApi<Query>>;

  beforeEach(() => {
    gameApiMock = createGameApiMock();
    userApiMock = createUserApiMock();
    queryApiMock = createQueryApiMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useClass: AuthServiceMock },
        { provide: GameApi, useValue: gameApiMock },
        { provide: UserApi, useValue: userApiMock },
        { provide: QueryApi, useValue: queryApiMock },
        {
          provide: AngularFireDatabase,
          useClass: AngularFireDatabaseMock,
        },
      ],
    });

    queryRx = TestBed.inject(QueryRx);
  });

  describe('validation', () => {
    it('should validate max players', fakeAsync(() => {
      queryRx.maxPlayers$.next(9);
      expectError(true);
    }));

    it('should validate max level', fakeAsync(() => {
      queryRx.maxLevel$.next(100);
      expectError(true);
    }));
  });

  describe('api calls', () => {
    it('should set a query after the queue trigger activates', fakeAsync(() => {
      expect(queryApiMock.set).toHaveBeenCalledTimes(0);
      queryRx.queueTrigger$.next();
      expect(queryApiMock.set).toHaveBeenCalledTimes(1);
    }));

    it('should remove a query after the leave trigger activates', fakeAsync(() => {
      expect(queryApiMock.delete).toHaveBeenCalledTimes(0);
      queryRx.leaveTrigger$.next();
      expect(queryApiMock.delete).toHaveBeenCalledTimes(1);
    }));
  });

  const expectError = (hasError: boolean) => {
    expectEmission(
      queryRx.hasErrors$,
      (emittedError) => expect(emittedError).toBe(hasError),
      0
    );
  };
});
