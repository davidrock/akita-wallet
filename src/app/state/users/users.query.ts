import { User } from './user.model';
import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { UsersStore, UsersState } from './users.store';

@Injectable({ providedIn: 'root' })
export class UsersQuery extends QueryEntity<UsersState> {
  users$: Observable<User[]>;

  constructor(protected override store: UsersStore) {
    super(store);

    this.users$ = this.selectAll();
  }
}
