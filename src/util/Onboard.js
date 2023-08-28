import olObject from 'ol/Object'
import element from 'ol-ext/util/element'

import './Onboard.css'

class Onboard extends olObject {
  constructor(pages, options) {
    options = options || {};
    super(options);
    this.element = element.create('DIV', {
      className: 'onboard ' + options.className,
      html: pages,
      parent: document.body
    })
    const elt = element.create('DIV', { className: 'spot', parent: this.element })
    this.spot = element.create('DIV', { className: 'help', parent: elt})
    this.help = element.create('DIV', { className: 'help', parent: this.element })
    this.set('step', 1);
    elt.addEventListener('click', () => this.nextStep())
    element.create('BUTTON', {
      html: 'passer l\'aide <i class="fi-arrow-right"></i>',
      className: 'button button-ghost',
      click: () => this.setStep(-1),
      parent: this.element
    })
  }
}

/** Is onboarding hidden at start?
 * @param {boolean} [b] true to hide at start, false to show it
 * @returns {boolean}
 */
Onboard.prototype.defaultHidden = function(b) {
  if (b===true) {
    localStorage.setItem('mc@showOnboarding', 'no')
  } else if (b===false) {
    localStorage.removeItem('mc@showOnboarding')
  }
  return !!localStorage.getItem('mc@showOnboarding');
}

/** Show next step
 * @param {boolean} [b] true to hide at start, false to show it
 * @returns {boolean}
 */
Onboard.prototype.nextStep = function() {
  const step = this.get('step');
  this.setStep(step+1)
}

/** Set set
 * @param {number} step
 */
Onboard.prototype.setStep = function(b) {
  b = b || 1;
  this.set('step', b);
  const step = this.element.querySelector('[data-page="'+b+'"]')
  // Last step / stop
  if (!step) {
    if (this._bindstep) window.removeEventListener('resize', this._bindstep)
    this._bindstep = null;
    this.element.style.display = 'none';
    return;
  }
  // Show current step
  this.element.style.display = 'block';
  if (!this._bindstep) {
    this._bindstep = () => this.setStep(this.get('step'));
    window.addEventListener('resize', this._bindstep)
  }

  // Element to focus on
  const focus = document.querySelector(step.dataset.focus);
  const rect = focus.getBoundingClientRect()
  // Set spot elemnt
  const spot = this.spot;
  spot.style.top = rect.top + 'px'
  spot.style.left = rect.left + 'px'
  spot.style.width = rect.width + 'px'
  spot.style.height = rect.height + 'px'
  // help
  this.help.innerHTML = step.innerHTML;
  let top, left, bottom, right;
  let width = step.clientWidth;
  const pos = step.dataset.position.split('-');
  // Set position 
  switch (pos[0]) {
    case 'top': {
      bottom = window.innerHeight - rect.top;
      break;
    }
    case 'bottom': {
      top = rect.bottom;
      break;
    }
    case 'right': {
      right = rect.left;
      break;
    }
    default: {
      left = rect.right;
      break;
    }
  }
  switch (pos[1]) {
    case 'left': {
      left = rect.left;
      break;
    }
    case 'right': {
      left = rect.right;
      width = Math.min(width, left);
      break;
    }
    case 'center': {
      left = (rect.left + rect.right) / 2;
      break;
    }
    case 'middle': {
      top = (rect.top + rect.bottom) / 2;
      break;
    }
    case 'top': {
      top = rect.top;
      console.log(top)
      break;
    }
    case 'bottom': {
      bottom = rect.bottom;
      break;
    }
  }
  // Set help
  this.help.className = 'help ' + pos.join(' ');
  this.help.style.width = width + 'px';
  this.help.style.top = top ? top + 'px' : 'unset';
  this.help.style.bottom = bottom ? bottom + 'px' : 'unset';
  this.help.style.left = left ? left + 'px' : 'unset';
  this.help.style.right = right ? right + 'px' : 'unset';
  this.help.dataset.step = b;
}

export default Onboard