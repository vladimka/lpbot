const core = require('./core/core.js');
const package = require('./package.json');

function showAliases(aliases){
	let str = 'Вашы алиасы\n';

	if(aliases.length == 0)
		return str += '\nУ вас нету алиасов';

	aliases.forEach((alias, i) => {
		str += `\n${i+1}. ${alias.name} (${alias.from} -> ${alias.to})`
	});

	return str;
}

function isAliasNameFree(aliases, name){
	let empty = true;
	aliases.forEach(alias => {
		if(alias.name == name)
			return empty = false;
	});
	return empty;
}

core.addCommand({
	regexp : /лп/, 
	async handler(ctx){
		await ctx.sendSuccess("На месте");
	},
	name : 'лп'
});

core.addCommand({
	regexp : /^инфо/m,
	name : 'инфо',
	async handler(ctx){
		let answer = [
			'VK Duty v' + package.version + ' by @javascriptonelove (Vladimir Zverev)',
			'',
			'Префикс: ' + ctx.db.get('prefix'),
			'Алиасов: ' + ctx.db.get('aliases').value().length
		].join('\n')

		await ctx.edit(answer);
	}
});

core.addCommand({
	regexp : /~префикс\s+(.+)/,
	name : '~префикс',
	async handler(ctx, match){
		ctx.db.set('prefix', match[1]).write();
		await ctx.sendSuccess(`Новый префикс ${match[1]} установлен`);
	}
})

core.addCommand({
	regexp : /алиасы/,
	name : 'алиасы',
	async handler(ctx){
		let aliases = ctx.db.get('aliases').value();
		await ctx.edit(showAliases(aliases));
	}
});

core.addCommand({
	regexp : /\+алиас\s+(?<alias_name>.+)\s*\/\s*(?<from>.+)\s*\/\s*(?<to>.+)/,
	name : '+алиас',
	async handler(ctx, match){
		let { alias_name, from, to } = match.groups;

		if(!isAliasNameFree(ctx.db.get("aliases").value(), alias_name))
			return await ctx.sendError(`Алиаc "${match.groups.alias_name}" уже создан`);

		ctx.db.get("aliases").push({
			name : alias_name,
			from : from,
			to : to
		}).write();

		await ctx.sendSuccess(`Алиас "${alias_name}" создан`);
	}
});

core.addCommand({
	regexp : /\-алиас\s+(?<alias_name>.+)/,
	name : '-алиас',
	async handler(ctx, match){
		let { alias_name, from, to } = match.groups;

		if(isAliasNameFree(ctx.db.get("aliases").value(), alias_name))
			return await ctx.sendError(`Алиас "${alias_name}" не найден`);

		ctx.db.get("aliases").remove({ name : alias_name }).write();

		await ctx.sendSuccess(`Алиас "${alias_name}" удален`);
	}
});

core.addCommand({
	regexp : /\~алиас\s+(?<alias_name>.+)\s*\/\s*(?<to>.+)/,
	name : '~алиас',
	async handler(ctx, match){
		let { alias_name, to } = match.groups;

		if(isAliasNameFree(ctx.db.get("aliases").value(), alias_name))
			return await ctx.sendError(`Алиас "${alias_name}" не найден`);

		ctx.db.get("aliases").find({ name : alias_name })
			.assign({to})
			.write();

		await ctx.sendSuccess(`Алиас "${alias_name}" изменен`);
	}
});

core.addCommand({
	regexp : /смсинфо/, 
	name : 'смсинфо',
	async handler(ctx){
		let message = ctx.message;

		if(ctx.message.reply_message)
			message = ctx.message.reply_message;

		await ctx.edit(JSON.stringify(message, null, '\t'));
	}
});

core.addCommand({
	name : 'рп',
	regexp : /^рп\s+(?<rp_name>.+)/m,
	async handler(ctx, match){
		let rp_name = match.groups.rp_name;
		let rp = ctx.db.get('rp_commands').find({name:rp_name}).value();

		if(!ctx.message.reply_message)
			return await ctx.sendError("Необходим реплай");

		if(rp == undefined)
			return await ctx.sendError(`РП "${rp_name}" не существует`);

		await ctx.sendRp(ctx.message.reply_message.from_id, rp_name);
	}
});

core.addCommand({
	name : '+рп',
	regexp : /\+рп\s+(?<name>.+)\s*\/\s*(?<sticker>.+)\s*\/\s*(?<action>.+)/,
	async handler(ctx, match){
		let { name, sticker, action } = match.groups;
		let rp = ctx.db.get('rp_commands').find({name}).value();

		if(rp != undefined)
			return await ctx.sendError(`РП "${name}" уже существует`);

		await ctx.db.get('rp_commands')
			.push({ name, sticker, action })
			.write();

		await ctx.sendSuccess(`РП команда "${name}" создана`);
	}
});

core.addCommand({
	name : '-рп',
	regexp : /\-рп\s+(?<name>.+)/,
	async handler(ctx, match){
		let { name } = match.groups;

		if(ctx.db.get('rp_commands').find({name}).value() == undefined)
			return await ctx.sendError(`РП "${name}" не существует`);

		await ctx.db.get('rp_commands')
			.remove({ name})
			.write();

		await ctx.sendSuccess(`РП команда "${name}" удалена`);
	}
});

core.addCommand({
	name : 'рп список',
	regexp : /рп$/m,
	async handler(ctx){
		let answer = ['Ваши рп', ''];

		let rp_commands = await ctx.db.get('rp_commands').value();

		rp_commands.forEach((rp, i) => {
			answer.push(`${i+1}. ${rp.name}/${rp.sticker}/${rp.action}`);
		});

		if(rp_commands.length == 0)
			answer.push('У вас нету РП комманд. Создайте их командой +рп');

		await ctx.edit(answer.join('\n'));
	}
});

core.addCommand({
	regexp : /(js|жс)\s+(?<code>.+)/,
	name : 'js',
	async handler(ctx, match){
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
			await ctx.sendSuccess(`${type} : ${res}`);
		}
	}
});

core.addCommand({
	regexp : /^пинг$/m,
	name : 'пинг',
	async handler(ctx){
		let lpPing = new Date(ctx.message.date).getMilliseconds();
		let start = Date.now();
		let answer = [];

		await ctx.api.users.get({});

		let vkPing = Date.now() - start;

		answer = [
			'Пинг ВК ' + vkPing/1000 + 'с',
			'Пинг ЛП ' + lpPing/1000 + 'с'
		]

		await ctx.edit(answer.join('\n'));
	}
});

core.addCommand({
	regexp : /^юзеринфо$/m,
	name : 'юзеринфо',
	async handler(ctx){
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
	}
});

core.startPolling();