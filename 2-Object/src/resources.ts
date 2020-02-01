interface IResourceDesc {
  text?: string[];
  images?: string[];
}

// ## Fonction *loadAsync*
// Fonction qui charge un fichier de façon asynchrone,
// via une [promesse](http://bluebirdjs.com/docs/why-promises.html)
async function loadAsync(url: string) {
  return new Promise<XMLHttpRequest>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("error", reject);
    xhr.addEventListener("load", () => {
      resolve(xhr);
    });
    xhr.open("GET", url);
    xhr.send();
  });
}

// ## Fonction *loadJSON*
// Fonction qui charge un fichier JSON de façon asynchrone,
// via une [promesse](http://bluebirdjs.com/docs/why-promises.html)
async function loadJSON<T>(url: string) {
  return loadAsync(url)
    .then((xhr) => {
      return JSON.parse(xhr.responseText) as T;
    });
}

async function loadImageFile(url: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const imgDownload = new Image();
    imgDownload.onload = () => {
      resolve(imgDownload);
    };
    imgDownload.src = url;
  });
}

export class Resources {
  public static async init(url: string): Promise<void> {
    const relPath = url.substr(0, url.lastIndexOf("/"));
    const desc = await loadJSON<IResourceDesc>(url);
    await Resources.loadText(relPath, desc.text || []);
    await Resources.loadImages(relPath, desc.images || []);
  }

  public static load<T>(file: string): T | undefined {
    return Resources.resources.get(file) as T;
  }

  private static resources = new Map<string, unknown>();

  private static async loadText(relPath: string, files: string[]) {
    for (const file of files) {
      const xhr = await loadAsync(`${relPath}/${file}`);
      Resources.resources.set(file, xhr.responseText);
    }
  }

  private static async loadImages(relPath: string, files: string[]) {
    for (const file of files) {
      const image = await loadImageFile(`${relPath}/${file}`);
      Resources.resources.set(file, image);
    }
  }
}
