import notification from 'mcutils/dialog/notification'
import { showHelp } from "mcutils/dialog/helpDialog";
import _T from 'mcutils/i18n/i18n';

import EditBar from 'ol-ext/control/EditBar'
import Bar from 'ol-ext/control/Bar'
import Button from 'ol-ext/control/Button'
import Toggle from 'ol-ext/control/Toggle'
import { shiftKeyOnly } from 'ol/events/condition'

import carte from "../carte"
import switcher from '../layerShop/layerSwitcher'
import { hiddenFeatures } from '../carte'
import { getCurrentStyle } from '../util/currentStyle'
import Collection from 'ol/Collection'

import Transform  from 'ol-ext/interaction/Transform';
import DrawRegular  from 'ol-ext/interaction/DrawRegular';
import DrawHole from 'ol-ext/interaction/DrawHole'
import OffsetInteraction from 'ol-ext/interaction/Offset'
import SplitInteraction from 'ol-ext/interaction/Split'
import dragBox from './dragBox'

import '../../page/edit/editbar.css'

// Filter feature not editable
function filterFeature (feature) {
  const layer = feature.getLayer();
  return layer && layer.get('type') === 'Vector' && layer.get('selectable') !== false
}

// Edit interaction
const transformInteractions = {
  Select: carte.getSelect(),
  Delete: false,
  Info: false,
  DrawPoint: 'Dessiner un point',
  DrawLine: 'Dessiner une ligne',
  DrawPolygon: 'Dessiner une surface',
  DrawHole: new DrawHole({
    featureFilter: filterFeature
  }),
  DrawRegular: new DrawRegular({
    sides: 4
  }), // 'Dessiner un polygone',
  Transform: new Transform({
    title: 'transformer',
    filter: filterFeature,
    addCondition: shiftKeyOnly,
    /* modify point radius
    pointRadius: function(f) {
      var radius = f.getIgnStyle('pointRadius') || 10;
      return [radius, radius];
    }
    */
  }),
  // Extra tools
  Split: new SplitInteraction({
    filter: filterFeature
  }),
  Offset: new OffsetInteraction({
    filter: filterFeature
  }),
  // Titles
  UndoDraw: 'annuler',
  FinishDraw: 'terminer'
};
transformInteractions.Select.set('title', 'sélectionner un objet')
transformInteractions.DrawRegular.set('circleLabel', 'cercle')
transformInteractions.DrawRegular.set('title', 'Dessiner une forme régulière')
transformInteractions.DrawHole.set('title', 'Dessiner un trou')
transformInteractions.Transform.set('title', 'Modifier un objet')

// The edit bar
const editbar = new EditBar({
  interactions: transformInteractions
});

// Add circle /square
const regulareForm = editbar.getControlsByName('DrawRegular')[0].getSubBar()
regulareForm.addControl(new Button({
  title: 'cercle',
  className: 'circleBt',
  html: '<i class="fg-circle-o"></i>',
  handleClick: () => {
    transformInteractions.DrawRegular.setSides(0);
    regulareForm.element.querySelector('div.ol-button div div div div div').click()
  }
}))
regulareForm.addControl(new Button({
  title: 'rectangle',
  className: 'squareBt',
  html: '<i class="fg-square-o"></i>',
  handleClick: () => {
    transformInteractions.DrawRegular.setSides(5);
    regulareForm.element.querySelector('div.ol-button div div div div div').click()
  }
}))

// Handle point rotation using the transform interaction
const transform = editbar.getInteraction('Transform');
transform.set('title', 'Modifier un objet')
let startangle = 0;
transform.on (['rotatestart','translatestart','scalestart'], function(e){
  startangle = e.feature.getIgnStyle('pointRotation') || 0;
});
transform.on('rotating', function (e){
  e.feature.setIgnStyle('pointRotation', (startangle - e.angle * 180/Math.PI) % 360);
  e.feature.changed()
});

const selectCtrl = editbar.getControlsByName('Select')[0];
const subBar = new Bar();
selectCtrl.setSubBar(subBar);

// Select by extent
subBar.addControl(new Toggle({
  title: 'Selection par emprise',
  html: '<i class="fg-extent"></i>',
  interaction: dragBox
}));
// Remove when select is on
carte.getSelect().on('change:active', () => dragBox.setActive(false));

// Prevent cluster update on unselect + show notification
let tout;
function afterSelect(notif, cluster) {
  if (tout) clearTimeout(tout);
  tout = setTimeout(() => {
    if (cluster) cluster.activateCluster(true);
    if (notif && carte.getSelect().getFeatures().getLength() > 10) {
      notification.show(carte.getSelect().getFeatures().getLength() + ' objet(s) sélectionné(s)')
    } else {
      notification.hide();
    }
  })
}
carte.getSelect().getFeatures().on(['add', 'remove'], (e) => {
  // Check feature layer type (cluster)
  const f = e.element;
  if (f.getLayer && f.getLayer() && f.getLayer().getMode && f.getLayer().getMode() === 'cluster') {
    // Deactivate cluster till update
    f.getLayer().activateCluster(false);
    // Reactivate cluster when updated (only once)
    afterSelect(e.type === 'add', f.getLayer())
  } else {
    afterSelect(e.type === 'add')
  }
});

