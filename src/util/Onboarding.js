
import olObject from 'ol/Object'
import element from 'ol-ext/util/element'

import '../../page/util/Onboarding.css'

/** Onboarding
 * @constructor
 * @constructor
 * @extends {olObject}
 * @param {string} pages 
 * @param {Object} options 
 *  @param {string} [options.title='']
 *  @param {string} [options.className=dialog] default | dialog
 *  @param {boolean} [options.stepOnClick=false] change step on click
 * @fires step
 * @fires hide
 */
class Onboarding extends olObject {
  constructor(pages, options) {
    options = options || {};
    super(options);
    this.set('title', options.title || '');
    this.set('className', options.className || '');
    this.set('stepOnClick', options.stepOnClick || false);
    this.onbdContainer = this._buildDlg(pages);
  }
}

/** Change step
 * @param {number} [index=0] step index
 */
Onboarding.prototype.setStep = function (index) {
  this.element.dataset.visible = '';

  // >> Trigger a - Start Event -
  if (index === this.size) {
    this.dispatchEvent({ type: 'start' });
    this.hide();
  }

  // Reset index range value
  index = Math.max(0, Math.min(index || 0, this.size-1));
  this.current = index;

  // Index list
  const indexList = this.stepIndex.querySelectorAll('li');

  // >> Set [data-current] and [data-shown] for li
  indexList.forEach(li => {
    delete li.dataset.current;
    delete li.dataset.shown;
  })
  for (let k=0; k<index; k++) {
    indexList[k].dataset.shown = '';
  }
  indexList[index].dataset.current = '';

  // >> Class name depends on index value
  this.element.dataset.step = (index === this.size-1) ? 'last-step' : 'step-' + index;

  // >> Handling buttons :
  
  // First step : disable previous step button
  this.previousBtn.disabled = (index === 0);
  
  // Start button : change class
  if (index === this.size-1) {
    this.nextBtn.classList.remove('button-ghost')
    this.nextBtn.classList.add('button-colored')  
  } else {
    this.nextBtn.classList.add('button-ghost')
    this.nextBtn.classList.remove('button-colored')
  }

  // Start button :  change inner
  this.nextBtn.innerHTML = (index === this.size-1) ? 'Commencer' : 'Etape suivante'

  // >> Display content of html block with [data-step] = index of step
  this.stepElement.querySelectorAll('[data-page]').forEach((p, i) => {
    if (i === index) p.dataset.visible = '';
    else delete p.dataset.visible;
  })

  // DispatchEvent
  this.dispatchEvent({ type: 'step', step: this.current });
};


/** 
 * Hide Onboarding
 */
Onboarding.prototype.hide = function () {
  delete this.element.dataset.visible;
  this.dispatchEvent({ type: 'hide' });
}

/**
 * Create the Dialog Box containing onbd Panel.
 * @private 
 */
Onboarding.prototype._buildDlg = function (pages) {

  // Background container
  const back =  this.element = element.create('DIV', {
    className: 'onboarding' + ' ' + this.get('className'),
    parent: document.body 
  });

  // Container
  const container = element.create('DIV', {
    className: 'onbd-container',
    parent: back
  })

  element.create('H2', {
    html: this.get('title'),
    className: 'onbd-global-title',
    parent: container 
  })

  // Stepviewer with circles
  const stepViewer = this.stepIndex = element.create('OL', {
    className: 'onbd-step-viewer',
    parent: container 
  })


  // Step content
  this.stepElement = element.create('DIV', {
    className: 'onbd-step-content',
    html: pages,
    parent: container 
  })

  const size = this.size = this.stepElement.querySelectorAll('[data-page]').length;
  for (let i = 0; i < size; i++) {
    element.create('LI', {
      'data-step': i,
      click: () => {
        this.setStep(i);
      },
      parent: stepViewer 
    });
  }

  // Buttons
  const btn = element.create('DIV', {
    className: 'onbd-buttons',
    parent: container 
  })
 
  this.previousBtn = element.create('BUTTON', {
    html: 'Etape précédente',
    className: 'button button-ghost previous',
    click: ()=> {
      this.setStep(this.current-1);
    },
    parent: btn
  })

  this.nextBtn = element.create('BUTTON', {
    html: 'Etape suivante',
    className: 'button button-ghost next',
    click: ()=> {
      this.setStep(this.current+1);
    },
    parent: btn
  })

  element.create('BUTTON', {
    html: 'Annuler',
    className: 'button button-ghost',
    click: ()=> {
      this.hide();
    },
    parent: btn
  })


  // Onbd Show option
  const showOnbdDiv = element.create('DIV', {
    className: 'showonboarding',
    parent: container
  })

  const showOnbdLbl = element.create('LABEL', {
    html: '<input type="checkbox">'+
    '<i>Ne plus afficher</i>' +
    '<span></span>',
    className: "ol-ext-check ol-ext-checkbox small",
    parent: showOnbdDiv
  })

  this.chkBox = showOnbdLbl.querySelector('.showonboarding input');
  this.chkBox.checked = this.defaultHidden();

  // Update localStorage variable
  this.chkBox.addEventListener('change', () => this.defaultHidden(this.chkBox.checked));

  // If options stepOnClick : add event listener on click
  if (this.get('stepOnClick')) {
    this.changeOnClick();
  }
}

/** Get page element
 * @param {number} step
 * @returns {Element}
 */
Onboarding.prototype.getPageElement = function(step) {
  const page = this.element.querySelector('[data-page="' + step + '"]')
  return page;
}

/** Is onboarding hidden at start?
 * @param {boolean} [b] true to hide at start, false to show it
 * @returns {boolean}
 */
Onboarding.prototype.defaultHidden = function(b) {
  if (b===true) {
    localStorage.setItem('mc@showOnboarding', 'no')
  } else if (b===false) {
    localStorage.removeItem('mc@showOnboarding')
  }
  return !!localStorage.getItem('mc@showOnboarding');
}

/**
 * Goes to next step on click.
 */
Onboarding.prototype.changeOnClick = function() {
  this.element.addEventListener('click', () => {
    this.setStep(this.current+1);
  })
}


export default Onboarding;