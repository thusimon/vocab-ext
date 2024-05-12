const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const webpack = require('webpack');

const CHROME_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmY+yefR/8tJag8E50AWA38Oa6A3btZw+bYFZ1WAhHdEUzq5mUIE6bQktx1jaaQg/c9xxcgcbt/3H0Z2P8VTXcU3ZzrJVHpQqMuu9LOMhlPijwzQqEXA2iHlX2Acue5t2zvOk1Zadw5nmIBkmxh0IyLM4ZuixfbcB2Fg1zKiuEMpzqHSFo7LP4haDqjdMeA0py+f6W+T6Nuuts/Xpt9qCPthr9qkK+/Zn3qMnVARKZGD1hxS+z3aqjk0zywM54B688OZ4O2OsISVnYaTvZliexZw+W9R6qLwMV352A9Q1wTHjvB6Oq/ezT2P+Rxz++0+eejXYKlqlqLWkZvbp368FvQIDAQAB';

const buildArg = process.argv[2] || '-prod';
const keyArg = process.argv[3];

const itemExists = async (src) => {
  try {
    await fsp.stat(src);
    return true
  } catch (err) {
    return false;
  }
}

const parseArg = (arg) => {
  if (!arg) {
    return arg;
  }
  return arg.replace(/^-+/, '');
}

const appendManifestKey = async (keyMode, dest) => {
  if (keyMode != 'k') {
    return;
  }
  const manifestPath = path.resolve(dest, './manifest.json');
  const manifestExists = fs.existsSync(manifestPath);
  if (!manifestExists) {
    return;
  }
  const manifest = require(manifestPath);
  manifest.key = CHROME_PUBLIC_KEY;
  await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2)); 
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

const buildPath = path.join(__dirname, '../build');
const buildExtPath = path.join(buildPath, 'vocab-ext');

const webpackConfig = {
  entry: {
    'service-worker': './src/service-worker.ts',
    'content/content': './src/content/content.ts',
    'pages/popover/main': './src/pages/popover/main.ts',
    'pages/view-vocabulary/main': './src/pages/view-vocabulary/main.ts',
    'pages/statistics/main': './src/pages/statistics/main.ts',
    'pages/settings/main': './src/pages/settings/main.ts',
    'pages/new-tab/main': './src/pages/new-tab/main.ts',
    'pages/side-panel/main': './src/pages/side-panel/main.ts',
    'pages/release-notes/main': './src/pages/release-notes/main.ts'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '../build/vocab-ext/[name].js',
  },
};

const webpackDevConfig = Object.assign({}, webpackConfig, {
  mode: 'development',
  devtool: 'source-map',
});

const webpackProdConfig = Object.assign({}, webpackConfig, {
  mode: 'production',
  devtool: false,
});


const bundle = async mode => {
  const config = mode === 'prod' ? webpackProdConfig : webpackDevConfig;
  const compiler = webpack(config);
  return new Promise((resolve, rejects) => {
    compiler.run((err, stats) => {
      if (err) {
        console.log(err);
        rejects(err);
        return;
      }
      compiler.close((closeErr) => {
      });
      resolve(stats);
    });
  });
}

(async () => {
  const dir = __dirname;
  const startTime = new Date();
  const zipExtPath = path.join(buildPath, 'vocab-ext.zip');
  // delete entire build folder
  await fsp.rm(buildPath, { recursive: true });
  await fsp.mkdir(buildPath);

  // copy the existing non script files:
  await copyFiles(path.join(dir, '../src'), buildPath, ['.js', '.ts']);
  await appendManifestKey(parseArg(keyArg), path.join(buildPath, './src'));
  await fsp.rename(path.join(buildPath, 'src'), buildExtPath);
  
  await bundle(parseArg(buildArg));
  const endTime = new Date();
  console.log(`Done in ${(endTime.getTime() - startTime.getTime())/1000}s`);
})()
