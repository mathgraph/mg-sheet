define([
        'mg-sheet/sheet/Sheet',
        'mg-sheet/extensions/Entity', 'mg-sheet/extensions/Cursor',
        'mg-sheet/extensions/Charger', 'mg-sheet/extensions/Style',
        'mg-sheet/extensions/Decorator',
        'mg-sheet/primitives/arrow/arrow', 'mg-sheet/primitives/broken/broken', 'mg-sheet/primitives/circle/circle',
        'mg-sheet/primitives/curve/curve', 'mg-sheet/primitives/segment/segment', 'mg-sheet/primitives/parametric/parametric',
        'mg-sheet/primitives/polynomial/polynomial', 'mg-sheet/primitives/line/line', 'mg-sheet/primitives/curve2/curve2',
        'mg-sheet/primitives/function/function',
        'mg-sheet/controls/highlighter/highlighter', 'mg-sheet/controls/selector/selector',
        'mg-sheet/decorators/ticker/ticker', 'mg-sheet/decorators/labeled/labeled', 'mg-sheet/decorators/grid/grid'],
    function (Sheet) {
        Array.prototype.slice.call(arguments, 1).forEach(function (item) {
            Sheet.module(item);
        });

        return Sheet;
    });
