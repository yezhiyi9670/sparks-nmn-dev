import { getCommandDef, lineLevelNames } from "../parser/commands"
import { Issue } from "../parser/issue/issue"
import { getLanguageValue } from "../util/template"

export type LanguageArray = {
	levelNameKeys: {[_: string]: number[]}
	levelNames: {[_: string]: string}
	issues: {[_: string]: string}
	notices: {[_: string]: string}
	commands: {[_: string]: string}
	updown: {[_: string]: string}
	metrics: {[_: string]: string}
	render: {[_: string]: string}
}

class I18nClass {
	/**
	 * 获取命令头的描述
	 */
	commandDescription(context: LanguageArray, head: string) {
		let commandDef = getCommandDef(head)
		if(!commandDef) {
			return 'ERROR'
		}
		const levelNamesDesc = commandDef.levels.map((level) => {
			return context.levelNames[lineLevelNames[level]] ?? ''
		}).join('/')
		const star = (commandDef.unique !== undefined && commandDef.required !== undefined) ? '★' : ''
		const commandDesc = context.commands[commandDef.head] ?? ''
		return `${star}[${levelNamesDesc}] ${commandDesc}`
	}
	/**
	 * 获取问题说明
	 */
	issueDescription(context: LanguageArray, issue: Issue) {
		const issueText = context.issues[issue.key] ?? issue.defaultTranslation
		const indices = context.levelNameKeys[issue.key] ?? []
		const args = issue.args?.map((val, index) => {
			if(indices.indexOf(index) != -1) {
				return context.levelNames[val] ?? 'ERROR'
			}
			return val
		}) ?? []
		return getLanguageValue(issueText, ...args)
	}
	/**
	 * 获取渲染字段
	 */
	renderToken(context: LanguageArray, key: string, ...args: string[]) {
		return getLanguageValue(context.render[key] ?? key, ...args)
	}
}

export const I18n = new I18nClass()
