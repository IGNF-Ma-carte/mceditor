import dialog from "mcutils/dialog/dialog";
import dialogImportFile from "mcutils/dialog/dialogImportFile";
import MVT from "mcutils/layer/MVT";
import { insertLayer } from "./loadLayer";

function addLayerFileMVT() {
  dialogImportFile((result) => {
    try {
      const data = JSON.parse(result.data);
      const layer = new MVT({
        title: data.name
      })
      layer.set('style', result.data);
      layer.applyStyle(data);
      insertLayer(layer);
    } catch(e) {
      dialog.showAlert('Impossible de charger ce type de fichier...')
    }
  }, {
    title: 'Charger un fichier de style tuilé',
    className: 'MVT',
    format: 'Charger un fichier de style (json)',
    accept: '.json'
  })
}

export default addLayerFileMVT
