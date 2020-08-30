module.exports = {
	async info(ctx){
		let value = Math.floor(Math.random()*100);
		await ctx.edit(`Примерно - ${value}%`);
	}
}