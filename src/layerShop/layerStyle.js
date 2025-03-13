import Button from 'ol-ext/control/Button'
import dlg from "mcutils/dialog/dialog";
import notification from 'mcutils/dialog/notification';
import FormStyle from "mcutils/input/FormStyle";
import VectorStyle from "mcutils/layer/VectorStyle";
import element from 'ol-ext/util/element'
import _T from 'mcutils/i18n/i18n';

import switcher from "./layerSwitcher";
import carte from '../carte';
import helpDialog from 'mcutils/dialog/helpDialog';

import styleCondition from './styleCondition'

import '../../page/layerShop/layerStyle.css'


/** Layer style dialog
 */
function styleDialog() {

  const layer = switcher.getSelection();
  const hasCondition = !!layer.getConditionStyle;

  // No layer selected
  if (!layer) {
    notification.show('Aucune couche sélectionnée...');
    return;
  }

  const div = element.create('DIV')
  // Dialog
  dlg.show({
    title: 'Style de la couche',
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
        if (hasCondition) layer.setConditionStyle(conditions.getArray());

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

  /* Parametric style */
  if (hasCondition) {
    const toggle = element.create('A', {
      html: '<span>style paramétrique</span><span>style par défaut</span>',
      className: 'toggleStyle article button',
      click: () => {
        if (dlg.element.dataset.parametric) {
          delete dlg.element.dataset.parametric;
        } else {
          dlg.element.dataset.parametric  = '1';
        }
      },
      parent: div
    })
    helpDialog(toggle, _T('styleConditionInfo'), { title: 'Symbolisation paramétrique', className: 'small' });
    if (layer.getConditionStyle().length > 0) {
      dlg.element.dataset.parametric  = '1';
    }
  }

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

  const conditions = hasCondition ? styleCondition(div, layer, carte.getSymbolLib()) : null;

  // Declutter
  const clutter = element.createCheck({
    after: 'Nettoyer les chevauchements de textes',
    className: 'declutter',
    parent: div,
    checked: layer.getDeclutter(),
    on: ({
      change: e =>  {
        layer.setDeclutter(e.target.checked);
      }
    })
  })
  helpDialog(clutter.parentNode, _T('styleDeclutter'), { className: 'small' });
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

/* Disabled button */
const disabledBt = element.create('BUTTON', {
  html: '<i class="fg-color"></i>',
  className: 'disabled',
  title: 'fonction non disponible pour ce calque...',
})
button.element.prepend(disabledBt)


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
