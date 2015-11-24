define( ['jquery'],
    function($){
        console.log("LOADING CACHE MODULE");
        var update_cache = function (set, rules){
            var cache = {
                set: $(set).val(),
                rules: $(rules).val()
            };
            localStorage.setItem("markovbymathtinandplaguedo", JSON.stringify(cache));
        };
        
        var apply_cache = function(elements){
            if (('localStorage' in window) && window.localStorage !== null){
                var markov_in_ls = "markovbymathtinandplaguedo";
                var saved = localStorage.getItem(markov_in_ls);
                if(saved===null || saved === "[object Object]"){
                    saved = JSON.stringify({set: "", rules: "" });
                    localStorage.setItem(markov_in_ls, saved);
                }
                var saved_complex = JSON.parse(saved);
                $(elements.set).val(saved_complex.set);
                $(elements.rules).val(saved_complex.rules);
                $(elements.result).val($(elements.set).val());
            }
        };
        return {
            apply_cache: apply_cache,
            update_cache: update_cache
        };
    }
);