// Select event on clear...
carte.getSelect().getFeatures().clear = function() {
  Collection.prototype.clear.call(this);
  carte.getSelect().dispatchEvent({ type: 'select', selected: [] });
}

// Delete tools on Vector layer
function deleteFeatures() {
  const selection = carte.getSelect().getFeatures().getArray().slice();
  carte.getSelect().getFeatures().clear();
  const features = [];
  selection.forEach(f => {
    if (f.getLayer().get('type') === 'Vector') {
      features.push({
        feature: f,
        layer: f.getLayer()
      })
      f.getLayer().getSource().removeFeature(f);
    }
  })
  // Notification after remove 
  if (features.length) {
    // ...and after unselect
    setTimeout(() => {
      notification.cancel(features.length + ' objet(s) supprimé(s)'.replace(/\(s\)/g, features.length > 1 ? 's' : ''), () => {
        features.forEach(f => {
          f.layer.getSource().addFeature(f.feature);
        })
      })
    })
  }
}

subBar.addControl(new Button({
  title: 'Supprimer les objets sélectionnés',
  html: '<i class="fi-delete"></i>',
  handleClick: deleteFeatures
}));

document.addEventListener('keydown', e  => {
  // Not if inside input
  if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (document.querySelector('.ol-ext-dialog.ol-visible')) return;
  if (document.body.dataset.mega === '' || document.body.dataset.menu === '' ) return;
  
  // COPY
  if (e.key === 'Delete') {
    deleteFeatures()
  }
})

// Prevent modification on none vector layer (or clusters)
editbar.getInteraction('ModifySelect').setFilter(f => {
  if (dragBox.getActive()) return false;
  return f.getLayer() && f.getLayer().get('type') === 'Vector'
})

// Drawtools event manager
const draw = ['DrawPoint', 'DrawLine', 'DrawPolygon', 'DrawRegular'];
draw.forEach(element => {
  const interaction = editbar.getInteraction(element);
  
  // On drawend, store the drawn feature in the current source. Select it.
  interaction.on('drawend', e => {

    // Avoid drawing in a locked layer.
    if (!(switcher.getSelection().selectable())) {
      notification.show('La couche est verrouillée.', 8000);
      return;
    }

    e.feature.setIgnStyle(getCurrentStyle(e.feature));

    switcher.getSelection().getSource().addFeature(e.feature);
    carte.setSelection(e.feature);
  })
  
  // Disable any selection when starting to draw a feature
  interaction.on('drawstart', () => {
    if (!(switcher.getSelection().selectable())) return;
    carte.setSelection();
  });

  // Notify when user is drawing while features are hidden
  interaction.on('drawend', e => {
    if (hiddenFeatures(switcher.getSelection())) {
      // Compute a zoom level that makes features visibles.
      let zoom;
      const currentZoom = carte.getMap().getView().getZoom();
      if (currentZoom < switcher.getSelection().getMinZoom()) zoom = switcher.getSelection().getMinZoom() + .1;
      else zoom = switcher.getSelection().getMaxZoom() - .1;
      setTimeout(
        notification.cancel('Les objets sont cachés, ils sont en dehors de la plage de visibilité',() => {
          // Recenter map on feature
          carte.getMap().getView().setCenter(e.feature.getGeometry().getFirstCoordinate());
          carte.getMap().getView().setZoom(zoom);
        }, 'Zoomer sur l\'objet'), 
        3000
      )
    }
  })
  
  // Activate interaction
  interaction.on('change:active', () => {
    // Prevent drawing when no layer is selected or not a Vector layer
    if (interaction.getActive() && (!switcher.getSelection() || (switcher.getSelection().get('type')!=='Vector'))) {
      setTimeout(() => carte.getSelect().setActive(true));
      notification.show('Vous n\'êtes pas dans un calque de Dessin.')
    }
    /*
    // Reselect feature on deactivate
    if (!interaction.getActive()) {
      const sel = carte.getSelect().getFeatures().getArray().slice();
      carte.getSelect().getFeatures().clear();
      setTimeout(() => {
        sel.forEach(f => {
          carte.getSelect().getFeatures().push(f);
        }); 
      });
    }
    */
  })

  window.interaction = interaction;
});

// If layer has changed in the switcher, and if type is not Vector
// Active select.
switcher.on('select', (e) => {
  if (e.layer && e.layer.get('type') !== 'Vector') {
    carte.getSelect().setActive(true);
  }
})

