
const currentStyle = {
  Point: {},
  LineString: {},
  Polygon: {}
};
const typeGeom = {
  Point: 'Point',
  MultiPoint: 'Point',
  LineString: 'LineString',
  MultiLineString: 'LineString',
  Polygon: 'Polygon',
  MultiPolygon: 'Polygon',
}

/** Get the current style
 * @param {ol/Feature} f
 * @returns {ignStyle}
 */
function getCurrentStyle(f) {
  const type = f.getGeometry().getType();
  const style = Object.assign({}, currentStyle[typeGeom[type]]);
  // remove zIndex
  style.zIndex = 0;
  return style;
}

/** Update current Style
 * @param {ol/Feature} f
 */
function updateCurrentStyle(f)  {
  const type = f.getGeometry().getType();
  currentStyle[typeGeom[type]] = Object.assign({}, f.getIgnStyle());
}

export { getCurrentStyle, updateCurrentStyle }
