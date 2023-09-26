const resolve = require('@rollup/plugin-node-resolve');

const builds = [
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

export default ( args ) => {
    return builds;
}