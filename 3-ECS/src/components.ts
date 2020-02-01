import { IDisplayComponent } from "./displaySystem";
import { IEntity } from "./entity";
import * as GraphicsAPI from "./graphicsAPI";
import * as InputAPI from "./inputAPI";
import { ILogicComponent } from "./logicSystem";
import { Resources } from "./resources";
import { Scene } from "./scene";

// # Classes de support

// ## Interface *IComponent*
// Représente un composant minimal.
export interface IComponent {
  // ### Variable *__type*
  // Cette variable conserve le nom du type, pour faire
  // certaines vérifications à l'exécution, puisqu'on n'est
  // pas dans un langage fortement typé.
  __type: string;

  // ### Méthode *setup*
  // Cette méthode est appelée pour configurer le composant après
  // que tous les composants d'un objet aient été créés.
  setup(desc: any): void;
}

// ## Classe *Vector2*
// Classe pour représenter des vecteurs à deux dimensions.
interface IVector2Desc {
  x: number;
  y: number;
}

class Vector2 {
  public x: number;
  public y: number;

  // ### Constructeur de la classe *Vector2*
  // Le constructeur de la classe de vecteur prend en
  // paramètre un objet comprenant les propriétés `x` et `y`.
  constructor(descr: IVector2Desc) {
    this.x = descr.x;
    this.y = descr.y;
  }

  // ### Fonction *clone*
  // Les objets JavaScript étant passés par référence, cette
  // fonction permet de créer rapidement une copie de cette
  // structure afin d'y effectuer des opérations sans modifier
  // l'original.
  public clone() {
    return new Vector2({
      x: this.x,
      y: this.y,
    });
  }

  // ### Fonction *add*
  // Cette fonction retourne un nouveau vecteur qui représente
  // la somme de ce vecteur et de celui passé en paramètre.
  public add(other: Vector2) {
    return new Vector2({
      x: this.x + other.x,
      y: this.y + other.y,
    });
  }

  // ### Fonciton *scale*
  // Cette fonction retourne un nouveau vecteur qui représente
  // le produit de ce vecteur par une valeur scalaire.
  public scale(factor: number) {
    return new Vector2({
      x: this.x * factor,
      y: this.y * factor,
    });
  }
}

// ## Classe *Rectangle*
// Classe pour représenter un rectangle.
interface IRectangleDesc {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface IRectangleDescAlt {
  x: number;
  y: number;
  width: number;
  height: number;
}

class Rectangle {
  public xMin: number;
  public xMax: number;
  public yMin: number;
  public yMax: number;

  // ### Constructeur de la classe *Rectangle*
  // Le constructeur de cette classe prend en paramètre un
  // objet pouvant définir soit le centre et la taille du
  // rectangle (`x`, `y`, `width` et `height`) ou les côtés
  // de celui-ci (`xMin`, `xMax`, `yMin` et `yMax`).
  constructor(descr: IRectangleDesc) {
    const descrAlt = descr as IRectangleDescAlt;
    this.xMin = descr.xMin || (descrAlt.x - descrAlt.width / 2);
    this.xMax = descr.xMax || (descrAlt.x + descrAlt.width / 2);
    this.yMin = descr.yMin || (descrAlt.y - descrAlt.height / 2);
    this.yMax = descr.yMax || (descrAlt.y + descrAlt.height / 2);
  }

  // ### Fonction *intersectsWith*
  // Cette fonction retourne *vrai* si ce rectangle et celui
  // passé en paramètre se superposent.
  public intersectsWith(other: Rectangle) {
    return !(
      (this.xMin >= other.xMax) ||
      (this.xMax <= other.xMin) ||
      (this.yMin >= other.yMax) ||
      (this.yMax <= other.yMin)
    );
  }
}

// # Classes de composants
//
// ## Classe *Component*
// Cette classe est une classe de base pour l'ensemble des
// composants et implémente les méthodes par défaut.
class Component<TDesc> implements IComponent {
  public __type!: string;

  // ### Constructeur de la classe *Composant*
  // Le constructeur de cette classe prend en paramètre l'objet
  // propriétaire du composant, et l'assigne au membre `owner`.
  constructor(protected owner: IEntity) {
  }

  // ### Méthode *setup*
  // Cette méthode est appelée pour configurer le composant après
  // que tous les composants d'un objet aient été créés.

