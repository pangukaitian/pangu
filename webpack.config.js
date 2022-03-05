var path = require('path')

module.exports = {
    entry: './res/js/main.js',
    output: {
        path: path.resolve(__dirname),
        filename: 'dist.js',
    },
}
