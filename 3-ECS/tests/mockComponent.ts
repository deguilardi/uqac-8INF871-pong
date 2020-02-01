import { IComponent } from "../src/components";
import { Entity } from "../src/entity";

// # Composant de test *TestComponent*
// On définit ici un *[mock object](https://fr.wikipedia.org/wiki/Mock_%28programmation_orient%C3%A9e_objet%29)*
// qui permet de tester les réactions de nos objets de scène
// avec les composants, sans avoir besoin d'avoir des composants
// réels.
export class TestComponent implements IComponent {
  // ## Pointeurs de méthodes statiques
  // Ces méthodes statiques n'ont aucun comportement par défaut
  // et, par la nature de JavaScript, pourront être remplacées
  // par des méthodes au besoin des tests.
  // Elles seront appelées lors des différentes actions sur les
  // composants de test afin d'en récupérer de l'information.

  // tslint:disable:no-empty
  public static onCreate: (comp: TestComponent) => void = () => { };
  public static onSetup: (comp: TestComponent, desc: any) => void = () => { };
  // tslint:enable:no-empty

  // ## Constructeur de la classe *TestComponent*
  // Le constructeur conserve le type demandé et une référence
  // vers l'objet qui l'a créé dans ses attributs. Il appelle
  // ensuite la méthode statique `onCreate` avec une référence
  // à lui-même
  constructor(public __type: string, public owner: any) {
    TestComponent.onCreate(this);
  }

  // ## Méthodes du composant
  // Chaque méthode du composant appelle la méthode statique
  // correspondant en passant une référence à lui-même,
  // en plus des paramètres au besoin.
  public setup(descr: any): void {
    TestComponent.onSetup(this, descr);
  }
}

function create(type: string, owner: any) {
  return new TestComponent(type, owner);
}

export function registerMock() {
  Entity.componentCreator = create;
}
