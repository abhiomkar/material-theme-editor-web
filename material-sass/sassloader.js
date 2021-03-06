class SassLoader {
  constructor(includeFiles, entryFile) {
    this.entryFile = entryFile;
    this.files = includeFiles;
    this.filesLoaded = [];
    this.sass;
    this.overrides;
    this.pendingCompilePromise = null;

    this.init();
  }

  init() {
    this.sass = new Sass();
    this.initImporter();
  }

  setIncludeFiles(files) {
    this.files = files;
  }

  initImporter() {
    this.sass.importer((request, done) => {
      this.onImport(request.current);
      if (request.path) {
        done();
      } else if (request.current.indexOf('@material/') === 0) {
        done({
          path: this.getPath(request.current),
        });
      } else {
        done();
      }
    });
  }

  getPath(name) {
    let path = `/node_modules/${name}.scss`;

    if (this.files.indexOf(path) === -1) {
      path = path
        .split('/')
        .map((word, index, arr) => {
          if (index === arr.length - 1) {
            return '_' + word;
          } else {
            return word;
          }
        })
        .join('/');
    }

    path = '/sass' + path;
    return path;
  }

  fetchFiles() {
    return new Promise((resolve) => {
      this.files.forEach((file) => {
        fetch(file)
          .then((response) => response.text())
          .then((content) => {
            this.writeFile(file, content)
              .then(() => {
                this.filesLoaded.push(file);
                if (this.filesLoaded.length === this.files.length) resolve();
              });
          });
      });
    });
  }

  isFileLoaded(filePath) {
    return this.filesLoaded.indexOf(filePath) >= 0;
  }

  isAllFilesLoaded() {
    return this.files.every((file) => this.isFileLoaded(file));
  }

  writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
      this.sass.writeFile(filePath, content, (success) => {
        console.debug(`SassLoader: ${success ? 'write' : 'error write'} ${filePath}`);
        success ? resolve() : reject();
      });
    });
  }

  onImport(file) {}

  setOverride(overrides) {
    this.overrides = overrides;
  }

  compile(content = '') {
    document.body.classList.add('sass-loader-compiling');

    content = `
      ${this.overrides ? this.overrides : ''}

      @import "@material/textfield/mdc-text-field";
      @import "@material/button/mdc-button";
      @import "@material/fab/mdc-fab";
      @import "@material/card/mdc-card";
      @import "@material/typography/mdc-typography";
      @import "@material/list/mdc-list";
      @import "@material/icon-button/mdc-icon-button";

      ${content}
    `;
    console.debug('SassLoader: compile', content);

    if (this.pendingCompilePromise) {
      Promise.reject(this.pendingCompilePromise);
    }

    if (this.isAllFilesLoaded()) {
      this.pendingCompilePromise = new Promise((resolve) => {
        this.sass.compile(content, (result) => {
          console.debug('SassLoader: result.message', result.message);
          this.inject(result.text);
          this.pendingCompilePromise = false;
          resolve();
        });
      });
    } else {
      this.pendingCompilePromise = new Promise((resolve) => {
        this.fetchFiles().then(() => this.sass.compile(content, (result) => {
          console.debug('SassLoader: result.message', result.message);
          this.inject(result.text);
          this.pendingCompilePromise = false;
          resolve();
        }));
      });
    }

    return this.pendingCompilePromise;
  }

  compileFile() {
    return new Promise((resolve) => {
      this.fetchFiles()
        .then(() => {
          fetch(this.entryFile).then((response) => response.text())
            .then((content) => {
              this.sass.compile(content, (result) => {
                this.inject(result.text);
                resolve();
              });
            });
        });
    });
  }

  inject(content) {
    let styleEl = document.querySelector('style.sass-loader');

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.type = "text/css";
      styleEl.classList.add('sass-loader');
      document.body.appendChild(styleEl);
      document.body.classList.add('sass-loader-injected');
    }

    styleEl.innerHTML = content;

    if (content) {
      document.body.classList.remove('sass-loader-styles-empty');
    } else {
      document.body.classList.add('sass-loader-styles-empty');
    }

    document.body.classList.remove('sass-loader-compiling');
  }
}

export default SassLoader;