  // tslint:disable-next-line:no-empty
  public setup(descr: TDesc): void {
  }
}

// ## Classe *PositionComponent*
// Ce composant fournit un concept de position à l'objet.
class PositionComponent extends Component<IVector2Desc> {
  public position!: Vector2;
  private originalPosition!: Vector2;

  // ### Méthode *setup*
  // Les propriétés `x` et `y` de la description de ce composant
  // initialisent la propriété `position` de cet objet, ainsi
  // qu'une copie de ce vecteur dans la propriété `originalPosition`.
  public setup(descr: IVector2Desc) {
    this.position = new Vector2(descr);
    this.originalPosition = this.position.clone();
  }

  // ### Méthode *reset*
  // Un appel à cette méthode réinitialise la propriété `position`
  // à sa valeur originale.
  public reset() {
    this.position = this.originalPosition.clone();
  }
}

// ## Classe *TextureComponent*
// Ce composant permet d'afficher une image centrée selon la
// position d'un composant *PositionComponent* sur le même objet.
interface ITextureComponentDesc {
  name?: string;
}

class TextureComponent extends Component<ITextureComponentDesc> implements IDisplayComponent {
  public image!: HTMLImageElement;

  // ### Méthode *setup*
  // Cette méthode charge une image dont le nom est désigné par
  // la propriété `name` de la description. Cette propriété peut
  // être omise, auquel cas il n'y aura tout simplement pas d'image
  // de chargée.
  public setup(descr: ITextureComponentDesc) {
    if (descr.name) {
      this.image = Resources.load<HTMLImageElement>(`img/${descr.name}.png`)!;
    }
  }

  // ### Méthode *display*
  // Si il y a une image chargée pour ce composant, on l'affiche
  // à la position du composant *PositionComponent* de l'objet.
  public display() {
    const position = this.owner.getComponent<PositionComponent>("Position").position;
    if (this.image) {
      GraphicsAPI.drawCenter(this.image, position.x, position.y);
    }
  }
}

// ## Classe *MotionComponent*
// Cette classe représente le déplacement d'un objet dans un
// rectangle, selon une vélocité donnée allant en accélérant.
interface IMotionComponentDesc {
  dx: number;
  dy: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

class MotionComponent extends Component<IMotionComponentDesc> implements ILogicComponent {
  public velocity!: Vector2;
  public minX!: number;
  public maxX!: number;
  public minY!: number;
  public maxY!: number;
  private originalVelocity!: Vector2;

  // ### Méthode *setup*
  // Les propriétés `dx` et `dy` de la description de ce composant
  // initialisent la propriété `velocity` de cet objet, ainsi
  // qu'une copie de ce vecteur dans la propriété `originalVelocity`.
  // Les propriétés `minX`, `maxX`, `minY` et `maxY` de la
  // description sont conservées afin de limiter les déplacements.
  public setup(descr: IMotionComponentDesc) {
    this.velocity = new Vector2({
      x: descr.dx,
      y: descr.dy,
    });
    this.originalVelocity = this.velocity.clone();
    this.minX = descr.minX;
    this.maxX = descr.maxX;
    this.minY = descr.minY;
    this.maxY = descr.maxY;
  }

  // ### Méthode *update*
  // La valeur de la propriété `position` du composant *PositionComponent*
  // de l'objet associé est incrémentée par la vélocité de ce composant.
  // Si la nouvelle position dépasse les bornes désirées, on inverse
  // alors le déplacement dans l'axe de cette borne. On considère
  // également une légère accélération à la vélocité horizontale
  // pour des raisons de jouabilité.
  public update(dT: number) {
    const positionComponent = this.owner.getComponent<PositionComponent>("Position");
    const newPosition = positionComponent.position.add(this.velocity.scale(dT));
    positionComponent.position = newPosition;

    if ((newPosition.y < this.minY) || (newPosition.y > this.maxY)) {
      this.velocity.y *= -1;
    }
    if ((newPosition.x < this.minX) || (newPosition.x > this.maxX)) {
      this.velocity.x *= -1.05;
    }
  }

  // ### Méthode *reset*
  // Un appel à cette méthode réinitialise la propriété `velocity`
  // à sa valeur originale.
  public reset() {
    this.velocity = this.originalVelocity.clone();
  }
}

// ## Classe *ColliderComponent*
// Le composant *ColliderComponent* permet d'évaluer les collisions
// entre l'objet associé et une liste d'objets à vérifier.
interface IColliderComponentDesc {
  width: number;
  height: number;
  obstacles: string[];
}

class ColliderComponent extends Component<IColliderComponentDesc> implements ILogicComponent {
  public width!: number;
  public height!: number;
  public collision!: IEntity | null;
  public inZone!: IEntity | null;
  private obstacles!: IEntity[];

