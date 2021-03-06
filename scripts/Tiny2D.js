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
    console.assert(vec.norm() !== 0, 'zero division occured!');
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
   * ベクトルを正規化して返す
   */
  normalize() {
    console.assert(this.norm() !== 0, 'zero division occured!');
    return new Vector(this.x / this.norm(), this.y / this.norm());
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
   * @param{number} restitution - 反発係数
   */
  constructor(x, y, radius, motionType, restitution = 1.0) {
    super('circle', motionType);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity = new Vector(0, 0);
    this.restitution = restitution;
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

    const a = new Vector(this.x - line.x1, this.y - line.y1);
    const l = new Vector(line.x2 - line.x1, line.y2 - line.y1);
    const p = a.projection(l);
    // 線分の法線ベクトル(円の中心から線分に向かう向き)
    const normalVector = p.sub(a).normalize();
    const overlap = this.radius - dist;

    // 衝突処理
    this.move(-normalVector.x * overlap, -normalVector.y * overlap);
    this.velocity = this.velocity.add(this.velocity.projection(normalVector).mul(-2));
    this.velocity = this.velocity.mul(this.restitution);
  }

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
    this.velocity = this.velocity.mul(this.restitution);
  }

  collideWithCircle(peer) {
    // 自身が止まっている場合は相手を基準にして処理し直す
    if (this.motionType === 'static') {
      peer.collideWithCircle(this);
      return;
    }

    // 衝突判定
    const dist = Math.hypot(this.x - peer.x, this.y - peer.y);
    if (dist > this.radius + peer.radius) return;

    // 衝突面に垂直な単位ベクトル(自身の中心→もう一方の中心の向き)
    const normalVector = new Vector(peer.x - this.x, peer.y - this.y).normalize();
    const overlap = (this.radius + peer.radius) - dist;

    if (peer.motionType === 'static') {
      // 動く円と静止円の衝突処理
      this.move(-overlap * normalVector.x, -overlap * normalVector.y);
      const thisNormal = this.velocity.projection(normalVector);
      this.velocity = this.velocity.add(thisNormal.mul(-2));
      this.velocity = this.velocity.mul(this.restitution);

    } else {
      // 動く円同士の衝突処理
      this.move(-normalVector.x * overlap / 2, -normalVector.y * overlap / 2);
      peer.move(normalVector.x * overlap / 2, normalVector.y * overlap / 2);

      // 衝突面に垂直な成分を入れ替える
      const thisNormal = this.velocity.projection(normalVector);
      const peerNormal = peer.velocity.projection(normalVector);
      this.velocity = this.velocity.sub(thisNormal).add(peerNormal);
      peer.velocity = peer.velocity.sub(peerNormal).add(thisNormal);

      this.velocity = this.velocity.mul(this.restitution);
      peer.velocity = peer.velocity.mul(peer.restitution);
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
  }
}

function clamp(l, x, r) {
  return Math.max(l, Math.min(x, r));
}