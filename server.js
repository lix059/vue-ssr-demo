const fs = require('fs');
const path = require('path');
const express = require('express');
const server = express();
const resolve = file => path.resolve(__dirname, file);
const { createBundleRenderer } = require('vue-server-renderer');
const isProd = process.env.NODE_ENV === 'production';
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

let renderer, bundle, readyPromise

if(isProd) {
    server.use(express.static('dist'));

    bundle = fs.readFileSync(path.resolve(__dirname, 'dist/server.js'), 'utf-8');
    renderer = createBundleRenderer(bundle, {
        template: fs.readFileSync(path.resolve(__dirname, 'dist/index.template.html'), 'utf-8')
    });

    server.get('/index', (req, res) => {
        renderer.renderToString((err, html) => {
            if (err) {
                console.error(err);
                res.status(500).end('服务器内部错误');
                return;
            }
            res.end(html);
        })
    });
} else {
    const templatePath = resolve('./index.template.html')

    readyPromise = require('./setup-dev-server')(
        server,
        templatePath,
        (bundle, options) => {
          renderer = createRenderer(bundle, options)
        }
    )

    server.get('*',  (req, res) => {
      console.log('readyPromise');
      readyPromise.then(() => render(req, res))
    })
}


server.listen(8002, () => {
    console.log('后端渲染服务器启动，端口号为：8002');
});



function createRenderer (bundle, options) {
  return createBundleRenderer(bundle, Object.assign(options, {
    // this is only needed when vue-server-renderer is npm-linked
    basedir: resolve('./dist'),
    // recommended for performance
    runInNewContext: false
  }))
}

function render (req, res) {
  const s = Date.now()

  res.setHeader("Content-Type", "text/html")
  res.setHeader("Server", serverInfo)

  const handleError = err => {
    console.log(err)
    if (err.url) {
      res.redirect(err.url)
    } else if(err.code === 404) {
      res.status(404).send('404 | Page Not Found')
    } else {
      // Render Error Page or Redirect
      res.status(500).send('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err.stack)
    }
  }

  const context = {
    title: 'Vue server side render', // default title
    url: req.url
  }
  console.log('renderToString');
  renderer.renderToString(context, (err, html) => {
    if (err) {
      console.log(err)
      return handleError(err)
    }
    res.send(html)
    if (!isProd) {
      console.log(`whole request: ${Date.now() - s}ms`)
    }
  })
}