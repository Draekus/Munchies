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