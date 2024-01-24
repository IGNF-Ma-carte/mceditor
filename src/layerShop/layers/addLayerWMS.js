import WMSCapabilities from 'ol-ext/control/WMSCapabilities'
import WMTSCapabilities from 'ol-ext/control/WMTSCapabilities'
import ol_ext_element from 'ol-ext/util/element'

import dialog from 'mcutils/dialog/dialog';
import switcher from '../layerSwitcher'
import { insertLayer } from './loadLayer';

import '../../../page/layerShop/layers/WMS.css'
import '../../../page/layerShop/layers/addLayerGeoportail.css'
import geopHTML from '../../../page/layerShop/layers/addLayerGeoportail-page.html'

// i18n 
WMSCapabilities.prototype.error = {
  load: 'Impossible d\'accéder au service, essayez de l\'ajouter manuellement...',
  badUrl: 'La valeur fournie n\'est pas une url...',
  TileMatrix: 'Type de pyramide non supprté (TileMatrixSet)...',
  noLayer: 'Aucune couche disponible pour ce service...',
  srs: 'La projection utilisée n\'est pas supportée et le flux pourrait ne pas s\'afficher correctement...'
};

WMSCapabilities.prototype.labels = {
  formTitle: 'Titre :',
  formLayer: 'Couches :',
  formMap: 'Map :',
  formStyle: 'Style :',
  formFormat: 'Format :',
  formMinZoom: 'Niveau de zoom min :',
  formMaxZoom: 'Niveau de zoom max :',
  formExtent: 'Extent :',
  mapExtent: 'étendue courante de la carte',
  formProjection: 'Projection :',
  formCrossOrigin: 'CrossOrigin :',
  formVersion: 'Version :',
  formAttribution: 'Attribution :',
};

WMTSCapabilities.prototype.labels = {
  formTitle: 'Titre :',
  formLayer: 'Couches :',
  formMap: 'Map :',
  formStyle: 'Style :',
  formFormat: 'Format :',
  formMinZoom: 'Niveau de zoom min :',
  formMaxZoom: 'Niveau de zoom max :',
  formExtent: 'Extent :',
  mapExtent: 'étendue courante de la carte',
  formProjection: 'Projection :',
  formCrossOrigin: 'CrossOrigin :',
  formVersion: 'Version :',
  formAttribution: 'Attribution :',
};

// Add WMS layer
const wmsCapabilities = new WMSCapabilities({
  target: document.body,
  title: 'Ajouter un WMS',
  searchLabel: 'rechercher',
  loadLabel: 'ajouter',
  services: {
    'BRGM': 'https://geoservices.brgm.fr/geologie',
//    'Espagne': 'https://www.ign.es/wms-inspire/ign-base',
  },
  optional: 'apikey',
  cors: true,
  onselect: function(layer, options) {
    layer.set('type', 'WMS');
    layer.set('wmsparam', options);
    insertLayer(layer);
  }
});
switcher.addControl(wmsCapabilities, 'bottom');

