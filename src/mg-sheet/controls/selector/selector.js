define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    var init = function (entity) {
        var $__selected;

        if (!utils.exists(entity.markers.selected)) {
            $__selected = false;
            Object.defineProperty(entity.markers, 'selected', {
                get: function () {
                    return $__selected
                },
                set: function (v) {
                    if (!!v === $__selected) {
                        return;
                    }
                    $__selected = !!v;
                    $__selected ? entity.enableStyle('selected') : entity.disableStyle('selected');
                    entity.trigger($__selected ? 'select' : 'deselect');
                    entity.sheet.trigger($__selected ? 'select' : 'deselect', entity);
                    $__selected && entity.sheet.entities.forEach(function (e) {
                        e.markers.selected && (e !== entity) && (e.markers.selected = false)
                    })
                },
                configurable: false,
                enumerable: true
            });

            entity.pushStyle('selected', defaultConfig.style);
        }
    };

    return {
        name: 'select',
        type: 'control',
        mode: 'daemon',
        target: 'entity',
        click: function (entity) {
            init(entity);
            entity.markers.selected = !entity.markers.selected;
        }
    };

});