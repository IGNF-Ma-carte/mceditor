import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ'
import TileLayer from 'ol/layer/Tile';
import WFS from 'ol-ext/source/TileWFS'
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'mcutils/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import VectorStyle from 'mcutils/layer/VectorStyle';
import LayerMVT from 'mcutils/layer/MVT'

import format from 'mcutils/format/Guesser'

import dialog from 'mcutils/dialog/dialog';

import carte from '../../carte'
import { insertLayer } from './loadLayer';

import html from '../../../page/layerShop/layers/addLayerByURL-page.html'
import '../../../page/layerShop/layers/addLayerByURL.css'

/** Load date from url */
function loadDataFromURL(layer, url, extractStyles) {
  fetch(url)
  .then(x => x.text())
  .then(resp => {
    const features = (new format()).readFeatures(resp, {
      extractStyles : extractStyles,
      featureProjection: carte.getMap().getView().getProjection()
    })
    layer.getSource().addFeatures(features)
  })
}

/** Add layer using inputs value */
function addLayer(type, inputs) {
  let layer;
  
  // Check emptyfileds
  const testFields = ['url', 'title']
  if (type === 'WFS') {
    testFields.push('typename');
  }
  let error = false;
  testFields.forEach(k => {
    const input = inputs[k];
    if (input && !input.value) {
      input.classList.add('invalid');
      input.focus();
      error = true;
    } else {
      input.classList.remove('invalid');
    }
  })     
  
  // error?
  if (error) {
    dialog.element.classList.add('dlgerror');
    return false;
  }
  dialog.element.classList.remove('dlgerror');

  // Create the source and layer depending on type.
  switch(type) {
    case 'file':
    case 'RSS': {
      type = 'file';
      layer = new VectorStyle({
        url: inputs.url.value,
        source: new VectorSource({})
      });
      layer.set('extractStyles', inputs.extractStyles.checked);
      // read data
      loadDataFromURL(layer, inputs.url.value, inputs.extractStyles.checked);
      /*
      fetch(inputs.url.value)
        .then(x => x.text())
        .then(resp => {
          const features = (new format()).readFeatures(resp, {
            extractStyles : inputs.extractStyles.checked,
            featureProjection: carte.getMap().getView().getProjection()
          })
          layer.getSource().addFeatures(features)
        })
      */
      break;
    }
    case 'WFS': {
      // Force zoom to 12 (if none)
      const tileZoom = inputs.zoom.value === 0 ? 0 : inputs.zoom.value || 12;
      const url = inputs.url.value.replace(/^http:/,'https:');
      // Get parameters
      const param = {};
      (new URL(url)).search.replace(/^\?/,'').split('&').forEach(p => {
        const t = p.split('=')
        param[t[0].toLocaleLowerCase()] = t[1]
      })
      // Create layer
      layer = new VectorStyle({
        source: new WFS({
          url: url,
          typeName: inputs.typename.value,
          tileZoom: tileZoom,
          version: param.version || '2.0.0',
          outputFormat: param.outputformat
        }),
      });
      layer.setMinZoom(tileZoom)
      // Save parameters
      layer.getSource().set('url', url)
      if (param.version) layer.getSource().set('version', param.version)
      if (param.outputformat) layer.getSource().set('format', param.outputformat)
      layer.getSource().set('typeName', inputs.typename.value)
      layer.getSource().set('tileZoom', tileZoom)
      break;
    }
    case 'Pattern': {
      const useCors = (inputs.cors.checked ? 'anonymous' : null)
      layer = new TileLayer({
        source: new XYZ({
          crossOrigin: useCors,
          url: inputs.url.value,
        })  
      })
      layer.setBlendMode('multiply');

      break;
    }
    case 'XYZ': {
      const extent = [];
      const ext = inputs.extent.value.split(',');
      ext.forEach(i => {
        if (parseInt(i)) extent.push(parseInt(i));
      })
      const minZoom = (parseInt(inputs.minZoom.value) || 0)
      const maxZoom = (parseInt(inputs.maxZoom.value) || 21)
      const useCors = (inputs.cors.checked ? 'anonymous' : null)
      layer = new TileLayer({
        extent: extent.length === 4 ? extent : undefined,
        minZoom: parseInt(inputs.minZoom.value) || undefined,
        source: new XYZ({
          minZoom: minZoom > 0 ? minZoom : undefined,
          maxZoom: maxZoom < 20 ? maxZoom : undefined,
          crossOrigin: useCors,
          url: inputs.url.value,
        })  
      })
      if (minZoom > 0) layer.getSource().set('minZoom', minZoom)
      if (maxZoom < 20) layer.getSource().set('maxZoom', maxZoom)
      if (extent.length === 4) layer.getSource().set('extent', extent)
      break;
    }
    case 'MVT': {
      const url = inputs.url.value
      if (/pbf$|mvt$/i.test(url)) {
        layer = new VectorTileLayer({
          type: 'PBF',
          title: inputs.title.value,
          attribution: inputs.copy.value,
          source: new VectorTileSource({
            format: new MVT(),
            attributions: inputs.copy.value,
            url: url,
          })
        })
        //layer.setStyle(getStyleFn());
      } else {
        layer = new LayerMVT({
          title: inputs.title.value,
          url: url,
        })
      }
      break;
    }
  }

  if (layer) {
    // Set Layer attributes
    layer.set('title', inputs.title.value)
    layer.set('desc', inputs.desc.value)
    if (inputs.copy.style.display === 'none') {
      if (inputs.copy2.value) {
        layer.set('attributions', [inputs.copy.value, inputs.copy2.value]);
      } else {
        layer.set('attributions', inputs.copy.value);
      }
    }
    if (!layer.get('type')) layer.set('type', type);
    if (layer.getSource()) {
      layer.getSource().setAttributions(layer.get('attributions') || inputs.copy.value)
    }
    // Add and select layer 
    insertLayer(layer);
    return true;
  }
}

