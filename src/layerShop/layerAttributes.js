import element from 'ol-ext/util/element'
import InputCollection from 'ol-ext/util/input/Collection'
import Collection from 'ol/Collection'

import dialog from 'mcutils/dialog/dialog'
import VectorStyle from 'mcutils/layer/VectorStyle'

import html from '../../page/layerShop/layerAttribute.html'
import '../../page/layerShop/layerAttributes.css'

/** Add a new attribute 
 * @param {VectorStyle} layer
 * @param {Array<Object>} attributes
 * @param {Object} current
 */
function addLayerAttribute(layer, attributes, current) {
  dialog.show({
    title: 'Attributs du calque',
    className: 'layerAttribute',
    content: html,
    buttons: { submit: current ? 'modifier' : 'ajouter', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b === 'submit') {
        // Check name
        if (!inputs.name.value) {
          dialog.getContentElement().querySelector('div').dataset.error = 'badName';
          dialog.getContentElement().querySelector('.name').required = true;
          dialog.getContentElement().querySelector('.name').focus();
          return;
        }
        // Check values
        let vals, length, noDefault;
        if (inputs.type.value === 'select') {
          // Array or object
          try {
            vals = JSON.parse(inputs.values.value);
            length = Object.keys(vals).length;
            noDefault = !vals.hasOwnProperty(inputs.default.value)
          } catch (e) {
            vals = inputs.values.value.split('|');
            length = vals.length;
            noDefault = vals.indexOf(inputs.default.value) < 0
          }
          // Almost 2 choices
          if (length < 2) {
            dialog.getContentElement().querySelector('div').dataset.error = 'badValues';
            dialog.getContentElement().querySelector('input.values').required = true;
            dialog.getContentElement().querySelector('input.values').focus();
            return;
          }
          // No default value
          if (noDefault) {
            dialog.getContentElement().querySelector('div').dataset.error = 'badDefault';
            dialog.getContentElement().querySelector('.default').required = true;
            dialog.getContentElement().querySelector('.default').focus();
            return;
          }
        }
        // New attribute
        let att = attributes.find(a => a.name === inputs.name.value);
        if (!att) {
          att = {};
          attributes.push(att)
        }
        // Set attribute
        att.name = inputs.name.value,
        att.type = inputs.type.value,
        att.values = vals,
        att.default = inputs.default.value
      }
      // Back to Dlg
      layerAttributesDlg(layer, attributes)
    }
  })

  // Current values
  if (current) {
    dialog.getContentElement().querySelector('input.name').value = current.name;
    dialog.getContentElement().querySelector('select.type').value = current.type;
    if (Array.isArray(current.values)) {
      dialog.getContentElement().querySelector('input.values').value = current.values.join('|');
    } else {
      dialog.getContentElement().querySelector('input.values').value = JSON.stringify(current.values);
    }
    dialog.getContentElement().querySelector('input.default').value = current.default;
    dialog.getContentElement().dataset.type = current.type;
  } else {
    dialog.getContentElement().dataset.type = '';
  }

  // Get list from layer
  dialog.getContentElement().querySelector('.values button').addEventListener('click', () => {
    const name = dialog.getContentElement().querySelector('input.name').value
    // Existing values
    const values = {};
    const input = dialog.getContentElement().querySelector('.values input')
    /*
    if (input.value) {
      input.value.split('|').forEach(v => values[v] = true)
    }
    */
    // Search new ones
    layer.getSource().getFeatures().forEach(f => {
      values[f.get(name)] = true;
    })
    input.value = Object.keys(values).join('|')
  })
  // Submit button
  const submit = dialog.element.querySelector('input[type="submit"]');
  dialog.getContentElement().querySelector('input.name').addEventListener('keyup', e => {
    submit.value = attributes.find(a => a.name === e.target.value) ? 'modifier' : 'ajouter'
  })
  // Change attribute type
  dialog.getContentElement().querySelector('select.type').addEventListener('change', e => {
    dialog.getContentElement().dataset.type = e.target.value;
  })
}

