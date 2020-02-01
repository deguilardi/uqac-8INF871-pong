import { IComponent } from "./components";
import { Scene } from "./scene";
import { ISystem } from "./system";

// # Interface *ILogicComponent*
// Déclare le type d'un composant géré par ce système.
export interface ILogicComponent extends IComponent {
  // ### Méthode *update*
  // La méthode *update* de chaque composant est appelée une fois
  // par itération de la boucle de jeu.
  update(dT: number): void;
}

// # Fonction *isLogicComponent*
// Vérifie si le composant est du type `ILogicComponent``
// Voir [la documentation de TypeScript](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
function isLogicComponent(arg: IComponent): arg is ILogicComponent {
  return (arg as ILogicComponent).update !== undefined;
}

// # Classe *LogicSystem*
// Représente le système permettant de mettre à jour la logique
export class LogicSystem implements ISystem {
  // Méthode *iterate*
  // Appelée à chaque tour de la boucle de jeu
  public iterate(dT: number) {
    for (const e of Scene.current.entities()) {
      for (const comp of e.components) {
        if (isLogicComponent(comp)) {
          comp.update(dT);
        }
      }
    }
  }
}
