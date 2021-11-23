import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseUser$ = this.auth.user.pipe(startWith(null));

  isSignedIn$ = this.auth.user.pipe(
    map((user) => user !== null),
    startWith(true)
  );

  isSignedOut$ = this.isSignedIn$.pipe(map((isSignedIn) => !isSignedIn));

  constructor(private auth: AngularFireAuth) {
    this.auth.signInAnonymously();
  }
}
