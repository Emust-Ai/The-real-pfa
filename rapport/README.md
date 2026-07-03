# Rapport PFA - Plateforme de Scraping Immobilier avec IA

## Auteur
Mouhamed Aziz Lazreg - EPI (École Pluridisciplinaire Internationale)

## Compilation

### Prérequis
- Une distribution LaTeX (MiKTeX, TeX Live, ou MacTeX)
- Les packages standards (inclus dans les distributions complètes)

### Compiler le rapport
```bash
# Compilation simple (nécessite 2 passages pour la table des matières)
pdflatex rapport.tex
pdflatex rapport.tex

# Ou avec latexmk (recommandé)
latexmk -pdf rapport.tex
```

Le fichier `logo.png` doit se trouver dans le même dossier que `rapport.tex`.

### Nettoyage
```bash
# Supprimer les fichiers auxiliaires
latexmk -c
```
