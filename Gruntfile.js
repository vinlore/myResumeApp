'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: ['Gruntfile.js', 'app/js/**/*.js', 'app/js/*.js'],
			options: {
				globalstrict: true,
				globals: {
					angular: true,
					module: true,
					document: true,
					window: true,
					setTimeout: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint']);
};