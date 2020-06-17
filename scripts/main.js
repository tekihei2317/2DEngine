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
    const circle3 = new CircleEntity(330, 300, 30, 'dynamic');

    const rect = new RectangleEntity(150, 300, 300, 150);
    const rect2 = new RectangleEntity(100, 400, 400, 1);
    const rect3 = new RectangleEntity(330, 300, 1, 200);
    const rect4 = new RectangleEntity(340, 300, 200, 10);
    const line = new LineEntity(100, 400, 500, 400);
    const line2 = new LineEntity(500, 50, 500, 200);
    const line3 = new LineEntity(300, 300, 300, 500);
    const line4 = new LineEntity(301, 350, 500, 350);
    const line5 = new LineEntity(300, 300, 500, 500);

    const line6 = new LineEntity(100, 100, 100, 500);
    const line7 = new LineEntity(50, 300, 400, 500);
    const line8 = new LineEntity(100, 500, 500, 400);
    const line9 = new LineEntity(400, 500, 550, 200);
    const line10 = new LineEntity(550, 200, 100, 100);

    circle.velocity.x = 20;
    circle2.velocity.x = 0;
    circle3.velocity.x = 600;
    // engine.entities.push(circle);
    // engine.entities.push(circle2);
    engine.entities.push(circle3);
    // engine.entities.push(rect);
    // engine.entities.push(rect2);
    // engine.entities.push(rect3);
    // engine.entities.push(rect4);
    // engine.entities.push(line);
    // engine.entities.push(line2);
    // engine.entities.push(line3);
    // engine.entities.push(line4);
    // engine.entities.push(line5);
    engine.entities.push(line6);
    engine.entities.push(line7);
    engine.entities.push(line8);
    engine.entities.push(line9);
    engine.entities.push(line10);

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
    // requestAnimationFrame(render);
    setTimeout(render, 1000 / 60);
  }
})();