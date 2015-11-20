// 一、配置区

// 配置整个项目静态资源版本号(全局使用且唯一此处配置, 包含css, js, templates, controllerjs)
// 如果改动源码(尽量不)则手动更改相应amd-define函数引入时的版本号，推荐以日期时间作为版本号)
var staticResourceVersion = "1.1.1.1";

// 需要发布的域名(某些静态资源绝对路径需要)
var domain = 'http://weixin.hizuoye.com';

// 使用的api基地址
var apiBaseUrl = 'http://api.hizuoye.com/api/v1/';

// 全局资源的基地址，同时用于主html文件的dns预解析，千万保证正确，防止资源浪费, 基本不用动
var dnsPrefetchUrl = 'http://7rfll3.com1.z0.glb.clouddn.com/';

// 项目模板文件基地址, 基本不用动
var templateBaseUrl = 'assets/templates/';

// 项目控制器文件基地址, 基本不用动
var controllerBaseUrl = 'scripts/controller/';

// 自动确定运行时模式　dev or production
var mode = 'dev';
process.argv.forEach(function (val, index, array) { /* jshint ignore:line */
    if (val === 'release') {
        mode = 'production';
    }
});

// 二、 TASK提示条幅区

var on = (mode === 'dev') ? 'on ! ' : 'off !';
var modeStr = (mode === 'dev') ? '    dev    ' : 'production ';
console.log('============================================================================='); /* jshint ignore:line */
console.log('============================================================================='); /* jshint ignore:line */
console.log('=======================>   start ' + modeStr + ' task !   <======================'); /* jshint ignore:line */
console.log('===================>   avalon & $http debug is ' + on + '  <======================'); /* jshint ignore:line */
console.log('============================================================================='); /* jshint ignore:line */
console.log('============================================================================='); /* jshint ignore:line */


// 三、 任务配置区

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ /* jshint ignore:line */
    port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir)); /* jshint ignore:line */
};

