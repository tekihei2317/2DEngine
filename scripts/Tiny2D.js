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