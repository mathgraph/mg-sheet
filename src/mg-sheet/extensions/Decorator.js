define(['lodash', 'mg-sheet/extensions/Entity'], function (_, Entity) {

    Entity.decorators = {};

    Entity.initial(function () {
        var entity = this;

        _.forOwn(Entity.decorators, function (dec) {
            dec.decorate && dec.decorate(entity);
        });

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