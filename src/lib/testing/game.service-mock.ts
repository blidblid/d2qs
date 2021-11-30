import { CrudApi } from '@berglund/firebase';
import { createCrudApiSpyObj } from '@berglund/firebase/testing';
import { Game } from '@d2qs/model';

export function createGameServiceMock(): jasmine.SpyObj<CrudApi<Game>> {
  return createCrudApiSpyObj<Game>({});
}
