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
    const circle = new CircleEntity(50, 100, 50, 'dynamic');
    const circle2 = new CircleEntity(500, 150, 50, 'dynamic');
    const circle3 = new CircleEntity(300, 150, 20, 'dynamic');

    const rect = new RectangleEntity(150, 300, 300, 150);
    const rect2 = new RectangleEntity(100, 400, 400, 1);
    const line = new LineEntity(100, 400, 500, 400);
    const line2 = new LineEntity(500, 50, 500, 200);

    circle.velocity.x = 20;
    circle2.velocity.x = 0;
    circle3.velocity.x = 560;
    // engine.entities.push(circle);
    // engine.entities.push(circle2);
    engine.entities.push(circle3);
    // engine.entities.push(rect);
    // engine.entities.push(rect2);
    engine.entities.push(line);
    // engine.entities.push(line2);

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