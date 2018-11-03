//define jQuery Selectors
//

const searchInput = $(`#search-input`);
let searchRadiusInput;

$(document).ready(function () {
    let lat;
    let lon;
    let restaurantList = [];
    let testURL;
    // testURL = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`;
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
                //return {latitude:lat,longitude:lon};
                $(`button`).click(function (event) {
                    event.preventDefault();
                    munchies.getData();
                    //console.log(restaurantList);
                })
            })
        },

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
                //restaurantList = response.restaurants.map(restaurant => { restaurant.restaurant.name });
                console.log(restaurantList);

            });
        },

    }

    let coordinates = munchies.getLocation();
    console.log(lat,lon);
    // setTimeout(() => {
    //     console.log(coordinates.latitude,coordinates.longitude);
    // }, 2000); 

    //console.log(restaurantList);
    
});




