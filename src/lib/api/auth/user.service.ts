import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { User } from '@d2qs/model';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends CrudApi<User> {
  user$ = this.auth.firebaseUser$.pipe(
    switchMap((user) => {
      return user ? this.get(user.uid) : of(null);
    }),
    shareReplay(1)
  );

  constructor(protected injector: Injector, private auth: AuthService) {
    super(injector, 'users', 'session');
  }

  getInitialProperty<T extends keyof User>(
    property: T,
    defaultValue: User[T]
  ): Observable<User[T]> {
    return this.auth.firebaseUser$.pipe(
      switchMap((user) => {
        return user
          ? this.getProperty(user.uid, property).pipe(
              map((property) => property ?? defaultValue),
              take(1)
            )
          : of(defaultValue);
      })
    );
  }
}
