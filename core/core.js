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

let random = () => Math.floor(Math.random()*2000000);

async function startPolling(){
	console.log('VK Duty запущен');
	console.log('Получаю данные о пользователе');

	let user;
	let last_message_id;

	try{
		user = await vk.api.users.get({});
		user = user[0];
		console.log('Данные о пользователе получены');
	}catch(err){
		if(err.code == 5){
			console.log('Недействительный токен');
			console.log('Получите новый по ссылке: https://oauth.vk.com/oauth/authorize?client_id=2685278&scope=1073737727&redirect_uri=https://oauth.vk.com/blank.html&display=page&response_type=token&revoke=1&__q_hash=0e6ab4e34e0d5550bc72e7008483fa2b');
			process.exit(-1);
		}else
			console.log(err);
	}

	await vk.api.messages.send({
		peer_id : user.id,
		random_id : random(),
		message : 'VK Duty v' + package.version + ' запущен ✅'
	});

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

			if(message.id == last_message_id)
				return;
			last_message_id = message.id;

			aliases.forEach(async alias => {
				let regexp = new RegExp('^'+alias.from + '$', 'im');
				if(!regexp.test(ctx.message.text))
					return;

				let match = ctx.message.text.match(regexp);			
				let answer = alias.to;

				answer = answer.replace(/{(.+)}/, m => {
					m = m.replace(/[{}]/g, '');
					let valueToReplace = match.groups[m];
					return valueToReplace;
				});

				await ctx.delete();

				let msg = {
					peer_id : ctx.message.peer_id,
					random_id : random(),
					message : answer
				}

				if(ctx.message.reply_message)
					msg.reply_to = ctx.message.reply_message.id;

				await ctx.api.messages.send(msg);
				return console.log(`Обработан алиас: ${alias.name}`);
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