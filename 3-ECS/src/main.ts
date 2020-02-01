import { DisplaySystem } from "./displaySystem";
import { LogicSystem } from "./logicSystem";
import { Resources } from "./resources";
import { ISceneDesc, Scene } from "./scene";
import { ISystem } from "./system";
import * as Utils from "./utils";

// ## Variable *systems*
// Représente la liste des systèmes utilisés par notre moteur
let systems: ISystem[];

// ## Méthode *run*
// Cette méthode initialise les différents systèmes nécessaires
// et démarre l'exécution complète du jeu.
export function run(canvasId: string) {
  setupSystem(canvasId);
  return launchGame();
}

// ## Méthode *launchGame*
// Cette méthode initialise la scène du jeu et lance la
// boucle de jeu.
function launchGame() {
  const content = Resources.load<string>("3-ECS/scenes/scene.json")!;
  const sceneDescription = JSON.parse(content) as ISceneDesc;
  Scene.create(sceneDescription);

  let lastTime: number | undefined;

  function iterate(time: number) {
    if (lastTime === undefined) {
      lastTime = time;
    }
    // Le temps est compté en millisecondes, on désire
    // l'avoir en secondes, sans avoir de valeurs trop énorme.
    const delta = Utils.clamp((time - lastTime) / 1000, 0, 0.1);
    lastTime = time;

    for (const s of systems) {
      s.iterate(delta);
    }

    window.requestAnimationFrame(iterate);
  }

  window.requestAnimationFrame(iterate);
}

// ## Méthode *setupSystem*
// Cette méthode initialise les différents systèmes nécessaires.
function setupSystem(canvasId: string) {
  const display = new DisplaySystem(canvasId);
  const logic = new LogicSystem();

  systems = [display, logic];
}
