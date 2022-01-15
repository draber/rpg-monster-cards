import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from "rollup-plugin-terser";

import {
    path,
    settings
} from './bootstrap.js';

export default [{
	input: path.resolve(`${settings.get('paths.js')}/main.js`),
	output: {
		file: path.resolve(`${settings.get('paths.dist')}/js/main.js`),
		format: 'iife'
	},
	plugins: [
		resolve(),
		commonjs(),
		cleanup(),
		/*terser()*/
	]
}];