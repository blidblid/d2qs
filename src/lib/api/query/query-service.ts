import { Injectable, Injector } from '@angular/core';
import { CrudApi } from '@berglund/firebase';
import { Observable } from 'rxjs';
import { Query } from '../../model/query-model';

@Injectable({ providedIn: 'root' })
export class QueryService extends CrudApi<Query> {
  constructor(protected override injector: Injector) {
    super(injector, 'queries', 'session');
  }

  override set(id: string, query: Query): Observable<void> {
    return super.set(id, this.minifyQuery(query));
  }

  private minifyQuery(query: Query): Query {
    const minified = { ...query };

    if (minified.type !== 'duel') {
      delete minified.maxLevel;
    }

    if (minified.type !== 'farm') {
      delete minified.areas;
    }

    if (minified.type !== 'quest') {
      delete minified.act;
      delete minified.quest;
    }

    if (minified.type !== 'run') {
      delete minified.runArea;
    }

    return minified;
  }
}
