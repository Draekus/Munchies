$(document).ready(function(){
    let lat;
    let lon;
     navigator.geolocation.getCurrentPosition(function(response){
        lat = response.coords.latitude;
        lon = response.coords.longitude;
         console.log(lat,lon);
    })
})

const baseURL = "https://developers.zomato.com/api/v2.1/search?";
const keyword = "q=" + "searchbox value" + "&";
const radius = "radius=" + "value of search radius" + "&";
const location = "lat=" + lat + "&" + "lon=" + lon + "&";
const sort = "sort=" + "sort box choice" + "&";
const sortOrder = "order=" + "order box choice";

$.ajax({
   
    url: "https://developers.zomato.com/api/v2.1/search?entity_id=7555&entity_type=city",
    method: "GET",
    headers:{
        "Accept": "application/json",
        "user-key": "6baeb6d20512d445d4dd41fd5a72c19a"
}
  })
    .then(function(response) {
        console.log(response)
    });