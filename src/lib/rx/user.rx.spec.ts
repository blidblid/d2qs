import { fakeAsync, TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { expectEmission } from '@berglund/rx/testing';
import { AuthService, GameService, UserService } from '@d2qs/api';
import { BAAL } from '@d2qs/model';
import {
  AngularFireDatabaseMock,
  AuthServiceMock,
  createGameServiceMock,
  createUserServiceMock,
} from '@d2qs/testing';
import { UserRx } from './user.rx';

describe('user rx', () => {
  let userRx: UserRx;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: GameService, useFactory: createGameServiceMock },
        { provide: UserService, useFactory: createUserServiceMock },
        { provide: UserService, useFactory: createUserServiceMock },
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

  const expectError = (hasError: boolean) => {
    expectEmission(
      userRx.hasErrors$,
      (emittedError) => expect(emittedError).toBe(hasError),
      0
    );
  };
});
