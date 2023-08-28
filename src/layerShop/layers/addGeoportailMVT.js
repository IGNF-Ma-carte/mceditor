import charte from "mcutils/charte/charte"
import dialog from "mcutils/dialog/dialog"
import LayerMVT from 'mcutils/layer/MVT'
import ol_ext_element from 'ol-ext/util/element'

import html from '../../../page/layerShop/layers/addGeoportailMVT.html'
import '../../../page/layerShop/layers/addGeoportailMVT.css'
import { insertLayer } from './loadLayer';

function addGeoportailMVT() {
  dialog.show({
    title: 'Geoservice vecteur tuilé',
    className: 'addGeoportailMVT',
    content: html,
    buttons: ['annuler']
  })
  charte.initAccordion(dialog.getContentElement());
  console.log([dialog.getContentElement()])
  dialog.getContentElement().querySelectorAll('[data-url]').forEach(elt => {
    ol_ext_element.create('BUTTON', {
      className: 'button button-colored',
      text: 'ajouter',
      parent: ol_ext_element.create('DIV', { className: 'buttons', parent: elt }),
      click: () => {
        dialog.close();
        const layer = new LayerMVT({
          title: elt.previousElementSibling.innerText,
          url: elt.dataset.url,
          attributions: elt.dataset.attribution
        })
        layer.set('type', 'MVT');
        // Add and select layer
        insertLayer(layer)
      }
    })
  });
}

export default addGeoportailMVT
