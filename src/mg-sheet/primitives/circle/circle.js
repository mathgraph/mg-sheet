define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    /**
     * @class Sheet.Circle
     * @classdesc Simple circle on sheet
     * @property {number} id Read-only
     * @property {string} type 'circle'. Read-only
     * @property {Sheet} sheet
     * @property {Sheet.Style} style Read-only (you can change properties of style)
     * @property {Sheet.Point} center Center of circle
     * @property {Number} radius Radius of circle
     * @property {object} $__path Paper.js path
     * @mixes Sheet.Entity
     * @fires Sheet.Circle:change
     */

    /**
     * Fires when center or radius changed
     * @event Sheet.Circle:change
     */

    /**
     * @method Sheet#draw_circle
     * @param {Sheet.Point} center
     * @param {Number} radius
     * @param {Sheet.Style} style
     * @todo style should be optional
     * @todo check minimal radius
     * @returns {Sheet.Circle}
     */
    return {
        type: 'primitive',
        factory: function draw_circle(center, radius, style) {
            var sheet = this,
                $_radius,
                circle;

            $_radius = Math.min(radius, defaultConfig.minRadius);

            circle = {
                $__path: new paper.Path.Circle({center: center, radius: $_radius, style: style}),
                get style() {
                    return this.$__path.style
                },
                get type() {
                    return 'circle';
                },
                sheet: sheet,
                get center() {
                    return this.$__path.position;
                },
                set center(v) {
                    this.$__path.position = v;
                    this.sheet.redraw();
                    this.trigger('change');
                },
                get radius() {
                    return $_radius;
                },
                set radius(v) {
                    if (v < 1) {
                        v = 1
                    }
                    this.$__path.scale(v / $_radius);
                    $_radius = v;
                    this.sheet.redraw();
                    this.trigger('change');
                },
                /**
                 * Fit circle to bounding rectangle
                 * @method Sheet.Circle#fit
                 * @param {Sheet.Point} from
                 * @param {Sheet.Point} to
                 */
                fit: function (from, to) {
                    var f = new paper.Point(from),
                        t = new paper.Point(to);

                    this.radius = f.subtract(t).length / 2;
                    this.center = new paper.Rectangle(f, t).center;
                }
            };

            return circle;
        }
    };
});