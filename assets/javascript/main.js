//define jQuery Selectors
//

const searchInput = $(`#search-input`);
const submitSearchBtn = $(`#submit-search-button`);
const cardWrapperDiv = $(`#card-wrapper`);
let searchRadiusInput;

$(document).ready(function () {
    $(`#landing-modal`).modal('show');
    let lat;
    let lon;
    let restaurantList = [];
    let testURL;
    let modalID;
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
            cardWrapperDiv.html(``);
            for (let i = 0; i < restaurantList.length; i++) {
                let newCard = $(`<div class="card">`);
                newCard.html(`
                <div class="card-body text-center">
                    <h5 class="card-title">${restaurantList[i].name}</h5>
                    <div class="card-details">
                        <h6 class="card-subtitle mb-2 text-muted">Rating: ${restaurantList[i].rating}</h6>
                        <p class="card-text">Sample Text</p>
                        <a class="btn btn-primary card-detail" data-val="${i}">Details</a>
                    </div>
                </div>
                `);
                cardWrapperDiv.append(newCard);
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
        },

        makeModal: function (id) {
            console.log(`making modal`);
            let newModal = $(`<div id="detail-modal-${id}" class="modal" tabindex="-1" role="dialog">`);
            newModal.html(`
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Title ${id}</h5>
                    </div>
                    <div class="modal-body">
                        <p>Lorem Ipsum and shit</p>
                        <button class="btn btn-outline-dark" data-dismiss="modal">Dismiss</button>
                    </div>
                </div>
            </div>
            `);

            $(`body`).append(newModal);

        }
    }
    munchies.getLocation();
    console.log(lat, lon);
    munchies.initMap();

    $(document).on("click", ".card-detail", function (event) {
        console.log(event.target.dataset.val);
        modalID = event.target.dataset.val;
        munchies.makeModal(modalID);
        $(`#detail-modal-${modalID}`).modal(`show`);
    });

});

