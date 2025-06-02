#!/usr/bin/env node
import bs from 'browser-sync';
import config from '../../build.config.js';

const browserSync = bs.create();

browserSync.init({
	server: {
		baseDir: config.dist
	},
	files: [`${config.dist}/**/*`],
	open: 'external',
	notify: false,
	logPrefix: 'Dev Server'
}, (err) => {
	if (err) {
		console.error('BrowserSync failed to start:', err);
		process.exit(1);
	}
	console.log('✓ Development server started');
});