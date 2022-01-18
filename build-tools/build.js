const fsp = require('fs').promises;
const path = require('path');

const itemExists = async (src) => {
  try {
    await fsp.stat(src);
    return true
  } catch (err) {
    return false;
  }
}

const copyFiles = async (src, dest, excludes = []) => {
  const stats = await fsp.stat(src)
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    const srcFolder = src.split(path.sep).pop();
    const destFolder = path.join(dest, srcFolder);
    if (!await itemExists(destFolder)) {
      await fsp.mkdir(destFolder);
    }
    const srcChildren = await fsp.readdir(src);
    return Promise.all(srcChildren.map(child => copyFiles(path.join(src, child), destFolder, excludes)));
  } else {
    const fileExcluded = excludes.filter(exclude => src.endsWith(exclude)).length > 0;
    if (fileExcluded) {
      return;
    }
    const srcFile = path.basename(src);
    const destFile = path.join(dest, srcFile);
    await fsp.copyFile(src, destFile);
    return Promise.resolve();
  }
};

(async () => {
  const dir = __dirname;
  // delete existing files
  const buildPath = path.join(dir, '../build');
  const buildExtPath = path.join(buildPath, 'vocab-ext');
  const zipExtPath = path.join(buildPath, 'vocab-ext.zip');
  await fsp.rm(buildPath, { recursive: true });
  await fsp.mkdir(buildPath);

  // copy the existing files:
  await copyFiles(path.join(dir, '../src'), buildPath, [`content${path.sep}content.js`]);
  await fsp.rename(path.join(buildPath, 'src'), buildExtPath);

  // read all files
  const constantsScript = await fsp.readFile(path.join(dir, '../src/common/constants.js'), 'utf8');
  const utilsScript = await fsp.readFile(path.join(dir, '../src/common/utils.js'), 'utf8');
  const contentScript = await fsp.readFile(path.join(dir, '../src/content/content.js'), 'utf8');
  let contentFinalScript = await fsp.readFile(path.join(dir, 'content-template.js'), 'utf8');

  // combine as content.js
  contentFinalScript = contentFinalScript.replace('CONSTANTS_SCRIPT_TO_REPLACE', constantsScript)
    .replace('UTILS_SCRIPT_TO_REPLACE', utilsScript)
    .replace('CONTENT_SCRIPT_TO_REPLACE', contentScript);

  await fsp.writeFile(path.join(buildExtPath, '/content/content.js'), contentFinalScript, 'utf8');

  // replace the API token
  const env = await fsp.readFile(path.join(dir, '.env'), 'utf8');
  const API_KEY = env.match(/^API-KEY-TO-REPLACE:(\S+)/)[1];
  const translateAPIScriptPath = path.join(buildExtPath, 'background/translate-api.js');
  let translateAPIScript = await fsp.readFile(translateAPIScriptPath, 'utf8');
  translateAPIScript = translateAPIScript.replace('API-KEY-TO-REPLACE', API_KEY);
  await fsp.writeFile(translateAPIScriptPath, translateAPIScript, 'utf8');

})()
