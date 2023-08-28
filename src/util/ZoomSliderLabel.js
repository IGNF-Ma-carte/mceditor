import ol_ext_element from 'ol-ext/util/element'


/* Zomm text value */
const zoomTxt = [
  'Monde',        //0
  'Monde',        //1
  'Monde',        //2
  'Continent',    //3
  'Continent',    //4
  'Pays',         //5
  'Pays',         //6
  'Région',       //7
  'Région',       //8
  'Dépt',         //9
  'Dépt',         //10
  'Agglo.',       //11
  'Agglo.',       //12
  'Ville',        //13
  'Ville',        //14
  'Quartier',     //15
  'Quartier',     //16
  'Rue',          //17
  'Rue',          //18
  'Adresse',      //19
  'Adresse'       //20
]

 /**
  * Deisgn the zoom range input with highlights
  * @param {*} zoomRange : a Range with min & max.
  */
function zoomRangeInput(zoomRange) {
  zoomRange.on('change:value', () => {

    // Remove all formers highlights [data-select] & recompute it later 
    zoomTxtDiv.querySelectorAll('span').forEach(sp => {
      delete sp.dataset.select;
    })

    // Get new zoom min and zoom max values.
    const vmin = zoomTxt[Math.round(zoomRange.getMin())]
    const vmax = zoomTxt[Math.round(zoomRange.getMax())]

    // Highlight div corresponding to those vmin and vmax values.
    if (vmin) zoomTxtDiv.querySelector('.'+vmin.replace(/\./g, '')).dataset.select = '';
    if (vmax) zoomTxtDiv.querySelector('.'+vmax.replace(/\./g, '')).dataset.select = '';
  })

  // Enhance slider bar by adding text info right below
  // Ex : zoom level = 5 <=> 'Pays'
  let curText = '';
  const zoomTxtDiv = ol_ext_element.create('DIV', {
    className: 'zommText',
    parent: zoomRange.element.parentNode
  });
  zoomTxt.forEach(t => {
    if (curText!==t) {
      curText = t;
      ol_ext_element.create('SPAN', {
        className: t.replace(/\./g, ''),
        html: t,
        parent: zoomTxtDiv
      })
    }
  })  
}

export default zoomRangeInput;
