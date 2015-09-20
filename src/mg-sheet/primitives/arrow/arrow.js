define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    /**
     * @class Sheet.Arrow
     * @classdesc Simple arrow on sheet
     * @property {number} id Read-only
     * @property {string} type 'arrow'. Read-only
     * @property {Sheet} sheet
     * @property {Sheet.Style} style Read-only (you can change properties of style)
     * @property {Sheet.Point} from Start of arrow
     * @property {Sheet.Point} to End of arrow
     * @property {object} $__path Paper.js path
     * @mixes Sheet.Entity
     * @fires Sheet.Arrow:change
     */

    /**
     * Fires when start point or end point of arrow changed
     * @event Sheet.Arrow:change
     */

    /**
     * @method Sheet#draw_arrow
     * @param {Sheet.Point} from
     * @param {Sheet.Point} to
     * @param {Sheet.Style} style
     * @todo style should be optional
     * @returns {Sheet.Arrow}
     */
    return {
        type: 'primitive',
        factory: function draw_arrow(from, to, style) {
            var sheet = this,
                arrow,
                initialStyle;
            initialStyle = utils.clone(defaultConfig.style || {});
            utils.deepExtend(initialStyle, style);

            function update_pens(arrow) {
                var to = new paper.Point(arrow.to),
                    from = new paper.Point(arrow.from),
                    delta,
                    pen,
                    pen2;

                delta = to.subtract(from);
                pen = new paper.Point(Math.min(delta.length * defaultConfig.length, defaultConfig.max), 0);
                pen.angle = delta.angle + 180 - defaultConfig.angle;
                pen2 = pen.clone();
                pen2.angle += 2 * defaultConfig.angle;
                arrow.$__path.segments[2].point = pen.add(to);
                arrow.$__path.segments[4].point = pen2.add(to);
            }

            arrow = {
                $__initialStyle: initialStyle,
                $__path: new paper.Path({
                        segments: [from, to, to, to, to, to],
                        closed: false,
                        style: initialStyle
                    }
                ),
                get style() {
                    return this.$__path.style
                },
                get type() {
                    return 'arrow';
                },
                sheet: sheet,
                get from() {
                    var self = this;
                    return {
                        get x() {
                            return self.$__path.firstSegment.point.x;
                        },
                        set x(v) {
                            self.$__path.firstSegment.point.x = v;
                            update_pens(self);
                            self.sheet.redraw();
                            self.trigger('change');
                        },
                        get y() {
                            return self.$__path.firstSegment.point.y;
                        },
                        set y(v) {
                            self.$__path.firstSegment.point.y = v;
                            update_pens(self);
                            self.sheet.redraw();
                            self.trigger('change');
                        }
                    }
                },
                set from(v) {
                    this.$__path.firstSegment.point = v;
                    update_pens(this);
                    this.sheet.redraw();
                    this.trigger('change');
                },
                get to() {
                    var self = this;
                    return {
                        get x() {
                            return self.$__path.segments[1].point.x;
                        },
                        set x(v) {
                            self.$__path.segments[1].point.x = v;
                            self.$__path.segments[3].point.x = v;
                            self.$__path.segments[5].point.x = v;
                            update_pens(self);
                            self.sheet.redraw();
                            self.trigger('change');
                        },
                        get y() {
                            return self.$__path.segments[1].point.y;
                        },
                        set y(v) {
                            self.$__path.segments[1].point.y = v;
                            self.$__path.segments[3].point.y = v;
                            self.$__path.segments[5].point.y = v;
                            update_pens(self);
                            self.sheet.redraw();
                            self.trigger('change');
                        }
                    }
                },
                set to(v) {
                    this.$__path.segments[1].point = v;
                    this.$__path.segments[3].point = v;
                    this.$__path.segments[5].point = v;
                    update_pens(this);
                    this.sheet.redraw();
                    this.trigger('change');
                }
            };
            update_pens(arrow);
            return arrow;
        }
    };
});