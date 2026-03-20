# TODO

## État aligné sur le code (rappel)

- **UI** : `ConverterComponent` et `FixedRateControlComponent` utilisent des **`FormGroup` / Reactive Forms** (plus de `ngModel` sur ces écrans).
- **i18n** : libellés des options de langue via **`nav.langOption.fr` / `nav.langOption.en`** dans `assets/i18n` (pas de texte en dur dans le TS).
- **`ConverterComponent` — tests** : specs présents (création, `activeLang` / `numberLocale`, `setLang`, affichage alerte déviation + montant, clic « Ajouter à l’historique »).

## Raccourcis / dette assumée

- **Tests** : uniquement **Vitest** via `ng test` (`@angular/build:unit-test`) — pas de Karma dans ce dépôt.
- **Budget `angular.json` (production)** : bundle **initial** — `maximumWarning` **1,5 Mo**, `maximumError` **2 Mo** (le bundle brut PrimeNG + app dépasse largement un plafond type 500 kB). La taille **transfer** annoncée par le build reste ~**220 kB** — à affiner avec `source-map-explorer` si un plafond strict est requis.
- **Polling** : intervalle actif dès l’injection du `ConverterStore` (y compris en tests). Les specs **`converter.store`** et **`fixed-rate-control`** utilisent `TestBed.resetTestingModule` en **`afterEach`** pour limiter les effets de bord ; **`converter.component`** ne réinitialise qu’en **`afterAll`** (acceptable car peu de ticks sur la durée du fichier).
- **Taux simulé** : pas d’API FX réelle ; fluctuations pseudo-aléatoires côté client uniquement.
- **Historique** : ajout **manuel** via le bouton (cohérent avec le PRD) ; pas d’enregistrement automatique à chaque frappe.
- **Seuil 2 %** : comparaison en double précision flottante ; cas « exactement 2 % » pouvant se borer sur des effets FP (test couvert avec une valeur &lt; 2 %).

## Améliorations prévues (toujours d’actualité)

- **Tests** : aller plus loin que les specs actuelles — ex. **`converterForm`** (sélecteur langue + `p-inputnumber` montant), scénario **garde 2 % + switch** de bout en bout ; éventuels tests d’intégration / E2E du flux complet.
- **`provideZonelessChangeDetection`** : non activé dans `app.config.ts` ; à valider si besoin perf / finition quand les templates stabilisent.
- **Persistance** : pas de `localStorage` aujourd’hui — langue active et dernier taux fixe pourraient y être sauvegardés.
- **Accessibilité** : revue WCAG (contraste thème Aura, focus / overlays PrimeNG).
- **Bundle** : lazy-load d’une route « historique » ou allègement PrimeNG / HTML natif si un budget strict devient obligatoire.
