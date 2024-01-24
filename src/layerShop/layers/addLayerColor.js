import ol_ext_element from 'ol-ext/util/element'
import dialog from "mcutils/dialog/dialog"
import ColorInput from 'ol-ext/util/input/Color'
import { insertLayer } from './loadLayer';
import Color from 'mcutils/layer/Color';

import html from '../../../page/layerShop/layers/addLayerColor-page.html'
import '../../../page/layerShop/layers/addLayerColor.css'

const content = ol_ext_element.create('DIV', {
  html: html
})
const colorInput = new ColorInput({ 
  position: 'fixed',
  input: content.querySelector('input.color'),
  parent: content
})

function addLayerColor() {
  dialog.show({
    title: 'Ajouter une couche colorée',
    content: content,
    className: 'layerColor',
    buttons: { ok: 'ok', cancel: 'annuler' },
    onButton: b => {
      if (b === 'ok') {
        const layer = new Color({
          title: content.querySelector('input').value || 'couleur',
          mode: content.querySelector('select').value,
          color: colorInput.getValue()
        })
        insertLayer(layer)
      }
    }
  })
}

export default addLayerColor