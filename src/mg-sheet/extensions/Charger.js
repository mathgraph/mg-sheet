define(['lodash', 'mg-sheet/extensions/Entity', 'mg-sheet/extensions/Cursor'], function (_, Entity) {

    var Charger = {};

    Entity.initial(function () {
        var entity = this,
            charger = _(entity.sheet.charger);

        charger
            .filter({ target: 'entity' })
            .pluck('init')
            .filter(_.isFunction)
            .each(function (fn) {
                fn(entity);
            })
            .value();

        charger
            .filter({ target: entity.type })
            .pluck('init')
            .filter(_.isFunction)
            .each(function (fn) {
                fn(entity);
            })
            .value();

        entity.sheet.eventMap.forEach(function (eventName){
            entity.on(eventName, function (event) {
                charger
                    .filter({ enabled: true, target: 'entity' })
                    .pluck(eventName)
                    .filter(_.isFunction)
                    .each(function (fn) {
                        fn(entity);
                    })
                    .value();
                charger
                    .filter({ enabled: true, target: entity.type })
                    .pluck(eventName)
                    .filter(_.isFunction)
                    .each(function (fn) {
                        fn(entity);
                    })
                    .value();
            });
        })
    });

    return {
        name: 'Charger',
        type: 'extension',
        constructor: function () {
            var sheet = this;

            sheet.charger = {};
            _.forOwn(Charger, function (value) {
                sheet.use(value, true);
            });

            sheet.eventMap.forEach(function (eventName) {
                sheet.on(eventName, function (event) {
                    _.chain(sheet.charger)
                        .filter({ enabled: true, target: 'sheet' })
                        .pluck(eventName)
                        .each(function (fn) {
                            fn(sheet);
                        })
                        .value();
                });
            });
        },
        prototype: {
            use: function (control, enabled) {
                var sheet = this,
                    ctrl = Object.create(control),
                    $__enabled = false;

                sheet.charger[control.name] && console.warn('Charger: overriding control: ' + control.name);
                sheet.charger[control.name] = ctrl;
                ctrl.sheet = sheet;
                Object.defineProperty(ctrl, 'enabled', {
                    get: function () {
                        return $__enabled
                    },
                    set: function (v) {
                        $__enabled = !!v;
                        ctrl.mode === 'single' && $__enabled &&
                            _.chain(sheet.charger)
                                .filter({ mode: 'single', enabled: true })
                                .each(function (c) { c.enabled = false; })
                                .value();
                    },
                    enumerable: true,
                    configurable: false
                });
                ctrl.enabled = !!enabled;
                return ctrl;
            }
        },
        statics: {
            Charger: Charger,
            control: function (desc) {
                var Sheet = this;
                Charger[desc.name] && console.warn('Charger: overriding control: ' + desc.name);
                Charger[desc.name] = desc;
                return Sheet;
            }
        }
    }

});