import charte from 'mcutils/charte/macarte'
import dialog from 'mcutils/dialog/dialog';
import openCarte from 'mcutils/dialog/openCarte'
import _T from 'mcutils/i18n/i18n';
import md2html from 'mcutils/md/md2html';
import carte from '../carte'


function doOpen() {
  openCarte({
    callback: (c) => {
      carte.load(c);
    },
    // Keep only 'macarte' files, remove storymaps, etc ...
    filter:'macarte'
  })
}

// Open button
charte.addTool('open', 'fi-open', 'Ouvrir', () => {
  if (carte.hasChanged()) {
    dialog.show({
      className: 'alert',
      content: md2html(_T('unsaved')),
      buttons: { ok: 'continuer sans sauvegarder', cancel: 'annuler' },
      onButton: (b) => {
        if (b === 'ok') {
          doOpen()
        }
      }
    })
  } else {
    doOpen()
  }
});
