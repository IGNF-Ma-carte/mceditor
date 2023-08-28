import notification from 'mcutils/dialog/notification';
import DragBox from 'ol/interaction/DragBox'
import carte from '../carte';
import switcher from '../layerShop/layerSwitcher';
import { shiftKeyOnly, platformModifierKeyOnly } from 'ol/events/condition'
import { render2Feature } from 'mcutils/ol/Feature';
import RenderFeature from 'ol/render/Feature'

// Handle space bar when dragbox is on
let spacePressed = false;
document.addEventListener('keydown', e  => { 
  if (!spacePressed && e.key === ' ' && dragBox.getActive()) {
    spacePressed = true;
    carte.getMap().getTargetElement().style.cursor = 'grab';
  }
})
document.addEventListener('keyup', e => { 
  if (spacePressed && e.key === ' ') {
    spacePressed = false;
    carte.getMap().getTargetElement().style.cursor = '';
  }
})
window.addEventListener('blur', () => { 
  if (spacePressed) {
    carte.getMap().getTargetElement().style.cursor = '';
    spacePressed = false;
  }
})

// Drag box interaction to add feature in the current selection
const dragBox = new DragBox({
  condition: () => {
    return !spacePressed;
  }
});

const selection = carte.getSelect().getFeatures();                                   

// On box end, select features
dragBox.on('boxend', function (e) {
  const layer = switcher.getSelection();
  if (!layer.selectable || !layer.selectable()) return;

  const vectorSource = layer.getSource();
  const extent = dragBox.getGeometry().getExtent();
  const boxFeatures = []
  vectorSource.getFeaturesInExtent(extent).forEach(feature => {
    if (feature instanceof RenderFeature) feature = render2Feature(feature)
    if (feature.getGeometry().intersectsExtent(extent)) {
      boxFeatures.push(feature)
    }
  });

  let features = []
  // features that intersect the box geometry are added to the
  // collection of selected features

  // if the view is not obliquely rotated the box geometry and
  // its extent are equalivalent so intersecting features can
  // be added directly to the collection
  const rotation = carte.getMap().getView().getRotation();
  const oblique = rotation % (Math.PI / 2) !== 0;

  // when the view is obliquely rotated the box extent will
  // exceed its geometry so both the box and the candidate
  // feature geometries are rotated around a common anchor
  // to confirm that, with the box geometry aligned with its
  // extent, the geometries intersect
  if (oblique) {
    const anchor = [0, 0];
    const geometry = dragBox.getGeometry().clone();
    geometry.rotate(-rotation, anchor);
    const extent = geometry.getExtent();
    boxFeatures.forEach(function (feature) {
      const geometry = feature.getGeometry().clone();
      geometry.rotate(-rotation, anchor);
      if (geometry.intersectsExtent(extent)) {
        features.push(feature);
      }
    });
  } else {
    features = boxFeatures;
  }

  // Add feature in selection
  features.forEach(f => {
    if (f) selection.remove(f);
    if (!platformModifierKeyOnly(e.mapBrowserEvent)) {
      selection.push(f);
    }
  })
  carte.getSelect().dispatchEvent({
    type: 'select',
    selected: selection.getArray()
  })
});


// clear selection when drawing a new box and when clicking on the map
dragBox.on('boxstart', function (e) {
  // prevent selection on non selectable layer
  const layer = switcher.getSelection();
  if (!layer.getVisible()) {
    notification.show('La couche n\'est pas visible...');
    return;
  }
  if (!layer.selectable || !layer.selectable()) {
    notification.show('La couche n\'est pas sélectionnable...');
    return;
  }
  // 
  if (!shiftKeyOnly(e.mapBrowserEvent) && !platformModifierKeyOnly(e.mapBrowserEvent)) {
    // Prevent cluster calculation
    selection.clear();
  }
});
dragBox.setActive(false);

export default dragBox
