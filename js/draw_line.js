(function (Sheet) {

    /**
     * @class Sheet.Line
     * @classdesc Simple segment on sheet
     * @property {number} id Read-only
     * @property {string} type 'line'. Read-only
     * @property {Sheet} sheet
     * @property {Sheet.Style} style Read-only (you can change properties of style)
     * @property {Sheet.Point} from Start of segment
     * @property {Sheet.Point} to End of segment
     * @property {object} __path Paper.js path
     * @mixes Sheet.Entity
     * @fires Sheet.Line:change
     */

    /**
     * Fires when start point or end point of line changed
     * @event Sheet.Line:change
     */

    /**
     * @method Sheet#draw_line
     * @param {Sheet.Point} from
     * @param {Sheet.Point} to
     * @param {Sheet.Point} style
     * @todo style should be optional
     * @returns {Sheet.Line}
     */
    Sheet.prototype.draw_line = function (from, to, style) {
        var sheet = this;
        sheet.__project.activate();
        var _id = utils.id();
        var line = {
            __path: new paper.Path.Line({from: from, to: to, style: style}),
            get style() { return this.__path.style },
            get id() { return _id; },
            get type() { return 'line'; },
            sheet: sheet,
            get from() {
                return this.__path.firstSegment.point;
            },
            set from(v) {
                this.__path.firstSegment.point = v;
                this.sheet.redraw();
                this.trigger('change');
            },
            get to() {
                return this.__path.lastSegment.point;
            },
            set to(v) {
                this.__path.lastSegment.point = v;
                this.sheet.redraw();
                this.trigger('change');
            }
        };
        utils.deepExtend(line, Sheet.Entity);
        line.init();
        return line;
    }
})(Sheet);