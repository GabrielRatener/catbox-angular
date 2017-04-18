(function () {
'use strict';

// all valid hex symbols for color validation
const hexSet = new Set('0123456789abcdefABCDEF');

function addFilters(app) {
	app.filter('signify', () => ((value, name) => {
		if (value === name) {
			return `me (${name}):`;
		} else {
			return value + ':';
		}
	}));

	app.filter('initials', () => ((value) => (value || '')
		.split(/\s+/g)
		.map(word => word[0])
		.join('')
		));


	app.filter('time', () => ((value) => {
		const date = new Date(+value);
		const hours = date.getHours();
		const median = (11 < hours && hours < 24) ? 'PM' : 'AM';
		const minutes = date.getMinutes();
		const officialHour = (hours === 0) ? 12 : hours;

		return `${(officialHour - 1) % 12 + 1}:${(minutes < 10 ? '0' : '') + minutes} ${median}`;
	}));

	app.filter('getName', () => ((index, members) =>
		index !== null && index > -1 ? members[index].name : ''));

	app.filter('cap', () => ((value) => (value || '')
		.split(/\s/g)
		.map(string => string?string[0].toUpperCase() + string.substr(1) : '')
		.join(' ')
		));

	// converts line breaks to <br>s
	app.filter('ntobr', ($sce) => ((value) => $sce.trustAsHtml((value || '')
		.replace(/\n/g, '<br/>')
		)));


	app.filter('bool', () => ((value, truthy = 'yes', falsy = 'no') => 
		value ? truthy : falsy));

	app.filter('contains', () => ((array, key, value, index = -1) => {
		for (let i = 0; i < array.length; i++) {
			const element = array[i];
			if (i === index) {
				continue;
			}

			if (element.hasOwnProperty(key) && element[key] === value) {
				return true;
			}
		}

		return false;
	}));

	app.filter('typingNames', () => ((array, index) => {
		const arr = [];
		for (let i = 0; i < array.length; i++) {
			const {typing, name} = array[i];
			if (typing && i !== index) {
				arr.push(name);
			}
		}

		switch (arr.length) {
			case 1:
				return `${arr[0]} is typing...`;
			case 2:
				return `${arr[0]} and ${arr[1]} are typing...`;
			default:
				const last = arr.pop();
				return `${arr.join(', ')}, and ${last} are typing...`;
		}
	}));

	app.filter('length', () => ((value) => value.length));

	app.filter('rgb', () => ((value) => `rgb(${value.join(',')})`));

	// verify and format hex strings into html colors
	app.filter('hexColor', () => ((value, defaultColor = "#000") => {
		if (value && (value.length === 3 || value.length === 6)) {
			for (let c in value) {
				if (!hexSet.has(c))
					return defaultColor;
			}

			return `#${value.toUpperCase()}`;
		} else {
			return defaultColor;
		}
	}));

	// show unread messages in parens (for page title)
	app.filter('showUnread', () => ((value) =>
		(value > 0) ? `(${value}) ` : ''));
}

const name = "NotificationsController";

function init({app, socket}) {
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

const name$1 = 'ProfileController';

function init$1({app, socket}) {
	app.controller(name$1, ["$scope", function($scope) {
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
		};

		$scope.updateColor = function() {
			socket.emit(`update-color`, $scope.color);
		};
	}]);
}

function showBox() {
	const messages = document.querySelector('.thread');
	messages.scrollTop = messages.scrollHeight;
}

const updatableProperties = ['name', 'color', 'online'];

const name$2 = "ChatController";

function init$2({app, socket}) {
	app.controller(name$2, ['$scope', function($scope) {
		$scope.thread = [];
		$scope.members = [];
		$scope.index = null;
		$scope.text = '';
		$scope.typing = -1;

		$scope.sendMessage = function(e) {
			const trimmed = $scope.text.trim();
			socket.emit('message', trimmed);					
			$scope.text = '';

			e.preventDefault();
			e.stopPropagation();
		};
		
		
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
		};

		$scope.showTyping = function() {
			if (this.text.trim() === '')
				return;
			else
				socket.emit('update-typing', true);
		};

		socket.on('init', (json) => {
			$scope.thread = [];
			$scope.index = json.index;
			$scope.members = json.members;
			json.thread.forEach(
				message => $scope.addMessage(message));
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

const app = angular.module('chatApp', []);
const [_, cid, uid] =
	window.location.pathname.split('/');
const url =
	`${window.location.protocol}//${window.location.hostname}:`
		+ `${window.location.port}/${cid}`;
const socket = io(url);

const params = {app, socket};

addFilters(app);

init(params);
init$1(params);
init$2(params);

}());
