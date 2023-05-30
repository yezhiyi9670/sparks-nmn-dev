import fs from 'fs'
import Base64 from 'js-base64'

const paths = {
	source: './src/',
	built: './dist/wrapper/resources/',
	dist: './dist/wrapper/'
}

let templateText = fs.readFileSync(paths.source + 'builder/wrapper/template.html').toString()

const getFontStyles = () => {
	return ``
}
const getFontScript = () => {
	const fonts = [
		{ family: 'CommonLight', name: 'noto_sans_sc_light', format: 'woff2', asc: 85, desc: 6 },
		{ family: 'CommonLight', name: 'noto_sans_sc_light', format: 'woff2', weight: 'bold', asc: 85, desc: 6 },
		{ family: 'CommonSerif', name: 'uming_cn_dotfix', format: 'woff2', asc: 85, desc: 6 },
		{ family: 'CommonSerif', name: 'uming_cn_dotfix', format: 'woff2', weight: 'bold', asc: 85, desc: 6 },
		{ family: 'CommonBlack', name: 'wqy_microhei', format: 'woff2' },
		{ family: 'SparksNMN-EOPNumber', name: 'eop_number', format: 'ttf' },
		{ family: 'SparksNMN-mscore-20', name: 'mscore-20', format: 'ttf' },
		{ family: 'SparksNMN-Bravura', name: 'bravura', format: 'woff' },
	]
	return `window.fontLoadData = ${JSON.stringify(fonts.map(font => ({
		name: font.family,
		url: `${font.name}/${font.name}${font.weight ? ('-transformed-' + font.weight) : ''}.${font.format}`,
		weight: font.weight ?? 'normal',
		asc: font.asc,
		desc: font.desc,
	})))}`
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
		} else if(location == 'flags') {
			return 'window.localFontLocation = undefined'
		}
	}
	return text
})

fs.writeFileSync(paths.dist + 'test.html', templateText)

export {}
