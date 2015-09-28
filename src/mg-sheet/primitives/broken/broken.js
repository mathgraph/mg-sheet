define(['mg-sheet/utils/common', './config'], function (utils, defaultConfig) {
    return {
        type: 'primitive',
        factory: function draw_broken(style) {
            var sheet = this;

            return {
                defaultStyle: defaultConfig.style,
                initialStyle: style
            }
        }
    }
});