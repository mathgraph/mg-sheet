define(['lodash', './config'], function (_, defaultConfig) {

    function circleSymbol(config, radius) {
        return new paper.Path.Circle({
            center: [0, 0],
            radius: radius,
            style: config.style
        });
    }

    function drawGrid(entity, config) {
        var path, pathLength,
            grid, start, step, symbol;
        config = config || {};
        _.defaultsDeep(config, defaultConfig);

        entity.$__grid = entity.$__grid || new paper.Group();
        grid = entity.$__grid;

        entity.$__gridSymbol = entity.$__gridSymbol || entity.sheet.diagonal(config.style);
        symbol = entity.$__gridSymbol;

        path = entity.$__path;
        pathLength = path.length;

        grid.removeChildren();

        start = pathLength * config.start;
        step = config.step.unit === '%' ? pathLength * config.step.length : +config.step.length;

        config.type === 'lines' && _([start])
            .concat(_.contains(config.direction, '>') ? _.range(start + step, pathLength, step) : [])
            .concat(_.contains(config.direction, '<') ? _.range(start - step, 0, -step) : [])
            .each(function (offset) {
                var line;
                line = symbol.place();
                line.rotate(path.getNormalAt(offset).angle + config.angle || 0);
                line.translate(path.getPointAt(offset));
                grid.addChild(line);
            })
            .value();

        config.type === 'circles' && _([])
            .concat(pathLength - start >= start ?
                _.range(start + step, pathLength, step) : _.range(start - step, 0, -step))
            .each(function (offset) {
                var circle;
                circle = circleSymbol(config, Math.abs(offset - start));
                circle.translate(path.getPointAt(start));
                grid.addChild(circle);
            })
            .value();

        entity.sheet.redraw();
        return entity;
    }

    return {
        type: 'decorator',
        name: 'grid',
        decorate: function (entity) {
            entity.grid = function (config) {
                drawGrid(entity, config)
                    .on('change', drawGrid.bind(null, entity, config));
                return entity;
            }
        },
        hide: function (entity) {
            entity.$__grid && (entity.$__grid.visible = false);
            entity.sheet.redraw();
            return entity;
        },
        show: function (entity) {
            entity.$__grid && (entity.$__grid.visible = true);
            entity.sheet.redraw();
            return entity;
        },
        remove: function (entity) {
            entity.$__grid && entity.$__grid.remove();
            entity.sheet.redraw();
            return entity;
        }
    }

});