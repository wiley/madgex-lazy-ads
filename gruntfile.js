module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/*'],
        concat: {
            options: {
                separator: ';',
                banner: '/**\n' +
                    '* <%= pkg.name %>\n' +
                    '* <%= pkg.description %>\n' +
                    '* Madgex. Build date: <%= grunt.template.today("dd-mm-yyyy") %>\n' +
                    '*/\n\n'
            },
            vanilla: {
                src: ['src/libs/*.js', 'src/lazyad-loader.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= concat.options.banner %>'
            },
            vanilla: {
                options: {
                    banner: '<%= uglify.options.banner %>',
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.vanilla.dest %>']
                }
            }
        },
        watch: {
            files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*'],
            tasks: ['concat'],
            options: {
                livereload: true
            }
        },
        connect: {
            server: {
                options: {
                    open: true,
                    port: 9000,
                    hostname: '*',
                    livereload: true,
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('test', ['connect', 'watch']);

    grunt.registerTask('default', ['clean', 'concat', 'uglify']);

};