define(['paper', 'lodash', './config'], function (paper, _, defaultConfig) {

    function Sheet(canvas, config) {
        var sheet = this;

        sheet.domElem = document.getElementById(canvas);
        paper.setup(sheet.domElem);

        sheet.$__project = paper.projects[paper.projects.length - 1];
        sheet.width = sheet.$__project.view.viewSize.width;
        sheet.height = sheet.$__project.view.viewSize.height;

        config = config || {};
        sheet.config = _.defaultsDeep(config, defaultConfig);

        sheet.config.centralize && (sheet.$__project.view.center = [0, 0]);

        sheet.$__project.tool = new paper.Tool();
        sheet.$__project.tool.maxDistance = 0;

        _.each(Sheet.extensions, function (ext) {
            ext.constructor && ext.constructor.call(sheet, canvas, config);
        });
    }

    Sheet.extensions = {};
    Sheet.extension = function (ext) {
        Sheet.extensions[ext.name] && console.warn('Sheet: overriding extension: ' + ext.name);
        Sheet.extensions[ext.name] = ext;
        _.assign(Sheet.prototype, ext.prototype);
        _.assign(Sheet, ext.statics);
        return Sheet;
    };
    Sheet.module = function (smth) {-
        Sheet[smth.type](smth);
    };

    Sheet.prototype.redraw = function () {
        var sheet = this;
        sheet.$__project.view.draw();
        return sheet;
    };

    Sheet.prototype.diagonal = function (style) {
        var sheet = this,
            line, diag, tmp;

        diag = 2 * Math.sqrt(sheet.width * sheet.width + sheet.height * sheet.height);
        line = new paper.Path.Line({
            from: [0, 0],
            to: [diag, 0],
            style: style
        });

        //tmp = paper.view.onResize;
        //paper.view.onResize = function () {
        //    var d;
        //    tmp();
        //    d = Math.sqrt(sheet.width * sheet.width + sheet.height * sheet.height);
        //    line.scale(d / diag);
        //    diag = d;
        //};
        return new paper.Symbol(line);
    };

    return Sheet;

});