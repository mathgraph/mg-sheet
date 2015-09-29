define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_parametric(fx, fy, interval, endPoints, dt, style) {
            var sheet, path, fr, fxMemoizeLinear, fyMemoizeLinear, fxMemoizeNotLinear, fyMemoizeNotLinear;
            sheet = this;
            fr = function (t) {
                return 1 / t;
            };
            fxMemoizeLinear = _.memoize(fx);
            fyMemoizeLinear = _.memoize(fy);
            fxMemoizeNotLinear = _.memoize(_.flow(fr, fx));
            fyMemoizeNotLinear = _.memoize(_.flow(fr, fy));

            dt = dt || defaultConfig.dt;

            function calculatePoints(fx, fy, interval, endPoints, dt) {
                var leftBorder, rightBorder, topBorder, bottomBorder, points, d, fxt, fyt, t;
                d = 1.1;
                points = [];

                leftBorder = (sheet.center[0] - sheet.width / 2) * d;
                rightBorder = (sheet.center[0] + sheet.width / 2) * d;
                topBorder = (sheet.center[1] + sheet.height / 2) * d;
                bottomBorder = (sheet.center[1] - sheet.height / 2) * d;

                if (interval[0] == Number.NEGATIVE_INFINITY || interval[1] == Number.POSITIVE_INFINITY ||
                    (interval[1] - interval[0]) / dt > defaultConfig.maxPoints) {
                    dt = 1 / defaultConfig.maxPoints;
                    fx = fxMemoizeNotLinear;
                    fy = fyMemoizeNotLinear;
                    interval = [0, 1]
                } else {
                    fx = fxMemoizeLinear;
                    fy = fyMemoizeLinear;
                }
                for (t = interval[0] + (!endPoints[0] && dt); t < interval[1]; t += dt) {
                    fxt = fx(t);
                    fyt = fy(t);
                    fxt > leftBorder && fxt < rightBorder && fyt > bottomBorder && fyt < topBorder && points.push([fxt, fyt]);
                }
                fxt = fx(interval[1]);
                fyt = fy(interval[1]);
                endPoints[1] && fxt > leftBorder && fxt < rightBorder && fyt > bottomBorder && fyt < topBorder && points.push([fxt, fyt]);
                return points;
            }

            path = new paper.Path({
                segments: calculatePoints(fx, fy, interval, endPoints, dt)
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
                    return 'parametric';
                },
                get fx() {
                    return fx;
                },
                get fy() {
                    return fy;
                },
                set fx(f) {
                    fx = f;
                    fxMemoizeLinear = _.memoize(fx);
                    fxMemoizeNotLinear = _.memoize(_.flow(fr, fx));
                    this.$__path.segments = calculatePoints(fx, fy, interval, endPoints, dt);
                    this.$__path.simplify();
                },
                set fy(f) {
                    fy = f;
                    fyMemoizeLinear = _.memoize(fy);
                    fyMemoizeNotLinear = _.memoize(_.flow(fr, fy));
                    this.$__path.segments = calculatePoints(fx, fy, interval, endPoints, dt);
                    this.$__path.simplify();
                },
                get interval() {
                    return interval;
                },
                set interval(i) {
                    interval = i;
                    this.$__path.segments = calculatePoints(fx, fy, interval, endPoints, dt);
                    this.$__path.simplify();
                },
                get endPoints() {
                    return interval;
                },
                set endPoints(i) {
                    endPoints = i;
                    this.$__path.segments = calculatePoints(fx, fy, interval, endPoints, dt);
                    this.$__path.simplify();
                },
                get dt() {
                    return dt;
                },
                set dt(i) {
                    dt = i;
                    this.$__path.segments = calculatePoints(fx, fy, interval, endPoints, dt);
                    this.$__path.simplify();
                },
                sheet: sheet
            };
        }
    }
});