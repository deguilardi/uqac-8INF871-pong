import { expect } from "chai";
import "mocha";
import { IComponent } from "../src/components";
import { Entity } from "../src/entity";
import { registerMock, TestComponent } from "./mockComponent";

// tslint:disable: no-unused-expression

// # Classe de test
// Cette classe de test est utilisée avec [Mocha](https://mochajs.org/),
// une infrastructure permettant d'effectuer des tests unitaires.
//
// Les tests sont réalisés conjointement avec le module [Chai](http://chaijs.com/)
// qui fournit des fonctions simplifiant les assertions avec
// les tests. On utilise ici les fonctions [expect](http://chaijs.com/api/bdd/)
// de Chai, par choix.

// # Tests sur la classe *Entity*
describe("Entity", () => {
  // ## *beforeEach*
  // Cette méthode est exécutée par Mocha avant chaque test.
  // On l'utilise pour nettoyer les méthodes statique témoin
  // de la classe de composant de test et pour enregistrer
  // notre module permettant de créer ces composants de test.
  beforeEach(() => {
    registerMock();
    // tslint:disable:no-empty
    TestComponent.onCreate = ( /*comp*/) => { };
    TestComponent.onSetup = ( /*comp, descr*/) => { };
    // tslint:enable:no-empty
  });

  // ## Tests unitaires
  //
  // On vérifie ici si on peut créer un objet simple, et si
  // l'objet créé est une instance de la classe d'objet.
  it("le module peut être instancié", (done) => {
    const sceneObj = new Entity();
    expect(sceneObj).instanceof(Entity);
    done();
  });

  // Une instance de la classe Entity devrait avoir
  // ces méthodes et fonctions. Ce test vérifie qu'elles
  // existent bel et bien, sans vérifier leur fonctionnement.
  it("a les méthodes requises", (done) => {
    const sceneObj = new Entity();
    expect(sceneObj).respondTo("addComponent");
    expect(sceneObj).respondTo("getComponent");
    expect(sceneObj).respondTo("addChild");
    expect(sceneObj).respondTo("getChild");
    done();
  });

  // Ce test vérifie si on peut ajouter un composant à
  // l'objet, par la méthode `addComponent`. Cette méthode
  // devrait instancier un nouveau composant de test, et on
  // conclut donc le test dans la méthode statique appelée
  // par le constructeur.
  it("peut ajouter un composant", (done) => {
    const sceneObj = new Entity();

    TestComponent.onCreate = (comp) => {
      expect(comp.__type).equals("TestComp");
      expect(comp.owner).equals(sceneObj);
      done();
    };

    sceneObj.addComponent("TestComp", {});
  });

  // Ce test vérifie si on peut chercher un composant existant
  // à l'aide de la méthode `getComponent`. On ajoute deux
  // composants distincts à un objet, et on tente de les récupérer.
  it("peut chercher un composant", (done) => {
    const sceneObj = new Entity();
    const testComp = new Map<string, IComponent>();
    TestComponent.onCreate = (comp) => {
      testComp.set(comp.__type, comp);
    };

    sceneObj.addComponent("TestComp", {});
    sceneObj.addComponent("TestOtherComp", {});
    let value = sceneObj.getComponent("TestComp");
    expect(value).instanceof(TestComponent);
    expect(value).equals(testComp.get("TestComp"));
    value = sceneObj.getComponent("TestOtherComp");
    expect(value).instanceof(TestComponent);
    expect(value).equals(testComp.get("TestOtherComp"));
    done();
  });

  // On crée ici deux objets simples faisant office d'enfants
  // et on les ajoute à un objet par la méthode `addChild`.
  // On teste également la méthode `getChild` en vérifiant
  // si les objets récupérés sont ceux qui ont été ajoutés.
  it("peut ajouter et chercher des enfants", (done) => {
    const sceneObj = new Entity();
    const child1 = {
      hello: "world",
    };
    const child2 = {
      foo: "bar",
    };
    sceneObj.addChild("un",  child1 as any);
    sceneObj.addChild("deux",  child2 as any);
    let value = sceneObj.getChild("un");
    expect(value).equals(child1);
    value = sceneObj.getChild("deux");
    expect(value).equals(child2);
    done();
  });
});
