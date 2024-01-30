import Geoportail from 'ol-ext/layer/Geoportail'
import ol_ext_element from 'ol-ext/util/element'
import View from 'ol/View'
import { transformExtent } from 'ol/proj' 

import dialog from 'mcutils/dialog/dialog';
import { wmtsServices } from './addLayerWMS';
import FormatWMTS from 'mcutils/format/layer/WMTS'
import switcher from '../layerSwitcher'

import { insertLayer } from './loadLayer';

import '../../../page/layerShop/layers/addLayerGeoportail.css'
import geopHTML from '../../../page/layerShop/layers/addLayerGeoportail-page.html'

/* Get options WMTS */
function getWMTS(options) {
  const extent = transformExtent(options.bbox, 'EPSG:4326', switcher.getMap().getView().getProjection())
  const view = new View({
    projection: switcher.getMap().getView().getProjection()
  })
  view.setZoom(options.minZoom)
  const maxResolution = view.getResolution()
  view.setZoom(options.maxZoom)
  const minResolution = view.getResolution()
  options.legend = options.legend.filter(l => !/LEGEND.jpg$/.test(l))
  return {
    "type": "WMTS",
    "name": "",
    "title": options.title,
    "description": options.desc,
    "visibility": true,
    "opacity": 1,
    "copyright": "",
    "popupContent": {},
    "grayscale": false,
    "blendMode": "",
    "minZoom": options.minZoom,
    "maxZoom": options.maxZoom,
    "crop": {},
    "extent": extent,
    "wmtsparam": {
      "layer": {
        "title": options.title,
        "extent": extent,
        "abstract": options.desc,
        "maxResolution": maxResolution,
        "minResolution": minResolution
      },
      "source": {
        "url": options.server,
        "layer": options.layer,
        "matrixSet": "PM",
        "format": options.format,
        "projection": "EPSG:3857",
        "tilePrefix": false,
        "minZoom": options.minZoom,
        "maxZoom": options.maxZoom,
        "style": options.style || "normal",
        "attributions": "IGN",
        "crossOrigin": "anonymous",
        "wrapX": true
      },
      "data": {
        "title": options.title,
        "abstract": options.desc,
        "legend": options.legend
      }
    }
  }
}

/** Dialog: Add a geoportail layer 
 */
function addLayerGeoportail() {
  dialog.show({
    title: 'Fonds Géoportail',
    className: 'layerGeoportail',
    content: geopHTML,
    buttons: { submit: 'ajouter', cancel: 'annuler' },
    onButton: (b) => {
      if (b === 'submit' && currentLayer) {
        insertLayer(currentLayer)
        dialog.close();
      }
    }
  })

  let currentLayer;
  const content = dialog.getContentElement()
  const ul = content.querySelector('ul');
  const imgElt = content.querySelector('.preview img')
  imgElt.addEventListener('load', () => imgElt.classList.add('visible'))
  imgElt.addEventListener('error', () => imgElt.classList.remove('visible'))
  ol_ext_element.create('LI', {
    html: '<i class="fa fa-spinner fa-pulse"></i><label>chargement...</label>',
    parent: ul
  })
  // Display list
  Geoportail.getCapabilities().then((cap, themes) => {
    ul.innerHTML = '';
    themes = Object.keys(themes).sort((a, b) => {
      a = wmtsServices[a] || wmtsServices.none
      b = wmtsServices[b] || wmtsServices.none
      return a.index - b.index;
    })
    const format = new FormatWMTS;
    themes.forEach(k => {
      const theme = wmtsServices[k] || wmtsServices.none;
      const li = ol_ext_element.create('LI', {
        className: 'up collapsed',
        html: ol_ext_element.create('DIV', {
          className: 'title',
          html: '<i class="' + theme.icon + '"></i> ' + (theme.title || k),
          click: () => li.classList.toggle('collapsed'),
        }),
        parent: ul
      })
      const ul2 = ol_ext_element.create('UL', { parent: li })
      Object.keys(cap).forEach(l => {
        l = cap[l];
        const layer = format.read(getWMTS(l))
        if (l.theme === k) {
          const li2 = ol_ext_element.create('LI', {
            'data-abstract': l.desc + ' ' + k,
            click: () => {
                ul.querySelectorAll('li').forEach(li => li.classList.remove('selected'))
                li2.classList.add('selected');
                dialog.element.classList.add('hasLayer')
                // new layer
                currentLayer = layer;
                // Show info
                content.querySelector('h3').innerText = currentLayer.get('title')
                content.querySelector('.abstract').innerHTML = currentLayer.get('desc')
                if (layer.get('wmtsparam').data.legend.legend) {
                  ol_ext_element.create('IMG',  {
                    src: layer.get('wmtsparam').data.legend[0],
                    parent: content.querySelector('.abstract')
                  })
                }
                content.querySelector('.preview img').src = currentLayer.getPreview()
                // Update list view
                showList();
            },
            parent: ul2
          });
          ol_ext_element.create('IMG', {
            src: layer.getPreview(),
            on: {
              load: e => e.target.className = 'visible'
            },
            parent: li2
          })
          ol_ext_element.create('LABEL', {
            text: l.title,
            parent: li2
          })
        }
      })
    })
  })
  // Search in list
  function showList() {
    const val = content.querySelector('input').value;
    const rex = new RegExp(val, 'i')
    content.querySelectorAll('li li').forEach(li => {
      if (li.classList.contains('selected') || rex.test(li.innerText) || rex.test(li.dataset.abstract)) {
        li.classList.remove('hidden')
        li.parentNode.parentNode.dataset.show = 1
      } else {
        li.classList.add('hidden')
      }
    })
    // Show title
    content.querySelectorAll('li.up').forEach(li => {
      if (li.dataset.show) {
        li.classList.remove('hidden')
      } else {
        li.classList.add('hidden')
      }
      delete li.dataset.show;
    })
  }
  ol_ext_element.addListener(content.querySelector('input'), ['keyup', 'input'], showList);
}

export default addLayerGeoportail