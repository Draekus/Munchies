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
                    // munchies.makeCard();
                    
                    //console.log(restaurantList);
                })
            })
        },

        makeCard: function () {
           
        for (let i = 0; i < restaurantList.length; i++ ){
            let cardWrapper = $("<div>");
            let cardBody = $("<div>");
            let cardTitle = $("<h5>");
            let cardSubtitle = $("<h6>");
            let cardText = $("<p>");
            let cardButton = $("<a>");

            cardWrapper.addClass("card").attr("style", "width: 18rem;");
            cardBody.addClass("card-body");
            cardTitle.addClass("card-title");
            cardSubtitle.addClass("card-subtitle mb-2 text-muted");
            cardText.addClass("card-text")
            cardButton.addClass("btn btn-primary").attr("href", "#")

            cardTitle.text(restaurantList[i].name)
            cardSubtitle.text(restaurantList[i].rating)
            cardButton.text("Website")
            cardButton.attr("href", restaurantList[i].url)

            cardBody.append(cardTitle, cardSubtitle, cardText, cardButton)
            cardWrapper.append(cardBody)
            
            console.log("hekko")
            $("#cardWrapper").append(cardWrapper)
            $("#cardWrapper").append($("<p>"))
            
        }

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
                munchies.makeCard();
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

function initMap() {
    // The location of Uluru
    var uluru = {lat: 43.080752, lng: -70.80219389999999};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 4, center: uluru});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: uluru, map: map});
  }


