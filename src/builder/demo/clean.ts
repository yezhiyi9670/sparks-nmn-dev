import fs from 'fs'

try {
	fs.rmSync('./dist/demo/', { recursive: true, force: true })
	console.log('Removed former demo build')
} catch(_err) {
	console.log('Cannot remove former demo build')
}


export {}
