import { Application, Container, Assets, Text, TextStyle, Graphics, Sprite, Texture } from 'pixi.js';
import { Animal, AnimalType } from '../Animal';

export class PlayScene extends Container {
  // overlay
  private overlayContainer!: Container;
  private overlayTimeout!: ReturnType<typeof setTimeout>;

  private animals: Animal[] = [];
  private gameTimer!: Text;
  private timeRemaining: number = 15;
  private gameState: 'playing' | 'won' | 'lost' = 'playing';
  private background!: Graphics;
  private instructions!: Text;
  private resultText!: Text;

  constructor(
    private readonly app: Application,
    private readonly onStart: () => void
  ) {
    super();
    this.setupGame();
  }

  private async setupGame() {
    this.loadBackground();

    // Load and animal textures
    const textures = await this.loadAnimalTextures();
    
    // Create UI
    this.createUI();

    // Show overlay (then create animals and start game after delay)
    this.showWantedOverlay(textures.lion, () => {
      this.createAnimals(textures);
      this.app.ticker.add(this.gameLoop);
    });
  }

  private loadBackground() {
    const background = Sprite.from('background');
    background.width = window.innerWidth;
    background.height = window.innerHeight;
    this.addChild(background);
  }

  private async loadAnimalTextures() {
    const atlas = await Assets.load('/assets/sprites/animals.json');

    return {
      monkey: atlas.textures['monkey.png'],
      giraffe: atlas.textures['giraffe.png'],
      elephant: atlas.textures['elephant.png'],
      lion: atlas.textures['lion.png']
    };
  }

  private createAnimals(textures: any) {
    // Create 50 regular animals (mix of monkey, giraffe, elephant)
    const regularAnimals = [
      { type: AnimalType.MONKEY, count: 17 },
      { type: AnimalType.GIRAFFE, count: 17 },
      { type: AnimalType.ELEPHANT, count: 16 }
    ];

    regularAnimals.forEach(({ type, count }) => {
      for (let i = 0; i < count; i++) {
        const animal = new Animal(textures[type], type, false);
        this.animals.push(animal);
        this.addChild(animal);
      }
    });

    // Create 1 lion (wanted animal)
    const lion = new Animal(textures.lion, AnimalType.LION, true);
    this.animals.push(lion);
    this.addChild(lion);

    // Set up click handlers
    this.animals.forEach(animal => {
      animal.onClick(() => this.onAnimalClick(animal));
    });
  }

  private createUI() {
    // Timer text
    const timerStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xFFFFFF,
      stroke: 0x000000
    });

    this.gameTimer = new Text({
      text: `Time: ${this.timeRemaining}`,
      style: timerStyle
    });
    this.gameTimer.x = 20;
    this.gameTimer.y = 20;
    this.addChild(this.gameTimer);

    // Result text (hidden initially)
    const resultStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFFFF,
      stroke: 0x000000
    });

    this.resultText = new Text({
      text: '',
      style: resultStyle
    });
    this.resultText.x = window.innerWidth / 2 - this.resultText.width / 2;
    this.resultText.y = window.innerHeight / 2 - this.resultText.height / 2;
    this.resultText.visible = false;
    this.addChild(this.resultText);
  }

  private showWantedOverlay(texture: Texture, onComplete: () => void) {
    this.overlayContainer = new Container();
  
    // Dimmed background
    const dimmer = new Graphics();
    dimmer.beginFill(0x000000, 0.7);
    dimmer.drawRect(0, 0, window.innerWidth, window.innerHeight);
    dimmer.endFill();
    this.overlayContainer.addChild(dimmer);
  
    // Label text
    const label = new Text('FIND THIS ANIMAL', new TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFFFFFF,
      stroke: 0x000000,
    }));
    label.anchor.set(0.5);
    label.x = window.innerWidth / 2;
    label.y = window.innerHeight / 4;
    this.overlayContainer.addChild(label);
  
    // Wanted animal image
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = window.innerWidth / 2;
    sprite.y = window.innerHeight / 2;
  
    // Scale to fit around 150px
    const maxSize = 150;
    const scale = Math.min(maxSize / texture.width, maxSize / texture.height);
    sprite.scale.set(scale);
  
    this.overlayContainer.addChild(sprite);
  
    this.addChild(this.overlayContainer);
  
    // Remove overlay after 5 seconds
    this.overlayTimeout = setTimeout(() => {
      this.removeChild(this.overlayContainer);
      onComplete(); // Start game
    }, 3000);
  }
  
  private gameLoop = () => {
    if (this.gameState !== 'playing') return;

    // Update timer
    this.timeRemaining -= 1/60; // Convert to seconds
    this.gameTimer.text = `Time: ${Math.max(0, Math.ceil(this.timeRemaining))}`;

    // Check if time ran out
    if (this.timeRemaining <= 0) {
      this.endGame(false);
      return;
    }

    // Update all animals
    this.animals.forEach(animal => animal.update(1));
  }

  private onAnimalClick(animal: Animal) {
    if (this.gameState !== 'playing') return;

    if (animal.isWanted) {
      animal.tint = 0x65CC3F; // Flash green
      setTimeout(() => {
        animal.tint = 0xFFFFFF; // Reset to normal
      }, 500);
      this.endGame(true);
    } else {
      // Wrong animal clicked - maybe add some feedback
      animal.tint = 0xCC523F; // Flash red
      setTimeout(() => {
        animal.tint = 0xFFFFFF; // Reset to normal
      }, 200);
    }
  }

  private endGame(won: boolean) {
    this.gameState = won ? 'won' : 'lost';
    
    this.resultText.text = won ? 'YOU WIN! 🦁' : 'TIME\'S UP! You lose!';
    this.resultText.visible = true;
    this.resultText.x = window.innerWidth / 2 - this.resultText.width / 2;
    this.resultText.y = window.innerHeight / 2 - this.resultText.height / 2;

    // Stop the game loop
    this.app.ticker.remove(this.gameLoop);

    // Add restart functionality
    setTimeout(() => {
      this.restartGame();
    }, 3000);
  }

  private restartGame() {
    // Clear all animals
    this.animals.forEach(animal => {
      this.removeChild(animal);
      animal.destroy();
    });
    this.animals = [];

    // Reset game state
    this.timeRemaining = 15;
    this.gameState = 'playing';
    this.resultText.visible = false;

    // Reload textures and recreate animals
    this.loadAnimalTextures().then(textures => {
      this.showWantedOverlay(textures.lion, () => {
        this.createAnimals(textures);
        this.app.ticker.add(this.gameLoop);
      });
    });
  }

  public resize() {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    
    // Update background
    this.background.clear();
    this.background.beginFill(0x87CEEB);
    this.background.drawRect(0, 0, window.innerWidth, window.innerHeight);
    this.background.endFill();

    // Update UI positions
    if (this.instructions) {
      this.instructions.x = window.innerWidth / 2 - this.instructions.width / 2;
    }
    
    if (this.resultText && this.resultText.visible) {
      this.resultText.x = window.innerWidth / 2 - this.resultText.width / 2;
      this.resultText.y = window.innerHeight / 2 - this.resultText.height / 2;
    }
  }
}