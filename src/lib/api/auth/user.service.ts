import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { User } from '@d2qs/model';
import { of } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { AuthApi } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserApi extends CrudApi<User> {
  user$ = this.auth.firebaseUserId$.pipe(
    switchMap((userId) => {
      return userId ? this.get(userId) : of(null);
    }),
    shareReplay(1)
  );

  constructor(protected override injector: Injector, private auth: AuthApi) {
    super(injector, 'users', 'session');
  }
}
