import Button from 'ol-ext/control/Button'
import dialog from 'mcutils/dialog/dialog';
import switcher from "./layerSwitcher";

import element from 'ol-ext/util/element'
import Legend from 'ol-ext/legend/Legend'
import LegendImage from 'mcutils/ol/LegendImage'
import LegendFormat from 'mcutils/format/Legend'
// import LegendImage from 'ol-ext/legend/Image'

import charte from 'mcutils/charte/charte';
import InputMedia from 'mcutils/control/InputMedia';
import LegendControl from 'mcutils/control/Legend';

import html from '../../page/layerShop/layerLegend.html'
import '../../page/layerShop/layerLegend.css'
import carte from '../carte';

/** Dialog to add new file layer
 */
switcher.addControl(new Button({
  html: '<i class="fg-map-legend"></i>',
  title: 'Légende de la couche',
  handleClick: setLegend
}), 'bottom')


function setLegend() {
  const layer = switcher.getSelection();
  const initial = layer._legend;
  const legend = {}
  let type;

  // Dialog
  dialog.show({
    title: 'Légende du calque',
    className: 'layerLegend',
    closeBox: false,
    content: html,
    buttons: { ok: 'ok' },
    onButton: () => {
      if (legend[type].getItems().getLength()) {
        layer._legend = legend[type]
        layer._legend.set('type', type)
      } else {
        delete layer._legend;
      }
      // Replace legend in the carte legend
      if (initial && initial !== layer._legend) {
        const items = carte.getControl('legend').getLegend().getItems();
        const pos = items.getArray().indexOf(initial)
        if (pos >= 0) {
          items.remove(initial)
          if (layer._legend) items.insertAt(pos, layer._legend)
        }
      }
      // Has changed
      carte.changed();
      lcontrol.remove();
    }
  })
  const content = dialog.getContentElement();

  // Legend by type
  if (layer._legend && layer._legend.get('type') === 'custom') {
    type = 'custom'
    legend.custom = layer._legend;
    legend.image = new Legend({ title: legend[type].getTitle(), layer: layer })
  } else {
    type = 'image'
    legend.image = layer._legend || new Legend({ layer: layer });
    legend.custom = new Legend({ title: legend[type].getTitle(), layer: layer, size: [28,20], margin: 6 })
    legend.custom.set('lineHeight', 35)
  }

  // Legend control (for custom)
  const lcontrol = new LegendControl({
    symbolLib: carte.getSymbolLib(), 
    legend: legend.custom
  });
  const customTab = content.querySelector('[data-role="tabs"] > [data-tab="custom"]')
  customTab.appendChild(lcontrol.element)

  element.create('LABEL', { text: 'Hauteur des lignes :', parent: customTab });
  const lheight = element.create('INPUT', {
    type: 'number',
    value: legend.custom.get('lineHeight'),
    min: 0,
    change: () => {
      legend.custom.set('lineHeight', parseInt(lheight.value))
    },
    parent: customTab
  })

  // Legend from statistic
  const statLegend = layer.getStatLegend ? layer.getStatLegend() : [];
  if (statLegend.length) {
    element.create('BUTTON', { 
      text: 'Utiliser la statistique', 
      className: 'statLegend button button-ghost',
      click: () => {
        legend.custom.getItems().clear();
        statLegend.forEach(item => {
          legend.custom.addItem(item)
        });
      },
      parent: customTab 
    });
  }
  // Legend from layer style
  const styleLegend = layer.getConditionStyle ? layer.getConditionStyle() : [];
  if (styleLegend.length) {
    element.create('BUTTON', { 
      text: 'Depuis le style du calque', 
      className: 'styleLegend button button-ghost',
      click: () => {
        const items = []
        styleLegend.forEach(item => {
          if (item.symbol) {
            items.push({
              name: item.title,
              type: item.symbol.getType(),
              style: item.symbol.getIgnStyle()
            })
          }
        });
        // Reset légend
        legend.custom.getItems().clear();
        const reader = new LegendFormat();
        reader.read(legend.custom, {items: items}, true)
      },
      parent: customTab 
    });
  }

  // Check service legend
  let img;
  switch (layer.get('type')) {
    case 'WMS': {
      if (layer.get('wmsparam').data.legend) {
        img = layer.get('wmsparam').data.legend[0]
      }
      break;
    }
    case 'WMTS': {
      if (layer.get('wmtsparam').data.legend) {
        img = layer.get('wmtsparam').data.legend[0]
      }
      break;
    }
  }
  // Image
  const inputImage = new InputMedia({
    add: true,
    fullpath: true,
    useCors: true,
    parent: content.querySelector('[data-role="tabs"] > [data-tab="image"]')
  })
  inputImage.on('load', () => {
    if (!inputImage.get('crossOrigin')) {
      inputImage.input.classList.add('invalid')
    }
  })
  inputImage.input.addEventListener('change', () => {
    legend[type].getItems().clear();
    legend[type].addItem(new LegendImage({ src: inputImage.getValue() }))
  })
  // Service image
  if (img) {
    element.create('A', { 
      text: 'utiliser la légende du flux',
      className: 'article button',
      click: () => {
        legend.image.getItems().clear();
        legend.image.addItem(new LegendImage({ src: img }))
        inputImage.setValue(img)
      },
      parent: content.querySelector('[data-role="tabs"] > [data-tab="image"]')
    })
  }

  // Tabs
  const tabs = content.querySelector('[data-role="tabs"]')
  charte.initTabList(tabs, t => {
    type = t;
    content.querySelector('.legend').innerHTML = '';
    content.querySelector('.legend').appendChild(legend[type].getCanvas())
  });
  
  // Select item
  switch(type) {
    case 'custom': {
      charte.setTabList(tabs, 'custom')
      break;
    }
    default: {
      charte.setTabList(tabs, 'image')
      const item = legend[type].getItems().item(0)
      if (item) inputImage.setValue(item.get('src') || '');
      break;
    }
  }

  // Title
  const inputTitle = content.querySelector('.title')
  inputTitle.value = legend[type].getTitle();
  inputTitle.addEventListener('change', () => {
    legend.custom.setTitle(inputTitle.value)
    legend.image.setTitle(inputTitle.value)
  })

  // Display legend
  content.querySelector('.legend').appendChild(legend[type].getCanvas())
}