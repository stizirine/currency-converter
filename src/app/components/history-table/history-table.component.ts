import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { resolveNumberLocale } from '../../i18n/number-locale';
import { ConverterStore } from '../../store/converter.store';

import { currencySymbol, historyQuoteRate } from './history-table.utils';

const HISTORY_COLUMN_KEYS = [
  'history.colTime',
  'history.colRealRate',
  'history.colApplied',
  'history.colIn',
  'history.colOut',
  'history.colType',
] as const;

@Component({
  selector: 'app-history-table',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TranslocoPipe, CardModule, TableModule, TagModule],
  templateUrl: './history-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryTableComponent {
  readonly columnKeys = HISTORY_COLUMN_KEYS;
  readonly currencySymbol = currencySymbol;
  readonly historyQuoteRate = historyQuoteRate;

  readonly store = inject(ConverterStore);
  private readonly transloco = inject(TranslocoService);

  numberLocale(): string {
    return resolveNumberLocale(this.transloco.getActiveLang());
  }
}
