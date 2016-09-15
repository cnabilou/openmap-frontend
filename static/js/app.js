$(function() {
    var app = {
        map: null,

        init: function() {
            this.loadSettings();
            this.initListeners();
            this.initMap();

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
        	this.map.setView(new L.LatLng(39.1, -94),5);
        	this.map.addLayer(new L.TileLayer(osm.url, {
                minZoom: 2,
                maxZoom: 17,
                attribution: osm.attribution
            }));
        	//map.on('click', onMapClick);
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
                            if($("[data-setting=" + key + "]").length > 0) {
                                if(typeof value === 'boolean') {
                                    $("[data-setting=" + key + "]").find("input.setting-controller").attr("checked", value);
                                }

                                if(typeof value === 'string') {
                                    $("[data-setting=" + key + "]").find("input.setting-controller").val(value);
                                }
                            }
                        });
                    } catch(e){} // ignored
                }
            }
        },

        saveSettings: function() {
            var settings = new Object();

            $("[data-setting]").each(function() {
                var controller = $(this).find("input.setting-controller");

                settings[$(this).data("setting")] = controller.attr("type") === 'checkbox' ? (controller.is(':checked')) : controller.val();
            });

            this.storage.append('PGOM_settings', btoa(JSON.stringify(settings)));
        }
    };

    app.init();
});
