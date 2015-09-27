define(['lodash', '../utils/common'], function (_, utils) {

    var initials = [];

    return {
        name: 'Entity',
        type: 'extension',
        constructor: function () {
            var sheet = this;
            sheet.entities = [];
        },
        prototype: {
            filter: function (condition) {
                var sheet = this;
                return _.filter(sheet.entities, condition);
            },
            remove: function (entity) {
                var sheet = this;
                entity.remove();
                return sheet;
            }
        },
        initial: function (fn) {
            var ext = this;
            initials.push(fn);
            return ext;
        },
        statics: {
            initials: initials,
            Entity: {
                $__initialized: false,
                init: function () {
                    var entity = this;
                    if (entity.$__initialized) {
                        return;
                    }
                    utils.events(entity);
                    entity.sheet.entities.push(entity);
                    entity.$__path && (entity.$__path.$__entity = entity);
                    entity.markers = {};
                    initials.forEach(function (fn) {
                        fn.call(entity);
                    });
                    entity.sheet.redraw();
                    return entity;
                },
                remove: function () {
                    var entity = this;
                    entity.$__path && entity.$__path.remove();
                    _.pull(sheet.entities, entity);
                    return entity;
                },
                hide: function () {
                    var entity = this;
                    entity.$__path && entity.$__path.hide();
                    return entity;
                },
                show: function () {
                    var entity = this;
                    entity.$__path && entity.$__path.show();
                    return entity;
                },
                markers: {},
                set: function (name, val) {
                    var entity = this;
                    entity[name] = val;
                    return entity;
                }
            },
            primitive: function (desc) {
                var Sheet = this,
                    factory = desc.factory;

                Sheet.prototype[factory.name] = function () {
                    var sheet = this,
                        entity;
                    sheet.$__project.activate();
                    entity = factory.apply(sheet, arguments);
                    _.merge(entity, Sheet.Entity);
                    Object.defineProperty(entity, 'id', {
                        value: +_.uniqueId(),
                        writable: false,
                        configurable: false,
                        enumerable: true
                    });
                    entity.init();
                    return entity;
                }
            }
        }

    };
});