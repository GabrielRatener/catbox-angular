
import addDirectives from "./directives"
import addFilters from "./filters"
import notificationsCtrl from "./notifications-ctrl"
import profileCtrl from "./profile-ctrl"
import chatCtrl from "./chat-ctrl"

const app = angular.module('chatApp', []);
const [_, cid, uid] =
	window.location.pathname.split('/');
const url =
	`${window.location.protocol}//${window.location.hostname}:`
		+ `${window.location.port}/${cid}`;
const socket = io(url);

const params = {app, socket};

addDirectives(app);
addFilters(app);

notificationsCtrl(params);
profileCtrl(params);
chatCtrl(params);
