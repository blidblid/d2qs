import { fakeAsync, TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { CrudApi } from '@berglund/firebase';
import { expectEmission } from '@berglund/rx/testing';
import { AuthService, GameService, QueryService, UserService } from '@d2qs/api';
import { Game, Query, User } from '@d2qs/model';
import {
  AngularFireDatabaseMock,
  AuthServiceMock,
  createGameServiceMock,
  createQueryServiceMock,
  createUserServiceMock,
} from '@d2qs/testing';
import { QueryRx } from './query.rx';

describe('query rx', () => {
  let queryRx: QueryRx;
  let gameServiceMock: jasmine.SpyObj<CrudApi<Game>>;
  let userServiceMock: jasmine.SpyObj<CrudApi<User>>;
  let queryServiceMock: jasmine.SpyObj<CrudApi<Query>>;

  beforeEach(() => {
    gameServiceMock = createGameServiceMock();
    userServiceMock = createUserServiceMock();
    queryServiceMock = createQueryServiceMock();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: GameService, useValue: gameServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: QueryService, useValue: queryServiceMock },
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
      expect(queryServiceMock.set).toHaveBeenCalledTimes(0);
      queryRx.queueTrigger$.next();
      expect(queryServiceMock.set).toHaveBeenCalledTimes(1);
    }));

    it('should remove a query after the leave trigger activates', fakeAsync(() => {
      expect(queryServiceMock.delete).toHaveBeenCalledTimes(0);
      queryRx.leaveTrigger$.next();
      expect(queryServiceMock.delete).toHaveBeenCalledTimes(1);
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
