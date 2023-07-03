'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const PrerenderSPAPlugin = require('@dreysolano/prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer

const env = require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`, 
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),

    // copy seo files
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../sitemap.xml'),
        to: path.resolve(__dirname, '../dist'),
        ignore: ['.*']
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../robots.txt'),
        to: path.resolve(__dirname, '../dist'),
        ignore: ['.*']
      }
    ]),

    new PrerenderSPAPlugin({
      staticDir: path.resolve(__dirname, '../dist'), // The path to the folder where index.html is.
      routes: ['/', '/options', '/about', '/botw', '/totk', '/totk-shrines', '/botw-shrines', '/totk-shrines/anedamimik', '/totk-shrines/apogek', '/totk-shrines/bamitok', '/totk-shrines/chichim', '/totk-shrines/domizuin', '/totk-shrines/ekochiu', '/totk-shrines/en-oma', '/totk-shrines/eshos', '/totk-shrines/eutoum', '/totk-shrines/ga-ahisas', '/totk-shrines/ganos', '/totk-shrines/gasas', '/totk-shrines/gatakis', '/totk-shrines/gatanisis', '/totk-shrines/gemimik', '/totk-shrines/gikaku', '/totk-shrines/gutanbac', '/totk-shrines/igashuk', '/totk-shrines/igoshon', '/totk-shrines/ihen-a', '/totk-shrines/ijo-o', '/totk-shrines/ikatak', '/totk-shrines/in-isa', '/totk-shrines/irasak', '/totk-shrines/ishodag', '/totk-shrines/ishokin', '/totk-shrines/isisim', '/totk-shrines/iun-orok', '/totk-shrines/jikais', '/totk-shrines/jinodok', '/totk-shrines/jiosin', '/totk-shrines/jiotak', '/totk-shrines/jirutagumac', '/totk-shrines/jiukoum', '/totk-shrines/jochi-ihiga', '/totk-shrines/jochi-iu', '/totk-shrines/jochisiu', '/totk-shrines/jogou', '/totk-shrines/jojon', '/totk-shrines/joju-u-u', '/totk-shrines/joku-u', '/totk-shrines/joku-usin', '/totk-shrines/joniu', '/totk-shrines/jonsau', '/totk-shrines/josiu', '/totk-shrines/kadaunar', '/totk-shrines/kahatanaum', '/totk-shrines/kamatukis', '/totk-shrines/kamizun', '/totk-shrines/karahatag', '/totk-shrines/kikakin', '/totk-shrines/kimayat', '/totk-shrines/kisinona', '/totk-shrines/kitawak', '/totk-shrines/kiuyoyou', '/totk-shrines/kudanisar', '/totk-shrines/kumamayn', '/totk-shrines/kurakat', '/totk-shrines/kyokugon', '/totk-shrines/kyononis', '/totk-shrines/makasura', '/totk-shrines/makurukis', '/totk-shrines/maoikes', '/totk-shrines/marakuguc', '/totk-shrines/marari-in', '/totk-shrines/mayachideg', '/totk-shrines/mayachin', '/totk-shrines/mayahisik', '/totk-shrines/mayak', '/totk-shrines/mayam', '/totk-shrines/mayamats', '/totk-shrines/mayanas', '/totk-shrines/mayaotaki', '/totk-shrines/mayasiar', '/totk-shrines/mayatat', '/totk-shrines/mayaumekis', '/totk-shrines/mayausiy', '/totk-shrines/minetak', '/totk-shrines/miryotanog', '/totk-shrines/mogawak', '/totk-shrines/mogisari', '/totk-shrines/momosik', '/totk-shrines/morok', '/totk-shrines/moshapin', '/totk-shrines/motsusis', '/totk-shrines/musanokir', '/totk-shrines/nachoyah', '/totk-shrines/natak', '/totk-shrines/ninjis', '/totk-shrines/nouda', '/totk-shrines/o-ogim', '/totk-shrines/orochium', '/totk-shrines/oromuwak', '/totk-shrines/oshozan-u', '/totk-shrines/otak', '/totk-shrines/otutsum', '/totk-shrines/pupunke', '/totk-shrines/rakakudaj', '/totk-shrines/rakashog', '/totk-shrines/rasitakiwak', '/totk-shrines/rasiwak', '/totk-shrines/ren-iz', '/totk-shrines/riogok', '/totk-shrines/rotsumamu', '/totk-shrines/runakit', '/totk-shrines/rutafu-um', '/totk-shrines/sahirow', '/totk-shrines/sakunbomar', '/totk-shrines/sepapa', '/totk-shrines/serutabomac', '/totk-shrines/sibajitak', '/totk-shrines/sifumim', '/totk-shrines/sihajog', '/totk-shrines/sikukuu', '/totk-shrines/simosiwak', '/totk-shrines/sinakawak', '/totk-shrines/sinatanika', '/totk-shrines/sisuran', '/totk-shrines/sitsum', '/totk-shrines/siwakama', '/totk-shrines/siyamotsus', '/totk-shrines/sonapan', '/totk-shrines/soryotanog', '/totk-shrines/suariwak', '/totk-shrines/susub', '/totk-shrines/susuyai', '/totk-shrines/tadarok', '/totk-shrines/tajikats', '/totk-shrines/taki-ihaban', '/totk-shrines/taninoud', '/totk-shrines/taunhiy', '/totk-shrines/tauyosipun', '/totk-shrines/tenbez', '/totk-shrines/teniten', '/totk-shrines/tenmaten', '/totk-shrines/timawak', '/totk-shrines/tokiy', '/totk-shrines/tsutsu-um', '/totk-shrines/tukarok', '/totk-shrines/turakamik', '/totk-shrines/turakawak', '/totk-shrines/ukoojisi', '/totk-shrines/ukouh', '/totk-shrines/usazum', '/totk-shrines/utojis', '/totk-shrines/utsushok', '/totk-shrines/wao-os', '/totk-shrines/yamiyo', '/totk-shrines/yansamin', '/totk-shrines/yomizuk', '/totk-shrines/zakusu', '/totk-shrines/zanmik', '/botw-shrines/oman-au', '/botw-shrines/ja-baij', '/botw-shrines/owa-daim', '/botw-shrines/keh-namut', '/botw-shrines/bosh-kala', '/botw-shrines/toto-sah', '/botw-shrines/shee-vaneer', '/botw-shrines/ree-dahee', '/botw-shrines/shee-venath', '/botw-shrines/ha-dahamar', '/botw-shrines/taloh-naeg', '/botw-shrines/hila-rao', '/botw-shrines/lakna-rokee', '/botw-shrines/chaas-qeta', '/botw-shrines/myahm-agana', '/botw-shrines/tahno-oah', '/botw-shrines/jitan-sami', '/botw-shrines/dow-naeh', '/botw-shrines/kam-urog', '/botw-shrines/mezza-lo', '/botw-shrines/daka-tuss', '/botw-shrines/kaya-wan', '/botw-shrines/soh-kofi', '/botw-shrines/sheh-rata', '/botw-shrines/rucco-maag', '/botw-shrines/shai-yota', '/botw-shrines/dagah-keek', '/botw-shrines/neez-yohma', '/botw-shrines/kah-mael', '/botw-shrines/rona-kachta', '/botw-shrines/monya-toma', '/botw-shrines/kuhn-sidajj', '/botw-shrines/daag-chokah', '/botw-shrines/keo-ruug', '/botw-shrines/maag-halan', '/botw-shrines/ketoh-wawai', '/botw-shrines/mirro-shaz', '/botw-shrines/dah-kaso', '/botw-shrines/rota-ooh', '/botw-shrines/wahgo-katta', '/botw-shrines/kaam-yatak', '/botw-shrines/katah-chuki', '/botw-shrines/noya-neha', '/botw-shrines/saas-kosah', '/botw-shrines/namika-ozz', '/botw-shrines/ishto-soh', '/botw-shrines/shoqa-tatone', '/botw-shrines/kao-makagh', '/botw-shrines/pumaag-nitae', '/botw-shrines/ya-naga', '/botw-shrines/shae-katha', '/botw-shrines/shai-utoh', '/botw-shrines/qukah-nata', '/botw-shrines/shoda-sah', '/botw-shrines/tawa-jinn', '/botw-shrines/yah-rin', '/botw-shrines/kah-yah', '/botw-shrines/muwo-jeem', '/botw-shrines/korgu-chideh', '/botw-shrines/mijah-rokee', '/botw-shrines/shae-loya', '/botw-shrines/sheem-dagoze', '/botw-shrines/mogg-latan', '/botw-shrines/zalta-wa', '/botw-shrines/maag-norah', '/botw-shrines/toh-yahsa', '/botw-shrines/sha-warvo', '/botw-shrines/voo-lota', '/botw-shrines/akh-vaquot', '/botw-shrines/bareeda-naag', '/botw-shrines/tena-kosah', '/botw-shrines/kah-okeo', '/botw-shrines/hia-miu', '/botw-shrines/to-quomo', '/botw-shrines/mozo-shenno', '/botw-shrines/shada-naw', '/botw-shrines/rok-uwog', '/botw-shrines/sha-gehma', '/botw-shrines/qaza-tokki', '/botw-shrines/goma-asaagh', '/botw-shrines/maka-rah', '/botw-shrines/dunba-taag', '/botw-shrines/lanno-kooh', '/botw-shrines/gee-harah', '/botw-shrines/rin-oyaa', '/botw-shrines/hawa-koth', '/botw-shrines/kema-zoos', '/botw-shrines/tho-kayu', '/botw-shrines/raqa-zunzo', '/botw-shrines/misae-suma', '/botw-shrines/dila-maag', '/botw-shrines/korsh-ohu', '/botw-shrines/kay-noh', '/botw-shrines/dako-tah', '/botw-shrines/suma-sahma', '/botw-shrines/jee-noh', '/botw-shrines/daqo-chisay', '/botw-shrines/keeha-yoog', '/botw-shrines/kuh-takkar', '/botw-shrines/kema-kosassa', '/botw-shrines/sasa-kai', '/botw-shrines/joloo-nah', '/botw-shrines/sho-dantu', '/botw-shrines/shora-hah', '/botw-shrines/daqa-koh', '/botw-shrines/qua-raym', '/botw-shrines/tah-muhl', '/botw-shrines/moa-keet', '/botw-shrines/sah-dahaj', '/botw-shrines/gorae-torr', '/botw-shrines/kayra-mah', '/botw-shrines/shae-mosah', '/botw-shrines/zuna-kai', '/botw-shrines/ze-kasho', '/botw-shrines/kenai-shakah', '/botw-shrines/ritaag-zumo', '/botw-shrines/tutsuwa-nima', '/botw-shrines/tu-kaloh', '/botw-shrines/dah-hesho', '/botw-shrines/katosa-aug', '/botw-shrines/yowaka-ita', '/botw-shrines/rohta-chiga', '/botw-shrines/ruvo-korbah', '/botw-shrines/etsu-korima', '/botw-shrines/kee-dafunia', '/botw-shrines/sato-kado', '/botw-shrines/mah-eliya', '/botw-shrines/kamia-omuna', '/botw-shrines/sharo-lun', '/botw-shrines/rinu-honkia', '/botw-shrines/shira-gomar', '/botw-shrines/kiah-toza', '/botw-shrines/noe-rajee', '/botw-shrines/keive-tala', '/botw-shrines/takama-shiri', '/botw-shrines/kihiro-moh'], // List of routes to prerender.
      renderer: new Renderer({
        headless: true,
        maxConcurrentRoutes: 10,
        renderAfterTime: 5000
      })
    })
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
