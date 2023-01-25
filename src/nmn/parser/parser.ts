import { CookedLine, RawLine } from "./commands/priLine"
import { checkConcat } from "../util/array"
import { LineTree, LineTreeBuilder } from "./clns2lnt/LineTreeBuilder"
import { createIssue, Issue, Severity } from "./issue/issue"
import { tokenize, TokenizerOption } from "./tokenizer/tokenizer"
import { TokenFilter } from "./tokenizer/tokens"
import { SparseBuilder, SparseLine } from "./lnt2sparse/SparseBuilder"
import { Destructor } from "./sparse2des/Destructor"
import { DestructedScore } from "./sparse2des/types"
import { ColumnStater } from "./des2cols/ColumnStater"
import { Linifier } from "./linify/linify"

const tokenOption: TokenizerOption = {
	symbolChars: '`_$' + `~!@#%^&*()-=+[{]}\|;:",.<>/?`,
	symbolLigatures: ['[[', ']]'],
	stringQuote: '"',
	commentStart: ['//'],
	commentQuote: []
}

const tokenParens: [string, string][] = [['(', ')'], ['{', '}'], ['[', ']'], ['[[', ']]']]

export type LinedIssue = Issue & {
	/**
	 * 行号
	 */
	lineNumber: number
	/**
	 * 是否被渲染
	 */
	rendered: boolean
}

export function addIssue(issues: LinedIssue[], lineNumber: number, index: number, severity: Severity, key: string, defaultTranslation: string, ...args: string[]) {
	const issue = createIssue(index, severity, key, defaultTranslation, ...args)
	const linedIssue: LinedIssue = Object.assign({}, { lineNumber, rendered: false }, issue)
	issues.push(linedIssue)
}

export function addRenderedIssue(issues: LinedIssue[], lineNumber: number, index: number, severity: Severity, key: string, defaultTranslation: string, ...args: string[]) {
	const issue = createIssue(index, severity, key, defaultTranslation, ...args)
	const linedIssue: LinedIssue = Object.assign({}, { lineNumber, rendered: true }, issue)
	issues.push(linedIssue)
}

type CommandLineTree = LineTree<CookedLine & {type: 'command'}>

class ParserClass {
	constructor() {}

	/**
	 * 解析文本文档
	 */
	parse(doc: string) {
		const issues: LinedIssue[] = []
		const lns = this.txt2lns(doc, issues)
		const clns = this.lns2clns(lns, issues)
		const lnt = this.clns2lnt(clns, issues)
		const sparse = this.lnt2sparse(lnt, issues)
		const des = this.sparse2des(sparse, issues)
		const cols = this.des2cols(des, issues)
		return {
			phase: {
				lns,
				clns,
				lnt,
				sparse,
				cols
			},
			result: cols,
			issues
		}
	}

	/*
	解析顺序
	txt (Text)
	lns (RawTokenizedLines)
	clns (CookedTokenizedLines)
	lnt (LineTree)
	spr (Sparse, 这一步将每一行在 CommandDef 定义的框架下处理，并进行进一步验证。tokenized 括号匹配也在这里完成)
	des (Destructed, 这一步处理掉所有内容)
	cols (Columns, 分配渲染行，渲染内容整理成渲染列)
	*/

	/**
	 * 文本文档解析到行列表
	 */
	txt2lns(doc: string, issues: LinedIssue[]): RawLine[] {
		const ret: RawLine[] = []

		const lines = Linifier.linify(doc)

		for(let lineObj of lines) {
			const { text: line, lineNumber } = lineObj

			let tokenResult = tokenize(line, tokenOption)
			checkConcat(issues, tokenResult.issues.map((issue) => {
				return {
					...issue,
					lineNumber: lineNumber
				}
			}))
			let tokens = tokenResult.result
			
			let startIndex = tokens[0].range[0]
			let commentText = ''
			const eofToken = tokens.pop()
			let endIndex = eofToken!.range[0]
			let tailToken = tokens[tokens.length - 1]
			if(tailToken && tailToken.type == 'comment') {
				// 取出行末的注释文本
				commentText = tailToken.content
				tokens.pop()
				endIndex = tailToken.range[0]
			}
			tokens.push(eofToken!)

			ret.push({
				lineNumber,
				tokens,
				comment: commentText,
				text: line.substring(startIndex, endIndex).trim()
			})
		}
		
		return ret
	}

