define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    function arrayDeepEquals(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        var result = true;
        arr1.forEach(function (item, i) {
            if (arr1[i].length !== arr2[i].length) {
                result = false;
            }
            item.forEach(function (item, j) {
                if (arr1[i][j] !== arr2[i][j]) {
                    result = false;
                }
            })
        });
        return result;
    }

    return {
        type: 'primitive',
        factory: function draw_polynomial(coefficients, points, config, style) {
            var sheet, path, segments, segments1, segments2, calculateFunction, root, radius, eps, startRadius,
                leftBorderDrawing, rightBorderDrawing, topBorderDrawing, bottomBorderDrawing,
                isPointInScope, serchSegment, setConfig, f;
            sheet = this;

            setConfig = function (config) {
                radius = config && config.radius || defaultConfig.radius;
                eps = config && config.eps || defaultConfig.eps;
                eps = eps / (radius * 2 * Math.PI);
                startRadius = radius * (config && config.startRadiusFactor || defaultConfig.startRadiusFactor);
            };

            setConfig(config);
            leftBorderDrawing = (sheet.center[0] - sheet.width / 2) - 2 * radius;
            rightBorderDrawing = (sheet.center[0] + sheet.width / 2) + 2 * radius;
            topBorderDrawing = (sheet.center[1] + sheet.height / 2) + 2 * radius;
            bottomBorderDrawing = (sheet.center[1] - sheet.height / 2) - 2 * radius;

            isPointInScope = function (x, y) {
                return x > leftBorderDrawing && x < rightBorderDrawing
                    && y > bottomBorderDrawing && y < topBorderDrawing
            };

            calculateFunction = function (coefficients, x, y) {
                var res = 0;
                coefficients.forEach(function (coeff) {
                    res += coeff[0] * Math.pow(x, coeff[1]) * Math.pow(y, coeff[2]);
                });
                return res;
            };

            root = function (func, point, radius, interval, eps) {
                var i, res, pft, nft;
                res = [];
                pft = func(interval[0], point, radius);
                for (i = interval[0] + eps; i < interval[1]; i += eps) {
                    nft = func(i, point, radius);
                    if (pft > 0 ^ nft > 0) {
                        res.push(i - eps / 2);
                    }
                    pft = nft;
                }
                nft = func(interval[1], point, radius);
                if (pft > 0 ^ nft > 0) {
                    res.push(i - eps / 2);
                }
                return res;
            };

            f = function (t, point, radius) {
                return calculateFunction(coefficients, point[0] + radius * Math.cos(t),
                    point[1] + radius * Math.sin(t));
            };

            serchSegment = function (arr, point, radius, previousT, startPoint) {
                var nextT, x, y, a, b, signLeft, circleFlag;
                a = previousT + Math.PI / 3;// + eps;
                b = previousT + 2 * Math.PI - Math.PI / 3;// + eps;
                signLeft = f(a, point, radius) > 0;
                while (Math.abs(b - a) > eps) {
                    if (f((b + a) / 2, point, radius) < 0 && signLeft || !signLeft
                        && f((b + a) / 2, point, radius) > 0) {

                        b = (b + a) / 2;
                    } else {
                        a = (b + a) / 2;
                    }
                }
                nextT = (b + a) / 2;
                x = point[0] + radius * Math.cos(nextT);
                y = point[1] + radius * Math.sin(nextT);
                if (utils.dist([x, y], startPoint) < radius * 0.7) {
                    circleFlag = true;
                    arr.push(startPoint);
                    return arr;
                }
                point = [x, y];
                arr.push(point);
                if (isPointInScope(x, y)) {
                    serchSegment(arr, point, radius, nextT - Math.PI, startPoint);
                }
                return arr;
            };

            getStegments = function (points) {
                segments = [];
                points.forEach(function (point) {
                    var  previousPoint, startPoint, circleFlag, x, y, roots1, roots2, root1, root2;
                    startPoint = point;
                    circleFlag = false;
                    roots1 = root(f, point, startRadius, [0, 2 * Math.PI], eps);
                    roots2 = roots1.slice(roots1.length / 2);
                    roots1 = roots1.slice(0, roots1.length / 2);
                    while (roots1.length != 0) {
                        root1 = roots1.shift();
                        root2 = roots2.shift();
                        x = point[0] + startRadius * Math.cos(root1);
                        y = point[1] + startRadius * Math.sin(root1);
                        segments1 = serchSegment([point, [x, y]], [x, y], radius, root1 + Math.PI, startPoint);
                        if (!circleFlag) {
                            x = point[0] + startRadius * Math.cos(root2);
                            y = point[1] + startRadius * Math.sin(root2);
                            segments2 = serchSegment([point, [x, y]], [x, y], radius, root2 + Math.PI, startPoint);
                            segments1.reverse();
                            segments1 = segments1.concat(segments2);

                            if (segments.length != 0 && !isPointInScope(segments[segments.length - 1][0],
                                    segments[segments.length - 1][1])) {
                                previousPoint = segments[segments.length - 1];
                                if (previousPoint[0] > rightBorderDrawing || previousPoint[1] > topBorderDrawing) {
                                    segments.push([rightBorderDrawing + sheet.width, topBorderDrawing + sheet.height]);
                                    if (segments1[0][0] < leftBorderDrawing + radius || segments1[0][1] < bottomBorderDrawing + radius) {
                                        segments.push([rightBorderDrawing + sheet.width, bottomBorderDrawing - sheet.height]);
                                        segments.push([leftBorderDrawing - sheet.width, bottomBorderDrawing - sheet.height]);
                                    }
                                } else if (previousPoint[0] < leftBorderDrawing || previousPoint[1] < bottomBorderDrawing) {
                                    segments.push([leftBorderDrawing - sheet.width, bottomBorderDrawing - sheet.height]);
                                    if (segments1[0][0] > rightBorderDrawing - radius || segments1[0][1] > topBorderDrawing - radius) {
                                        segments.push([leftBorderDrawing - sheet.width, topBorderDrawing + sheet.height]);
                                        segments.push([rightBorderDrawing + sheet.width, topBorderDrawing + sheet.height]);
                                    }
                                }
                            }
                        } else {
                            segments1.push([x, y])
                        }
                        segments = segments.concat(segments1);
                    }
                });
                return segments;
            };


            path = new paper.Path({
                segments: getStegments(points)
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
                get coefficients() {
                    return coefficients;
                },
                $__changed: false,
                set coefficients(c) {
                    if (!arrayDeepEquals(coefficients, c)) {
                        coefficients = c;
                        this.$__changed = true;
                    }
                },
                get points() {
                    return points;
                },
                set points(c) {
                    points = c;
                },
                $__inprogress: false,
                recalc: function () {
                    if (this.$__inprogress) {
                        return;
                    }
                    if (!this.$__changed) {
                        return;
                    }
                    this.$__inprogress = true;
                    this.$__path.segments = getStegments(points);
                    this.$__path.simplify();
                    this.$__inprogress = false;
                    this.$__changed = false;
                    return this;
                },
                get config() {
                    return config;
                },
                set config(c) {
                    config = c;
                    setConfig(config);
                    this.$__path.segments = getStegments(points);
                    this.$__path.simplify();
                },
                sheet: sheet
            };
        }
    }
})
;