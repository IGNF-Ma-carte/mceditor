import KML from 'ol/format/KML';
import GPX from 'ol/format/GPX';
import GeoJSON from 'ol/format/GeoJSON'
import GeoJSONX from 'ol-ext/format/GeoJSONX'
import TopoJSON from 'ol/format/TopoJSON';
import VectorSource from 'ol/source/Vector';
import VectorStyle from 'mcutils/layer/VectorStyle';

import switcher from '../layershop'
import { selectMapLayer, insertLayer } from './loadLayer';
import dialogImportFile from 'mcutils/dialog/dialogImportFile'

// Handled data formats
const formatMapper = {
  "geojson" : new GeoJSON(),
  "geojsonx" : new GeoJSONX(),
  "kml" : new KML({
    extractStyles : true
  }),
  "gpx" : new GPX(),
  "topojson": new TopoJSON(),
}

/** Show a dialog to load File.
 */
function loadFileDlg(title, layer) {
  dialogImportFile(result => {
    if (result.carte) {
      selectMapLayer(result.carte);
    } else if (result.features) {
      // Add to current layer
      if (!layer && result.layer) {
        layer = switcher.getSelection();
      }
      // Create a new layer (if none)
      if (!(layer instanceof VectorStyle)) {
        layer = new VectorStyle({
          type: 'Vector',
          title: result.name,
          source: new VectorSource()
        });
        insertLayer(layer)
      }
      // Add features
      layer.getSource().addFeatures(result.features);
    }
  },{
    title: title || 'Importer un fichier local',
    readCarte: true,
    useLayer: !layer && (switcher.getSelection() instanceof VectorStyle),
  })
}

export { formatMapper }
export default loadFileDlg;
