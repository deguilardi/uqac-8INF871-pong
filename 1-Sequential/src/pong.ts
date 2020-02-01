import { run } from "./main";
import { Resources } from "./resources";

export async function pong() {
  await Resources.init("../resources.json");
  run("canvas");
}
