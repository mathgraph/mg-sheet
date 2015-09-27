define(['lodash', 'mg-sheet/extensions/Entity'], function (_, Entity) {

    Entity.initial(function (){
        var entity = this;

        _.assign(entity, {
            $__styles: {},
            $__amountStyles: 0,
            applyStyle: function () {
                var entity = this,
                    style,
                    cascade;

                cascade = _(entity.$__styles)
                    .filter('flag')
                    .pluck('style')
                    .sortBy('priority')
                    .value();

                style = _.merge.apply(null, [{}].concat(cascade));
                entity.$__path.style = style;
                entity.sheet.redraw();
                return entity;
            },
            enableStyle: function (name) {
                var entity = this;
                entity.$__styles[name] && (entity.$__styles[name].flag = true);
                entity.applyStyle();
                return entity;
            },
            disableStyle: function (name) {
                var entity = this;
                entity.$__styles[name] && (entity.$__styles[name].flag = false);
                entity.applyStyle();
                return entity;
            },
            toggleStyle: function (name) {
                var entity = this;
                entity.$__styles[name] && (entity.$__styles[name].flag = !entity.$__styles[name].flag);
                entity.applyStyle();
                return entity;
            },
            pushStyle: function (name, style) {
                var entity = this,
                    priority = entity.$__amountStyles++;
                entity.$__styles[name] = {
                    flag: true,
                    style: style || {},
                    priority: priority
                };
                entity.applyStyle();
                return entity;
            },
            getStyle: function (name) {
                var entity = this;
                return entity.$__styles[name];
            }
        });

        entity
            .pushStyle('default', entity.defaultStyle)
            .enableStyle('default')
            .pushStyle('sheet', entity.sheet.style)
            .enableStyle('sheet')
            .pushStyle('initial', entity.initialStyle)
            .enableStyle('initial')
    });

    return {
        name: 'Style',
        type: 'extension',
        constructor: function (canvas, config) {
            var sheet = this;
            sheet.$__project.style = sheet.style = config.style;
        }
    }

});