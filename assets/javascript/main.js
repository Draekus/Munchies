//define global variables
//
$(document).ready(function () {
    $('select').formSelect();
});

const database = firebase.database(); // assign firebase database service
const auth = firebase.auth(); // assign firebase authentication service
let email; //where email input will be stored
let password; //where password input will be stored
//from rapid-api
//var RapidAPI = new require('rapidapi-connect');
//var rapid = new RapidAPI('munchie_5be10c36e4b02e44153feed4', '/connect/auth/munchie_5be10c36e4b02e44153feed4');

//spoonacular apikey?
// OM0SKTzddtmshPA3nc61vNOIEfaVp1VLQLijsn5aYbYl0C1MFg

//Database References
//
const connectedRef = database.ref(`.info/connected`); //firebase connection listener

//define jQuery Selectors
//

const searchInput = $(`#search-input`);
const sortSelect = $(`#sort-select`);
const orderSelect = $(`#order-select`);
const radiusSelect = $(`#radius-select`);
const submitSearchBtn = $(`#submit-search-button`);
const searchForm = $(`#search-form`);
const cardWrapperDiv = $(`#card-wrapper`);
const emailInput = $(`#user-email-input`);
const passwordInput = $(`#user-password-input`);
const loginButton = $(`#user-login-button`);
const signUpButton = $(`#user-create-button`);
const logoutButton = $(`#user-logout-button`);


