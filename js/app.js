// initialize GoogleMap
var map, marker;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 18,
		center: {lat: 37.5586875, lng: 126.93669879999993},
		
  	});

  	// Activates knockout.js
	ko.applyBindings(new ViewModel()); 

};

function mapError() {
	alert("There's a problem. Google map loading is faild!")
}

// model of neighborhood location.

var spots = [
	{
		name: '클로리스 티 가든',
		location: {lat: 37.55774448891895, lng: 126.93872809410095},
		foursquareId: "4bcac5b6fb84c9b62fca1d3e",
		category: "찻집"
	},
	{
		name: '더 파이홀',
		location: {lat: 37.55914992666027, lng: 126.9344703398036},
		foursquareId: "4f86ae01e4b0fa91a17db513",
		category: "카페"
	},
	{
		name: 'TILT 바',
		location: {lat: 37.55891542039909, lng: 126.93534692663208},
		foursquareId: "4df2462452b100c2d7f5e412",
		category: "칵테일 바"
	},
	{
		name: '미네르바',
		location: {lat: 37.557680700108016, lng: 126.9378188252449},
		foursquareId: "4baca972f964a520b1013be3",
		category: "커피숍"
	},
	{
		name: '아트박스',
		location: {lat: 37.558051970738155, lng: 126.93795038014193},
		foursquareId: "4fe186d5e4b0ce7bb0bfab04",
		category: "선물 가게"
	},
	{
		name: 'Neighborhood Galmegi Brewery Taphouse',
		location: {lat: 37.55826116517894, lng: 126.93449133601793},
		foursquareId: "539ea40e498efdb7bfc63d59",
		category: "맥주 양조장"
	},
	{
		name: '우드스탁',
		location: {lat: 37.558038620374916, lng: 126.93531543267623},
		foursquareId: "4bc06effb492d13a1238a460",
		category: "록 클럽"
	},
	{
		name: '교촌치킨',
		location: {lat: 37.55799040007726, lng: 126.93796087775098},
		foursquareId: "4ce0f2d2aba88cfadc5652d7",
		category: "프라이드 치킨 전문점"
	},
	{
		name: '착한돼지',
		location: {lat: 37.55853536087748, lng: 126.93880593034153},
		foursquareId: "50113732e4b0c3490cf8c245",
		category: "바비큐 전문점"
	},
	{
		name: '가마마루이',
		location: {lat: 37.56061171628617, lng: 126.93371447207835},
		foursquareId: "4cda11ea958f236a88faa403",
		category: "라멘 음식점"
	},
	{
		name: '독수리다방',
		location: {lat: 37.55896752667384, lng: 126.93708432221229},
		foursquareId: "510cbbc3e4b0c9edd35e2afe",
		category: "커피숍"
	},
	{
		name: '폼 프리츠',
		location: {lat: 37.558942152661935, lng: 126.93552014314709},
		foursquareId: "513af3dde4b06910fe19e72b",
		category: "패스트푸드 식당"
	},
	{
		name: '유타카나',
		location: {lat: 37.55777698047188, lng: 126.93848575628402},
		foursquareId: "53bfc343498e874e3ac3dee1",
		category: "일본 음식점"
	},
	{
		name: '고삼이',
		location: {lat: 37.558267958610564, lng: 126.93474329012058},
		foursquareId: "4ee57d189adf398200800b03",
		category: "한식당"
	},
	{
		name: '호밀밭',
		location: {lat: 37.55898198104555, lng: 126.94056272506714},
		foursquareId: "4daa878c6a2303012f10b753",
		category: "디저트 가게"
	},
];

// constructor function.
var Spot = function(data) {
	this.name = data.name;
	this.location = data.location;
	this.category = data.category;
}


