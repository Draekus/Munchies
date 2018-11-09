
// Initilization of Materialize Lists
// 
$(document).ready(function () {
    $('select').formSelect();
});


//define global variables
//

const database = firebase.database(); // assign firebase database service
const auth = firebase.auth(); // assign firebase authentication service
let email; //where email input will be stored
let password; //where password input will be stored
let currentUserId; //when a user logs in, their firebase uid will be stored here
let localFavList;
let loaded = false;


//spoonacular apikey?
// OM0SKTzddtmshPA3nc61vNOIEfaVp1VLQLijsn5aYbYl0C1MFg

//Database References
//

const connectedRef = database.ref(`.info/connected`); //firebase connection listener
const usersRef = database.ref(`/users/`);

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
const dismissButton = $(`#dismiss-login-button`);
const loginButton = $(`#user-login-button`);
const signUpButton = $(`#user-create-button`);
const logoutButton = $(`#user-logout-button`);
const userNameDisplay = $(`#user-name-display`);
const favoritesDisplay = $(`#favorites-display`);


//wait for document to load for functionality
$(document).ready(function () {
    $(`#landing-modal`).modal('show'); //show landing modal

    loginButton.click(function () { //attempt login on button click
        loaded = true;
        email = emailInput.val()
        password = passwordInput.val()
        console.log([email, password]);
        //prevent user login to persist on browser refresh
        auth.setPersistence(firebase.auth.Auth.Persistence.NONE).then(function () {
            //call out to authentication service, assign it's promise to varaible to catch any errors
            const promise = auth.signInWithEmailAndPassword(email, password);
            promise.catch(error => { console.log(error.message) });
        });

        // const promise = auth.signInWithEmailAndPassword(email, password);
        // promise.catch(error => { console.log(error.message) });
    });

    //add account to firebase
    signUpButton.click(function () {
        loaded = true;
        email = emailInput.val()
        password = passwordInput.val()
        console.log([email, password]);
        //prevent user login to persist on browser refresh
        auth.setPersistence(firebase.auth.Auth.Persistence.NONE).then(function () {
            //call out to authentication service, assign it's promise to varaible to catch any errors
            const promise = auth.createUserWithEmailAndPassword(email, password);
            promise.catch(error => { console.log(error.message) });
        });

    });

    dismissButton.click(function () {
        loaded = true;
    })

    //logout the current user
    logoutButton.click(function () {
        console.log(`logout clicked`);
        auth.signOut();
        favoritesDisplay.html(``);
    });

    //firebase listener on authentication state change- when a user logs in or out
    auth.onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) { //if a user is logged on
            //console.log(firebaseUser);
            console.log(`user id; ${firebaseUser.uid}`);
            currentUserId = firebaseUser.uid; //get loggin in users's uid and assign it into a variable

            usersRef.push(currentUserId); //push the userId into the users's ref to make a new child
            logoutButton.removeClass(`hide`); //make the logout button visible when logged in
            userNameDisplay.text(`Hi ${firebaseUser.email}`);
            munchies.displayFavorites(currentUserId); //pass the current userId to displayFavorites 


            //enable add favorite button functionality only when a user is logged in
            $(document).on("click", ".favorite-button", function () {
                let index = this.dataset.index; //grab the index to store from the favorites button
                console.log(index);
                munchies.addFavorite(index) //run addFavorite with the stored id
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
            userNameDisplay.text(``);
            localFavList = [];
            favoritesDisplay.html(``);
        }
    });

    //listens for new connections being made to server
    connectedRef.on("value", function (snapshot) {
        //console.log(snapshot);
        let promise = auth.signOut();
        promise.catch(error => { console.log(error) });
        favoritesDisplay.html(``);
        localFavList = [];
    })

    //global variable definitions
    let lat; //browser latitude
    let lon; //browser longitude
    let restaurantList = []; //enpty array to push results into
    let modalID; //unique id for the different detail modals
    let location; //where location search string is stored
    let keyword; //where search query string is stored
    let radiusValue; //where search radius string is stored
    let sortValue; //where sort by string is stored
    let orderValue; //where order by string is stored
    const baseURL = `https://developers.zomato.com/api/v2.1/search?`; //the base search string for zomato api

    // console.log(`radius selection is ${testRadius}`)
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


    //main application functionality
    let munchies = {
        //get current user location
        getLocation: function () {
            console.log(`getting location...`);
            navigator.geolocation.getCurrentPosition(function (response) {

                lat = response.coords.latitude;
                lon = response.coords.longitude;
                location = `lat=${lat}&lon=${lon}&`

                console.log(`lat:${lat}, lon:${lon}`);


            })
        },

        //make cards to display response data in main section
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

        //call to zomato api for results
        getData: function () {
            // testURL = `https://developers.zomato.com/api/v2.1/search?lat=${lat}&lon=${lon}`;

            let url;
            console.log(keyword);
            console.log(radiusValue);
            console.log(sortValue);
            console.log(orderValue);

            if (keyword) { // check if search input has a value
                console.log(`pushing keyword to url`)
                url = `${baseURL}${keyword}`;
                if (radiusValue) { //check for search radius value
                    url += radiusValue;
                }
                if (sortValue) { //check for sort by value
                    url += sortValue;
                }
                if (orderValue) { //check order by value
                    url += orderValue;
                }
            } else { //no values, default to location search
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

            // Zomato API call with dynamic url from dropdown & keywords
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
                // Clears the restaurantList to avoid appending old searches upon a new search
                restaurantList = [];
                //loop through response, set data to new restaurant variable to push into makeCard function
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

                munchies.makeCard(); //make cards with restaurant details
            });
        },

        //call to spoonacular api
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

        //call to googleMaps api to get location of restaurants
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

        //make a modal to display more restaurant details
        makeModal: function (id) {
            console.log(`making modal`);
            for (let i = 0; i < restaurantList.length; i++) {

                //create a new div to push details into
                let newModal = $(`<div id="detail-modal-${i}" class="modal" tabindex="-1" role="dialog">`);

                //set new div html
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
                //append the modal to html
                $(`body`).append(newModal);
            }
            munchies.initMap();
        },

        //add a favorite from restaurantList based on the passed index number
        addFavorite: function (index) {
            console.log(`adding favorite`);
            console.log(`getting restaurant at index ${index}`);
            let newFav = restaurantList[index];
            console.log(newFav);
            database.ref(`/users/${currentUserId}/favorite`).push(newFav);
        },

        displayFavorites: function (userId) {
            console.log(`*In displayFavorites*`);
            database.ref(`/users/${userId}`).once('value').then(function (snapshot) {
                console.log(snapshot.val().favorite);
                //console.log(Object.entries(snapshot.val().favorite)); //Object.entries returns an array of all the object's key/value pairs
                //console.log(Object.entries(snapshot.val().favorite)[0][1]); //displays the first favorites value


                localFavList = Object.entries(snapshot.val().favorite);
                //loop through all of the saved favorites
                for (let i = 0; i < Object.entries(snapshot.val().favorite).length; i++) {
                    let fav = Object.entries(snapshot.val().favorite)[i][1]; //store current iterations favorite into a variable
                    console.log(fav);
                    let newFavCard = $(`<div class="card" id="fav${i}">`); //create a blank card to push data into

                    //fill in card details
                    newFavCard.html(`
                    <button type="button" class="btn btn-info btn-sm favorite" data-val='${i}'>+</button>
                    <p class="fav-text">${fav.name}</p>
                    `);

                    favoritesDisplay.append(newFavCard); //append the newly created favorites card
                    // console.log(Object.entries(snapshot.val().favorite)[i][1]);
                }
            });
        },

        makeFavModal: function (id) {
            for (let i = 0; i < localFavList.length; i++) {
                console.log(localFavList[i]);
                let newModal = $(`<div id="fav-modal-${i}" class="modal" tabindex="-1" role="dialog">`);

                //set new div html
                newModal.html(`

            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="detail-modal-header modal-header">
                        <h5 class="modal-title">${localFavList[i][1].name}</h5>
                    </div>
                    
                    <div class="detail-modal-body">
                    <div>
                        <p><b>Address: </b>${localFavList[i][1].address}</p>
                        <p><b>City: </b>${localFavList[i][1].city}</p>
                        <p><b>Average Price For Two: </b>$${localFavList[id][1].price}</p>
                        <p><b>Menu: </b><a href='${localFavList[i][1].menu}'>Click Here</a></p>
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
        }
    }

    //on page load, call to spoonacular, and get current location
    munchies.getSpoonacular();
    munchies.getLocation();
    console.log(lat, lon);


    munchies.initMap();

    //prevent page reload on form search submit, call to zomato API, and reset the search field
    searchForm.on("submit", function (event) {
        event.preventDefault();
        if (loaded) {
            munchies.getData();
        }

        $('input').val("");
    });




    //on click, display the details modal for given restaurant
    $(document).on("click", ".card-detail", function (event) {
        console.log(event.target.dataset.val);
        modalID = event.target.dataset.val;

        munchies.makeModal(modalID);
        $(`#detail-modal-${modalID}`).modal(`show`);
        munchies.initMap();
    });

    $(document).on("click", ".favorite", function (event) {
        let favId = event.target.dataset.val;
        munchies.makeFavModal(favId);
        $(`#fav-modal-${favId}`).modal(`show`);
    });


    console.log($("#sortBox").val())
});




