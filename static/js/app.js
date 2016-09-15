$(function() {
    function prettyTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds - minutes * 60;

        return ("0" + minutes).slice(-2) + ":" + ("0" + remainingSeconds).slice(-2);
    }

    /* custom leaflet plugins */
    L.CaptionIcon = L.Icon.extend({
        options: {},
        initialize: function(options) {
            L.Util.setOptions(this, options);
        },
        createIcon: function() {
            var container = document.createElement('div');

            if(this.options.custom) {
                container.className = this.options.customClass;
                container.innerHTML = "<img src=\"" + this.options.custom + "\">";
            } else {
                container.className = 'map-pokemon';

                container.innerHTML = "<img src=\"https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/icons/" + this.options.pokemon.id + ".png\"><div class=\"map-pokemon timer\" data-expired=\"false\" data-expiry=\"" + this.options.pokemon.expiry + "\">" + prettyTime(this.options.pokemon.expiry - Math.round(new Date() / 1000)) + "</div>";
            }

            return container;
        },
        createShadow: function() {
            return false;
        }
    });

    /* app */
    var app = {
        map: null,
        markers: {
            pokemons: [],
            pokestops: [],
            gyms: []
        },
        hiddenMarkers: {
            pokemons: [],
            pokestops: [],
            gyms: []
        },
        settings: {},

        init: function() {
            this.initListeners();
            this.initMap();

            this.initData(() => {
                this.loadSettings();
            });

            if(!this.storage.available() || typeof this.storage.get("PGOM_show_welcome") !== 'string') {
                $('#init-modal').openModal();
            }
        },

        initListeners: function() {
            $("#settings-trigger").leanModal();

            $("#locate-trigger").on('click', () => {
                navigator.geolocation.getCurrentPosition((location) => {
            		this.map.setView(new L.LatLng(location.coords.latitude, location.coords.longitude), 15);

                    L.marker([location.coords.latitude, location.coords.longitude], {
                        icon: L.icon.glyph({
                            prefix: 'mdi',
                            glyph: 'account-location',
                            background: false,
                            glyphSize: '15pt'
                        })
                    }).addTo(this.map);
            	});
            });

            $("#save-settings").on('click', () => {
                this.saveSettings();
            });

            $("#map-zoom-plus").on('click', () => {
                this.map.zoomIn();
            });

            $("#map-zoom-minus").on('click', () => {
                this.map.zoomOut();
            });

            $("#exit-welcome").on('click', () => {
                if($("#show-again-welcome").is(':checked')) {
                    if(this.storage.available()) {
                        this.storage.append('PGOM_show_welcome', false);
                    }
                }
            });
        },

        initMap: function() {
            this.map = new L.Map('map', {
                zoomControl: false
            });

        	// create the tile layer with correct attribution
            var osm = new Object();

        	osm.url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        	osm.attribution ='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, Icon by <a href="https://icons8.com">Icon8</a>';

        	// start the map in Central USA
        	this.map.setView(new L.LatLng(49.67400631893335, 12.16737841437996),16);
        	this.map.addLayer(new L.TileLayer(osm.url, {
                minZoom: 2,
                maxZoom: 17,
                attribution: osm.attribution
            }));
        	//map.on('click', onMapClick);
        },

        initData: function(callback) {
            var data = '{"Ok":true,"Error":"","Response":{"Encounters":[{"PokemonId":60,"Lat":49.67400631893335,"Lng":12.16737841437996,"DisappearTime":1473173782}],"Pokestops":[{"Lat":49.675974,"Lng":12.165343,"Lured":false},{"Lat":49.67548,"Lng":12.163332,"Lured":false},{"Lat":49.674443,"Lng":12.165714,"Lured":false},{"Lat":49.676314,"Lng":12.16486,"Lured":false},{"Lat":49.675129,"Lng":12.163405,"Lured":false},{"Lat":49.672729,"Lng":12.167156,"Lured":false},{"Lat":49.676285,"Lng":12.167553,"Lured":false}],"Gyms":[{"Lat":49.675681,"Lng":12.164399,"Team":3},{"Lat":49.675968,"Lng":12.167005,"Team":3}]}}';
            data = $.parseJSON(data);

            /*
            $.ajax({
                url: URL_HERE
                success: (data) => {
                    if(typeof data !== 'object') data = $.parseJSON(data);

                    /* CODE HERE //*//*
                }
            });
            */

            if(data.Ok === true && data.Error.length === 0) {
                $.each(data.Response.Encounters, (k, encounter) => {
                    this.markers.pokemons.push(L.marker([encounter.Lat, encounter.Lng], {
                        icon: new L.CaptionIcon({
                            custom: false,
                            pokemon: {
                                id: encounter.PokemonId,
                                expiry: Math.round(new Date() / 1000 + (60 * 2))
                            }
                        })
                    }).addTo(this.map));
                });

                setInterval(() => {
                    $(".map-pokemon.timer[data-expired=false]").each(function() {
                        var timeRemaining = parseInt($(this).data("expiry"), 10) - Math.round(new Date() / 1000);

                        if(timeRemaining < 0) {
                            $(this).parent().fadeOut();
                            $(this).attr("data-expired", true);
                        } else {
                            $(this).text(prettyTime(timeRemaining));
                        }
                    });
                }, 1000);

                $.each(data.Response.Pokestops, (k, pokestop) => {
                    L.marker([pokestop.Lat, pokestop.Lng], {
                        icon: new L.CaptionIcon({
                            customClass: 'map-pokestop',
                            custom: (pokestop.Lured ?
                                        'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/PstopLured.png' :
                                        'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Pstop.png')
                        })
                    }).addTo(this.map);
                });

                $.each(data.Response.Gyms, (k, gym) => {
                    var icon_url = 'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Harmony.png';

                    switch(gym.Team) {
                        case 1:
                            icon_url = 'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Instinct.png';
                            break;
                        case 2:
                            icon_url = 'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Mystic.png';
                            break;
                        case 3:
                            icon_url = 'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Valor.png';
                            break;
                    }

                    L.marker([gym.Lat, gym.Lng], {
                        icon: new L.CaptionIcon({
                            customClass: 'map-gym',
                            custom: icon_url
                        })
                    }).addTo(this.map);
                });
            } else {
                // error handling
            }

            callback();
        },

        storage: {
            available: function() {
                try {
            		var storage = window.localStorage,
            			x = '__storage_test__';
            		storage.setItem(x, x);
            		storage.removeItem(x);
            		return true;
            	} catch(e) {
            		return false;
            	}
            },

            get: function(key) {
                try {
                    return window.localStorage.getItem(key);
                } catch(e) {
                    return false;
                }
            },

            append: function(key, value) {
                try {
                    window.localStorage.setItem(key, value);

                    return true;
                } catch(e) {
                    return false;
                }
            },

            delete: function(key) {
                try {
                    window.localStorage.removeItem(key);

                    return true;
                } catch(e) {
                    return false;
                }
            }
        },

        loadSettings: function() {
            if(this.storage.available()) {
                if(typeof this.storage.get('PGOM_settings') !== 'undefined') {
                    try {
                        $.each($.parseJSON(window.atob(this.storage.get('PGOM_settings'))), (key, value) => {
                            this.settings[key] = value;

                            if($("[data-setting=" + key + "]").length > 0) {
                                if(typeof value === 'boolean') {
                                    $("[data-setting=" + key + "]").find("input.setting-controller").attr("checked", value);
                                }

                                if(typeof value === 'string') {
                                    $("[data-setting=" + key + "]").find("input.setting-controller").val(value);
                                }
                            }
                        });

                        this.updateSettings();
                    } catch(e){} // ignored
                }
            }
        },

        updateSettings: function() {
            // horrible, so repetive

            if(!this.settings['pokemons-show']) {
                $(".map-pokemon").fadeTo(500, 0, function() {
                    $(this).css("visibility", "hidden");
                });
            } else {
                $(".map-pokemon").fadeTo(0, 500, function() {
                    $(this).css("visibility", "visible");
                });
            }

            if(!this.settings['pokestops-show']) {
                $(".map-pokestop").fadeTo(500, 0, function() {
                    $(this).css("visibility", "hidden");
                });
            } else {
                $(".map-pokestop").fadeTo(0, 500, function() {
                    $(this).css("visibility", "visible");
                });
            }

            if(!this.settings['gyms-show']) {
                $(".map-gym").fadeTo(500, 0, function() {
                    $(this).css("visibility", "hidden");
                });
            } else {
                $(".map-gym").fadeTo(0, 500, function() {
                    $(this).css("visibility", "visible");
                });
            }
        },

        saveSettings: function() {
            var settings = new Object();

            $("[data-setting]").each(function() {
                var controller = $(this).find("input.setting-controller");

                settings[$(this).data("setting")] = controller.attr("type") === 'checkbox' ? (controller.is(':checked')) : controller.val();
            });

            this.settings = settings;

            this.updateSettings();

            this.storage.append('PGOM_settings', btoa(JSON.stringify(settings)));
        }
    };

    app.init();
});
