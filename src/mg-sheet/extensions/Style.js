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
                    .sortBy('priority')
                    .pluck('style')
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
            switchStyle: function (name, flag) {
                var entity = this;
                flag ? entity.enableStyle(name) : entity.disableStyle(name);
                return entity;
            },
            pushStyle: function (name, style, flag, priority) {
                var entity = this;
                priority = priority || entity.$__amountStyles++;
                entity.$__styles[name] = {
                    flag: !!flag,
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
            .pushStyle('default', entity.defaultStyle, true)
            .pushStyle('sheet', entity.sheet.style, true)
            .pushStyle('initial', entity.initialStyle, true)
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