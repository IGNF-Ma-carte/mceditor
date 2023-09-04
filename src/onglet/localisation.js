
import charte from 'mcutils/charte/macarte'

import localizeAddress from '../util/localizeAdress'
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Stroke from 'ol/style/Stroke'

import ZoomAnimation from 'ol-ext/featureanimation/Zoom'
import SearchGPS from 'ol-ext/control/SearchGPS'

import notification from 'mcutils/dialog/notification'
import switcher from '../layerShop/layerSwitcher'

import '../../page/onglet/localisation.css'
import html from '../../page/onglet/localisation.html'
import carte from '../carte';
import { getCurrentStyle } from '../util/currentStyle';


charte.addMenuTab('locate','fi-location', 'Localisation', html);

// Tab content
const locateTab = charte.getMenuTabElement('locate');

// Input search bar
const searchControl = localizeAddress(locateTab.querySelector('.search-bar'));
searchControl.on('select', (e) => {
  showAddPointButton(e.coordinate);
});

// Geolocation
locateTab.querySelector('.locate-me button').addEventListener('click', () => {
  // Geolocate user
  carte.getControl('locate').setActive(true);
  // On locate show add point
  carte.getControl('locate').once('position', (e) => {
    if (e.coordinate) {
      carte.getMap().getView().setCenter(e.coordinate);
      showAddPointButton([e.coordinate[0], e.coordinate[1]])
    }
  })
});

// Search by lon,lat
const searchCoord = new SearchGPS({
  maxItems: 1,
  target: locateTab.querySelector('.search-coord')
})
searchCoord.element.querySelector('.ol-ext-toggle-switch').childNodes[0].textContent = 'Décimals';
carte.getMap().addControl(searchCoord)
searchCoord.on('select', e => {
  const c = e.search.coordinate
  if (c) {
    carte.getMap().getView().setCenter(c);
    showAddPointButton([c[0], c[1]])
  }
})

// Current position
let currentPosition = null;

// Add point to current layer
locateTab.querySelector('.add-point button').addEventListener('click', () => {
  const addPointDiv = locateTab.querySelector('.add-point');
  carte.getControl('locate').setActive(false);
  if (currentPosition) {
    const layer = switcher.getSelection();
    // Layer dessin?
    if (layer && layer.get('type') === 'Vector') {
      delete addPointDiv.dataset.visible;
      // Add point
      const feature = new Feature(new Point(currentPosition));
      feature.setIgnStyle(getCurrentStyle(feature));
      layer.getSource().addFeature(feature);
      // select point
      carte.setSelection(feature);
      // Cancel
      notification.cancel(
        '1 point a été ajoutée au calque',
        () => {
          layer.getSource().removeFeature(feature);
          carte.setSelection();
        }
      )
    } else {
      notification.show('Le calque courant n\'est pas un calque de dessin...')
    }
  }
})

/** Display button to add point to the current layer
 */
function showAddPointButton(pt) {
  currentPosition = pt;
  const addPointDiv = locateTab.querySelector('.add-point'); 
  addPointDiv.dataset.visible = '';

  // Hide Add Point when move
  carte.getMap().once('pointerdown', () => {
    delete addPointDiv.dataset.visible;
  })

  // Pulse feature at coord
  const f = new Feature (new Point(pt));
  f.setStyle(new Style({
    image: new Circle({
      radius: 30,
      stroke: new Stroke ({ color: '#f00', width:2 })
    })
  }))
  // animate
  for (let i=0; i<3; i++) {
    setTimeout(() => {
      carte.getMap().animateFeature (f.clone(), new ZoomAnimation({
        fade: easeOut, 
        duration: 3000, 
        easing: easeOut
      }));
    }, i * 800)
  }
}

import { easeOut } from 'ol/easing'
