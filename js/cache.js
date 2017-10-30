define( ['jquery'],
    function($){
        console.log("LOADING CACHE MODULE");
        
        var address = "markovbymathtinandplaguedo",
            cache = {
                set: "",
                rules: "",
                spaceSensitive: false
            };
        
        var update_cache = function (set, rules, spaceSensitivity){
            cache.set = $(set).val();
            cache.rules = $(rules).val();
            cache.spaceSensitive = $(spaceSensitivity).prop("checked");
            localStorage.setItem(address, JSON.stringify(cache));
        };
        
        var apply_cache = function(elements){
            if (('localStorage' in window) && window.localStorage !== null){
                var saved = localStorage.getItem(address);
                if(saved===null || saved === "[object Object]"){
                    saved = JSON.stringify(cache);
                    localStorage.setItem(address, saved);
                }
                cache = JSON.parse(saved);
                $(elements.set).val(cache.set);
                $(elements.rules).val(cache.rules);
                $(elements.result).val($(elements.set).val());
                $(elements.space_sensitivity).prop('checked', cache.spaceSensitive);
            }
        };
        
        return {
            apply_cache: apply_cache,
            update_cache: update_cache
        };
    }
);