import './localisation'
import './style'
import './attributes'
import './popup'
import './legend'
import './search'
import './display'

import charte from 'mcutils/charte/macarte'
import helpDialog from 'mcutils/dialog/helpDialog'
import _T from 'mcutils/i18n/i18n'

import '../../page/onglet/onglets.css'


/**
 * Ajout des boutons d'information sur chaque onglet.
 */
charte.getMenuTabElement().querySelectorAll('[data-help]').forEach((elt) => {
  const help = elt.getAttribute('data-help').split(' ');
  helpDialog(elt, _T(help[0]), { className: help[1] || 'none' });
})