// WMTS services
const wmtsServices = {
  'cartes': {
    title: 'Cartes',
    icon: 'fi-map-alt',
    url: 'https://wxs.ign.fr/cartes/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'ortho': {
    title: 'Photographies aériennes',
    icon: 'fa fa-camera',
    url: 'https://wxs.ign.fr/ortho/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'orthohisto': {
    title: 'Photographies historiques',
    icon: 'fa fa-camera-retro',
    url: 'https://wxs.ign.fr/orthohisto/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'satellite': {
    title: 'Satellite',
    icon: 'fg-satellite',
    url: 'https://wxs.ign.fr/satellite/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  /*
  'cartovecto': {
    title: 'Géoservices-cartovecto',
    url: 'https://wxs.ign.fr/cartovecto/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  */
  'economie': {
    title: 'Economie (INSEE)',
    icon: 'fi-theme-economie',
    url: 'https://wxs.ign.fr/economie/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'environnement': {
    title: 'Environnement',
    icon: 'fi-theme-developpement',
    url: 'https://wxs.ign.fr/environnement/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'sol': {
    title: 'Occupation du sol',
    icon: 'sjjb-landuse-mix',
    url: 'https://wxs.ign.fr/sol/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'parcellaire': {
    title: 'Parcellaire',
    icon: 'fi-map-background',
    url: 'https://wxs.ign.fr/parcellaire/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'transports': {
    title: 'Transports',
    icon: 'fg-car',
    url: 'https://wxs.ign.fr/transports/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'topographie': {
    title: 'Topographie',
    icon: 'maki-town',
    url: 'https://wxs.ign.fr/topographie/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'administratif': {
    title: 'Administratif',
    icon: 'fi-theme-culture',
    url: 'https://wxs.ign.fr/administratif/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'altimetrie': {
    title: 'Altimetrie',
    icon: 'fi-theme-transports',
    url: 'https://wxs.ign.fr/altimetrie/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'agriculture': {
    title: 'Agriculture',
    icon: 'fi-theme-agriculture',
    url: 'https://wxs.ign.fr/agriculture/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities',
  },
  'clc': {
    title: 'Corine land cover',
    icon: 'fi-theme-international',
    url: 'https://wxs.ign.fr/clc/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities'
  },
};

// Add WMTS layer
const wmtsCapabilities = new WMTSCapabilities({
  target: document.body,
  className:'WMTS',
  title: 'Ajouter un WMTS',
  searchLabel: 'rechercher',
  loadLabel: 'ajouter',
  services: (function() {
    const services = {};
    Object.keys(wmtsServices).forEach(k => {
      services[wmtsServices[k].title] = wmtsServices[k].url
    })
    return services
  })(),
  optional: 'apikey',
  cors: true,
  onselect: function(layer, options) {
    layer.set('type', 'WMTS');
    layer.set('wmtsparam', options);
    insertLayer(layer)
  }
});
// BUG ol-ext bad className
if (!/wmts/.test(wmtsCapabilities.getDialog().get('className'))) wmtsCapabilities.getDialog().set('className', wmtsCapabilities.getDialog().get('className') + ' ol-wmtscapabilities');
// Check supported TileMatrix
wmtsCapabilities.isSupportedSet = function(tm) {
  if (tm.TileMatrixSet === 'GoogleMapsCompatible') return true;
  // console.log(tm)
  return WMTSCapabilities.prototype.isSupportedSet(tm);
}
switcher.addControl(wmtsCapabilities, 'bottom');


/* Set returned title on select */
function setTitle(e) {
  const v = e.target.options[e.target.selectedIndex].text;
  const dialog = wmtsCapabilities.getDialog().element;
  dialog.querySelector('h2').innerText = v;
}

/* Dialog: Add a geoportail layer */
function addLayerGeoportail() {
  /* old WMTS
  wmtsCapabilities.showDialog()
  wmtsCapabilities.clearForm();
  const dialog = wmtsCapabilities.getDialog().element;
  dialog.classList.add('geoportail')
  dialog.querySelector('h2').innerText = 'Fonds Géoportail';
  dialog.querySelector('option').innerText = 'Choisir une thématique';
  dialog.querySelector('select').addEventListener('change', setTitle, true);
  */
  dialog.show({
    title: 'Fonds Géoportail',
    className: 'layerGeoportail',
    content: geopHTML,
    buttons: { submit: 'ajouter', cancel: 'annuler' },
    onButton: (b) => {
      if (b === 'submit' && currentLayer) {
        insertLayer(currentLayer)
        dialog.close();
      }
    }
  })

  let currentLayer;
  const content = dialog.getContentElement()
  const ul = content.querySelector('ul');
  const imgElt = content.querySelector('.preview img')
  imgElt.addEventListener('load', () => imgElt.classList.add('visible'))
  imgElt.addEventListener('error', () => imgElt.classList.remove('visible'))
  // Display list
  Object.keys(wmtsServices).forEach(k => {
    const li = ol_ext_element.create('LI', {
      className: 'up collapsed',
      html: ol_ext_element.create('DIV', {
        className: 'title',
        html: '<i class="' + wmtsServices[k].icon + '"></i> ' + wmtsServices[k].title,
        click: () => li.classList.toggle('collapsed'),
      }),
      parent: ul
    })
    const ul2 = ol_ext_element.create('UL', { parent: li })
    ol_ext_element.create('LI', {
      html: '<i class="fa fa-spinner fa-pulse"></i><label>chargement...</label>',
      parent: ul2
    })
    wmtsCapabilities.getCapabilities(wmtsServices[k].url, { onload: caps => {
      if (caps) {
        if (!caps.Capability.Layer.Layer.length) ul2.remove();
        ul2.innerHTML = '';
        caps.Capability.Layer.Layer.forEach(function(l) {
          var options = wmtsCapabilities.getOptionsFromCap(l, caps);
          const layer = wmtsCapabilities.getLayerFromOptions(options)
          if (layer) {
            const li2 = ol_ext_element.create('LI', {
              'data-abstract': l.Abstract + ' ' + k,
              click: () => {
                ul.querySelectorAll('li').forEach(li => li.classList.remove('selected'))
                li2.classList.add('selected');
                dialog.element.classList.add('hasLayer')
                // new layer
                currentLayer = wmtsCapabilities.getLayerFromOptions(options);
                currentLayer.set('type', 'WMTS');
                currentLayer.set('wmtsparam', options);
                // Show info
                content.querySelector('h3').innerText = currentLayer.get('title')
                content.querySelector('.abstract').innerHTML = currentLayer.get('abstract')
                content.querySelector('.preview img').src = currentLayer.getPreview()
                // Update list view
                showList();
              },
              parent: ul2 
            })
            ol_ext_element.create('IMG', {
              src: layer.getPreview(),
              on: {
                load: e => e.target.className = 'visible'
              },
              parent: li2
            })
            ol_ext_element.create('LABEL', {
              text: l.Title,
              parent: li2
            })
          }
        }.bind(this))
      } else {
        ul2.remove();
      }
    }})
  })
  // Search in list
  function showList() {
    const val = content.querySelector('input').value;
    const rex = new RegExp(val, 'i')
    content.querySelectorAll('li li').forEach(li => {
      if (li.classList.contains('selected') || rex.test(li.innerText) || rex.test(li.dataset.abstract)) {
        li.classList.remove('hidden')
        li.parentNode.parentNode.dataset.show = 1
      } else {
        li.classList.add('hidden')
      }
    })
    // Show title
    content.querySelectorAll('li.up').forEach(li => {
      if (li.dataset.show) {
        li.classList.remove('hidden')
      } else {
        li.classList.add('hidden')
      }
      delete li.dataset.show;
    })
  }
  ol_ext_element.addListener(content.querySelector('input'), ['keyup', 'input'], showList);
}

/* Dialog: Add a WMTS layer */
function addLayerWMTS() {
  wmtsCapabilities.showDialog()
  const dialog = wmtsCapabilities.getDialog().element;
  dialog.classList.remove('geoportail');
  dialog.querySelector('h2').innerText = 'Ajouter un WMTS';
  dialog.querySelector('option').innerText = '';
  dialog.querySelector('select').removeEventListener('change', setTitle, true)
}

/* Dialog: Add a WMS layer */
function addLayerWMS() {
  wmsCapabilities.showDialog()
}

export { addLayerGeoportail, addLayerWMS, addLayerWMTS }