// Select fearure layer
editbar.getInteraction('DrawHole').on('drawend', (e) => {
  switcher.selectLayer(e.feature.getLayer())
})

// Show toolbar
carte.showControl('toolbar');

// Remove select before adding it in the editbar...
carte.getMap().removeInteraction(carte.getSelect())
const hoverInteraction = carte.getInteraction('hover')
carte.getMap().removeInteraction(hoverInteraction)
carte.getControl('toolbar').addControl(editbar);

// Special tools: snapping
/**/
import Snap from 'ol/interaction/Snap'
import VectorSource from 'ol/source/Vector'
let snapping, hassnap = false;
function snapLayer(layer) {
  if (snapping) carte.getMap().removeInteraction(snapping)
  if (hassnap && layer && layer.getSource && layer.getSource() instanceof VectorSource) {
    snapping = new Snap({ source: layer.getSource() })
    carte.getMap().addInteraction(snapping)
  } else {
    snapping = null;
  }
}
// Layer has change
switcher.on('select', (e) => snapLayer(e.layer))
// Snap toggle
carte.getControl('toolbar').addControl(new Toggle({
  title: 'Accroche aux objets',
  html: '<i class="fg-snap"></i>',
  className: 'snap',
  onToggle: b => {
    hassnap = b;
    snapLayer(switcher.getSelection());
  }
}));
/**/

/* Measure tools */
import Tooltip from 'ol-ext/overlay/Tooltip'
import { getDistance } from 'ol/sphere';
import { transform as proj_transform } from 'ol/proj';
// Add a tooltip
let currentDrawing;
const tooltip = new Tooltip({
  className: 'measure tooltips black',
  getHTML: (feature, info) => {
    let html = Tooltip.prototype.getHTML.call(tooltip, feature, info);
    // Radius?
    const draw = editbar.getInteraction('DrawRegular')
    if (draw.getActive() && draw.centered_  && draw.square_ && draw.coord_) {
      const p = carte.getMap().getView().getProjection();
      const l = getDistance(proj_transform(draw.center_,p,'EPSG:4326'), proj_transform(draw.coord_,p,'EPSG:4326'));
      html = tooltip.formatLength(l) + '<br/>' + html
    }
    return html;
  }
});
carte.getMap().addOverlay(tooltip);
['DrawLine', 'DrawPolygon', 'DrawHole', 'DrawRegular'].forEach(i => {
  const draw = editbar.getInteraction(i)
  draw.on('drawstart', e => {
    if (measureBt.getActive()) tooltip.setFeature(e.feature);
    currentDrawing = e.feature;
  });
  draw.on(['change:active','drawend'], () => {
    tooltip.setFeature();
  });
})
editbar.getInteraction('ModifySelect').on('modifystart', function(e){
  if (measureBt.getActive() && e.features.length===1) tooltip.setFeature(e.features[0]);
  currentDrawing = e.feature;
});
editbar.getInteraction('ModifySelect').on('modifyend', function(){
  tooltip.setFeature();
});

// Measure button
const measureBt = new Toggle({
  title: 'Afficher les mesures',
  html: '<i class="fg-measure-line"></i>',
  className: 'measure',
  onToggle: b => {
    if (b) {
      tooltip.setFeature(currentDrawing);
    } else {
      tooltip.setFeature();
    }
  }
})
carte.getControl('toolbar').addControl(measureBt);

// Help button
carte.getControl('toolbar').addControl(new Button({
  title: 'plus d\'info...',
  html: '<i class="fi-help"></i>',
  className: 'help',
  handleClick: () => {
    showHelp(_T('editHelp'), { className: 'medium edit' });
  }
}));


// Display expand/collapse Button
const toggle = new Toggle({
  title: 'plus d\'outils...',
  className: 'toggle',
  onToggle: (b) => {
    if (b) {
      carte.getControl('toolbar').element.classList.add('expand')
      toggle.element.classList.add('expand')
      localStorage.setItem('mc@editTools', '1');
    } else {
      carte.getControl('toolbar').element.classList.remove('expand');
      toggle.element.classList.remove('expand')
      carte.getSelect().setActive(true);
      localStorage.removeItem('mc@editTools');
    }
  }
});
carte.getControl('toolbar').addControl(toggle);
if (localStorage.getItem('mc@editTools')) toggle.element.querySelector('button').click()
// Move hover on top
carte.getMap().addInteraction(hoverInteraction)

// >> Event listeners to update [data-drawtools] (2/2)
switcher.on('select', (evt) => {
  if (evt.layer) {
    if (evt.layer.get('type') === 'Vector' && evt.layer.get('selectable') !== false) {
      document.body.dataset.draw = '';
    } else {
      delete document.body.dataset.draw;
      // const active = editbar.getActiveControls()[0].getInteraction();
      editbar.setActive('Select');
    }
  }
})

/* DEBUG * /
window.editbar = editbar
/**/