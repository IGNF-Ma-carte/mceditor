import LayerShop from 'ol-ext/control/LayerShop'
import carte from '../carte'

// Layerswitcher for edition
const switcher = new LayerShop({
  switcherClass: 'editLayer ol-layerswitcher',
  selection: true,
  collapsed: false,
  minibar: true
})

carte.getMap().addControl(switcher);

// Select a layer
carte.on('read', () => switcher.selectLayer() );
carte.getMap().getLayers().on('add', () => {
  if (!switcher.getSelection()) switcher.selectLayer();
});


// Change current layer on select
carte.getSelect().on('select', (e) => {
  const feature = e.selected[0]
  if (feature) {
    if (feature.getLayer() !== switcher.getSelection()) switcher.selectLayer(feature.getLayer());
  }
})

// Remove layer control
/*
carte.getMap().getLayers().on('remove', () => {
  if (carte.getMap().getLayers().getArray().length === 0) {
    notification.hide();
  }
})*/

export default switcher
