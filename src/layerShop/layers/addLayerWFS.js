import ol_format_WFSCapabilities from './WFSCapabilitiesFormat.js'
import ol_View from 'ol/View.js'
import WMSCapabilities from 'ol-ext/control/WMSCapabilities'
import switcher from '../layerSwitcher'
import VectorStyle from 'mcutils/layer/VectorStyle';
import ol_source_WFS from 'ol-ext/source/TileWFS'

import { insertLayer } from './loadLayer';
import { transformExtent as ol_proj_transformExtent } from 'ol/proj.js'
import { intersects as ol_extent_intersects, boundingExtent as ol_extent_boundingExtent } from 'ol/extent.js'

import './WFSCapabilities.css'


class WFSCapabilities extends WMSCapabilities {
  constructor(options) {
    super(options);
    this.getDialog().set('className', this.getDialog().get('className') + ' ol-wfscapabilities' );
  }
  /** Get Capabilities request parameters
   * @param {*} options
   */
  getRequestParam(options) {
    return {
      SERVICE: 'WFS',
      REQUEST: 'GetCapabilities',
      VERSION: options.version || '2.0.0'
    };
  }
  /** Create a new layer using options received by getOptionsFromCap method
   * @param {*} options
   */
  getLayerFromOptions(options) {
    return options
  }
  /** Get service parser
   */
  _getParser() {
    const pars = new ol_format_WFSCapabilities();
    return {
      read: function (data) {
        var resp = pars.read(data);
        resp.Capability = {
          Layer: {
            Layer: resp.FeatureTypeList,
            Attribution: {
              Title: resp.ServiceProvider.ProviderName
            }
          }
        };
        resp.FeatureTypeList.forEach(l => {
          l.FeatureType = l.Name;
          l.Name = l.Title;
        });
        console.log(resp);
        return resp;
      }.bind(this)
    };
  }
  /** Return a WMTS options for the given capabilities
   * @param {*} caps layer capabilities (read from the capabilities)
   * @param {*} parent capabilities
   * @return {*} options
   */
  getOptionsFromCap(caps, parent) {
    var bbox = ol_extent_boundingExtent([ caps.WGS84BoundingBox.LowerCorner, caps.WGS84BoundingBox.UpperCorner ]);
    if (bbox) bbox = ol_proj_transformExtent(bbox, 'EPSG:4326', this.getMap().getView().getProjection());

    var layer_opt = {
      title: caps.Title,
      extent: bbox,
      abstract: caps.Abstract
    };

    var source_opt = {
      url: parent.url,
      typename: caps.FeatureType,
      formStyle: '',
      tileZoom: 12,
      projection: 'EPSG:3857',
      attributions: caps.Attribution.Title,
      wrapX: (this.get('wrapX') !== false),
    };

    // Fill form
    this._fillForm({
      title: layer_opt.title,
      layers: source_opt.typename,
      style: source_opt.outputformat || '',
      maxZoom: source_opt.tileZoom,
      extent: bbox ? bbox.join(',') : '',
      projection: source_opt.projection,
      attribution: source_opt.attributions || '',
      version: '2.0.0'
    });

    // Trace
    if (this.get('trace')) {
      /* trace for debug */
    }
    return ({
      layer: layer_opt,
      source: source_opt,
      data: {
        title: caps.Title,
        abstract: caps.Abstract,
      }
    });
  }
  /** Get WMS options from control form
   * @return {*} original original options
   * @return {*} options
   * @private
   */
  _getFormOptions() {
    var options = this._currentOptions || {};

    if (!options.layer) {
      options.layer = {};
    }
    if (!options.source) {
      options.source = {};
    }
    if (!options.data) {
      options.data = {};
    }

    var tileZoom = parseInt(this._elements.formMaxZoom.value) || 20;
    var ext = [];
    if (this._elements.formExtent.value) {
      this._elements.formExtent.value.split(',').forEach(function (b) {
        ext.push(parseFloat(b));
      });
    }
    if (ext.length !== 4) {
      ext = undefined;
    }
    var attributions = [];
    if (this._elements.formAttribution.value) {
      attributions.push(this._elements.formAttribution.value);
    }

    var view = new ol_View({
      projection: this.getMap().getView().getProjection()
    });
    view.setZoom(tileZoom);
    var layer_opt = {
      title: this._elements.formTitle.value,
      extent: ext,
      abstract: options.layer.abstract || '',
      maxResolution: view.getResolution()
    };

    var source_opt = {
      url: this._elements.input.value,
      typename: this._elements.formLayer.value,
      tileZoom: tileZoom,
      attributions: attributions,
      outputformat: this._elements.formStyle.value,
      wrapX: (this.get('wrapX') !== false),
    };

    return ({
      layer: layer_opt,
      source: source_opt,
      data: {
        title: this._elements.formTitle.value,
        abstract: options.data.abstract,
        legend: options.data.legend,
      }
    });
  }
  /** Create a new layer using options received by getOptionsFromCap method
   * @param {*} options
   */
  getLayerFromOptions(options) {
    if (!options) {
      return;
    }
    // Force zoom to 12 (if none)
    const tileZoom = options.source.tileZoom === 0 ? 0 : options.source.tileZoom || 12;
    const url = options.source.url.replace(/^http:/,'https:');

    var layer = new VectorStyle({
      title: options.layer.title,
      desc: options.layer.abstract || '',
      extent: options.layer.extent,
      source: new ol_source_WFS({
        url: url,
        typeName: options.source.typename,
        tileZoom: tileZoom || 12,
        version: options.source.version || '2.0.0',
        outputFormat: options.source.outputformat || '',
      }),
    });
    // Prevent load outside extent
    const loader = layer.getSource().loader_
    const layerExtent = options.layer.extent;
    layer.getSource().loader_ = function(extent, resolution, projection) {
      if (layerExtent && ol_extent_intersects(extent, layerExtent)) {
        loader.call(this, extent, resolution, projection)
      }
    }

    layer.setMinZoom(tileZoom);
    return layer;
  }
}

// WFS labels
WFSCapabilities.prototype.labels = {
  formTitle: 'Titre :',
  formLayer: 'FeatureType :',
  formStyle: 'format :',
  formMaxZoom: 'Niveau de zoom :',
  formExtent: 'Extent :',
  mapExtent: 'étendue courante de la carte',
  formProjection: 'Projection :',
  formVersion: 'Version :',
  formAttribution: 'Attribution :',
};

// WFS capabilities 
const wfsCapabilities = new WFSCapabilities({
  target: document.body,
  searchLabel: 'rechercher',
  loadLabel: 'ajouter',
  services: {
    'Géoplateforme': 'https://data.geopf.fr/wfs/ows'
  },
  onselect: (layer, options) => {
    // Save parameters
    layer.set('type', 'WFS');
    layer.getSource().set('url', options.source.url)
    if (options.version) layer.getSource().set('version', options.source.version)
    if (options.outputformat) layer.getSource().set('format', options.source.outputformat)
    layer.getSource().set('typeName', options.source.typename)
    layer.getSource().set('tileZoom', options.source.tileZoom)

    insertLayer(layer)
  }
});
switcher.addControl(wfsCapabilities, 'bottom');

function addLayerWFS() {
  wfsCapabilities.showDialog();
}

export default addLayerWFS;