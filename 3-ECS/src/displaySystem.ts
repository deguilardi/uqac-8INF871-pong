import { IComponent } from "./components";
import * as GraphicsAPI from "./graphicsAPI";
import { Scene } from "./scene";
import { ISystem } from "./system";

// # Interface *IDisplayComponent*
// Déclare le type d'un composant géré par ce système.
export interface IDisplayComponent extends IComponent {
  // ### Méthode *display*
  // La méthode *display* de chaque composant est appelée une fois
  // par itération de la boucle de jeu.
  display(dT: number): void;
}

// # Fonction *isDisplayComponent*
// Vérifie si le composant est du type `IDisplayComponent``
// Voir [la documentation de TypeScript](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
function isDisplayComponent(arg: IComponent): arg is IDisplayComponent {
  return (arg as IDisplayComponent).display !== undefined;
}

// # Classe *DisplaySystem*
// Représente le système permettant de gérer l'affichage
export class DisplaySystem implements ISystem {
  // ## Constructeur
  // Initialise l'API graphique.
  constructor(canvasId: string) {
    GraphicsAPI.init(canvasId);
  }

  // Méthode *iterate*
  // Appelée à chaque tour de la boucle de jeu
  // Appelle ensuite la méthode de rendu de l'API.
  public iterate(dT: number) {
    for (const e of Scene.current.entities()) {
      for (const comp of e.components) {
        if (isDisplayComponent(comp)) {
          comp.display(dT);
        }
      }
    }

    return GraphicsAPI.renderFrame();
  }
}
