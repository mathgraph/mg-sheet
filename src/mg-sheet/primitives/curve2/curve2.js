define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    var calculateX, calculateY, coefficientsEquals;

    coefficientsEquals = function (c1, c2) {
        return c1.A === c2.A && c1.B === c2.B && c1.C === c2.C && c1.D === c2.D && c1.E === c2.E && c1.F === c2.F;
    };

    calculateX = function (y, a, b, c, d, e, f) {
        var D, ae, be, ce;
        ae = a;
        be = c * y + d;
        ce = b * y * y + e * y + f;
        if (Math.abs(a) <= 0) {
            return [-(ce) / (be)];
        } else {
            D = Math.pow(be, 2) - 4 * ae * (ce);
            if (D > 0) {
                return [(-(be) + Math.sqrt(D)) / (2 * ae), (-(be) - Math.sqrt(D)) / (2 * ae)];
            } else if (Math.abs(D) < 0) {
                return [(-(be)) / (2 * ae)];
            }
        }
        return [];
    };
    calculateY = function (y, a, b, c, d, e, f) {
        return calculateX(y, b, a, c, e, d, f);
    };

    return {
        type: 'primitive',
        factory: function draw_curve2(coefficients, style) {
            var path, sheet = this,
                config = {
                    left: (sheet.center[0] - sheet.width / 2),
                    right: (sheet.center[0] + sheet.width / 2),
                    top: (sheet.center[1] + sheet.height / 2),
                    bottom: (sheet.center[1] - sheet.height / 2),
                    width: sheet.width,
                    height: sheet.height,
                    step: defaultConfig.step
                };

            function getArray (config, a, b, c, d, e, f) {
                var points, points1, points2, i, prePointsIsExist, prePointsIsVisible1, prePointsIsVisible2,
                    res, prePoint1, prePoint2;
                points = [];
                points1 = [];
                points2 = [];
                prePointsIsExist = false;
                prePointsIsVisible1 = false;
                prePointsIsVisible2 = false;
                prePoint1 = null;
                prePoint2 = null;

                for (i = config.left; i <= config.right; i += config.step) {
                    res = calculateY(i, a, b, c, d, e, f);
                    if (res.length > 0) {
                        if (res[0] < config.top && res[0] > config.bottom) {
                            !prePointsIsVisible1 && prePoint1 != null && points1.push([i - config.step, prePoint1]);
                            points1.push([i, res[0]]);
                            prePointsIsVisible1 = true;
                        } else {
                            prePoint1 = res[0];
                            prePointsIsVisible1 && points1.push([i, res[0]]);
                            prePointsIsVisible1 = false;
                        }
                        if (res.length === 2) {
                            if (res[1] < config.top && res[1] > config.bottom) {
                                !prePointsIsVisible2 && prePoint2 != null && points2.push([i - config.step, prePoint2]);
                                points2.push([i, res[1]]);
                                prePointsIsVisible2 = true;
                            } else {
                                prePoint2 = res[1];
                                prePointsIsVisible2 && points1.push([i, res[0]]);
                                prePointsIsVisible2 = false;
                            }
                        }
                        prePointsIsExist = true;
                    } else {
                        if (prePointsIsExist) {
                            points = points.concat(points1.concat(points2.reverse()));
                            points = utils.concatSegments(points, [points1[0].slice()], config);
                            points1 = [];
                            points2 = [];
                        }
                        prePointsIsExist = false;
                    }
                }
                points1 = utils.concatSegments(points2.reverse(), points1, config);
                points = utils.concatSegments(points, points1, config);
                return points;
            }
            function getSegments (coeff, config) {
                var res = getArray(config,
                    coeff.B, coeff.A, coeff.C, coeff.E, coeff.D, coeff.F);
                res.forEach(function (p) {
                    var k = p[0];
                    p[0] = p[1];
                    p[1] = k;
                });
                if (res.length < 15) {
                    res = getArray(config,
                        coeff.A, coeff.B, coeff.C, coeff.D, coeff.E, coeff.F);
                }
                return res;
            }

            path = new paper.Path({
                segments: getSegments(coefficients, config)
            });
            path.simplify();

            return {
                defaultStyle: defaultConfig.style,
                $__path: path,
                initialStyle: style,
                sheet: sheet,
                get coefficients() {
                    return coefficients
                },
                set coefficients(v) {
                    if (!coefficientsEquals(coefficients, v)) {
                        coefficients = v;
                        this.$__path.segments = getSegments(coefficients);
                        this.$__path.simplify();
                    }
                }
            }
        }
    }
});