module.exports = function(grunt) { /* jshint ignore:line */
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks); /* jshint ignore:line */

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'), // read package.json to get some info.

        watch: {
            options: {
                nospawn: true
            },

            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    'public/*.html',
                    'public/src/templates/**/*.html',
                    'public/src/scss/**/*.scss',
                    'public/src/scripts/**/*.js',
                    'public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                ]
            },

            basescss: {
                files: ['public/src/scss/base/**/*.scss'],
                tasks: ['sass:microsite', 'sass:homework', 'sass:task', 'sass:question']
            },

            micrositescss: {
                files: ['public/src/scss/microsite/*.scss'],
                tasks: ['sass:microsite', 'sass:task']
            },

            homeworkscss: {
                files: ['public/src/scss/homework/*.scss'],
                tasks: ['sass:homework']
            },

            taskscss: {
                files: ['public/src/scss/task/*.scss'],
                tasks: ['sass:task']
            },

            questionscss: {
                files: ['public/src/scss/question/*.scss'],
                tasks: ['sass:question']
            },

            fonts: {
                files: ['public/assets/fonts/**/*.*'],
                tasks: ['copy:fonts']
            },

            images: {
                files: ['public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'],
                tasks: ['imagemin']
            },

            mainHtmls: {
                files: ['public/src/mainHtmls/**/*.html'],
                tasks: ['reGenerateMainHtmls']
            },

            mainScripts: {
                files: ['public/src/scripts/app/**/*.js'],
                tasks: ['reGenerateMainScripts']
            },

            templates: {
                files: ['public/src/templates/**/*.html'],
                tasks: ['copyTemplates']
            },

            controllerJs: {
                files: ['public/src/scripts/controller/**/*.js'],
                tasks: ['copyControllerJs']
            },

            outer: {
                files: ['public/src/outer/**/*'],
                tasks: ['reGenerateOuter']
            }

        }, // watch 

        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [ // server root path 
                            mountFolder(connect, 'public'),
                            lrSnippet
                        ];
                    }
                }
            }
        }, // connect as a local server

        open: {
            dev: {
                path: 'http://localhost:<%= connect.options.port %>/microsite.html'
            },
            build: {
                path: 'http://localhost:<%= connect.options.port %>/build/microsite.html'
            }
        }, //open browser

        includereplace: {
            generateMainScripts: {
                options: {
                    globals: {
                        version: staticResourceVersion,
                        domain: domain,
                        apiBaseUrl: apiBaseUrl,
                        templateBaseUrl: templateBaseUrl,
                        controllerBaseUrl: controllerBaseUrl,
                        resourceBaseUrl: dnsPrefetchUrl,
                        debug: mode === 'dev' ? true : false
                    },
                    prefix: '// @@',
                    suffix: ' @@ //'
                },
                // Files to perform replacements and includes with
                src: 'public/src/scripts/app/**/*.js',
                // Destidistnation directory to copy files to
                dest: 'public/assets/scripts/dist/scripts/'
            },
            generateMainHtmls: {
                options: {
                    globals: {
                        version: staticResourceVersion,
                        domain: domain,
                        apiBaseUrl: apiBaseUrl,
                        dnsPrefetchUrl: dnsPrefetchUrl,
                        debug: mode === 'dev' ? true : false
                    },
                    prefix: '<!-- @@',
                    suffix: ' @@ -->'
                },
                // Files to perform replacements and includes with
                src: 'public/src/mainHtmls/*.html',
                // Destidistnation directory to copy files to
                dest: 'public/assets/mainHtmls/dist/'
            },
            generateOuter: {
                options: {
                    globals: {
                        apiBaseUrl: apiBaseUrl,
                        domain: domain,
                        version: staticResourceVersion,
                        debug: mode === 'dev' ? true : false
                    },
                    prefix: '// @@',
                    suffix: ' @@ //'
                },
                // Files to perform replacements and includes with
                src: 'public/src/outer/**/*.*',
                // Destidistnation directory to copy files to
                dest: 'public/assets/outer/dist/'
            }
        },

        //压缩HTML
        htmlmin: {
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true
            },
            templates: {
                files: [
                    {expand: true, cwd: 'public/assets/templates', src: ['**/*.html'], dest: 'public/build/assets/templates'}
                ]
            }
        },

        sass: {
            options: {
                trace: true,
                style: 'expanded', // normal css style
                update: true // only update when sth changed
            },
            microsite: {
                files: [{
                    expand: true,
                    cwd: 'public/src/scss/microsite',
                    src: ['*.scss'],
                    dest: 'public/assets/styles/microsite',
                    ext: '.css'
                }]
            },
            homework: {
                files: [{
                    expand: true,
                    cwd: 'public/src/scss/homework',
                    src: ['*.scss'],
                    dest: 'public/assets/styles/homework',
                    ext: '.css'
                }]
            },
            task: {
                files: [{
                    expand: true,
                    cwd: 'public/src/scss/task',
                    src: ['*.scss'],
                    dest: 'public/assets/styles/task',
                    ext: '.css'
                }]
            },
            question: {
                files: [{
                    expand: true,
                    cwd: 'public/src/scss/question',
                    src: ['*.scss'],
                    dest: 'public/assets/styles/question',
                    ext: '.css'
                }]
            }
        }, //build scss

        uglify: {
            options: {
                sourceMap: true
                //banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %> */\n'//添加banner
            },
            buildall: { //按原文件结构压缩js文件夹内所有JS文件
                options: {
                    mangle: false, //不混淆变量名
                    preserveComments: 'some', //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
                },
                files: [{
                    expand: true,
                    cwd: 'public/assets/scripts/', //js目录下
                    src: '**/*.js', //所有js文件
                    dest: 'public/build/assets/scripts/' //输出到此目录下
                }]
            }
        }, // js uglify

        cssmin: {
            homework: {
                expand: true,
                cwd: 'public/assets/styles/homework/',
                src: ['*.css'],
                dest: 'public/build/assets/styles/homework/',
                ext: '.css'
            },
            microsite: {
                expand: true,
                cwd: 'public/assets/styles/microsite/',
                src: ['*.css'],
                dest: 'public/build/assets/styles/microsite/',
                ext: '.css'
            },
            task: {
                expand: true,
                cwd: 'public/assets/styles/task/',
                src: ['*.css'],
                dest: 'public/build/assets/styles/task/',
                ext: '.css'
            },
            question: {
                expand: true,
                cwd: 'public/assets/styles/question/',
                src: ['*.css'],
                dest: 'public/build/assets/styles/question/',
                ext: '.css'
            },
        }, // css min, only app-build.css to min...

        // https://www.npmjs.com/package/grunt-contrib-imagemin
        imagemin: { 
            foldermin: { // target
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: 'public/assets/images/', // Src matches are relative to this path
                    src: ['*.{png,jpg,gif}'], // Actual patterns to match
                    dest: 'public/build/assets/images/' // Destination path prefix
                }]
            }
        },

        // https://www.npmjs.com/package/grunt-contrib-clean
        // clean the build or no-use assets and files.
        clean: {
            //fonts: ["public/build/assets/fonts/"],
            //images: ["public/build/assets/images/"],
            //css: ["public/build/assets/styles/"],
            //js: ['public/build/assets/scripts/'],
            //templates: ['public/build/assets/templates'],
            dev: ['public/*.html', 'public/outer/'], // for build
            build: ['public/build/'], // for release
            mainHtmlsDist: ['public/assets/mainHtmls/'], // for dev
            mainScriptsDist: ['public/assets/scripts/dist/'], // for dev
            outerDist: ['public/assets/outer/'] // for dev
        },

        // https://www.npmjs.com/package/grunt-contrib-copy
        // In my opinion, copy is used to copy resource to build path,
        // because build path is a folder that all files should be auto-created.
        copy: {
            mainHtmls: { // for dev
                files: [{
                    expand: true,
                    cwd: 'public/assets/mainHtmls/dist/public/src/mainHtmls/',
                    src: ['*.html'],
                    dest: 'public/'
                }]
            },
            mainScripts: { // for dev
                files: [{
                    expand: true,
                    cwd: 'public/assets/scripts/dist/scripts/public/src/scripts/app/',
                    src: ['*.js'],
                    dest: 'public/assets/scripts/'
                }]
            },
            templates: {
                files: [{
                    expand: true,
                    cwd: 'public/src/templates/',
                    src: ['**/*.html'],
                    dest: 'public/assets/templates/'
                }]
            },
            controllerJs: {
                files: [{
                    expand: true,
                    cwd: 'public/src/scripts/controller/',
                    src: ['**/*.js'],
                    dest: 'public/assets/scripts/controller/'
                }]
            },
            outer: { // for dev
                files: [{
                    expand: true,
                    cwd: 'public/assets/outer/dist/public/src/outer/',
                    src: ['**/*'],
                    dest: 'public/outer'
                }]
            },
            fonts: { // for release
                files: [
                    // makes all src relative to cwd
                    {
                        expand: true,
                        cwd: 'public/assets/fonts/',
                        src: ['**/*'],
                        dest: 'public/build/assets/fonts'
                    }
                ]
            },
            releaseMainHtmls: { // for release
                files: [
                    // makes all src relative to cwd
                    {
                        expand: true,
                        cwd: 'public/',
                        src: ['*.html'],
                        dest: 'public/build/'
                    }
                ]
            },
            releaseOuter: { // for release
                files: [
                    // makes all src relative to cwd
                    {
                        expand: true,
                        cwd: 'public/outer/',
                        src: ['**/*'],
                        dest: 'public/build/outer/'
                    }
                ]
            }
        },

        htmlhint: {
            hint: {
                options: {
                    'tag-pair': true,
                    'tagname-lowercase': true,
                    'attr-lowercase': true,
                    'attr-value-double-quotes': true,
                    'doctype-first': false,
                    'spec-char-escape': true,
                    'id-unique': true,
                    'head-script-disabled': true,
                    'style-disabled': false 
                },
                src: ['public/*.html', 'public/assets/templates/**/*.html']
            }
        }, // html hint

        jshint: {
            //all: ['gruntfile.js', 'public/assets/scripts/controller/**/*.js']
            ctrlScripts: ['gruntfile.js', 'public/assets/scripts/controller/**/*.js']
        },

        karma: {
            options: { // shared config
                configFile: 'karma.conf.js'
            },
            unit: {
                options: {
                    singleRun: true // specific config example
                }
            }
        }

    });
    // Tasks config end...
    
