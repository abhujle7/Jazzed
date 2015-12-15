var gulp = require('gulp');
var gutil = require('gulp-util');
// var bower = require('bower');
var concat = require('gulp-concat');
var reload = require('gulp-livereload')
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
// var sh = require('shelljs');
var babel = require('gulp-babel');
var runSeq = require('run-sequence');
var plumber = require('gulp-plumber');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var karma = require('karma').server;
var istanbul = require('gulp-istanbul');
var notify = require('gulp-notify');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('reload', function() {
    reload.reload();
});

gulp.task('default', ['sass'], function () {
  //all the following inside function is from FSG

    gulp.start('build');

    // Run when anything inside of browser/js changes.
    gulp.watch(['www/js/**/*.js'], ['buildJS']);

    // Run when anything inside of browser/scss changes.
    // gulp.watch('www/css/**', function () {
    //     runSeq('buildCSS', 'reloadCSS');
    // });

    gulp.watch('server/**/*.js', ['lintJS']);

    // Reload when a template (.html) file changes.
    gulp.watch(['www/**/*.html', 'server/app/views/*.html'], ['reload']);

    // Run server tests when a server file or server test file changes.
    gulp.watch(['tests/server/**/*.js'], ['testServerJS']);

    // Run browser testing when a browser test file changes.
    gulp.watch('tests/browser/**/*', ['testBrowserJS']);


  });

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  // return bower.commands.install()
  //   .on('log', function(data) {
  //     gutil.log('bower', gutil.colors.cyan(data.id), data.message);
  //   });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

// Everything below is from FSG

gulp.task('lintJS', function () {

    return gulp.src(['./www/js/**/*.js', './server/**/*.js'])
        .pipe(plumber({
            errorHandler: notify.onError('Linting FAILED! Check your gulp process.')
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());

});

gulp.task('testBrowserJS', function (done) {
    karma.start({
        configFile: __dirname + '/tests/browser/karma.conf.js',
        singleRun: true
    }, done);
});

// gulp.task('buildCSS', function () {

//    var sassCompilation = sass();
//    sassCompilation.on('error', console.error.bind(console));

//    return gulp.src('./browser/scss/main.scss')
//        .pipe(plumber({
//            errorHandler: notify.onError('SASS processing failed! Check your gulp process.')
//        }))
//        .pipe(sassCompilation)
//        .pipe(rename('style.css'))
//        .pipe(gulp.dest('./public'));
// });

gulp.task('testBrowserJS', function (done) {
    karma.start({
        configFile: __dirname + '/tests/browser/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('buildJS', ['lintJS'], function () {
    return gulp.src(['./www/js/app.js', './www/js/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        // .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./www'));
});

gulp.task('testServerJS', function () {
    require('babel/register');
  return gulp.src('./tests/server/**/*.js', {
    read: false
  }).pipe(mocha({ reporter: 'spec' }));
});

gulp.task('testServerJSWithCoverage', function (done) {
    gulp.src('./server/**/*.js')
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src('./tests/server/**/*.js', {read: false})
                .pipe(mocha({reporter: 'spec'}))
                .pipe(istanbul.writeReports({
                    dir: './coverage/server/',
                    reporters: ['html', 'text']
                }))
                .on('end', done);
        });
});

gulp.task('build', function () {
    // if (process.env.NODE_ENV === 'production') {
    //     // runSeq(['buildJSProduction']);  // removed 'buildCSSProduction'
    // } else {
        runSeq(['buildJS', 'sass']);
    // }
});
