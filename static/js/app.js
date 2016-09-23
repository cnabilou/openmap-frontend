(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

var publicMap = null;

$(function() {
    $('.tooltipped').tooltip({delay: 50});

    /* app */
    var app = {
        map: null,
        settings: {},
        scanCircle: null,
        working: false,
        hiddenPokemon: [],
        currentPosition: {
            lng: 0,
            lat: 0
        },
        lastCachePosition: {
            lng: 0,
            lat: 0
        },
        api: {
            url: 'https://api.openpokemap.pw',
            timeout: 33 // seconds
        },
        pokemons: {},
        geolocationUpdater: null,
        autoCenter: true,

        prettyTime: function(seconds) {
            var minutes = Math.floor(seconds / 60);
            var remainingSeconds = seconds - minutes * 60;

            return ("0" + minutes).slice(-2) + ":" + ("0" + remainingSeconds).slice(-2);
        },

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
                Materialize.toast('An error occured when loading an external resource', 6000, 'red');
            });

            var self = this;

            var unsupported = [];

            $("#map").css("height", $(window).height());
            $("body").css({
                height: $(window).height(),
                overflow: 'hidden'
            });

            self.initMap(function() {
                publicMap = self.map;

                self.locateUser();

                self.initData(function() {
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

                    self.loadSettings();
                    self.initListeners();

                    setTimeout(function() {
                        if(jQuery.browser.mobile) $("a:not([href^=#])").attr("target", "_blank");
                    }, 350);
                });
            });

            if(!self.storage.available()) {
                unsupported.push("localStorage – settings are not saved");
            }

            if(!self.storage.available() || typeof self.storage.get("PGOM_show_welcome") !== 'string') {
                $('#init-modal').openModal();
            }

            if(!mapboxgl.supported()) {
                unsupported.push("GL – map won't work");
            }

            if(unsupported.length > 0) {
                $("#no-support-modal").find("#unsupported").innerHTML("<li>" + unsupported.join("</li><li>") + "</li>");
                $("#no-support-modal").openModal();
            }

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
                        self.updatePosition(location);
                    });
                }
            } catch(e){}//ignored
        },

        updatePosition: function(location) {
            var self = this;

            if(this.autoCenter) this.map.easeTo({
                center: [location.coords.longitude, location.coords.latitude],
                zoom: 15,
                curve: 1,
                easing: function(t) {
                    return t;
                }
            });

            $(".map-currentlocation").remove();

            var marker = document.createElement('div');
            marker.className = 'map-currentlocation';
            marker.innerHTML = ' ';

            var mark = new mapboxgl.Marker(marker)
                .setLngLat([location.coords.longitude, location.coords.latitude])
                .addTo(self.map);

            self.currentLocationMarker = mark;

            self.currentPosition.lat = location.coords.latitude;
            self.currentPosition.lng = location.coords.longitude;


            if(self.distanceBetween(location.coords.latitude, location.coords.longitude, self.lastCachePosition.lat, self.lastCachePosition.lng) > 300) {
                self.loadCache(location.coords.longitude, location.coords.latitude, function(){});

                self.lastCachePosition.lat = location.coords.latitude;
                self.lastCachePosition.lng = location.coords.longitude;
            }
        },

        initListeners: function() {
            var self = this;

            $("#settings-trigger").leanModal();
            $("#donate-trigger").leanModal();
            $("#faq-trigger").leanModal();

            $("#locate-trigger").on('click', function() {
                self.locateUser();
            });

            $("#save-settings").on('click', function() {
                self.saveSettings();
            });

            $("#reload-trigger").on('click', function() {
                self.loadCache(self.currentPosition.lat, self.currentPosition.lng, function(){});
            });

            $("#exit-welcome").on('click', function() {
                if(!$("#show-again-welcome").is(':checked')) {
                    if(self.storage.available()) {
                        self.storage.append('PGOM_show_welcome', false);
                    }
                }
            });

            $("#restore-pitchbearing").on('click', function() {
                self.map.setPitch(0);
                self.map.setBearing(0);
            });

            self.map.on('click', function(e) {
                if(!self.working) {
                    self.working = true;

                    if(self.scanCircle != null) self.map.removeLayer(self.scanCircle);
                    self.scanCircle = self.createCircle(self.map, [e.lngLat.lng, e.lngLat.lat], 70, '#ff6600');

                    $(".map-scancircle-marker").remove();

                    var marker = document.createElement('div');
                    marker.className = 'map-scancircle-marker';
                    marker.innerHTML = '<i class="mdi mdi-map-marker-circle"></i>';

                    var mark = new mapboxgl.Marker(marker)
                        .setLngLat([e.lngLat.lng, e.lngLat.lat])
                        .addTo(self.map);

                    self.loadCache(e.lngLat.lat, e.lngLat.lng, function(){});

                    $.ajax({
                        type: 'POST',
                        url: self.api.url + '/q',
                        data: 'lat=' + e.lngLat.lat + '&lng=' + e.lngLat.lng,
                        timeout: self.api.timeout * 1000,
                        success: function(data) {
                            if(typeof data !== 'object') data = $.parseJSON(data);

                            self.handleData(data, function(status) {
                                self.working = false;

                                var color = status ? '#8B008B' : '#ff0000';

                                if(self.scanCircle != null) self.map.setPaintProperty(self.scanCircle, 'fill-color', color);
                            });
                        },
                        error: function() {
                            self.working = false;

                            if(self.scanCircle != null) self.map.setPaintProperty(self.scanCircle, 'fill-color', '#ff0000');
                        }
                    });
                }
            });

            $("#reset-pokemon-filter").on('click', function() {
                $("#shown-pokemons .pokemon-list-pokemon").removeClass("hidden").attr("data-selected", "true");
                $("[data-setting=pokemons-show] .setting-controller").attr("disabled", false).prop('checked', true);
            });

            setInterval(function() {
                $(".map-pokemon-timer[data-expired=false]").each(function() {
                    var timeRemaining = parseInt($(this).data("expiry"), 10) - Math.round(new Date() / 1000);

                    if(timeRemaining < 0) {
                        $(this).parent().fadeTo(500, 0, function() {
                            $(this).css("visibility", "hidden");
                        });

                        $(this).attr("data-expired", true);
                    } else {
                        $(this).text(self.prettyTime(timeRemaining));
                    }
                });
            }, 1000);

            self.map.on('dragend', function() {
                self.currentPosition.lat = self.map.getCenter().lat;
                self.currentPosition.lng = self.map.getCenter().lng;

                var distance = self.distanceBetween(self.currentPosition.lat, self.currentPosition.lng, self.lastCachePosition.lat, self.lastCachePosition.lng);

                if(distance > 700 && self.map.getZoom() >= 14) {
                    self.loadCache(self.currentPosition.lat, self.currentPosition.lng, function(){});
                }
            });
        },

        distanceBetween: function(lat1, lon1, lat2, lon2) {
            var R = 6371;
            var dLat = this.deg2rad(lat2-lat1);
            var dLon = this.deg2rad(lon2-lon1);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            return d * 1000;
        },

        deg2rad: function(deg) {
            return deg * (Math.PI/180);
        },

        initMap: function(callback) {
            var self = this;

            self.currentPosition.lat = 34.0095897345215;
            self.currentPosition.lng = -118.49791288375856;

            mapboxgl.accessToken = 'tk.opm';
            mapboxgl.config.API_URL = 'http://tiles.fastpokemap.se';

            self.map = new mapboxgl.Map({
                container: 'map',
                style: 'static/data/map.json',
                hash: false,
                scrollZoom: true,
                center: [self.currentPosition.lng, self.currentPosition.lat],
                zoom: 15,
                attributionControl: {
                    position: 'top-right'
                }
            });

            self.map.on('load', function(){callback();});
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

            self.lastCachePosition.lat = lat;
            self.lastCachePosition.lng = lng;

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

        createCircle: function(map, center, radius, color) {
            var coords = {
                latitude: center[1],
                longitude: center[0]
            };

            radius = radius / 1000; // meters to km

            var ret = [];
            var distanceX = radius / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
            var distanceY = radius / 110.574;

            var theta, x, y;
            for(var i=0; i < 128; i++) {
                theta = (i / 128) * (2 * Math.PI);
                x = distanceX * Math.cos(theta);
                y = distanceY * Math.sin(theta);

                ret.push([coords.longitude+x, coords.latitude+y]);
            }
            ret.push(ret[0]);

            var geojson = {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [ret]
                        }
                    }]
                }
            };

            var randomId = Math.random().toString(36).substr(2, 5);

            map.addSource(randomId, geojson);

            map.addLayer({
                id: randomId,
                type: "fill",
                source: randomId,
                layout: {},
                paint: {
                    "fill-color": color,
                    "fill-opacity": 0.5
                }
            });

            return randomId;
        },

        handleData: function(data, callback) {
            var self = this;

            if(data.Ok === true && data.Error.length === 0 && typeof data === 'object') {
                $.each(data.MapObjects, function(k, mapObject) {
                    $("[data-uniqueid='" + mapObject.Id + "']").remove();

                    if(mapObject.Type == 1 && !!self.settings['pokemons-show']) {
                        var marker = document.createElement('div');
                        marker.className = 'map-pokemon';
                        marker.dataset.pokemonid = mapObject.PokemonId.toString();
                        marker.dataset.uniqueid = mapObject.Id;
                        marker.innerHTML = '<div class="pi pi-small pi-' + mapObject.PokemonId + '"></div><div class="map-pokemon-timer" data-expired="false" data-expiry="' + mapObject.Expiry + '">' + self.prettyTime(mapObject.Expiry - Math.round(new Date() / 1000)) + '</div>';

                        new mapboxgl.Marker(marker)
                            .setLngLat([+mapObject.Lng, +mapObject.Lat])
                            .addTo(self.map);
                    } else if(mapObject.Type == 2 && !!self.settings['pokestops-show']) {
                        var marker = document.createElement('div');
                        marker.dataset.uniqueid = mapObject.Id;
                        marker.className = 'map-pokestop ' + (mapObject.Lured ? 'map-pokestop-lured' : '');

                        new mapboxgl.Marker(marker)
                            .setLngLat([+mapObject.Lng, +mapObject.Lat])
                            .addTo(self.map);
                    } else if (mapObject.Type == 3 && !!self.settings['gyms-show']) {
                        var team = 'harmony';

                        switch(mapObject.Team) {
                            case 1:
                                team = 'mystic';
                                break;
                            case 2:
                                team = 'valor';
                                break;
                            case 3:
                                team = 'instinct';
                                break;
                        }

                        var marker = document.createElement('div');
                        marker.dataset.uniqueid = mapObject.Id;
                        marker.className = 'map-gym map-gym-' + team;

                        new mapboxgl.Marker(marker)
                            .setLngLat([+mapObject.Lng, +mapObject.Lat])
                            .addTo(self.map);
                    }
                });

                callback(true);
            } else {
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
                    $(".map-pokemon[data-pokemonid=" + $(this).attr("data-pokemon-id") + "] .map-pokemon-timer[data-expired=false]").fadeTo(500, 0, function() {
                        $(this).parent().css("visibility", "hidden");
                    });

                    hiddenPokemonTmp.push($(this).attr("data-pokemon-id"));
                } else {
                    $(".map-pokemon[data-pokemonid=" + $(this).attr("data-pokemon-id") + "] .map-pokemon-timer[data-expired=false]").fadeTo(0, 500, function() {
                        $(this).parent().css("visibility", "visible");
                    });
                }
            });

            if(self.hiddenPokemon == hiddenPokemonTmp || hiddenPokemonTmp.length == 0 || hiddenPokemonTmp.length == $("#shown-pokemons .pokemon-list-pokemon").length) {
                if(!self.settings['pokemons-show']) {
                    $(".map-pokemon .map-pokemon-timer[data-expired=false]").fadeTo(500, 0, function() {
                        $(this).parent().css("visibility", "hidden");
                    });

                    $("#shown-pokemons .pokemon-list-pokemon").each(function() {
                        self.togglePokemonDiv($(this), true);
                    });
                } else {
                    $(".map-pokemon .map-pokemon-timer[data-expired=false]").fadeTo(0, 500, function() {
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

            if(!self.settings['3d-map']) {
                self.map.dragRotate.disable();
                self.map.touchZoomRotate.disableRotation();
            } else {
                self.map.dragRotate.enable();
                self.map.touchZoomRotate.enableRotation();
            }

            if(!self.settings['geolocation-autoupdate']) {
                if(self.geolocationUpdater !== null) {
                    try {
                        navigator.geolocation.clearWatch(self.geolocationUpdater);

                        self.geolocationUpdater = null;
                    } catch(e){}//ignored
                }
            } else {
                if(self.geolocationUpdater === null) {
                    self.geolocationUpdater = navigator.geolocation.watchPosition(function(loc){self.updatePosition(loc)}, function(e){console.error('GeolocationWatch',e);}, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                }
            }

            if(!self.settings['geolocation-autocenter']) {
                self.autoCenter = false;
            } else {
                self.autoCenter = true;
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
