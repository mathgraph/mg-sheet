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
            var sheet, path, getSegments, getArray, connectSegments,
                leftBorderDrawing, rightBorderDrawing, topBorderDrawing, bottomBorderDrawing;
            sheet = this;
            leftBorderDrawing = (sheet.center[0] - sheet.width / 2);
            rightBorderDrawing = (sheet.center[0] + sheet.width / 2);
            topBorderDrawing = (sheet.center[1] + sheet.height / 2);
            bottomBorderDrawing = (sheet.center[1] - sheet.height / 2);

            connectSegments = function (left, right, bottom, top, s1, s2) {
                var previousPoint;
                if (s1.length != 0 && s2.length != 0) {
                    previousPoint = s1[s1.length - 1];
                    if (previousPoint[0] >= right - 5 * defaultConfig.step || previousPoint[1] >= top - 5 * defaultConfig.step) {
                        s1.push([right, top]);
                        if (s2[0][0] <= left + 5 * defaultConfig.step || s2[0][1] <= bottom + 5 * defaultConfig.step) {
                            s1.push([right, bottom]);
                            s1.push([left, bottom]);
                        }
                    } else if (previousPoint[0] <= left + 5 * defaultConfig.step || previousPoint[1] <= bottom + 5 * defaultConfig.step) {
                        s1.push([left, bottom]);
                        if (s2[0][0] >= right - 5 * defaultConfig.step || s2[0][1] >= top - 5 * defaultConfig.step) {
                            s1.push([left, top]);
                            s1.push([right, top]);
                        }
                    }
                }
                return s1.concat(s2);
            };

            getArray = function (left, right, bottom, top, a, b, c, d, e, f) {
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

                for (i = left; i <= right; i += defaultConfig.step) {
                    res = calculateY(i, a, b, c, d, e, f);
                    if (res.length > 0) {
                        if (res[0] < top && res[0] > bottom) {
                            !prePointsIsVisible1 && prePoint1 != null && points1.push([i - defaultConfig.step, prePoint1]);
                            points1.push([i, res[0]]);
                            prePointsIsVisible1 = true;
                        } else {
                            prePoint1 = res[0];
                            prePointsIsVisible1 && points1.push([i, res[0]]);
                            prePointsIsVisible1 = false;
                        }
                        if (res.length === 2) {
                            if (res[1] < top && res[1] > bottom) {
                                !prePointsIsVisible2 && prePoint2 != null && points2.push([i - defaultConfig.step, prePoint2]);
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
                            points = connectSegments(left, right, bottom, top, points, [points1[0].slice()]);
                            points1 = [];
                            points2 = [];
                        }
                        prePointsIsExist = false;
                    }
                }
                points1 = connectSegments(left, right, bottom, top, points2.reverse(), points1);
                points = connectSegments(left, right, bottom, top, points, points1);
                return points;
            };
            getSegments = function (coeff) {
                var res = getArray(bottomBorderDrawing - 5 * defaultConfig.step, topBorderDrawing + 5 * defaultConfig.step,
                    leftBorderDrawing - 5 * defaultConfig.step, rightBorderDrawing + 5 * defaultConfig.step,
                    coeff.B, coeff.A, coeff.C, coeff.E, coeff.D, coeff.F);
                res.forEach(function (p) {
                    var k = p[0];
                    p[0] = p[1];
                    p[1] = k;
                });
                if (res.length < 15) {
                    res = getArray(leftBorderDrawing - 5 * defaultConfig.step, rightBorderDrawing + 5 * defaultConfig.step,
                        bottomBorderDrawing - 5 * defaultConfig.step, topBorderDrawing + 5 * defaultConfig.step,
                        coeff.A, coeff.B, coeff.C, coeff.D, coeff.E, coeff.F);
                }
                return res;
            };

            path = new paper.Path({
                segments: getSegments(coefficients)
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