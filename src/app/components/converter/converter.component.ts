import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';

import { Currency, TranslocoLang } from '../../models/conversion.model';
import { resolveNumberLocale } from '../../i18n/number-locale';
import { AppConfigStore } from '../../store/app-config.store';
import { ConverterStore } from '../../store/converter.store';
import { CurrencySwitchComponent } from '../currency-switch/currency-switch.component';
import { ExchangeRateDisplayComponent } from '../exchange-rate-display/exchange-rate-display.component';
import { FixedRateControlComponent } from '../fixed-rate-control/fixed-rate-control.component';
import { HistoryTableComponent } from '../history-table/history-table.component';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    NgTemplateOutlet,
    TranslocoPipe,
    ToolbarModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    ExchangeRateDisplayComponent,
    CurrencySwitchComponent,
    FixedRateControlComponent,
    HistoryTableComponent,
  ],
  templateUrl: './converter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterComponent {
  readonly Currency = Currency;
  readonly store = inject(ConverterStore);
  readonly configStore = inject(AppConfigStore);
  private readonly transloco = inject(TranslocoService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly langCodes: readonly TranslocoLang[] = [TranslocoLang.Fr, TranslocoLang.En];

  readonly langSelectOptions = computed(() => {
    this.configStore.activeLang();
    return this.langCodes.map((code) => ({
      value: code,
      label: this.transloco.translate('nav.langOption.' + code),
    }));
  });

  readonly converterForm = this.fb.group({
    lang: this.fb.nonNullable.control(this.configStore.activeLang()),
    amount: this.fb.nonNullable.control(this.store.inputAmount()),
  });

  constructor() {
    effect(() => {
      const lang = this.configStore.activeLang();
      const ctrl = this.converterForm.controls.lang;
      if (ctrl.value !== lang) {
        ctrl.setValue(lang, { emitEvent: false });
      }
    });

    effect(() => {
      const amount = this.store.inputAmount();
      const ctrl = this.converterForm.controls.amount;
      if (ctrl.value !== amount) {
        ctrl.setValue(amount, { emitEvent: false });
      }
    });

    this.converterForm.controls.amount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.store.setInputAmount(v ?? 0));

    this.converterForm.controls.lang.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((code) => this.setLang(code));
  }

  activeLang(): TranslocoLang {
    return this.configStore.activeLang();
  }

  setLang(code: string): void {
    if (code === TranslocoLang.En || code === TranslocoLang.Fr) {
      this.configStore.setActiveLang(code);
    }
  }

  numberLocale(): string {
    return resolveNumberLocale(this.configStore.activeLang());
  }
}