  // ### Propriété *area*
  // Cette fonction retourne le rectangle de collision de l'objet
  // en utilisant le composant *PositionComponent* associé.
  get area() {
    const position = this.owner.getComponent<PositionComponent>("Position").position;
    return new Rectangle({
      x: position.x,
      y: position.y,
      // tslint:disable-next-line:object-literal-sort-keys
      width: this.width,
      height: this.height,
    });
  }

  // ### Propriété *zone*
  // Cette fonction retourne un rectangle de collision de hauteur
  // infini pour usage interne.
  get zone() {
    const area = this.area;
    area.yMin = Number.NEGATIVE_INFINITY;
    area.yMax = Number.POSITIVE_INFINITY;
    return area;
  }

  // ### Méthode *setup*
  // Les propriétés `width` et `height` de l'objet de description
  // représentent les dimensions du rectangle de collision de
  // l'objet, alors que le tableau `obstacles` comprend les noms
  // des objets à évaluer pour tester les collisions. Les objets
  // sont résolus à partir de leur nom et conservés dans le membre
  // local `obstacles`.
  public setup(descr: IColliderComponentDesc) {
    this.width = descr.width;
    this.height = descr.height;
    this.obstacles = [];
    for (const name of descr.obstacles) {
      this.obstacles.push(Scene.current.findObject(name)!);
    }
  }

  // ### Méthode *update*
  // Chaque objet à vérifier pour collision est testé et, si leurs
  // rectangles de collision se superposent, est assigné à la
  // propriété `collision`. On fait de même pour vérifier si les
  // objets sont dans la même zone horizontale, qui est alors
  // associé à la propriété `inZone`. On ne considère ici qu'un
  // seul objet en collision à la fois.
  public update() {
    this.collision = null;
    this.inZone = null;
    const area = this.area;

    for (const obj of this.obstacles) {
      const otherCollider = obj.getComponent<ColliderComponent>("Collider");
      if (area.intersectsWith(otherCollider.area)) {
        this.collision = obj;
      }
      if (area.intersectsWith(otherCollider.zone)) {
        this.inZone = obj;
      }
    }
  }
}

// ## Classe *JoystickComponent*
// Cette classe permet de déplacer le joueur selon l'entrée
// de ce dernier.
interface IJoystickComponentDesc {
  id: 0 | 1;
  speed: number;
}

class JoystickComponent extends Component<IJoystickComponentDesc> implements ILogicComponent {
  public id!: 0 | 1;
  public speed!: number;

  // ### Méthode *setup*
  // La description comprend un identifiant `id` pour le joueur,
  // qui correspond au joystick désiré, et un multiplicateur
  // `speed` qui représente l'envergure du déplacement.
  public setup(descr: IJoystickComponentDesc) {
    this.id = descr.id;
    this.speed = descr.speed;
  }

  // ### Méthode *update*
  // On va chercher le déplacement désiré depuis le système
  // d'entrées, et on ajoute ce déplacement à la position de
  // l'objet par le composant *PositionComponent*
  public update() {
    const dy = InputAPI.getAxisY(this.id);
    const position = this.owner.getComponent<PositionComponent>("Position").position;
    position.y += dy * this.speed;
  }
}

// ## Classe *TextureAtlasComponent*
// Cette classe permet de conserver un répertoire d'images,
// pouvant être choisi par leur nom.
interface ITextureAtlasComponentDesc {
  [key: string]: string;
}

interface ITextureAtlas {
  [key: string]: HTMLImageElement;
}

class TextureAtlasComponent extends Component<ITextureAtlasComponentDesc> {
  public atlas!: ITextureAtlas;

  // ### Méthode *setup*
  // Cette méthode crée un tableau associatif `atlas` qui fait
  // la correspondance entre des noms et des images, tirées
  // des propriétés de la description.
  public setup(descr: ITextureAtlasComponentDesc) {
    this.atlas = {};

    for (const key in descr) {
      if (descr.hasOwnProperty(key)) {
        const element = descr[key];
        this.atlas[key] = Resources.load<HTMLImageElement>(`img/${element}.png`)!;
      }
    }
  }
}

// ## Classe *ScoreComponent*
// Cette classe contient le pointage d'un joueur et met à
// jour la texture du composant *TextureComponent* lorsque
// le score change.
interface IScoreComponentDesc {
  points: number;
}

class ScoreComponent extends Component<IScoreComponentDesc> implements ILogicComponent {
  public points!: number;

