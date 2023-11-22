import loadFileDlg from "./loadFile"
import { importMapLayer } from "./loadLayer"
import addDrawLyr from "./addDrawLayer"
import addLayerByURL from "./addLayerByURL"
import { addLayerWMS, addLayerWMTS } from "./addLayerWMS"
import addGeoportailMVT from "./addGeoportailMVT"
import addLayerFileMVT from "./addLayerFileMVT"
import addLayerECReports from "./addLayerECReports"
import addLayerGuichet from "./addLayerGuichet"
import addLayerColor from "./addLayerColor"
import addGeoImage from "./addGeoImage"

function addLayerFile() { addLayerByURL('file', 'A partir d\'un fichier') }
function addLayerWFS() { addLayerByURL('WFS', 'Couche WFS') }
function addLayerXYS() { addLayerByURL('XYZ', 'Couche XYZ') }
function addLayerMVT() { addLayerByURL('MVT', 'Couche vecteur tuilé') }
function addLayerRSS() { addLayerByURL('RSS', 'Flux RSS') }
function addLayerPattern() { addLayerByURL('Pattern', 'Ajouter un motif') }

/** Loader to add a new layer in a map
 */
const loaders = {
  dessin: addDrawLyr,
  LocalFile: loadFileDlg,
  file: addLayerFile,
  WFS: addLayerWFS,
  map: importMapLayer,
  WMS: addLayerWMS,
  WMTS: addLayerWMTS,
  XYZ: addLayerXYS,
  MVT: addLayerMVT,
  GeoMVT: addGeoportailMVT,
  MVTFile: addLayerFileMVT,
  RSS: addLayerRSS,
  ECReports: addLayerECReports,
  Guichet: addLayerGuichet,
  Color: addLayerColor,
  Pattern: addLayerPattern,
  GeoImage: addGeoImage
}

export default loaders
