(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

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
        objectUUIDs: {
            pokestops: [],
            gyms: [],
            pokemons: []
        },
        currentPosition: {
            lng: 0,
            lat: 0
        },
        api: {
            url: 'https://api.openpokemap.pw',
            timeout: 33 // seconds
        },
        pokemons: {},

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
            $(document).ajaxError(function() {
                Materialize.toast('An error occured when excecuting a task.', 6000, 'red');
            });

            var self = this;

            self.initMap(function() {
                self.initData(function() {
                    self.loadSettings();
                    self.initListeners();

                    setTimeout(function() {
                        if(jQuery.browser.mobile) $("a:not([href^=#])").attr("target", "_blank");
                    }, 350);
                });
            });

            if(!self.storage.available() || typeof self.storage.get("PGOM_show_welcome") !== 'string') {
                $('#init-modal').openModal();
            }

            $.each(self.pokemons, function(id, name) {
                $(".pokemon-list").append("<div class=\"pokemon-list-pokemon\" data-pokemon-id=\"" + id + "\" data-selected=\"true\"><div class=\"pokemon-list-pokemon-image pi pi-" + id + "\"></div><div class=\"pokemon-list-pokemon-name\">" + name + "</div></div>");
            });

            self.calibratePokemonList();

            $("#shown-pokemons .pokemon-list-pokemon").on('click', function() {
                $("[data-setting=pokemons-show] .setting-controller").attr("disabled", "disabled");
            });

            $(".pokemon-list .pokemon-list-pokemon").on('click', function() {
                self.togglePokemonDiv($(this));
            });

            $(window).on('resize', function() {
                self.calibratePokemonList();
            });
        },

        calibratePokemonList: function() {
            if($(window).width() <= 800) {
                $(".pokemon-list-pokemon").each(function() {
                    if($(this).attr('data-resized') != 'true') {
                        $(this).attr('data-resized', 'true');

                        $(this).css({
                            width: '50px',
                            height: '50px',
                            'border-radius': '6px',
                        });

                        $(this).find('.pokemon-list-pokemon-image').css({
                            transform: 'scale(0.5)'
                        });

                        $(this).find('.pokemon-list-pokemon-name').css({
                            'font-size': '5pt'
                        });
                    }
                });
            } else {
                $(".pokemon-list-pokemon").each(function() {
                    if($(this).attr('data-resized') != 'false') {
                        $(this).attr('data-resized', 'false');

                        $(this).css({
                            width: '100px',
                            height: '100px',
                            'border-radius': '11px',
                        });

                        $(this).find('.pokemon-list-pokemon-image').css({
                            transform: 'scale(1)'
                        });

                        $(this).find('.pokemon-list-pokemon-name').css({
                            'font-size': '12pt'
                        });
                    }
                });
            }
        },

        locateUser: function() {
            var self = this;

            try {
                if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(location) {
                        self.map.setView(new L.LatLng(location.coords.latitude, location.coords.longitude), 15);

                        L.marker([location.coords.latitude, location.coords.longitude], {
                            icon: L.icon.glyph({
                                prefix: 'mdi',
                                glyph: 'account-location',
                                background: false,
                                glyphSize: '15pt'
                            })
                        }).addTo(self.map);
                    });
                }
            } catch(e){}//ignored
        },

        initListeners: function() {
            var self = this;

            $("#settings-trigger").leanModal();

            $("#locate-trigger").on('click', function() {
                self.locateUser();
            });

            $("#save-settings").on('click', function() {
                self.saveSettings();
            });

            $("#exit-welcome").on('click', function() {
                if(!$("#show-again-welcome").is(':checked')) {
                    if(self.storage.available()) {
                        self.storage.append('PGOM_show_welcome', false);
                    }
                }
            });

            self.map.on('click', function(e) {
                if(!self.working) {
                    self.working = true;

                    if(self.clickedMarker != null) self.map.removeLayer(self.clickedMarker);
                    self.clickedMarker = L.marker(e.latlng, {
                        icon: L.icon.glyph({
                            prefix: 'mdi',
                            glyph: 'map-marker',
                            background: false,
                            glyphSize: '15pt'
                        })
                    }).addTo(self.map);

                    if(self.scanCircle != null) self.map.removeLayer(self.scanCircle);
                    self.scanCircle = L.circle(e.latlng, 70, {
                        color: '#ff6600',
                        fillColor: '#ff6600',
                        fillOpacity: 0.5,
                        className: 'scanCircle'
                    }).addTo(self.map);

                    self.loadCache(e.latlng.lat, e.latlng.lng, function(){});

                    $.ajax({
                        type: 'POST',
                        url: self.api.url + '/q',
                        data: 'lat=' + e.latlng.lat + '&lng=' + e.latlng.lng,
                        timeout: self.api.timeout * 1000,
                        success: function(data) {
                            if(typeof data !== 'object') data = $.parseJSON(data);

                            self.handleData(data, function(status) {
                                self.working = false;

                                var color = status ? '#8B008B' : '#ff0000';

                                if(self.scanCircle != null) self.map.removeLayer(self.scanCircle);
                                self.scanCircle = L.circle(e.latlng, 70, {
                                    color: color,
                                    fillColor: color,
                                    fillOpacity: 0.5
                                }).addTo(self.map);
                            });
                        }
                    });
                }
            });

            $("#reset-pokemon-filter").on('click', function() {
                $("#shown-pokemons .pokemon-list-pokemon").removeClass("hidden").attr("data-selected", "true");
                $("[data-setting=pokemons-show] .setting-controller").attr("disabled", false).prop('checked', true);
            });

            setInterval(function() {
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
        },

        initMap: function(callback) {
            var self = this;

            self.map = new L.Map('map', {
                zoomControl: false,
                attributionControl: false
            });

            // start in Santa Monica
            self.map.setView(new L.LatLng(34.0095897345215,-118.49791288375856),16);

            self.currentPosition.lat = 34.0095897345215
            self.currentPosition.lng = -118.49791288375856;

            L.control.attribution({
                position: 'topright',
                prefix: 'Leaflet | Map tiles hosted by <a href="https://fastpokemap.se" target="_blank">FPM</a> | © OpenStreetMap contributors'
            }).addTo(self.map);

            var gl = L.mapboxGL({
                accessToken: "opm",
                style: 'static/data/map.json'
            }).addTo(self.map);

            self.locateUser();

            callback();
        },

        initData: function(callback) {
            var self = this;

            $.ajax({
                url: 'static/data/pokemon.json',
                success: function(data) {
                    if(typeof data !== 'object') $.parseJSON(data);

                    self.pokemons = data;

                    self.loadCache(self.currentPosition.lat, self.currentPosition.lng, function() {
                        callback();
                    });
                }
            });
        },

        loadCache: function(lat, lng, cb) {
            var self = this;

            $.ajax({
                type: 'POST',
                url: self.api.url + '/c',
                data: 'lat=' + lat + '&lng=' + lng,
                timeout: self.api.timeout * 1000,
                success: function(data) {
                    if(typeof data !== 'object') data = $.parseJSON(data);

                    self.handleData(data, function() {
                        cb();
                    });
                }
            });
        },

        handleData: function(data, callback) {
            var self = this;

            if(data.Ok === true && data.Error.length === 0 && typeof data === 'object') {
                $.each(data.MapObjects, function(k, mapObject) {
                    if(mapObject.Type == 1) {
                        if(self.objectUUIDs.pokemons.indexOf(mapObject.Id) == -1) {
                            var marker = L.marker([mapObject.Lat, mapObject.Lng], {
                                icon: new L.PokemonIcon({
                                    html: '<div class="map-pokemon" data-pokemonid="' + mapObject.PokemonId + '">' +
                                            '<div class="pi pi-' + mapObject.PokemonId + ' pi-small" style="position: absolute; margin-top: -22px; margin-left: -22px"></div>' +
                                            '<div class="map-pokemon timer" data-expired="false" data-expiry="' + mapObject.Expiry + '">' +
                                                prettyTime(mapObject.Expiry - Math.round(new Date() / 1000)) +
                                            '</div>' +
                                          '</div>'
                                })
                            }).addTo(self.map);

                            marker.addEventListener("mouseover", function() {
                                var markers = document.getElementsByClassName("leaflet-marker-pane")[0].childNodes;
                                self.map.eachLayer(function(layer) {
                                    if(typeof layer._icon !== 'undefined')
                                        if(typeof layer._icon.className !== 'undefined')
                                            if(layer._icon.className.indexOf('leaflet-marker-icon'))
                                                layer.setZIndexOffset(1);
                                });
                                this.setZIndexOffset(9999);
                            });

                            self.objectUUIDs.pokemons.push(mapObject.Id);
                        }
                    } else if(mapObject.Type == 2) {
                        if(self.objectUUIDs.pokestops.indexOf(mapObject.Id) == -1) {
                            L.marker([mapObject.Lat, mapObject.Lng], {
                                icon: new L.icon({
                                    iconUrl: (mapObject.Lured ?
                                                'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/PstopLured.png' :
                                                'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Pstop.png'),
                                    iconSize: [31, 31],
                                    iconAnchor: [16, 16],
                                    className: 'map-pokestop'
                                })
                            }).addTo(self.map);

                            self.objectUUIDs.pokestops.push(mapObject.Id);
                        }
                    } else if (mapObject.Type == 3) {
                        if(self.objectUUIDs.gyms.indexOf(mapObject.Id) == -1) {
                            var icon_url = 'https://raw.githubusercontent.com/PokemonGoMap/PokemonGo-Map/develop/static/forts/Harmony.png';

                            switch(mapObject.Team) {
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

                            L.marker([mapObject.Lat, mapObject.Lng], {
                                icon: new L.icon({
                                    iconUrl: icon_url,
                                    iconSize: [36, 36],
                                    iconAnchor: [18, 18],
                                    className: 'map-gym'
                                })
                            }).addTo(self.map);

                            self.objectUUIDs.gyms.push(mapObject.Id);
                        }
                    }
                });

                callback(true);
            } else {
                console.error("Invalid data");
                Materialize.toast((typeof data.Error !== 'undefined' ? data.Error : 'An error occured when fetching map objects.'), 6000, 'red');
                callback(false);
            }
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
            var self = this;

            if(self.storage.available()) {
                if(typeof self.storage.get('PGOM_settings') !== 'undefined') {
                    try {
                        $.each($.parseJSON(window.atob(self.storage.get('PGOM_settings'))), function(key, value) {
                            self.settings[key] = value;

                            if($("[data-setting=" + key + "]").length > 0) {
                                if(typeof value === 'boolean') {
                                    $("[data-setting=" + key + "]").find("input.setting-controller").attr("checked", value);
                                }

                                if(typeof value === 'string') {
                                    $("[data-setting=" + key + "]").find("input.setting-controller").val(value);
                                }
                            }
                        });

                        self.updateSettings();
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

            if(self.hiddenPokemon == hiddenPokemonTmp || hiddenPokemonTmp.length == 0) {
                if(!self.settings['pokemons-show']) {
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

            self.hiddenPokemon = hiddenPokemonTmp;

            if(!self.settings['pokestops-show']) {
                $(".map-pokestop").fadeTo(500, 0, function() {
                    $(this).css("visibility", "hidden");
                });
            } else {
                $(".map-pokestop").fadeTo(0, 500, function() {
                    $(this).css("visibility", "visible");
                });
            }

            if(!self.settings['gyms-show']) {
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
            var self = this;

            var settings = new Object();

            $("[data-setting]").each(function() {
                var controller = $(this).find("input.setting-controller");

                settings[$(this).data("setting")] = controller.attr("type") === 'checkbox' ? (controller.is(':checked')) : controller.val();
            });

            self.settings = settings;

            self.updateSettings();

            self.storage.append('PGOM_settings', btoa(JSON.stringify(settings)));
        }
    };

    app.init();
});
