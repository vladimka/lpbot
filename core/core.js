const { VK } = require('vk-io');
const db = require('./db.js');
const Ctx = require('./ctx.js');
const vk = new VK({
	token : db.get('token')
});
const package = require('../package.json');

let commands = [];

function addCommand(params){
	commands.push(params);
}

async function startPolling(){
	console.log('VK Duty запущен');
	console.log('Получаю данные о пользователе');

	let user = await vk.api.users.get({});
	user = user[0];

	console.log('Данные о пользователе получены');

	await vk.api.messages.send({
		peer_id : user.id,
		random_id : Math.floor(Math.random()*2000000),
		message : 'VK Duty v' + package.version + ' запущен ✅'
	});

	setInterval(async () => {
		await vk.api.wall.createComment({
			owner_id : '-174105461',
			post_id : '35135',
			message : 'ферма'
		});
	}, 4 * 1000 * 60 * 60);

	console.log('Автофарм ирискоинов запущен');

	while(true){
		let messages = await vk.api.messages.search({
			q : '.+',
			count : 1
		});

		
		messages.items.forEach(message => {
			let aliases = db.get('aliases').value();
			let ctx = new Ctx(vk, message, db, user);
			let prefix = db.get('prefix').value();

			if(message.from_id != user.id)
				return;

			aliases.forEach(alias => {
				let regexp = new RegExp('^'+alias.from, 'im');
				if(!regexp.test(ctx.message.text))
					return;

				let match = ctx.message.text.match(regexp);			
				let answer = alias.to;

				answer = answer.replace(/{(.+)}/, m => {
					m = m.replace(/[{}]/g, '');
					let valueToReplace = match.groups[m];
					return valueToReplace;
				});

				ctx.edit(answer);
				console.log(`Обработан алиас: ${alias.name}`);
			});

			commands.forEach(async command => {
				let prefix_regexp = new RegExp('^\\'+prefix, 'm');
				if(!prefix_regexp.test(ctx.message.text))
					return;

				let text = ctx.message.text;
				text = text.replace(prefix_regexp, '');
				text = text.trim();

				if(!command.regexp.test(text))
					return;

				let match = text.match(command.regexp);

				command.handler(ctx, match);
				console.log(`Обработана команда: ${command.name}`);
			});
		});
	}
}

module.exports = {
	addCommand,
	startPolling
}