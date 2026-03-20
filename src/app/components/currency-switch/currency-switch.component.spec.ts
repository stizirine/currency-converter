import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, expect, it, vi } from 'vitest';

import { Currency } from '../../models/conversion.model';
import { ConverterStore } from '../../store/converter.store';
import { CurrencySwitchComponent } from './currency-switch.component';

describe('CurrencySwitchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CurrencySwitchComponent,
        TranslocoTestingModule.forRoot({ langs: { fr: {} }, preloadLangs: true }),
      ],
      providers: [ConverterStore],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CurrencySwitchComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('onSegmentChange appelle toggleCurrency si la devise change', () => {
    const fixture = TestBed.createComponent(CurrencySwitchComponent);
    const store = TestBed.inject(ConverterStore);
    const spy = vi.spyOn(store, 'toggleCurrency');
    fixture.componentInstance.onSegmentChange(Currency.USD);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('onSegmentChange ignore la même devise', () => {
    const fixture = TestBed.createComponent(CurrencySwitchComponent);
    const store = TestBed.inject(ConverterStore);
    const spy = vi.spyOn(store, 'toggleCurrency');
    fixture.componentInstance.onSegmentChange(Currency.EUR);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
