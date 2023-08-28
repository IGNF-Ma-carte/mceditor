import ol_ext_element from 'ol-ext/util/element'
import charte from 'mcutils/charte/charte'
import carte from '../carte';
import dialog from 'mcutils/dialog/dialog';
import notification from 'mcutils/dialog/notification';
import { helpData } from 'mcutils/dialog/helpDialog';

import html from '../../page/onglet/attributes.html'
import htmlDlg from '../../page/onglet/attributes-dialog.html'
import formulaDlg from '../../page/onglet/formula-dialog.html'
import '../../page/onglet/attributes.css'

// Create tab
const tabAttr = charte.addMenuTab('attributes', 'fi-tag', 'Attributs', html);
tabAttr.dataset.nb = 0;
const ul = tabAttr.querySelector('ul.mcAttr')

// Set changes on selected features
const onAttChange = function(prop, value, att) {
  const nb = updateSelectedFeatures((f) => {
    if (prop !== f.getGeometryName()) {
      if (att.type === 'number') value = parseFloat(value)
      if (att.type === 'integer') value = parseInt(value)
      f.set(prop, value, true)
    } else {
      return false;
    }
  });
  notification.show(nb + ' objet{s} modifié{s}...'.replace(/{s}/g, nb>1 ? 's' : ''))
}

// Update selection attributes
function updateSelection() {
  ul.innerHTML = '';
  // Display nb object selected
  const nb = tabAttr.dataset.nb = carte.getSelect().getFeatures().getLength();
  tabAttr.querySelector('p').className = 'info' + (nb>1 ? ' multi' : '');
  tabAttr.querySelector('p .count').innerText = nb;
  delete tabAttr.dataset.cluster;
  // If selection
  if (nb) {
    const f = carte.getSelect().getFeatures().item(0);
    // Cluster
    if (!f.getLayer()) {
      tabAttr.dataset.nb = 0;
      tabAttr.dataset.cluster = '';
      return;
    }
    // Not vector layer
    if (f.getLayer().get('type') !== 'Vector') tabAttr.dataset.nb = 0;
    // Properties
    const prop = f.getProperties()
    // Functions
    const propList = function(p, att) {
      att = att || {};
      const li = ol_ext_element.create('LI', { className: att.type, parent: ul });
      if (att.type !== 'checkbox') {
        ol_ext_element.create('LABEL', {
          text: p,
          parent: li
        })
      }
      const val  = f.get(p);
      switch(att.type) {
        // Textarea
        case 'text': {
          const txt = ol_ext_element.create('TEXTAREA', { 
            change: e => onAttChange(p, e.target.value, att),
            parent: li 
          });
          txt.value = val;
          break;
        }
        // Select options
        case 'select': {
          const select = ol_ext_element.create('SELECT', { 
            change: e => onAttChange(p, e.target.value, att),
            parent: li 
          });
          // Check if value is in the list
          const values = att.values.split('|');
          if (values.indexOf(val) < 0) {
            ol_ext_element.create('OPTION', { 
              // text: val === '' ? '—' : val,
              text: val,
              value: val,
              className: val ? '' : 'empty',
              disabled: true,
              selected: true,
              parent: select 
            });
          }
          // Add list
          values.forEach(o => {
            const opt = ol_ext_element.create('OPTION', { 
              // text: o === '' ? '—' : o,
              text: o,
              value: o,
              className: o ? '' : 'empty',
              parent: select 
            });
            if (o == val) opt.selected = true;
          })
          break;
        }
        case 'checkbox': {
          const check = ol_ext_element.createCheck({
            after: p,
            checked: val,
            parent: li
          })
          check.addEventListener('change', e => onAttChange(p, e.target.checked, att))
          break;
        }
        // Default / number
        case 'string': 
        case 'number': 
        default: {
          const input = ol_ext_element.create('INPUT', {
            type: /integer|number/.test(att.type) ? 'number' : 'text',
            step: att.type === 'integer' ? 1 : 'any',
            value: val,
            change: e => onAttChange(p, e.target.value, att),
            parent: li
          })
          if (att.type==='integer') {
            input.addEventListener('keydown', e => {
              if (e.ctrlKey || e.keyCode<65) return;
              if (!/[0-9]|-/.test(e.key)) e.preventDefault();
            })
          }
          if (att.type===undefined && typeof(val) === 'object') {
            input.disabled = true;
          }
          break;
        }
      }
      ol_ext_element.create('DIV', {
        className: 'ol-delete',
        title: 'supprimer l\'attribut...',
        click: () => {
          li.remove();
          const nb = updateSelectedFeatures((f) => f.unset(p, true));
          notification.show(nb + ' objet{s} modifié{s}...'.replace(/{s}/g, nb>1 ? 's' : ''))
        },
        parent: li
      })
    }
    // Layer attributes
    const layerAttr = f.getLayer().getAttributes ? f.getLayer().getAttributes() : {};
    Object.keys(layerAttr).forEach(k => {
      if (Object.prototype.hasOwnProperty.call(prop, k)) {
        propList(k, layerAttr[k])
      }
    })
    // Show properties
    Object.keys(f.getProperties()).forEach(p => {
      if (p === f.getGeometryName()) return;
      if (!layerAttr[p]) propList(p)
    });
  }
}

/** Update selected features (only  vector features)
 * @param {function} updateFn
 * @returns {number} number of updates
 */
function updateSelectedFeatures(updateFn) {
  const features = carte.getSelect().getFeatures()
  let nb = 0;
  if (features.getLength()) {
    const sources = {};
    features.forEach(f => {
      if (!f.getLayer()) {
        //TODO cluster ?
      } else if (f.getLayer().get('type') === 'Vector') {
        sources[f.getLayer().getClassName()] = f.getLayer().getSource();
        if (updateFn(f) !== false) nb++;
      }
    })
    Object.keys(sources).forEach(s => sources[s].changed())
  }
  return nb;
}

