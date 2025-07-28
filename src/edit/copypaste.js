import { createEmpty as ol_extent_createEmpty, extend as ol_extent_extend} from 'ol/extent'
import notification from "mcutils/dialog/notification";
import carte from "../carte"
import switcher from "../layerShop/layerSwitcher"

let clipboard = [];
const select = carte.getSelect();

document.addEventListener('keydown', e  => {
  // Not if inside input
  if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (document.querySelector('.ol-ext-dialog.ol-visible')) return;
  if (document.body.dataset.mega === '' || document.body.dataset.menu === '' ) return;
  if (!e.ctrlKey) return;

  // COPY
  const key = e.key.toLowerCase()
  if (key === 'c' || key === 'x') {
    clipboard = [];
    const nb = select.getFeatures().getLength()
    if (nb) {
      select.getFeatures().forEach(f => {
        const f2 = f.clone();
        f2.setStyle()
        clipboard.push(f2);
        if (key === 'x' && f.getLayer().get('type') === 'Vector') {
          f.getLayer().getSource().removeFeature(f)
        }
      })
      notification.show((nb + ' objet(s) ' + (key === 'c' ? 'copié' : 'coupé') + '(s)...').replace(/\(s\)/g, nb>1 ? 's' : '' ))
    }
  } else if (key === 'v') {
    // PASTE
    const layer = switcher.getSelection();
    if (layer.get('type') !== 'Vector') {
      notification.show('La couche courante n\'est pas une couche de dessin...');
      return;
    } 
    if (!layer.getVisible()) {
      notification.show('La couche courante est masquée...');
      return;
    }
    if (!layer.selectable()) {
      notification.show('La couche courante est vérouillée...');
      return;
    }
    // Source for new features
    const source = layer.getSource();
    const nb = clipboard.length;
    if (nb) {
      const selection = select.getFeatures()
      const extent = ol_extent_createEmpty();
      // New selection
      selection.clear();
      clipboard.forEach(f => {
        const f2 = f.clone()
        source.addFeature(f2)
        selection.push(f2)
        ol_extent_extend(extent, f2.getGeometry().getExtent());
      })
      carte.getSelect().dispatchEvent({
        type: 'select',
        selected: selection.getArray()
      })
      // OK
      setTimeout(() => {
        notification.cancel(
          nb + ' objet(s) collé(s)'.replace(/\(s\)/g, nb>1 ? 's' : '' ),
          () => {
            carte.getMap().getView().fit(extent);
            if (carte.getMap().getView().getZoom() > 16) carte.getMap().getView().setZoom(16)
          },
          'tout afficher'
        )
      })
    } else {
      notification.show('Rien à coller...')
    }
  }
})