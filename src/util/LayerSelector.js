import olObject from 'ol/Object'
import Geoportail from 'mcutils/layer/Geoportail'
import element from 'ol-ext/util/element'
import 'ol-ext/layer/GetPreview'

import carte from '../carte'

import '../../page/util/LayerSelector.css'

// Default layer list
const layerList = [
  'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
  'GEOGRAPHICALGRIDSYSTEMS.MAPS',
  'ORTHOIMAGERY.ORTHOPHOTOS',
  'TRANSPORTNETWORKS.ROADS'
]
const gppLayers = [];
layerList.forEach(l => {
  const gpp = new Geoportail({
    key: carte.get('key'),
    layer: l
  })
  gpp.set('type', 'Geoportail')
  gppLayers.push(gpp);
})

/** 
 * Sélectionneur de fonds carto (du Geoportail).
 * Pour affichage de vignettes cliquables. 
 * @param {Element} ul
 */
class LayerSelector extends olObject {
  constructor(ul) {
    super();
    this.ul = ul;

    // HTML Structure creation for gpp li images
    gppLayers.forEach(layer => {
      const li = element.create('LI', {
        'data-layer': layer.get('layer'),
        title: layer.get('title') || layer.get('name'),
        click: () => {
          li.classList.toggle('selected');
          const gpp = new Geoportail({
            key: carte.get('key'),
            li: li,
            layer: layer.get('layer')
          });
          gpp.set('type', 'Geoportail');
          this.dispatchEvent({
            type: 'select',
            layer: gpp
          })
        },
        parent: ul
      })
      element.create('DIV', { 
        className: 'img',
        html: element.create('IMG', ({ src: layer.getPreview() })),
        parent: li 
      });
      element.create('DIV', { className: 'title', html: layer.get('title') || layer.get('name'), parent: li })
    })
  }
}

/**
 * Get layers selected by user.
 */
 LayerSelector.prototype.getLayers = function() {
  // Selected elemnts
  const ul = Array.from(this.ul.querySelectorAll('li.selected'));
  // if none, get first one
  if (!ul.length) ul.push(this.ul.querySelector('li'));

  // Get layer list
  const layers = [];
  ul.forEach(li => {
    const layerId = li.dataset.layer;
    const layer = new Geoportail({
      key: carte.get('key'),
      layer: layerId
    });
    layer.set('type', 'Geoportail');
    layers.push(layer)
  })
  return layers;
}

/**
 * If no layer is selected, set a default one.
 */
LayerSelector.prototype.setDefaultLayer = function() {
  this.ul.querySelectorAll('li')[0].classList.add('selected');
}


export default LayerSelector