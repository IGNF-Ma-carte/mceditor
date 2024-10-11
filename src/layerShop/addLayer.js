import element from 'ol-ext/util/element'
import dlg from 'mcutils/dialog/dialog'
import Button from 'ol-ext/control/Button'

import LayerSelector from '../util/LayerSelector';
import switcher from './layerSwitcher';

import addDrawLyr from './layers/addDrawLayer';
import addLayerGeoportail from './layers/addLayerGeoportail'
import charte from 'mcutils/charte/charte';

import loaders from './layers/layerLoader'
import { insertLayer } from './layers/loadLayer';
import Geoportail from 'mcutils/layer/Geoportail';
import carte from '../carte';

import '../../page/layerShop/addLayer.css'
import defaultLayersHTML from '../../page/layerShop/defaultLayers-page.html'
import extendedLayersHTML from '../../page/layerShop/extendedLayers-page.html'
import edugeoLayersHTML from '../../page/layerShop/edugeoLayers-page.html'

/** Dialog to add new file layer
 */
switcher.addControl(new Button({
  html: '<i class="fg-layer-alt-add-o"></i>',
  title: 'Ajout d\'un fond cartographique',
  handleClick: () => {
    addLayerDlg();
  }
}), 'bottom')

/* Show main dialog. */
function addLayerDlg() {
  // Dialog container
  const container = element.create('DIV', { 
    html: defaultLayersHTML + extendedLayersHTML 
  });

  // Set mode: standard / more options
  container.dataset.mode = (localStorage.getItem('mc@addLayerMode') === 'more') ? 'more' : 'standard';

  // Toggle mode: standard / more options
  container.querySelectorAll('.more-btn a').forEach(a => {
    a.addEventListener('click', () => {
      container.dataset.mode = (container.dataset.mode === 'more') ? 'standard' : 'more';
      localStorage.setItem('mc@addLayerMode', container.dataset.mode);
    })
  });

  // Standard Geoportail Layer container
  const selector = new LayerSelector(container.querySelector('.standard ul'));
  // Add layer on select
  selector.on('select', (e) => {
    dlg.hide();
    // Insert the geoportail layer rigth after the selected one of the switcher
    insertLayer(e.layer);
  })
  
  // Add draw layer button
  container.querySelectorAll('button.draw').forEach(b=>{
    b.addEventListener('click', ()=>{
      addDrawLyr();
    })
  });

  // Edugeo button
  container.querySelector('.gpp-sel .edugeo').addEventListener('click', () => {
    dlg.show({
      content: edugeoLayersHTML,
      title: 'Ajouter un fond Edugéo',
      className: 'addlayer edugeo',
      buttons: { cancel: 'annuler' }
    })
    // Other layers list in accordions
    const layerList = dlg.getContentElement().querySelector('ul.edugeoLayer');
    // Create accordions
    layerList.querySelectorAll('[data-title]').forEach(li => {
      // Create 2nd level accordion
      const accord = charte.createAccordionElement(layerList, {
        title: '<i class="'+li.dataset.icon+'"></i> ' + li.dataset.title,
        name: 'layer-loader',
        content: li
      })
      const ul = accord.li.querySelector('ul');
      ul.prepend(element.create('LI', {
        className: 'addLayer',
        html: element.create('BUTTON', {
          html: 'Ajouter',
          className: 'button button-colored',
          click: () => {
            const layers = [];
            // Get layers list
            ul.querySelectorAll('li').forEach(li => {
              if (li.dataset.layer) {
                layers.unshift({
                  layer: li.dataset.layer,
                  visible: li.dataset.visible !== "0",
                  fit: li.dataset.fit === "1",
                })
              }
            })
            // Add list of layer
            layers.forEach(l => {
              const layer = new Geoportail({
                visible: l.visible,
                layer: l.layer
              })
              layer.set('type', 'Edugeo');
              insertLayer(layer);
              if (l.fit) carte.getMap().getView().fit(layer.getExtent())
            })
            // Finish
            dlg.close();
          }
        })
      }));
    })
  })
  // Geoportail button
  container.querySelector('.gpp-sel .geoportail').addEventListener('click', () => {
    dlg.close();
    addLayerGeoportail();
  })

  // Other layers list in accordions
  const layerList = container.querySelector('ul.addlayer-more');
  // Create accordions
  layerList.querySelectorAll('[data-title]').forEach(li => {
    if (li.tagName === 'LI') {
      // Add layer list in accordion
      li.remove();
      charte.createAccordionElement(layerList, {
        title: '<i class="'+li.dataset.icon+'"></i> ' + li.dataset.title,
        content: null,
        click: loaders[li.dataset.layer]
      })
    } else {
      // Create 2nd level accordion
      charte.createAccordionElement(layerList, {
        title: '<i class="'+li.dataset.icon+'"></i> ' + li.dataset.title,
        name: 'layer-loader',
        content: li
      })
    }
  })
  // Link data-layers loaders
  layerList.querySelectorAll('[data-layer]').forEach(l => {
    if (l.dataset.layer && loaders[l.dataset.layer]) {
      l.addEventListener('click', () => {
        dlg.close();
        loaders[l.dataset.layer]()
      })
    } else {
      l.classList.add('disabled');
    }
  })

  // Show main dlg
  dlg.show({
    content: container,
    title: 'Ajouter un fond cartographique',
    className: 'addlayer',
    buttons: { cancel: 'annuler' }
  })
}

export { addLayerDlg }