import { Application, Assets } from 'pixi.js';
import { PlayScene }    from './scenes/Play';
import { SceneManager } from './scenes/SceneManager';
import { MenuScene } from './scenes/MenuScene';

async function bootstrap() {
  const container = document.getElementById('game-container');
  if (!container) {
    throw new Error('Game container element not found');
  }

  const app = new Application();
  await app.init({
    resizeTo: container,
    backgroundColor: 0x87CEEB,
    antialias: true,
    autoDensity: true,
  });

  container.appendChild(app.view);

  // Load assets
  await Assets.load([
    { alias: 'animals', src: '/assets/sprites/animals.json' },
    { alias: 'background', src: '/assets/sprites/background.png' },
    { alias: 'logo', src: '/assets/sprites/logo.png'}
  ]);

  const sceneManager = new SceneManager(app);

  function showMenu() {
    const menu = new MenuScene(app, showPlay);
    sceneManager.changeScene(menu);
  }

  function showPlay() {
    const play = new PlayScene(
      app,
      showMenu
    );
    sceneManager.changeScene(play);
  }

  showMenu();
}

bootstrap();
