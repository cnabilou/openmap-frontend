$(function() {
    function prettyTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds - minutes * 60;

        return ("0" + minutes).slice(-2) + ":" + ("0" + remainingSeconds).slice(-2);
    }

    /* custom leaflet plugins */
    L.PokemonIcon = L.Icon.extend({
    	options: {},

    	initialize: function (options) {
    		L.Util.setOptions(this, options);
    	},

    	createIcon: function () {
    		var div = document.createElement('div');
    		div.innerHTML = this.options.html;
    		return div;
    	},

    	createShadow: function () {
    		return null;
    	}
    });

    /* app */
    var app = {
        map: null,
        settings: {},
        clickedMarker: null,
        scanCircle: null,
        working: false,
        hiddenPokemon: [],
        pokemons: $.parseJSON("{\"1\":\"Bulbasaur\",\"2\":\"Ivysaur\",\"3\":\"Venusaur\",\"4\":\"Charmander\",\"5\":\"Charmeleon\",\"6\":\"Charizard\",\"7\":\"Squirtle\",\"8\":\"Wartortle\",\"9\":\"Blastoise\",\"10\":\"Caterpie\",\"11\":\"Metapod\",\"12\":\"Butterfree\",\"13\":\"Weedle\",\"14\":\"Kakuna\",\"15\":\"Beedrill\",\"16\":\"Pidgey\",\"17\":\"Pidgeotto\",\"18\":\"Pidgeot\",\"19\":\"Rattata\",\"20\":\"Raticate\",\"21\":\"Spearow\",\"22\":\"Fearow\",\"23\":\"Ekans\",\"24\":\"Arbok\",\"25\":\"Pikachu\",\"26\":\"Raichu\",\"27\":\"Sandshrew\",\"28\":\"Sandslash\",\"29\":\"Nidoran F\",\"30\":\"Nidorina\",\"31\":\"Nidoqueen\",\"32\":\"Nidoran M\",\"33\":\"Nidorino\",\"34\":\"Nidoking\",\"35\":\"Clefairy\",\"36\":\"Clefable\",\"37\":\"Vulpix\",\"38\":\"Ninetales\",\"39\":\"Jigglypuff\",\"40\":\"Wigglytuff\",\"41\":\"Zubat\",\"42\":\"Golbat\",\"43\":\"Oddish\",\"44\":\"Gloom\",\"45\":\"Vileplume\",\"46\":\"Paras\",\"47\":\"Parasect\",\"48\":\"Venonat\",\"49\":\"Venomoth\",\"50\":\"Diglett\",\"51\":\"Dugtrio\",\"52\":\"Meowth\",\"53\":\"Persian\",\"54\":\"Psyduck\",\"55\":\"Golduck\",\"56\":\"Mankey\",\"57\":\"Primeape\",\"58\":\"Growlithe\",\"59\":\"Arcanine\",\"60\":\"Poliwag\",\"61\":\"Poliwhirl\",\"62\":\"Poliwrath\",\"63\":\"Abra\",\"64\":\"Kadabra\",\"65\":\"Alakazam\",\"66\":\"Machop\",\"67\":\"Machoke\",\"68\":\"Machamp\",\"69\":\"Bellsprout\",\"70\":\"Weepinbell\",\"71\":\"Victreebel\",\"72\":\"Tentacool\",\"73\":\"Tentacruel\",\"74\":\"Geodude\",\"75\":\"Graveler\",\"76\":\"Golem\",\"77\":\"Ponyta\",\"78\":\"Rapidash\",\"79\":\"Slowpoke\",\"80\":\"Slowbro\",\"81\":\"Magnemite\",\"82\":\"Magneton\",\"83\":\"Farfetch'd\",\"84\":\"Doduo\",\"85\":\"Dodrio\",\"86\":\"Seel\",\"87\":\"Dewgong\",\"88\":\"Grimer\",\"89\":\"Muk\",\"90\":\"Shellder\",\"91\":\"Cloyster\",\"92\":\"Gastly\",\"93\":\"Haunter\",\"94\":\"Gengar\",\"95\":\"Onix\",\"96\":\"Drowzee\",\"97\":\"Hypno\",\"98\":\"Krabby\",\"99\":\"Kingler\",\"100\":\"Voltorb\",\"101\":\"Electrode\",\"102\":\"Exeggcute\",\"103\":\"Exeggutor\",\"104\":\"Cubone\",\"105\":\"Marowak\",\"106\":\"Hitmonlee\",\"107\":\"Hitmonchan\",\"108\":\"Lickitung\",\"109\":\"Koffing\",\"110\":\"Weezing\",\"111\":\"Rhyhorn\",\"112\":\"Rhydon\",\"113\":\"Chansey\",\"114\":\"Tangela\",\"115\":\"Kangaskhan\",\"116\":\"Horsea\",\"117\":\"Seadra\",\"118\":\"Goldeen\",\"119\":\"Seaking\",\"120\":\"Staryu\",\"121\":\"Starmie\",\"122\":\"Mr. Mime\",\"123\":\"Scyther\",\"124\":\"Jynx\",\"125\":\"Electabuzz\",\"126\":\"Magmar\",\"127\":\"Pinsir\",\"128\":\"Tauros\",\"129\":\"Magikarp\",\"130\":\"Gyarados\",\"131\":\"Lapras\",\"132\":\"Ditto\",\"133\":\"Eevee\",\"134\":\"Vaporeon\",\"135\":\"Jolteon\",\"136\":\"Flareon\",\"137\":\"Porygon\",\"138\":\"Omanyte\",\"139\":\"Omastar\",\"140\":\"Kabuto\",\"141\":\"Kabutops\",\"142\":\"Aerodactyl\",\"143\":\"Snorlax\",\"144\":\"Articuno\",\"145\":\"Zapdos\",\"146\":\"Moltres\",\"147\":\"Dratini\",\"148\":\"Dragonair\",\"149\":\"Dragonite\",\"150\":\"Mewtwo\",\"151\":\"Mew\"}"),

        togglePokemonDiv: function(div, toggleOverride) {
            if(typeof toggleOverride == 'undefined') {
                if(div.attr("data-selected") == "true") {
                    div.addClass("hidden");
                    div.attr("data-selected", "false");
                } else {
                    div.removeClass("hidden");
                    div.attr("data-selected", "true");
                }
            } else {
                if(toggleOverride) {
                    div.addClass("hidden");
                    div.attr("data-selected", "false");
                } else {
                    div.removeClass("hidden");
                    div.attr("data-selected", "true");
                }
            }
        },

        init: function() {
            var self = this;

            this.initMap();

            this.initData(() => {
                this.loadSettings();
                this.initListeners();
            });

            if(!this.storage.available() || typeof this.storage.get("PGOM_show_welcome") !== 'string') {
                $('#init-modal').openModal();
            }

            $.each(this.pokemons, function(id, name) {
                $(".pokemon-list").append("<div class=\"pokemon-list-pokemon\" data-pokemon-id=\"" + id + "\" data-selected=\"true\"><div class=\"pokemon-list-pokemon-image pi pi-" + id + "\"></div><div class=\"pokemon-list-pokemon-name\">" + name + "</div></div>");
            });

            $("#shown-pokemons .pokemon-list-pokemon").on('click', function() {
                $("[data-setting=pokemons-show] .setting-controller").attr("disabled", "disabled");
            });

            $(".pokemon-list .pokemon-list-pokemon").on('click', function() {
                self.togglePokemonDiv($(this));
            });
        },

        locateUser: function() {
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
        },

        initListeners: function() {
            $("#settings-trigger").leanModal();

            $("#locate-trigger").on('click', () => {
                this.locateUser();
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

            this.map.on('click', (e) => {
                if(!this.working) {
                    if(this.clickedMarker != null) this.map.removeLayer(this.clickedMarker);
                    this.clickedMarker = L.marker(e.latlng, {
                        icon: L.icon.glyph({
                            prefix: 'mdi',
                            glyph: 'map-marker',
                            background: false,
                            glyphSize: '15pt'
                        })
                    }).addTo(this.map);
                }

                if(this.scanCircle != null) this.map.removeLayer(this.scanCircle);
                this.scanCircle = L.circle(e.latlng, 70, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    className: 'scanCircle'
                }).addTo(this.map);
            });

            $("#reset-pokemon-filter").on('click', () => {
                $("#shown-pokemons .pokemon-list-pokemon").removeClass("hidden").attr("data-selected", "true");
                $("[data-setting=pokemons-show] .setting-controller").attr("disabled", false).prop('checked', true);
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

            // start in Santa Monica
            this.map.setView(new L.LatLng(34.0095897345215,-118.49791288375856),16);
            this.map.addLayer(new L.TileLayer(osm.url, {
                minZoom: 2,
                maxZoom: 20,
                attribution: osm.attribution
            }));

            this.locateUser();
        },

        initData: function(callback) {
            var data = '{"Ok":true,"Error":"","Response":{"Encounters":[{"PokemonId":111,"Lat":34.009819233420174,"Lng":-118.49729894739845,"DisappearTime":1474041660},{"PokemonId":16,"Lat":34.00968226929167,"Lng":-118.49720771480791,"DisappearTime":1474041712},{"PokemonId":74,"Lat":34.00908765805943,"Lng":-118.49766387725647,"DisappearTime":1474041603},{"PokemonId":29,"Lat":34.009726545220296,"Lng":-118.4983025025673,"DisappearTime":1474041552},{"PokemonId":42,"Lat":34.009463687726715,"Lng":-118.4983937345529,"DisappearTime":1474041767}],"Pokestops":[{"Lat":34.010773,"Lng":-118.495416,"Lured":true},{"Lat":34.009735,"Lng":-118.497273,"Lured":true},{"Lat":34.011466,"Lng":-118.49527,"Lured":true},{"Lat":34.010538,"Lng":-118.496394,"Lured":true},{"Lat":34.010112,"Lng":-118.495739,"Lured":true},{"Lat":34.010408,"Lng":-118.495925,"Lured":true},{"Lat":34.012437,"Lng":-118.495773,"Lured":true},{"Lat":34.011857,"Lng":-118.495984,"Lured":false},{"Lat":34.013441,"Lng":-118.495774,"Lured":false},{"Lat":34.01461,"Lng":-118.496607,"Lured":false},{"Lat":34.01376,"Lng":-118.497972,"Lured":false},{"Lat":34.014702,"Lng":-118.495194,"Lured":false},{"Lat":34.014421,"Lng":-118.497406,"Lured":false},{"Lat":34.013515,"Lng":-118.49689,"Lured":true},{"Lat":34.014017,"Lng":-118.496258,"Lured":false},{"Lat":34.012984,"Lng":-118.497113,"Lured":true},{"Lat":34.012476,"Lng":-118.496885,"Lured":true},{"Lat":34.013926,"Lng":-118.495199,"Lured":false},{"Lat":34.012651,"Lng":-118.496124,"Lured":true},{"Lat":34.013247,"Lng":-118.497667,"Lured":false},{"Lat":34.010272,"Lng":-118.494909,"Lured":false},{"Lat":34.011254,"Lng":-118.492368,"Lured":false},{"Lat":34.012733,"Lng":-118.49291,"Lured":false},{"Lat":34.011083,"Lng":-118.494295,"Lured":false},{"Lat":34.011908,"Lng":-118.492863,"Lured":false},{"Lat":34.010985,"Lng":-118.49314,"Lured":false},{"Lat":34.011936,"Lng":-118.494929,"Lured":false},{"Lat":34.012549,"Lng":-118.494185,"Lured":false},{"Lat":34.009861,"Lng":-118.495626,"Lured":true},{"Lat":34.009471,"Lng":-118.497344,"Lured":true},{"Lat":34.008888,"Lng":-118.497316,"Lured":true},{"Lat":34.009034,"Lng":-118.497669,"Lured":true},{"Lat":34.009634,"Lng":-118.496498,"Lured":true}],"Gyms":[{"Lat":34.011332,"Lng":-118.495089,"Team":2},{"Lat":34.008184,"Lng":-118.497855,"Team":3}]}}';
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
                    L.marker([encounter.Lat, encounter.Lng], {
                        icon: new L.PokemonIcon({
                            html: '<div class="map-pokemon" data-pokemonid="' + encounter.PokemonId + '">' +
                                    '<div class="pi pi-' + encounter.PokemonId + ' pi-small" style="position: absolute; margin-top: -22px; margin-left: -22px"></div>' +
                                    '<div class="map-pokemon timer" data-expired="false" data-expiry="' + Math.round(new Date() / 1000 + (60 * 2)) + '">' +
                                        prettyTime(Math.round(new Date() / 1000 + (60 * 2)) - Math.round(new Date() / 1000)) +
                                    '</div>' +
                                  '</div>'
                        })
                    }).addTo(this.map);
                });

                setInterval(() => {
                    $(".map-pokemon.timer[data-expired=false]").each(function() {
                        var timeRemaining = parseInt($(this).data("expiry"), 10) - Math.round(new Date() / 1000);

                        if(timeRemaining < 0) {
                            $(this).parent().fadeTo(500, 0, function() {
                                $(this).css("visibility", "hidden");
                            });

                            $(this).attr("data-expired", true);
                        } else {
                            $(this).text(prettyTime(timeRemaining));
                        }
                    });
                }, 1000);

                $.each(data.Response.Pokestops, (k, pokestop) => {
                    L.marker([pokestop.Lat, pokestop.Lng], {
                        icon: new L.icon({
                            iconUrl: (pokestop.Lured ?
                                        'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/PstopLured.png' :
                                        'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Pstop.png'),
                            iconSize: [31, 31],
                            iconAnchor: [16, 16],
                            className: 'map-pokestop'
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
                        icon: new L.icon({
                            iconUrl: icon_url,
                            iconSize: [36, 36],
                            iconAnchor: [18, 18],
                            className: 'map-gym'
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
            var self = this;

            var hiddenPokemonTmp = [];

            $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                var hidden = !($(this).attr("data-selected") == 'true');
                self.togglePokemonDiv($(this), hidden);

                if(hidden) {
                    $(".map-pokemon[data-pokemonid=" + $(this).attr("data-pokemon-id") + "] .map-pokemon.timer[data-expired=false]").fadeTo(500, 0, function() {
                        $(this).parent().css("visibility", "hidden");
                    });

                    hiddenPokemonTmp.push($(this).attr("data-pokemon-id"));
                } else {
                    $(".map-pokemon[data-pokemonid=" + $(this).attr("data-pokemon-id") + "] .map-pokemon.timer[data-expired=false]").fadeTo(0, 500, function() {
                        $(this).parent().css("visibility", "visible");
                    });
                }
            });

            if(this.hiddenPokemon == hiddenPokemonTmp || hiddenPokemonTmp.length == 0) {
                if(!this.settings['pokemons-show']) {
                    $(".map-pokemon .timer[data-expired=false]").fadeTo(500, 0, function() {
                        $(this).parent().css("visibility", "hidden");
                    });

                    $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                        self.togglePokemonDiv($(this), true);
                    });
                } else {
                    $(".map-pokemon .timer[data-expired=false]").fadeTo(0, 500, function() {
                        $(this).parent().css("visibility", "visible");
                    });

                    $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                        self.togglePokemonDiv($(this), false);
                    });
                }
            }

            this.hiddenPokemon = hiddenPokemonTmp;

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
