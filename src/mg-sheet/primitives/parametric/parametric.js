define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_parametric(fx, fy, interval, endPoints, dt, style) {
            var sheet, parametric, initialStyle, calculatePoints, path;
            sheet = this;

            dt = dt || defaultConfig.dt;
            initialStyle = utils.clone(defaultConfig.style || {});
            utils.deepExtend(initialStyle, sheet.style);
            utils.deepExtend(initialStyle, style);

            calculatePoints = function (fx, fy, interval, endPoints, dt) {
                var t, points = [];
                for (t = endPoints[0] ? interval[0] : interval[0] + dt; t < interval[1]; t += dt) {
                    points.push([fx(t), fy(t)]);
                }
                if (endPoints[1]) {
                    points.push([fx(interval[1]), fy(interval[1])]);
                }
                return points;
            };

            path = new paper.Path({
                segments: calculatePoints(fx, fy, interval, endPoints, dt),
                style: initialStyle
            });
            path.simplify();

            parametric = {
                $__initialStyle: initialStyle,
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
                    this.$__path.segments = calculatePoints(fx, fy, interval, endPoints, dt);
                    this.$__path.simplify();
                },
                set fy(f) {
                    fy = f;
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

            return parametric;
        }
    }
});