  // ### Méthode *setup*
  // Initialise le pointage du joueur selon la propriété `points`
  // de la description.
  public setup(descr: IScoreComponentDesc) {
    this.points = descr.points;
  }

  // ### Méthode *update*
  // Mets à jour la texture du composant *TextureComponent* avec
  // l'image correspondant au score du joueur, tiré de l'atlas
  // du composant *TextureAtlasComponent*.
  public update() {
    const textureComponent = this.owner.getComponent<TextureComponent>("Texture");
    const atlas = this.owner.getComponent<TextureAtlasComponent>("TextureAtlas").atlas;
    textureComponent.image = atlas[this.points];
  }
}

// ## Classe *RefereeComponent*
// Ce composant vérifie le résultat des collisions entre la
// balle et les joueurs et accorde les points appropriés.
interface IRefereeComponentDesc {
  players: string[];
  ball: string;
}

class RefereeComponent extends Component<IRefereeComponentDesc> implements ILogicComponent {
  public players!: IEntity[];
  public ball!: IEntity;

  // ### Méthode *setup*
  // La méthode *setup* conserve les références vers les joueurs
  // et la balle.
  public setup(descr: IRefereeComponentDesc) {
    this.players = [];
    for (const name of descr.players) {
      this.players.push(Scene.current.findObject(name)!);
    }
    this.ball = Scene.current.findObject(descr.ball)!;
  }

  // ### Méthode *update*
  public update() {
    // On commence par aller chercher les objets avec lesquel il
    // y a possibilité de collision.
    const ballCollider = this.ball.getComponent<ColliderComponent>("Collider");
    const ballCollision = ballCollider.collision;
    const ballInZone = ballCollider.inZone;

    // Si il y a collision, ça veut dire que le joueur n'a pas
    // raté son coup. Si on n'est pas dans une zone de collision,
    // ça veut dire que la balle n'est pas rendu proche d'une palette.
    // Dans ces deux cas, il n'y a pas eu point. On quitte donc
    // la méthode.
    if (ballCollision || !ballInZone) {
      return;
    }

    // On vérifie pour chaque joueur lequel a raté la balle.
    for (const player of this.players) {
      // Si ce joueur n'est pas dans la zone de la balle, ça veut
      // dire qu'il marque un point (ie.: c'est son adversaire qui
      // a raté)
      if (player !== ballInZone) {
        const scoreObject = player.getChild("score");
        const scoreComp = scoreObject!.getComponent<ScoreComponent>("Score");
        scoreComp.points++;

        // On termine au 10e point en affichant un message et en
        // réinitialisant les scores.
        if (scoreComp.points > 9) {
          alert("Partie terminée");
          for (const p of this.players) {
            p.getChild("score")!.getComponent<ScoreComponent>("Score").points = 0;
          }
        }
      }

      // Quand il y a point, on remet la balle en jeu à sa position
      // et vélocité initiale.
      this.ball.getComponent<PositionComponent>("Position").reset();
      this.ball.getComponent<MotionComponent>("Motion").reset();
    }
  }
}

// # Classe *ComponentFactory*
// Cette classe est le point d'entrée pour créer les composants.
interface IComponentCreators {
  [type: string]: new (owner: IEntity) => IComponent;
}

export class ComponentFactory {
  // ## Attribut statique *componentCreators*
  // Ce tableau associatif fait le lien entre les noms des composants
  // tels qu'utilisés dans le fichier JSON et les classes de
  // composants correspondants.
  public static componentCreators: IComponentCreators = {
    Collider: ColliderComponent,
    Joystick: JoystickComponent,
    Motion: MotionComponent,
    Position: PositionComponent,
    Referee: RefereeComponent,
    Score: ScoreComponent,
    Texture: TextureComponent,
    TextureAtlas: TextureAtlasComponent,
  };

  // ## Fonction statique *create*
  // Cette fonction instancie un nouveau composant choisi dans
  // le tableau `componentCreators` depuis son nom.
  public static create(type: string, owner: IEntity) {
    const comp = new ComponentFactory.componentCreators[type](owner);
    comp.__type = type;
    return comp;
  }
}
