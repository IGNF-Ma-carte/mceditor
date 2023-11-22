import carte from '../../carte'
import ol_ext_element from 'ol-ext/util/element'
import dialog from "mcutils/dialog/dialog"
import GeoImage from 'mcutils/format/layer/Geoimage'
import { toLonLat, fromLonLat } from 'ol/proj'
import { insertLayer } from './loadLayer';
import InputMedia from 'mcutils/control/InputMedia'

import html from '../../../page/layerShop/layers/addLayerGeoImage.html'
import '../../../page/layerShop/layers/addLayerGeoImage.css'

const content = ol_ext_element.create('DIV', {
  html: html
})

// Get map center as input (lon,lat)
function getMapCenter() {
  const center = carte.getMap().getView().getCenter();
  const lonlat = toLonLat(center, carte.getMap().getView().getProjection())
  content.querySelector('input.lon').value = lonlat[0]
  content.querySelector('input.lat').value = lonlat[1]
  content.querySelector('input.lon').classList.remove('invalid')
  content.querySelector('input.lat').classList.remove('invalid')
}

// Use map center
content.querySelector('a.center').addEventListener('click', getMapCenter)
// Default images
content.querySelector('select').addEventListener('change', e => {
  const sel = e.target;
  const option = sel.options[sel.selectedIndex]
  content.querySelector('input.title').value = sel.options[sel.selectedIndex].text
  content.querySelector('input.url').value = sel.value
  content.querySelector('input.cors').checked = true;
  content.querySelector('input.scale').value = option.dataset.scale
  content.querySelector('input.copy').value = option.dataset.copy
  if (!content.querySelector('input.lon').value) getMapCenter()
  sel.value = '';
})
// Input media
new InputMedia({ 
  input: content.querySelector('input.url'),
  add: true,
  fullpath: true
});
// Reset invalid fields
['title', 'lon', 'lat'].forEach( k => {
  content.querySelector('input.'+k).addEventListener('change', e => {
    e.target.classList.remove('invalid')
  })
});

function addLayerGeoImage() {
  dialog.show({
    title: 'Ajouter une image',
    content: content,
    className: 'layerGeoImage',
    buttons: { ok: 'ok', cancel: 'annuler' },
    onButton: (b, inputs) => {
      // reset
      content.querySelectorAll('.invalid').forEach(k => {
        k.classList.remove('invalid')
      })
      // Add layer
      if (b === 'ok') {
        ['title', 'url', 'lon', 'lat'].forEach(k => {
          if (!inputs[k].value) {
            inputs[k].classList.add('invalid')
          }
        })
        if (content.querySelectorAll('.invalid').length) {
          dialog.element.classList.add('dlgerror')
          dialog.show();
          return
        }
        const center = fromLonLat([parseFloat(content.querySelector('.lon').value), parseFloat(content.querySelector('.lat').value)])
        const layer = (new GeoImage).read({
          type: 'GeoImage',
          title: inputs.title.value,
          url: inputs.url.value,
          imageCenter: center,
          imageRotate: (parseFloat(inputs.rot.value) || 0) * Math.PI / 180,
          imageScale: parseFloat(content.querySelector('.scale').value),
          crossOrigin: content.querySelector('input.cors').checked,
          copyright: content.querySelector('.copy').value
        })
        insertLayer(layer)
      }
    }
  })
  // reset
  content.querySelector('input.cors').checked = true;
  content.querySelectorAll('.invalid').forEach(k => {
    k.classList.remove('invalid')
  })
}

export default addLayerGeoImage