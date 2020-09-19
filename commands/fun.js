module.exports = {
	async info(ctx){
		let value = Math.floor(Math.random()*100);
		await ctx.edit(`Примерно - ${value}%`);
	},

	async typing(ctx, match){
		let { text, duration } = match.groups;
		duration = parseInt(duration);
		let entered = '';

		await ctx.edit(entered);

		text = text.split('');
		let sending = setInterval(async () => {
			if(text.length <= 0)
				return clearInterval(sending);

			entered += text.shift();
			await ctx.edit(entered);
		}, duration);
	},

	async hack(ctx){
		let percents = 0;

		await ctx.edit('Инициализирую процесс взлома Пентагона...');
		await ctx.edit('Взлом запущен');

		setInterval(async function(){
			if(percents > 100)
				return clearInterval(this);

			await ctx.edit('Пентагон взломан на ' + percents + '%');
			percents += Math.floor(Math.random()*15);
		}, 2000);

		await ctx.edit('Пентагон взломан.');
	}
}