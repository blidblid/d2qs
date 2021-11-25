import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { Query } from '../../model/query-model';

@Injectable({ providedIn: 'root' })
export class QueryService extends CrudApi<Query> {
  constructor(protected injector: Injector) {
    super(injector, 'queries', 'session');
  }
}
