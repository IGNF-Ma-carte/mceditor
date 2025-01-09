import MDEditor from 'mcutils/md/MDEditor'
import InputMedia from 'mcutils/control/InputMedia'
import charte from 'mcutils/charte/macarte'

import carte from '../carte'
import switcher from '../layerShop/layerSwitcher'

import html from '../../page/onglet/popup-page.html'
import popupHtml from '../../page/layerShop/layerPopUp-page.html'
import '../../page/onglet/popup.css'


charte.addMenuTab('popup','fi-comment', 'Bulle', html)

// PopUp Tab's innerHTML content
const popupTab = charte.getMenuTabElement('popup');
popupTab.dataset.editable = 'false';

const popupOpt = popupTab.querySelector('.popupOpt');
popupOpt.innerHTML = popupHtml;

const inputPerso = popupTab.querySelector('[data-attr="perso"] input');
const inputTitle = popupTab.querySelector('[data-attr="title"] input');
const inputImage = popupTab.querySelector('[data-attr="image"] input');
const inputCoord = popupTab.querySelector('[data-attr="coord"] input');

const inputDesc = popupTab.querySelector('[data-attr="description"] textarea');
const editor = window.editor = new MDEditor({
  input: inputDesc,
  data: { COORD: 0 }
})


/**
 * Sets the popup content of the feature depending 
 * on the perso input is checked or not.
 * @returns 
 */
function setCurrentPopupContent() {
  if (!currentFeature || popupTab.dataset.editable === 'false') return;
  if (inputPerso.checked) {
    popupTab.dataset.editable = 'custom';
    featureToChange.setPopupContent({
      active: inputPerso.checked,      // customized feature
      titre: inputTitle.value,
      desc: editor.getValue(),
      img: inputImage.value,
      coord: inputCoord.checked
    })
  } else {
    popupTab.dataset.editable = true;
    featureToChange.setPopupContent({
      active: inputPerso.checked
    })
  }
  showCurrentPopup();
}

// Triggers a refresh of popcontent on every input's change
inputPerso.addEventListener('change', setCurrentPopupContent);
inputTitle.addEventListener('change', setCurrentPopupContent);
inputImage.addEventListener('change', setCurrentPopupContent);
inputCoord.addEventListener('change', setCurrentPopupContent);
editor.on('change', setCurrentPopupContent);

// Wait a certain delay after keyboard's release
// before setting up and refreshing the popup content
let timeout;
inputTitle.addEventListener('keyup', () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(setCurrentPopupContent, 500);
})

const imedia = new InputMedia({ 
  thumb: false,
  add: true,
  input: inputImage
});

let currentFeature;
let currentCoord;

// cluster and feature to update (potentially different from currentFeature)
let cluster;
let featureToChange;
// The tab is open
let isPopupOpened = false;

/**
 * Handles popup display.
 */
function showCurrentPopup() {
  const currentZoom = carte.getMap().getView().getZoom();
  if (currentFeature && isPopupOpened) {
    let feature;
    // If cluster, take the first feature to test
    if (cluster) feature = cluster[0];
    else feature = currentFeature;
    
    // Test if the popup should be displayed
    if (feature.getLayer()
      && feature.getLayer().getPopupContent
      && feature.getLayer().getVisible()
      && feature.getLayer().getMinZoom() < currentZoom
      && feature.getLayer().getMaxZoom() > currentZoom) {
      if (currentCoord) {
        currentFeature.showPopup(carte.popup, currentCoord);
      }
    } else {
      carte.popup.hide();
    }
  } else {
    carte.popup.hide();
  }
}

// Event fired when showing popup tab
charte.on('tab:show', (e) => {
  isPopupOpened = (e.id === 'popup')
  showCurrentPopup()
})

// Changing zoom -> check whether features are hidden or not.
let delayShow;
switcher.on(['drawlist', 'layer:visible', 'select'], () => {
  if (delayShow) clearTimeout(delayShow);
  delayShow = setTimeout(showCurrentPopup);
})

carte.on('layer:featureInfo', e => {
  currentFeature = e.feature
  currentCoord = e.coordinate
  showCurrentPopup();
})

// Handle every select event on feature
carte.getSelect().on('select', (e) => {
  currentFeature = e.selected[0];
  
  // Cluster ?
  cluster = currentFeature ? currentFeature.get('features') : false;
  if (cluster) {
    featureToChange = cluster[0];
  } else {
    featureToChange = currentFeature;
  }

  let popupContent = {};
  popupTab.dataset.editable = false;

  // Get info about feature to edit
  if (featureToChange && featureToChange.getLayer() && featureToChange.getLayer().getPopupContent) {
    if (featureToChange.getLayer().get('type') === 'Vector') {
      popupContent = featureToChange.getPopupContent() || {};
      popupTab.dataset.editable = popupContent.active ? 'custom' : true;
    }
    if (!popupContent.active) popupContent = featureToChange.getLayer().getPopupContent() || {};
    editor.data = featureToChange.getMDProperties();
  }

  // Get coordinate and set popup index to 1
  if (currentFeature) {
    currentCoord = (e.mapBrowserEvent ? e.mapBrowserEvent.coordinate : currentFeature.getGeometry().getFirstCoordinate());
    currentFeature.popupIndex_ = 1
  }

  // Update all the fields of popup tab
  inputPerso.checked = !!popupContent.active || false;
  inputTitle.value = popupContent.titre || '';
  editor.setValue(popupContent.desc || '');
  imedia.setValue(popupContent.img || '');
  inputCoord.checked = popupContent.coord || false;

  showCurrentPopup();
})

// Handle popup elem change event
carte.getSelect().on('select:show', (e) => {

  if (e.shown_feature && e.unshown_feature) {
    // Get feature and count in the cluster
    featureToChange = e.shown_feature
    currentFeature.popupIndex_ = e.index
    
    // Get popup content
    let popupContent = {};
    popupTab.dataset.editable = false;

    if (featureToChange && featureToChange.getLayer() && featureToChange.getLayer().getPopupContent) {
      if (featureToChange.getLayer().get('type') === 'Vector') {
        popupContent = featureToChange.getPopupContent() || {};
        popupTab.dataset.editable = popupContent.active ? 'custom' : true;
      }
      if (!popupContent.active) popupContent = featureToChange.getLayer().getPopupContent() || {};
      editor.data = featureToChange.getMDProperties();
    }

    // Update all fields
    inputPerso.checked = !!popupContent.active || false;
    inputTitle.value = popupContent.titre || '';
    editor.setValue(popupContent.desc || '')
    imedia.setValue(popupContent.img || '');
    inputCoord.checked = popupContent.coord || false;
  }
})


export { showCurrentPopup }