var ViewModel = function() {
	var self = this;	

	self.isActive = ko.observable();
	self.toggleActive = function() {
		self.isActive(!self.isActive())	
	}


	this.locations = ko.observableArray([]); // make observableArray

	// populates locations observable array from spots
	spots.forEach(function(spot) {
		self.locations.push(new Spot(spot)); 
	});


	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	var rating;
	var toggleError = false;


	function closeInfo() {
		google.maps.event.addListener(map, "click", function(event) {
  			infowindow.close();
	  	});
	};
	
	closeInfo();



	// make marker, click event...
	self.locations().forEach(function(item) {

		//Foursquare api ajax request
		$.ajax({
			type: "GET",
			dataType: 'JSON',
			cache: false,
			url: 'https://api.foursquare.com/v2/venues/explore',
			data: 'v=20161027&ll=' + item.location.lat + '%2C' + item.location.lng + '&radius=1800&query='
					+ item.name + '&novelty=new&oauth_token=UY5051X5NZARVOAGHY1Y4UWSVA2VAXUQCWBCNY4WXFTUQSSJ',
			async: true,
			success: function(data) {
				item.rating = data.response.groups[0].items[0].venue.rating;
				if (!item.rating) {
					item.rating = '평점이 없습니다.';
				}
			},
			error: function(data) {
				toggleError = true
			}
		});

		var marker = new google.maps.Marker({
		    map: map,
			position: item.location,
		    title: item.name,
		    category: item.category,
			animation: google.maps.Animation.DROP
		});


		function toggleBounce() {
			self.locations().forEach(function(item) {
				item.marker.setAnimation(null);
			});

			marker.setAnimation(google.maps.Animation.BOUNCE);
		};

		marker.addListener('click', toggleBounce);
		
		item.marker = marker;
		bounds.extend(marker.position);

		// events when click the marker
		marker.addListener('click', function() {
			// execute displayInfoWindow function when click the marker
			marker.rating = item.rating;
			populateInfoWindow(this, infowindow);
		});

		item.displayInfoWindow = function() {
			toggleBounce();
			populateInfoWindow(this.marker, infowindow);
		}
	});

	map.fitBounds(bounds);

	$(document).ajaxStop(function(){
		if (toggleError == true) {
			alert("포스퀘어 API를 불러오는데 실패했습니다.");
		}
	})
	
	function populateInfoWindow(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on the marker
		if (infowindow.marker != marker) {
			infowindow.setContent('');
			infowindow.marker = marker;
			// infowindow.open(map, marker);
			
			//Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				marker.setAnimation(null);
				infowindow.marker = null;
			});
			var streetViewService = new google.maps.StreetViewService();
			var radius = 30;

			function getStreetView(data, status) {
				if (status == google.maps.StreetViewStatus.OK) {
					var nearStreetViewLocation = data.location.latLng;
					var heading = google.maps.geometry.spherical.computeHeading(
						nearStreetViewLocation, marker.position);
					infowindow.setContent('<div class="infoWindow"><div><h3>이름: ' + 
											marker.title + '</h3></div>' + 
											'<p>카테고리: ' + marker.category + '</p>' + 
											'<div id="pano"></div>'+ '<br><p>포스퀘어 평점: ' + marker.rating + '</p</div>');
					var panoramaOptions = {
						position: nearStreetViewLocation,
						pov: {
							heading: heading,
							pitch: 10
						}
					};
					var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
				} else {
					infowindow.setContent('<div>' + marker.title +'</div>'+'<div>No Street View Found</div>');
 				}
			}

			// Use streetview service to get the closest streetview image within
			// 50 meters of the markers position.
			streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
			// Open the infowindow on the correct marker.
			infowindow.open(map, marker);
		} // end of the if statement
	}; // end of the populateInfoWindow function.

	self.filter = ko.observable(""); // value of searching form

	// filtered list. append to list
	self.filteredItems = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		if (filter) {
			infowindow.close();
		};

		return self.locations().filter(function(item) { 
			var match = (item.name.toLowerCase().indexOf(filter) > -1)
			if (!match) {
				item.marker.setVisible(false);
			} else {
				item.marker.setMap(map);
				item.marker.setVisible(true);
				return item.name.toLowerCase().indexOf(filter) > -1;
			}
		});
	})
}