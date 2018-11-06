//define global variables
//

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
const submitSearchBtn = $(`#submit-search-button`);
const cardWrapperDiv = $(`#card-wrapper`);
const emailInput = $(`#user-email-input`);
const passwordInput = $(`#user-password-input`);
const loginButton = $(`#user-login-button`);
const signUpButton = $(`#user-create-button`);
const logoutButton = $(`#user-logout-button`);
let searchRadiusInput;

//
$(document).ready(function () {
    $(`#landing-modal`).modal('show');

    loginButton.click(function(){ //attempt login on button click
        email = emailInput.val()
        password = passwordInput.val()
        console.log([email,password]);
        //call out to authentication service, assign it's promise to varaible to catch any errors
        const promise = auth.signInWithEmailAndPassword(email,password);
        promise.catch(error=>{console.log(error.message)});
    });

    signUpButton.click(function(){
        email = emailInput.val()
        password = passwordInput.val()
        console.log([email,password]);
        //call out to authentication service, assign it's promise to varaible to catch any errors
        const promise = auth.createUserWithEmailAndPassword(email,password);
        promise.catch(error=>{console.log(error.message)});
    });

    logoutButton.click(function(){
        auth.signOut();
    })

    auth.onAuthStateChanged(function(firebaseUser) {
        if(firebaseUser){
            console.log(firebaseUser);
            logoutButton.removeClass(`hide`);
        } else{
            console.log(`not loggin in`);
            logoutButton.addClass(`hide`);
        }
    })

    connectedRef.on("value",function(snapshot){
        console.log(snapshot);
    })

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
    
    //when press enter on input box clickes the button
    $('#search').keypress(function(event){
        event.preventDefault();
        if(event.keyCode==13){
            $('#submit-search-button').click();
        }
        
      });

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

        getSpoonacular: function(){
            let testSpoonURL = `https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?&query=burger`;
            $.ajax({
                url:testSpoonURL,
                method:"GET",
                headers:{
                    "Accept":"application/json",
                    "X-Mashape-Key": "OM0SKTzddtmshPA3nc61vNOIEfaVp1VLQLijsn5aYbYl0C1MFg"
                }
            }).then(function(response){
                console.log(response);
            })
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
            for (let i = 0; i < restaurantList.length; i++) {
            let newModal = $(`<div id="detail-modal-${id}" class="modal" tabindex="-1" role="dialog">`);
            newModal.html(`
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${restaurantList[i].name}</h5>
                    </div>
                    <div class="modal-body">
                        <p><b>Address: </b>${restaurantList[i].address}</p>
                        <p><b>City: </b>${restaurantList[i].city}</p>
                        <p><b>Average Price For Two: </b>$${restaurantList[i].price}</p>
                        <p><b>Menu: </b><a href='${restaurantList[i].menu}'>Click Here</a></p>
                        <button class="btn btn-outline-dark" data-dismiss="modal">Dismiss</button>
                    </div>
                </div>
            </div>
            `);

            $(`body`).append(newModal);
            }
        }
    }
    munchies.getSpoonacular();
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

