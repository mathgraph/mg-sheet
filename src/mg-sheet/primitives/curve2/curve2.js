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
        if (Math.abs(a) <= defaultConfig.deltaZero) {
            return [-(ce) / (be)];
        } else {
            D = Math.pow(be, 2) - 4 * ae * (ce);
            if (D > defaultConfig.deltaZero) {
                return [(-(be) + Math.sqrt(D)) / (2 * ae), (-(be) - Math.sqrt(D)) / (2 * ae)];
            } else if (Math.abs(D) < defaultConfig.deltaZero) {
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
            var sheet, path, getSegments, getArray,
                leftBorderDrawing, rightBorderDrawing, topBorderDrawing, bottomBorderDrawing;
            sheet = this;
            leftBorderDrawing = (sheet.center[0] - sheet.width / 2);
            rightBorderDrawing = (sheet.center[0] + sheet.width / 2);
            topBorderDrawing = (sheet.center[1] + sheet.height / 2);
            bottomBorderDrawing = (sheet.center[1] - sheet.height / 2);


            getArray = function (begin, end, a, b, c, d, e, f) {
                var points, points1, points2, i, prePointsIsExist, prePointsIsVisible,
                    previousPoint, res, prePoint1, prePoint2;
                points = [];
                points1 = [];
                points2 = [];
                prePointsIsExist = false;
                prePointsIsVisible = false;
                prePoint1 = null;
                prePoint2 = null;

                for (i = begin; i <= end; i += defaultConfig.step) {
                    res = calculateX(i, a, b, c, d, e, f);
                    if (res.length > 0) {
                        if (res[0] < rightBorderDrawing && res[0] > leftBorderDrawing) {
                            !prePointsIsVisible && prePoint1 != null && points1.push([prePoint1, i - defaultConfig.step]);
                            points1.push([res[0], i]);
                            prePointsIsVisible = true;
                        } else {
                            prePointsIsVisible && points1.push([res[0], i]);
                            prePointsIsVisible = false;
                        }
                        if (res.length === 2) {
                            if (res[1] < rightBorderDrawing && res[1] > leftBorderDrawing) {
                                !prePointsIsVisible && prePoint2 != null && points2.push([prePoint2, i - defaultConfig.step]);
                                points2.push([res[1], i]);
                                prePointsIsVisible = true;
                            } else {
                                prePointsIsVisible && points1.push([res[0], i]);
                                prePointsIsVisible = false;
                            }
                        }
                        prePointsIsExist = true;
                    } else {
                        if (prePointsIsExist) {
                            points = points.concat(points1.concat(points2.reverse()));
                            points.push(points1[0]);
                            points1 = [];
                            points2 = [];
                        }
                        prePointsIsExist = false;
                    }
                }
                if (/*prePointsIsExist && */(points1.length !== 0 || points2.length !== 0)) {
                    points1 = points1.concat(points2.reverse());
                    if (points.length != 0) {
                        previousPoint = points[points.length - 1];
                        if (previousPoint[0] >= rightBorderDrawing || previousPoint[1] >= topBorderDrawing) {
                            points.push([rightBorderDrawing, topBorderDrawing]);
                            if (points1[0][0] <= leftBorderDrawing || points1[0][1] <= bottomBorderDrawing) {
                                points.push([rightBorderDrawing, bottomBorderDrawing]);
                                points.push([leftBorderDrawing, bottomBorderDrawing]);
                            }
                        } else if (previousPoint[0] <= leftBorderDrawing || previousPoint[1] <= bottomBorderDrawing) {
                            points.push([leftBorderDrawing, bottomBorderDrawing]);
                            if (points1[0][0] >= rightBorderDrawing || points1[0][1] >= topBorderDrawing) {
                                points.push([leftBorderDrawing, topBorderDrawing]);
                                points.push([rightBorderDrawing, topBorderDrawing]);
                            }
                        }
                    }
                    points = points.concat(points1);
                }
                return points;
            };
            getSegments = function (coeff) {
                var res = getArray(bottomBorderDrawing - 5 * defaultConfig.step, topBorderDrawing + 5 * defaultConfig.step,
                    coeff.A, coeff.B, coeff.C, coeff.D, coeff.E, coeff.F);
                if (res.length < 5) {
                    res = getArray(leftBorderDrawing - 5 * defaultConfig.step, rightBorderDrawing + 5 * defaultConfig.step,
                        coeff.B, coeff.A, coeff.C, coeff.E, coeff.D, coeff.F);
                    res.forEach(function (p) {
                        var k = p[0];
                        p[0] = p[1];
                        p[1] = k;
                    });
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