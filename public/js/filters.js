
// all valid hex symbols for color validation
const hexSet = new Set('0123456789abcdefABCDEF');

export default function addFilters(app) {
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
