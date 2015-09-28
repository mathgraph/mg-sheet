define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_curve(style) {
            var sheet = this;

            return {
                defaultStyle: defaultConfig.style,
                initialStyle: style
            }
        }
    }
});