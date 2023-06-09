 const map = L.map("map").setView([-34.603722, -58.381592], 12);

        // función para centrar el mapa en una ubicación
        const centerMap = (lat, lng) => {
            map.setView([lat, lng], 15);
            marker.setLatLng([lat, lng]);
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
            axios.get(url).then((response) => {
                const formatted = response.data.display_name;
                document.getElementById("address-input").value = formatted;
            });
            document.getElementById("coordinates-input").value = `[${lat}, ${lng}]`;
        };

        // intentar obtener la ubicación actual del usuario
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                centerMap(latitude, longitude);
            },
            (error) => {
                console.log("Error al obtener la ubicación actual:", error);
                // si no se puede obtener la ubicación actual, usar una aproximación por IP
                const url = "https://ipapi.co/json/";
                axios.get(url).then((response) => {
                    const { latitude, longitude } = response.data;
                    centerMap(latitude, longitude);
                });
            }
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
        }).addTo(map);

        const marker = L.marker([-34.603722, -58.381592], { draggable: true }).addTo(map);

        map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng(e.latlng);
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

            axios.get(url).then((response) => {
                const formatted = response.data.display_name;
                document.getElementById("address-input").value = formatted;
            });

            document.getElementById("coordinates-input").value = `[${lat}, ${lng}]`;
        });

        const searchInput = document.getElementById("search-input");

        const searchControl = L.Control.extend({
            onAdd: function (map) {
                const container = L.DomUtil.create("div", "search-container");
                const searchForm = L.DomUtil.create("form", "search-form", container);
                const searchLabel = L.DomUtil.create("label", "search-label", searchForm);
                //const searchIcon = L.DomUtil.create("i", "fa fa-search search-icon", searchLabel);
                const searchInput = document.getElementById("search-input");

                searchInput.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        search(searchInput.value);
                    }
                });
                return container;
            },
        });

        // crea un botón personalizado para actualizar la ubicación
        const updateLocationButton = L.Control.extend({
            onAdd: function (map) {
                // crea el botón como un elemento HTML
                const button = L.DomUtil.create('button', 'update-location-button');
                button.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';

                // maneja el evento de clic del botón
                button.addEventListener('click', function () {
                    // intenta obtener la ubicación actual del usuario
                    navigator.geolocation.getCurrentPosition(
                        function (position) {
                            const { latitude, longitude } = position.coords;
                            centerMap(latitude, longitude);
                        },
                        function (error) {
                            console.log('Error al obtener la ubicación actual:', error);
                        }
                    );
                });

                // retorna el elemento HTML que representa el botón
                return button;
            }
        });

        // agrega el botón al mapa
        map.addControl(new updateLocationButton());


        const searchButton = document.getElementById("search-button");
        searchButton.addEventListener("click", () => search(searchInput.value));

        const search = (query) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

            axios.get(url).then((response) => {
                if (response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    map.setView([lat, lon], 15);
                    marker.setLatLng([lat, lon]);
                    const formatted = response.data[0].display_name;
                    document.getElementById("address-input").value = formatted;
                }
            });
        };
        map.addControl(new searchControl());
