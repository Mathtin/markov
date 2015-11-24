define( ['jquery', 'utils'],
    function($, utils){
        console.log("LOADING HISTORY HANDLER");
        var result, state, history, classes, rules, source;
        
        var enabled = true;
        var clicked = false;
        
        var bind = function(elements, cl, area){
            classes = cl;
            result = elements.result;
            state = elements.state;
            history = elements.history;
            source = elements.rules;
            rules = area;
            $('body').on('click','.' + classes.hist_result, function () {
                if (enabled){
                    $(result).val($(this).data("strresult"));
                    $(state).val($(state).val() + "Выбран результат " + $(this).data("strresult") + '\n');
                    clicked = true;
                }
            });
            $('body').on('click','.' + classes.hist_rule, function () {
                var pos = utils.indexOfRule($(this).data("ruleline"), $(source).val());
                rules.hilightLine(pos);
            });
        };
        
        var clean = function() { 
            $(history).empty();
            $(history).append("<div class=\"" + classes.history_notef + "\">"+ 
                            "<span class=\"" + classes.hist_idf + "\">N</span>" +
                            "<span class=\"" + classes.hist_rulef + "\">Правило</span>" +
                            "<span class=\"" + classes.hist_resultf+ "\">Результат</span></div>");
        };
        
        var add = function(rule, text, iteration){
            $(history).append("<div class=\"" + classes.history_note + "\">"+ 
                            "<span class=\"" + classes.hist_id + "\"> " + iteration + ". </span>" +
                            "<span class=\"" + classes.hist_rule + "\" data-ruleline = \"" + rule.line + "\">" + rule.left + (rule.end ? " ->. " : " -> ") + rule.right + "</span>" +
                            "<span class=\"" + classes.hist_result+ "\" data-strresult = \"" + text + "\">" + text + "</span></div>");
        };       
        
        return {
            enabled: enabled,
            clicked: clicked,
            bind: bind,
            clean: clean,
            add: add
        };
    }
);

