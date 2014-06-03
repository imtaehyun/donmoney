var app = angular.module('donmoney-web',['ngRoute']);

app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $routeProvider.
        when('/', {
            templateUrl: '/partials/list.html',
            controller: 'ListController'
        }).
        when('/detail/:id', {
            templateUrl: '/partials/detail.html',
            controller: 'DetailController'
        }).
        otherwise({
            redirectTo: '/'
        });
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

app.controller('ListController', ['$http', '$scope', function($http, $scope) {
    $scope.transactions = [];
    $http.get('http://nezz.pe.kr:8080/list').success(function(data) {
        $scope.transactions = data;
    });
}]);

app.controller('DetailController', function($http, $scope, $routeParams, $location) {
    $scope.t = {};
    $http.get('http://nezz.pe.kr:8080/get?id=' + $routeParams.id).success(function(data) {
        $scope.t = data;
    });
    $scope.editTransaction = function() {
        $http.post('http://nezz.pe.kr:8080/modify', $scope.t).success(function(data) {
            alert(data);
        });
    };

    $scope.deleteTransaction = function() {
        $http.post('http://nezz.pe.kr:8080/delete?id='+$scope.t.id).success(function(data) {
            alert(data);
            $location.path('/');
        });
    };
});
