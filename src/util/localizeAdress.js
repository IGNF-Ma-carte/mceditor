import SearchControl from 'ol-ext/control/SearchGeoportail'
import carte from '../carte'

/**
 * From user input address, center map on the location.
 * Zoom level is calculated based on location's extent.
 * @param {*} divParent 
 */
function localizeAddress(divParent) {
  // Input
  const searchControl = new SearchControl({
    placeholder: 'Rechercher une adresse ...',
    target: divParent
  })
  carte.getMap().addControl(searchControl);

  // Once address has changed in the search input
  searchControl.on('select', e => {
    // Center map
    carte.getMap().getView().setCenter(e.coordinate)

    // Set map zoom regarding adress accuracy
    const zoom = [8,8,9,10,14,14,16];
    // TODO: Make it more accurate with attribute kind ...
    carte.getMap().getView().setZoom(zoom[e.search.classification] || 16);

    // Fill in input with the selected location
    searchControl.setInput(e.search.fulltext)
  })

  return searchControl;
}


export default localizeAddress