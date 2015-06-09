(function(){

	'use strict'

	angular
	.module('app')
	.controller('pageController', pageController);


	pageController.$inject = ['$scope', '$http'];
	function pageController($scope, $http){
		var testString = "a, bbb, c 124";

		var vm = this;
		vm.searchString = '';
		vm.search = search;
		

		function search(){
			vm.transpositions = createTranspositionsArray(vm.searchString);

			sendTwitterRequest(joinTranspositions(vm.transpositions));
			// $scope.$apply();

		}
		$scope.$on('FB-init-ready', function(){
			console.log(FB);
			FB.getLoginStatus(function(response) {
			  	if (response.status === 'connected') {
			    	console.log('Logged in.');
			    	FB.api('/search', {q: 'series', type: 'adkeyword'}, function(response) {
					  console.log(response);
					});

			  	}
				else {
				    FB.login();
				}
			})
		})
		// $(document).ready(function(){
		
		function sendTwitterRequest(q){
			$http.get('backend/twitterSearch.php',
				{
					params:{q:q}
				}
			)
			.success(function(data){
				vm.response = data.statuses;
			})
		}
		
	}
	function joinTranspositions(transpositions){
		var result  = '"' + transpositions[0].value + '"';
		for ( var i =1; i < 2; i++){
			result += ' OR "' + transpositions[i].value + '"';
		}
		return result;

	}
	/*
		creates array of transpositions
		@param string inputString string of items, comma-seperated
		@return array(string)
	 */
	function createTranspositionsArray(inputString){
		var array = inputString.split(',');
		var result = [];
		// for ( var i = 0; i < array.length; i++) {
		iterator(array, '', 0);
		// }
		function iterator(array, current, depth){

			var _array; 
			var _current = current;
			var tempCurrent;
			for ( var i = 0; i < array.length; i++){
				tempCurrent = _current + ' ' + array[i];


				result.push({depth: depth, value:tempCurrent});
				_array = array.slice();
				_array.splice(i,1);
				iterator(_array.slice(), tempCurrent, depth + 1);
			}
		}
		return result;
	}

})();