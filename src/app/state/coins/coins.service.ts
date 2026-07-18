import { CoinsState } from './coins.store';
import { CoinsQuery } from './coins.query';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, switchMap, tap, Observable } from 'rxjs';
import { cacheable } from '@datorama/akita';
import { CoinsStore } from '.';

@Injectable({ providedIn: 'root' })
export class CoinsService {
  ENDPOINT = 'http://localhost:3000/coins';

  constructor(
    private coinsStore: CoinsStore,
    private coinsQuery: CoinsQuery,
    private http: HttpClient
  ) {}

  /**
   * Simply gets the coins once and update the Store
   * @@public
   */
  public get(): void {
    this.http
      .get(this.ENDPOINT)
      .subscribe(coins => this.coinsStore.update(coins));
  }

  /**
   * Returns chached value if it exists and it is valid
   * @public
   */
  public getCached(): void {
    const request$ = this.http
      .get(this.ENDPOINT)
      .pipe(tap(coins => this.coinsStore.update(coins)));

    cacheable(this.coinsStore, request$);
  }

  /**
   * Get ocins list each time the Store invalidates its cache
   *
   * @public
   */
  getAutoCache(): Observable<CoinsState> {
    return this.coinsQuery.selectHasCache().pipe(
      switchMap(hasCache => {
        const apiCall = this.http.get<CoinsState>(this.ENDPOINT).pipe(
          tap((coins: CoinsState) => {
            this.coinsStore.update(coins);
            this.coinsStore.setHasCache(true, { restartTTL: true });
          })
        );

        return hasCache ? EMPTY : apiCall;
      })
    );
  }
}
