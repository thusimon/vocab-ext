const fsp = require('fs').promises;
const path = require('path');
const swc = require("@swc/core");

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

const buildMode = process.argv[2] || 'prod';

const jscOption = {
  target: 'es5',
  minify: {
    compress: {
      unused: true,
    }
  }
};

const devConfig = {
  target: 'browser',
  options: {
    minify: false,
    sourceMaps: true,
    jsc: jscOption
  }
};

const prodConfig = {
  target: 'browser',
  options: {
    minify: true,
    sourceMaps: false,
    jsc: jscOption
  }
};

const bundle = async mode => {
  const buildConfig = {
    entry: {
      'service-worker': './src/service-worker.ts',
      'content/content': './src/content/content.ts',
      'popover/main': './src/popover/main.ts',
      'pages/view-vocabulary/main': './src/pages/view-vocabulary/main.ts',
      'pages/statistics/main': './src/pages/statistics/main.ts',
      'pages/settings/main': './src/pages/settings/main.ts',
      'pages/new-tab/main': './src/pages/new-tab/main.ts'
    },
    ...(mode === 'prod' ? prodConfig : devConfig)
  };

  const result = await swc.bundle(buildConfig);

  console.log(`building in ${mode}`);
  Object.keys(result).forEach(file => {
    let code = result[file].code;
    if (mode != 'prod') {
      // append source map comment at the end
      //# sourceMappingURL=<file_path>.js.map
      const fileName = file.split('/').pop()
      code += `\n//# sourceMappingURL=${fileName}.js.map`;
      fsp.writeFile(`build/vocab-ext/${file}.js.map`, result[file].map);
      fsp.writeFile(`build/vocab-ext/${file}.js`, code);
    }
    fsp.writeFile(`build/vocab-ext/${file}.js`, code);
    console.log(`${file} done`);
  });
}

(async () => {
  const dir = __dirname;
  // delete existing files
  const buildPath = path.join(dir, '../build');
  const buildExtPath = path.join(buildPath, 'vocab-ext');
  const zipExtPath = path.join(buildPath, 'vocab-ext.zip');
  await fsp.rm(buildPath, { recursive: true });
  await fsp.mkdir(buildPath);

  // copy the existing non script files:
  await copyFiles(path.join(dir, '../src'), buildPath, ['.js', '.ts']);
  // copy the libraries
  await copyFiles(path.join(dir, '../src/common/lib'), path.join(buildPath, 'src/common'), []);
  await fsp.rename(path.join(buildPath, 'src'), buildExtPath);
  
  await bundle(buildMode);
})()
