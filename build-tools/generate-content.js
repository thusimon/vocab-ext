const fs = require('fs').promises;
const path = require('path');

(async () => {
  console.log(__dirname)
  // read all files
  const constantsScript = await fs.readFile(path.join(__dirname, '../common/constants.js'), 'utf8');
  const utilsScript = await fs.readFile(path.join(__dirname, '../common/utils.js'), 'utf8');
  const contentScript = await fs.readFile(path.join(__dirname, '../content/content.js'), 'utf8');
  let contentFinalScript = await fs.readFile(path.join(__dirname, 'content-final-template.js'), 'utf8');

  // combine as content-final.js
  contentFinalScript = contentFinalScript.replace('CONSTANTS_SCRIPT_TO_REPLACE', constantsScript)
    .replace('UTILS_SCRIPT_TO_REPLACE', utilsScript)
    .replace('CONTENT_SCRIPT_TO_REPLACE', contentScript);

  await fs.writeFile(path.join(__dirname, '../content/content-final.js'), contentFinalScript, 'utf8');
})()
