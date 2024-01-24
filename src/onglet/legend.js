import charte from "mcutils/charte/charte";
import legendConfigurator from 'mcutils/dialog/legendConfigurator'
import carte from "../carte";
import helpDialog from "mcutils/dialog/helpDialog";

import html from '../../page/onglet/legend-page.html'
import '../../page/onglet/legend.css'
import _T from "mcutils/i18n/i18n";

// Create tab
const tabLegend = charte.addMenuTab('legend', 'fg-map-legend', 'Affichage', html);
charte.setInputPlaceholder(tabLegend);

// Legend title
const itemTitle = tabLegend.querySelector('[data-attr="title"]');
itemTitle.addEventListener('keyup', () => {
  carte.getControl('legend').getLegend().setTitle(itemTitle.value)
  carte.changed()
})

// Legend line height
const itemHeight = tabLegend.querySelector('[data-attr="lineHeight"]');
itemHeight.addEventListener('change', () => {
  const v = parseInt(itemHeight.value) || 55;
  carte.getControl('legend').getLegend().set('lineHeight', v);
  carte.changed()
})

// Show legend?
const itemShow = tabLegend.querySelector('[data-attr="show"]');
itemShow.addEventListener('change', () => {
  carte.showControl('legend', itemShow.checked);
  carte.getControl('legend').show();
})

// Dialog legend configurator
function showDialog() {
  const dialog = legendConfigurator(
    carte.getSymbolLib(),
    carte.getControl('legend').getLegend(), {
      title: 'Configurer la légende',
      className: 'legendConfig',
      layers: carte.getMap().getLayers()
    }
  )
  carte.changed();
  helpDialog(dialog.element.querySelector('h2'), _T('helpLegendConfig'));
}

// Open when dblclick on legend
carte.getControl('legend').element.addEventListener('dblclick', showDialog)

// Handle content
const buttonContent = tabLegend.querySelector('button.content');
buttonContent.addEventListener('click', showDialog)

// Init values on read
carte.on('read', () => {
  const l = carte.getControl('legend').getLegend();
  charte.setInputValue(itemTitle, l.getTitle());
  itemHeight.value = l.get('lineHeight');
  itemShow.checked = carte.hasControl('legend');
})

// Remove legend when layers is removed
carte.getMap().getLayers().on('remove', e => {
  const leg = e.element._legend;
  if (leg) {
    const legend = carte.getControl('legend').getLegend();
    legend.removeItem(leg);
  }
})