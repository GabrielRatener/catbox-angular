
export const name = "NotificationsController";

export default function init({app, socket}) {
	const audio = new Audio('../../slap.wav');

	app.controller(name, ["$scope", function($scope) {
		let visible = true;

		$scope.unread = 0;
		$scope.index = null;

		socket.on("init", ({index}) => {
			$scope.index = index;
		});

		socket.on("message", ({sender}) => {
			if (sender !== $scope.index) {
				audio.play();

				if (!visible) {
					$scope.unread += 1;
					$scope.$apply();
				}
			}
		});

		window.addEventListener("visibilitychange", (e) => {
			visible = !document.hidden;
			if (visible) {
				$scope.unread = 0;
				$scope.$apply();
			}
		});
	}]);
}
