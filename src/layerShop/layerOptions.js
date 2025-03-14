import 'mcutils/charte/charte.js'
import Button from 'ol-ext/control/Button'
import Range from 'ol-ext/util/input/Range'
import notification from 'mcutils/dialog/notification'
import dialog from 'mcutils/dialog/dialog'
import { helpData } from 'mcutils/dialog/helpDialog'
import _T from 'mcutils/i18n/i18n'

import ColorInput from 'ol-ext/util/input/Color'

import charte from 'mcutils/charte/charte.js'
import switcher from './layerSwitcher'
import carte from '../carte'
import ol_ext_element from 'ol-ext/util/element'

import zoomRangeInput from '../util/ZoomSliderLabel'
import { loadDataFromURL } from './layers/addLayerByURL'
import dialogMessage from 'mcutils/dialog/dialogMessage'
import dialogImportFile from 'mcutils/dialog/dialogImportFile'
import { formatMapper } from './layers/loadFile'
import FileSaver from 'file-saver'
import Statistic from 'mcutils/layer/Statistic'
import InputMedia from 'mcutils/control/InputMedia'

import layerAttributes from './layerAttributes'

import html from '../../page/layerShop/layerOptions-page.html'
import saveLayerHTML from '../../page/layerShop/saveLayer-page.html'
import '../../page/layerShop/layerOptions.css'

// Show option dialog
switcher.addControl(new Button({
  html: '<i class="fi-configuration"></i>',
  title: 'Configuration du calque',
  handleClick: function() {
    // No layer selected?
    const layer = switcher.getSelection();
    if(!layer) {
      notification.show('Aucune couche sélectionnée...');
      return;
    } else {
      showOptions(layer);
    }
  }
}), 'bottom')

/** Show layer options dialog
 * @param {ol/Layer} layer
 */
