define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    /**
     * @class Sheet.Segment
     * @classdesc Simple segment on sheet
     * @property {number} id Read-only
     * @property {string} type 'segment'. Read-only
     * @property {Sheet} sheet
     * @property {Sheet.Style} style Read-only (you can change properties of style)
     * @property {Sheet.Point} from Start of segment
     * @property {Sheet.Point} to End of segment
     * @property {object} $__path Paper.js path
     * @mixes Sheet.Entity
     * @fires Sheet.Segment:change
     */

    /**
     * Fires when start point or end point of segment changed
     * @event Sheet.Segment:change
     */

    /**
     * @method Sheet#draw_segment
     * @param {Sheet.Point} from
     * @param {Sheet.Point} to
     * @param {Sheet.Style} style
     * @todo style should be optional
     * @returns {Sheet.Segment}
     */
    return {
        type: 'primitive',
        factory: function draw_segment(from, to, style) {
            var sheet = this,
                initialStyle = JSON.parse(JSON.stringify(defaultConfig.style));
            utils.deepExtend(initialStyle, style);
            return {
                $__initialStyle: initialStyle,
                $__path: new paper.Path.Line({from: from, to: to, style: initialStyle}),
                get style() {
                    return this.$__path.style
                },
                get type() {
                    return 'segment';
                },
                sheet: sheet,
                get from() {
                    return this.$__path.firstSegment.point;
                },
                set from(v) {
                    this.$__path.firstSegment.point = v;
                    this.sheet.redraw();
                    this.trigger('change');
                },
                get to() {
                    return this.$__path.lastSegment.point;
                },
                set to(v) {
                    this.$__path.lastSegment.point = v;
                    this.sheet.redraw();
                    this.trigger('change');
                }
            };
        }
    };
});