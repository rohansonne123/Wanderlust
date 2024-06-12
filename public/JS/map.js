
	mapboxgl.accessToken = maptoken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
        center: [ -155.13666, 19.699255 ], // starting position [lng, lat]
        zoom: 9 // starting zoom
        });
        
        
        
        const marker = new mapboxgl.Marker({color:"red"})
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(` <h4>${listing.title}</h4><p>welcome to Adventure exact location given after booking</p>`))
        .addTo(map);