define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {

    function tickSymbol(config) {
        return new paper.Symbol(new paper.Path.Line({
            from: [0, 0],
            to: [0, config.length],
            strokeColor: 'black',
            style: config.style
        }))
    }

    function drawTicks(entity, config) {
        var path, pathLength,
            ticks, start, step, cur, symbol, tick;
        entity = entity || this;
        config = config || {};
        utils.deepExtend(config, defaultConfig);

        entity.$__ticks = entity.$__ticks || new paper.Group();
        ticks = entity.$__ticks;

        entity.$__tickSymbol = entity.$__tickSymbol || tickSymbol(config);
        symbol = entity.$__tickSymbol;

        path = entity.$__path;
        pathLength = path.length;

        ticks.removeChildren();

        start = pathLength * config.start;
        step = config.step.unit === '%' ? pathLength * config.step.length : +config.step.length;

        if (config.direction.indexOf('>') !== -1) {
            cur = start;
            while (cur <= pathLength) {
                tick = symbol.place();
                tick.rotate(path.getNormalAt(cur).angle + 90 || 0);
                tick.translate(path.getPointAt(cur));
                ticks.addChild(tick);
                cur += step;
            }
        }

        if (config.direction.indexOf('<') !== -1) {
            cur = start;
            while (cur >= 0) {
                tick = symbol.place();
                tick.rotate(path.getNormalAt(cur).angle + 90 || 0);
                tick.translate(path.getPointAt(cur));
                ticks.addChild(tick);
                cur -= step;
            }
        }
        entity.sheet.redraw();
        return entity;
    }

    return {
        type: 'decorator',
        name: 'ticker',
        decorate: function (entity) {
            entity.ticker = function (config) {
                drawTicks(entity, config)
                    .on('change', drawTicks.bind(entity));
                return entity;
            }
        }
    }

});