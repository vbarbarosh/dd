function render_config(mode)
{
    // noinspection EqualityComparisonWithCoercionJS
    const is_development = (mode == 'development');

    return {
        mode,
        entry: './src/dd.js',
        devtool: false,
        output: {
            filename: is_development ? 'dd.js' : 'dd.min.js',
            library: 'dd',
            libraryExport: 'default',
        },
    };
}

// noinspection WebpackConfigHighlighting
module.exports = [
    render_config('development'),
    render_config('production'),
];
