(function () {
'use strict';

const hexSet = new Set('0123456789abcdefABCDEF');

function showBox() {
	const messages = document.querySelector('.thread');
	messages.scrollTop = messages.scrollHeight;
}

const audio = new Audio('../../slap.wav');

const app = angular.module('chatApp', []);
const [_, cid, uid] =
	window.location.pathname.split('/');
const url =
	`${window.location.protocol}//${window.location.hostname}:`
		+ `${window.location.port}/${cid}`;
const socket = io(url);

const updatableProperties = ['name', 'online', 'color'];

let visible = true;

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

app.filter('ntobr', ($sce) => ((value) => $sce.trustAsHtml((value || '')
	.replace(/\n/g, '<br/>')
	)));

app.filter('showUnread', () => ((value) =>
	(value > 0) ? `(${value}) ` : ''));

app.filter('bool', () => ((value, truthy = 'yes', falsy = 'no') => 
	value? truthy : falsy));

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

app.filter('color', () => ((value) => {
	const base = '#000';
	if (value.length === 3 || value.length === 6) {
		for (let char of value) {
			if (!hexSet.has(char)) {
				return base;
			}
		}
		return `#${value}`;
	} else {
		return base;
	}
}));

app.controller('ChatController', ['$scope', function($scope) {

	$scope.thread = [];
	$scope.members = [];
	$scope.index = null;
	$scope.text = '';
	$scope.typing = -1;

	$scope.sendMessage = function(e) {
		const trimmed = $scope.text.trim();
		socket.emit('message', trimmed);					
		$scope.text = '';
	};
	
	$scope.update = function(property) {
		socket.emit(`update-${property}`,
			this.members[this.index][property]);
	};
	
	$scope.addMessage = function(message) {
		if (this.thread.length > 0) {
			const top = this.thread.length - 1;
			const last = this.thread[top];

			// if more than a minute between thread
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
		if (json.sender !== $scope.index)
			audio.play();
		$scope.addMessage(json);
		window.setTimeout(showBox, 0);
		if (!visible) {
			$scope.unread += 1;
		}

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

	window.addEventListener('visibilitychange', (e) => {
		visible = !document.hidden;
		if (visible) {
			$scope.unread = 0;
		}
	});
}]);

}());
