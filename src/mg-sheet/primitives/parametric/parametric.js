define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_parametric(fx, fy, interval, endPoints, dt, style) {
            var sheet, initialStyle, path;
            sheet = this;

            dt = dt || defaultConfig.dt;

            function calculatePoints(fx, fy, interval, endPoints, dt) {
                var points = [];
                for (var t = interval[0] + (!endPoints[0] && dt); t < interval[1]; t += dt) {
                    points.push([fx(t), fy(t)]);
                }
                endPoints[1] && points.push([fx(interval[1]), fy(interval[1])]);
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
        }
    }
});