$(document).ready(function () {
    let lat;
    let lon;
    let restaurantList;

    navigator.geolocation.getCurrentPosition(function (response) {
        lat = response.coords.latitude;
        lon = response.coords.longitude;

        console.log(`lat:${lat}, lon:${lon}`);
    })

    const testURL = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`;
    const baseURL = "https://developers.zomato.com/api/v2.1/search?";
    const keyword = "q=" + "searchbox value" + "&";
    const radius = "radius=" + "value of search radius" + "&";
    const location = "lat=" + lat + "&" + "lon=" + lon + "&";
    const sort = "sort=" + "sort box choice" + "&";
    const sortOrder = "order=" + "order box choice";

    $.ajax({
        url: testURL,
        method: "GET",
        headers: {
            "Accept": "application/json",
            "user-key": "6baeb6d20512d445d4dd41fd5a72c19a"
        }
    }).then(function (response) {
        //console.log(response);
        response.restaurants.map(restaurant => { console.log(restaurant.restaurant.name) });

    });

});

function initMap() {
    // The location of Uluru
    var uluru = {lat: 43.080752, lng: -70.80219389999999};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 4, center: uluru});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: uluru, map: map});
  }


