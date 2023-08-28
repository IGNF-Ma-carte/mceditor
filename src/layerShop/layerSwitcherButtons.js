import element from 'ol-ext/util/element'
import { boundingExtent } from 'ol/extent'
import switcher from './layerSwitcher'
import notification from 'mcutils/dialog/notification'

import carte from '../carte';

import '../../page/layerShop/layerSwitcherButtons.css'

/* Drawlist event redraw every li component of the layerswitcher
   We'll use it to place&set the lock button */
switcher.on('drawlist', (e) => {
  const div = e.li.querySelector('.ol-layerswitcher-buttons');
  const layer = e.layer;
  // Lock file
  if (layer.selectable) {
    const locked = !layer.selectable();
    const bt = element.create('I', {
      title: 'verrouiller le calque',
      // Based on data-lock value, set lock/unlock button icon
      'data-lock': locked ? '1':'0',
      click: () => {
        layer.selectable(!layer.selectable())
        bt.dataset.lock = layer.selectable() ? '0' : '1';
        // Unselect any selected features
        carte.setSelection(false);
        switcher.dispatchEvent({ type: 'select', layer: switcher.getSelection() })
      },
      parent: div
    })
  }
  //
  const zoomExtent = function(ext) {
    try {
      const view = carte.getMap().getView();
      view.fit(ext);
      view.setZoom(Math.min(view.getZoom() - .2, 16));
      if (layer.getMaxZoom() < view.getZoom()) {
        view.setZoom(layer.getMaxZoom() - .01)
      } else if (layer.getMinZoom() > view.getZoom()) {
        view.setZoom(layer.getMinZoom() + .01)
      }
      if (layer.getMaxResolution() < view.getResolution()) {
        view.setResolution(layer.getMaxResolution() - .01)
      } else if (layer.getMinResolution() > view.getResolution()) {
        view.setResolution(layer.getMinResolution() + .01)
      }
    } catch(e) {
      notification.show('Pas d\'emprise disponible...')
    }
  }
  // Layer crop
  if (layer.getCrop().coordinates) {
    element.create('I', {
      className: 'fi-stop',
      title: 'découpage...',
      click: () => {
        const ext = boundingExtent(layer.getCrop().coordinates[0][0]);
        zoomExtent(ext);
      },
      parent: div
    })
  }
  // Get layer extent
  let extent = layer.getExtent();
  if (!extent && layer.get('type') !== 'WFS' && layer.getSource() && layer.getSource() && layer.getSource().getExtent) {
    extent = layer.getSource().getExtent()
  }
  // Zoom to extent if not worldwide
  if (extent && (extent[2]-extent[0] < 38000000 || extent[3]-extent[1] < 38000000)) {
    element.create('I', {
      className: 'fi-fullscreen-alt',
      title: 'voir l\'étendue du calque...',
      click: () => {
        const ext = layer.getExtent() || layer.getSource().getExtent();
        zoomExtent(ext)
      },
      parent: div
    })
  }
})


