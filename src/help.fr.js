export default {
// Tabs
infoLocalisation: `# :fi-location:fw: Localisation
----
*Choisissez l'endroit où votre carte doit être centrée*

Vous pouvez :
* rechercher une adresse, une commune 
* utiliser votre localisation GPS ou internet
* entrez des coordonnées en degré décimal ou en degré minute seconde (DMS)

Une fois centré, vous pouvez ajouter un point sur cette localisation.`,
helpSymboliser: `# :fi-pencil:fw: Symboliser
----
L'onglet symboliser permet d'associer une représentation aux objets sur votre carte (symbole, taille, forme, couleur, épaisseur, etc).
Différentes possibilités vous sont offertes en fontion de la nature ponctuelle, linéaire ou surfacique des objets.

## :fi-pencil:fw: Usage
La symbolisation s'applique à tous les objets sélectionnés.
## :fi-tag:fw: Etiquette
Vous pouvez ajouter une étiquette (texte) à vos objets. Pour les objets linéaire, le texte peut s'afficher le long de la ligne.
Si la place disponible le long de la ligne ou à l'intérieur de la surface, le texte ne s'affichera pas (sauf si vou autorisez le débordement).
## :fg-color:fw: Bibliothèque de symboles
Vous pouvez enregistrer des styles dans la bibliothèque de symbole de la carte pour les appliquer ensuite sur une sélection d'objet(s).
Vous pourrez également utiliser la bibliothèque pour créer la légende de votre carte.
## :fi-layers:fw: Symbolisation par défaut
Vous pouvez définir et utiliser un style par défaut dans le calque.
Pour cela utilisez le bouton :fg-color:fw: du gestionnaire de couche.
`,
styleConditionInfoActive: `
### Style paramétrique *activé*
`,
styleConditionInfo: `
* Vous pouvez paramétrer l'affichage des objets de la couche en fonction de leurs attributs. Dans ce cas, *vous ne pourrez plus modifier la représentation des objets individuellement.*
* Les symboles que vous utilisez doivent avoir été préalablement définis dans la bibliothèque de symboles.
* Les règles de symbolisation s'arrêtent à la première condition valide.
* La symbolisation par défaut s'appliquera aux objets ne satisfaisant à aucun des styles paramétriques.
* Pour ajouter un styles paramétrique cliquez sur le bouton Ajouter un style.
`,
styleDeclutter: `### Nettoyage des textes
Lorsque les textes sont trop nombreux, il peuvent se chevaucher et rendre la carte illisible.
Cette option permet de supprimer les textes qui se chevauchent sur un calque pour améliorer la lisibilité.
Lorsque vous zoomez et que la place nécessaire se libère, les textes réapparaissent.
`,
label: `# Ajouter une étiquette
Vous pouvez ajouter une étiquette à un objet sur la carte. Celle-ci permettra de désigner l'objet en affichant un texte associé sur la carte.
Pour utiliser un attributs de l'obet comme étiquette saisissez le nom l'attribut entre deux caractères \`%\` (\`%nom_de_l_attribut%\`).
Par exemple
* si vous saisissez \`Jean\` l'étiquette affichée sera 'Jean'
* si l'objet a un attribut \`nom\` dont la valeur est Jean, \`%nom%\` affichera 'Jean' en étiquette de l'objet.
`,
infoBulle: `# :fi-comment:fw: Bulle d'information
----
*Gérer ici la façon dont les informations s'afficheront sur la carte.*


* Par défaut, la carte utilise la bulle associée à la couche de l'objet sélectionné, si celle-ci est définie dans le gestionnaire de couches.
* Vous pouvez également personnaliser la bulle d'information pour chaque objet indépendemment.
`,
infoLegend: `# Légende
----
*Créez votre légende ici...*

Vous pouvez créer une légende et gérer son affichage.
Les symboles doivent se trouver au préalable dans la bibliothèque de symboles.
Vous pouvez créer ces symboles dans l'onglet :fi-pencil: *Symboliser* à partir des objets présents sur la carte.
`,
helpLegendConfig: `# Configurer la légende
----
Vous devez au préalable avoir créé vos symboles dans la bibliothèque de symboles dans l'onglet :fi-pencil: *Symboliser*.

La bibliothèque est à gauche et vous devez passer les symboles dans la légende (à droite).
:fi-play:fw: Cliquez sur un symbole dans la bibliothèque pour le sélectionner puis sur la flèche pour le passer dans la légende (ou double-clic sur le symbole).
:fi-pencil:fw: Ajoutez un libellé à votre entrée dans la légende (2 lignes maxi).
:fi-delete:fw: Cliquez sur l'icone *poubelle* pour supprimer un symbole.
:fi-move:fw: Utilisez les flèches pour organiser la légende...

Si vous voulez récupérer un symbole depuis la légende dans la bibliothèque, utilisez la flèche dans l'autre sens.
`,
helpMode: `# Mode
----
*Choissisez le mode d'affichage de la couche.*

Le mode permet d'optimiser l'affichage de la couche.

Le **mode cluster** permet de regrouper les objets trop proche au sein d’un même groupe. Particulièrement adapté lorsque vous avez une couche avec beaucoup de points, il offre une meilleur lisibilité à petite échelle. Il suffit de zoomer sur la carte pour voir les objets dégroupés.

Le **mode image** permet un affichage plus rapide lorsqu'on zoom ou qu'on déplace la carte. Bien adapté sur vous avez beaucoup d'objets et que l'affichage est ralenti à petite échelle. 
`,
helpCrop: `# Masque et découpage
----
Les masque de découpage permettent de n'afficher que la partie d'un calque à l'intérieure d'une zone donnée.

Pour ajouter un masque, vous devez au préalable avoir sélectionné un objet surfacique qui servira au découpage de la couche.
Ouvrez le dialogue des options de la couche et cliquez sur le bouton [Utiliser la sélection].
Par défaut, la couche sera découpée par ce masque et laissera apparaitre la couche du dessous à l'extérieure.
Vous pouvez utiliser une couleur de masque qui s'affichera à l'extérieure. En jouant sur l'opacité de cette couleur, vous pouvez afficher plus ou moins le contenu du calque à l'extérieure.
Vous pouvez également ajouter un léger ombrage au masque.
`,
infoDisplay: `# Affichage
----
*Sélectionnez les outils que vous souhaitez afficher sur votre carte partagée.*

:fg-search-poi:2x fw:#999: **Barre de recherche** : ajoutez une barre de recherche par adresse pour permettre de se positionner
:fg-zoom-in:2x fw:#999: **Boutons de zoom** : ajoutez des boutons +/- pour zoomer sur la carte
:fg-layer-stack-o:2x fw:#999: **Gestionnaire de couche** : ajouter un outil pour rendre manipuler les couches sur la carte
:fg-scale:2x fw:#999: **Échelle** : ajoutez une barre d'échelle à la carte
:fg-profile:2x fw:#999: **Profil en long** : ajouter un bouton pour afficher le profil en long des objets linéraire sélectionnés
:fg-location-on:2x fw:#999: **Localisation** : ajouter un bouton pour centrer la carte sur la position GPS de votre ordinateur
:fg-coord-system:2x fw:#999: **Coordonnées** : afficher les coordonnées du curseur sur la carte
`,
// Layers
clusterDistance: `# :fi-comment:fw: Distance
----
Niveau de distance pris pour la formation des clusters.
Selon le niveau de zoom défini, les clusters peuvent ne pas
être visibles.
`,
maxZoomCluster: `# :fi-comment:fw: Niveau de zoom maximum
----
Niveau de zoom définissant le seuil limite de visibilité des clusters.
La zone de visibilité est matérialisée en bleu dans la barre de défilement.
`,
infoAttributes:`# :fi-tag:fw: Attributs
----
Les attributs sont des caractéristiques non spatiales des objets. Par exemple le numéro INSEE,
le nom, la population ou la surface d'une commune.
Pour les objets dessin, ils apportent des informations qui peuvent être :
* utilisées comme en étiquette
* affichées dans l'info-bulle de l'objet
* utilisées dans la recherche pour sélectionner les objets à l'aide d'une requête.
Des informations contextuelles vous expliquent comment utiliser les attributs.
Pour un calque dessin vous pouvez créer, modifier la valeur ou supprimer jusqu'à 1000 attributs.
`,
helpFormula: `# Formule
----
La formule permet de calculer un champs en fonction des autres champs de l'objet.
Pour accéder aux attributs de l'objet, utiliser la variable \`attr\` pour accéder aux attributs de l'objet.
La valeur utilisée doit être retournée avec le mot clé \`return\`.
Ainsi, pour concaténer le nom de l'objet avec sa date :
\`\`\`javascript
// Attribut nom de l'objet
return attr.nom + ' - ' + attr.date
\`\`\`
La formule est écrite en [EcmaScript](https://fr.wikipedia.org/wiki/ECMAScript) et permet d'accéder aux différentes fonctionnalités du langage.
\`\`\`javascript
// Transformer un attribut texte en nombre
return parseFloat(attr.nom)
\`\`\`
Vous pouvez également utiliser des test :
\`\`\`javascript
// Transformer un attribut texte en nombre
if (attr.type == 1) return 'mairie'
if (attr.type == 2) return 'pompier'
return 'autre'
\`\`\`
`,
helpSearch:`# :fg-search-attribtues:fw: Sélectionner
----
Vous pouvez rechercher et sélectionner les objets d'un calque à partir d'un
ou plusieurs critères vérifiés par leurs attributs.
Pour cela choississez :
* le *calque* dans la liste
* l'*attribut* concerné
* l'*opérateur* à utiliser
* la *valeur* recherchée
* les *options de sélection*

Une fois vos critères définis cliquez sur le bouton "Sélectionner".
Vous pouvez combiner cet outil avec les outils de symbolisation pour produire 
une carte thématique. Par exemple sélectionner toutes les routes à une voie 
pour les symboliser par un trait de faible épaisseur, les routes à deux voies 
par un trait d'épaisseur moyenne et les routes à plus de 2 voies par un trait épais.
`,
helpSearchAttr: `# Règles de sélection
----
Un critère combine un **Attribut**, une **Valeur** et un **Opérateur**. 
Par exemple, pour sélectionner toutes les routes dont la valeur de l'attribut NbVoies vaut 2 :
* **Attribut** : \`NbVoies\`
* **Valeur** : \`2\`
* **Opérateur** : \`=\`

#### Opérateurs disponibles
* <kbd => l'attribut est égal à la valeur donnée
* <kbd ≠> l'attribut est différent de la valeur donnée
* <kbd <> l'attribut est inférieur à la valeur donnée
* <kbd ≤> l'attribut est inférieur ou égal à la valeur donnée
* <kbd &gt;> l'attribut est supérieur à la valeur donnée
* <kbd ≥> l'attribut est supérieur ou égal à la valeur donnée
* <kbd ⊂> l'attribut contient la valeur donnée
* <kbd ⊄> l'attribut ne contient pas la valeur donnée
* <kbd ≃> l'attribut vérifie une ***[expression régulière](https://fr.wikipedia.org/wiki/Expression_r%C3%A9guli%C3%A8re)***,<br>par exemple \`insee ≃ ^94\` pour avoir les codes insee qui commence par 94
* <kbd ≄> l'attribut ne vérifie pas une expression régulière

`,
helpSearchOptn: `# Options de sélection
----
Cocher la case **tous les mots** permet de sélectionner les objets dont les attributs
vérifient toutes les critères définis (correspond à un ET logique).
Si cette case est décochée tous les objets vérifiant l'un des critère seront sélectionnés.

Décocher la case **sensible à la casse** permet de sélectionner les objets sans tenir compte 
des majuscules/minuscules dans les valeurs d'attributs. 
Par exemple, les valeurs \`\`\`nom\`\`\` , \`\`\`Nom\`\`\` et \`\`\`NOM\`\`\` sont considérées comme identiques.

Cocher la case **centrer sur la sélection** centre la fenêtre cartographique sur la sélection.
`,
editHelp: `# Barre d'édition
[--#### :fg-arrow-o:fw:  sélection --]
Pour sélectionner un objet sur une couche, cliquez sur un objet.
Utilisez la touche majuscule <kbd  ⇑ &nbsp; > pour ajouter un objet à la sélection.
Lorsqu'un objet est sélectionné, il est possible de modifier ses points. Approchez le curseur d'un point (il devient bleu) cliquez dessus et tirez le point jusqu'à la nouvelle position.
Il est également possible d'ajouter des points sur les lignes de l'objet en cliquant entre les points.
Pour supprimer un point sur une ligne ou une surface, utilisez la touche <kbd Alt> et cliquez sur le point de l'objet à supprimer.
Si vous avez sélectionné plusieurs objet ayant des points superposés, ils seront déplacés tous ensemble.
----
##### :fg-extent:fw:  outil de sélection par emprise.
Pour définir le cadre de sélection, cliquez le point en haut à droite et faites glisser sans relâcher jusqu'au coin bas droit. Les objets à l'intérieur du rectangle seront sélectionnés.
Appuyez sur la barre d'espace pour vous déplacer.
----
##### :fi-delete:fw: supprimer des objets
Sélectionnez des objets sur la carte puis cliqué sur la poubelle.
Raccourcis clavier : utilisez la touche <kbd Suppr>.
[----]
[--#### :fg-poi-alt-o:fw: Outils de dessin --]
Vous pouvez saisir des objets (points, lignes, surfaces) sur une couche de dessin. La couche doit être visible (:fi-visible:) et sélectionnable (:fi-unlock:)
:fg-poi-alt-o:fw: Pour dessiner un point, cliquez sur la carte à l'endroit choisi.
:fg-polyline-pt:fw: Pour dessiner une ligne, cliquez sur la carte pour saisir le premier point, puis déplacez-vous pour saisir le suivant. Double-cliquez pour terminer la saisie. 
Appuyez sur la touche majuscule <kbd  ⇑ &nbsp; > pour faire un tracé à main levée.
:fg-polygon-pt:fw: Pour dessiner une surface, cliquez sur la carte pour saisir le premier point, puis déplacez-vous pour saisir le suivant. Double-cliquez pour terminer la saisie ou cliquez sur le premier point.
:fg-polygon-hole-pt:fw: Pour dessiner un trou dans une surface, cliquez sur la surface à trouer et saisissez une surface à l'intérieur de la surface.
[----]
[--#### :fg-square-pt:fw: Saisir une forme régulière --]
Placez le pointeur sur la zone de travail, puis cliquez et faites glisser pour dessiner la forme.
Pour créer un cercle, maintenez la touche majuscule <kbd  ⇑ &nbsp; > enfoncée pendant que vous faites glisser le pointeur. 
Pour saisir une forme à partir du centre, cliquez puis appuyez sur la touche <kbd Ctrl> tout en faisant glisser la souris pour créer la forme. Relâchez d’abord le bouton de la souris, puis la touche.
Vous pouvez choisir le nombre de points de la forme à dessiner en cliquant sur les flèches.
| --- |
| :fa-caret-left: 4 pts :fa-caret-right: | :fg-circle-o: | :fg-square-o: |
:fg-circle-o:fw: Pour dessiner un cercle ou une élipse, cliquez sur le cercle à droite de la barre.
:fg-square-o:fw: Pour dessiner un carré ou un rectangle, cliquez sur le carré à droite de la barre.
[----]
[--#### :fg-move-alt:fw: Déplacer / redimensionner un objet --]
Cliquez sur un objet pour le sélectionner puis cliquez et déplacez l'objet à l'endroit voulu. 
Utilisez la touche majuscule <kbd  ⇑ &nbsp; > pour ajouter un objet à modifier.
:fa-arrows-v:fw: Cliquez sur les coins ou le milieu du carré de sélection pour agrandir / réduire l'objet.
:fa-arrows:fw: Cliquez sur le point en bas à droite du carré de sélection pour faire tourner l'objet.
[----]
[--#### :fg-snap:fw: Accroche aux objets --]
L'accrochage aux objets permet de saisir en s'acchrochant aux objets existants du même calque sur la carte.
Pour activer l'accroche aux objets, cliquez sur le bouton puis déplacez un objet ou le point d'un objet sur les bords d'un autre objet.
[----]
[--#### :fg-measure-line:fw: Mesurer --]
Affichez la longueur d'une ligne ou l'aire d'une surface lors de la saisie.
Activez l'outil puis utilisez les outils de dessin pour dessiner, les mesures s'affichent sous le curseur.
[----]
[--#### :fa-keyboard-o:fw: Raccourcis claviers --]
<kbd Ctrl>+<kbd C> pour copier le ou les objets sélectionnés.
<kbd Ctrl>+<kbd X> pour copier le ou les objets sélectionnés en les supprimant du calque dans lequel ils se trouvent.
<kbd Ctrl>+<kbd V> pour coller le ou les objets copiés sur le calque de dessin courant (le calque doit être visible :fi-visible: et déverrouillée :fi-unlock:).
<kbd Suppr> pour supprimer les objets sélectionnés.
[----]

`
}