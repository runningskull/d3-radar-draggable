module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')

    ,browserify: {
      dist: {
        files: {
          'build/radar.js': ['js/**/*.js']
        }

        ,options: {
          transform: ['debowerify']
        }
      }
    }

    ,watch: {
       files: ['js/**/*.js']
      ,tasks: ['browserify']
    }
  })

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('default', ['browserify'])

}

