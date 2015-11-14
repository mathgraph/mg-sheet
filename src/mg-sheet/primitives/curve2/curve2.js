define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    var calculateX, calculateY;
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
            } else if (Math.abs(D) < defaultConfig.deltaZero)
                return [(-(be)) / (2 * ae)];
        }
        return [];
    };
    calculateY = function (y, a, b, c, d, e, f) {
        return calculateX(y, b, a, c, e, d, f);
    };

    return {
        type: 'primitive',
        factory: function draw_curve2(parametrs, style) {
            var sheet, a, b, c, d, e, f, points, points1, points2, i, flag, path,
                leftBorderDrawing, rightBorderDrawing, topBorderDrawing, bottomBorderDrawing, previousPoint;
            sheet = this;
            leftBorderDrawing = (sheet.center[0] - sheet.width / 2) - 3 * defaultConfig.step;
            rightBorderDrawing = (sheet.center[0] + sheet.width / 2) + 3 * defaultConfig.step;
            topBorderDrawing = (sheet.center[1] + sheet.height / 2) + 3 * defaultConfig.step;
            bottomBorderDrawing = (sheet.center[1] - sheet.height / 2) - 3 * defaultConfig.step;
            a = parametrs.A;
            b = parametrs.B;
            c = parametrs.C;
            d = parametrs.D;
            e = parametrs.E;
            f = parametrs.F;
            points = [];
            points1 = [];
            points2 = [];
            flag = false;


            for (i = bottomBorderDrawing; i <= topBorderDrawing + defaultConfig.step; i += defaultConfig.step) {
                var res = calculateX(i, a, b, c, d, e, f);
                if (res.length > 0) {
                    if (res[0] < rightBorderDrawing && res[0] > leftBorderDrawing)
                        (points1.push([res[0], i]));
                    if (res.length === 2 && res[1] < rightBorderDrawing && res[1] > leftBorderDrawing)
                        points2.push([res[1], i]);
                    flag = true;
                } else {
                    if (flag && (points1.length !== 0 || points2.length !== 0)) {
                        points = points.concat(points1.concat(points2.reverse()));
                        points.push(points1[0]);
                        points1 = [];
                        points2 = [];
                    }
                    flag = false;
                }
            }
            if (points.length + points1.length + points2.length < 5) {
                points = [];
                points1 = [];
                points2 = [];
                for (i = leftBorderDrawing; i <= rightBorderDrawing + defaultConfig.step; i += defaultConfig.step) {
                    var res = calculateY(i, a, b, c, d, e, f);
                    if (res.length > 0) {
                        if (res[0] < topBorderDrawing && res[0] > bottomBorderDrawing)
                            (points1.push([i, res[0]]));
                        if (res.length === 2 && res[1] < topBorderDrawing && res[1] > bottomBorderDrawing)
                            points2.push([i, res[1]]);
                        flag = true;
                    } else {
                        if (flag && (points1.length !== 0 || points2.length !== 0)) {
                            points = points.concat(points1.concat(points2.reverse()));
                            points.push(points1[0]);
                            points1 = [];
                            points2 = [];
                        }
                        flag = false;
                    }
                }
            }

            if (flag && (points1.length !== 0 || points2.length !== 0)) {
                points1 = points1.reverse().concat(points2);
                points1.push(points1[0]);
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
            path = new paper.Path({
                segments: points
            });
            path.simplify();


            return {
                defaultStyle: defaultConfig.style,
                $__path: path,
                initialStyle: style,
                sheet: sheet
            }
        }
    }
});