	/**
	 * 行列表解析到行类型列表
	 */
	lns2clns(lines: RawLine[], issues: LinedIssue[]): CookedLine[] {
		const result = lines.map((line): CookedLine | undefined => {
			const tokens = line.tokens

			// 空白行（仅包含 EOF）
			if(tokens.length == 1) {
				return undefined
			}
			// 分隔线
			for(let delChar of ['-', '=']) {
				if(new TokenFilter('symbol', delChar).test(tokens)) {
					const ret: CookedLine = {
						lineNumber: line.lineNumber,
						type: 'delimiter',
						char: delChar as any
					}
					return ret
				}
			}
			// 指令行 (be tolerant)
			if(new TokenFilter('word', null).test(tokens[0])) {
				// 找到冒号，即确定是指令行
				const colonIndex = new TokenFilter('symbol', ':').findInLayered(tokens, tokenParens)
				if(colonIndex != -1) {
					let ret: CookedLine = {
						lineNumber: line.lineNumber,
						type: 'command',
						head: tokens[0].content,
						props: null,
						content: tokens.slice(colonIndex + 1),
						text: line.text.substring(tokens[colonIndex].range[1]).trim(),
						propsText: null
					}
					// 若冒号不是紧随其后，则应当有属性参数
					if(colonIndex > 1) {
						const lprToken = tokens[1]
						const rprToken = tokens[colonIndex - 1]
						// 格式不正确的属性参数
						if(!new TokenFilter('symbol', '[').test(lprToken) || !new TokenFilter('symbol', ']').test(rprToken)) {
							addIssue(issues,
								line.lineNumber, tokens[1]!.range[0], 'error', 'bad_command_format',
								'Command line format does not look right. It should be something like "Head: content" or "Head[props]: content".'
							)
						} else {
							const fakeEOF = Object.assign({}, tokens[tokens.length - 1])
							fakeEOF.range = [tokens[colonIndex - 1].range[1], tokens[colonIndex - 1].range[1]]
							ret.props = tokens.slice(2, colonIndex - 1).concat([fakeEOF])
							ret.propsText = line.text.substring(tokens[2].range[0], tokens[colonIndex - 1].range[0]).trim()
						}
					}
					return ret
				}
			}
			// 不知道是啥
			addIssue(issues,
				line.lineNumber, tokens[0]!.range[0], 'warning', 'wtf_line',
				'Cannot determine what this line is. If it is a comment, prepend it with "//".'
			)
			return undefined
		}).filter((value) => value !== undefined)
		return result as CookedLine[]
	}

	/**
	 * 行类型列表解析到树
	 */
	clns2lnt(lines: CookedLine[], issues: LinedIssue[]): CommandLineTree {
		return new LineTreeBuilder(lines).parse(issues)
	}

	/**
	 * 行树内容初步解析
	 */
	lnt2sparse(lnt: CommandLineTree, issues: LinedIssue[]): LineTree<SparseLine> {
		return new SparseBuilder(lnt).parse(issues)
	}

	/**
	 * 结构解析
	 */
	sparse2des(sparse: LineTree<SparseLine>, issues: LinedIssue[]) {
		return new Destructor(sparse).parse(issues)
	}

	/**
	 * 列解构与分析
	 */
	des2cols(des: DestructedScore, issues: LinedIssue[]) {
		return new ColumnStater(des).parse(issues)
	}
}

export const Parser = new ParserClass()
