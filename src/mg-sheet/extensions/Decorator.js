define(['lodash', 'mg-sheet/extensions/Entity'], function (_, Entity) {

    Entity.decorators = {};

    Entity.initial(function () {
        var entity = this;

        _.forOwn(Entity.decorators, function (dec) {
            dec.decorate && dec.decorate(entity);
        });

    });

    var funcMap = ['show', 'hide', 'remove'];
    funcMap.forEach(function (f) {
        Entity.statics.Entity[f] = _.flow(Entity.statics.Entity[f], function () {
            var entity = this;
            _.forOwn(Entity.decorators, function (dec) {
                dec[f] && dec[f](entity);
            });
            return entity;
        })
    });

    return {
        name: 'Decorator',
        type: 'extension',
        constructor: function () {},
        prototype: {},
        statics: {
            decorator: function (desc) {
                Entity.decorators[desc.name] = desc;
            }
        }
    }

});