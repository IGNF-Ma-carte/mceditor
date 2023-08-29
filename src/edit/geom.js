import carte from "../carte";
import 'ol-ext/render/Cspline'
import notification from 'mcutils/dialog/notification'

const select = carte.getSelect();

/** Chainkin smooth
 * @param {Array<ol_coordinates>} points
 * @param {number} [d=0.15] smooth factor [0,0.3]
 */
function smoothChainkin(points, d) {
  if (!d || d < 0 || d > 0.3) d = 0.15;
  const d2 = 1-d;
  const output = [];

  if (points.length > 0) {
    output.push([points[0], points[2]]);
  }

  let x0, y0, x1, y1;
  for (let i = 0; i < points.length - 1; i++) {
    x0 = points[i][0];
    y0 = points[i][1];
    x1 = points[i + 1][0];
    y1 = points[i + 1][1];

    output.push([
      d2 * x0 + d * x1, 
      d2 * y0 + d * y1
    ]);
    output.push([
      d * x0 + d2 * x1, 
      d * y0 + d2 * y1
    ]);
  }

  if (points.length > 1) {
    output.push([points[points.length - 1][0], points[points.length - 1][1]]);
  }

  return output;
};

function transformUndo(tr, opt) {
  const features = select.getFeatures().getArray();
  const geoms = [];
  features.forEach(f => {
    geoms.push(f.getGeometry())
    switch(tr) {
      case 'simplify': {
        f.setGeometry(f.getGeometry().simplify(opt))
        break;
      }
      case 'smooth': {
        if (f.getGeometry().getType() === 'LineString') {
          f.getGeometry().setCoordinates(smoothChainkin(f.getGeometry().getCoordinates(), opt))
        }
        break;
      }
      case 'spline': {
        f.setGeometry(f.getGeometry().cspline(opt));
        break;
      }
    }
  })
  notification.cancel(tr, () => {
    features.forEach((f,i) => {
      f.setGeometry(geoms[i])
    })
  })
}

/* Geom operation on selection */
const geom = {
  simplify: n => {
    transformUndo('simplify', n)
  },
  smooth: d => {
    transformUndo('smooth', d)
  },
  spline: (tension, pointsPerSeg) => {
    transformUndo('spline', {
      tension: tension, 
      pointsPerSeg: pointsPerSeg
    })
  }
}

/* DEBUG */
window.geom = geom;

export default geom