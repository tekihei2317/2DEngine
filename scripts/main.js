(() => {
  'use strict'

  // canvas
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 600;
  let canvas = null;
  let context = null;

  // 物理エンジン
  let engine = null;

  // ロード完了時の処理
  window.addEventListener('load', () => {
    initialize();
  });

  // 変数を初期化する
  function initialize() {
    canvas = document.getElementById('main_canvas');
    context = canvas.getContext('2d');

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context.fillRect(0, 0, canvas.width, canvas.height);

    engine = new Engine(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 1000);

    const circle = new CircleEntity(100, 150, 30, 'dynamic', 0.8);
    const circle2 = new CircleEntity(500, 150, 30, 'dynamic', 0.95);
    const circle3 = new CircleEntity(300, 300, 80, 'static');

    const line = new LineEntity(0, 500, 600, 500);
    const line2 = new LineEntity(0, 100, 600, 100);
    const line3 = new LineEntity(10, 0, 10, CANVAS_HEIGHT);
    const line4 = new LineEntity(590, 0, 590, CANVAS_HEIGHT);
    const rect = new RectangleEntity(50, 400, 100, 50);

    circle.velocity.x = 1000;
    circle.velocity.y = 0;
    circle2.velocity.x = -1000;

    engine.entities.push(circle)
    engine.entities.push(circle2);
    engine.entities.push(circle3);
    engine.entities.push(line);
    engine.entities.push(line2);
    engine.entities.push(line3);
    engine.entities.push(line4);
    engine.entities.push(rect);

    render();
  }

  // 時間を進めてCanvasに再描画する
  function render() {
    // 時間を進める
    engine.step(1 / 60);

    // Canvasに再描画する
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    engine.entities.forEach((entity) => {
      if (entity.shape === 'circle') {
        context.beginPath();
        context.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = 'white';
        context.fill();
      } else if (entity.shape === 'rect') {
        context.fillStyle = 'gray';
        context.fillRect(entity.x, entity.y, entity.width, entity.height);
      } else if (entity.shape === 'line') {
        context.strokeStyle = 'lightgray';
        context.beginPath();
        context.moveTo(entity.x1, entity.y1);
        context.lineTo(entity.x2, entity.y2);
        context.stroke();
      }
    });
    requestAnimationFrame(render);
  }
})();