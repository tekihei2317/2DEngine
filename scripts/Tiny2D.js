/**
 * ベクトルを扱うクラス
 */
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   * ベクトルを加算する
   * @param {number} x 
   * @param {number} y 
   */
  add(x, y) {
    this.x += x;
    this.y += y;
  }
  /**
   * ベクトルとの内積を求める
   * @param {Vector} vec 
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  /**
   * ベクトルとの外積(2次元)を求める
   * @param {Vector} vec 
   */
  cross(vec) {
    return this.x * vec.y - this.y * vec.x;
  }
}

// 物体を扱うクラス(基底クラス)
class Entity {
  /**
   * @constructor
   * @param {string} shape - 形(circle, rect, line)
   * @param {string} motionType  - 動きのタイプ(static, dynamic)
   */
  constructor(shape, motionType) {
    this.shape = shape;
    this.motionType = motionType;
  }
}

// 円を扱うクラス
class CircleEntity extends Entity {
  /**
   * @constructor
   * @param {number} x - 中心のx座標
   * @param {number} y - 中心のy座標
   * @param {number} radius - 半径
   * @param {string} motionType - 動きのタイプ('static', 'dynamic')
   */
  constructor(x, y, radius, motionType) {
    super('circle', motionType);
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}