import './index.scss';
import $ from 'cash-dom';
import {MDCList} from '@material/list';
import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
import {html, render} from 'lit-html';
import SassLoader from './material-sass/sassloader';
import {materialSassPath} from './material-sass/path';
import uid from './lib/uid';

class MaterialThemeCover {
  constructor(el) {
    this.root_ = el;

    this.render_();
  }

  mdcButton({label}) {
    return html`
      <div class="mdc-button mdc-button--raised">${label}</div>
    `;
  }

  mdcTextField({hintText}) {
    return html`
      <div class="mdc-text-field">
        <input type="text" id="my-text-field" class="mdc-text-field__input">
        <label class="mdc-floating-label" for="my-text-field">${hintText}</label>
        <div class="mdc-line-ripple"></div>
      </div>
    `;
  }

  mdcFab() {
    return html`
      <button class="mdc-fab" aria-label="Favorite">
        <span class="mdc-fab__icon material-icons">favorite</span>
      </button>`;
  }

  mdcExtendedFab() {
    return html`
      <button class="mdc-fab mdc-fab--extended">
        <span class="material-icons mdc-fab__icon">add</span>
        <span class="mdc-fab__label">Create</span>
      </button>`;
  }

  mdcCard() {
    return html`
      <div class="mdc-card demo-card">
        <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
          <div class="mdc-card__media mdc-card__media--16-9 demo-card__media" style="background-image: url('https://material-components.github.io/material-components-web-catalog/static/media/photos/3x2/2.jpg');"></div>
          <div class="demo-card__primary">
            <h2 class="demo-card__title mdc-typography mdc-typography--headline6">Our Changing Planet</h2>
            <h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2">by Kurt Wagner</h3>
          </div>
          <div class="demo-card__secondary mdc-typography mdc-typography--body2">Visit ten places on our planet that are undergoing the biggest changes today.</div>
        </div>
        <div class="mdc-card__actions">
          <div class="mdc-card__action-buttons">
            <button class="mdc-button mdc-card__action mdc-card__action--button">Read</button>
            <button class="mdc-button mdc-card__action mdc-card__action--button">Bookmark</button>
          </div>
          <div class="mdc-card__action-icons">
            <button class="mdc-icon-button mdc-card__action mdc-card__action--icon--unbounded" aria-pressed="false" aria-label="Add to favorites" title="Add to favorites">
              <i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">favorite</i>
              <i class="material-icons mdc-icon-button__icon">favorite_border</i>
            </button>
            <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="Share" data-mdc-ripple-is-unbounded="true">share</button>
            <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="More options" data-mdc-ripple-is-unbounded="true">more_vert</button>
          </div>
        </div>
      </div>`;
  }

  mdcList() {
    return html`
      <ul class="mdc-list">
        <li class="mdc-list-item" tabindex="-1">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">inbox</span>Inbox</li>
        <li class="mdc-list-item mdc-list-item--activated" tabindex="-1" aria-selected="true">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">star</span>Star</li>
        <li class="mdc-list-item" tabindex="-1">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">send</span>Send</li>
        <li class="mdc-list-item" tabindex="-1">
          <span class="mdc-list-item__graphic material-icons" aria-hidden="true">drafts</span>Drafts</li>
      </ul>
    `;
  }

  static render(el) {
    return new MaterialThemeCover(el);
  }

  render_() {
    render(html`
      <div>
        ${this.mdcButton({label: 'Button'})}
        <br><br>
        ${this.mdcTextField({hintText: 'Hint text'})}
        <br><br>
        ${this.mdcFab()}
        <br><br>
        ${this.mdcExtendedFab()}
      </div>
      <br><br>
      ${this.mdcCard()}
      <br><br>
      ${this.mdcList()}
      <br><br>
    `, this.root_);

    this.onRender();
  }

  onRender() {
    $('.mdc-button, .mdc-fab, .mdc-card__primary-action, .mdc-list-item').each((index, el) => {
      new MDCRipple(el);
    });

    $('.mdc-text-field').each((index, el) => {
      new MDCTextField(el);
    });

    $('.mdc-list').each((index, el) => {
      new MDCList(el);
    });
  }
}

MaterialThemeCover.render(document.querySelector('.material-theme-editor__cover'));

class MaterialThemeEditor {
  constructor(el) {
    this.root_ = el;
    this.primary = '#4A0C3B';
    this.sassLoader_ = new SassLoader();
    this.themeOverrides_ = {};

    this.initiateSassLoader();
    this.render_();
  }

  getStyles_() {
    return `
      body {
        background-color: rgba(mdc-theme-prop-value(primary), .12);
      }

      h2, h3 {
        margin: 0;
        padding: 0;
      }

      .mdc-list {
        width: 350px;
      }

      .mdc-card {
        height: 388px;
        width: 350px;
      }

      .demo-card__primary {
        padding: 1rem;
      }

      .demo-card__subtitle {
        @include mdc-theme-prop('color', text-secondary-on-background);
      }

      .demo-card__secondary {
        @include mdc-theme-prop('color', text-secondary-on-background);

        padding: 0 1rem 8px;
      }
    `;
  }

  initiateSassLoader() {
    this.sassLoader_.setIncludeFiles(materialSassPath);
    this.apply();
  }

  apply() {
    this.sassLoader_.setOverride(`
      ${this.getSassGlobal('$mdc-theme-primary', this.themeOverrides_.primary)}
      ${this.getSassGlobal('$mdc-theme-secondary', this.themeOverrides_.secondary)}
    `);
    this.sassLoader_.compile(this.getStyles_());
  }

  getSassGlobal(variableName, value) {
    if (value) {
      return `${variableName}: ${value};`;
    } else {
      return '';
    }
  }

  setThemeOverride(overrides) {
    this.themeOverrides_ = Object.assign({}, this.themeOverrides_, overrides);

    this.apply();
  }

  mdcTextField({themeOverrideKey, label}) {
    const ariaLabelId = 'id-' + uid();

    return html`
      <div>
        <label class="mte-text-field-label" for="${ariaLabelId}">${label}</label>
        <div class="mdc-text-field mdc-text-field--no-label">
          <input @input=${(e) => this.setThemeOverride({[themeOverrideKey]: e.target.value})}
              id="${ariaLabelId}" type="text" class="mdc-text-field__input">
          <div class="mdc-line-ripple"></div>
        </div>
      </div>
    `;
  }

  render_() {
    render(html`
      ${this.mdcTextField({themeOverrideKey: 'primary', label: 'Primary'})}
      ${this.mdcTextField({themeOverrideKey: 'secondary', label: 'Secondary'})}
    `, this.root_);

    this.onRender();
  }

  onRender() {
    $('.mdc-text-field').each((index, el) => {
      new MDCTextField(el);
    });
  }

  static render(el) {
    return new MaterialThemeEditor(el);
  }
}

MaterialThemeEditor.render(document.querySelector('.material-theme-editor__editor'));
