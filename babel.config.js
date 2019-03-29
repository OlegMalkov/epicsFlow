module.exports = {
	'presets': [
		'@babel/preset-flow',
		['@babel/preset-env', {
			'exclude': ['transform-regenerator'],
		}],
	],
	'plugins': ['@babel/plugin-proposal-class-properties'],
}
