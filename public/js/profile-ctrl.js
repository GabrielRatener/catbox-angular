
export const name = 'ProfileController';

export default function init({app, socket}) {
	app.controller(name, ["$scope", function($scope) {
		$scope.name = '';
		$scope.color = "000";

		socket.on("init", ({index, members}) => {
			const {color, name} = members[index];
			$scope.name = name;
			$scope.color = color;

			$scope.$apply();
		});

		$scope.updateName = function() {
			socket.emit(`update-name`, $scope.name);
		}

		$scope.updateColor = function() {
			socket.emit(`update-color`, $scope.color);
		}
	}]);
}
