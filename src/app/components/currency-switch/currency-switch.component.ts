import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { SelectButtonModule } from 'primeng/selectbutton';

import { Currency } from '../../models/conversion.model';
import { ConverterStore } from '../../store/converter.store';

@Component({
  selector: 'app-currency-switch',
  standalone: true,
  imports: [FormsModule, TranslocoPipe, SelectButtonModule],
  templateUrl: './currency-switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencySwitchComponent {
  readonly store = inject(ConverterStore);

  readonly currencyOptions = [
    { label: Currency.EUR, value: Currency.EUR },
    { label: Currency.USD, value: Currency.USD },
  ];

  onSegmentChange(next: Currency): void {
    if (next !== this.store.inputCurrency()) {
      this.store.toggleCurrency();
    }
  }
}
