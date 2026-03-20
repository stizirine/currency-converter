import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { Currency } from '../../models/conversion.model';
import { resolveNumberLocale } from '../../i18n/number-locale';
import { ConverterStore, INITIAL_EUR_USD_RATE } from '../../store/converter.store';
import { invertRate } from '../../store/converter.utils';

function displayRatesEqual(a: number | null, b: number | null): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return Math.abs(a - b) < 1e-5;
}

@Component({
  selector: 'app-fixed-rate-control',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    TranslocoPipe,
    CardModule,
    InputNumberModule,
    MessageModule,
    TagModule,
    ToggleSwitchModule,
  ],
  templateUrl: './fixed-rate-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedRateControlComponent {
  readonly Currency = Currency;
  readonly helpExampleEurUsd = INITIAL_EUR_USD_RATE;
  readonly helpExampleUsdEur = invertRate(INITIAL_EUR_USD_RATE);
  readonly store = inject(ConverterStore);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly fixedForm = this.fb.group({
    enabled: this.fb.nonNullable.control(this.store.isFixedRateActive()),
    rate: this.fb.control<number | null>(this.store.displayFixedExchangeRate()),
  });

  constructor() {
    if (!this.store.isFixedRateActive()) {
      this.fixedForm.controls.rate.disable({ emitEvent: false });
    }

    effect(() => {
      const fromStore = this.store.isFixedRateActive();
      const enabled = this.fixedForm.controls.enabled;
      if (enabled.value !== fromStore) {
        enabled.setValue(fromStore, { emitEvent: false });
      }
    });

    effect(() => {
      const active = this.store.isFixedRateActive();
      const rateCtrl = this.fixedForm.controls.rate;
      if (active) {
        if (rateCtrl.disabled) {
          rateCtrl.enable({ emitEvent: false });
        }
      } else if (rateCtrl.enabled) {
        rateCtrl.disable({ emitEvent: false });
      }
    });

    effect(() => {
      const display = this.store.displayFixedExchangeRate();
      const rateCtrl = this.fixedForm.controls.rate;
      if (!displayRatesEqual(rateCtrl.value, display)) {
        rateCtrl.setValue(display, { emitEvent: false });
      }
    });

    this.fixedForm.controls.enabled.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((active) => {
        this.store.setFixedRateActive(active);
        const synced = this.store.isFixedRateActive();
        const en = this.fixedForm.controls.enabled;
        if (en.value !== synced) {
          en.setValue(synced, { emitEvent: false });
        }
      });

    this.fixedForm.controls.rate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        if (this.fixedForm.controls.rate.disabled) {
          return;
        }
        this.store.applyFixedRateFromUi(v);
      });
  }

  numberLocale(): string {
    return resolveNumberLocale(this.transloco.getActiveLang());
  }

  dismissDeviationBanner(): void {
    this.store.acknowledgeAutoFixedDisable();
  }
}
