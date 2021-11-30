import { fakeAsync, TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { expectEmission } from '@berglund/rx/testing';
import { AuthService, GameService, QueryService, UserService } from '@d2qs/api';
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: GameService, useFactory: createGameServiceMock },
        { provide: QueryService, useFactory: createQueryServiceMock },
        { provide: UserService, useFactory: createUserServiceMock },
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

  const expectError = (hasError: boolean) => {
    expectEmission(
      queryRx.hasErrors$,
      (emittedError) => expect(emittedError).toBe(hasError),
      0
    );
  };
});
