import { transform } from 'ol/proj'
import { getUrlParameter, getUrlPosition } from 'mcutils/control/url'
import api from 'mcutils/api/api';
import onboarding from './onboarding/onboarding'
import { connectDialog } from 'mcutils/charte/macarte';
import dlgload from 'mcutils/dialog/dialogMessage';
import carte, { isReady } from './carte';
import guichetAPI from 'mcutils/guichet/api';
import { connect, loadLayersGuichet } from './layerShop/layers/addLayerGuichet';
import dialog from 'mcutils/dialog/dialog';


/* LOAD current carte */
function loadFromURL() {
  // Get edit ID in search parameters
  let editID = getUrlParameter('id');
  
  // Try to get ID in the url path: path/ID
  if (!editID) {
    editID = document.location.pathname.split('/').pop();
    // remove id from history
    try {
      const loc = document.location;
      const path = loc.pathname.split('/');
      path.pop();
      window.history.replaceState('', '', loc.origin + path.join('/') + '/');
    } catch (e) { /* ok */ }
  }
  
  // Load map to edit
  if (editID) {
    // console.log(editID)
    // Load story for edition
    const loadEdit = function() {
      setTimeout(() => {
        api.getEditMap(editID, resp => {
          if (resp.error) {
            dlgload.showAlert('Aucune carte à éditer...')
          } else if (resp.type === 'storymap') {
            dlgload.showAlert('Impossible d\'éditer ce type de carte...')
          } else {
            carte.load(resp);
          }
        })
      }, 200)
    }
    // Connect and load story
    if (!api.isConnected()) {
      connectDialog(() => {
        loadEdit()
      });
    } else {
      loadEdit()
    }
  } else {
    // Try to get location and params
    const pos = getUrlPosition();
    const guichet = getUrlParameter('guichet')
    // Launch onboarding
    if (!pos && !guichet) {
      if (!onboarding.defaultHidden()) {
        onboarding.setStep();
      }
    }
    if (pos) {
      const view = carte.getMap().getView();
      view.setCenter(transform([pos.lon, pos.lat], 'EPSG:4326', view.getProjection()))
      view.setZoom(pos.z)
    }
    if (guichet) {
      connect(() => {
        dialog.showWait('Chargement des couches')
        guichetAPI.getFullLayers(guichet, layers => {
          if (layers.error) {
            dialog.showAlert('Impossible de charger les couches')
          } else {
            loadLayersGuichet(layers)
            dialog.hide()
          }
        });
      })
    }
  }
}

// Check url when ready
if (isReady()) {
  loadFromURL()
} else {
  carte.once('read', loadFromURL)
}

export default carte
