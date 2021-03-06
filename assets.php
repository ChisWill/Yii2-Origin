<?php
/**
 * Configuration file for the "yii asset" console command.
 */

// In the console environment, some path aliases may not exist. Please define these:
Yii::setAlias('@webroot', __DIR__ . '/frontend/web');
Yii::setAlias('@web', '/');
Yii::setAlias('@common', __DIR__ . '/common');

return [
    // Adjust command/callback for JavaScript files compressing:
    'jsCompressor' => 'java -jar console/jar/compiler.jar --js {from} --js_output_file {to}',
    // Adjust command/callback for CSS files compressing:
    'cssCompressor' => 'java -jar console/jar/yuicompressor.jar --type css {from} -o {to}',
    // The list of asset bundles to compress:
    'bundles' => [
        'frontend\assets\AppAsset'
    ],
    // Asset bundle for compression output:
    'targets' => [
        'all' => [
            'class' => 'yii\web\AssetBundle',
            'basePath' => '@webroot/assets',
            'baseUrl' => '@web/assets',
            'js' => 'all-{hash}.js',
            'css' => 'all-{hash}.css',
        ],
    ],
    // Asset manager configuration:
    'assetManager' => [
        'basePath' => '@webroot/assets',
        'baseUrl' => '@web/assets',
    ],
];