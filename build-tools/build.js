const fsp = require('fs').promises;
const path = require('path');
const webpack = require('webpack');

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

const buildPath = path.join(__dirname, '../build');
const buildExtPath = path.join(buildPath, 'vocab-ext');

const webpackConfig = {
  entry: {
    'service-worker': './src/service-worker.ts',
    'content/content': './src/content/content.ts',
    'popover/main': './src/popover/main.ts',
    'pages/view-vocabulary/main': './src/pages/view-vocabulary/main.ts',
    'pages/statistics/main': './src/pages/statistics/main.ts',
    'pages/settings/main': './src/pages/settings/main.ts',
    'pages/new-tab/main': './src/pages/new-tab/main.ts',
    'pages/side-panel/main': './src/pages/side-panel/main.ts'
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
  
  compiler.run((err, stats) => {
    if (err) {
      console.log(err);
    }
    compiler.close((closeErr) => {
    });
  });
}

(async () => {
  const dir = __dirname;
  const zipExtPath = path.join(buildPath, 'vocab-ext.zip');
  // delete entire build folder
  await fsp.rm(buildPath, { recursive: true });
  await fsp.mkdir(buildPath);

  // copy the existing non script files:
  await copyFiles(path.join(dir, '../src'), buildPath, ['.js', '.ts']);
  await fsp.rename(path.join(buildPath, 'src'), buildExtPath);
  
  await bundle(buildMode);
})()
