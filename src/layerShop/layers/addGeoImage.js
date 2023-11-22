import carte from '../../carte'
import ol_ext_element from 'ol-ext/util/element'
import dialog from "mcutils/dialog/dialog"
import GeoImage from 'mcutils/format/layer/Geoimage'
import { toLonLat, fromLonLat } from 'ol/proj'
import { insertLayer } from './loadLayer';

import html from '../../../page/layerShop/layers/addLayerGeoImage.html'
import '../../../page/layerShop/layers/addLayerGeoImage.css'

const content = ol_ext_element.create('DIV', {
  html: html
})
content.querySelector('a.center').addEventListener('click', getMapCenter)
function getMapCenter() {
  const center = carte.getMap().getView().getCenter();
  const lonlat = toLonLat(center, carte.getMap().getView().getProjection())
  content.querySelector('input.lon').value = lonlat[0]
  content.querySelector('input.lat').value = lonlat[1]
}
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

function addLayerGeoImage() {
  dialog.show({
    title: 'Ajouter une image',
    content: content,
    className: 'layerGeoImage',
    buttons: { ok: 'ok', cancel: 'annuler' },
    onButton: b => {
      // reset
      content.querySelector('.title').classList.remove('invalid')
      content.querySelector('.title').classList.remove('invalid')
      // Add layer
      if (b === 'ok') {
        const title = content.querySelector('.title').value;
        const url = content.querySelector('.url').value;
        if (!title) content.querySelector('.title').classList.add('invalid')
        if (!url) content.querySelector('.url').classList.add('invalid')
        if (!title || !url) {
          dialog.show();
          return
        }
        const center = fromLonLat([parseFloat(content.querySelector('.lon').value), parseFloat(content.querySelector('.lat').value)])
        const layer = (new GeoImage).read({
          type: 'GeoImage',
          title: title,
          url: url,
          imageCenter: center,
          imageRotate: 0,
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
  content.querySelector('.title').classList.remove('invalid')
  content.querySelector('.title').classList.remove('invalid')
}

export default addLayerGeoImage