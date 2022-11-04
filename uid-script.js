let fs = require('fs').promises
let path = require('path')
​
let basePath = process.cwd()
​
let modules = ['content_types', 'global_fields', 'entries']
​
async function updateAllUids() {
	let content_types = await fs.readdir('./content_types')
	let globalfieldsData = await fs.readFile(`${basePath}/global_fields/globalfields.json`, 'utf8')
	let global_fields = JSON.parse(globalfieldsData)
	let globalfieldsCapitalsUid = []
	global_fields.forEach(e => {
		if (e.uid.match(/[A-Z]/)) {
			globalfieldsCapitalsUid.push(e.uid)
		}
	})
	let capitalUids = content_types.filter(e => e.match(/[A-Z]/)).map(uid => uid.split('.')[0])
	let allCapitalsUid = capitalUids.concat(globalfieldsCapitalsUid)
	console.log('allCapitalsUid:',allCapitalsUid)
	for (uid of allCapitalsUid) {
		for (module of modules) {
			if (module === 'entries') {
				let ctFolders = await fs.readdir(`${basePath}/${module}`)
				for (folder of ctFolders) {
					let entryFiles = await fs.readdir(`${basePath}/${module}/${folder}`)
					for (file of entryFiles) {
						let fileData = await fs.readFile(`${basePath}/${module}/${folder}/${file}`, 'utf8')
						fileData = fileData.replace(new RegExp(uid, 'g'), toSnakeCase(uid))
						await fs.writeFile(`${basePath}/${module}/${folder}/${file}`, fileData)
					}
					if (folder.match(/[A-Z]/)) {
						let newfolder=folder.toLowerCase()
						await fs.rename(`${basePath}/${module}/${folder}`, `${basePath}/${module}/${newfolder}`)
					}
				}
			} else {
				let files = await fs.readdir(`${basePath}/${module}`)
				for (file of files) {
					let fileData = await fs.readFile(`${basePath}/${module}/${file}`, 'utf8')
					fileData = fileData.replace(new RegExp(uid, 'g'), toSnakeCase(uid))
					await fs.writeFile(`${basePath}/${module}/${file}`, fileData)
				}
			}
		}
	}
	console.log('All uppercase UID converted to lowercase!!!')
}
​
// to snake case
function toSnakeCase(id) {
	let result = '';
	if (id.indexOf('_') > -1) {
		result += id.split('_').map(e => e.toLowerCase()).join('_')
	} else {
		result += id.toLowerCase()
	}
	return result
}
​
updateAllUids()