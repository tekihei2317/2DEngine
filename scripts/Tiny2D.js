// ベクトルを扱うクラス
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * ベクトルを加算して返す
   * @param {Vector}
   */
  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y);
  }
  /**
   * ベクトルを引いて返す
   * @param {Vector} vec 
   */
  sub(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y);
  }
  /**
   * 各成分を定数倍して返す
   * @param {number} kx - x成分の係数
   * @param {number} ky - y成分の係数
   */
  mul(kx, ky = kx) {
    return new Vector(this.x * kx, this.y * ky);
  }
  /**
   * 平行なベクトルとの比を求める
   * @param {Vector} vec 
   */
  div(vec) {
    console.assert(vec.norm() !== 0, 'zero division will occur!');
    return vec.x !== 0 ? this.x / vec.x : this.y / vec.y;
  }
  /**
   * ベクトルとの内積を求める
   * @param {Vector} vec 
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  /**
   * ベクトルとの外積(スカラー)を求める
   * @param {Vector} vec 
   */
  cross(vec) {
    return this.x * vec.y - this.y * vec.x;
  }
  /**
   * ベクトルの大きさを返す
   */
  norm() {
    return Math.hypot(this.x, this.y);
  }
  /**
   * 正射影ベクトルを求める
   * @param {Vector} vec - 射影する直線の方向ベクトル
   */
  projection(vec) {
    const t = this.dot(vec) / (vec.norm() * vec.norm());
    return vec.mul(t);
  }
  print() {
    console.log(`(${this.x}, ${this.y})`);
  }
}

// 物体を扱うクラス(基底クラス)
class Entity {
  /**
   * @constructor
   * @param {string} shape - 形('circle' or 'rect' or 'line')
   * @param {string} motionType  - 動きのタイプ(static, dynamic)
   */
  constructor(shape, motionType) {
    this.shape = shape;
    this.motionType = motionType;
  }
}

// 線分を扱うクラス
class LineEntity extends Entity {
  /**
   * @constructor
   * @param {number} x1 始点のx座標
   * @param {number} y1 始点のy座標
   * @param {number} x2 終点のx座標
   * @param {number} y2 終点のy座標
   */
  constructor(x1, y1, x2, y2) {
    super('line', 'static');
    [this.x1, this.y1, this.x2, this.y2] = [x1, y1, x2, y2];
  }
}

