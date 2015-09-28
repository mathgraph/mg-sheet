define(['lodash', './config'], function (_, defaultConfig) {

    function tickSymbol(config) {
        var p = new paper.Path.Line({
            from: [0, 0],
            to: [0, config.length],
            strokeColor: 'black',
            style: config.style
        }),
            symbol = new paper.Symbol(p);

        p.remove();

        return symbol;
    }

    function drawTicks(entity, config) {
        var path, pathLength,
            ticks, start, step, symbol;
        config = config || {};
        _.defaultsDeep(config, defaultConfig);

        entity.$__ticks = entity.$__ticks || new paper.Group();
        ticks = entity.$__ticks;

        entity.$__tickSymbol = entity.$__tickSymbol || tickSymbol(config);
        symbol = entity.$__tickSymbol;

        path = entity.$__path;
        pathLength = path.length;

        ticks.removeChildren();

        start = pathLength * config.start;
        step = config.step.unit === '%' ? pathLength * config.step.length : +config.step.length;

        _([start])
            .concat(_.contains(config.direction, '>') ? _.range(start + step, pathLength, step) : [])
            .concat(_.contains(config.direction, '<') ? _.range(start - step, 0, -step) : [])
            .each(function (offset) {
                var tick;
                tick = symbol.place();
                tick.rotate(path.getNormalAt(offset).angle + 90 + config.angle || 0);
                tick.translate(path.getPointAt(offset));
                ticks.addChild(tick);
            })
            .value();

        entity.sheet.redraw();
        return entity;
    }

    return {
        type: 'decorator',
        name: 'ticker',
        decorate: function (entity) {
            entity.ticker = function (config) {
                drawTicks(entity, config)
                    .on('change', drawTicks.bind(null, entity, config));
                return entity;
            }
        }
    }

});