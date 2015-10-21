define(['mg-sheet/utils/common', 'lodash', './config', 'mg-sheet/primitives/polynomial/config'],
        function (utils, _, defaultConfig, configPolynomial) {


    function rootsOfQuadraticEquation(a, b, c, leftLimit, rightLiit) {
        var d, roots = [];
        if (a === 0) {
            b !== 0 && roots.push(-c / b);
        } else {
            d = Math.sqrt(b * b - 4 * a * c);
            if (d > 0) {
                roots.push((-b + d) / (2 * a));
                roots.push((-b - d) / (2 * a));
            } else if (d === 0) {
                roots.push(-b / (2 * a));
            }
        }
        typeof leftLimit !== "undefined" && (roots = _.filter(roots, function (i) {
            return i >= leftLimit;
        }));
        typeof rightLiit !== "undefined" && (roots = _.filter(roots, function (i) {
            return i <= rightLiit;
        }));
        return roots;
    }
    function getPolynomialCoefficients(eq) {
        var res = [];
        eq.A && res.push([eq.A, 2, 0]);
        eq.B && res.push([eq.B, 0, 2]);
        eq.C && res.push([eq.C, 1, 1]);
        eq.D && res.push([eq.D, 1, 0]);
        eq.E && res.push([eq.E, 0, 1]);
        eq.F && res.push([eq.F, 0, 0]);
        return res;
    }

    return {
        type: 'primitive',
        factory: function draw_curve2(coefficients, style) {
            var sheet, polynomial, leftBorderDrawing, rightBorderDrawing, topBorderDrawing, bottomBorderDrawing,
                a, b, c, d, e, f, x, y, points, p1, p2, D, Delta, startRadius;
            sheet = this;

            function isPointInScope(x, y) {
                return x > leftBorderDrawing && x < rightBorderDrawing
                    && y > bottomBorderDrawing && y < topBorderDrawing
            }
            function getPolynomial(eq) {
                a = eq.A || 0;
                b = eq.B || 0;
                c = eq.C || 0;
                d = eq.D || 0;
                e = eq.E || 0;
                f = eq.F || 0;
                D = a * b - c * c;
                Delta = a * b * f + (c * e * d - b * d * d - a * e * e - f * c * c) / 4;

                points = [];
                if (Delta === 0 && D < 0) {
                    x = rootsOfQuadraticEquation(c * c - 4 * a * b, 2 * c * e - 4 * b * d, e * e - 4 * b * f)[0];
                    y = -(c * x + e) / (2 * b);
                    points.push([x, y]);
                    startRadius = Math.max(Math.abs(a / b), Math.abs(b / a));
                    if (isPointInScope(x, y)) {
                        return sheet.draw_polynomial(getPolynomialCoefficients(eq),
                            points, {startRadiusFactor: startRadius});
                    }
                }

                x = leftBorderDrawing;
                p1 = rootsOfQuadraticEquation(b, c * x + e, a * x * x + d * x + f, bottomBorderDrawing, topBorderDrawing);
                p1.forEach(function (y) {
                    points.push([x, y]);
                });
                x = rightBorderDrawing;
                p1 = rootsOfQuadraticEquation(b, c * x + e, a * x * x + d * x + f, bottomBorderDrawing, topBorderDrawing);
                p1.forEach(function (y) {
                    points.push([x, y]);
                });
                y = topBorderDrawing;
                p1 = rootsOfQuadraticEquation(a, c * y + d, b * y * y + e * y + f, leftBorderDrawing, rightBorderDrawing);
                p1.forEach(function (x) {
                    points.push([x, y]);
                });
                y = bottomBorderDrawing;
                p1 = rootsOfQuadraticEquation(a, c * y + d, b * y * y + e * y + f, leftBorderDrawing, rightBorderDrawing);
                p1.forEach(function (x) {
                    points.push([x, y]);
                });

                if (points.length === 0 && Delta * (a + b) < 0 && D > 0) {
                    if (c === 0) {
                        y = -e / (2 * b);
                        x = -d / (2 * a);
                    } else {
                        y = ( -d + 2 * a * e / c) / (c - 4 * a * b / c);
                        x = ( -e + 2 * b * d / c) / (c - 4 * a * b / c);
                    }
                    p1 = rootsOfQuadraticEquation(a, c * y + d, b * y * y + e * y + f, leftBorderDrawing, rightBorderDrawing);
                    p2 = rootsOfQuadraticEquation(b, c * x + e, a * x * x + d * x + f, bottomBorderDrawing, topBorderDrawing);
                    points.push([p1[0], y]);
                    if (Math.abs(p1[0] - p1[1]) < configPolynomial.radius * 5) {
                        configPolynomial.radius = Math.abs(p1[0] - p1[1]) / 10;
                    }
                    if (Math.abs(p2[0] - p2[1]) < configPolynomial.radius * 5) {
                        configPolynomial.radius = Math.abs(p2[0] - p2[1]) / 10;
                    }
                }
                return sheet.draw_polynomial(getPolynomialCoefficients(eq), points, configPolynomial);
            }

            leftBorderDrawing = sheet.center[0] - sheet.width / 2;
            rightBorderDrawing = sheet.center[0] + sheet.width / 2;
            topBorderDrawing = sheet.center[1] + sheet.height / 2;
            bottomBorderDrawing = sheet.center[1] - sheet.height / 2;

            polynomial = getPolynomial(coefficients);


            return {
                defaultStyle: defaultConfig.style,
                initialStyle: style,
                $__path: polynomial.$__path,
                get style() {
                    return this.$__path.style
                },
                get type() {
                    return 'polynomial';
                },
                get coefficients (){
                    return coefficients;
                },
                set coefficients (eq){
                    polynomial = getPolynomial(eq);
                    $__path = polynomial
                },
                sheet: sheet
            };
        }
    }
})
;