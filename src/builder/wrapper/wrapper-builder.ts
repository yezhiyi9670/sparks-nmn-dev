import fs from 'fs'
import Base64 from 'js-base64'

const paths = {
	source: './src/',
	built: './dist/wrapper/resources/',
	dist: './dist/wrapper/'
}

let templateText = fs.readFileSync(paths.source + 'builder/wrapper/template.html').toString()

const getFontStyles = () => {
	const fonts = [
		// { name: 'SimSun', url: './nmn/font/simsun/simsun.ttf', type: 'application/ttf' },
		// { name: 'SimHei', url: './nmn/font/simhei/simhei.ttf', type: 'application/ttf' },
		// { name: 'Deng', url: './nmn/font/deng/deng.ttf', type: 'application/ttf' },
		{ name: 'SparksNMN-EOPNumber', url: './nmn/font/eop_number/eop_number.ttf', type: 'application/ttf' },
		{ name: 'SparksNMN-mscore-20', url: './nmn/font/mscore-20/mscore-20.ttf', type: 'application/ttf' },
		{ name: 'SparksNMN-Bravura', url: './nmn/font/bravura/bravura.otf', type: 'application/otf' }
	]

	return fonts.map((font) => {
		const fontFilePath = paths.source + font.url
		const fontContent = fs.readFileSync(fontFilePath).toString()
		return `@font-face{font-family: '${font.name}'; src: url(data:${font.type};base64,${Base64.encode(fontContent)})}\n`
	}).join('')
}
templateText = templateText.replace(/\/\*\{(\w+):(\w+):(.*?)\}\*\//g, (text: string, contentType: string, protocol: string, location: string) => {
	if(protocol == 'content') {
		return text
	}
	if(protocol == 'built') {
		return fs.readFileSync(paths.built + location).toString()
	}
	if(protocol == 'source') {
		return fs.readFileSync(paths.source + location).toString()
	}
	if(protocol == 'dynamic') {
		if(location == 'fonts.css') {
			return getFontStyles()
		}
	}
	return text
})

fs.writeFileSync(paths.dist + 'template.html', templateText)

export {}
