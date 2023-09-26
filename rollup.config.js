const resolve = require('@rollup/plugin-node-resolve');

export default ( args ) => {
    return [
        {
            input: 'src/domevents.pack.es.js',
            plugins: [
                resolve()
            ],
            output: [
                {
                    format: 'esm',
                    file: 'dist/domevents.pack.es.js'
                }
            ]
        }
    ];
}