// 長方形を扱うクラス
class RectangleEntity extends Entity {
  /**
   * @constructor
   * @param {number} x - 左上のx座標
   * @param {number} y - 左上のy座標
   * @param {number} width - 長方形の横幅
   * @param {number} height - 長方形の高さ
   */
  constructor(x, y, width, height) {
    super('rect', 'static');
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

// 円を扱うクラス
class CircleEntity extends Entity {
  /**
   * @constructor
   * @param {number} x - 中心のx座標
   * @param {number} y - 中心のy座標
   * @param {number} radius - 半径
   * @param {string} motionType - 動きのタイプ('static' or'dynamic')
   */
  constructor(x, y, radius, motionType) {
    super('circle', motionType);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = new Vector(0, 0);
  }

  /**
   * 円を移動させる
   * @param {number} dx - x軸方向の移動量
   * @param {number} dy - y軸方向の移動力
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * 円の中心と線分の最短距離を求める
   * @param {LineEntity} line 
   */
  calcDistToLine(line) {
    const a = new Vector(this.x - line.x1, this.y - line.y1);
    const l = new Vector(line.x2 - line.x1, line.y2 - line.y1);
    const p = a.projection(l);
    let t = p.div(l);
    t = clamp(0, t, 1);
    return a.sub(l.mul(t)).norm();
  }

  collideWithLine(line) {
    // 衝突判定
    const dist = this.calcDistToLine(line);
    if (dist > this.radius) return;

    const vecA = new Vector(line.x2 - line.x1, line.y2 - line.y1);
    const vecB = vecA.mul(-1);
    const vecC = new Vector(this.x - line.x1, this.y - line.y1);
    const vecD = new Vector(this.x - line.x2, this.y - line.y2);

    const overlap = this.radius - dist;
    const tangentVector = vecA.mul(1 / vecA.norm());
    let normalVector = vecC.mul(-1).add(vecA.mul(vecA.dot(vecC) / vecA.norm() / vecA.norm()));

    // normalVector.print();
    if (normalVector.norm() === 0) {
      // 円の中心と線分が一直線上にあるとき0になりそう(多分...)
      // normalVectorは適当なのであとで修正
      normalVector = new Vector(0, 1);
      console.log('hoge');
    } else {
      normalVector = normalVector.mul(1 / normalVector.norm());
    }
    // normalVector.print();
    // めり込みを治す
    this.move(-normalVector.x * overlap, -normalVector.y * overlap);
    // this.velocity===k*normalVector+l*tangentVector
    const k = this.velocity.dot(normalVector);
    this.velocity = this.velocity.add(normalVector.mul(-2 * k));
    // console.log('line and circle collide!');
  }
  /**
   * 長方形との衝突判定
   * @param {RectangleEntity} peer 
   */
  collideWithRect(rect) {
    // 衝突判定
    const nearestX = clamp(rect.x, this.x, rect.x + rect.width);
    const nearestY = clamp(rect.y, this.y, rect.y + rect.height);
    const dist = Math.hypot(nearestX - this.x, nearestY - this.y);
    if (dist > this.radius) return;

    // 円の中心が長方形の内部に合る場合はとりあえず無視する(貫通しそう)
    if (nearestX === this.x && nearestY === this.y) return;

    // 衝突処理
    const overlap = this.radius - dist;
    let mx = 0, my = 0, kx = 1, ky = 1;
    if (nearestY === rect.y) [my, ky] = [-overlap, -1];
    else if (nearestY === rect.y + rect.height) [my, ky] = [overlap, -1];
    else if (nearestX === rect.x) [mx, kx] = [-overlap, -1];
    else if (nearestX === rect.x + rect.width) [mx, kx] = [overlap, -1];

    this.move(mx, my);
    this.velocity = this.velocity.mul(kx, ky);
  }

  /**
   * 円との衝突判定
   * @param {CircleEntity} circle 
   */
  collideWithCircle(peer) {
    // 衝突判定
    const dist = Math.hypot(this.x - peer.x, this.y - peer.y);
    if (dist > this.radius + peer.radius) return;

    // 自身が止まっている場合は相手を基準にして処理し直す
    if (this.motionType === 'static') {
      peer.collideWithCircle(this);
      return;
    }
    console.assert(dist !== 0, 'zero division will occur!');

    const overlap = (this.radius + peer.radius) - dist;
    const v = new Vector(peer.x - this.x, peer.y - this.y);
    // 接線に垂直な単位ベクトル(自身の中心→もう一方の中心の向き)
    const normalVector = v.mul(1 / dist);
    // 接線に平行な単位ベクトル
    const tangentVector = new Vector(-normalVector.y, normalVector.x);

    // 相手が動いているかどうかで場合分け
    if (peer.motionType === 'static') {
      // めり込みを戻す(いらない?)
      this.move(-overlap * normalVector.x, -overlap * normalVector.y);
      // 速度ベクトルを反射させる
      // velocity===k*normalVector+l*tangentVectorを満たすkを求める
      const k = this.velocity.dot(normalVector);
      this.velocity = this.velocity.add(normalVector.mul(-2 * k));

    } else {
      // めり込みを戻す(いらない?)
      this.move(-normalVector.x * overlap / 2, -normalVector.y * overlap / 2);
      peer.move(normalVector.x * overlap / 2, normalVector.y * overlap / 2);

      // this.velocity===k1*normalVector+k2*tangentVectorを満たすk1,k2を求める
      const k1 = this.velocity.dot(normalVector);
      const k2 = this.velocity.dot(tangentVector);
      // peer.velocity===k3*normalVector+k4*tangentVectorを満たすk3,k4を求める
      const k3 = peer.velocity.dot(normalVector);
      const k4 = peer.velocity.dot(tangentVector);

      // 接線に垂直な成分を入れ替える
      this.velocity = normalVector.mul(k3).add(tangentVector.mul(k2));
      peer.velocity = normalVector.mul(k1).add(tangentVector.mul(k4));
    }
  }
}

// 物理エンジン
class Engine {
  /**
   * @constructor
   * @param {number} x - 領域の左上のx座標
   * @param {number} y - 領域の左上のy座標
   * @param {number} width - 領域の横幅
   * @param {number} height - 領域の高さ
   * @param {number} gravityX - 重力加速度のx成分
   * @param {number} gravityY - 重力加速度のy成分
   */
  constructor(x, y, width, height, gravityX, gravityY) {
    this.worldX = x;
    this.worldY = y;
    this.worldWidth = width;
    this.worldHeight = height;
    this.gravity = new Vector(gravityX, gravityY);
    this.entities = [];
  }

  /**
   * 引数の分だけ時間を進める
   * @param {number} elapsedTime - 進める時間(単位: 秒)
   */
  step(elapsedTime) {
    const entities = this.entities;
    const diff_velocity = this.gravity.mul(elapsedTime);

    // 速度を更新してentityを移動させる
    entities.forEach((entity) => {
      if (entity.motionType === 'dynamic') {
        entity.velocity = entity.velocity.add(diff_velocity);
        entity.move(entity.velocity.x * elapsedTime, entity.velocity.y * elapsedTime);
      }
    });

    // 物体同士の衝突判定&衝突処理
    const len = entities.length;
    for (let i = 0; i < len - 1; i++) for (let j = i + 1; j < len; j++) {
      let entityA = entities[i];
      let entityB = entities[j];
      if (entityA.motionType === 'static' && entityB.motionType === 'static') continue;

      // entityAが円になるようにする(どちらかは'dynamic'=>円)
      if (entityA.shape !== 'circle') [entityA, entityB] = [entityB, entityA];

      // 衝突判定&衝突処理
      if (entityB.shape === 'circle') entityA.collideWithCircle(entityB);
      else if (entityB.shape === 'line') entityA.collideWithLine(entityB);
      else if (entityB.shape === 'rect') entityA.collideWithRect(entityB);
    }

    // 床との衝突判定&衝突処理
    entities.forEach((entity) => {
      if (entity.motionType !== 'dynamic') return;
      if (entity.y + entity.radius >= this.worldHeight) {
        const overlap = entity.y + entity.radius - this.worldHeight;
        entity.move(0, -overlap);
        entity.velocity.y = -entity.velocity.y;
      }
    });

    // 左右の壁との衝突判定
    entities.forEach((entity) => {
      if (entity.motionType !== 'dynamic') return;
      if (entity.x - entity.radius <= 0 || entity.x + entity.radius >= this.worldWidth) {
        entity.velocity.x = -entity.velocity.x;
      }
    });
  }
}

function clamp(l, x, r) {
  return Math.max(l, Math.min(x, r));
}