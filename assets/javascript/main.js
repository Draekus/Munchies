//define jQuery Selectors
//

const searchInput = $(`#search-input`);
const submitSearchBtn = $(`#submit-search-button`)
let searchRadiusInput;

$(document).ready(function () {
    let lat;
    let lon;
    let restaurantList = [];
    let testURL;
    const baseURL = `https://developers.zomato.com/api/v2.1/search?`;
    const keyword = `q=${searchInput.val()}&`;
    const radius = `radius=${searchRadiusInput}&`;
    const location = `lat=${lat}&lon=${lon}`;
    const sort = `sort=" + "sort box choice" + "&`;
    const sortOrder = "order=" + "order box choice";


    let munchies = {
        getLocation: function () {
            console.log(`getting location...`);
            navigator.geolocation.getCurrentPosition(function (response) {

                lat = response.coords.latitude;
                lon = response.coords.longitude;

                console.log(`lat:${lat}, lon:${lon}`);

                //let user submit search with location now defined
                submitSearchBtn.click(function (event) {
                    event.preventDefault();
                    munchies.getData();
                })
            })
        },

        makeCard: function () {

            for (let i = 0; i < restaurantList.length; i++) {
                let newCard = $(`<div class="card" style="width:18rem">`);
                newCard.html(`
                <div class="card-body text-center">
                    <h5 class="card-title">${restaurantList[i].name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Rating: ${restaurantList[i].rating}</h6>
                    <p class="card-text">Sample Text</p>
                    <a class="btn btn-primary" href="${restaurantList[i].url}">Website</a>
                </div>
                `);
                $("#cardWrapper").append(newCard);
            }

        },

        //take user geolocation and retreive nearby restaurants
        getData: function () {
            testURL = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`;
            $.ajax({
                url: testURL,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "user-key": "6baeb6d20512d445d4dd41fd5a72c19a"
                }
            }).then(function (response) {
                console.log(response);
                console.log(response.restaurants.length);
                for (let i = 0; i < response.restaurants.length; i++) {
                    let newRestaurant = {
                        name: response.restaurants[i].restaurant.name,
                        id: response.restaurants[i].restaurant.id,
                        url: response.restaurants[i].restaurant.url,
                        menu: response.restaurants[i].restaurant.menu_url,
                        rating: response.restaurants[i].restaurant.user_rating.aggregate_rating
                    }
                    restaurantList.push(newRestaurant);
                }
                console.log(restaurantList);
                munchies.makeCard();
            });
        },

        initMap: function () {
            // The location of Uluru
            var uluru = { lat: 43.080752, lng: -70.80219389999999 };
            // The map, centered at Uluru
            var map = new google.maps.Map(
                document.getElementById('map'), { zoom: 4, center: uluru });
            // The marker, positioned at Uluru
            var marker = new google.maps.Marker({ position: uluru, map: map });
        }

    }

    munchies.getLocation();
    console.log(lat, lon);
});
