import element from 'ol-ext/util/element'
import InputCollection from 'ol-ext/util/input/Collection'
import Collection from 'ol/Collection'
import SelectControl from 'ol-ext/control/Select'
import fakeMap from 'mcutils/dialog/fakeMap';
import dialog from "mcutils/dialog/dialogMessage";

import SymbolLibInput from 'mcutils/input/SymbolLibInput';

import _T from 'mcutils/i18n/i18n';
import md2html from 'mcutils/md/md2html';

import '../../page/layerShop/styleCondition.css'

// Current condition
let current;

/* Select conditions */
const selectCtrl = new SelectControl({
  className: 'mcSearchAttr',
  target: element.create('DIV'),
  btInfo: 'Sélectionner',
  addLabel: 'Ajouter un critère',
  caseLabel: 'sensible à la case',
  allLabel: 'tous les mots',
  attrPlaceHolder: 'attribut',
  valuePlaceHolder: 'valeur',
})
selectCtrl.clear = function() {
  while(selectCtrl.getConditions().conditions.length) {
    selectCtrl.removeCondition(0)
  }
  selectCtrl.addCondition();
}
selectCtrl.setTarget = function(d) {
  fakeMap.removeControl(selectCtrl)
  SelectControl.prototype.setTarget.call(selectCtrl, d)
  fakeMap.addControl(selectCtrl)
}

// Customize checkbox
selectCtrl.element.querySelectorAll('label').forEach(l => {
  l.className = l.className + ' ol-ext-check ol-ext-checkbox small';
  element.create('SPAN', {
    parent: l
  })
  // update current
  l.querySelector('input').addEventListener('change', () => {
    if (current) {
      current.condition = selectCtrl.getConditions()
    }
  })
})

/** 
 * 
 */
function styleCondition(div, layer, symbolLib) {
  const content = element.create('DIV', {
    'data-paramstyle': '',
    parent: div
  });
  const listSymb = element.create('DIV', {
    className: 'listSymb',
    parent: content
  })
  // Layer condition style
  const conditions = layer.getConditionStyle();
  // Condition collection
  const collect = new Collection;
  conditions.forEach(c => {
    collect.push({
      title: c.title,
      condition: JSON.parse(JSON.stringify(c.condition)),
      symbol: c.symbol
    })
  });
  // Handle conditions
  const icollect = new InputCollection({
    getTitle: item => {
      const t = element.create('DIV', {
        html: item.symbol ? item.symbol.getImage(true) : '<div class="symbol" />'
      })
      const getType = function() {
        if (!item.symbol) return '';
        const tr = { Polygon: 'surface', LineString: 'ligne', Point: 'point' };
        return ' (' + tr[item.symbol.getType()] + ')'
      }
      t.appendChild(element.create('SPAN', { 
        text: (item.title || 'sans-titre') + getType()
      }));
      // Remove button
      t.appendChild(element.create('I', {
        className: 'fi-delete',
        title: 'Supprimer...',
        click: () => {
          collect.remove(item)
        }
      }));
      // Duplicate button
      t.appendChild(element.create('I', {
        className: 'fi-copy',
        title: 'Dupliquer...',
        click: () => {
          collect.push({
            title: item.title,
            condition: JSON.parse(JSON.stringify(item.condition)),
            symbol: item.symbol
          })
        }
      }));
      return t
    },
    target: listSymb,
    collection: collect
  });
  // Modify condition
  current = null;
  icollect.on('item:select', e => {
    // Get current
    if (current) {
      current.condition = selectCtrl.getConditions()
    }
    // New current
    current = e.item;
    if (current) {
      div.dataset.edit = '';
      selectCtrl.setConditions(current.condition)
      inputTitle.value = current.title;
      symbolDiv.innerHTML = '';
      if (current.symbol) symbolDiv.appendChild(current.symbol.getImage(true))
    } else {
      delete div.dataset.edit
    }
  })
  // New condition ?
  collect.on(['add','remove'], () => {
    div.dataset.condition = collect.getLength();
  })
  div.dataset.condition = collect.getLength();
  // Add new symbol condition
  element.create('BUTTON', {
    html: '<i class=""></i> Ajouter une symbolisation',
    className: 'button button-ghost',
    click: () => {
      // Add new style condition
      const cond = {
        title: '',
        condition: {
          usecase: false,
          all: true,
          conditions: [{attr: '', op: '=', val: ''}]
        },
        symbol: null
      }
      collect.push(cond)
      icollect.select(cond)
      // Scroll to bottom
      listSymb.scrollTop = 2000;
    },
    parent: listSymb
  })
  
  // Help info
  element.create('DIV', {
    className: 'md editInfo',
    html: md2html(_T('styleConditionInfoActive') + _T('styleConditionInfo')),
    parent: content
  })
  // Modification form
  const edit = element.create('DIV', {
    className: 'edit',
    parent: content
  })
  const inputTitle = element.create('INPUT', {
    placeHolder: 'sans titre',
    type: 'text',
    change: () => {
      current.title = inputTitle.value;
      icollect.refresh();
    },
    parent: edit
  })
  // Symbol
  const symbolList = new SymbolLibInput({
    symbolLib: symbolLib
  })
  symbolList.on('item:dblclick', () => {
    dialog.close();
    if (current) {
      const symbol = symbolList.getSelect();
      if (symbol) {
        current.symbol = symbol;
        symbolDiv.innerHTML = '';
        symbolDiv.appendChild(current.symbol.getImage(true))
        if (!inputTitle.value && current.symbol) {
          current.title = inputTitle.value = current.symbol.get('name')
        }
        icollect.refresh();
      }
    }
  })
  element.create('LABEL', { text: 'Symbolisation :', className: 'symbol', parent: edit })
  const symbolDiv = element.create('DIV', { className: 'symbol', parent: edit })
  element.create('BUTTON', {
    html: '<i class="fg-color"></i> Bibliothèque',
    className: 'button button-colored symbol',
    click: () => {
      dialog.show({
        title: 'Bibliothèque de symboles',
        className: 'symbolConditionLib',
        content: symbolList.element,
        buttons: { ok: 'Utiliser', cancel: 'annuler'},
        onButton: (b) => {
          if (b === 'ok') {
            symbolList.dispatchEvent({ type: 'item:dblclick'})
          }
        }
      })
    },
    parent: edit
  })
  // Select control
  selectCtrl.setTarget(edit)
  selectCtrl.set('source', [layer.getSource()])

  return collect
}

export default styleCondition