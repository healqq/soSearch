(function(){

	'use strict'

	angular
	.module('app')
	.controller('pageController', pageController);


	pageController.$inject = ['$scope', '$http'];
	function pageController($scope, $http){
		// var testString = "a, bbb, c 124";

		
		var vm = this;
		vm.itemsPerPage = 20;
		vm.searchString = '';
		vm.search = search;
		vm.response = [];
		vm.twitterParts = [];
		vm.partLoaded = partLoaded;
		vm.partLoading = partLoading;
		// vm.getResultsPage = getResultsPage;
		vm.currentPage = 1;
		vm.pagesCount = 0;
		vm.setCurrentPage = setCurrentPage;
		

		function search(){
			var start = 0;
			var loop = true;
			var part = 0;
			vm.transpositions = createTranspositionsArray(vm.searchString);
			var length = vm.transpositions.length;
			//emptying data
			vm.response = [];
			vm.twitterParts = [];
			fillTwitterResponseParts(length);
			
			
			if (length == 0) {
				return;
			}
			while (loop){
				part = getPartIndex(start) ;
				sendTwitterRequest(
					joinTranspositions(vm.transpositions, start), 
					part
				);
				vm.twitterParts[part].status = 'loading';
				start +=4;
				if ( start > length){
					loop = false;
				}
			}
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
		/*
			UI
		*/
		function partLoaded(index){
			return vm.twitterParts[getPartIndex(index)].status == "loaded";
		}
		function partLoading(index){
			return vm.twitterParts[getPartIndex(index)].status == "loading";
		}
		// function getResultsPage(){
		// 	vm.pageIndex = 0;
		// 	var returnVal = [];
		// 	while ( vm.response.length > vm.pageIndex * 100){
		// 		returnVal.push(
		// 			{
		// 				array: vm.response.slice(
		// 						vm.pageIndex * 100, 
		// 						(vm.pageIndex+1) * 100
		// 					),
		// 				index: vm.pageIndex
		// 			}
		// 		);
		// 		vm.pageIndex++;
		// 	}
		// 	return returnVal;
		// }
		/*
			UI END
		*/
		function setCurrentPage(value){
			// $scope.$apply()
			var _value = Math.min(Math.max(value, 1), vm.pagesCount);
			vm.currentPage = _value;
		}
		function sendTwitterRequest(q, part){
			var _part = part;
			$http.get('backend/twitterSearch.php',
				{
					params:{q:q}
				}
			)
			.success(function(data){
				addItemsToResponse(data.statuses);
				vm.pagesCount = Math.floor(vm.response.length/ vm.itemsPerPage) 
					+ ( (vm.response.length % vm.itemsPerPage == 0) ? 0:1);
				vm.pagesList = createPagesArray(vm.pagesCount);
				vm.twitterParts[_part].status = 'loaded';
				// vm.response = vm.response.concat(data.statuses);
			})
		}
		function fillTwitterResponseParts(length){
			vm.twitterParts = [];
			var parts = getPartIndex(length);
			for ( var i = 0; i < parts + 1; i++){
				vm.twitterParts.push({status:'idle'});
			}
		}
		function addItemsToResponse(array){
			for ( var i=0; i < array.length; i++){
				array[i].created_at = moment(
					array[i].created_at, 
					"ddd MMM dd HH:mm:ss zzzz yyyy" 
				).format('DD MMM YYYY');  ;
				// console.log(array[i].created_at);
				vm.response.push(array[i]);
				// vm.pages = getResultsPage();
			}
		}


		

	}
		
	
	function getPartIndex(index) {
		return Math.floor(index / 4); 		
	}
	function createPagesArray(value) {
		var result =[];
		for ( var i=1; i <= value; i++){
			result.push(i);
		}
		return result;
	}
	function joinArray(value, separator){
		return value.join(separator)
	}
	function joinTranspositions(transpositions, start){
		var result  = joinArray(transpositions[start].value, ' ');
		var length = Math.min(transpositions.length , 4 + start);
		for ( var i = start + 1; i < length; i++){
			console.log(i + " " + transpositions[i]);
			result += ' OR ' + joinArray(transpositions[i].value, ' ')  ;
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
		iterator(array, [], 0);
		// }
		function iterator(array, current, depth){

			var _array; 
			var _current = current;
			var tempCurrent;
			for ( var i = 0; i < array.length; i++){
				//tempCurrent = _current + ' ' + array[i];
				tempCurrent = _current.slice();
				tempCurrent.push(array[i]);

				result.push({depth: depth, value:tempCurrent.slice(), index: result.length});
				_array = array.slice();
				_array.splice(0,i+1);

				// console.log(_array);
				iterator(_array.slice(), tempCurrent.slice(), depth + 1);
			}
		}
		return result;
	}

})();