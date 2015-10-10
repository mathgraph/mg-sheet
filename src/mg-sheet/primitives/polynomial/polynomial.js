define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_polynomial(coefficients, points, config, style) {
            var sheet, path, segments, segments1, segments2, calculateFunction, root, radius, eps, leftBorder, rightBorder,
                topBorder, bottomBorder, isPointInScope, serchSegment, p1, p2;
            sheet = this;
            radius = config && config.radius || defaultConfig.radius;
            eps = config && config.eps || defaultConfig.eps;
            eps = eps / radius;


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

            getStegments = function (points) {
                segments = [];
                points.forEach(function (point) {
                    var f, previousPoint, startPoint, circleFlag, x, y, roots, root1, root2;
                    f = function (t, point, radius) {
                        return calculateFunction(coefficients, point[0] + radius * Math.cos(t),
                            point[1] + radius * Math.sin(t));
                    };
                    startPoint = point;
                    circleFlag = false;
                    serchSegment = function (arr, point, radius, previousT, signLeft) {
                        var nextT, x, y, a, b;
                        a = previousT + eps;
                        b = previousT + 2 * Math.PI - eps;
                        signLeft = f((a) / 2, point, radius) > 0;
                        while (Math.abs(b - a) > eps) {
                            //if (f((b + a) / 2, point, radius) < 0 && signLeft || !signLeft && f((b + a) / 2, point, radius) > 0) {
                            if (f((b + a) / 2, point, radius) < 0 && signLeft || !signLeft && f((b + a) / 2, point, radius) > 0) {
                                a = (b + a) / 2;
                            } else {
                                b = (b + a) / 2;
                            }
                        }
                        nextT = (b + a) / 2;
                        if(kk++ < 3) console.log(point + "  " + nextT + " " +Math.cos(nextT))
                        x = point[0] + radius * Math.cos(nextT);
                        y = point[1] + radius * Math.sin(nextT);
                        if (utils.dist([x, y], startPoint) < radius * 0.7) {
                            circleFlag = true;
                            arr.push(startPoint);
                            console.log(x + "  " + y + "  " + startPoint)
                            console.log("OUT")
                            return arr;
                        }
                        point = [x, y];
                        arr.push(point);
                        if (isPointInScope(x, y)) {
                            serchSegment(arr, point, radius, nextT - Math.PI, signLeft);
                        }
                        return arr;
                    };

                    roots = root(f, point, radius * 2.0, [0, 2 * Math.PI], eps / radius);
                    //console.log("st");
                    //console.log(roots.length);
                    console.log(roots);
                    //root1 = roots.shift();
                    //root2 = roots.shift();
                    while (roots.length != 0) {
                        //console.log("START");
                        //console.log(segments);
                        root1 = roots.shift();
                        root2 = roots.shift();

                        x = point[0] + radius * Math.cos(root1);
                        y = point[1] + radius * Math.sin(root1);
                        kk = 0;
                        segments1 = serchSegment([point], [x, y], radius, root2 + Math.PI, f((root2 - root1) / 2, point, radius) < 0);

                        if (!circleFlag) {
                            x = point[0] + radius * Math.cos(root2);
                            y = point[1] + radius * Math.sin(root2);
                            kk = 0;
                            segments2 = serchSegment([point], [x, y], radius, root1 + Math.PI, f((root2 - root1) / 2, point, radius) > 0);
                            segments1.reverse();
                            segments1 = segments1.concat(segments2);

                            if (segments.length != 0 && !isPointInScope(segments[segments.length - 1][0],
                                    segments[segments.length - 1][1])) {
                                previousPoint = segments[segments.length - 1];
                                if (previousPoint[0] > rightBorder || previousPoint[1] > topBorder) {
                                    segments.push([rightBorder + sheet.width, topBorder + sheet.height]);
                                    if (segments1[0][0] < leftBorder + radius || segments1[0][1] < bottomBorder + radius) {
                                        segments.push([rightBorder + sheet.width, bottomBorder - sheet.height]);
                                        segments.push([leftBorder - sheet.width, bottomBorder - sheet.height]);
                                    }
                                } else if (previousPoint[0] < leftBorder || previousPoint[1] < bottomBorder) {
                                    segments.push([leftBorder - sheet.width, bottomBorder - sheet.height]);
                                    if (segments1[0][0] > rightBorder - radius || segments1[0][1] > topBorder - radius) {
                                        segments.push([leftBorder - sheet.width, topBorder + sheet.height]);
                                        segments.push([rightBorder + sheet.width, topBorder + sheet.height]);
                                    }
                                }
                            }
                        }
                        console.log(segments1)
                        //console.log(segments2[0])
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
                sheet: sheet
            };
        }
    }
})
;