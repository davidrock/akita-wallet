import { WalletQuery } from './state/wallet/wallet.query';
import { WalletService } from './state/wallet/wallet.service';
import { User } from './state/users/user.model';
import { UsersQuery } from './state/users/users.query';
import { CoinsQuery } from './state/coins/coins.query';
import { Component, OnInit } from '@angular/core';
import { CoinsService } from './state/coins';
import { Observable } from 'rxjs';
import { Coin } from './state/coins/coins.store';
import { UsersService } from './state/users';
import { WalletState } from './state/wallet';
import { Asset } from './state/wallet/wallet.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  allCoins$: Observable<Coin[]>;
  users$: Observable<User[]>;
  wallet$: Observable<WalletState>;

  constructor(
    private coinsService: CoinsService,
    private coinsQuery: CoinsQuery,
    private usersQuery: UsersQuery,
    private userService: UsersService,
    private walletService: WalletService,
    private walletQuery: WalletQuery
  ) {
    this.allCoins$ = this.coinsQuery.allCoins$;
    this.users$ = this.usersQuery.users$;
    this.wallet$ = this.walletQuery.wallet$;
  }

  ngOnInit(): void {
    this.userService.getCached().subscribe();
    this.coinsService.getAutoCache().subscribe();
    this.walletService.watchMarket().subscribe();
  }

  /**
   * Adds a quantity of a given asset in the Store
   * @param asset The asset to be invested
   */
  invest(asset: Asset) {
    console.log(asset);
    const value = prompt('How much do you to buy (' + asset.symbol + ')', '');
    if (value) {
      this.walletService.buyAsset(asset, parseInt(value));
    }
  }
}
