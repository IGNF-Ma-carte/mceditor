import api from 'mcutils/api/api';
import charte from 'mcutils/charte/charte';
import dialog from 'mcutils/dialog/dialog';
import loadFonts from 'mcutils/font/loadFonts';
import _T from 'mcutils/i18n/i18n'
import md2html from 'mcutils/md/md2html';
import carte from "./carte";
import organization from 'mcutils/api/organization';

// Prevent unload
let dirty = false;
window.onbeforeunload = function() {
//  console.log('BEFOREUNLOAD', dirty)
  // Set last position in localstorage
  const pos = carte.getMap().getView().getCenter().slice();
  pos.push(carte.getMap().getView().getZoom())
  localStorage.setItem('mc@editorPosition', JSON.stringify(pos));
  // is map dirty
  return dirty ? _T('unsaved') : null;
}

/**
 * Returns true if any modifcations occurs on the map.
 * @param {*} b 
 * @returns 
 */
function setDirty(b) {
  if (b === dirty) return;
  if (b) {
    dirty = true;
    if (!/ ●$/.test(document.title)) document.title = document.title + ' ●';
  } else {
    setTimeout(() => { 
      dirty = false;
      document.title = document.title.replace(/ ●$/, ''); 
    }, 500)
  }
}

/* Handle map modifications */
carte.on('change', () => setDirty(true));
carte.getMap().getLayerGroup().on('change', () => setDirty(true));
carte.on(['read', 'save'], () => setDirty(false));
loadFonts(() => setDirty(false))

/** Map has changed */
carte.hasChanged = function() {
  return dirty;
}

/** Prevent  */
charte.canLogout = () => {
  if (dirty) {
    dialog.show({
      className: 'alert',
      content: md2html(_T('unsaved')),
      buttons: { ok: 'Quitter la page', cancel: 'Rester sur la page' },
      onButton: (b) => {
        if (b === 'ok') {
          dirty = false;
          api.logout();
          setTimeout(() => {
            location.reload()
          }, 100)
        }
      }
    })
    return false;
  }
  return true;
}

/* Check organization before changing */
organization.canChange = (orga) => {
  const atlas = carte.get('atlas')
  const current = (atlas || {}).organization_id || '';
  // Carte saved in another organization
  // if (atlas.edit_id && current !== orga.public_id) {
  if (current !== orga.public_id) {
    if (dirty) {
      dialog.show({
        className: 'alert',
        content: md2html(_T('unsaved')),
        buttons: { ok: 'Quitter la page', cancel: 'Rester sur la page' },
        onButton: (b) => {
          if (b === 'ok') {
            dirty = false;
            organization.set(orga, true);
            setTimeout(() => {
              location.reload()
            }, 100)
          }
        }
      })
    } else {
      setTimeout(() => {
        location.reload()
      }, 100)
      return true;
    }
    return false;
  } else {
    return true;
  }
}

// DEBUG
window.dirty = dirty;

export default dirty;
