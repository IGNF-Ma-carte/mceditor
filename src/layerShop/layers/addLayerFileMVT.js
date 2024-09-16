import dialog from "mcutils/dialog/dialog";
import dialogImportFile from "mcutils/dialog/dialogImportFile";
import MVT from "mcutils/layer/MVT";
import { insertLayer } from "./loadLayer";
import { MapLibreLayer } from '@geoblocks/ol-maplibre-layer';

function addLayerFileMVT() {
  dialogImportFile((result) => {
    try {
      const data = JSON.parse(result.data);
      let layer;
      if (data && Object.keys(data.sources).length > 1) {
        layer = new MapLibreLayer({
          title: data.name,
          type: 'MVT',
          mapLibreOptions: {
            style: data
          },
          attributions: data.copyright
        });
      } else {
        layer = new MVT({
          title: data.name
        })
        layer.applyStyle(data);
      }
      layer.set('style', result.data);
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
