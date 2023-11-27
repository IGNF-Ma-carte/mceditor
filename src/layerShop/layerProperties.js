import Slider from 'ol-ext/util/input/Slider'
import ol_ext_element from 'ol-ext/util/element'
import element from 'ol-ext/util/element'
import Button from 'ol-ext/control/Button'
import 'mcutils/format/layer/VectorStyle'
import notification from 'mcutils/dialog/notification'

import switcher from './layerSwitcher'
import carte from '../carte'
import ol_ext_input_PopupBase from 'ol-ext/util/input/PopupBase'
import { addLayerDlg } from './addLayer'
import { insertLayer } from './layers/loadLayer'
import VectorStyle from 'mcutils/layer/VectorStyle'
import VectorSource from 'ol/source/Vector'

import style2IgnStyle from 'mcutils/style/style2IgnStyle'
import setThemes from './layerTheme'
import dialog from 'mcutils/dialog/dialog'

// Blend mode & other filters menu
const blendOpt = element.create('DIV', {
  html: 'Fusion',
  parent: switcher.getBarElement()
})

const selBlend = element.create('SELECT', { 
  className : 'blendfil',
  options: {
    'Normal' : 'normal',
    'Produit' : 'multiply',
    'Superposition' : 'screen',
    'Recouvrement' : 'overlay',
    'Obscurcir' : 'darken',
    'Eclaircir' : 'lighten',
    'Densité couleur -' : 'color-dodge',
    'Densité couleur +' : 'color-burn',
    'Lumière crue' : 'hard-light',
    'Lumière douce' : 'soft-light',
    'Différence' : 'difference',
    'Exclusion' : 'exclusion',
    'Teinte' : 'hue',
    'Saturation' : 'saturation',
    'Couleur' : 'color',
    'Luminosité' : 'luminosity'
  },
  on: {
    change: function() {
      const layer = switcher.getSelection();
      if (!layer) return;
      layer.setBlendMode(selBlend.value)
    }
  },
  parent: blendOpt
})

switcher.on('select', function() {
  const layer = switcher.getSelection();
  if (layer)  {
    // Look whether layer has a blendmode mode or not.
    selBlend.value = layer.get('blendMode')  ? layer.get('blendMode') : 'normal';
  }
});

// Filter options
const filterOpt = element.create('DIV', {
  html: 'Filtre',
  parent: switcher.getBarElement()
})

const selGray = element.create('SELECT', { 
  className : 'grayfil',
  options: {
    'Sans filtre' : 'normal',
    'Noir & blanc' : 'grayscale'
  },
  on: {
    change: function() {
      const layer = switcher.getSelection();
      if (!layer) return;
      switch (selGray.value) {
        case 'grayscale': {
          layer.grayscale(true)
          break;
        }
        default: {
          layer.grayscale(false)
          break;
        }
      }
    }
  },
  parent: filterOpt
})

switcher.on('select', () => {
  const layer = switcher.getSelection();
  if (layer)  {
    // Look whether layer is in grayscale mode or not.
    selGray.value = layer.get('grayscale')  ? 'grayscale' : 'normal';
  }
});

// Opacity slider
const opacityOpt = ol_ext_element.create('DIV', {
  html: 'Opacité',
  className: 'opacity',
  parent: switcher.getBarElement()
})

var opacity = new Slider({
  className: 'opacity',
  hover: true,
  align: 'right',
  type: 'number',
  min: 0,
  max: 100,
  parent: opacityOpt
});

opacity.on('change:value', function(e) {
  switcher.getSelection().setOpacity(e.value/100);
})

switcher.on(['layer:opacity', 'select'], function(e) {
  if (e.layer && e.layer === switcher.getSelection()) {
    opacity.setValue(Math.round(e.layer.getOpacity()*100));
  }
});

// Layer menu
const p = new ol_ext_input_PopupBase({
  hidden: true,
  fixed: true,
  parent: ol_ext_element.create('DIV', { className: 'layerMenu', parent: switcher.getBarElement() })
})
const popup = p.element.querySelector('.ol-popup');
popup.addEventListener('click', () => p.collapse(true));
switcher.on('select', () => p.collapse(true));
p.on('collapse', e => {
  if (e.visible) {
    const layer = switcher.getSelection();
    const layerType = layer.get('type');
    // Vector layer?
    const dessin = /Vector/.test(layerType);
    mergesup.className = mergeinf.className = dessin ? 'active' : 'disabled';
    // WFS / file or stat?
    const file = /WFS|file|ECo|report/.test(layerType) 
      || (/Statistique/.test(layerType)  && !/heatmap|sectoriel/.test(layer.getStatistic().typeMap));
    convert.className = file ? 'active' : 'disabled';
  }
})

// Add layer
ol_ext_element.create('DIV', {
  html: '<i class="fg-layer-alt-add-o"></i> Ajouter un calque...',
  click: () => {
    addLayerDlg();
  },
  parent: popup
})
// Remove Layer
ol_ext_element.create('DIV', {
  html: '<i class="fg-layer-alt-x-o"></i> Supprimer tous les calques',
  click: () => {
    dialog.showAlert(
      'Etes vous sûr de supprimer tous les calques ?<br/>Cette opération est irréversible..', 
      { ok: 'oui', cancel: 'annuler'},
      b => {
        if (b==='ok') {
          const map = carte.getMap();
          map.getLayers().getArray().slice().forEach((l,i) => { if (i) map.removeLayer(l) })
        }
      }
    )
  },
  parent: popup
})
// Handle Themes
ol_ext_element.create('DIV', {
  html: '<i class="fg-tags"></i> Gérer les thèmes',
  click: setThemes,
  parent: popup
})

