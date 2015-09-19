define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    var init = function (entity) {
        var $__highlighted,
            $__defaultWidth,
            $__defaultColor;

        if (!utils.exists(entity.markers.highlighted)) {
            $__highlighted = false;
            $__defaultWidth = null;
            $__defaultColor = null;
            Object.defineProperty(entity.markers, 'highlighted', {
                get: function () {
                    return $__highlighted
                },
                set: function (v) {
                    $__highlighted = !!v;
                    if ($__highlighted) {
                        $__defaultWidth = entity.style.strokeWidth;
                        $__defaultColor = entity.style.strokeColor;
                        entity.style.strokeWidth += 2;
                        entity.style.strokeColor = 'blue';
                    } else {
                        entity.style.strokeWidth = $__defaultWidth;
                        entity.style.strokeColor = $__defaultColor;
                    }
                }
            });

            entity.pushStyle('highlighted', defaultConfig.style);
        }
    };

    return {
        type: 'control',
        description: {
            name: 'highlight',
            mode: 'daemon',
            target: 'entity',
            mouseEnter: function (entity) {
                init(entity);
                entity.markers.highlighted = true;
                entity.enableStyle('highlighted');
            },
            mouseLeave: function (entity) {
                init(entity);
                entity.markers.highlighted = false;
                entity.disableStyle('highlighted');
            }
        }
    };

});