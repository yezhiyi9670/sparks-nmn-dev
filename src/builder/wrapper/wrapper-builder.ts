import fs from 'fs'
import Base64 from 'js-base64'

const paths = {
	source: './src/',
	built: './dist/wrapper/resources/',
	dist: './dist/wrapper/'
}

let templateText = fs.readFileSync(paths.source + 'builder/wrapper/template.html').toString()

const getFontStyles = () => {
	return `
		@font-face{font-family:'Deng';src:local('等线')}
		@font-face{font-family:'SimSun';src:local('SimSun')}
		@font-face{font-family:'SimHei';src:local('SimHei')}
	`
}
const getFontScript = () => {
	const fonts = [
		{ name: 'SparksNMN-EOPNumber', url: './nmn/font/eop_number/eop_number.ttf', type: 'application/x-font-ttf', weight: 'normal' },
		{ name: 'SparksNMN-mscore-20', url: './nmn/font/mscore-20/mscore-20.ttf', type: 'application/x-font-ttf', weight: 'normal' },
		{ name: 'SparksNMN-Bravura', url: './nmn/font/bravura/bravura.woff', type: 'application/x-font-woff', weight: 'normal' }
	]
	return `FontLoader.loadFonts(${JSON.stringify(fonts.map((fontDef) => {
		const { url, ...other } = fontDef
		const fontFilePath = paths.source + url
		const fontContent = fs.readFileSync(fontFilePath)
		let b64url = `data:${fontDef.type};base64,${Base64.fromUint8Array(fontContent)}`
		return { url: b64url, ...other }
	}))},renderDocument)`
}
const replaceFields = (src: string, replacer: (text: string, contentType: string, protocol: string, location: string) => string): string => {
	return src.replace(/\/\*\{(\w+):(\w+):(.*?)\}\*\//g, replacer)
}

templateText = replaceFields(templateText, (text, contentType, protocol, location) => {
	if(protocol == 'built') {
		return fs.readFileSync(paths.built + location).toString()
	}
	if(protocol == 'source') {
		return fs.readFileSync(paths.source + location).toString()
	}
	if(protocol == 'dynamic') {
		if(location == 'fonts.css') {
			return getFontStyles()
		} else if(location == 'fonts-loader.js') {
			return getFontScript()
		}
	}
	return text
})

fs.writeFileSync(paths.dist + 'template.html', templateText)

templateText = replaceFields(templateText, (text, contentType, protocol, location) => {
	if(protocol == 'content') {
		if(location == 'data') {
			return fs.readFileSync(paths.source + 'builder/wrapper/test.txt').toString()
		}
	}
	return text
})

fs.writeFileSync(paths.dist + 'test.html', templateText)

export {}