ol_ext_element.create('DIV', { className: 'separator', parent: popup })

// Visibility
ol_ext_element.create('DIV', {
  html: '<i class="fi-access"></i> Afficher uniquement la sélection',
  click: () => {
    const map = carte.getMap();
    map.getLayers().getArray().slice().forEach(l => l.setVisible(switcher.getSelection()===l))
  },
  parent: popup
})
ol_ext_element.create('DIV', {
  html: '<i class="fi-visible"></i> Tout afficher',
  click: () => {
    const map = carte.getMap();
    map.getLayers().getArray().slice().forEach(l => l.setVisible(true))
  },
  parent: popup
})
ol_ext_element.create('DIV', {
  html: '<i class="fi-unvisible"></i> Tout masquer',
  click: () => {
    const map = carte.getMap();
    map.getLayers().getArray().slice().forEach(l => l.setVisible(false))
  },
  parent: popup
})
ol_ext_element.create('DIV', { className: 'separator', parent: popup })


// Merge sup
const mergesup = ol_ext_element.create('DIV', {
  html: '<i class="fg-layer-upload"></i> Fusionner avec le calque supérieur',
  click: () => {
    const layer = switcher.getSelection();
    const layers = carte.getMap().getLayers().getArray();
    mergeLayers(layer, layers[layers.indexOf(layer)+1])
  },
  parent: popup
})
// Merge inf
const mergeinf = ol_ext_element.create('DIV', {
  html: '<i class="fg-layer-download"></i> Fusionner avec le calque inférieur',
  click: () => {
    const layer = switcher.getSelection();
    const layers = carte.getMap().getLayers().getArray();
    mergeLayers(layer, layers[layers.indexOf(layer)-1])
  },
  parent: popup
})
// Convert to drawing
const convert = ol_ext_element.create('DIV', {
  html: '<i class="fg-layer-alt-poi"></i> Convertir en calque dessin...',
  click: () => {
    const layer = switcher.getSelection();
    let newLayer;
    switch (layer.get('type')) {
      case 'Statistique': {
        newLayer = layer.getVectorStyle(true);
        if (newLayer) {
          // insert new layer
          insertLayer(newLayer);
          carte.getMap().removeLayer(layer);
        } else {
          notification.show('Ce type de couche ne peut pas être converti...')
        }
        break;
      }
      case 'report': {
        newLayer = layer
        layer.set('type', 'Vector');
        carte.getMap().removeLayer(layer);
        insertLayer(layer);
        break;
      }
      case 'ECo': {
        // Convert Feature style to IgnStyle
        layer.getSource().getFeatures().forEach(f => {
          const style = switcher.getSelection().getStyle()(f)
          f.setStyle(style)
          style2IgnStyle(f, true)
        })
      }
      //fallthrough
      default: {
        newLayer = new VectorStyle({
          type: 'Vector',
          source: new VectorSource({
            features: layer.getSource().getFeatures(),
          })
        });
        // Copy attributes
        ['title', 'desc', 'visible', 'opacity', 'minZoom', 'maxZoom', 'attributions'].forEach(a => newLayer.set(a, layer.get(a)));
        // Styles
        newLayer.setIgnStyle(layer.getIgnStyle() || {});
        if (layer.getSource().getAttributions()) {
          newLayer.getSource().setAttributions(layer.getSource().getAttributions()()[0]);
        }
        newLayer.setBlendMode(layer.get('blendMode') || 'normal')
        newLayer.grayscale(layer.get('grayscale'))
        if (layer.getMode && layer.getMode()==='image') newLayer.setMode('image')
        // Replace
        insertLayer(newLayer);
        carte.getMap().removeLayer(layer);
        break;
      }
    }
    // Set the layer legend
    if (layer._legend) {
      newLayer._legend = layer._legend;
      newLayer._legend.setLayer(newLayer);
    }
  },
  parent: popup
})

// Merge 2 layers
function mergeLayers (layer1, layer2) {
  if (layer1  && layer2 && layer1.get('type') === 'Vector'&& layer2.get('type') === 'Vector') {
    layer1.getSource().addFeatures(layer2.getSource().getFeatures());
    carte.getMap().removeLayer(layer2);
  } else {
    notification.show('Seul les calques dessin sont fusionnables...')
  }
}

// Remove layer
switcher.addControl(new Button({
  html: '<i class="fa fa-trash-o"></i>',
  title: 'Supprimer un calque',
  handleClick: function() {

    //1 - Store layer position in the LyrGroup
    const layer = switcher.getSelection();
    if (!layer) { 
      notification.show('Impossible de supprimer la couche.')
      return; 
    }

    const index = carte.getMap().getLayers().getArray().indexOf(layer);
    
    //2 - Remove layer from LyrGroup
    carte.getMap().removeLayer(switcher.getSelection());

    switcher.selectLayer(carte.getMap().getLayers().item(index-1))

    notification.cancel('Une couche vient d\'être supprimée.  ', () => {
      carte.getMap().getLayers().insertAt(index, layer);
      switcher.selectLayer(layer);
    });
  }
}), 'bottom');

