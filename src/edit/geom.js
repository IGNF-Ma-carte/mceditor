import carte from "../carte";
import 'ol-ext/render/Cspline'
import notification from 'mcutils/dialog/notification'
import { ol_coordinate_dist2d, ol_coordinate_equal } from 'ol-ext/geom/GeomUtils'

const select = carte.getSelect();


// Distance to segment
function distSeg(point, p1, p2) {
  if (ol_coordinate_equal(p1,p2)) {
    return Math.pow((point[0] - p1[0]), 2) + Math.pow((point[1] - p1[1]), 2);
  }
  // slope
  var m = (p2[1] - p1[1]) / (p2[0] - p1[0]),
    // y offset
    b = p1[1] - ( m * p1[0] ),
    d = [];
  // distance to the linear equation
  d.push(Math.pow( point[1] - (m * point[0] ) - b, 2) / (Math.pow(m, 2) + 1));
  // distance to p1
  d.push( Math.pow((point[0] - p1[0]), 2) + Math.pow((point[1] - p1[1]), 2));
  // distance to p2
  d.push( Math.pow((point[0] - p2[0]), 2) + Math.pow((point[1] - p2[1]), 2));
  // return the smallest distance
  return d.sort((a, b) => a-b)[0];
};

// Iterative distance
function douglas(points, tolerance) {
  if (points.length <= 2) {
    return [points[0]];
  }
  let returnPoints = [];
  // Current segement 
  const seg = [points[0], points[points.length-1]];
  // find the largest distance from intermediate poitns to this line
  let maxDistance = 0;
  let maxDistanceIndex = 0;
  for (let i=1; i <= points.length -2; i++) {
    var distance = distSeg(points[i], seg[0], seg[1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxDistanceIndex = i;
    }
  }
  // check if the max distance 
  if (maxDistance >= tolerance) {
    // go back
    returnPoints = returnPoints.concat( douglas( points.slice( 0, maxDistanceIndex + 1 ), tolerance ) );
    // and forth
    returnPoints = returnPoints.concat( douglas( points.slice( maxDistanceIndex, points.length ), tolerance ) );
  } else {
    // ditching this point
    returnPoints = [points[0]];
  }
  return returnPoints;
};

/** Douglas Peucker algorithm
 * @param { Array<ol_coordinates } points
 * @param { number } tolerance
 */
function douglasPeucker(points, tolerance) {
  // Polygon
  if (points[0][0].length) {
    const output = [];
    points.forEach(p => {
      output.push(douglasPeucker(p, tolerance));
    });
    return output;
  }
  // Single point
  if (!points[0].length) return points;

  // Filter line
  const output = douglas(points, tolerance * tolerance);
  // last point
  output.push(points[points.length - 1]);
  return output;
};



/** Chainkin smooth
 * @param {Array<ol_coordinates>} points
 * @param {number} [d=0.15] smooth factor [0,0.5]
 */
function smoothChainkin(points, d) {
  const output = []

  // Polygon
  if (points[0][0].length) {
    points.forEach(p => {
      const sm = smoothChainkin(p, d);
      // Close polygon
      if (ol_coordinate_equal(p[0], p[p.length-1])) {
        sm.pop();
        sm[0] = sm[sm.length-1]
      }
      output.push(sm);
    });
    return output;
  }
  // Single point
  if (!points[0].length) return points;

  // Smooth line
  if (!d || d < 0) d = 0.15;
  if (d > 0.5) d = 0.5;
  const d2 = 1-d;

  if (points.length > 0) {
    output.push([points[0][0], points[0][1]]);
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
    // Prevent duplicated points
    if (d != 0.5) {
      output.push([
        d * x0 + d2 * x1, 
        d * y0 + d2 * y1
      ]);
    }
  }

  if (points.length > 1) {
    output.push([points[points.length - 1][0], points[points.length - 1][1]]);
  }

  return output;
};


/** Snap extremity to closest feature in the layer
 * @param {Feature} f
 * @param {number} d distance to snap
 */
function undershoot(f, d) {
  if (f.getGeometry().getType() === 'LineString') {
    const source = f.getLayer().getSource();
    const coords = f.getGeometry().getCoordinates();
    const f1 = source.getClosestFeatureToCoordinate(coords[0], fi => fi !== f);
    if (f1) {
      const c = f1.getGeometry().getClosestPoint(coords[0])
      if (ol_coordinate_dist2d(coords[0], c) < d) {
        coords[0] = c
      }
    }
    const f2 = source.getClosestFeatureToCoordinate(coords[coords.length-1], fi => fi !== f);
    if (f2) {
      const c = f2.getGeometry().getClosestPoint(coords[coords.length-1]);
      if (ol_coordinate_dist2d(coords[coords.length-1], c) < d) {
        coords[coords.length-1] = c
      }
    }
    f.getGeometry().setCoordinates(coords);
  }
}


/** Apply transform on selection and display undo button
 * @param {function} tr transform to apply
 */
function transformUndo(tr) {
  const features = select.getFeatures().getArray();
  const geoms = [];
  features.forEach(f => {
    geoms.push(f.getGeometry())
    tr(f);
  })
  notification.cancel('transformation', () => {
    features.forEach((f,i) => {
      f.setGeometry(geoms[i])
    })
  })
}

/* Geom operation on selection */
const geom = {
  simplify: n => {
    transformUndo(f => {
      f.setGeometry(f.getGeometry().simplify(n))
    })
  },
  smooth: d => {
    transformUndo(f => {
      const geom = f.getGeometry().clone();
      geom.setCoordinates(smoothChainkin(geom.getCoordinates(), d))
      f.setGeometry(geom)
    })
  },
  spline: (tension, pointsPerSeg) => {
    transformUndo(f => {
      f.setGeometry(f.getGeometry().cspline({
        tension: tension || Math.PI/4,
        pointsPerSeg: pointsPerSeg || 3
      }));
    })
  },
  douglasPeucker: d => {
    transformUndo(f => {
      const geom = f.getGeometry().clone();
      geom.setCoordinates(douglasPeucker(geom.getCoordinates(), d))
      f.setGeometry(geom)
    })
  },
  undershoot: d => {
    transformUndo(f => {
      undershoot(f, d);
    })
  },
  help: () => {
    console.log(`%cModify selection geometry
%cgeom.simplify(d): simplify feature, d tolerance distance for simplification
geom.douglasPeucker(d): Douglas-Peucker [d=0.15] smooth factor [0,0.3]
geom.smooth(d): Chainkin smooth [d=0.15] smooth factor [0,0.3]
geom.spline(tension, pointsPerSeg): calculate spline
geom.undershoot(d): snap extremity to closest feature, d=snap distance
`,  
"font-size: 15px; color: brown; font-weight: bold;",
"font-size: 10px; color: #333;",
  )}
}

/* DEBUG */
window.geom = geom;

export default geom