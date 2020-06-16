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

    engine = new Engine(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 10);
    const circle = new CircleEntity(100, 100, 10, 'dynamic');
    const circle2 = new CircleEntity(150, 500, 50, 'static');

    engine.entities.push(circle);
    engine.entities.push(circle2);

    render();
  }

  // 時間を進めてCanvasに再描画する
  function render() {
    // 時間を進める
    engine.step(0.2);

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
      }
    });

    requestAnimationFrame(render);
  }
})();