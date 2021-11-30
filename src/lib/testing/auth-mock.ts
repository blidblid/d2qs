import { of } from 'rxjs';

export const MOCK_USER_ID = 'userId';

export class AuthServiceMock {
  firebaseUserId$ = of(MOCK_USER_ID);
  isSignedIn$ = of(true);
  isSignedOut$ = of(false);
}
