define({
    style: {
        strokeWidth: 1,
        strokeColor: 'black'
    },
    length: 10,
    start: 0.5,
    step: {
        length: 50,
        unit: ''
    },
    direction: '<>',
    text: {
        point: [50, 50],
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
    },
    content: (function () {
        var count = 0;
        return function () {
            return count++;
        }
    })()
});