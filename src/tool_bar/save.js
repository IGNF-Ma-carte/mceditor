import saveCarteDialog from 'mcutils/dialog/saveCarte';
import dialog from 'mcutils/dialog/dialog';
import _T from 'mcutils/i18n/i18n';
import charte from "mcutils/charte/charte"
import { connectDialog } from 'mcutils/charte/macarte';
import { transformExtent } from 'ol/proj'
import api from 'mcutils/api/api';

import FileSaver from 'file-saver'

import carte from "../carte";
import notification from 'mcutils/dialog/notification';

// Upload carte
charte.addTool('upload', 'fi-download', 'Enregistrer dans un fichier...', (id, e) => {
  const data = carte.write(e.shiftKey);
  
  // Save in a file (use control to remove indent)
  const blob = new Blob([JSON.stringify(data, null, e.ctrlKey ? undefined : ' ')], {type: "text/plain;charset=utf-8"});
  FileSaver.saveAs(blob, "carte.carte");
})

// Save carte / saveas
charte.addTool('save', 'fi-save', 'Enregistrer', () => {
  // Has the map already been saved ?
  if (!carte.get('id')) {
    saveCarteDialog(carte, save);
    return;
  }

  // Ask for action
  dialog.show({
    title: _T('saveTitle'),
    content: 'Enregistrer la carte sur votre compte ou enregistrer une copie',
    className: 'saveTool',
    buttons: {
      save : _T('save'),
      saveas : _T('saveAs'),
      cancel: _T('cancel')
    },
    onButton: (b) => {
      switch(b) {
        case 'save': {
          save(carte); 
          break;
        }
        case 'saveas': {
          saveCarteDialog(carte, save, { saveAs: true }); 
          break;
        }
      }
    }
  })
})

/**
 * Handles saving map
 * @param {*} c 
 */
function save(carte) {
  // Meta data
  let metadata = carte.get('atlas');
  metadata.type = 'macarte';
  // Premium EDUGEO
  metadata.premium = api.getPremium();
  metadata.bbox = transformExtent(
    carte.getMap().getView().calculateExtent(), 
    carte.getMap().getView().getProjection(), 
    'EPSG:4326'
  );

  // Write carte data
  const data = carte.write();

  // Post the map
  const postMap = function() {
    dialog.showWait('Enregistrement en cours...');
    // Do something when post
    function onpost(response) {
      if (response.status == 401) {
        // Connect and iterate
        connectDialog(postMap);
      } else if (response.status == 418) {
        dialog.showAlert('Une erreur s\'est produite...<br/>Il est possible que votre carte se soit mal enregistrée...<br/>'
          + response.status);
      } else if (response.status) {
        dialog.showAlert('Impossible d\'enregistrer la carte<br/>' + response.status);
      } else {
        dialog.hide();
        // Update id
        if (response.view_id) {
          carte.set('id', response.view_id);
        }
        // Get save info
        if (!metadata.edit_id) {
          carte.set('atlas', response);
        }
        notification.show('La carte a bien été enregistrée...')
        carte.dispatchEvent({ type: 'save' })
      }
    }
    // Post or update
    if (metadata.edit_id) {
      api.updateMapFile(metadata.edit_id, data, onpost)
    } else {
      api.postMap(metadata, data, onpost);
    }
  }
  // Try post the map
  postMap();
}
