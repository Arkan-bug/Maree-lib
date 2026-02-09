# 🌊 Lib-Maree (`<data-maree>`)

[![License: Open Licence](https://img.shields.io/badge/License-Etalab_2.0-blue.svg)](https://www.etalab.gouv.fr/wp-content/uploads/2017/04/ETALAB-Licence-Ouverte-v2.0.pdf)
[![Source: SHOM](https://img.shields.io/badge/Source-SHOM-0055a4.svg)](https://www.shom.fr)
[![Web Component](https://img.shields.io/badge/Web_Component-Custom_Element-orange.svg)](#)

Une bibliothèque JavaScript légère pour intégrer des données marégraphiques en temps réel sur n'importe quel site web via un simple **Web Component**. Exploite les données officielles du **SHOM**.

---

## 🛠 Installation

Ajoutez simplement le script à votre projet HTML avant la balise `</body>` :

```html
<script src="data-maree.js"></script>
```

---

## 📖 Utilisation Rapide

Le composant s'utilise avec la balise `<data-maree>`. Vous pouvez cibler un port par son **nom** ou son **ID SHOM**.

### 1. Afficher la hauteur d'eau actuelle
```html
<data-maree port="Brest"></data-maree>
```

### 2. Afficher un graphique dynamique
```html
<data-maree port="14" info="graph-direct"></data-maree>

<data-maree port="Brest" info="graph-inter" start="2024-01-01" end="2024-01-07"></data-maree>
```

### 3. Lister les ports disponibles
```html
<data-maree port="-list"></data-maree>

<data-maree port="-list-RONIM"></data-maree>
```

---

## ⚙️ Configuration (Attributs)

| Attribut | Description | Valeurs possibles | Défaut |
| :--- | :--- | :--- | :--- |
| `port` | Nom du port ou identifiant numérique. | `Brest`, `14`, `-list`, `-list-RONIM` | **Requis** |
| `info` | Type de donnée à afficher. | `actu`, `id`, `max_height`, `last_date`, `graph-direct`, `graph-inter` | `actu` |
| `refresh` | Fréquence de mise à jour en minutes. | Nombre (ex: `10`) | `5` |
| `sources` | Source de la donnée SHOM. | `1` (Obs), `2` (Préd) | `1` |
| `start` | Date de début (pour `graph-inter`). | `YYYY-MM-DD` | *-7 jours* |
| `end` | Date de fin (pour `graph-inter`). | `YYYY-MM-DD` | *Aujourd'hui* |

---

## ⚠️ Clause de responsabilité

L'utilisateur reconnaît que l'usage de cet outil se fait à ses propres risques et périls. L'auteur décline toute responsabilité en cas d'erreurs, d'omissions, de retards de mise à jour ou de défaillances techniques du service source (API SHOM). **Cet outil ne doit pas être utilisé pour la navigation.**

---

## ⚖️ Licence & Crédits

* **Données :** [SHOM](https://www.shom.fr) - Licence Ouverte / Open Licence (Etalab).
* **Développeur :** Yrieix MICHAUD
