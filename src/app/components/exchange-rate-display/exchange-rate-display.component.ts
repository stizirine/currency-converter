import { DecimalPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { interval } from 'rxjs';

import { Currency, RateDirection } from '../../models/conversion.model';
import { resolveNumberLocale } from '../../i18n/number-locale';
import { ConverterStore } from '../../store/converter.store';

@Component({
  selector: 'app-exchange-rate-display',
  standalone: true,
  imports: [CardModule, TagModule, DecimalPipe, NgClass, TranslocoPipe],
  templateUrl: './exchange-rate-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeRateDisplayComponent {
  readonly Currency = Currency;
  readonly RateDirection = RateDirection;
  readonly store = inject(ConverterStore);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly secondsSinceSync = signal(0);
  private readonly lastPollAt = signal(Date.now());

  constructor() {
    effect(() => {
      this.store.realExchangeRate();
      untracked(() => this.lastPollAt.set(Date.now()));
    });

    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const elapsed = Math.floor((Date.now() - this.lastPollAt()) / 1000);
        this.secondsSinceSync.set(elapsed);
      });
  }

  numberLocale(): string {
    return resolveNumberLocale(this.transloco.getActiveLang());
  }

  directionTranslationKey(): string {
    switch (this.store.displayRateDirection()) {
      case RateDirection.Up:
        return 'rate.up';
      case RateDirection.Down:
        return 'rate.down';
      default:
        return 'rate.stable';
    }
  }
}
