(function(){

	'use strict'

	angular
	.module('app')
	.controller('pageController', pageController);


	pageController.$inject = ['$scope', '$http'];
	function pageController($scope, $http){
		// var testString = "a, bbb, c 124";

		
		var vm = this;
		vm.itemsPerPage = 100;
		vm.searchString = '';
		vm.search = search;
		vm.combine = combine;
		vm.response = [];
		vm.twitterParts = [];
		vm.partLoaded = partLoaded;
		vm.partLoading = partLoading;
		vm.toggleSelection = toggleSelection;
		// vm.getResultsPage = getResultsPage;
		vm.currentPage = 1;
		vm.pagesCount = 0;
		vm.setCurrentPage = setCurrentPage;
		
		function combine(){
			vm.transpositions = createTranspositionsArray(vm.searchString);
			var length = vm.transpositions.length;
			fillTwitterResponseParts(length);
			fillVkResponseParts(length);
			
		}
		function search(){
			var start = 0;
			var loop = true;
			var part = 0;
			var length = vm.transpositions.length;
			// vm.transpositions = createTranspositionsArray(vm.searchString);
			
			//emptying data
			vm.response = [];
			vm.twitterParts = [];
			vm.vkParts = [];

			fillTwitterResponseParts(length);
			fillVkResponseParts(length);

			
			

			if (length == 0) {
				return;
			}
			//loading vk
			sendVkRequest(vm.transpositions[0], 0);
			//loading twitter
			while (loop){
				part = getPartIndex(start) ;
				sendTwitterRequest(
					joinTranspositions(vm.transpositions, start), 
					part
				);
				
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
		
		/*
			UI
		*/
		function partLoaded(index){
			return (vm.twitterParts[getPartIndex(index)].status == "loaded") && ( vm.vkParts[index].status == "loaded");
		}
		function partLoading(index){
			return (vm.twitterParts[getPartIndex(index)].status == "loading") && ( vm.vkParts[index].status == "loading");
		}
		function setCurrentPage(value){
			// $scope.$apply()
			var _value = Math.min(Math.max(value, 1), vm.pagesCount);
			vm.currentPage = _value;
		}
		function recalculatePages(){
			vm.pagesCount = Math.floor(vm.response.length/ vm.itemsPerPage) 
					+ ( (vm.response.length % vm.itemsPerPage == 0) ? 0:1);
			vm.pagesList = createPagesArray(vm.pagesCount);
			vm.response = $filter('orderBy')(vm.response, 'likes', false);
		}
		function toggleSelection(index){
			vm.transpositions[index].selected = ! vm.transpositions[index].selected;
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
		
		/*
			requesting START
		*/
		/*TWITTER+*/
		function sendTwitterRequest(q, part){

			var _part = part;
			if (q !== null){
				vm.twitterParts[part].status = 'loading';
				$http.get('backend/twitterSearch.php',
					{
						params:{q:q}
					}
				)
				.success(function(data){
					addTwitterItemsToResponse(data.statuses);
					recalculatePages();
					// console.log(vm.twitterParts);
					vm.twitterParts[_part].status = 'loaded';
					// vm.response = vm.response.concat(data.statuses);
				})
			}
			else{
				vm.twitterParts[_part].status = 'loaded';
			}
		}
		function fillTwitterResponseParts(length){
			vm.twitterParts = [];
			var parts = getPartIndex(length);
			for ( var i = 0; i < parts + 1; i++){
				vm.twitterParts.push({status:'idle'});
			}
			// console.log(vm.twitterParts);
		}
		function addTwitterItemsToResponse(array){
			function Item(data){

				var item = {};
				item.created_at = moment(
					array[i].created_at, 
					"ddd MMM dd HH:mm:ss zzzz yyyy" 
				).format('DD MMM YYYY');  
				item.response_type = 'twitter';
				item.text = data.text;
				item.likes = data.favorites_count;
				item.reposts = data.retweet_count;
				item.comments = 0;
				return item;
			}
			for ( var i=0; i < array.length; i++){
						
				vm.response.push( new Item(array[i]) );
				
			}
		}
		/*TWITTER-*/
		/*VK+*/
		function sendVkRequest(transposition, index){
			var _index = index;
			if ( transposition.selected) {		
				$http.get('backend/vkSearch.php',
					{
						params:{
							q: joinArray(transposition.value, ' ')
						}
					}
				).success(function(data){
					//console.log(data);
					//adding items
					// console.log(data);
					addVkItemsToResponse(data.response);
					recalculatePages();
					vm.vkParts[_index].status = 'loaded';
					//calling next search
					_index++;
					if (vm.transpositions.length > _index)
					sendVkRequest(vm.transpositions[_index], _index);

				})
			}
			else{
				_index++;
				if (vm.transpositions.length > _index)
					sendVkRequest(vm.transpositions[_index], _index);
			}

		}
		function addVkItemsToResponse(array){
			
			function Item(data){

				var item = {};
				item.created_at = moment(
					data.date, 
					"X" 
				).format('DD MMM YYYY');
				item.response_type = 'vk';
				item.text = data.text;
				item.likes = data.likes.count;
				item.reposts = data.reposts.count;
				item.comments = data.comments.count;
				return item;
			}
			for ( var i=1; i < array.length; i++){
				//skip nontext nodes
				if (array[i].text == ""){
					continue;
				}
			
				vm.response.push( new Item(array[i]) );
			}
		}
		function fillVkResponseParts(length){
			vm.vkParts = [];
			
			for ( var i = 0; i < length; i++){
				vm.vkParts.push({status:'idle'});
			}
		}
		/*VK-*/
		/*
			requesting END
		*/

		

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
		var arrayPart = transpositions.slice().splice(start, 4);
		var selectedItems = $.grep(arrayPart, function(el){
			return el.selected;
		});
		if (selectedItems.length == 0) {
			return null;
		}
		var result  = joinArray(selectedItems[0].value, ' ');
		// var length = Math.min(transpositions.length , 4 + start);
		for ( var i = 1; i < selectedItems.length; i++){
			//console.log(i + " " + transpositions[i]);
			result += ' OR ' + joinArray(selectedItems[i].value, ' ')  ;
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

				result.push(
					{
						depth: depth, 
						value:tempCurrent.slice(), 
						index: result.length,
						selected: true
					});
				_array = array.slice();
				_array.splice(0,i+1);

				// console.log(_array);
				iterator(_array.slice(), tempCurrent.slice(), depth + 1);
			}
		}
		return result;
	}

})();