import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { User } from '@d2qs/model';
import { of } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends CrudApi<User> {
  user$ = this.auth.firebaseUserId$.pipe(
    switchMap((userId) => {
      return userId ? this.get(userId) : of(null);
    }),
    shareReplay(1)
  );

  constructor(
    protected override injector: Injector,
    private auth: AuthService
  ) {
    super(injector, 'users', 'session');
  }
}
