define(['mg-sheet/utils'], function (utils) {

    var init = function (entity) {
        if (!utils.exists(entity.markers.selected)) {
            var __selected = false;
            var __defaultWidth = null;
            Object.defineProperty(entity.markers, 'selected', {
                get: function () {
                    return __selected
                },
                set: function (v) {
                    __selected = !!v;
                    if (__selected) {
                        __defaultWidth = entity.style.strokeWidth;
                        entity.style.strokeWidth += 3;
                    } else {
                        entity.style.strokeWidth = __defaultWidth;
                    }
                },
                configurable: false,
                enumerable: true
            });
        }
    };

    return {
        type: 'control',
        description: {
            name: 'select',
            mode: 'daemon',
            target: 'entity',
            click: function (entity) {
                init(entity);
                var val = entity.markers.selected;
                entity.sheet.filter(function (e) {
                    return e.markers.selected;
                }).forEach(function (e) {
                    e.markers.selected = false;
                });
                entity.markers.selected = !val;
                if (entity.markers.selected) {
                    entity.trigger('select');
                } else {
                    entity.trigger('unselect');
                }
            }
        }
    };

});