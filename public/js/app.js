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
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

app.controller('ListController', ['$http', '$scope', function($http, $scope) {
    $scope.transactions = [];

    $http.get('/api/list').success(function(data) {
        $scope.transactions = data;
    });
}]);

app.controller('DetailController', function($http, $scope, $routeParams, $location) {
    $scope.t = {};

    $http.get('/api/get/' + $routeParams.id).success(function(data) {
        $scope.t = data;
    });

    $scope.editTransaction = function() {
        $http.post('/api/modify', $scope.t)
            .success(function(result) {
                if (result === '1') $location.path('/');
                else alert('수정 중 오류가 발생했습니다.');
            });
    };

    $scope.deleteTransaction = function() {
        $http.post('/api/delete/' + $scope.t.id)
            .success(function(result) {
                if (result === '1') $location.path('/');
                else alert('삭제하지 못했습니다.');
            });
    };
});
