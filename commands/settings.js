module.exports = {
	async list(ctx){
		let answer = [
			'Настройки VK Duty',
			'',
			`1. Удалять ответы на команды: ${ctx.db.get('settings.deleteAnswers').value() == true ? 'да' : 'нет'}`,
			`2. Период удаления ответов на команды: ${ctx.db.get('settings.deleteAnswersDelay').value()} секунд`
		];

		await ctx.edit(answer.join('\n'));
	},
	async set(ctx, match){
		switch(match[2]){
			case '1':
				if(match[3] == '+'){
					ctx.db.set('settings.deleteAnswers', true).write();
					await ctx.sendSuccess('Удаление ответов на команды включено');
				}else if(match[3] == '-'){
					ctx.db.set('settings.deleteAnswers', false).write();
					await ctx.sendSuccess('Удаление ответов на команды выключено');
				}else
					ctx.sendError('Неизвестный параметр. Может быть только "+" или "-"!');
			break;
			case '2':
				let value = match[3];

				ctx.db.set('settings.deleteAnswersDelay', parseInt(value)).write();

				await ctx.sendSuccess('Период удаления ответов на команды установлено в ' + value + ' секунд');
			break;
			default:
				await ctx.sendError('Настройки с таким номером не существует');
		}
	}
}