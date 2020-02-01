import * as GraphicsAPI from "./graphicsAPI";
import * as InputAPI from "./inputAPI";
import { Resources } from "./resources";
import * as Utils from "./utils";

// # Interfaces générales

// ## Interface *IGraphic*
// Déclare une interface d'un objet supportant le rendu
// à l'écran.
interface IGraphic {
  display(): void;
}

// ## Interface *IInput*
// Déclare une interface d'un objet représentant une
// méthode d'entrée.
interface IInput {
  dY: number;
  updateInput(): void;
}

// # Classe *Background*
// Cette classe représente l'arrière-plan du terrain de jeu.
class Background implements IGraphic {
  public backgroundImage: HTMLImageElement;

  // ## Constructeur de la classe *Background*
  public constructor() {
    this.backgroundImage = Resources.load<HTMLImageElement>("img/background.png")!;
  }

  // ## Méthode *display*
  // Cette méthode affiche l'image d'arrière-plan au centre de
  // l'aire de jeu.
  public display() {
    GraphicsAPI.drawCenter(this.backgroundImage, Program.AreaWidth / 2, Program.AreaHeight / 2);
  }
}

// # Classe *Paddle*
// Cette classe représente la palette d'un joueur.
class Paddle implements IGraphic {
  // La position verticale `y` sera modifiée par les autres objets.
  public y: number = 0;
  public paddleImage: HTMLImageElement;

  // ## Constructeur de la classe *Paddle*
  public constructor(private x: number) {
    this.paddleImage = Resources.load<HTMLImageElement>("img/paddle.png")!;
  }

  // ## Méthode *display*
  // Cette méthode affiche la palette d'un joueur à l'endroit
  // désiré.
  public display() {
    GraphicsAPI.drawCenter(this.paddleImage, this.x, this.y);
  }
}

// # Classe *Ball*
// Cette classe représente la balle du jeu.
class Ball implements IGraphic {
  public ballImage: HTMLImageElement;
  public x: number = Program.CenterX;
  public y: number = Program.CenterY;
  public dirX: number = 1;
  public dirY: number = 1;

  // ## Constructeur de la classe *Ball*
  public constructor() {
    this.ballImage = Resources.load<HTMLImageElement>("img/ball.png")!;
  }

  // ## Méthode *update*
  // Cette méthode met à jour la position de la balle. Si la
  // position verticale dépasse l'aire de jeu, on inverse celle-ci.
  public update(dT: number) {
    this.x += this.dirX * Program.BallSpeed * dT;
    this.y += this.dirY * Program.BallSpeed * dT;

    if ((this.y < Program.PlayAreaMinY) ||
      (this.y > Program.PlayAreaMaxY)) {
      this.dirY *= -1;
    }
  }

  // ## Méthode *display*
  // Affiche la balle à sa position.
  public display() {
    GraphicsAPI.drawCenter(this.ballImage, this.x, this.y);
  }

  // ## Méthode *reset*
  // Réinitialise la position de la balle lorsqu'il y a un point.
  public reset() {
    this.x = Program.CenterX;
    this.y = Program.CenterY;
  }

  // ## Méthode *reverseX*
  // Inverse la direction horizontale de la balle, lorsqu'elle
  // touche la palette d'un joueur.
  public reverseX() {
    this.dirX *= -1;
  }
}

// ## Interface *INumberMap*
// Déclare un type pour un tableau associatif liant une
// clé à un type d'image.
interface INumberMap {
  [key: number]: HTMLImageElement;
}

// # Classe *Score*
// La classe *Score* gère le pointage d'un joueur, ainsi
// que sa représentation visuelle lors de l'affichage.
class Score implements IGraphic {
  public numberImages: INumberMap = {};
  public points: number = 0;

  // ## Constructeur de la classe *Score*
  // Le constructeur conserve la position horizontale du score.
  // Les images pour tous les chiffres sont stockés dans un tableau
  // associatif.
  constructor(private x: number) {
    for (let i = 0; i <= 9; ++i) {
      this.numberImages[i] = Resources.load<HTMLImageElement>(`img/${i}.png`)!;
    }
  }

  // ## Méthode *display*
  // Affiche le score du joueur en choisissant l'image appropriée,
  // indexée par le score du joueur dans le tableau associatif.
  public display() {
    GraphicsAPI.drawCenter(this.numberImages[this.points], this.x, Program.ScoreY);
  }

  // ## Méthode *increment*
  // Incrémente le score du joueur.
  public increment() {
    this.points++;
  }

  // ## Méthode *reset*
  // Remet le pointage du joueur à zéro.
  public reset() {
    this.points = 0;
  }
}

