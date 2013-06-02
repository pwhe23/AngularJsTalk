'use strict';
var myApp = angular.module('myApp', [
    'ui.directives'
]);
function HomeCtrl($scope) {
    $scope.Name = "Alt.net";
    $scope.Welcome = function () {
        alert("Welcome: " + $scope.Name);
    };
}
function HeaderCtrl($scope, $location) {
    $scope.location = $location;
}
myApp.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/Content/home.htm'
    }).when('/edit', {
        templateUrl: '/Content/edit.htm'
    }).when('/edit/:id', {
        templateUrl: '/Content/edit.htm'
    }).when('/list', {
        templateUrl: '/Content/list.htm'
    }).otherwise({
        redirectTo: '/'
    });
});
var Db;
(function (Db) {
    var Orders = (function () {
        function Orders($http) {
            this.$http = $http;
        }
        Orders.prototype.List = function (orderby, success) {
            this.$http.get('/api/orders?$orderby=' + orderby).success(success).error(ErrorHandler);
        };
        Orders.prototype.Delete = function (id, success) {
            this.$http.delete('/api/orders/' + id).success(success).error(ErrorHandler);
        };
        Orders.prototype.Create = function () {
            var order = new Db.Order();
            order.Items = [];
            return order;
        };
        Orders.prototype.Save = function (order, success) {
            this.$http.post('/api/orders', order).success(success).error(ErrorHandler);
        };
        Orders.prototype.Load = function (id, success) {
            this.$http.get('/api/orders/' + id).success(function (order) {
                order.Date = parseISO8601(order.Date);
                success(order);
            }).error(ErrorHandler);
        };
        Orders.prototype.Update = function (order, success) {
            this.$http.put('/api/orders/' + order.OrderId, order).success(success).error(ErrorHandler);
        };
        Orders.prototype.CreateItem = function (order) {
            var item = new Db.OrderItem();
            item.Description = "test";
            item.Amount = 0.0;
            order.Items.push(item);
        };
        Orders.prototype.RemoveItem = function (order, index) {
            order.Items.splice(index, 1);
        };
        Orders.prototype.GetTotal = function (order) {
            if(!order.Items) {
                return 0;
            }
            return order.Items.reduce(function (value, item) {
                return value + item.Amount;
            }, 0);
        };
        return Orders;
    })();
    Db.Orders = Orders;    
})(Db || (Db = {}));
myApp.factory('Orders', function ($http) {
    return new Db.Orders($http);
});
function ErrorHandler(error) {
    alert('Server Error ' + ErrorMessage(error.data ? error.data : error));
}
function ErrorMessage(ex) {
    return ex.InnerException ? ErrorMessage(ex.InnerException) : (ex.ExceptionMessage || ex.Message);
}
function ListCtrl($scope, Orders) {
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
    $scope.Where = function (paid) {
        $scope.whereFilter = paid == undefined ? {
        } : {
            Paid: paid
        };
    };
    $scope.Where();
    $scope.Selected = function (paid) {
        return $scope.whereFilter.Paid == paid;
    };
}
myApp.filter('checkmark', function () {
    return function (boolValue) {
        return boolValue ? '\u2713' : '\u2718';
    }
});
myApp.filter('strToDate', function () {
    return function (dateString) {
        return parseISO8601(dateString);
    }
});
function parseISO8601(str) {
    var parts = str.split('T'), dateParts = parts[0].split('-'), timeParts = parts[1].split('Z'), timeSubParts = timeParts[0].split(':'), timeSecParts = timeSubParts[2].split('.'), timeHours = Number(timeSubParts[0]), _date = new Date();
    _date.setUTCFullYear(Number(dateParts[0]));
    _date.setUTCMonth(Number(dateParts[1]) - 1);
    _date.setUTCDate(Number(dateParts[2]));
    _date.setUTCHours(Number(timeHours));
    _date.setUTCMinutes(Number(timeSubParts[1]));
    _date.setUTCSeconds(Number(timeSecParts[0]));
    if(timeSecParts[1]) {
        _date.setUTCMilliseconds(Number(timeSecParts[1]));
    }
    return _date;
}
myApp.directive('confirm', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            elm.bind('click', function () {
                var confirmMsg = attrs.confirmMsg || 'Are you sure?';
                if(confirmMsg.indexOf('{{') > -1) {
                    confirmMsg = scope.$eval(confirmMsg);
                }
                if(!confirm(confirmMsg)) {
                    return false;
                }
                var confirmFunc = $parse(attrs.confirm);
                confirmFunc(scope);
                return true;
            });
        }
    };
});
myApp.directive('navbar', function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: "<div class='navbar navbar-static-top'><div class='navbar-inner'><div ng-transclude></div></div>",
        link: function (scope) {
        }
    };
});
myApp.config(function ($httpProvider) {
    $httpProvider.responseInterceptors.push('httpSpinner');
    var startSpinner = function (data, headersGetter) {
        $('.ajax-loader').show();
        return data;
    };
    $httpProvider.defaults.transformRequest.push(startSpinner);
}).factory('httpSpinner', function ($q, $window) {
    var stopSpinner = function () {
        $('.ajax-loader').hide();
    };
    return function (promise) {
        return promise.then(function (response) {
            stopSpinner();
            return response;
        }, function (response) {
            stopSpinner();
            return $q.reject(response);
        });
    }
});
function EditCtrl($scope, $location, $routeParams, Orders) {
    var isnew = !$routeParams.id;
    $scope.Model = {
    };
    if(isnew) {
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
//@ sourceMappingURL=MyApp.js.map
