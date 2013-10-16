module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

    ,browserify: {
      dist: {
        files: {
          'build/radar.js': ['js/**/*.js']
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-browserify')

  grunt.registerTask('default', ['browserify'])

}