// # Classe *Joystick*
// La classe *Joystick* sert à contenir le déplacement
// désiré du joueur lors d'une itération de la boucle de jeu.
class Joystick implements IInput {
  public dY: number = 0;

  // ## Constructeur de la classe *Joystick*
  // Le constructeur conserve l'identifiant du joueur afin
  // de savoir de quel joystick il a possession.
  constructor(private id: 0 | 1) {
  }

  // ## Méthode *updateInput*
  // Cette méthode est appelée lors de la mise à jour des
  // entrées dans la boucle de jeu. On demande à l'API *input*
  // la valeur de l'axe vertical pour le joueur désiré.
  public updateInput() {
    this.dY = InputAPI.getAxisY(this.id);
  }
}

// # Classe *Player*
// Un joueur est représenté par la classe *Player*, qui contient
// des références vers les éléments dont il a possession,
// soient sa palette, son score et son joystick. Il s'agit
// d'une classe par composition.
class Player {
  // ## Constructeur de la classe *Player*
  // Le constructeur ne fait que conserver localement ses paramètres.
  constructor(private paddle: Paddle, private score: Score, private input: IInput) {
  }

  // ## Propriétés et fonctions *currentScore*, *incrementScore* et *resetScore*
  // Ces fonctions ont pour but d'éviter de coupler l'utilisation
  // de la classe *Player* avec celle de *Score*. Une classe externe
  // ne devrait jamais avoir besoin de connaître les détails
  // d'implémentation d'une classe pour l'utiliser.
  get currentScore() {
    return this.score.points;
  }

  public incrementScore() {
    this.score.increment();
  }

  public resetScore() {
    this.score.reset();
  }

  // ## Méthode *update*
  // La méthode de mise à jour de la classe *Player* met à jour
  // la position verticale de sa palette selon le déplacement
  // demandé par le joystick, en évitant de dépasser l'aire de jeu.
  public update(dT: number) {
    this.paddle.y += this.input.dY * dT * Program.PaddleSpeed;
    this.paddle.y = Utils.clamp(this.paddle.y, Program.PlayAreaMinY + Program.PaddleHeight / 2, Program.PlayAreaMaxY - Program.PaddleHeight / 2);
  }

  // ## Fonction *collides*
  // Cette fonction retourne la valeur *vrai* si la position
  // verticale de la balle est dans la zone de la palette du
  // joueur.
  public collides(ball: Ball) {
    return Utils.inRange(ball.y, this.paddle.y - Program.PaddleHeight / 2, this.paddle.y + Program.PaddleHeight / 2);
  }
}

// # Classe *Game*
// La classe *Game* représente le déroulement de la partie
// et contient ses acteurs directs, soient les joueurs et
// la balle. Il s'agit d'une classe par composition.
class Game {
  // ## Constructeur de la classe *Game*
  // Le constructeur ne fait que conserver localement ses paramètres.
  constructor(private ball: Ball, private player1: Player, private player2: Player) {
  }

  // ## Méthode *update*
  // Cette méthode est appelée par la boucle de jeu afin de
  // mettre à jour l'ensemble de la logique du jeu.
  public update(dT: number) {
    // On commence par demander la mise à jour des différents
    // intervenants.
    this.player1.update(dT);
    this.player2.update(dT);
    this.ball.update(dT);

    // On vérifie ensuite la logique faisant interagit les
    // joueurs et la balle. Si la balle est dans la zone
    // contrôlée par le joueur de gauche,
    if (this.ball.x < Program.PlayAreaMinX) {
      // on vérifie si la balle touche à la palette du joueur, dans
      // lequel cas on inverse la direction horizontale de la balle
      if (this.player1.collides(this.ball)) {
        this.ball.reverseX();
      } else {
        this.player2.incrementScore();
        this.ball.reset();
      }
    } else if (this.ball.x > Program.PlayAreaMaxX) {
      if (this.player2.collides(this.ball)) {
        this.ball.reverseX();
      } else {
        this.player1.incrementScore();
        this.ball.reset();
      }
    }

    // Si un joueur atteint le score maximal, on affiche un
    // message et on remet les scores à zéro.
    if ((this.player1.currentScore > Program.MaxScore) ||
      (this.player2.currentScore > Program.MaxScore)) {
      alert("Partie terminée");
      this.player1.resetScore();
      this.player2.resetScore();
    }
  }
}

// # Classe *Program*
// La classe *Program* instancie et configure les composants
// nécessaires au bon déroulement du jeu.
class Program {
  public static AreaWidth: number;
  public static AreaHeight: number;
  public static ScoreY = 64;
  public static ScoreP1X: number;
  public static ScoreP2X: number;
  public static BallSpeed = 500;
  public static PaddleSpeed = 500;
  public static PalP1X = 16;
  public static PalP2X: number;
  public static BallRadius = 16;
  public static PaddleHeight = 200;
  public static MaxScore = 9;

