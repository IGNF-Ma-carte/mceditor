import _T from 'mcutils/i18n/i18n';
import VectorSource from 'ol/source/Vector';
import ol_ext_element from 'ol-ext/util/element'

import VectorStyle from 'mcutils/layer/VectorStyle'

import Onboarding from '../util/Onboarding'
import Onboard from '../util/Onboard'
import localizeAddress from '../util/localizeAdress'
import LayerSelector from '../util/LayerSelector'
import layerShop from '../layerShop/layershop'
import carte from '../carte';

import team from 'mcutils/api/team';
import { changeTeam } from 'mcutils/charte/macarte';

import '../../page/onboarding/onboarding.css'
import pages from '../../page/onboarding/onboarding-page.html'

import pagesHelp from '../../page/onboarding/onboarding-help.html'
import charte from 'mcutils/charte/charte';

// Onboarding 1 
/**/
const onbd = new Onboarding(pages, {
  title: _T('onboarding'),
  className: 'dialog'
});

// Onboarding 2 
const onbd2 = new Onboard(pagesHelp, {
  className: 'default',
}); 

// Team info
if (team.getId()) {
  ol_ext_element.create('IMG', {
    src: team.getImage(),
    parent: onbd.infoElement
  })
  const pInfo = ol_ext_element.create('P', {
    text: 'Vous êtes dans l\'équipe',
    parent: onbd.infoElement
  })
  ol_ext_element.create('B', {
    text: team.getName(),
    parent: pInfo
  })
  ol_ext_element.create('BUTTON', {
    text: 'Changer d\'équipe',
    className: 'button button-ghost',
    click: () => {
      onbd.hide();
      changeTeam();
    },
    parent: onbd.infoElement
  })
}

// Add Map location to onboarding 1
localizeAddress(onbd.getPageElement(1).querySelector('.search'));

// Add Background layer list to onboarding 1
const layerSelector = new LayerSelector(onbd.getPageElement(2).querySelector('.gpplayers ul'));

// Once start is triggered ...
onbd.on('start', () => {
  // Remove all layers
  carte.getMap().getLayers().clear();
  // Create new carte
  carte.unset('atlas');
  carte.unset('id');
    
  // Get selected layers
  const layers = layerSelector.getLayers();
  console.log(layers)
  layers.forEach(l => carte.getMap().addLayer(l));

  // Add new layer dessoin
  const dessin = new VectorStyle({
    type: 'Vector',
    title: 'Dessin',
    source: new VectorSource()
  });
  carte.getMap().addLayer(dessin)
  layerShop.selectLayer(dessin);

  onbd.hide();

  // Show next help pages
  setTimeout(() => onbd2.setStep())
})


export default onbd