module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/*'],
        concat: {
            options: {
                separator: ';\n\n',
                banner: '/**\n' +
                    '* <%= pkg.name %>\n' +
                    '* <%= pkg.description %>\n' +
                    '* Madgex. Build date: <%= grunt.template.today("dd-mm-yyyy") %>\n' +
                    '*/\n\n'
            },
            files: {
                src: [
                    'src/libs/*.js',
                    'src/lazyads-loader.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= concat.options.banner %>',
            },
            prod: {
                options: {
                    sourceMap: true,
                    // sourceMapName: 'dist/lazyads-loader.min.js'
                },
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.files.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['concat', 'uglify']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('default', ['clean', 'concat', 'uglify']);

};