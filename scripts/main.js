(() => {
  'use strict'

  const v1 = new Vector(3, 4);
  const v2 = new Vector(-5, 2);

  console.log(v1.dot(v2));
  console.log(v1.cross(v2));

  const c1 = new CircleEntity(100, 100, 10, 'static');

})();