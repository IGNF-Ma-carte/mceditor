import element from 'ol-ext/util/element'
import dialog from "mcutils/dialog/dialog"
import guichetAPI from 'mcutils/guichet/api'
import { insertLayer } from "./loadLayer";
import { transformExtent } from 'ol/proj'
import WMTSFormat from 'mcutils/format/layer/WMTS'
import ECoFormat from 'mcutils/format/layer/ECo'

import carte from '../../carte';

import '../../../page/layerShop/layers/ECConnect.css'

/* Connexion dialog */
function connect(cback, error) {
  // Allready connected
  if (!error && guichetAPI.isConnected()) {
    dialog.showWait('chargement...');
    guichetAPI.getMe(resp => {
      if (resp.error) {
        connect(cback, true)
      } else {
        dialog.close()
        setTimeout(() => cback(resp))
      }
    })
    return;
  }
  // Show dialog
  carte.authenticate(() => connect(cback))
}

/** Add layers from a guichet in the map
 * @param {Array<EcoJsonLayer>} layers
 */
function loadLayersGuichet(layers) {
  if (!layers || !layers.length) return;
  layers.sort((a,b) => a.order - b.order)
  layers.forEach(l => {
    switch (l.type) {
      case 'feature-type': {
        if (l.table.tile_zoom_level) {
          console.log('FEATURE-TYPE', l.table.name, l.visibility)
          const format = new ECoFormat()
          const layer = format.read({
            type: 'ECo',
            name: l.table.name,
            title: l.table.title,
            visibility: l.visibility,
            opacity: l.opacity,
            description: l.description,
            minZoom: l.table.min_zoom_level,
            maxZoom: l.table.max_zoom_level < 20 ? l.table.max_zoom_level : null,
            table: l.table
          })
          insertLayer(layer)
        } else {
          console.warn('FEATURE-TYPE', l.table.name, '(no tile zoom level)', l)
        }
        break;
      }
      case 'geoservice': {
        if (!l.geoservice) {
          console.warn('NO GEOSERVICE: ', l)
          break;
        }
        console.log('FEATURE-TYPE', l.geoservice.title, l.visibility)
        let extent = l.geoservice.map_extent.split(',').map(x => parseFloat(x));
        extent = transformExtent(extent, 'EPSG:4326', 'EPSG:3857')
        if (l.geoservice.type === 'WMTS') {
          const newl = {
            "type": "WMTS",
            "name": "",
            "title": l.geoservice.title,
            "visibility": l.visibility,
            "opacity": l.opacity,
            "copyright": "",
            "grayscale": false,
            "blendMode": "",
            "minZoom": l.geoservice.min_zoom,
            "maxZoom": l.geoservice.max_zoom,
            "crop": {},
            "extent": extent,
            "wmtsparam": {
              "layer": {
                "title": l.geoservice.title,
                "extent": extent,
                "abstract": l.geoservice.description,
                "maxResolution": 156543.03392804097
              },
              "source": {
                "url": l.geoservice.url,
                "layer": l.geoservice.layers,
                "matrixSet": "PM",
                "format": l.geoservice.format,
                "projection": "EPSG:3857",
                "tilePrefix": false,
                "minZoom": l.geoservice.min_zoom,
                "maxZoom": l.geoservice.max_zoom,
                "style": l.geoservice.style || "normal",
                "attributions": "IGN",
                "crossOrigin": "anonymous",
                "wrapX": true
              },
              "data": {
                "title": l.geoservice.title,
                "abstract": l.geoservice.description,
                "legend": []
              }
            }
          }
          const format = new WMTSFormat()
          insertLayer(format.read(newl))
        }
        break;
      }
    }
  })
}

/** Dialog to prompt for layers 
 * @param {Array<EcoJsonLayer>} layers
 * @param {string} title
 */
function layerChoice(layers, title) {
  if (!layers.length) {
    dialog.showMessage('Pas de couche disponible pour ce guichet...')
    return;
  }
  const div = element.create('DIV')
  const ul = element.create('UL', { parent: div });
  layers.reverse().forEach(l => {
    switch (l.type) {
      case 'feature-type':
      case 'geoservice': {
        const li = element.create('LI', { 
          html: (l.geoservice?.title || l.table.title) + ' (' + (l.geoservice?.type || 'WFS') + ')',
          click: () => { 
            l.selected = !l.selected
            li.classList.toggle('selected')
          },
          parent: ul 
        });
        if (l.table && !l.table.tile_zoom_level) li.classList.add('disabled')
        if (l.geoservice) {
          if (l.geoservice.status !== 'published') li.classList.add('disabled')
          if (l.geoservice.type !== 'WMTS') li.classList.add('disabled')
        }
        break
      }
    }
  })
  dialog.show({
    title: 'Couches du guichet ' + (title || ''),
    className: 'guichet layerGuichet loading',
    content: div,
    buttons: { ok: 'ajouter', cancel: 'annuler' },
    onButton: b => {
      if (b === 'ok') {
        const selected = []
        layers.forEach(l => {
          if (l.selected) selected.push(l)
        })
        loadLayersGuichet(selected)
      }
    }
  })
}

/** Add a layer from a guichet: prompt a dialog to choice a guichet and layers in it
 */
function addLayerGuichet() {
  connect(resp => {
    const communities = resp.communities_member
    if (!communities.length) {
      dialog.showMessage('Vous n\'avez accès à aucun guichet')
      return;
    }
    const ul = element.create('UL')
    dialog.show({
      title: 'Choisir un guichet',
      content: ul,
      className: 'guichet',
      buttons: { cancel: 'annuler' }
    })
    communities.forEach(c => {
      element.create('LI', {
        text: c.community_name,
        click: () => {
          dialog.showWait('chargement des couches...')
          guichetAPI.getFullLayers(c.community_id, layers => layerChoice(layers, c.community_name))
        },
        parent: ul
      })
    })
  })
}

export { loadLayersGuichet, connect }
export default addLayerGuichet