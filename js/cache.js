define( ['jquery'],
    function($){
        console.log("LOADING CACHE MODULE");
        
        var address = "markovbymathtinandplaguedo";
        
        var update_cache = function (set, rules){
            var cache = {
                set: $(set).val(),
                rules: $(rules).val()
            };
            localStorage.setItem(address, JSON.stringify(cache));
        };
        
        var apply_cache = function(elements){
            if (('localStorage' in window) && window.localStorage !== null){
                var saved = localStorage.getItem(address);
                if(saved===null || saved === "[object Object]"){
                    saved = JSON.stringify({set: "", rules: "" });
                    localStorage.setItem(address, saved);
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