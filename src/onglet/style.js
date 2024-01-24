import ol_ext_element from 'ol-ext/util/element'

import FormStyle from 'mcutils/input/FormStyle.js'
import charte from 'mcutils/charte/macarte'
import carte from '../carte'
import { updateCurrentStyle } from '../util/currentStyle'

import html from '../../page/onglet/style-page.html'
import '../../page/onglet/style.css'

// Protect formular from refresh (infinte loop) on select
let protect = false;

charte.addMenuTab('style','fi-pencil', 'Symboliser', html)

const styleTab = charte.getMenuTabElement('style');
styleTab.dataset.disable = 1;

// New form style
const form =  new FormStyle({ 
  target: styleTab.querySelector('div'),
  symbolLib: carte.getSymbolLib()
});

// Reset style to default layer style
ol_ext_element.create('BUTTON', {
  html: 'Revenir au style par défaut',
  className: 'button button-ghost',
  click: () => {
    // Update features
    var f = carte.getSelect().getFeatures();
    f.forEach((item) => { 
      item.setIgnStyle({});
      updateCurrentStyle(item);
      item.changed();
    })
    // Update form
    carte.getSelect().dispatchEvent({
      type: 'select',
      selected: f.getArray(),
      deselected: []
    })
  },
  parent: styleTab
})

// If a feature is selected, display/enable style tab menu
carte.getSelect().on('select', () => {
  
  //let currentFeature = e.selected[0];
  const selectFeature = carte.getSelect().getFeatures().item(0);

  if (selectFeature && selectFeature.getLayer() && selectFeature.getLayer().get('type') === 'Vector' && !selectFeature.getLayer().getConditionStyle().length) {
    
    // Enable style edition
    delete styleTab.dataset.disable;

    // Store style
    updateCurrentStyle(selectFeature)

  } else {
    // Disable style edition
    styleTab.dataset.disable = '1';
  }
})


// Update style form with first feature's datas
carte.getSelect().on('select', () => {
  const f = carte.getSelect().getFeatures().item(0);
  if (f) {
    protect = true;
    // form.setStyle(f.getIgnStyle(true));
    form.setFeature(f);
    // Geometry type
    const typeGeom = {};
    carte.getSelect().getFeatures().forEach(f => {
      typeGeom[f.getGeometry().getType()] = true;
    })
    const m = Object.keys(typeGeom).join(',');
    form.setTypeGeom(m);
    // restore
    protect = false;
  }
})

// On change set features style
form.on('change', (e) => {
  // Prevent infinite loop while loading
  if (protect) return;
  // f contient tous les elements en cas de selection multiple
  var f = carte.getSelect().getFeatures();
  f.forEach((item) => { 
    item.setIgnStyle(e.attr, e.value);
    updateCurrentStyle(item);
    item.changed();
  })
})


/*DEBUG* /
window.form = form;
/*END DEBUG*/

