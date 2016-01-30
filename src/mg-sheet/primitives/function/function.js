define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    var addPoint, concatSegments, getSegments, previousOutsidePoint;

    addPoint = function (arr, a, b, func, config) {
        var newPoint = [b, func(b)],
            segment = arr[arr.length - 1],
            previousPoint = segment[segment.length - 1],
            previousInScope = previousPoint[1] < config.top && previousPoint[1] > config.bottom,
            currentInScope = newPoint[1] < config.top && newPoint[1] > config.bottom;
        if (utils.absDiff(previousPoint[1], newPoint[1]) > config.maxDy && (b - a) > config.minStep) {
            addPoint(arr, a, (b + a) / 2, func, config);
            addPoint(arr, (b + a) / 2, b, func, config);
        } else {
            if (!previousInScope && currentInScope) {
                segment = [previousOutsidePoint];
                arr.push(segment);
            }
            if (currentInScope || (previousInScope && !currentInScope)) {
                segment.push(newPoint);
            } else {
                previousOutsidePoint = newPoint;
            }
        }
    };
    getSegments = function (func, config) {
        var i = config.left - config.step,
            arr = [[[i, func(i)]]],
            result;
        for (; i < config.right; i += config.step) {
            addPoint(arr, i, i + config.step, func, config);
        }
        result = arr[0];
        for (i = 1; i < arr.length; i++) {
            result = utils.concatSegments(result, arr[i], config);
        }
        return result;
    };

    return {
        type: 'primitive',
        factory: function draw_function(func, style, config) {
            var sheet = this,
                path;
            if (typeof config === 'undefined') {
                config = {};
            }
            config.left = (sheet.center[0] - sheet.width / 2);
            config.right = (sheet.center[0] + sheet.width / 2);
            config.top = (sheet.center[1] + sheet.height / 2);
            config.bottom = (sheet.center[1] - sheet.height / 2);
            config.width = sheet.width;
            config.height = sheet.height;
            config.step = config.step || defaultConfig.step;
            config.maxDy = config.maxDy || defaultConfig.maxDy;
            config.minStep = config.minStep || defaultConfig.minStep;

            path = new paper.Path({
                segments: getSegments(func, config)
            });
            return {
                defaultStyle: defaultConfig.style,
                $__path: path,
                initialStyle: style,
                sheet: sheet,
                get func() {
                    return func
                },
                set func(v) {
                    if (func !== v) {
                        func = v;
                        this.$__path.segments = getSegments(func, config);
                        sheet.redraw();
                    }
                }
            }
        }
    }
});