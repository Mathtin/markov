define( function(){
        console.log("LOADING SYNTAX MODULE");
        var mapping = function(str){
            var map_arr = [];
            if (str === ""){
                map_arr.push({type: "space", index: 0, length: 0});
                return map_arr;
            }
            var temp = str.replace(/\/\/.*/g, "");
            if (temp !== str) map_arr.push({type: "comment", index: str.indexOf("//"), length: str.length - temp.length});
            if (temp.replace(/ /g, "") === "" && temp !== ""){
                map_arr.push({type: "space", index: 0, length: temp.length});
                return map_arr;
            } else if (temp === "") return map_arr;
            str = temp;
            if (temp.indexOf(" ->. ")>=0){
                map_arr.push({type: "e_production", index: str.indexOf(" ->. "), length: 5});
                temp = temp.split(" ->. ", 2);
            }else if (temp.indexOf(" -> ")>=0){
                map_arr.push({type: "production", index: str.indexOf(" -> "), length: 4});
                temp = temp.split(" -> ", 2);
            }else if (temp.indexOf("->.")>=0){
                if (temp.replace("->.", "").indexOf("->")>=0){
                    map_arr.push({type: "incorrect", sub_type: "AmbiguousProduction", index: 0, length: temp.length});
                    return map_arr;
                }
                map_arr.push({type: "e_production", index: str.indexOf("->."), length: 3});
                temp = temp.split("->.", 2);
            }else if (temp.indexOf("->")>=0){
                if (temp.replace("->", "").indexOf("->")>=0){
                    map_arr.push({type: "incorrect", sub_type: "AmbiguousProduction", index: 0, length: temp.length});
                    return map_arr;
                }
                map_arr.push({type: "production", index: str.indexOf("->"), length: 2});
                temp = temp.split("->", 2);
            }else {
                map_arr.push({type: "incorrect", sub_type: "ArrowExpected", index: 0, length: temp.length});
                return map_arr;
            }
            if (temp[0].replace(/ /g, "") === temp[1].replace(/ /g, "")) {
                map_arr.pop();
                map_arr.push({type: "incorrect", sub_type: "IncorrectRule", index: 0, length: str.length});
                return map_arr;
            }
            if (temp[0] !== "")
                map_arr.push({type: "leftRule", index: 0, length: temp[0].length});
            if (temp[1] !== "")
                map_arr.push({type: "rightRule", index: str.indexOf(temp[1], temp[0].length + 2), length: temp[1].length});
            return map_arr;
        };

        var parse = function(rules){
            rules = rules.split("\n");
            var end_trigger = false, success = true;
            rules = rules.map(function(str, i){
                var map = mapping(str);
                var left = "", right = "", end = false;
                for(var k = 0; k < map.length; k++){
                    if (map[k].type === "incorrect"){
                        var res = { success: false, code: map[k].sub_type, line: i + 1 };
                        success = false;
                        if (map[k].sub_type === "ArrowExpected") res.desc = "Ожидалось \"->\"";
                        else if (map[k].sub_type === "IncorrectRule") res.desc = "Некорректное правило";
                        else if (map[k].sub_type === "AmbiguousProduction") res.desc = "Неоднозначная продукция";
                        return res;
                    } else if (map[k].type === "leftRule") left = str.substr(map[k].index, map[k].length);
                    else if (map[k].type === "rightRule") right = str.substr(map[k].index, map[k].length);
                    else if (map[k].type === "e_production") end = true;
                    if (end && !end_trigger) end_trigger = true;
                }
                if (left !== right) {
                    //console.log(left + " -> " + right + " " + (i+1));
                    return { left: left, right: right, end: end, line: i + 1, success: true};
                }
                else return "";
            });
            rules = rules.filter(function(str){ return str !== ""; });
            if (success) return { success: success, result: rules, alert: (end_trigger?"NoEnding":"") };
            else {
                rules = rules.filter(function(str){ return !str.success;});
                return { success: success, errors: rules };
            }
        };
        
        return {
            mapping: mapping,
            parse: parse
        };
    }
);


