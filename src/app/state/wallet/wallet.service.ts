import { CoinsQuery } from './../coins/coins.query';
import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  catchError,
  distinctUntilChanged,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators';
import { Asset, WalletStore } from './wallet.store';
import { Subject, Observable, throwError } from 'rxjs';

export interface Data {
  /** Event Time */
  E: number;
  /** Symbol */
  s: string;
  /** Price */
  p: number;
  /** Trade time */
  T: number;
}

export interface BinanceStream {
  /** Stream name */
  stream: string;
  /** Stream data */
  data: Data;
}

@Injectable({ providedIn: 'root' })
export class WalletService implements OnDestroy {
  private unsubscriber = new Subject();

  constructor(
    private walletStore: WalletStore,
    private coinsQuery: CoinsQuery
  ) {}

  ngOnDestroy(): void {
    this.unsubscriber.next(false);
    this.unsubscriber.complete();
  }

  /**
   * Add a quantity of a Asset will be added
   * @public
   *
   * @param asset The Asset to buy
   * @param quantity The quantity
   */
  public buyAsset(asset: Asset, quantity: number): void {
    const state = this.walletStore.getValue();

    if (state) {
      const foundAsset = state.assets.find(a => a.symbol === asset.symbol);

      if (foundAsset) {
        foundAsset.quantity =
          foundAsset?.quantity == null
            ? quantity
            : foundAsset.quantity + quantity;

        state.assets.splice(
          state.assets.findIndex(a => a.symbol === asset.symbol),
          1
        );
        this.walletStore.update({
          assets: [...state.assets, foundAsset],
        });
      }
    }
  }

  /**
   * Create a WebSocket that will receive and update the Wallet Store
   * @public
   */
  public watchMarket(): Observable<BinanceStream> {
    let streams = '';
    this.coinsQuery.getValue().data.forEach(c => {
      streams += c.symbol.toLowerCase() + 'usdt@aggTrade' + '/';
    });

    streams = streams.substring(0, streams.length - 1);
    // const streams = 'btcusdt@aggTrade/ethbtcusdt@aggTrade';

    return webSocket<BinanceStream>(
      'wss://stream.binance.com:443/stream?streams=' + streams
    ).pipe(
      distinctUntilChanged(),
      throttleTime(1000),
      takeUntil(this.unsubscriber),
      tap((coin: BinanceStream) => this.walletStore.updateWallet(coin)),
      catchError(err => {
        this.walletStore.setError('Could not fetch users');
        return throwError(() => err);
      })
    );
  }
}