//
$(document).ready(function () {
    $(`#landing-modal`).modal('show');

    loginButton.click(function () { //attempt login on button click
        email = emailInput.val()
        password = passwordInput.val()
        console.log([email, password]);
        //call out to authentication service, assign it's promise to varaible to catch any errors
        const promise = auth.signInWithEmailAndPassword(email, password);
        promise.catch(error => { console.log(error.message) });
    });

    signUpButton.click(function () {
        email = emailInput.val()
        password = passwordInput.val()
        console.log([email, password]);
        //call out to authentication service, assign it's promise to varaible to catch any errors
        const promise = auth.createUserWithEmailAndPassword(email, password);
        promise.catch(error => { console.log(error.message) });
    });

    logoutButton.click(function () {
        auth.signOut();
    });

    auth.onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            console.log(firebaseUser);
            logoutButton.removeClass(`hide`);


            $(document).on("click", ".favorite-button", function () {
                let index = this.dataset.index;
                console.log(index);
                munchies.addFavorite(index)
                if ($(this).attr("class") !== "favorited-button") {
                    $(this).addClass("favorited-button")

                    console.log("clickedfosho")
                }
                $(document).on("click", ".favorited-button", function () {

                    $(this).removeClass("favorited-button")

                    console.log("clickedforeal")
                });

            });


        } else {
            console.log(`not loggin in`);
            logoutButton.addClass(`hide`);
        }
    })

    connectedRef.on("value", function (snapshot) {
        console.log(snapshot);
    })

    let lat;
    let lon;
    let restaurantList = [];
    let testURL;
    let modalID;
    let location;
    let keyword;
    let radiusValue;
    let sortValue;
    let orderValue;
    const baseURL = `https://developers.zomato.com/api/v2.1/search?`;


    //Listen for changes to form inputs, assign values to variables

    searchInput.change(function () {
        keyword = `q=${searchInput.val()}&`;
    });

    radiusSelect.change(function () {
        radiusValue = `radius=${radiusSelect.val()}&`;
    });

    sortSelect.change(function () {
        sortValue = `sort=${sortSelect.val()}&`;
    });

    orderSelect.change(function () {
        orderValue = `order=${orderSelect.val()}&`;
    });


    let munchies = {
        getLocation: function () {
            console.log(`getting location...`);
            navigator.geolocation.getCurrentPosition(function (response) {

                lat = response.coords.latitude;
                lon = response.coords.longitude;
                location = `lat=${lat}&lon=${lon}&`

                console.log(`lat:${lat}, lon:${lon}`);


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
                        <p class="card-text">${restaurantList[i].locale}</p>
                        <a class="btn btn-primary card-detail" data-val="${i}">Details</a>
                    </div>
                </div>
                `);
                cardWrapperDiv.append(newCard);
            }

        },
        //take user geolocation and retreive nearby restaurants
        getData: function () {
            // testURL = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`;
            //let url = baseURL;
            let url;
            console.log(keyword);
            console.log(radiusValue);
            console.log(sortValue);
            console.log(orderValue);

            if (keyword) { // check if search input has a value
                console.log(`pushing keyword to url`)
                url = `${baseURL}${keyword}`;
                if (radiusValue) {
                    url += radiusValue;
                }
                if (sortValue) {
                    url += sortValue;
                }
                if (orderValue) {
                    url += orderValue;
                }
            } else { //no value, default to location search
                console.log(`default url`);
                url = `${baseURL}${location}`;
                if (radiusValue) {
                    url += radiusValue;
                }
                if (sortValue) {
                    url += sortValue;
                }
                if (orderValue) {
                    url += orderValue;
                }
            }
            //Note: switch was not working- look at again to try and implement?
            // switch (keyword){
            //     case undefined:
            //         console.log(`search input is undefined`)
            //         url = `${url}${location}`;
            //         break;
            //     case (!undefined):
            //         console.log(`search input is not undefined`)
            //         url = `${url}${keyword}`;
            //         break;
            //     // default:
            //     // console.log(`defaulting`)
            //     //     url = `${url}${location}`;
            //     //     break;
            // }

            console.log(`url: ${url}`)

            $.ajax({
                url: url,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "user-key": "5ff9c123fbdfa616e2505b4be96d0128"
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
                        rating: response.restaurants[i].restaurant.user_rating.aggregate_rating,
                        price: response.restaurants[i].restaurant.average_cost_for_two,
                        latitude: response.restaurants[i].restaurant.location.latitude,
                        longitude: response.restaurants[i].restaurant.location.longitude,
                        address: response.restaurants[i].restaurant.location.address,
                        city: response.restaurants[i].restaurant.location.city,
                        locale: response.restaurants[i].restaurant.location.locality,
                        menu: response.restaurants[i].restaurant.menu_url
                    }
                    restaurantList.push(newRestaurant);
                }
                console.log(restaurantList);
                munchies.makeCard();
            });
        },

        getSpoonacular: function () {
            let testSpoonURL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?&query=burger`;
            $.ajax({
                url: testSpoonURL,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "X-Mashape-Key": "OM0SKTzddtmshPA3nc61vNOIEfaVp1VLQLijsn5aYbYl0C1MFg"
                }
            }).then(function (response) {
                console.log(response);
            })
        },

        initMap: function () {
            // The location of Uluru
            // The map, centered at Uluru
            for (let i = 0; i < restaurantList.length; i++) {
                var latNumber = parseFloat(restaurantList[i].latitude)
                var logNumber = parseFloat(restaurantList[i].longitude)
                var uluru = { lat: latNumber, lng: logNumber };

                var map = new google.maps.Map(
                    document.getElementById('map' + i), { zoom: 14, center: uluru });

            }

            // The marker, positioned at Uluru
            var marker = new google.maps.Marker({ position: uluru, map: map });
        },

        makeModal: function (id) {
            console.log(`making modal`);
            for (let i = 0; i < restaurantList.length; i++) {

                let newModal = $(`<div id="detail-modal-${i}" class="modal" tabindex="-1" role="dialog">`);
                newModal.html(`

            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="detail-modal-header modal-header">
                        <h5 class="modal-title">${restaurantList[i].name}</h5>
                        <i class="far fa-star favorite-button" data-index="${i}"></i>
                    </div>
                    
                    <div class="detail-modal-body">
                    <div>
                        <p><b>Address: </b>${restaurantList[i].address}</p>
                        <p><b>City: </b>${restaurantList[i].city}</p>
                        <p><b>Average Price For Two: </b>$${restaurantList[id].price}</p>
                        <p><b>Menu: </b><a href='${restaurantList[i].menu}'>Click Here</a></p>
                        <button class="btn btn-outline-dark" data-dismiss="modal">Dismiss</button>
                    </div>
                    <div  class="map" id='map${i}'></div>
                        
                    </div>
                </div>
            </div>
            `);

                $(`body`).append(newModal);
            }
            munchies.initMap();
        },

        addFavorite: function (index) {
            console.log(`adding favorite`);
            console.log(`getting restaurant at index ${index}`);
            let newFav = restaurantList[index];
            console.log(newFav);
            database.ref(`/favorites/`).push(newFav);
        }
    }
    munchies.getSpoonacular();
    munchies.getLocation();
    console.log(lat, lon);


    munchies.initMap();
    searchForm.on("submit", function (event) {
        event.preventDefault();
        munchies.getData();
        $('input').val("");
    });








    $(document).on("click", ".card-detail", function (event) {
        console.log(event.target.dataset.val);
        modalID = event.target.dataset.val;

        munchies.makeModal(modalID);
        $(`#detail-modal-${modalID}`).modal(`show`);
        munchies.initMap();
    });
    console.log($("#sortBox").val())
});




