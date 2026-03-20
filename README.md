# Convertisseur EUR / USD

SPA Angular (v21) : taux **simulé** (polling 3 s), conversion bidirectionnelle, taux fixe avec garde-fou **±2 %**, historique (5 entrées), i18n **FR/EN**. État global via **NgRx SignalStore** (`@ngrx/signals`), UI **PrimeNG** + **Transloco**.

Pistes d’évolution : [roadmap.md](roadmap.md).  
Raccourcis et dette : [todo.md](todo.md).

## Prérequis

- Node.js et npm (voir `packageManager` dans `package.json`)

## Commandes

```bash
npm install
npm start
```

Build production :

```bash
npm run build
```

Tests unitaires (Vitest via `@angular/build`):

```bash
npm test
```

## Stack

- Angular 21 (standalone, control flow `@if` / `@for`)
- `@ngrx/signals` : `signalStore`, `withState`, `withComputed`, `withMethods`, `withHooks`
- PrimeNG 21 + thème Aura (`@primeuix/themes`) — config centralisée [`src/app/primeng-app.config.ts`](src/app/primeng-app.config.ts) ([doc installation](https://primeng.org/installation), [configuration](https://primeng.org/configuration))
- `@jsverse/transloco` + fichiers dans `src/assets/i18n/`

## Structure utile

- `src/app/store/converter.store.ts` — logique métier et polling
- `src/app/models/conversion.model.ts` — types de conversion
- `src/app/components/converter/` — page principale (composition)
- `src/app/components/exchange-rate-display/`, `currency-switch/`, `fixed-rate-control/`, `history-table/` — sous-composants
- `src/app/services/transloco-loader.ts`, `src/app/transloco.config.ts` — i18n

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.5.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
