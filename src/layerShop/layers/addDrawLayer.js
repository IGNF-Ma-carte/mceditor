
import VectorStyle from 'mcutils/layer/VectorStyle'
import VectorSource from 'ol/source/Vector';
import dlg from 'mcutils/dialog/dialog'
import { insertLayer } from './loadLayer';
import switcher from '../layerSwitcher';

import '../../../page/layerShop/layers/addDrawLayer.css'
import drawHtml from '../../../page/layerShop/layers/addDrawLayer-page.html'

/**
 * To add a tile layer. Display menu dlg with current formats.
 */
function addDrawLyr() {
  dlg.show({
    content: drawHtml,
    title: 'Ajouter un calque dessin',
    className: 'add-drawlyr',
    buttons: { submit: 'ok', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b === 'submit') {
        // Check valid title
        if (inputs.title.value === '') {
          inputs.title.required = 'required';
          return;
        }
        // Create layer
        const vectorLayer = new VectorStyle({
          type: 'Vector',
          title: inputs.title.value,
          multiSelect: true,
          desc: inputs.desc.value,
          source: new VectorSource()
        })
        // Set layer params
        vectorLayer.getSource().setAttributions(inputs.copy.value);

        // Add layer
        insertLayer(vectorLayer)
        // Refresh switcher
        switcher.drawPanel()
        dlg.close();
      }
    }
  });
 }

 export default addDrawLyr;