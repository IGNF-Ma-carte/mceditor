import openCarte from 'mcutils/dialog/openCarte'
import api from 'mcutils/api/api'
import { carteV4 } from 'mcutils/format/version/toV4'
import CarteFormat from 'mcutils/format/Carte'
import LegendFormat from 'mcutils/format/control/Legend';

import ol_ext_element from 'ol-ext/util/element'
import dlg from 'mcutils/dialog/dialog'

import carte from '../../carte'
import switcher from '../layerSwitcher'

import loadmap from '../../../page/loadMap.html'
import '../../../page/loadMap.css'

// Carte format reader
const format = new CarteFormat();

/** Main dialog. Display all 'macarte' map from user atlas.
 * User is expected one map to load specific layer.
 */
function importMapLayer() {
  openCarte({
    title: 'Importer depuis une autre carte',
    callback: (c) => {
      dlg.close();
      setTimeout(() => dlg.showWait('Chargement des calques...'));
      api.getMapFile(c.view_id, selectMapLayer);
    },
    // Keep only maps with 'macarte' type.
    filter: 'macarte'
  })
}

/** Show a dialog to select layers of a map 'macarte'
 * @param {*} resp 
 */
function selectMapLayer(resp, fullmap) {

  // Convert Carte options to V4 format
  carteV4(resp)

  // Get layers of this map
  const layers = resp.layers;

  // Create checkable list of layers to import
  const ul = ol_ext_element.create('UL', { className: 'no-style' });
  for (let i=layers.length-1; i>=0; i--) {
    const li = ol_ext_element.create('LI', {
      parent : ul
    })
    ol_ext_element.createCheck({
      after: (layers[i].title ||layers[i].name) + '  ( ' + layers[i].type + ' )',
      name: i,
      parent: li
    })
  }

  // Create the dialog box
  dlg.show({
    title: 'Importer depuis une autre carte',
    className: 'selectLayers',
    buttons:{ submit: 'importer dans la carte', cancel: 'annuler' },
    content: fullmap ? loadmap : ' ',
    onButton: (b) => {
      if (b === 'submit') {
        const addList = [];
        // Loop through checked layers and add it below current selection
        const checks = dlg.getContentElement().querySelectorAll('ul input:checked');
        if (checks.length) {
          for (let i=checks.length - 1; i>=0; i--) {
            const check = checks[i];
            const layer = format.readLayer(layers[check.getAttribute('name')]);
            // Remove ID before insertion
            const id0 = layer.get('id')
            layer.unset('id');
            insertLayer(layer)
            // Match new layer id and legend id
            addList.push(layer)
            const item = resp.controls.legend.items.find(li => li.id === id0)
            if (item) item.id = layer.get('id')
          }
          // close dialog
          dlg.close();
        }
        // Import legend
        const legend = dlg.getContentElement().querySelector('label [name="legend"]')
        if (legend && legend.checked) {
          new LegendFormat(carte.getControl('legend'), resp.controls.legend, true, addList);
          dlg.close();
        }
        // Import symbolLib
        const symbols = dlg.getContentElement().querySelector('label [name="symbolLib"]')
        if (symbols && symbols.checked) {
          resp.symbolLib.forEach(s => {
            if (/Point|Polygon|LineString/.test(s.type)) carte.addSymbolLib(s)
          })
          dlg.close();
        }
      }
    }
  });

  const content = dlg.getContentElement();

  // Import fullmap
  if (fullmap) {
    content.querySelector('button').addEventListener('click', () => {
      if (carte.hasChanged()) {
        dlg.showAlert(
          'Les données de la carte courante seront perdues...',
          { ok: 'continuer', cancel: 'annuler'},
          (b) => { if (b==='ok') carte.read(resp) }
        );
      } else {
        dlg.close();
        // Reset selection
        carte.getSelect().getFeatures().clear();
        // Read new map
        carte.read(resp);
      }
    });
  }

  // Legend
  if ((resp.controls.legend && resp.controls.legend.items.length) || resp.symbolLib.length) {
    ol_ext_element.create('H3', {
      text: 'Importer la légende',
      parent: content
    })
    if (resp.controls.legend.items.length) {
      ol_ext_element.createCheck({
        after: 'importer la légende de la carte',
        name: 'legend',
        parent: content
      })
    }
    if (resp.symbolLib.length) {
      ol_ext_element.createCheck({
        after: 'importer la bibliothèque de symboles',
        name: 'symbolLib',
        parent: content
      })
    }
  }
  // List layers
  ol_ext_element.create('H3', {
    text: 'Importer les calques',
    parent: content
  })
  // Check all
  const dsel = ol_ext_element.create('DIV', { className: 'checkall', parent: content })
  ol_ext_element.create('A', {
    text: 'aucun calque',
    click: () => {
      ul.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false)
    },
    parent: dsel
  })
  ol_ext_element.create('SPAN', { text: ' / ', parent: dsel })
  ol_ext_element.create('A', {
    text: 'tous les calques',
    click: () => {
      ul.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = true)
    },
    parent: dsel
  })
  // Show list
  content.appendChild(ul);
}

/** Insert layer from the current position
 * Layer 'dessin' are inserted before, other layer are inserted after the current selection
 * @param (olLayer) layer
 */
function insertLayer(layer) {
  const layers = carte.getMap().getLayers();
  let index = layers.getArray().indexOf(switcher.getSelection());
  if (layer.get('type') === 'Vector')  {
    // On top of the current vector layer
    if (layers.item(index) && layers.item(index).get('type') === 'Vector') {
      index++;
    } else {
      // Over non vector layers
      while(layers.item(index) && layers.item(index).get('type') !== 'Vector') index++;
    }
  } else {
    // Under vector layers
    while(layers.item(index) && layers.item(index).get('type') === 'Vector') index--;
    index++;
  }
  layers.insertAt(index, layer);
  switcher.selectLayer(layer);
}

export { insertLayer, selectMapLayer, importMapLayer }
