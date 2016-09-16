$(function() {
    function prettyTime(seconds) {
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds - minutes * 60;

        return ("0" + minutes).slice(-2) + ":" + ("0" + remainingSeconds).slice(-2);
    }

    /* custom leaflet plugins */
    L.PokemonIcon = L.Icon.extend({
        options: {
            iconSize: [28, 26],
            iconAnchor: [14, 13]
        },

        initialize: function(options) {
            L.Util.setOptions(this, options);
        },
        createIcon: function() {
            var remaining = this.options.pokemon.expiry - Math.round(new Date() / 1000);

            var container = document.createElement('div');

            container.className = 'map-pokemon';
            container.dataset.pokemonid = this.options.pokemon.id;
            container.style.width = '28px';
            container.style.height = '26px';
            container.innerHTML = '<div class="pi pi-' + this.options.pokemon.id + ' pi-small" style="position: absolute; margin-top: -20px; margin-left: -20px"></div><div class="map-pokemon timer" data-expired="false" data-expiry="' + this.options.pokemon.expiry + '">' + prettyTime(remaining) + '</div>';

            return container;
        },
        createShadow: function() {
            return null;
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

            this.initListeners();
            this.initMap();

            this.initData(() => {
                this.loadSettings();
            });

            if(!this.storage.available() || typeof this.storage.get("PGOM_show_welcome") !== 'string') {
                $('#init-modal').openModal();
            }

            $.each(this.pokemons, function(id, name) {
                $(".pokemon-list").append("<div class=\"pokemon-list-pokemon\" data-pokemon-id=\"" + id + "\" data-selected=\"true\"><div class=\"pokemon-list-pokemon-image pi pi-" + id + "\"></div><div class=\"pokemon-list-pokemon-name\">" + name + "</div></div>");
            });

            $(".pokemon-list .pokemon-list-pokemon").on('click', function() {
                self.togglePokemonDiv($(this));
            });
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
                        icon: new L.PokemonIcon({
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

            $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                var hidden = !($(this).attr("data-selected") == 'true');
                self.togglePokemonDiv($(this), hidden);

                if(hidden) {
                    $(".map-pokemon[data-pokemonid=" + $(this).attr("data-pokemon-id") + "][data-expired=false]").fadeTo(500, 0, function() {
                        $(this).css("visibility", "hidden");
                    });
                } else {
                    $(".map-pokemon[data-pokemonid=" + $(this).attr("data-pokemon-id") + "][data-expired=false]").fadeTo(0, 500, function() {
                        $(this).css("visibility", "visible");
                    });
                }
            });

            if(!this.settings['pokemons-show']) {
                $(".map-pokemon[data-expired=false]").fadeTo(500, 0, function() {
                    $(this).css("visibility", "hidden");
                });

                $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                    self.togglePokemonDiv($(this), false);
                });
            } else {
                $(".map-pokemon[data-expired=false]").fadeTo(0, 500, function() {
                    $(this).css("visibility", "visible");
                });

                $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                    self.togglePokemonDiv($(this), true);
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
