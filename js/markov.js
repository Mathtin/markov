define( ['TextareaExtension', 'jquery', 'syntax', 'historyUI', 'cache', 'utils'],
    function( TextareaExtension, $, syntax, historyUI, cache, utils){
        console.log("LOADING MRK ENGINE");
        var step_by_step, iteration = 0, clicked = false;
        
        var switchButtons = function(on){
            $(start).prop("disabled", !on);
            $(step).prop("disabled", !on);
            $(speed).prop("disabled", !on);
        };
        
        var makeStep = function (rules, text, iteration){
            for(var i=0; i<rules.length; i++)
                if (rules[i].left === "" || text.indexOf(rules[i].left)>=0){
                    if (rules[i].left === "") text = rules[i].right + text;
                    else text = text.replace(rules[i].left, rules[i].right);
                    text = text.replace(/ /g,"");
                    $(result).val(text);
                    historyUI.add(rules[i], text, iteration);
                    if ($(result).val().length>bufferLength) return {
                        success: false,
                        errors: [{
                            code: "BufferOverflow",
                            desc: "Переполнение буфера",
                            line: 0
                        }]
                    }; else if (!(rules[i].end) && $(result).val() === $(set).val())return {
                        success: false,
                        errors: [{
                            code: "Loop",
                            desc: "Зацикленный алгоритм",
                            line: 0
                        }]
                    };
                    return { success: true, end: rules[i].end };
                }
            return {
                success: false,
                errors: [{
                    code: "NoRules",
                    desc: "Правила не найдены для текущего результата",
                    line: 0
                }]
            };
        };
        
        var start_function = function(){
            switchButtons(false);
            historyUI.enabled = false;
            if ($(set).val() === $(result).val() || clicked){
                historyUI.clean();
                clicked = false;
            }
            try {
                var rules_stack = syntax.parse($(rules).val());
                if (!rules_stack.success) throw rules_stack.errors;
                var pipe = {
                    func: function(){
                            this.iteration++;
                            var end_check = makeStep(this.rules, $(result).val(), this.iteration);
                            end = end_check.end;
                            if (!end_check.success || end_check.end){
                                if (!end_check.success) ErrorTrap(end_check.errors);
                                else $(state).val($(state).val() + "Успешное завершение алгоритма!\n");
                                switchButtons(true);
                                historyUI.enabled = true;
                                clearInterval(step_by_step);
                            }
                        },
                    rules: rules_stack.result,
                    end: false,
                    iteration: iteration
                };
                step_by_step = setInterval(function() { pipe.func.call(pipe); }, parseInt($(speed).val()));
            } catch (err){
                switchButtons(true);
                historyUI.enabled = true;
                ErrorTrap(err);
                return 0;
            }
            return 0;
        };
        
        var step_function = function(){
            try {
                var rules_stack = syntax.parse($(rules).val());
                if (!rules_stack.success) throw rules_stack.errors;
                iteration++;
                rules_stack = makeStep(rules_stack.result, $(result).val(),iteration);
                if (!rules_stack.success) throw rules_stack.errors;
            } catch (err){
                ErrorTrap(err);
                return 0;
            }
            if(rules_stack.end) $(state).val($(state).val() + "Успешное завершение алгоритма!\n");
            return 0;
        };
        
        var set, result, start, start, stop, reset, speed, step, rules, state, classes, area;
        
        var ErrorTrap;
        
        var bind = function (elements, cl, err_func){
            ErrorTrap = err_func;
            //INPUTS
            set = elements.set; result = elements.result;
            //BUTTONS
            start = elements.start; stop = elements.stop; reset = elements.reset; speed = elements.speed; step = elements.step;
            //TEXT AREAS
            rules = elements.rules; state = elements.state;
            area = new TextareaExtension(document.getElementById(rules.replace("#", "")), function(rules){return rules.map(syntax.mapping);}, cl);
            window.onresize = function(event) { area.scrollSync(); area.resize(); }; 
            historyUI.bind(elements.history, cl);
            historyUI.setOnResultSelectHandler(function () {
                if (historyUI.enabled){
                    $(result).val($(this).data("strresult"));
                    $(state).val($(state).val() + "Выбран результат " + $(this).data("strresult") + '\n');
                    clicked = true;
                }
            });
            historyUI.setOnRuleSelectHandler(function () {
                var pos = utils.indexOfRule($(this).data("ruleline"), $(rules).val());
                area.hilightLine(pos);
            });
            classes = cl;
            $(start).click(start_function);
            $(step).click(step_function);
            $(stop).click(function(){
                switchButtons(true);
                historyUI.enabled = true;
                clearInterval(step_by_step);
            });
            $(set).keyup(function(){ 
                $(result).val($(set).val()); 
                cache.update_cache(set, rules);
            });
            $(reset).click(function(){
                $(state).val("");
                switchButtons(true);
                historyUI.enabled = true;
                clearInterval(step_by_step);
                $(result).val($(set).val());
                historyUI.clean();
                iteration = 0;
            });
            cache.apply_cache(elements);
            $(rules).keyup(cache.update_cache(set, rules));
            area.time_delay = 700;
            area.dark();
            setTimeout(area.resize(), area.time_delay + 100);
        };
        
        var bufferLength = 128;
        
        return {
            bind: bind,
            bufferLength: bufferLength
        };
    }
);