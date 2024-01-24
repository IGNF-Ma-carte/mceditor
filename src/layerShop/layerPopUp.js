import Button from 'ol-ext/control/Button'
import notification from 'mcutils/dialog/notification';
import dlg from 'mcutils/dialog/dialog'
import MDEditor from 'mcutils/md/MDEditor'
import InputMedia from 'mcutils/control/InputMedia'
import ol_ext_element from 'ol-ext/util/element'

import carte from '../carte'
import switcher from './layerSwitcher'

import pp_html from '../../page/layerShop/layerPopUp-page.html'
import '../../page/layerShop/layerPopUp.css'
import charte from 'mcutils/charte/charte';
import { showCurrentPopup } from '../onglet/popup';
import VectorStyle from 'mcutils/layer/VectorStyle';

// If the layer hasn't popup content, disable button
switcher.on('select', e => {
  // VectorStyle or WM*S
  if (e.layer 
    && (e.layer instanceof VectorStyle 
      || /WMTS|Statistique|MVT|PBF/.test(e.layer.get('type'))
      || (e.layer.getSource() && e.layer.getSource().getFeatureInfo && e.layer.get('queryable'))
    )) {
    button.element.classList.remove('disable')
  } else {
    // No popup
    button.element.classList.add('disable')
  }
})

// New button
const button = new Button({
  html: '<i class="fi-comment"></i>',
  className: 'popup',
  title: 'Afficher la bulle du calque',
  handleClick: function() {
    const selLayer = switcher.getSelection();
    if (!selLayer) {
      notification.show('Aucune couche sélectionnée...')
      return;
    }
    
    if (!selLayer.getPopupContent) {
      dlg.showAlert('Ce type de couche n\' pas de bulle')
      return;
    }
  
    // Get data from the selected feature.
    let sel = carte.getInteraction('select').getFeatures().item(0);
    const cluster = sel ? sel.get('features') : false;
    if (cluster && cluster.length === 1) sel = cluster[0];
  
    let data;
    if (sel && sel.getLayer()) {
      data = sel.getMDProperties();
      delete data[sel.getGeometryName()];
    }

    // Get popup content.
    const popupContent = selLayer.getPopupContent();

    // Set new content if modified.
    dlg.show({
      title: 'Bulle par défaut',
      className: 'layerpopup',
      content: pp_html,
      buttons: { submit: 'ok', cancel: 'annuler'},
      onButton: (b) => {
        if (b === 'submit') {
          selLayer.setPopupContent({
            titre: inputTitle.value,
            desc: editor.getValue(),
            img: imedia.getValue(),
            coord: inputCoord.checked
          });
          selLayer.set('popupHoverSelect', hover.checked);
    
          // Show feature popup (if same layer)
          if (charte.getCurrentMenuTab() === 'popup') { 
            const features = carte.getSelect().getFeatures();
            const lastFeature = features.item(features.getLength() - 1);

            // Show popup (if on layer).
            if (lastFeature && lastFeature.getLayer() === selLayer) {
              lastFeature.showPopup(carte.popup);
              showCurrentPopup();
            }
          }
        }
        dlg.hide();
      }
    })

    // Set default values
    const content = dlg.getContentElement();

    // Title
    const inputTitle = content.querySelector('[data-attr="title"] input');
    inputTitle.value = popupContent.titre || '';

    // Description as Markdown
    const editor = new MDEditor({
      input: content.querySelector('[data-attr="description"] textarea'),
      data: data
    })
    editor.setValue(popupContent.desc || '')

    // Image media
    const imedia = new InputMedia({ 
      thumb: false,
      add: true,
      input: content.querySelector('[data-attr="image"] input')
    });
    imedia.setValue(popupContent.img || '')

    // Has coord?
    const inputCoord = content.querySelector('[data-attr="coord"] input')
    inputCoord.checked = popupContent.coord || false;

    // Enable hover
    const hover = ol_ext_element.createCheck({
      after: 'afficher un popup au survol de la couche (en visualisation)',
      checked: selLayer.get('popupHoverSelect'),
      parent: content
    })
  }
})

switcher.addControl(button, 'bottom');