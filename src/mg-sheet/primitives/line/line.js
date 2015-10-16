define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    return {
        type: 'primitive',
        factory: function draw_line(point1, point2, style) {
            var sheet = this,
                diag = 2 * Math.sqrt(sheet.width * sheet.width + sheet.height * sheet.height),
                line = new paper.Path.Line({
                    from: [0, 0],
                    to: [diag, 0],
                    style: style
                }),
                delta;
            if (!(point2 instanceof paper.Point)) {
                point2 = new paper.Point(point2);
            }
            delta = point2.subtract(point1);
            line.position = point1;
            line.rotate(delta.angle);
            return {
                defaultStyle: defaultConfig.style,
                initialStyle: style,
                $__path: line,
                get style() {
                    return this.$__path.style
                },
                get type() {
                    return 'segment';
                },
                sheet: sheet,
                get point1() {
                    return point1;
                },
                set point1(v) {
                    point1 = v;
                    if (!point2 instanceof paper.Point) {
                        point2 = new paper.Point(point2);
                    }
                    delta = point2.subtract(point1);
                    line.position = point1;
                    line.rotate(delta.angle);
                    this.sheet.redraw();
                    this.trigger('change');
                },
                get point2() {
                    return point2;
                },
                set point2(v) {
                    point2 = v;
                    if (!point2 instanceof paper.Point) {
                        point2 = new paper.Point(point2);
                    }
                    delta = point2.subtract(point1);
                    line.position = point1;
                    line.rotate(delta.angle);
                    this.sheet.redraw();
                    this.trigger('change');
                }
            };
        }
    };
});