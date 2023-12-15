import MDEditor from 'mcutils/md/MDEditor'

import dlg from 'mcutils/dialog/dialog'
import _T from 'mcutils/i18n/i18n'
import notification from 'mcutils/dialog/notification'
import Button from 'ol-ext/control/Button'

import switcher from './layerSwitcher'
import InputMedia from 'mcutils/control/InputMedia'

import infoHTML from '../../page/layerShop/layerInfo.html'
import '../../page/layerShop/layerInfo.css'

// Show info button
switcher.addControl(new Button({
  html: '<i class="fa fa-info-circle"></i>',
  title: _T('Information'),
  handleClick: function() {
    var layer = switcher.getSelection();
    if (!layer) {
      notification.show('Aucune couche sélectionnée...');
      return;
    }
    if (layer) {
      dlg.show({
        title: _T('Information'),
        className: 'layerInfo',
        content: infoHTML,
        buttons: { submit: 'ok', cancel: 'annuler' },
        onButton: (b, inputs) => {
          switch (b) {
            case 'submit': {
              layer.set('title', inputs.title.value)
              layer.set('desc', inputs.desc.value)
              layer.set('logo', inputs.logo.value)
              layer.set('theme', inputs.theme.value)
              if (content.classList.contains('exportable')) {
                layer.set('exportable', inputs.export.checked);
              }
              if (content.dataset.editCopy) {
                layer.getSource().setAttributions(inputs.copy.value)
              }
              switcher.drawPanel()
              dlg.close();
              break;
            }
          }
        }
      });
      const content = dlg.getContentElement();
      // Init values
      content.querySelector('.title').value = layer.get('title') || '';
      // Description as MD
      content.querySelector('.desc').value = layer.get('desc') || '';
      const layerProp = {};
      ['title', 'logo', 'id', 'type', 'name', 'minZoom', 'maxZoom', 'visible', 'opacity'].forEach(p => {
        layerProp[p] = layer.get(p)
      });
      new MDEditor({
        input: content.querySelector('.desc'),
        data: layerProp
      })
      // Properties
      content.querySelector('.theme').value = layer.get('theme') || '';
      content.querySelector('.logo').value = layer.get('logo') || '';
      content.querySelector('.export input').checked = !!layer.get('exportable');
      new InputMedia({
        add: true,
        input: content.querySelector('.logo')
      })
      // Extra (logo + theme)
      if (layer.get('logo') || layer.get('theme')) dlg.element.classList.add('extra');
      content.querySelector('a.article').addEventListener('click', () => {
        dlg.element.classList.toggle('extra');
      })
      // Exportable layer
      if (/vector|statistique|file/i.test(layer.get('type'))) {
        content.classList.add('exportable')
      } else {
        content.classList.remove('exportable')
      }
      content.querySelector('.export input').checked = !!layer.get('exportable');
      // Copyright
      content.dataset.editCopy = '1';
      if (layer.get('attributions')
      || layer.get('type')==='Geoportail'
      || (layer.get('type')==='WMS' && layer.get('wmsparam').source.attributions.length)
      || (layer.get('type')==='WMTS' && layer.get('wmtsparam').source.attributions.length)
      ) {
        delete content.dataset.editCopy;
        content.querySelector('div.copy').innerHTML = layer.get('attributions') || layer.getSource().getAttributions()().join(' - ');
        content.querySelectorAll('div.copy a').forEach(a => {
          a.addEventListener('click', e => {
            e.preventDefault();
            window.open(a.href, 'attribution')
          })
        })
      } else if (layer.getSource().getAttributions()) {
        const copy = layer.getSource().getAttributions()({ extent: [-Infinity, -Infinity, Infinity, Infinity] });
        content.querySelector('input.copy').value = copy.join(' - ');
      } else {
        content.querySelector('input.copy').value = '';
      }
    }
  }
}), 'bottom');