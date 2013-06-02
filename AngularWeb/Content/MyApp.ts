'use strict';
/// <reference path='jquery.d.ts' />
/// <reference path='angular.d.ts' />
/// <reference path='Db.ts' />

var myApp = angular.module('myApp', ['ui.directives']);

//CONTROLLER: Home
function HomeCtrl($scope) {
	$scope.Name = "Alt.net";
	$scope.Welcome = function () {
		alert("Welcome: " + $scope.Name);
	};
}

//CONTROLLER: Header
function HeaderCtrl($scope, $location: ng.Location) {
	$scope.location = $location;
}

//ROUTING
myApp.config(function ($routeProvider: ng.RouteProvider) {
	$routeProvider
		.when('/',			{ templateUrl: '/Content/home.htm' })
		.when('/edit',		{ templateUrl: '/Content/edit.htm' })
		.when('/edit/:id',	{ templateUrl: '/Content/edit.htm' })
		.when('/list',		{ templateUrl: '/Content/list.htm' })
		.otherwise(			{ redirectTo: '/' })
	;
});

//HTTP: consume /api/orders REST service
module Db {
	export class Orders {
		constructor(public $http: ng.Http) { }
		public List(orderby, success) {
			this.$http.get('/api/orders?$orderby='+orderby).success(success).error(ErrorHandler);
		}
		public Delete(id, success) {
			this.$http.delete('/api/orders/' + id).success(success).error(ErrorHandler);
		}
		public Create() {
			var order = new Order();
			order.Items = [];
			return order;
		}
		public Save(order:Order, success) {
			this.$http.post('/api/orders', order).success(success).error(ErrorHandler);
		}
		public Load(id, success) {
			this.$http.get('/api/orders/' + id).success(function (order:any) {
				order.Date = parseISO8601(order.Date);
				success(order);
			}).error(ErrorHandler);
		}
		public Update(order:Order, success) {
			this.$http.put('/api/orders/' + order.OrderId, order).success(success).error(ErrorHandler);
		}
		public CreateItem(order:Order) {
			var item = new OrderItem();
			item.Description = "test";
			item.Amount = 0.0;
			order.Items.push(item);
		}
		public RemoveItem(order:Order, index) {
			order.Items.splice(index, 1);
		}
		public GetTotal(order:Order) {
			if (!order.Items) return 0;
			return order.Items.reduce(function (value, item: OrderItem) {
				return value + item.Amount;
			}, 0);
		}
	}
}

//SERVICE: register Db.Orders service with angular DI
myApp.factory('Orders', function ($http: ng.Http) {
	return new Db.Orders($http);
});

//UTILITY: display json error object message
function ErrorHandler(error) {
	alert('Server Error ' + ErrorMessage(error.data ? error.data : error));
}

//UTILITY: extract innermost message from exception object
function ErrorMessage(ex) {
	return ex.InnerException ? ErrorMessage(ex.InnerException) : (ex.ExceptionMessage || ex.Message);
}

//CONTROLLER: list
function ListCtrl($scope, Orders: Db.Orders) {
	$scope.Refresh = function () {
		Orders.List($scope.OrderBy, function (orders) {
			$scope.Model = orders;
		});
	};
	$scope.$watch('OrderBy', function () {
		$scope.Refresh();
	});
	$scope.OrderBy = 'Date';
	$scope.Delete = function (id) {
		Orders.Delete(id, function () {
			$scope.Refresh();
		});
	};
	$scope.Where = function(paid: bool) {
		$scope.whereFilter = paid == undefined ? {} : { Paid:paid };
	};
	$scope.Where();
	$scope.Selected = function(paid: bool): bool {
		return $scope.whereFilter.Paid == paid;
	};
}

//FILTER: Text filter to convert boolean value to checkmark
myApp.filter('checkmark', function () {
	return function (boolValue: bool) {
		return boolValue ? '\u2713' : '\u2718';
	};
});

//FILTER: convert ISO 8601 string to date
myApp.filter('strToDate', function () {
	return function (dateString: string) {
		return parseISO8601(dateString);
	};
});

//UTILITY: convert web api utc date string to local time date object
function parseISO8601(str: string): Date {

	var parts = str.split('T'),
	dateParts = parts[0].split('-'),
	timeParts = parts[1].split('Z'),
	timeSubParts = timeParts[0].split(':'),
	timeSecParts = timeSubParts[2].split('.'),
	timeHours = Number(timeSubParts[0]),
	_date = new Date;

	_date.setUTCFullYear(Number(dateParts[0]));
	_date.setUTCMonth(Number(dateParts[1]) - 1);
	_date.setUTCDate(Number(dateParts[2]));
	_date.setUTCHours(Number(timeHours));
	_date.setUTCMinutes(Number(timeSubParts[1]));
	_date.setUTCSeconds(Number(timeSecParts[0]));
	if (timeSecParts[1]) _date.setUTCMilliseconds(Number(timeSecParts[1]));

	return _date;
}

//DIRECTIVE: confirm='func' will popup confirmation dialog with optional confirm-msg attribute
myApp.directive('confirm', function($parse: ng.$parse) {
	return {
		restrict: 'A', //Attribute
		link: function(scope: ng.Scope, elm, attrs) {
			elm.bind('click', function() {

				var confirmMsg = attrs.confirmMsg || 'Are you sure?';
				if (confirmMsg.indexOf('{{') > -1) 
					confirmMsg = scope.$eval(confirmMsg);

				if (!confirm(confirmMsg)) 
					return false;
				
				var confirmFunc = $parse(attrs.confirm);
				confirmFunc(scope);
				
				return true;
			});
		}
	};
});

//COMPONENT: navbar
myApp.directive('navbar', function() {
	return {
		restrict: 'E', //Element
		replace: true,
		transclude: true,
		template: "<div class='navbar navbar-static-top'><div class='navbar-inner'><div ng-transclude></div></div>",
		link: function(scope) {
			
		}
	};
});

//REF: http://jsfiddle.net/niden/86L5p/
//INTERCEPTOR: httpSpinner
myApp
	.config(function ($httpProvider) {
		$httpProvider.responseInterceptors.push('httpSpinner');
		var startSpinner = function (data, headersGetter) {
			$('.ajax-loader').show();
			return data;
		};
		$httpProvider.defaults.transformRequest.push(startSpinner);
	})
	// register the interceptor as a service, intercepts ALL angular ajax http calls
	.factory('httpSpinner', function ($q, $window) {
		var stopSpinner = function () {
			$('.ajax-loader').hide();
		}
		return function (promise) {
			return promise.then(function (response) {
				stopSpinner();
				return response;
			}, function (response) {
				stopSpinner();
				return $q.reject(response);
			});
		};
	})
;

//CONTROLLER: Edit
function EditCtrl($scope, $location: ng.Location, $routeParams, Orders: Db.Orders) {
	var isnew = !$routeParams.id;
	$scope.Model = {};
	if (isnew) {
		$scope.Model = Orders.Create();
		$scope.Save = function () {
			Orders.Save($scope.Model, function () {
				$location.path("/list");
			});
		};
	} else {
		Orders.Load($routeParams.id, function (data) { 
			$scope.Model = data;
		});
		$scope.Save = function () {
			Orders.Update($scope.Model, function () {
				$location.path("/list");
			});
		};
	}
	$scope.Add = function () {
		Orders.CreateItem($scope.Model);
	};
	$scope.Remove = function (index) {
		Orders.RemoveItem($scope.Model, index);
		$scope.$apply();
	};
	$scope.Total = function () {
		return Orders.GetTotal($scope.Model);
	};
}
