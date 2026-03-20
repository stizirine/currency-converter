import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

export const appPrimeNG = providePrimeNG({
  ripple: true,
  inputVariant: 'outlined',
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
});
