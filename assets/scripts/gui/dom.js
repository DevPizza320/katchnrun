export class DOM {
  static get(selector, parent = document) {
    return parent.querySelector(selector);
  }

  static group(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  static id(idName) {
    return document.getElementById(idName);
  }
}
