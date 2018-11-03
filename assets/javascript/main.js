//define jQuery Selectors
//

const searchInput = $(`#search-input`);
let searchRadiusInput;

$(document).ready(function () {
    let lat;
    let lon;
    let restaurantList = [];
    const testURL = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`;
    const baseURL = `https://developers.zomato.com/api/v2.1/search?`;
    const keyword = `q=${searchInput.val()}&`;
    const radius = `radius=${searchRadiusInput}&`;
    const location = `lat=${lat}&lon=${lon}`;
    const sort = `sort=" + "sort box choice" + "&`;
    const sortOrder = "order=" + "order box choice";


    let muchies = {
        getLocation: function () {
            navigator.geolocation.getCurrentPosition(function (response) {
                lat = response.coords.latitude;
                lon = response.coords.longitude;

                console.log(`lat:${lat}, lon:${lon}`);
            })
        },

        getData: function () {
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
                    restaurantList.push(response.restaurants[i].restaurant.name);
                }
                //restaurantList = response.restaurants.map(restaurant => { restaurant.restaurant.name });
                console.log(restaurantList);

            });
        },

    }



    //console.log(restaurantList);
    $(`button`).click(function (event) {
        event.preventDefault();
        muchies.getData();
        //console.log(restaurantList);
    })
});




