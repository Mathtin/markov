$(function(){
    var step_by_step;
    var a = new TextareaExtension(document.getElementById("rules"), preprocessor);
    //Start button
    $('#start').click(function(){
        $("#start").prop("disabled", true);
        $("#step").prop("disabled", true);
        $("#speed").prop("disabled", true);
        $('#history').val("");
        try {
            var rules_stack = preprocess($('#rules').val());
            if (!rules_stack.success) throw rules_stack.errors;
            rules_stack = parser(rules_stack["result"]);
            if (!rules_stack.success) throw rules_stack.errors;
            var pipe = {
                func: function(){
                        var end_check = step(this.rules, $('#result').val());
                        this.end = end_check.end;
                        if (!end_check.success || end_check["end"]){
                            if (!end_check.success) ErrorTrap(end_check.errors);
                            else $('#state').val("Успешное завершение алгоритма!");
                            $("#start").prop("disabled", false);
                            $("#step").prop("disabled", false);
                            $("#speed").prop("disabled", false);
                            clearInterval(step_by_step);
                        }
                    },
                rules: rules_stack.result,
                end: false
            };
            step_by_step = setInterval(function() { pipe.func.call(pipe); }, parseInt($("#speed").val()));
        } catch (err){
            $("#start").prop("disabled", false);
            $("#step").prop("disabled", false);
            $("#speed").prop("disabled", false);
            ErrorTrap(err);
            return 0;
        }
        return 0;
    });
    //Step button
    $('#step').click(function(){
        try {
            var rules_stack = preprocess($('#rules').val());
            if (!rules_stack.success) throw rules_stack.errors;
            rules_stack = parser(rules_stack["result"]);
            if (!rules_stack.success) throw rules_stack.errors;
            rules_stack = step(rules_stack["result"], $('#result').val());
            if (!rules_stack.success) throw rules_stack.errors;
        } catch (err){
            ErrorTrap(err);
            return 0;
        }
        if(rules_stack.end) $('#state').val("Успешное завершение алгоритма!");
        return 0;
    });
    
    $('#stop').click(function(){
        $("#start").prop("disabled", false);
        $("#step").prop("disabled", false);
        $("#speed").prop("disabled", false);
        clearInterval(step_by_step);
    });
    
    $('#reset').click(function(){
        $("#start").prop("disabled", false);
        $("#step").prop("disabled", false);
        $("#speed").prop("disabled", false);
        clearInterval(step_by_step);
        $('#result').val($('#set').val());
        $('#history').val("");
    });
    
    $('#set').keyup(function(){
        if ($('#history').val() === "") $('#result').val($('#set').val());
    });
});

function preprocess(rules){
    return {
        success: true, 
        result: rules.split("\n").map(function(str) { return str.replace(/\/\/.*/g, ""); })
    };
};

function parser(rules){
    var end, success = true;
    rules = rules.map(function(str, i){
        if (str === "") return "";
        if (str.indexOf(" ->. ")>=0){
            end = true;
            str = str.split(" ->. ", 2);
        }else if (str.indexOf(" -> ")>=0){
            end = false;
            str = str.split(" -> ", 2);
        }else if (str.indexOf("->.")>=0){
            if (str.replace("->.", "").indexOf("->")>=0){
                success = false;
                return {
                    success: false,
                    code: "AmbiguousProduction",
                    line: i + 1,
                    desk: "Неоднозначная продукция"
                };
            }
            end = true;
            str = str.split("->.", 2);
        }else if (str.indexOf("->")>=0){
            if (str.replace("->", "").indexOf("->")>=0){
                success = false;
                return {
                    success: false,
                    code: "AmbiguousProduction",
                    line: i + 1,
                    desk: "Неоднозначная продукция"
                };
            }
            end = false;
            str = str.split("->", 2);
        }else {
            str = str.replace(/ /g, "");
            if (str === "") return "";
            success = false;
            return {
                success: false,
                code: "ArrowExpected",
                line: i + 1,
                desk: "Ожидалась \"->\""
            };
        }
        str = str.map(function(str){return str.replace(/ /g, "");});
        if (str[0] === str[1]) {
            success = false;
            return {
                success: false,
                code: "IncorrectRule",
                line: i + 1,
                desk: "Некорректное правило"
            };
        }
        //console.log("Parser: \"" + str[0] + "\"" + "->" + "\"" + str[1] + "\"" + " " + end);
        return { left: str[0], right: str[1], end: end, line: i + 1, success: true};
    });
    rules = rules.filter(function(str){ return str !== ""; });
    if (success) return { success: success, result: rules };
    else {
        rules = rules.filter(function(str){ return !str.success;});
        return { success: success, errors: rules };
    }
}

function step(rules, text){
    for(var i=0; i<rules.length; i++){
        if (rules[i].left === "" || text.indexOf(rules[i].left)>=0){
            if (rules[i].left === "") text = rules[i].right + text;
            else text = text.replace(rules[i].left, rules[i].right);
            $('#result').val(text);
            $('#history').val($('#history').val() + text + "\n");
            if ($('#result').val().length>256) return {
                success: false,
                errors: [{
                    code: "BufferOverflow",
                    desk: "Переполнение буфера"
                }]
            }; else if (!(rules[i].end) && $('#result').val() === $('#set').val())return {
                success: false,
                errors: [{
                    code: "Loop",
                    desk: "Зацикленный алгоритм"
                }]
            };
            return {
                success: true,
                end: rules[i].end
            };
        }
    }
    return {
        success: false,
        errors: [{
            code: "NoRules",
            desk: "Правила не найдены для текущего результата"
        }]
    };
};

function ErrorTrap(err){
    var error_msg = "", error_console = "";
    for(var i=0; i<err.length; i++){
        if (err[i].code === "NoRules" || err[i].code === "BufferOverflow" || err[i].code === "Loop"){
            error_console += "Error: " + err[i].code + "\n";
            error_msg += "Ошибка: " + err[i].desk + "\n";
        } else {
            error_console += "Error: " + err[i].code + " in line " + err[i].line + "\n";
            error_msg += "Ошибка: " + err[i].desk + " в строке " + err[i].line + "\n";
        }
    }
    console.log(error_console);
    $('#state').val(error_msg);
}