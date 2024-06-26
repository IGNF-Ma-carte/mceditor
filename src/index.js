// import './localhostapi.js'
import './mcversion'
import './i18n'
import charte from 'mcutils/charte/macarte'
import carte from './carte'
import './onglet/onglets'
import './layerShop/layershop'
import './edit/editbar'
import './tool_bar/toolBar'
import './edit/copypaste'
import './currentCarte'

import './edit/geom'

// Add prez functionnalities in the brower
import 'mcutils/charte/mcPrez'

import './unload'

// New app
charte.setApp('macarte', 'Ma carte', ['owner', 'editor']);

/* DEBUG */
import api from 'mcutils/api/api'
window.charte = charte;
window.carte = carte;
window.api = api
/**/