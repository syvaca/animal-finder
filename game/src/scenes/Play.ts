import { Application, Container, Assets, Text, TextStyle, Graphics, Sprite } from 'pixi.js';
import { Animal, AnimalType } from '../Animal';

export class PlayScene extends Container {
  private animals: Animal[] = [];
  private gameTimer!: Text;
  private timeRemaining: number = 30;
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
    // Create background
    this.background = new Graphics();
    this.background.beginFill(0x87CEEB); // Sky blue
    this.background.drawRect(0, 0, window.innerWidth, window.innerHeight);
    this.background.endFill();
    this.addChild(this.background);

    // Load animal textures
    const textures = await this.loadAnimalTextures();
    
    // Create animals
    this.createAnimals(textures);
    
    // Create UI
    this.createUI();
    
    // Start game loop
    this.app.ticker.add(this.gameLoop);
  }

  private async loadAnimalTextures() {
    // For now, create colored rectangles as placeholders
    // TODO: Implement proper sprite sheet loading
    const createTexture = (color: number) => {
      const graphics = new Graphics();
      graphics.beginFill(color);
      graphics.drawRoundedRect(0, 0, 64, 64, 8);
      graphics.endFill();
      return this.app.renderer.generateTexture(graphics);
    };

    return {
      monkey: createTexture(0x8B4513), // Brown
      giraffe: createTexture(0xDAA520), // Goldenrod
      elephant: createTexture(0x696969), // Dim gray
      lion: createTexture(0xFFD700)     // Gold
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

    // Instructions
    const instructionStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      stroke: 0x000000
    });

    this.instructions = new Text({
      text: 'Find the LION among the animals!',
      style: instructionStyle
    });
    this.instructions.x = window.innerWidth / 2 - this.instructions.width / 2;
    this.instructions.y = 80;
    this.addChild(this.instructions);

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
      this.endGame(true);
    } else {
      // Wrong animal clicked - maybe add some feedback
      animal.tint = 0xFF0000; // Flash red
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
    this.timeRemaining = 30;
    this.gameState = 'playing';
    this.resultText.visible = false;

    // Reload textures and recreate animals
    this.loadAnimalTextures().then(textures => {
      this.createAnimals(textures);
    });

    // Restart game loop
    this.app.ticker.add(this.gameLoop);
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