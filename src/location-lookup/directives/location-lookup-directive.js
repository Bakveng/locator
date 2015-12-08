angular.module('locator')
  .directive('locationLookup', [
  function() {
    return {
      restrict: 'E',
      require: '?ngModel',
      templateUrl: 'location-lookup/location-lookup.html',
      scope: {},
      link: function(scope, iElement, iAttrs, model) {

        scope.limitTo = scope.$eval(iAttrs.limitTo) || 15;
        scope.callback = scope.$eval(iAttrs.callback);
        scope.results = [];
        scope.selectedPlace = '';

        // Generate a DOM elment for Google Places Service
        var elem = document.createElement('div');
            elem.setAttribute('id', scope.ID);

        // Setup Google Places Service
        var googlePlacesService = new google.maps.places.PlacesService(iElement[0].appendChild(elem));

        // Setup Google Auto-complete Service
        var googleMapsService = new google.maps.places.AutocompleteService();        
        var searchInputElement = angular.element(iElement.find('input'));

        // Fetch predictions based on query
        var fetch = function(query) {
          googleMapsService.getPlacePredictions({
            input: query,
            componentRestrictions: {
              country: 'kh'
            }
          }, fetchCallback);
        };

        // Display predictions to the user
        var fetchCallback = function(predictions, status) {

          if (status !== google.maps.places.PlacesServiceStatus.OK) {

            scope.$apply(function() {
              scope.results = [];
            })

            return;

          } else {

            scope.$apply(function() {
              scope.results = predictions;
            })
          }
        };


        // Refresh on every edit
        searchInputElement.on('input', function() {
          var query = searchInputElement.val();

          if (query && query.length >= 3) {

            fetch(query);

          } else {

            scope.$apply(function() {
              scope.results = [];
            });
          }
        });


        // Clear query and results
        scope.clear = function() {
          scope.results = [];
        };

        // Pick A Location
        scope.pickLocation = function(location) {

          // Get details for the selected location
          googlePlacesService.getDetails({
            reference: location.reference
          }, function(place, status) {

            scope.$apply(function() {

              searchInputElement.val(location.description);

              var locData = {
                name: location.terms[0].value,
                description: location.description,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng()
              };

              // Update model
              model.$setViewValue(locData);
              // Callback
              scope.callback && scope.callback(locData);
            });
          });
        };
      }
    }
  }
]);