/** Open dialogue to handle layer attributes
 * @param {VectorStyle} layer
 */
function layerAttributesDlg(layer, attributes) {
  const content = element.create('DIV')
  // Display attributes
  const listAttr = element.create('DIV', { className: 'listAttr', parent: content })
  const collect = new Collection(attributes)
  const icollect = new InputCollection({
    getTitle: item => {
      const elt = element.create('DIV', {
        text: item.name + ' (' + item.type + ')' 
      })
      // Remove attribute button
      element.create('I', {
        className: 'fi-delete',
        title: 'Supprimer',
        click: () => {
          collect.remove(item)
        },
        parent: elt
      })
      return elt
    },
    collection: collect,
    target: listAttr
  })
  icollect.on('item:dblclick', (e) => {
    addLayerAttribute(layer, attributes, e.item)
  })

  // Get from layer
  if (!attributes.length) {
    element.create('BUTTON', {
      className: 'button button-ghost',
      text: 'Déduire de la couche...',
      click: () => {
        const attr = {}
        // Get attributes from layer
        layer.getSource().getFeatures().forEach(f => {
          const prop = f.getProperties()
          Object.keys(prop).forEach(k => {
            if (k === f.getGeometryName()) return;
            const a = attr[k] = attr[k] || { name: k, type: '', values: '', default: '' };
            const val = f.get(k);
            if (typeof(val) === 'boolean' && (!a.type || a.type === 'checkbox')) {
              a.type = 'checkbox';
            } else if (typeof(val) === 'number' && (!a.type || a.type === 'number')) {
              a.type = 'number';
            } else if (typeof(val) === 'string' && /\n/.test(val))  {
              a.type = 'text';
            } else if (typeof(val) === 'string' && a.type !== 'text') {
              a.type = 'string';
            }
          })
        })
        layerAttributesDlg(layer, Object.values(attr))
      },
      parent: content
    })
  }
  // Add new attributes
  element.create('BUTTON', {
    className: 'button button-ghost',
    text: 'ajouter un attribut...',
    click: () => {
      addLayerAttribute(layer, attributes); 
    },
    parent: content
  })
  /*
  // Fix attributes
  const check = element.createCheck({
    after: 'limiter les attributs à cette liste',
    checked: layer.get('fixAttributes'),
    parent: content
  })
  */

  dialog.show({
    title: 'Attributs du calque',
    className: 'layerAttributes',
    content: content,
    buttons: { doit: 'appliquer à l\'existant', ok: 'ok', cancel: 'annuler' },
    onButton: b => {
      // Set attributes
      if (b === 'ok' || b === 'doit') {
        layer.setAttributes(attributes); 
        // layer.set('fixAttributes', check.checked)
      }
      // Update current features
      if (b === 'doit') {
        const attr = layer.getAttributes()
        layer.getSource().getFeatures().forEach(f => {
          const a = f.getProperties();
          // Unset  properties
          Object.keys(a).forEach(k => {
            if (k !== f.getGeometryName() && !Object.hasOwnProperty.call(attr, k)) {
              f.unset(k)
            }
          })
          // Add new ones
          Object.keys(attr).forEach(k => {
            if (!Object.hasOwnProperty.call(a, k)) f.set(k, attr[k].default)
          })
        })
      }
      // Update selection
      carte.getInteraction('select').dispatchEvent({type: 'select', selected: [], unselected: []})
    }
  })
}

/** Open dialogue to handle layer attributes
 * @param {VectorStyle} layer
 * @param {Object} [current]
 */
function layerAttributes(layer, current) {
  if (!layer.getAttributes) return;
  const attributes = [];
  Object.values(layer.getAttributes()).forEach( a => {
    attributes.push(Object.assign({}, a))
  })
  if (current) {
    addLayerAttribute(layer, attributes, current)
  } else {
    layerAttributesDlg(layer, attributes)
  }
}

export default layerAttributes