function showOptions(layer) {
  // Show options dialog
  const layerType = layer.get('type');

  dialog.show({
    title: '#' + layer.get('id') + ' - ' + _T('layerOptions') + ' ' + layer.get('title') ,
    className: 'layerOptions',
    content: html,
    buttons: { ok: _T('ok'), cancel: 'annuler' },
    onButton: (b) => {
      if (b === 'ok') setLayerOptions(layer, inputs)
    }
  });
  const content = dialog.getContentElement();
  
  // Handles data-help
  helpData(content);

  // Layer type
  content.dataset.layer = layerType;

  // Handle menu
  content.querySelector('.menu .upload').addEventListener('click', () => {
    dialogImportFile(result => {
      // Add features
      if (result.features) {
        if (result.replace) {
          layer.getSource().clear();  
        }
        layer.getSource().addFeatures(result.features);
      }
    }, {
      title: 'Ajouter des données au calque',
      replace: true
    });
  });
  content.querySelector('.menu .download').addEventListener('click', () => saveLayer(layer));

  // Update layer
  content.querySelector('.menu .reload').addEventListener('click', () => {
    dialog.showWait('Mise à jour de la couche...')
    layer.update(e => {
      if (e.finish) {
        notification.show('Couche mise à jour (' + layer.getSource().getFeatures().length +' objets)')
        dialog.hide();
      } else {
        dialog.getContentElement().innerHTML = e.nb + ' signalements chargés...';
      }
    })
  })

  // Get inputs attr
  const inputs = {};
  ['mode', 'distance', 'maxZoomCluster', 'minSizeCluster', 'maxSizeCluster', 'url', 'extractStyles', 'minZoomLayer', 'maxZoomLayer',
  'extent', 'xmin', 'ymin', 'xmax', 'ymax', 'crop', 'cropSel', 'cropShadow', 'src',
  'centerMap', 'scalex', 'scaley', 'rot', 'xlon', 'xlat',
  'clusterType', 'clusterColor', 'displayClusterPopup', 'selectable', 'multiSelect'].forEach(i => {
    inputs[i] = content.querySelector('[data-attr="'+i+'"]')
  })

  // Attributes
  if (layer.getAttributes) {
    content.querySelector('button.attributes').addEventListener('click', () => {
      layerAttributes(layer)
    })
    /*
    const fix = content.querySelector('input[data-attr="fixAttributes"]');
    fix.checked = layer.get('fixAttributes');
    fix.addEventListener('change', () => {
      layer.set('fixAttributes', fix.checked);
    });
    */
    const listAtt = content.querySelector('ul[data-attr="attributes"]');
    Object.values(layer.getAttributes()).forEach(a => {
      ol_ext_element.create('LI', {
        html: a.name + ' (' + a.type +')',
        'data-type': a.type,
        on: {
          dblclick: () => {
            layerAttributes(layer, a)
          }
        },
        parent: listAtt
      })
    })
  }
  
  // Fill fields linked to zoom options
  const zoomSpan = content.querySelector('.currentZoom span');
  const roundZoom = Math.round(carte.getMap().getView().getZoom() * 10) / 10;
  zoomSpan.innerHTML = roundZoom;
  zoomSpan.addEventListener('click', (e) => {
    if (e.shiftKey) zoomRange.setValue2(roundZoom)
    else zoomRange.setValue(roundZoom)
  });
  
  // Define cluster zoom level
  const clusterRange = new Range({
    input : inputs.maxZoomCluster,
    min: 0,
    max: 20
  });
  zoomRangeInput(clusterRange);
  clusterRange.setValue(layer.get('maxZoomCluster'));
  clusterRange.element.insertBefore(content.querySelector('label.maxZoomCluster'), inputs.maxZoomCluster)

  // Define the range for zoom levels.
  const zoomRange = new Range({
    input : inputs.minZoomLayer,
    input2 : inputs.maxZoomLayer,
  })
  inputs.zoomRange = zoomRange;

  // Set range values with layer min zoom & max zoom if defined. 
  zoomRangeInput(zoomRange, content);
  zoomRange.setValue(Math.max(layer.getMinZoom(), 0));
  zoomRange.setValue2(Math.min(layer.getMaxZoom(), 20));

  // Get layer extent
  let extent = layer.getExtent();
  // has extent and not worldwide
  inputs.extent.checked = (extent && (extent[2]-extent[0] < 38000000 || extent[3]-extent[1] < 38000000));
  // Set values
  inputs.xmin.value = extent ? extent[0] : '';
  inputs.ymin.value = extent ? extent[1] : '';
  inputs.xmax.value = extent ? extent[2] : '';
  inputs.ymax.value = extent ? extent[3] : '';
  // Set current map extent
  content.querySelector('.mapExtent a').addEventListener('click', () => {
    const extent = carte.getMap().getView().calculateExtent();
    ['xmin', 'ymin', 'xmax', 'ymax'].forEach((m, i) => inputs[m].value = Math.round(extent[i]*1000)/1000);
    inputs.extent.checked = true;
  })
  // hasExtent ?
  inputs.extent.addEventListener('change', () => {
    if (inputs.extent.checked) content.querySelector('.extentController').dataset.hasExtent = '';
    else delete content.querySelector('.extentController').dataset.hasExtent;
  })
  if (inputs.extent.checked) content.querySelector('.extentController').dataset.hasExtent = '';

  // Crop
  const crop = layer.get('crop') || {};
  const cropButton = content.querySelector('.cropController .selection')
  cropButton.disabled = true;
  const sel = carte.getSelect().getFeatures()
  for (let i = 0; i < sel.getLength(); i++) {
    if (/Polygon/.test(sel.item(i).getGeometry().getType())) {
      cropButton.disabled = false;
      break;
    }
  }
  cropButton.addEventListener('click', () => {
    inputs.cropSel.checked = true;
    inputs.crop.checked = true;
    inputs.crop.disabled = false;
    content.querySelector('.cropController ul').removeAttribute('aria-disabled')
  })
  // Crop color
  inputs.cropColor = new ColorInput({ 
    color: crop.color,
    position: 'fixed',
    input: content.querySelector('[data-attr="cropColor"]')
  })
  inputs.cropShadow.checked = !!crop.shadow;
  inputs.crop.checked = !!crop.coordinates;
  inputs.crop.disabled = !crop.coordinates;
  // Disable list
  if (!inputs.crop.checked) {
    content.querySelector('.cropController ul').setAttribute('aria-disabled', '')
  }
  inputs.crop.addEventListener('change', () => {
    if (inputs.crop.checked) {
      content.querySelector('.cropController ul').removeAttribute('aria-disabled')
    } else {
      content.querySelector('.cropController ul').setAttribute('aria-disabled', '')
    }
  })

  // Special layer defs
  switch (layerType) {
    case 'Vector' :
    case 'WFS':
    case 'report':
    case 'file' : {
      // Get mode
      inputs.mode.value = layer.getMode();
      inputs.mode.parentNode.dataset.mode = layer.getMode();
      inputs.mode.addEventListener('change', () => {
        inputs.mode.parentNode.dataset.mode = inputs.mode.value;
      })

      // Cluster
      inputs.distance.value = layer.get('clusterDistance');
      inputs.maxZoomCluster.value = layer.get('maxZoomCluster') || '';
      inputs.minSizeCluster.value = layer.get('minSizeCluster') || 8;
      inputs.maxSizeCluster.value = layer.get('maxSizeCluster') || 20;
      window.layershowoptions = layer;
      // Cluster color / mode
      inputs.clusterType.value = layer.get('clusterType');
      inputs.clusterType.parentNode.dataset.type = layer.get('clusterType');
      inputs.clusterType.addEventListener('change', () => {
        inputs.clusterType.parentNode.dataset.type = inputs.clusterType.value;
      })

      // Cluster color
      inputs.clusterColor = new ColorInput({ 
        color: layer.get('clusterColor') || '#336699',
        position: 'fixed',
        input: content.querySelector('[data-attr="clusterColor"]')
      })

      // Zoom or display popup on click
      inputs.displayClusterPopup.checked = layer.get('displayClusterPopup');

      // Select
      inputs.selectable.checked = (layer.get('selectable') !== false);
      inputs.selectable.addEventListener('change', e => {
        inputs.multiSelect.disabled = !inputs.selectable.checked
      })
      inputs.multiSelect.disabled = !inputs.selectable.checked

      // Multi select
      inputs.multiSelect.checked = layer.get('multiSelect');
  
      if (layerType === 'file') {
        inputs.url.value = layer.get('url');
        inputs.extractStyles.checked = !!layer.get('extractStyles');
      }
      break;
    }
    case 'Statistique': {
      const stat = layer.getStatistic();
      content.querySelector('.options.Statistique span').innerText = Statistic.typeString[stat.typeMap];
      if (layer.hasVectorStyle()) {
        content.querySelector('.options.Statistique').dataset.convert = '';
        if (!layer.hasVectorStyle(true)) {
          content.querySelector('.options.Statistique .convert').classList.add('disabled');
          content.querySelector('.options.Statistique .convert').querySelector('input').disabled = true;
        }
      } else {
        delete content.querySelector('.options.Statistique').dataset.convert;
      }
      content.querySelector('.options.Statistique button').addEventListener('click', () => {
        const newLayer = layer.getVectorStyle(content.querySelector('.options.Statistique .convert input').checked);
        if (newLayer) {
          // insert new layer
          const index = carte.getMap().getLayers().getArray().indexOf(switcher.getSelection());
          carte.getMap().getLayers().insertAt(index, newLayer);
          carte.getMap().getLayers().remove(layer);
          switcher.selectLayer(newLayer);
          // Show options
          showOptions(newLayer);
        }
      })
      break;
    }
    // Color
    case 'Color': {
      inputs.color = new ColorInput({ 
        color: layer.get('color') || '',
        position: 'fixed',
        input: content.querySelector('[data-attr="color"]')
      })
      break;
    }
    // GeoImage
    case 'GeoImage': {
      // Input media src
      inputs.src.value = layer.getSource().getGeoImage().src;
      new InputMedia({
        input: inputs.src,
        add: true,
        fullpath: true
      })
      // Scale
      inputs.scalex.value = layer.getSource().getScale()[0];
      inputs.scaley.value = layer.getSource().getScale()[1];
      const scaleDiv = content.querySelector('li.scale')
      inputs.scalex.addEventListener('change', () => {
        if (scaleDiv.classList.contains('lock')) {
          inputs.scaley.value = inputs.scalex.value
        }
      })
      if (layer.getSource().getScale()[0] === layer.getSource().getScale()[1]) {
        scaleDiv.classList.add('lock')
        inputs.scaley.disabled = true;
      } else {
        scaleDiv.classList.remove('lock')
        inputs.scaley.disabled = false;
      }
      scaleDiv.querySelector('.fa-lock').addEventListener('click', () => {
        scaleDiv.classList.toggle('lock')
        if (scaleDiv.classList.contains('lock')) {
          inputs.scaley.disabled = true;
          inputs.scaley.value = inputs.scalex.value;
        } else {
          inputs.scaley.disabled = false;
        }
      })
      // Position 
      inputs.xlon.value = layer.getSource().getCenter()[0];
      inputs.xlat.value = layer.getSource().getCenter()[1];
      // Rotation
      inputs.rot.value = layer.getSource().getRotation() * 180 / Math.PI;
      // Center map
      inputs.centerMap.addEventListener('click', () => {
        const center = carte.getMap().getView().getCenter()
        inputs.xlon.value = center[0];
        inputs.xlat.value = center[1];
      })
      break;
    }
  }
  window.inputs = inputs
}


