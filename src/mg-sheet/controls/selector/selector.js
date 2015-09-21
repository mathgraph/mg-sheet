define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    var init = function (entity) {
        var $__selected,
            $__defaultWidth;

        if (!utils.exists(entity.markers.selected)) {
            $__selected = false;
            $__defaultWidth = null;
            Object.defineProperty(entity.markers, 'selected', {
                get: function () {
                    return $__selected
                },
                set: function (v) {
                    $__selected = !!v;
                    if ($__selected) {
                        $__defaultWidth = entity.style.strokeWidth;
                        entity.style.strokeWidth += 3;
                    } else {
                        entity.style.strokeWidth = $__defaultWidth;
                    }
                },
                configurable: false,
                enumerable: true
            });

            entity.pushStyle('selected', defaultConfig.style);
        }
    };

    return {
        type: 'control',
        description: {
            name: 'select',
            mode: 'daemon',
            target: 'entity',
            click: function (entity) {
                var val;

                init(entity);

                val = entity.markers.selected;
                entity.sheet.filter(function (e) {
                    return e.markers.selected;
                }).forEach(function (e) {
                    e.markers.selected = false;
                    e.disableStyle('selected');
                });
                entity.markers.selected = !val;
                if (entity.markers.selected) {
                    entity.trigger('select');
                    entity.sheet.trigger('select', entity);
                    entity.enableStyle('selected');
                } else {
                    entity.trigger('deselect');
                    entity.sheet.trigger('deselect', entity);
                    entity.disableStyle('selected');
                }

            }
        }
    };

});