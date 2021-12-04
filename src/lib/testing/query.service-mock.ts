import { CrudApi } from '@berglund/firebase';
import { createCrudApiSpyObj } from '@berglund/firebase/testing';
import { Query } from '@d2qs/model';

export function createQueryApiMock(): jasmine.SpyObj<CrudApi<Query>> {
  return createCrudApiSpyObj<Query>({});
}
