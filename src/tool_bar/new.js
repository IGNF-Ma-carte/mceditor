import charte from 'mcutils/charte/macarte'
import dialog from 'mcutils/dialog/dialog';
import _T from 'mcutils/i18n/i18n';
import md2html from 'mcutils/md/md2html';

import carte from '../carte';
import onboarding from '../onboarding/onboarding'

charte.addTool('')

charte.addTool('new', 'fi-new', 'Créer une nouvelle carte', () => {
  if (carte.hasChanged()) {
    dialog.showAlert(md2html(_T('unsaved')), {
      ok: 'continuer sans sauvegarder',
      cancel: 'annuler'
    }, (b) => {
      if (b === 'ok') {
        unSelectAllOnbdLayers();
        onboarding.setStep();
      }
    })
  } else {
    unSelectAllOnbdLayers();
    onboarding.setStep();
  }
});

/**
 * To unselect all Geoportail layers id any is selected
 */
function unSelectAllOnbdLayers() {
  onboarding.getPageElement(2).querySelector('.gpplayers ul').querySelectorAll('li').forEach(li=>{
    if (li.classList.contains('selected')) {
      li.classList.toggle('selected');
    }
  })
}