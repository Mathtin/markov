define( function(){
        console.log("LOADING UTILS MODULE");
        var findLine = function (text, line) {
            for (var i = 0 ; i < text.length - line.length +1; i++) {
                var equals = true;
                for (var j = 0; j < line.length && equals; j++) {
                        equals = (line[j] === text[i + j]);
                }
                if (equals && (text.length - i === line.length || text[line.length + i] === '\n')) return i;
            }
        };
        var indexOfRule = function (line_num, text){
            if (line_num === 1) return 0;
            var arr = text.split("\n");
            var index = arr[0].length + 1;
            for(var k = 1; k < arr.length; k++){
                index += arr[k].length + 1;
                if (k + 1 === line_num) return index - 1;
            }
        };
        
        return {
            findLine: findLine,
            indexOfRule: indexOfRule
        };
    }
);