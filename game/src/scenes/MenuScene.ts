import { Application, Container, Sprite, Text, TextStyle, Graphics } from 'pixi.js';

export class MenuScene extends Container {
  private background!: Sprite;
  private logo!: Sprite;
  private title!: Text;
  private button!: Graphics;
  private buttonText!: Text;

  constructor(app: Application, onStart: () => void) {
    super();
    this.sortableChildren = true;
    this.createBackground();
    this.createLogo();
    this.createTitle();
    this.createStartButton(onStart);
    this.resize();
  }

  private createBackground() {
    this.background = Sprite.from('background');
    this.background.zIndex = 0;
    this.addChild(this.background);
  }

  private createLogo() {
    this.logo = Sprite.from('logo');
    this.logo.anchor.set(0.5);
    this.logo.zIndex = 1;
    this.addChild(this.logo);
  }

  private createTitle() {
    this.title = new Text('Animal Finder', new TextStyle({
      fontFamily: 'Hanalei Fill',
      fontSize: 56,
      fill: 0xEBBD72,
      stroke: 0x000000,
      align: 'center',
    }));
    this.title.anchor.set(0.5);
    this.title.zIndex = 2;
    this.addChild(this.title);
  }

  private createStartButton(onStart: () => void) {
    this.button = new Graphics();
    this.button.beginFill(0x65CC3F);
    this.button.drawRoundedRect(0, 0, 220, 70, 18);
    this.button.endFill();
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';
    this.button.zIndex = 2;
    this.button.on('pointerdown', onStart);
    this.addChild(this.button);

    this.buttonText = new Text('START', new TextStyle({
      fontFamily: 'Hanalei Fill',
      fontSize: 50,
      fill: 0xEBBD72,
      stroke: 0x000000,
      align: 'center',
    }));
    this.buttonText.anchor.set(0.5);
    this.buttonText.zIndex = 3;
    this.addChild(this.buttonText);
  }

  public resize() {
    // Get new window size
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Background
    this.background.width = w;
    this.background.height = h;

    // Logo (centered, 15% from top, width 22% of screen, height 12%)
    const logoW = w * 0.22;
    const logoH = h * 0.12;
    this.logo.x = w / 2;
    this.logo.y = h * 0.15 + logoH / 2;
    // Scale logo to fit box
    const scale = Math.min(logoW / this.logo.texture.width, logoH / this.logo.texture.height);
    this.logo.scale.set(scale*3);

    // Title (centered, below logo)
    this.title.x = w / 2;
    this.title.y = this.logo.y + logoH / 2 + h * 0.15;
    this.title.style.fontSize = Math.max(32, h * 0.07);

    // Button (centered, below title)
    const buttonW = w * 0.28;
    const buttonH = h * 0.09;
    this.button.clear();
    this.button.beginFill(0x65CC3F);
    this.button.drawRoundedRect(0, 0, buttonW, buttonH, Math.min(buttonW, buttonH) * 0.25);
    this.button.endFill();
    this.button.x = w / 2 - buttonW / 2;
    this.button.y = this.title.y + this.title.height + h * 0.2;
    this.buttonText.x = w / 2;
    this.buttonText.y = this.button.y + buttonH / 2;
    this.buttonText.style.fontSize = Math.max(20, buttonH * 0.55);
  }
} 