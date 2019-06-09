const path = require('path')
const { override, removeModuleScopePlugin, babelInclude } = require('customize-cra')

module.exports = override(
	removeModuleScopePlugin(),
	babelInclude([
		path.resolve('src'), // make sure you link your own source
		path.resolve('../../src'),
		path.resolve('../websitebuilder/src'),
	])
)
