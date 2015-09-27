define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    var init = function (entity) {
        var $__highlighted;
        if (!utils.exists(entity.markers.highlighted)) {
            $__highlighted = false;
            Object.defineProperty(entity.markers, 'highlighted', {
                get: function () {
                    return $__highlighted
                },
                set: function (v) {
                    if (!!v === $__highlighted) {
                        return;
                    }
                    $__highlighted = !!v;
                    entity.switchStyle('highlighted', $__highlighted);
                }
            });
            entity.pushStyle('highlighted', defaultConfig.style);
        }
    };

    return {
        name: 'highlight',
        type: 'control',
        mode: 'daemon',
        target: 'entity',
        init: init,
        mouseEnter: function (entity) {
            entity.markers.highlighted = true;
        },
        mouseLeave: function (entity) {
            entity.markers.highlighted = false;
        }
    };

});