const gulp = require("gulp");
const { parallel, series } = require("gulp");

const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const gulppug = require("gulp-pug");
const sourcemaps = require("gulp-sourcemaps");
const ghPages = require("gulp-gh-pages");
// const svgSprite = require("gulp-svg-sprite");

// const svgspriteConfig = {
//   mode: {
//     css: {
//       // Activate the «css» mode
//       render: {
//         css: true, // Activate CSS output (with default options)
//       },
//     },
//   },
// };

// function buildSvg(cb) {
//   gulp
//     .src("src/**/*.svg", { cwd: "src/images" })
//     .pipe(svgSprite(svgspriteConfig))
//     .pipe(dest("out"));
//   cb();
// }

// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */

// Optimise Images
function imageMin(cb) {
  gulp.src("src/images/**/*").pipe(imagemin()).pipe(gulp.dest("dist/images"));
  cb();
}

// Copy all HTML files to Dist
function copyHTML(cb) {
  gulp.src("src/*.html").pipe(gulp.dest("dist"));
  cb();
}

// Minify HTML
function minifyHTML(cb) {
  gulp
    .src("dist/*.html")
    .pipe(gulp.dest("dist"))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

// PUG
function pug(cb) {
  gulp
    .src("src/**/*.pug")
    .pipe(gulppug({ pretty: true }))
    .pipe(gulp.dest("dist"));

  cb();
}

// Scripts
function js(cb) {
  gulp
    .src("src/js/*js")
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
  cb();
}

// Compile Sass
function css(cb) {
  gulp
    .src("src/sass/*.scss")
    .pipe(sourcemaps.init()) // add
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        browserlist: ["last 2 versions"],
        cascade: false,
      })
    )
    .pipe(gulp.dest("dist/css"))
    // Stream changes to all browsers
    .pipe(browserSync.stream())
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest("dist/css"));
  cb();
}

// Watch Files
function watch_files() {
  browserSync.init({
    server: {
      baseDir: "dist/",
    },
  });

  gulp.watch("src/sass/**/*.scss", css).on("change", browserSync.reload);
  gulp.watch("src/js/*.js", js).on("change", browserSync.reload);
  gulp.watch("src/**/*.pug", pug).on("change", browserSync.reload);
}

gulp.task("deploy", () => src("./dist/**/*").pipe(ghPages()));

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(pug, css, js, imageMin, minifyHTML, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(pug, css, js, imageMin, minifyHTML);
