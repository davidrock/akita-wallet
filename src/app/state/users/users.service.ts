import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { User, UsersQuery } from '.';
import { UsersStore } from './users.store';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(
    private usersStore: UsersStore,
    private usersQuery: UsersQuery,
    private http: HttpClient
  ) {}

  /**
   * Get users list each time the Store invalidates its cache
   *
   * @public
   */
  public getCached(): Observable<User[]> {
    return this.usersQuery.selectHasCache().pipe(
      switchMap(hasCache => {
        const apiCall = this.http
          .get<User[]>('http://localhost:3000/users')
          .pipe(
            tap((users: User[]) => {
              this.usersStore.set(users);
              this.usersStore.setError(null);
            }),
            catchError(err => {
              this.usersStore.setError('Could not fetch users');
              return throwError(() => err);
            })
          );

        return hasCache ? EMPTY : apiCall;
      })
    );
  }
}
