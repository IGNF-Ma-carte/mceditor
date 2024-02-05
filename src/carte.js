import charte from 'mcutils/charte/macarte'
import Carte from 'mcutils/Carte'
import dlgload from 'mcutils/dialog/dialogMessage';
import config from 'mcutils/config/config'

import tmpCarte from './carte/template.carte'
import '../page/edit/map.css'

let firstCarte = true;

const carte = new Carte({
  key: config.apikey,
  target: charte.getAppElement()
});
carte.setSelectStyle({ type:'default' });

// Opening a map
carte.on(['loading', 'read:start'], () => {
  dlgload.showWait('Chargement en cours...');
})

// Set info when read
carte.on('read', () => {
  if (firstCarte) {
    // Get last position in localstorage
    let pos = localStorage.getItem('mc@editorPosition');
    if (pos) {
      pos = JSON.parse(pos);
      if (Array.isArray(pos)) {
        carte.getMap().getView().setCenter(pos);
        carte.getMap().getView().setZoom(pos[2]);
      }
    }
  } else {
    carte.notification('Carte chargée...')
  }
  firstCarte = false;
  dlgload.hide();
})

// Error reading map
carte.on('error', () => {
  dlgload.showAlert('Une erreur est survenue !<br/>Impossible de lire la carte...')
  firstCarte = false;
})

carte.read(tmpCarte)

// Returns a boolean which indicates if features are displayed
// or not regarding the current zoom level.
function hiddenFeatures(lyr) {
  if (!lyr) { return; }
  const currentZoom = carte.getMap().getView().getZoom();
  if (lyr && currentZoom && lyr.getMinZoom() && isFinite(lyr.getMinZoom())) {
    if (lyr.getMinZoom() > currentZoom) {
      return true;
    }
  }
  if (lyr && currentZoom && lyr.getMaxZoom() && isFinite(lyr.getMaxZoom())) {
    if (lyr.getMaxZoom() < currentZoom) {
      return true;
    }
  }
  return false;
}

function isReady() {
  return !firstCarte
}

export default carte
export { hiddenFeatures, isReady }