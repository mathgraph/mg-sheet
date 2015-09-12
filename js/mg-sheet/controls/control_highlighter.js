define(['mg-sheet/utils'], function (utils) {

    var init = function (entity) {
        if (!utils.exists(entity.markers.highlighted)) {
            var __highlighted = false;
            var __defaultWidth = null;
            var __defaultColor = null;
            Object.defineProperty(entity.markers, 'highlighted', {
                get: function () {
                    return __highlighted
                },
                set: function (v) {
                    __highlighted = !!v;
                    if (__highlighted) {
                        __defaultWidth = entity.style.strokeWidth;
                        __defaultColor = entity.style.strokeColor;
                        entity.style.strokeWidth += 2;
                        entity.style.strokeColor = 'blue';
                    } else {
                        entity.style.strokeWidth = __defaultWidth;
                        entity.style.strokeColor = __defaultColor;
                    }
                }
            });
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
            },
            mouseLeave: function (entity) {
                init(entity);
                entity.markers.highlighted = false;
            }
        }
    };

});