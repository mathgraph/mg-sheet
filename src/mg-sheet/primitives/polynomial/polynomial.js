define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_polynomial(coefficients, points, config, style) {
            var sheet, path, segments, calculateFunction, root, radius, eps, leftBorder, rightBorder, topBorder, bottomBorder, isPointInScope;
            sheet = this;
            radius = config && config.radius || defaultConfig.radius;
            eps = config && config.eps || defaultConfig.eps;


            leftBorder = (sheet.center[0] - sheet.width / 2);
            rightBorder = (sheet.center[0] + sheet.width / 2);
            topBorder = (sheet.center[1] + sheet.height / 2);
            bottomBorder = (sheet.center[1] - sheet.height / 2);

            isPointInScope = function (x, y) {
                return x > leftBorder && x < rightBorder && y > bottomBorder && y < topBorder
            };

            calculateFunction = function (coefficients, x, y) {
                var res = 0;
                coefficients.forEach(function (coeff) {
                    res += coeff[0] * Math.pow(x, coeff[1]) * Math.pow(y, coeff[2]);
                });
                return res;
            };

            root = function (func, interval, eps) {
                var i, res, pft, nft;
                res = [];
                pft = func(interval[0]);
                for (i = interval[0] + eps; i < interval[1]; i += eps) {
                    nft = func(i);
                    if (pft > 0 ^ nft > 0) {
                        res.push(i - eps / 2);
                    }
                    pft = nft;
                }
                nft = func(interval[1]);
                if (pft > 0 ^ nft > 0) {
                    res.push(i - eps / 2);
                }
                return res;
            };


            segments = [];
            points.forEach(function (point) {
                var f, roots, currentPoint, previousPoint, nextPoint, pointIsFoundInScope, x, y;
                if (segments.length != 0 && !isPointInScope(segments[segments.length - 1][0], segments[segments.length - 1][1])) {
                    previousPoint = segments[segments.length - 1];
                    if (previousPoint[0] > rightBorder || previousPoint[1] > topBorder) {
                        segments.push([rightBorder + sheet.width, topBorder + sheet.height]);
                        if (point[0] < rightBorder - eps || point[1] < topBorder + eps) {
                            segments.push([rightBorder + sheet.width, bottomBorder - sheet.height]);
                            segments.push([leftBorder - sheet.width, bottomBorder - sheet.height]);
                        }
                    } else if (previousPoint[0] < leftBorder || previousPoint[1] < bottomBorder) {
                        segments.push([leftBorder - sheet.width, bottomBorder - sheet.height]);
                        if (point[0] > rightBorder - eps || point[1] > topBorder - eps) {
                            segments.push([leftBorder - sheet.width, topBorder + sheet.height]);
                            segments.push([rightBorder + sheet.width, topBorder + sheet.height]);
                        }
                    }

                }

                currentPoint = point;
                previousPoint = point;
                segments.push(point);
                do {
                    f = function (t) {
                        return calculateFunction(coefficients, currentPoint[0] + radius * Math.sin(t), currentPoint[1] + radius * Math.cos(t));
                    };
                    pointIsFoundInScope = false;
                    root(f, [0, 2 * Math.PI], eps / radius).forEach(function (t) {
                        x = currentPoint[0] + radius * Math.sin(t);
                        y = currentPoint[1] + radius * Math.cos(t);
                        if (Math.sqrt(Math.pow(previousPoint[0] - x, 2) + Math.pow(previousPoint[1] - y, 2)) > 4 * eps && !pointIsFoundInScope) {
                            nextPoint = [x, y];
                            if (isPointInScope(x, y)) {
                                pointIsFoundInScope = true;
                            }
                        }
                    });
                    segments.push(nextPoint);
                    previousPoint = currentPoint;
                    currentPoint = nextPoint;
                } while (Math.sqrt(Math.pow(currentPoint[0] - point[0], 2) + Math.pow(currentPoint[1] - point[1], 2)) > radius * 0.75 &&
                pointIsFoundInScope && currentPoint != previousPoint);
                if (Math.sqrt(Math.pow(currentPoint[0] - point[0], 2) + Math.pow(currentPoint[1] - point[1], 2)) < radius * 0.75) {
                    segments.push(point);
                }
            });


            path = new paper.Path({
                segments: segments
            });
            path.simplify();

            return {
                defaultStyle: defaultConfig.style,
                initialStyle: style,
                $__path: path,
                get style() {
                    return this.$__path.style
                },
                get type() {
                    return 'polynomial';
                },
                sheet: sheet
            };
        }
    }
});