/** Set layer options
 * @param {ol/Layer} layer
 * @param {Object} inputs list of inputs / values
 */
function setLayerOptions(layer, inputs) {
  const layerType = layer.get('type');

  // Zoom level
  layer.setMinZoom(inputs.zoomRange.getMin() || -Infinity)
  layer.setMaxZoom(inputs.zoomRange.getMax() < 20 ? inputs.zoomRange.getMax() : Infinity)

  // Extent
  if (inputs.extent.checked) {
    const extent = [];
    ['xmin','ymin','xmax','ymax'].forEach(x => {
      const v = parseFloat(inputs[x].value);
      if (v) extent.push(v);
    })
    if (extent.length == 4) layer.setExtent(extent);
  } else {
    layer.setExtent(undefined)
  }

  // Crop
  if (inputs.crop.checked) {
    // Current crop
    const crop = layer.get('crop') || {};
    crop.shadow = inputs.cropShadow.checked;
    crop.color = inputs.cropColor.getColor();
    // Get current selection
    if (inputs.cropSel.checked) {
      const sel = carte.getSelect().getFeatures()
      for (let i = 0; i < sel.getLength(); i++) {
        if (/Polygon/.test(sel.item(i).getGeometry().getType())) {
          let coords = sel.item(i).getGeometry().getCoordinates()
          if (sel.item(i).getGeometry().getType() === 'Polygon') coords = [coords]
          crop.coordinates = coords;
        }
        break;
      }
    }
    layer.setCrop(crop);
  } else {
    layer.setCrop()
  }

  // Special options
  switch(layerType) {
    case 'Vector': 
    case 'WFS':
    case 'report':
    case 'file': {
      // Set layer mode / cluster
      layer.setMode(inputs.mode.value, {
        clusterDistance: inputs.distance.value,
        maxZoomCluster: inputs.maxZoomCluster.value,
        minSizeCluster: parseInt(inputs.minSizeCluster.value),
        maxSizeCluster: parseInt(inputs.maxSizeCluster.value),
        clusterType: inputs.clusterType.value,
        clusterColor: inputs.clusterColor.getColor(),
        displayClusterPopup: inputs.displayClusterPopup.checked,
      })

      // Selectable
      layer.set('selectable', inputs.selectable.checked);

      // Multi select
      layer.set('multiSelect', inputs.multiSelect.checked);

      if (layerType === 'file') {
        const url = inputs.url.value;
        // Load new File
        if (url !== layer.get('url') || layer.get('extractStyles') !== inputs.extractStyles.checked) {
          layer.getSource().clear();
          layer.set('url', inputs.url.value);
          layer.set('extractStyles', inputs.extractStyles.checked);
          dialog.showWait('Chargement en cours...')
          loadDataFromURL(layer, inputs.url.value, inputs.extractStyles.checked);
        }
      }
      break;
    }
    case 'Color': {
      layer.setColor(inputs.color.getValue())
      break;
    }
    // GeoImage
    case 'GeoImage': {
      if (layer.getSource().getGeoImage().src !== inputs.src.value) layer.getSource().getGeoImage().src = inputs.src.value;
      layer.getSource().setScale([parseFloat(inputs.scalex.value), parseFloat(inputs.scaley.value)]);
      layer.getSource().setCenter([parseFloat(inputs.xlon.value), parseFloat(inputs.xlat.value)]);
      layer.getSource().setRotation(parseFloat(inputs.rot.value) * Math.PI / 180);
      break;
    }
  }
  switcher.drawPanel();
  // close
  dialog.close();
}

