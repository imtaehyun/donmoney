var app = angular.module('donmoney-web',['ngRoute']);
//var apiUrl = 'http://localhost:8080';
var apiUrl = 'http://nezz.pe.kr:8080';

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
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

app.controller('ListController', ['$http', '$scope', function($http, $scope) {
    $scope.transactions = [];

    $http.get(apiUrl + '/list').success(function(data) {
        $scope.transactions = data;
    });
}]);

app.controller('DetailController', function($http, $scope, $routeParams, $location) {
    $scope.t = {};

    $http.get(apiUrl + '/get?id=' + $routeParams.id).success(function(data) {
        $scope.t = data;
    });

    $scope.editTransaction = function() {
        $http({method: 'POST', url: apiUrl + '/modify', params: $scope.t})
            .success(function(result) {
                if (result === '1') $location.path('/');
                else alert('수정 중 오류가 발생했습니다.');
            });
    };

    $scope.deleteTransaction = function() {
        $http.post(apiUrl + '/delete?id='+$scope.t.id)
            .success(function(result) {
                if (result === '1') $location.path('/');
                else alert('삭제하지 못했습니다.');
            });
    };
});
