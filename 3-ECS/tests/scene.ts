import { expect } from "chai";
import "mocha";
import { Entity } from "../src/entity";
import { ISceneDesc, Scene } from "../src/scene";
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

// # Tests sur la classe *Scene*
describe("Scene", () => {
  // On va avoir besoin de créer des scènes de test pour
  // la plupart des tests, on crée donc une configuration qui sera
  // réutilisée.
  const sampleScene: ISceneDesc = {
    // tslint:disable: object-literal-sort-keys
    empty: {
      components: {},
      children: {},
    },
    complex: {
      components: {
        comp1: {
          hello: "world",
        },
        comp2: {
          foo: "bar",
        },
      },
      children: {
        first: {
          components: {},
          children: {},
        },
        second: {
          components: {},
          children: {},
        },
      },
    },
    crossRef1: {
      components: {
        refComp1: {
          target: "crossRef2",
        },
      },
      children: {},
    },
    crossRef2: {
      components: {
        refComp2: {
          target: "crossRef1",
        },
      },
      children: {},
    },
    // tslint:enable: object-literal-sort-keys
  };

  // Les noms des différents objets de la hiérarchie ci-dessus.
  // On s'en servira pour vérifier les itérations sur l'ensemble
  // des objets de la scène.
  const sampleSceneObjNames = [
    "empty",
    "complex",
    "first",
    "second",
    "crossRef1",
    "crossRef2",
  ];

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
  // l'objet créé est une instance de la classe de scène.
  it("le module peut être instancié", (done) => {
    const scene = Scene.create({});
    expect(scene).instanceof(Scene);
    done();
  });

  // Une instance de la classe Scene devrait avoir ces méthodes
  // et fonctions. Ce test vérifie qu'elles existent bel et bien,
  // sans vérifier leur fonctionnement.
  it("a les méthodes requises", (done) => {
    const scene = Scene.create({});
    expect(scene).respondTo("findObject");
    done();
  });

  // Ce test vérifie si il est possible de récupérer un objet
  // de la scène par la méthode `findObject`. On crée une scène
  // contenant quelques objets et on tente de les récupérer.
  it("peut chercher un objet de la scène par son nom", (done) => {
    const scene = Scene.create({
      // tslint:disable: object-literal-sort-keys
      premier: {
        components: {},
        children: {},
      },
      second: {
        components: {},
        children: {},
      },
      // tslint:enable: object-literal-sort-keys
    });

    const obj1 = scene.findObject("premier");
    expect(obj1).exist;
    expect(obj1).instanceof(Entity);
    const obj2 = scene.findObject("second");
    expect(obj2).exist;
    expect(obj2).instanceof(Entity);
    done();
  });

  // Ce test vérifie qu'il est possible de créer les objets
  // à partir d'une structure de description. On tente par la
  // suite de chercher chaque objet de la liste des objets
  // qui doivent exister.
  it("instancie les objets depuis une description", (done) => {
    const scene = Scene.create(sampleScene);
    for (const name of sampleSceneObjNames) {
      const obj = scene.findObject(name);
      expect(obj).exist;
      expect(obj).instanceof(Entity);
    }
    done();
  });

  // Certains composants doivent faire référence à d'autres. C'est
  // ce qui motive l'existence de la méthode `setup` de ceux-ci,
  // en plus du constructeur. Pour tester ça, on modifie la méthode
  // statique *onSetup* du composant de test afin qu'il tente
  // de récupérer des références vers d'autres objets. On s'attend
  // à ce que ces objets existent, même s'ils n'ont pas encore été
  // complètement configurés.
  it("gère correctement les références croisées", (done) => {
    const calls = new Map<string, TestComponent>();
    TestComponent.onSetup = (comp, descr) => {
      if (!(/^refComp/.test(comp.__type))) {
        return;
      }
      expect(calls).not.property(comp.__type);
      calls.set(comp.__type, comp);
      const refObj = Scene.current.findObject(descr.target);
      expect(refObj).exist;
      expect(refObj).instanceof(Entity);
    };

    const scene = Scene.create(sampleScene);
    for (let i = 1; i <= 2; ++i) {
      const compName = `refComp${i}`;
      const objName = `crossRef${i}`;
      expect(calls.has(compName)).true;
      const obj = scene.findObject(objName)!;
      const comp = obj.getComponent(compName);
      expect(calls.get(compName)).equals(comp);
    }
    done();
  });
});
