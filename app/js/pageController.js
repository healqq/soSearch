(function(){

	'use strict'

	angular
	.module('app')
	.controller('pageController', pageController);

	function pageController(){
		var vm = this;
		vm.message = 'hi!';
	}
})();