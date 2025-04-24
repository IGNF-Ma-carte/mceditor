import { selectMapLayer } from './layers/loadLayer';
import VectorSource from 'ol/source/Vector';
import VectorStyle from 'mcutils/layer/VectorStyle';
import dialog from 'mcutils/dialog/dialog';
import { insertLayer } from './layers/loadLayer';
import { loadFile } from 'mcutils/dialog/dialogImportFile';
import notification from 'mcutils/dialog/notification';
import ol_ext_element from 'ol-ext/util/element'

// Drop zone
let dragtout;
const dropZone = document.body.querySelector('[data-role="map"]')

dropZone.addEventListener('dragenter', () => {
  clearTimeout(dragtout);
  document.body.dataset.drop = '';
})
dropZone.addEventListener('dragover', () => {
  clearTimeout(dragtout);
  document.body.dataset.drop = '';
})
dropZone.addEventListener('dragleave', () => {
  dragtout = setTimeout(() => delete document.body.dataset.drop, 100)
})
dropZone.addEventListener('dragend', () => {
  delete document.body.dataset.drop
})
dropZone.addEventListener('drop', e => {
  if (e.target.type !== 'file') e.preventDefault();
  delete document.body.dataset.drop;
  const files = e.dataTransfer.files;
  if (files.length) {
    dialog.showWait('Chargement en cours...')
    setTimeout(() => loadFiles(files), 200)
  }
});
// Prevent drop on document (but input:file)
window.addEventListener('dragover', e => {
  if (e.target.tagName !== 'INPUT' || e.target.type !== 'file') {
    e.preventDefault()
  }
});
window.addEventListener('drop', e => {
  if (e.target.tagName !== 'INPUT' || e.target.type !== 'file') {
    e.preventDefault()
  }
});

/* Load files and add new layers
 */
function loadFiles(files) {
  const result = [];
  // Load files
  Array.prototype.forEach.call(files, file => {
    loadFile(file, e => {
      result.push(e)
      // Last file loaded
      if (result.length === files.length) {
        // Only one => add it
        if (result.length === 1) {
          singleLoad(result.pop())
        } else {
          multiLoad(result)
        }
      }
    }, {
      useStyle: true, 
      ignStyle: true,
      silent: true
    })
  })
}

/* Add e new layer to the carte
 */
function addLayer(res) {
  if (!res.features) return false;
  const layer = new VectorStyle({
    type: 'Vector',
    title: res.name || 'Dessin',
    source: new VectorSource({
      features: res.features,
    })
  });
  // Add layer and select
  insertLayer(layer);
  return true;
}

/* Load a single layer
 */
function singleLoad(res) {
  dialog.close();
  setTimeout(() => {
    // read 'macarte' file. Decide whether load, show lyr, etc ..
    if (res.carte) {
      selectMapLayer(res.carte, true)
    } else if (res.features) {
      // add layer and show errors
      const nb = res.features.length
      addLayer(res);
      if (res.error) {
        dialog.showAlert(res.error + ' objet(s) non chargés...'.replace(/\(s\)/g, nb<2 ? '' : 's'))
      }
      notification.show(nb + ' objet(s) importé(s)...'.replace(/\(s\)/g, nb<2 ? '' : 's'))
    } else {
      notification.show('Rien à charger...')
    }
  },100)
}


/* Show info and load multi layer
 */
function multiLoad(result) {
  const ul = ol_ext_element.create('UL')
  // Show file info
  let nb = 0;
  result.forEach(r => {
    const li = ol_ext_element.create('LI', {
      html: ol_ext_element.create('SPAN', { text: r.name }),
      parent: ul
    })
    if (r.features) {
      nb++;
      li.className = 'valid';
      ol_ext_element.create('B', {
        text: r.features.length + ' objets ' + (r.error ? r.error + ' erreurs' : ''),
        parent: li
      })
    } else if (r.carte) {
      li.className = 'info';
      ol_ext_element.create('I', {
        text: 'charger les fichiers \'carte\' un par un',
        parent: li
      })
    } else {
      li.className = 'unknown';
      ol_ext_element.create('I', {
        text: 'format inconnu',
        parent: li
      })
    }
  })
  // Dialog
  dialog.show({
    title: 'Chargement',
    className: 'dropFile',
    content: ul,
    buttons: { submit: 'charger (' + nb + ' couche' + (nb>1 ? 's)' : ')'), cancel: 'annuler' },
    onButton: b => {
      // Add layer to the carte
      if (b === 'submit') {
        dialog.hide();
        let nb = 0;
        result.forEach(r => {
          if (addLayer(r)) nb++;
        })
        notification.show(nb + ' couche(s) ajoutée(s) à la carte'.replace(/\(s\)/g, nb<2 ? '' : 's'))
      }
    }
  })
}