// Update on select
carte.getSelect().on('select', updateSelection)

// Add new attribute
tabAttr.querySelector('button.add').addEventListener('click', () => {
  // Show dialog
  dialog.show({
    title: 'Ajouter un attribut',
    className: 'attributes',
    content: htmlDlg,
    buttons: { submit: 'ajouter', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b === 'submit') {
        const name = inputs.name.value;
        // Don't modify geometry...
        if (name === 'geometry') {
          return;
        }
        const value = inputs.value.value;
        if (!name) {
          inputs.name.required = true;
          inputs.name.focus();
          return;
        }
        const preserv = inputs.preserv.checked;
        const nb = updateSelectedFeatures((f) => {
          // Dont modify geometry
          if (name === f.getGeometryName()) return false;
          // Set value if not preserved
          if (!preserv || f.get(name) === undefined) {
            f.set(name, value, true);
          } else {
            return false;
          }
        })
        updateSelection();
        notification.show(nb + ' objet{s} modifié{s}...'.replace(/{s}/g, nb>1 ? 's' : ''))
        dialog.close()
      }
    }
  })
  // Formula
  dialog.getContentElement().querySelector('a.formula').addEventListener('click', () => {
    formula(features, attributes, dialog.getContentElement().querySelector('input.name').value);
  })

  // Set content
  charte.setInputPlaceholder(dialog.getContentElement())
  const name = dialog.getContentElement().querySelector('input')
  name.focus();
  dialog.getContentElement().querySelector('input').addEventListener('keyup', (e) => {
    // geometry is reserved
    if (e.target.value === 'geometry') {
      e.target.classList.add('invalid');
      dialog.element.classList.add('dlgError')
    } else {
      e.target.classList.remove('invalid');
      dialog.element.classList.remove('dlgError')
    }
  });
  // Set attribute list
  const attributes = {}
  const features = carte.getSelect().getFeatures().getArray();
  const max = Math.min(100, features.length)
  for (let i=0; i<max; i++) {
    const f = features[i];
    const gname = f.getGeometryName();
    Object.keys(f.getProperties()).forEach(p => {
      if (p !== gname) {
        attributes[p] = true;
      }
    })
  }
  // Fill select element
  const selElt = dialog.getContentElement().querySelector('select');
  addSelectAttr(selElt, attributes, () => {
    charte.setInputValue(name, selElt.value);
    name.focus();
    selElt.value = '';
  })
})

/* Add attribute in select element
 */
function addSelectAttr(selElt, attributes, onselect) {
  ol_ext_element.create('OPTION', {
    html: 'attributs existants &nbsp; &nbsp;',
    value: '',
    disabled: true,
    parent: selElt
  })
  Object.keys(attributes).sort().forEach(p => {
    ol_ext_element.create('OPTION', {
      text: p,
      value: p,
      parent: selElt
    })
  })
  selElt.value = '';
  // On select
  selElt.addEventListener('change', onselect)
}

/* Dialog with formula to update attributes */
function formula(features, attributes, name) {
  dialog.show({
    title: 'Ajouter un attribut',
    className: 'attributes formula',
    content: formulaDlg,
    buttons: { test: 'test', ok: 'exécuter', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b !== 'cancel') {
        dialog.show();
        // Use webworker ?
        const args = [
          // Transfered arguments
          'attr', 
          'feature',
          // Prevent functionnalities
          'document', 
          'window',
          'globalThis',
          'localStorage',
          'alert',
          'confirm',
          'prompt',
          'location',
          'navigation',
        ]
        // Create function based on formulaStr
        const fn = new Function(...args, formulaStr.value);
        // Reset
        dialog.getContentElement().querySelector('.log').innerText = ''
        dialog.getContentElement().querySelector('.info').innerText = ''
        try {
          if (b === 'test') {
            const f = features[0];
            dialog.getContentElement().querySelector('.info').innerText = fn(f.getProperties(), features[0]);
          } else {
            // Check name
            const name = inputs.name.value;
            if (name === 'geometry') return;
            if (!name) {
              inputs.name.required = true;
              inputs.name.focus();
              return;
            }
            // Update
            const nb = updateSelectedFeatures(f => {
              const attr = fn(f.getProperties(), f)
              f.set(inputs.name.value, attr, true)
            })
            updateSelection();
            notification.show(nb + ' objet{s} modifié{s}...'.replace(/{s}/g, nb>1 ? 's' : ''))
            dialog.close();
          }
        } catch (e) {
          const stack = e.stack.split('\n')[1].split(':');
          const colNumber = parseInt(stack.pop());
          const lineNumber = parseInt(stack.pop()) - 2;
          dialog.getContentElement().querySelector('.log').innerHTML = e.toString() + '<br/>ligne ' + lineNumber + ' (' + colNumber + ')';
        }
      }
    }
  })
  // Help 
  helpData(dialog.getContentElement())

  const inputName = dialog.getContentElement().querySelector('input.name')
  const formulaStr = dialog.getContentElement().querySelector('textarea')
  if (name) {
    inputName.value = name;
    formulaStr.focus();
  } else {
    setTimeout(() => inputName.focus() )
  }
  charte.setInputPlaceholder(dialog.getContentElement())

  // Select
  const selElt = dialog.getContentElement().querySelector('select');
  addSelectAttr(selElt, attributes, () => {
    var startPos = formulaStr.selectionStart;
    var endPos = formulaStr.selectionEnd;
    formulaStr.value = formulaStr.value.substring(0, startPos)
        + ' attr.' + selElt.value + ' '
        + formulaStr.value.substring(endPos, formulaStr.value.length);
    selElt.value = '';
  })
}