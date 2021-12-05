import { CrudApi } from '@berglund/firebase';
import { createCrudApiSpyObj } from '@berglund/firebase/testing';
import { QueryApi, QueryApiFactory } from '@d2qs/api';
import { Query } from '@d2qs/model';
import createSpyObj = jasmine.createSpyObj;

export function createQueryApiMock(): jasmine.SpyObj<CrudApi<Query>> {
  return createCrudApiSpyObj<Query>({});
}

export function createQueryApiFactoryMock(
  queryApiMock: CrudApi<Query>
): jasmine.SpyObj<QueryApiFactory> {
  const spyObj = createSpyObj<QueryApiFactory>('QueryApiFactory', ['getApi']);
  spyObj.getApi.and.returnValue(queryApiMock as QueryApi);

  return spyObj;
}
