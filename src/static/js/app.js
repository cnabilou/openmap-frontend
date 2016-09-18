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

                setTimeout(function() {
                    if(jQuery.browser.mobile) $("a").attr("target", "_blank");
                }, 350);
            });

            if(!this.storage.available() || typeof this.storage.get("PGOM_show_welcome") !== 'string') {
                $('#init-modal').openModal();
            }

            $.each(this.pokemons, function(id, name) {
                $(".pokemon-list").append("<div class=\"pokemon-list-pokemon\" data-pokemon-id=\"" + id + "\" data-selected=\"true\"><div class=\"pokemon-list-pokemon-image pi pi-" + id + "\"></div><div class=\"pokemon-list-pokemon-name\">" + name + "</div></div>");
            });

            this.calibratePokemonList();

            $("#shown-pokemons .pokemon-list-pokemon").on('click', function() {
                $("[data-setting=pokemons-show] .setting-controller").attr("disabled", "disabled");
            });

            $(".pokemon-list .pokemon-list-pokemon").on('click', function() {
                self.togglePokemonDiv($(this));
            });

            $(window).on('resize', () => {
                this.calibratePokemonList();
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

            // start in Santa Monica
            this.map.setView(new L.LatLng(34.0095897345215,-118.49791288375856),16);

            var gl = L.mapboxGL({
                accessToken: "opm",
                style: 'static/data/map.json'
            }).addTo(this.map);

            console.log(gl);

            this.locateUser();
        },

        initData: function(callback) {
            var data = '{"Ok":true,"Error":"","Response":{"Encounters":[{"EncounterId":"8e9jbrvik565","PokemonId":41,"Lat":34.009819233420174,"Lng":-118.49729894739845,"DisappearTime":1474178460},{"EncounterId":"1q5lbgh7othd9","PokemonId":41,"Lat":34.00968226929167,"Lng":-118.49720771480791,"DisappearTime":1474178512},{"EncounterId":"rfhoar6a5it9","PokemonId":29,"Lat":34.00908765805943,"Lng":-118.49766387725647,"DisappearTime":1474178403},{"EncounterId":"10qlayj1vwzb1","PokemonId":23,"Lat":34.009726545220296,"Lng":-118.4983025025673,"DisappearTime":1474178352},{"EncounterId":"s7xku0h6g99p","PokemonId":35,"Lat":34.009463687726715,"Lng":-118.4983937345529,"DisappearTime":1474178567}],"Pokestops":[{"Id":"31b1a0e2cadf4603855ff5a5d80ef225.16","Lat":34.010773,"Lng":-118.495416,"Lured":true},{"Id":"455be2e5e5c34b40b20dcde1d6c4277f.16","Lat":34.009735,"Lng":-118.497273,"Lured":true},{"Id":"554204bdc6cb4733955f11f7e6d57b8a.16","Lat":34.011466,"Lng":-118.49527,"Lured":true},{"Id":"afee005c1ec94567b727a8f74202dec0.16","Lat":34.010538,"Lng":-118.496394,"Lured":true},{"Id":"b13d36808456456fb94fcf4135d53ddc.16","Lat":34.010112,"Lng":-118.495739,"Lured":true},{"Id":"c419e15ba3664ce8bc90267b4ecc3ebc.16","Lat":34.010408,"Lng":-118.495925,"Lured":true},{"Id":"dd2631e4ab1640a3ade21c33477bca05.11","Lat":34.012437,"Lng":-118.495773,"Lured":false},{"Id":"ecb032d8d16747dbad9fbc688f8d174b.16","Lat":34.011857,"Lng":-118.495984,"Lured":true},{"Id":"07b36878051c407db7d2eb998005128a.16","Lat":34.013441,"Lng":-118.495774,"Lured":false},{"Id":"3c1b1a44c72d4819a225b8139bcfd97e.16","Lat":34.01461,"Lng":-118.496607,"Lured":false},{"Id":"42325090f1f443c499a765a06850c435.16","Lat":34.01376,"Lng":-118.497972,"Lured":false},{"Id":"5420f52faf294cdcbba72166743ef45b.16","Lat":34.014702,"Lng":-118.495194,"Lured":false},{"Id":"69f67ced424c4c01b4085b4e75934f58.16","Lat":34.014421,"Lng":-118.497406,"Lured":false},{"Id":"6d30b3a215c6425e92541545e6637d01.16","Lat":34.013515,"Lng":-118.49689,"Lured":true},{"Id":"aac7612eca764277956959f3a1380689.16","Lat":34.014017,"Lng":-118.496258,"Lured":false},{"Id":"d027600e9f9b4756bc5c349ffe9c12ef.16","Lat":34.012984,"Lng":-118.497113,"Lured":true},{"Id":"d09c2c7324aa4402a0f5726bfbba8c0a.16","Lat":34.012476,"Lng":-118.496885,"Lured":true},{"Id":"ddb018b0d1fc46aba1255da2638a0a6e.16","Lat":34.013926,"Lng":-118.495199,"Lured":false},{"Id":"e16e794938aa44db88e8b8de485ea1f2.16","Lat":34.012651,"Lng":-118.496124,"Lured":false},{"Id":"ec7803793b3a4c7fb8c4c02d8e1c619d.16","Lat":34.013247,"Lng":-118.497667,"Lured":true},{"Id":"191a498f1cf44e809eab78de38be4695.16","Lat":34.010272,"Lng":-118.494909,"Lured":true},{"Id":"22a32e1dfb374e87a7ab23e5174a68e8.16","Lat":34.011254,"Lng":-118.492368,"Lured":true},{"Id":"4b739387b2544096b8bb217c94d4bc78.16","Lat":34.012733,"Lng":-118.49291,"Lured":false},{"Id":"5acf98b543da4f409fc4abb0b74d7f97.16","Lat":34.011083,"Lng":-118.494295,"Lured":false},{"Id":"7d7e131648b04788ba2a973a86ee6db4.16","Lat":34.011908,"Lng":-118.492863,"Lured":false},{"Id":"af9f7d0bded04f6fb023b855b4e63dae.16","Lat":34.010985,"Lng":-118.49314,"Lured":false},{"Id":"c0a44be424084084a446ed5bb8fd76ff.16","Lat":34.011936,"Lng":-118.494929,"Lured":false},{"Id":"f997334e35b04f59967d97084f3ec95d.12","Lat":34.012549,"Lng":-118.494185,"Lured":false},{"Id":"11410a03fc7f4c9f9c392e8fb2353fac.16","Lat":34.009861,"Lng":-118.495626,"Lured":true},{"Id":"246cd78fc6cb4addb7ff69d695eca867.12","Lat":34.009471,"Lng":-118.497344,"Lured":true},{"Id":"7081ff4cf8644457ac9387ff28917291.16","Lat":34.008888,"Lng":-118.497316,"Lured":true},{"Id":"975805c30dc6403ab07856c607e9e9a9.12","Lat":34.009034,"Lng":-118.497669,"Lured":true},{"Id":"c289811dc758426f9c4f0b6f0ae71ecc.16","Lat":34.009634,"Lng":-118.496498,"Lured":false}],"Gyms":[{"Id":"83ce2471671845a3b94d8f551dd5cd95.12","Lat":34.011332,"Lng":-118.495089,"Team":3},{"Id":"6e783aa133da45e7b7b82d46fab7b634.12","Lat":34.008184,"Lng":-118.497855,"Team":2}]}}';
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
                    if(this.objectUUIDs.pokemons.indexOf(encounter.EncounterId) == -1) {
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

                        this.objectUUIDs.pokemons.push(encounter.EncounterId);
                    }
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
                    if(this.objectUUIDs.pokestops.indexOf(pokestop.Id) == -1) {
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

                        this.objectUUIDs.pokestops.push(pokestop.Id);
                    }
                });

                $.each(data.Response.Gyms, (k, gym) => {
                    if(this.objectUUIDs.gyms.indexOf(gym.Id) == -1) {
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

                        this.objectUUIDs.gyms.push(gym.Id);
                    }
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