/** Save layer in a file
 * @param {ol/Vector} layer
 */
function saveLayer(layer) {
  // Features to save
  const features = layer.getSource().getFeatures();
  if (!features.length) {
    dialogMessage.showAlert('Aucune données à enregistrer<br/>dans ce calque...')
    return;
  }
  // Dialog
  const content = ol_ext_element.create('DIV', { html: saveLayerHTML })
  charte.setInputPlaceholder(content);
  charte.setInputValue(content.querySelector('input'), layer.get('title') || '');
  content.querySelector('.currentLayer span').innerText = layer.get('title') || '';
  // Show
  dialogMessage.show({
    title: 'Enregistrer les données du calque',
    className: 'saveLayer',
    content: content,
    buttons: { submit: 'enregistrer', cancel: 'annuler'},
    onButton: (b, inputs) => {
      if (b === 'submit') {
        dialogMessage.close();
        dialog.close();
        const format = formatMapper[inputs.format.value];
        format._decimals = parseInt(inputs.accuracy.value)
        const data = format.writeFeatures(features, {
          featureProjection: carte.getMap().getView().getProjection(),
          rightHanded: true
        })
        const rex = new RegExp('\\.' + inputs.format.value + '$', 'i');
        const name = (inputs.name.value || data).replace(rex, '') + '.' + inputs.format.value;
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, name);
        notification.show(features.length + ' objets enregistrés...')
      }
    }
  })
  helpData(dialogMessage.getContentElement());
  // Format
  dialogMessage.getContentElement().dataset.format = dialogMessage.getContentElement().querySelector('.format').value
  dialogMessage.getContentElement().querySelector('.format').addEventListener('change', e => {
    dialogMessage.getContentElement().dataset.format = e.target.value
  })
}