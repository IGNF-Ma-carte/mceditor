import charte from 'mcutils/charte/charte'
import SelectControl from 'ol-ext/control/Select'
import ol_ext_element from 'ol-ext/util/element'
import carte from '../carte'
import { extend } from 'ol/extent'
import notification from 'mcutils/dialog/notification'
import switcher from '../layerShop/layerSwitcher'

import html from '../../page/onglet/search-page.html'
import '../../page/onglet/search.css'

// Create tab
const tabSearch = charte.addMenuTab('search', 'fg-search-attribtues', 'Sélectionner', html);

// Select feature control
const selectCtrl = new SelectControl({
  className: 'mcSearchAttr',
  target: tabSearch.querySelector('.mcSearchRules'),
  btInfo: 'Sélectionner',
  addLabel: 'Ajouter un critère',
  caseLabel: 'sensible à la case',
  allLabel: 'tous les mots',
  attrPlaceHolder: 'attribut',
  valuePlaceHolder: 'valeur',
})
carte.getMap().addControl(selectCtrl)

// Handle selection
selectCtrl.on('select', (e) => {
  const sel = carte.getSelect().getFeatures();
  sel.clear();
  if (e.features.length) {
    const layer = e.features[0].getLayer();
    // Check layer visibility
    if (!layer.getVisible()) {
      setTimeout(() => {
        notification.cancel(
          'La couche n\'est pas visible pour la sélection',
          () => {
            layer.setVisible(true);
            selectCtrl.dispatchEvent(e);
          }, 
          'afficher la couche...'
        );
      })
      return;
    }
    // Calculate extent / add to selection
    const ext = e.features[0].getGeometry().getExtent().slice(0);
    e.features.forEach(f => {
      sel.push(f)
      extend(ext, f.getGeometry().getExtent())
    });
    if (tabSearch.querySelector('.centerSel input').checked) {
      carte.getMap().getView().fit(ext);
      if (carte.getMap().getView().getZoom() > 16) carte.getMap().getView().setZoom(16);
    }
  }
  carte.getSelect().dispatchEvent({
    type: 'select',
    selected: e.features,
    deselected: []
  });
  const nb = e.features.length;
  const rep = '<b>' + nb + '</b> objet{s} sélectionné{s}'
  setTimeout(() => {
    notification.show(nb>1 ? rep.replace(/{s}/g, 's') : rep.replace(/{s}/g, ''))
  })
})

// Move checkbox
selectCtrl.element.querySelector('button').before(tabSearch.querySelector('.centerSel'));
// Place info and button after attribute list
const ul = selectCtrl.element.querySelector('.mcSearchAttr ul');
// Move option title
ul.after(tabSearch.querySelector('p.helpOptn'));
// Move add button
ul.after(selectCtrl.element.querySelector('button.ol-append'));

// Customize checkbox
selectCtrl.element.querySelectorAll('label').forEach(l => {
  l.className = l.className + ' ol-ext-check ol-ext-checkbox small';
  ol_ext_element.create('SPAN', {
    parent: l
  })
})
// Customize buttons
selectCtrl.element.querySelectorAll('button').forEach(b => {
  if (b.className==='ol-ok') b.classList.add('button-colored');
  else b.classList.add('button-ghost');
  b.classList.add('button');
})

// List of current sources / index
const searchSources = {};

// Source select element
const sourceSelect = tabSearch.querySelector('select');
let currentSource;
sourceSelect.addEventListener('change', () => {
  if (sourceSelect.value === 'current') {
    selectCtrl.set('source', [ currentSource ]);
  } else {
    selectCtrl.set('source', [ searchSources[sourceSelect.value].source ]);
  }
})
const currentOpt = ol_ext_element.create('OPTION', {
  text: 'Calque courant',
  value: 'current',
  parent: sourceSelect
})
switcher.on('select', e => {
  if (e.layer && e.layer.get('type') === 'Vector') {
    currentOpt.innerText = 'Calque courant - ' + e.layer.get('title');
    currentSource = e.layer.getSource();
    if (sourceSelect.value === 'current') {
      selectCtrl.set('source', [ currentSource ]);
    }  
  }
})

// Check new added layers 
carte.getMap().getLayers().on('add', (e) => {
  const l = e.element;
  if (l.get('type') === 'Vector') {
    const id = 'search-' + l.get('id');
    const title = l.get('title') || l.get('name') || '-';
    // add new option to select
    const selectOpt = ol_ext_element.create('OPTION', {
      text: title,
      value: id,
      parent: sourceSelect
    })
    // Add search source
    if (!searchSources[id]) {
      searchSources[id] = {
        layer: l,
        source: l.getSource(),
      }
      l.on('propertychange', e => {
        if (e.key==='title') {
          searchSources[id].option.innerText = l.get('title') || l.get('name') || '-';
        }
      })      
    }
    searchSources[id].option = selectOpt;
    // If none select the first one
    if (!selectCtrl.get('source')) {
      selectCtrl.set('source', [ l.getSource() ]);
    }
    delete tabSearch.dataset.disabled;
  }
})

// Check removed layers
carte.getMap().getLayers().on('remove', (e) => {
  const l = e.element;
  for (let s in searchSources) {
    if (searchSources[s].layer === l) {
      const isSel = searchSources[s].option.selected;
      // Remove layer
      searchSources[s].option.remove();
      if (isSel) {
        const sel = searchSources[sourceSelect.value]
        selectCtrl.set('source', sel ? [ sel.source ] : undefined);
      }
      delete searchSources[s];
      // no more to select
      if (!Object.keys(searchSources).length) tabSearch.dataset.disabled = '';
      break;
    }
  }
})

// Select all
tabSearch.querySelector('button.selectAll').addEventListener('click', () => {
  const source = selectCtrl.get('source')[0];
  if (source) {
    selectCtrl.dispatchEvent({
      type: 'select', 
      features: source.getFeatures()
    })
  }
})

/* DEBUG * /
window.selectCtrl = selectCtrl
window.searchSources = searchSources
/**/