  public static CenterX: number;
  public static CenterY: number;

  public static PlayAreaMinX: number;
  public static PlayAreaMaxX: number;
  public static PlayAreaMinY: number;
  public static PlayAreaMaxY: number;

  public static game: Game;
  public static graphics: IGraphic[];
  public static inputs: IInput[];

  // ## Méthode statique *run*
  // Cette méthode instancie les différents systèmes nécessaires
  // et démarre l'exécution complète du jeu.
  public static run(canvasId: string) {
    Program.setupSystem(canvasId);
    Program.launchGame();
  }

  // ## Méthode statique *launchGame*
  // Cette méthode initialise les valeurs du jeu et lance
  // la boucle de jeu.
  public static launchGame() {
    Program.init();

    let lastTime: number | undefined;

    function iterate(time: number) {
      if (lastTime === undefined) {
        lastTime = time;
      }
      // Le temps est compté en millisecondes, on désire
      // l'avoir en secondes, sans avoir de valeurs trop énorme.
      const delta = Utils.clamp((time - lastTime) / 1000, 0, 0.1);
      lastTime = time;

      Program.updateInput();
      Program.updateLogic(delta);
      Program.updateOutput();
      window.requestAnimationFrame(iterate);
    }

    window.requestAnimationFrame(iterate);
  }

  // ## Fonction statique *init*
  // Cette fonction instancie les différents objets du jeu.
  // On enregistre ensuite les éléments graphiques, les éléments
  // d'entrée et le jeu dans des membres statiques afin de
  // pouvoir faire leur mise à jour.
  public static init() {
    const background = new Background();
    const ball = new Ball();
    const paddle1 = new Paddle(Program.PalP1X);
    const paddle2 = new Paddle(Program.PalP2X);
    const score1 = new Score(Program.ScoreP1X);
    const score2 = new Score(Program.ScoreP2X);
    const inp1 = new Joystick(0);
    const inp2 = new Joystick(1);
    const player1 = new Player(paddle1, score1, inp1);
    const player2 = new Player(paddle2, score2, inp2);
    Program.game = new Game(ball, player1, player2);
    Program.graphics = [background, paddle1, paddle2, ball, score1, score2];
    Program.inputs = [inp1, inp2];
  }

  // ## Méthode statique *updateInput*
  // Cette méthode de la boucle de jeu appelle
  // les méthodes de mises à jour aux composants d'entrées.
  public static updateInput() {
    for (const inp of Program.inputs) {
      inp.updateInput();
    }
  }

  // ## Méthode statique *updateLogic*
  // Cette méthode appelle la méthode de mise à jour de
  // l'instance de la classe *Game*.
  public static updateLogic(dT: number) {
    Program.game.update(dT);
  }

  // ## Méthode statique *updateOutput*
  // Cette méthode de la boucle de jeu affiche les éléments
  // à l'écran, en appelant les méthodes d'affichage des
  // différents composants de sortie.
  public static updateOutput() {
    for (const g of Program.graphics) {
      g.display();
    }
    GraphicsAPI.renderFrame();
  }

  // ## Méthode statique *setupSystem*
  // Cette méthode instancie les différents systèmes nécessaires
  // et configure les constantes du jeu.
  public static setupSystem(canvasId: string) {
    GraphicsAPI.init(canvasId);
    Program.setupConstants(GraphicsAPI.canvas);
  }

  // ## Constantes et méthode statique *setupConstants*
  // Ces valeurs représentent les constantes utilisées lors
  // de l'exécution du jeu et les variables de configuration.
  public static setupConstants(canvas: HTMLCanvasElement) {
    Program.AreaWidth = canvas.width;
    Program.AreaHeight = canvas.height;
    Program.ScoreP1X = Program.AreaWidth / 4;
    Program.ScoreP2X = Program.AreaWidth * 3 / 4;
    Program.PalP2X = Program.AreaWidth - 16;

    Program.CenterX = Program.AreaWidth / 2;
    Program.CenterY = Program.AreaHeight / 2;

    Program.PlayAreaMinX = Program.PalP1X + Program.BallRadius;
    Program.PlayAreaMaxX = Program.PalP2X - Program.BallRadius;
    Program.PlayAreaMinY = Program.ScoreY + Program.BallRadius;
    Program.PlayAreaMaxY = Program.AreaHeight - Program.BallRadius;
  }
}

export let run = Program.run;
