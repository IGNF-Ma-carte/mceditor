import dialog from "mcutils/dialog/dialog"
import ECReport from 'mcutils/layer/ECReport.js';
import { insertLayer } from "./loadLayer";
import notification from "mcutils/dialog/notification";

import html from '../../../page/layerShop/layers/addLayerReports-page.html'
import '../../../page/layerShop/layers/addLayerReports.css'

/** Add Espace Collaboratif layer
 * 
 */
function addLayerECReports() {
  dialog.show({
    content: html,
    title: 'Ajouter une couche de signalement',
    className: 'eco-report',
    buttons: { submit: 'ajouter', cancel: 'annuler' },
    onButton: (b, inputs) => { 
      if (b === 'submit') {
        const status = [];
        Array.prototype.forEach.call(inputs.status.options, o => {
          if (o.selected) status.push(o.value)
        })
        const layer = new ECReport({
          communities: inputs.communitie.value,
          maxFeatures: inputs.maxFeatures.value,
          status: status
        })
        let cancel = false;
        dialog.show({
          className: 'wait',
          closeBox: false,
          content: 'Chargement en cours...',
          buttons: { cancel: 'annuler' },
          onButton: () => cancel = true
        });
        layer.reload(e => {
          if (!e.finish) {
            dialog.getContentElement().innerHTML = e.nb + ' signalements chargés...';
          } else {
            dialog.hide();
            setTimeout(() => notification.show(layer.getSource().getFeatures().length +' objets chargés...'));
          }
          return !cancel;
        })
        insertLayer(layer);
      }
    }
  })
}

export default addLayerECReports