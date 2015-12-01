define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    var addPoint, concatSegments, getSegments, previousOutsidePoint;

    addPoint = function (arr, a, b, func, config) {
        var newPoint = [b, func(b)],
            segment = arr[arr.length - 1],
            previousPoint = segment[segment.length - 1],
            previousIsAbove = previousPoint[1] > config.top,
            previousIsBelow = previousPoint[1] < config.bottom,
            currentIsAbove, currentIsBelow;
        if (newPoint[1] === Infinity || newPoint[1] === -Infinity || isNaN(newPoint[1])) {
            b -= config.shiftInfinity;
            newPoint = [b, func(b)];
        }
        currentIsAbove = newPoint[1] > config.top;
        currentIsBelow = newPoint[1] < config.bottom;
        if (utils.absDiff(previousPoint[1], newPoint[1]) > config.maxDy && (b - a) > config.minStep) {
            addPoint(arr, a, (b + a) / 2, func, config);
            addPoint(arr, (b + a) / 2, b, func, config);
        } else {
            if (!currentIsBelow && previousIsBelow || !currentIsAbove && previousIsAbove) {
                segment.push(previousOutsidePoint);
            }
            if (currentIsAbove && previousIsBelow || currentIsBelow && previousIsAbove) {
                segment = [newPoint];
                arr.push(segment);
            }
            if (currentIsBelow && previousIsBelow || currentIsAbove && previousIsAbove) {
                previousOutsidePoint = newPoint;
            } else {
                segment.push(newPoint);
            }
        }
    };
    concatSegments = function (s1, s2, config) {
        var previousPoint;
        if (s1.length != 0 && s2.length != 0) {
            previousPoint = s1[s1.length - 1];
            if (previousPoint[0] >= config.right - 5 * config.step || previousPoint[1] >= config.top - 5 * config.step) {
                s1.push([config.right + config.width, config.top + config.height]);
                if (s2[0][0] <= config.left + 5 * config.step || s2[0][1] <= config.bottom + 5 * config.step) {
                    s1.push([config.right + config.width, config.bottom - config.height]);
                    s1.push([config.left - config.width, config.bottom - config.height]);
                }
            } else if (previousPoint[0] <= config.left + 5 * config.step || previousPoint[1] <= config.bottom + 5 * config.step) {
                s1.push([config.left - config.width, config.bottom - config.height]);
                if (s2[0][0] >= config.right - 5 * config.step || s2[0][1] >= config.top - 5 * config.step) {
                    s1.push([config.left - config.width, config.top + config.height]);
                    s1.push([config.right + config.width, config.top + config.height]);
                }
            }
        }
        return s1.concat(s2);
    };
    getSegments = function (func, config) {
        var i = config.left,
            arr = [[[i, func(i)]]],
            result;
        for (; i < config.right; i += config.step) {
            addPoint(arr, i, i + config.step, func, config);
        }
        result = arr[0];
        for (i = 1; i < arr.length; i++) {
            result = concatSegments(result, arr[i], config);
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
            config.minStep = config.minStep || defaultConfig.minStep || config.step / 100;
            config.shiftInfinity = config.shiftInfinity || defaultConfig.shiftInfinity || config.step / 1000;

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