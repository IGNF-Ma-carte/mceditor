import Button from 'ol-ext/control/Button'
import dlg from "mcutils/dialog/dialog";
import notification from 'mcutils/dialog/notification';
import FormStyle from "mcutils/input/FormStyle";
import VectorStyle from "mcutils/layer/VectorStyle";
import element from 'ol-ext/util/element'

import switcher from "./layerSwitcher";

import styleCondition from './styleCondition'

import '../../page/layerShop/layerStyle.css'
import carte from '../carte';


/** Layer style dialog
 */
function styleDialog() {

  var layer = switcher.getSelection();

  // No layer selected
  if (!layer) {
    notification.show('Aucune couche sélectionnée...');
    return;
  }

  const div = element.create('DIV')
  // Dialog
  dlg.show({
    title: 'Style par défaut',
    className: 'layerStyle',
    content: div,
    buttons: { ok: 'ok', cancel: 'annuler' },
    onButton: (b) => {
      // Update style
      if (b === 'ok') {
        // Update changed value
        for (let i in changedLyrStyle) {
          layer.setIgnStyle(i, changedLyrStyle[i]);
        }
        layer.setConditionStyle(conditions.getArray());

        // Refresh
        layer.getSource().changed();
        carte.getSelect().getFeatures().clear();

        // Close
        dlg.close();
        delete dlg.element.dataset.parametric;
      }
      dlg.setContent('');
    }
  });
  delete dlg.element.dataset.parametric;

  // Style form
  const form = new FormStyle({ 
    style: Object.assign({}, layer.defaultIgnStyle, layer.getIgnStyle()),
    preview: 'left',
    target: div,
    symbolLib: carte.getSymbolLib()
  });
  // form.element.querySelector('button.lib').innerHTML = '<i class="fa fa-book"></i> Bibliothèque'; 
  // Show all style tabs & set form style
  form.setTypeGeom('Point Line Polygon');

  // To store all the form's style settings
  const changedLyrStyle = {};
  // Store every style changes
  form.on('change', (e)=> {
    changedLyrStyle[e.attr] = e.value;
  });      

  /* Parametric style */
  const h2 = dlg.element.querySelector('h2');
  h2.title = '';
  h2.innerHTML = '';
  element.createSwitch({
    change: e => {
      const param = e.target.checked;
      h2.querySelector('b').innerHTML = param ? 'Style paramétrique' : 'Style par défaut';
      if (param) {
        dlg.element.dataset.parametric  = '';
      } else {
        delete dlg.element.dataset.parametric;
      }
    },
    parent:  h2
  })
  element.create('B', {
    html: 'Style par défaut',
    parent: h2.querySelector('label')
  })

  const conditions = styleCondition(div, layer, carte.getSymbolLib())

  /* */
}

// Add button to layerswitcher
const button = new Button({
  html: '<i class="fg-color"></i>',
  title: 'Changer le style de la couche',
  className: 'style',
  handleClick: styleDialog
})
switcher.addControl(
  button, 
  'bottom'
);

// Handles disable status : if layer's type <> VectorStyle
switcher.on('select',  e => {
  if (e.layer && 
    !(e.layer instanceof VectorStyle) && 
    e.layer.get('type') !== 'PBF') {
    button.element.classList.add('disable')
  } else {
    button.element.classList.remove('disable')
  }
})
