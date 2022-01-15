import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import {
	terser
} from 'rollup-plugin-terser';
import {
	config,
	env
} from '../js/builder/bootstrap.js';

const plugins = [
	resolve(),
	json(),
	commonjs(),
	cleanup()
]

if (env === 'prod') {
	plugins.push(terser());
}

export default [{
	input: config.js.entryPoint,
	output: {
		file: config.js.public,
		format: 'iife'
	},
	plugins
}];