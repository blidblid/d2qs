import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  firebaseUserId$: Observable<string | null> = this.auth.user
    .pipe(startWith(null))
    .pipe(map((user) => user && user.uid));

  isSignedIn$ = this.auth.user.pipe(
    map((user) => user !== null),
    startWith(true)
  );

  isSignedOut$ = this.isSignedIn$.pipe(map((isSignedIn) => !isSignedIn));

  constructor(private auth: AngularFireAuth) {
    this.auth.signInAnonymously();
  }
}
