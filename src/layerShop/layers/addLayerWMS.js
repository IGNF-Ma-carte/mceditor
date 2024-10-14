import WMSCapabilities from 'ol-ext/control/WMSCapabilities'
import WMTSCapabilities from 'ol-ext/control/WMTSCapabilities'
import switcher from '../layerSwitcher'
import { insertLayer } from './loadLayer';

import '../../../page/layerShop/layers/WMS.css'

// i18n 
WMSCapabilities.prototype.error = {
  load: 'Impossible d\'accéder au service, essayez de l\'ajouter manuellement...',
  badUrl: 'La valeur fournie n\'est pas une url...',
  TileMatrix: 'Type de pyramide non supporté (TileMatrixSet)...',
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
  optional: 'apikey,info_format',
  cors: true,
  onselect: function(layer, options) {
    // Get info_format
    const extra = wmsCapabilities._elements.input.value.split('?')
    extra.forEach(ex => {
      const param = ex.split('=');
      if (/^info_format$/i.test(param[0])) {
        options.layer.info_format = param[1]
      }
    })
    // update
    layer.set('type', 'WMS');
    layer.set('wmsparam', options);
    // Insert layer
    insertLayer(layer);
  }
});
switcher.addControl(wmsCapabilities, 'bottom');

// Check parameters on error to add apikey if needed (and more)
wmsCapabilities._img.addEventListener('error', () => {
  const extra = wmsCapabilities._elements.input.value.split('?')[1]
  if (wmsCapabilities._img.src.search(extra) < 0) {
    wmsCapabilities._elements.preview.src = wmsCapabilities._img.src = wmsCapabilities._img.src + '&' + extra
  }
})

// WMTS services
const wmtsServices = {
  'cartes': {
    title: 'Cartes',
    icon: 'fi-map-alt',
  },
  'ortho': {
    title: 'Photographies aériennes',
    icon: 'fa fa-camera',
  },
  'orthohisto': {
    title: 'Photographies historiques',
    icon: 'fa fa-camera-retro',
  },
  'satellite': {
    title: 'Satellite',
    icon: 'fg-satellite',
  },
  /*
  'cartovecto': {
    title: 'Géoservices-cartovecto',
  },
  */
  'economie': {
    title: 'Economie (INSEE)',
    icon: 'fi-theme-economie',
  },
  'environnement': {
    title: 'Environnement',
    icon: 'fi-theme-developpement',
  },
  'ocsge': {
    title: 'Occupation du sol',
    icon: 'sjjb-landuse-mix',
  },
  'parcellaire': {
    title: 'Parcellaire',
    icon: 'fi-map-background',
  },
  'transport': {
    title: 'Transports',
    icon: 'fg-car',
  },
  'topographie': {
    title: 'Topographie',
    icon: 'maki-town',
  },
  'administratif': {
    title: 'Administratif',
    icon: 'fi-theme-culture',
  },
  'altimetrie': {
    title: 'Altimetrie',
    icon: 'fi-theme-transports'
  },
  'agriculture': {
    title: 'Agriculture',
    icon: 'fi-theme-agriculture'
  },
  'risque': {
    title: 'Risque',
    icon: 'fa fa-exclamation-triangle'
  },
  'energie': {
    title: 'Energie',
    icon: 'fi-theme-innovation'
  },
  'clc': {
    title: 'Corine land cover',
    icon: 'fi-theme-international'
  },
  'edugeo': {
    title: 'Edugeo',
    icon: 'ign-education-ecole'
  },
  'none': {
    title: '',
    icon: 'fi-help',
  },
};
Object.keys(wmtsServices).forEach((k,i) => wmtsServices[k].index = i )

// Add WMTS layer
const wmtsCapabilities = new WMTSCapabilities({
  target: document.body,
  className:'WMTS',
  title: 'Ajouter un WMTS',
  searchLabel: 'rechercher',
  loadLabel: 'ajouter',
  services: {
    'Géoplateforme': 'https://data.geopf.fr/wmts',
    'Géoplateforme + apikey': 'https://data.geopf.fr/private/wmts?apikey=your_apikey'
  },
  optional: 'apikey,token',
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
  console.log(tm)
  if (/GoogleMapsCompatible/.test(tm.TileMatrixSet)) return true;
  if (tm.TileMatrixSet === 'euro_3857') return true
  if (/PM_/.test(tm.TileMatrixSet)) tm.TileMatrixSet = 'PM'
  return WMTSCapabilities.prototype.isSupportedSet(tm);
}
switcher.addControl(wmtsCapabilities, 'bottom');


/* Set returned title on select */
function setTitle(e) {
  const v = e.target.options[e.target.selectedIndex].text;
  const dialog = wmtsCapabilities.getDialog().element;
  dialog.querySelector('h2').innerText = v;
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

export { wmtsServices, addLayerWMS, addLayerWMTS }
