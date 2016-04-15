'use strict';
/**
 * AWS APIG Model definition.
 */
module.exports = function(S) {

  const _          = require('lodash'),
        BbPromise  = require('bluebird');

  class Models extends S.classes.Serializer {

    constructor(data, filePath) {
      super();

      this._class = 'Models';
      this._filePath = filePath;

      if (data) this.fromObject(data);
    }

    load() {
      return this.deserialize(this);
    }

    save() {
      return this.serialize(this);
    }

  }

  return Models;
}
