import element from 'ol-ext/util/element'
import dialog from 'mcutils/dialog/dialog'
import Button from 'ol-ext/control/Button'
import Checkbox from 'ol-ext/util/input/Checkbox'

import switcher from './layerSwitcher';
import _T from 'mcutils/i18n/i18n';

import '../../page/layerShop/layertheme.css'
import md2html from 'mcutils/md/md2html';

/** Dialog to add new file layer
 * /
switcher.addControl(new Button({
  html: '<i class="fg-tag"></i>',
  title: 'Thématiques',
  handleClick: setThemes
}), 'bottom')

/* Multi layer set theme
 */
function setThemes() {
  function updatelist() {
    const val = input.value;
    layers.forEach((l,i) => {
      checks[i].input.checked = l.get('theme') === val
    })
  }
  // Stiky
  const sticky = element.create('DIV', { className: 'sticky', parent: dialog.getContentElement() })
  // Dialog
  dialog.show({
    className: 'layerTheme',
    title: 'Thème des couches',
    content: sticky,
    buttons: { ok: _T('ok'), cancel: _T('cancel')},
    onButton: (b) => {
      if (b==='ok') {
        const val = md2html.doSecure(input.value.trim());
        let changes = 0;
        layers.forEach((l,i) => {
          if (checks[i].input.checked) {
            l.set('theme', val)
            changes++;
          } else {
            if (val && l.get('theme') == val) {
              l.set('theme', '')
              changes++;
            }
          }
        })
        if (val || changes) setThemes();
      }
    }
  })
  // Theme
  const input = element.create('INPUT', { 
    type: 'text', 
    placeholder: 'thème...',
    on: {
      keyup: updatelist
    },
    parent: sticky 
  })
  // Theme list
  const select = element.create('SELECT', {
    change: () => {
      input.value = select.value;
      select.valule = ' ';
      updatelist();
    },
    parent: sticky 
  })
  // Layer list
  const ul = element.create('UL', {
    parent: dialog.getContentElement()
  })
  const checks = []
  const themes = {}
  const layers = switcher.getMap().getLayers()
  layers.forEach(l => {
    const li = element.create('LI')
    ul.prepend(li)
    const c = new Checkbox ({
      type: 'checkbox',
      after: (l.get('title') || l.get('name')),
      parent: li
    })
    checks.push(c);
    c.element.querySelector('span').after(element.create('B', { 
      html: md2html.iconize(l.get('theme') || 'sans thème') + ' - ',
      className: l.get('theme') ? '' : 'notheme'
    }))
    if (l.get('theme')) themes[l.get('theme')] = 1
  })
  // Theme list
  element.create('OPTION', {
    html: 'sans thème &nbsp;',
    value: '',
    parent: select
  })
  Object.keys(themes).forEach(k => {
    element.create('OPTION', {
      html: md2html.iconize(k),
      value: k,
      parent: select
    })
  })
  select.value = ' ';
}

export default setThemes