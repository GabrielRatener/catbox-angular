
function showBox() {
	const messages = document.querySelector('.thread');
	messages.scrollTop = messages.scrollHeight;
}

const updatableProperties = ['name', 'color', 'online'];

export const name = "ChatController";

export default function init({app, socket}) {
	app.controller(name, ['$scope', function($scope) {
		$scope.thread = [];
		$scope.members = [];
		$scope.index = null;
		$scope.text = '';
		$scope.typing = -1;

		$scope.sendMessage = function(e) {
			const trimmed = $scope.text.trim()
			socket.emit('message', trimmed);					
			$scope.text = '';
		}
		
		
		$scope.addMessage = function(message) {
			if (this.thread.length > 0) {
				const top = this.thread.length - 1;
				const last = this.thread[top];

				// if less than a minute between messages, merge
				if (message.time - last.time < 60000
					&& last.sender === message.sender) {

					this.thread[top] = {
						body: `${last.body}\n\n${message.body}`,
						time: message.time,
						sender: message.sender
					};

					return;
				}
			}
			
			this.thread.push(message);
		}

		$scope.showTyping = function() {
			if (this.text.trim() === '')
				return;
			else
				socket.emit('update-typing', true);
		}

		socket.on('init', (json) => {
			$scope.thread = [];
			$scope.index = json.index;
			$scope.members = json.members;
			json.thread.forEach(
				message => $scope.addMessage(message))
			window.setTimeout(showBox, 0);

			$scope.$apply();
		});

		socket.on('message', (json) => {
			$scope.addMessage(json);
			window.setTimeout(showBox, 0);

			$scope.$apply();
		});

		for (let property of updatableProperties) {
			socket.on(`update-${property}`, (msg) => {
				$scope.members[msg.index][property] = msg[property];
				$scope.$apply();
			});
		}

		socket.on('update-typing', ({index, typing}) => {
			if (index === $scope.index) {
				return;
			}

			if (typing) {
				$scope.typing = index;
			} else {
				if (index === $scope.typing) {
					$scope.typing = -1;
				}
			}

			$scope.members[index].typing = typing;
			$scope.$apply();
		});
	}]);
}