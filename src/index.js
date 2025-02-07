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

// Load carte in the url
import './currentCarte'

// Add geom functionnalities
import './edit/geom'
// Add prez functionnalities in the brower
import 'mcutils/charte/mcPrez'

import './unload'

// New app
charte.setApp('macarte', 'Ma carte', ['owner', 'editor']);

// Put multi select to false
carte.getSelect().multi_ = false

/* DEBUG */
import api from 'mcutils/api/api'
window.charte = charte;
window.carte = carte;
window.api = api
/**/