/**
 * Create a new layer from url with a given file extension (type).
 * @param {*} type values may be 'WFS', 'XYZ', 'MVT', 'File', etc...
 * @param {string} title
 */
function addLayerByURL(type, title) {
  // Dialog :
  //  * Show input field
  //  * on submit : create the requested layer
  dialog.show({
    content: html,
    title: title || 'Ajouter une couche',
    className: 'addFile ' + type,
    buttons: { submit: 'ajouter', cancel: 'annuler' },
    onButton: (b, inputs) => { 
      if (b === 'submit') {
        if (addLayer(type, inputs)) {
          dialog.hide();
        }
      }
    }
  })
  const elt = dialog.getContentElement();
  elt.querySelector('.clear').addEventListener('click', () => addLayerByURL(type, title))
  // crossOrign (default true)
  elt.querySelector('.zoom input.cors').checked = true;
  // Extent
  elt.querySelector('.zoom i').addEventListener('click', () => {
    elt.querySelector('.extent').value = carte.getMap().getView().calculateExtent().join(',');
  })
  // Select menu
  elt.querySelectorAll('select.debug').forEach(sel => {
    sel.addEventListener('change', () => {
      elt.querySelector('input.url').value = sel.value;
      elt.querySelector('input.title').value = sel.options[sel.selectedIndex].text || '';
      elt.querySelector('input.typename').value = sel.options[sel.selectedIndex].dataset.typename || '';
      elt.querySelector('textarea.desc').value = sel.options[sel.selectedIndex].dataset.description || '';
      if (sel.options[sel.selectedIndex].dataset.attribution) {
        elt.querySelector('input.copy').value = sel.options[sel.selectedIndex].dataset.attribution;
        elt.querySelector('input.copy2').value = sel.options[sel.selectedIndex].dataset.attribution2 || '';
        elt.querySelector('input.copy').style.display = 'none';
        elt.querySelector('div.copy').innerHTML = sel.options[sel.selectedIndex].dataset.attribution
          + ' - ' + (sel.options[sel.selectedIndex].dataset.attribution2 || '');
        elt.querySelector('div.copy').style.display = 'block';
      } else {
        elt.querySelector('input.copy').value = '';
        elt.querySelector('input.copy2').value = '';
        elt.querySelector('input.copy').style.display = 'block';
        elt.querySelector('div.copy').innerHTML = '';
        elt.querySelector('div.copy').style.display = 'none';
      }
      elt.querySelector('input.zoom').value = sel.options[sel.selectedIndex].dataset.minz || '12';
      elt.querySelector('input.minZoom').value = sel.options[sel.selectedIndex].dataset.minz || '0';
      elt.querySelector('input.maxZoom').value = sel.options[sel.selectedIndex].dataset.maxz || '20';
      elt.querySelector('input.extent').value = sel.options[sel.selectedIndex].dataset.extent || '';
      sel.value = '';
    });
  })
}

export { loadDataFromURL }
export default addLayerByURL;