// 四、 任务整合调用区
    
    // helper task
    grunt.registerTask('buildimages', 'minify the images to build folder...', ['imagemin']);
    grunt.registerTask('buildtemplates', 'minify the templates to build folder...', ['htmlmin:templates']);
    grunt.registerTask('buildcss', 'minify the css to build folder...', ['sass', 'cssmin']);
    grunt.registerTask('buildjs', 'uglify the js to build folder...', ['uglify']);

    grunt.registerTask('reGenerateMainHtmls', 'reGenerateMainHtmls...', ['includereplace:generateMainHtmls', 'copy:mainHtmls', 'clean:mainHtmlsDist']);
    grunt.registerTask('reGenerateMainScripts', 'reGenerateMainScripts...', ['includereplace:generateMainScripts', 'copy:mainScripts', 'clean:mainScriptsDist']);
    grunt.registerTask('reGenerateOuter', 'reGenerateOuter...', ['includereplace:generateOuter', 'copy:outer', 'clean:outerDist']);

    // not very good way, just copy
    grunt.registerTask('copyTemplates', 'copy templates html files to assets/ ...', ['copy:templates']);
    grunt.registerTask('copyControllerJs', 'copy controller js files to assets/ ...', ['copy:controllerJs']);

    // hint task 
    grunt.registerTask('hint', function(target) { /* jshint ignore:line */
        grunt.task.run([
            'htmlhint',
            'jshint'
        ]);
    });

    // dev task 
    grunt.registerTask('dev', function(target) { /* jshint ignore:line */
        grunt.task.run([
            'reGenerateMainHtmls',
            'reGenerateMainScripts',
            'reGenerateOuter',
            'sass',
            'connect:livereload',
            'open:dev',
            'watch'
        ]);
    });

    // build task, for local dev and test with source code, almost not using directly
    grunt.registerTask('build', function(target) { /* jshint ignore:line */
        grunt.task.run([
            'clean:dev',
            'sass',
            'reGenerateMainHtmls',
            'reGenerateMainScripts',
            'reGenerateOuter',
            'copyTemplates',
            'copyControllerJs'
        ]);
    });

    // release task, use it before deploy to server
    grunt.registerTask('release', function(target) { /* jshint ignore:line */
        grunt.task.run([
            'build', // add this to avoid ignoring the grunt build task(like 20151009 hot fix)
            'hint',
            'clean:build',
            'copy:fonts',
            'buildimages',
            'buildjs',
            'buildcss',
            'buildtemplates',
            'copy:releaseMainHtmls',
            'copy:releaseOuter'
        ]);
    });

};

