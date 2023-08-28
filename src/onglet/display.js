import charte from "mcutils/charte/charte";
import ol_ext_element from 'ol-ext/util/element'
import carte from "../carte";

import html from '../../page/onglet/display.html'
import '../../page/onglet/display.css'

// Display options are in the legend
const tabDisplay = charte.getMenuTabElement('legend');

const elt = ol_ext_element.create('DIV', {
  html: html,
  className: 'tabDisplay',
  parent: tabDisplay
})

// Option list
const ul = elt.querySelector('ul');

const dispOptions = {
  searchBar: 'Barre de recherche',
  zoom: 'Boutons de zoom',
  layerSwitcher: 'Gestionaire de couches',
  scaleLine: 'Échelle',
  profil: 'Profil en long',
  locate: 'Localisation',
  mousePosition: 'Coordonnées',
}
// Add options input
Object.keys(dispOptions).forEach(o => {
  const check = ol_ext_element.createCheck({
    after: dispOptions[o],
    on: { 
      change: () => carte.showControl(o, check.checked)
    },
    parent: ol_ext_element.create('LI', { parent: ul })
  })
  dispOptions[o] = {
    title: dispOptions[o],
    check: check
  }
});

const mouseProjection = elt.querySelector('ul.mouseProjection');
const mouseCtrl = carte.getControl('mousePosition')

function showProjection() {
  if (carte.hasControl('mousePosition')) {
    mouseProjection.dataset.visible = '';
  } else  {
    delete mouseProjection.dataset.visible;
  }
  mouseProjection.querySelector('.projection select').value = mouseCtrl.getProjection().getCode();
  mouseProjection.querySelector('.unit select').value = mouseCtrl.get('unit');
  mouseProjection.dataset.projection = mouseCtrl.getProjection().getCode();
}

// Show on change
dispOptions.mousePosition.check.addEventListener('change', showProjection);

mouseProjection.querySelector('.projection select').addEventListener('change', (e) => {
  mouseCtrl.setProjection(e.target.value);
  showProjection();
})
mouseProjection.querySelector('.unit select').addEventListener('change', (e) => {
  mouseCtrl.set('unit', e.target.value);
  showProjection();
})

// Init values on read
carte.on('read', () => {
  Object.keys(dispOptions).forEach(o => {
    dispOptions[o].check.checked = carte.hasControl(o);
  })
  showProjection();
})
