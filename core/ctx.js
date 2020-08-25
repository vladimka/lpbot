module.exports = function Ctx(vk, message, db, user){
	this.api = vk.api;
	this.message = message;
	this.db = db;
	this.user = user;
	this.settings = this.db.get("settings").value();

	this.edit = async text => {
		this.api.messages.edit({
			peer_id : this.message.peer_id,
			message_id : this.message.id,
			message : text,
			keep_forward_messages : 1
		})
			.catch(err => console.error(err));
	}

	this.delete = async (id, is_for_all) => {
		id = id || this.message.id;
		is_for_all = is_for_all || 1;

		await this.api.messages.delete({
			peer_id : this.message.peer_id,
			message_id : id,
			delete_for_all : is_for_all
		});
	}

	this.sendSuccess = async (text) => {
		await this.edit('✅ ' + text);
	}

	this.sendRp = async (userId, rpName) => {
		let rp = this.db.get('rp_commands').find({ name : rpName }).value();
		let user = await this.api.users.get({ user_ids : userId });
		user = user[0];
		let user1Name = `${this.user.first_name} ${this.user.last_name}`;
		let user2Name = `${user.first_name} ${user.last_name}`;

		await this.edit(`${rp.sticker}| @id${this.user.id} (${user1Name}) ${rp.action} @id${user.id} (${user2Name})`);
	}
}