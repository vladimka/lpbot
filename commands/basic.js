const package = require('../package.json');

module.exports = {
	async info(ctx){
		let answer = [
			'VK Duty v' + package.version + ' by @javascriptonelove (Vladimir Zverev)',
			'',
			'Префикс: ' + ctx.db.get('prefix'),
			'Алиасов: ' + ctx.db.get('aliases').value().length,
			'РП комманд: ' + ctx.db.get('rp_commands').value().length
		].join('\n')

		await ctx.edit(answer);
	},
	async prefix(ctx, match){
		ctx.db.set('prefix', match[1]).write();
		await ctx.sendSuccess(`Новый префикс ${match[1]} установлен`);
	},
	async smsinfo(ctx){
		let message = ctx.message;

		if(ctx.message.reply_message)
			message = ctx.message.reply_message;

		await ctx.edit(JSON.stringify(message, null, '\t'));
	},
	async js(ctx, match){
		let res, err;
		try{
			res = eval(match.groups.code);
		}catch(e){
			err = e;
		}
		if(err)
			await ctx.sendError(`Произошла ошибка\n${err}`);
		else{
			let type = typeof res;
			if(type == 'object')
				res = JSON.stringify(res, null, '\t');
			await ctx.edit(`${type} : ${res}`);
		}
	},
	async ping(ctx){
		let lpPing = new Date(ctx.message.date).getMilliseconds();
		let answer = [];
		let start = Date.now();

		await ctx.api.users.get({});

		let vkPing = Date.now() - start;

		answer = [
			'Пинг ВК ' + vkPing/1000 + 'с',
			'Пинг ЛП ' + lpPing/1000 + 'с'
		]

		await ctx.edit(answer.join('\n'));
	},
	async userinfo(ctx){
		let userId;

		if(!ctx.message.reply_message)
			userId = ctx.user.id;
		else{
			if(ctx.message.reply_message.from_id < 0)
				return await ctx.sendError("Перешлите сообщение пользователя");
			userId = ctx.message.reply_message.from_id;
		}

		let user = await ctx.api.users.get({
			user_ids : userId,
			fields : 'sex,city,bdate,country,domain'
		});
		user = user[0];

		let answer = [
			`Это @id${userId} (${user.first_name} ${user.last_name})`,
			`Пол: ${['???', 'Женский', 'Мужской'][user.sex]}`,
			`Место проживания: ${user.country != undefined ? user.country.title : '???'}, ${user.city != undefined ? user.city.title : '???'}`,
			`Дата рождения: ${user.bdate != undefined ? user.bdate : '???'}`,
			`Короткая ссылка: @${user.domain}`,
		];

		await ctx.edit(answer.join('\n'));
	},
	async deleteMessages(ctx, match){
		let { offset, count } = match.groups;

		offset = parseInt(offset);
		count = parseInt(count);

		if(count == undefined){
			if(offset == undefined){
				count = 0;
				offset = 0;
			}else{
				count = offset;
				offset = 0;
			}
		}

		let messages = await ctx.api.messages.getHistory({
			peer_id : ctx.message.peer_id,
			offset : offset + 1,
			count
		});

		messages = messages.items;
		messages = messages.filter(async msg => {
			if(msg.peer_id != ctx.user.id && msg.from_id == ctx.user.id)
				return msg;
		});

		messages.forEach(async msg => await ctx.delete(msg.id, 1));

		await ctx.sendSuccess(`Удалено ${messages.length} сообщений`);
	},
	async editMessages(ctx, match){
		let { offset, count, text } = match.groups;

		offset = parseInt(offset);
		count = parseInt(count);

		if(count == undefined){
			if(offset == undefined){
				count = 0;
				offset = 0;
			}else{
				count = offset;
				offset = 0;
			}
		}

		if(text == undefined)
			text = "[ДАННЫЕ УДАЛЕНЫ]"

		let messages = await ctx.api.messages.getHistory({
			peer_id : ctx.message.peer_id,
			offset : offset + 1,
			count
		});

		messages = messages.items;
		messages = messages.filter(async msg => {
			if(msg.from_id == ctx.user.id)
				return msg;
		});

		messages.forEach(async msg => await ctx.edit(text, msg.id));
		await ctx.sendSuccess(`Измеенено ${messages.length} сообщений`);
	},
	async editAndDeleteMessages(ctx, match){
		let { offset, count, text } = match.groups;

		offset = parseInt(offset);
		count = parseInt(count);

		if(count == undefined){
			if(offset == undefined){
				count = 0;
				offset = 0;
			}else{
				count = offset;
				offset = 0;
			}
		}

		if(text == undefined)
			text = "[ДАННЫЕ УДАЛЕНЫ]"

		let messages = await ctx.api.messages.getHistory({
			peer_id : ctx.message.peer_id,
			offset : offset + 1,
			count
		});

		messages = messages.items;
		messages = messages.filter(async msg => {
			if(msg.from_id == ctx.user.id)
				return msg;
		});

		messages.forEach(async msg => {
			await ctx.edit(text, msg.id);
			await ctx.delete(msg.id, 1);
		});
		await ctx.sendSuccess(`Измеенено ${messages.length} сообщений`);
	}
}