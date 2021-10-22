
//constants
const blankDB = {
	user: {},
	server: {}
}

const noToYear ={
	1:'freshman',
	2:'sophmore',
	3:'junior',
	4:'senior'
}

let checker = (arr,target) => target.every(v=>arr.includes(v))

const allowedUsers = ['596098777941540883']

//functions
function has(value,array) {
	let hasValue = false
	array.forEach(element => {
		if (element == value){
			hasValue = true
		}
	})
	return hasValue
}

async function authorized(interaction) {
	if (await interaction.member.permissions.has('MANAGE_GUILD')) {return true}
	if (has(interaction.member.id,allowedUsers)) {return true}
	return false
}

module.exports ={
	has: has,
	blank: blankDB,
	noToYear: noToYear,
	allowedUsers:allowedUsers,
	authorized:authorized,
	checker: checker,

}