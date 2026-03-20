# Roadmap — idées de backlog

1. **Taux réels** : intégration API (ex. ECB, Open Exchange Rates) avec cache et clé serveur / proxy pour ne pas exposer de secret.
2. **Multi-devises** : GBP, CHF, JPY, sélection de paires et favoris.
3. **Graphiques** : courbe du taux simulé ou historique API (sparkline, période 24h / 7j).
4. **Mode hors-ligne / PWA** : Service Worker, derniers taux en cache, installabilité.
5. **Export** : CSV / PDF de l’historique des conversions.
6. **Partage** : lien profond avec montants et paire encodés dans l’URL (`withComponentInputBinding` déjà prévu côté app).
7. **Frais & spread** : option pour modéliser commission bancaire ou spread marché.
8. **Accessibilité avancée** : thème contrasté, réduction des animations, préférences `prefers-reduced-motion`.
9. **E2E** : Playwright sur les parcours critiques (switch, taux fixe, alerte 2 %, i18n).
10. **CI** : GitHub Actions (lint, test, build, budgets personnalisés sur taille gzip).
11. **Notifications** : alertes utilisateur (seuil de taux, rappel d’écart avec le taux fixe), toasts intégrés UI et/ou Web Notifications avec opt-in et préférences (désactivation, “ne pas déranger”).
12. **Vélocité du cours** : indicateur de vitesse de variation du taux sur une fenêtre courte (delta / momentum, tendance “qui accélère”), en complément de la direction hausse/baisse déjà affichée ; possibilité de lier à des notifications seuil.
