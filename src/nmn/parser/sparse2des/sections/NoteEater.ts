import { inCheck, pushIfNonNull } from "../../../util/array";
import { Frac, Fraction } from "../../../util/frac";
import { splitBy, withinCharRange } from "../../../util/string";
import { addIssue, LinedIssue } from "../../parser";
import { BracketToken, BracketTokenList, TokenFilter, Tokens } from "../../tokenizer/tokens";
import { AttrMatcher } from "../AttrMatcher";
import { ScoreContext } from "../context";
import { attrInsertCharCheck, MusicDecoration, MusicNote, MusicSection, NoteAttr, NoteCharAny, noteCharChecker, NoteCharChord, noteCharForceWeight } from "../types";

type SampledSectionBase<TypeSampler> = {
	type: 'section'
	notes: MusicNote<(NoteCharAny & {type: TypeSampler})>[]
	decoration: MusicDecoration[]
	leftSplit: boolean
	leftSplitVoid: boolean
	rightSplit: boolean
}
type SampledNoteChar<TypeSampler> = NoteCharAny & {type: TypeSampler}

export class NoteEater {
	/**
	 * 输入
	 */
	input: BracketTokenList = []
	/**
	 * 上下文
	 */
	context: ScoreContext
	/**
	 * 行号
	 */
	lineNumber: number = 0
	/**
	 * 等级
	 */
	level: number = 0

	constructor(input: BracketTokenList, lineNumber: number, context: ScoreContext, level?: number) {
		if(level !== undefined) {
			this.level = level
		}
		this.input = input
		this.lineNumber = lineNumber
		this.context = context
	}

	/**
	 * 单词指针位置
	 */
	tokenPtr: number = 0
	/**
	 * 字符指针位置
	 */
	charPtr: number = 0

	/**
	 * 获取当前单词
	 */
	peek(): BracketToken | undefined {
		return this.input[this.tokenPtr]
	}
	/**
	 * 下一个单词
	 */
	pass(): BracketToken | undefined {
		return this.input[this.tokenPtr++]
	}
	/**
	 * 获取当前字符
	 */
	getchar(): string | undefined {
		const token = this.peek()
		if(token === undefined) {
			return undefined
		}
		if('bracket' in token) {
			return undefined
		}
		if(token.type == 'stringLiteral') {
			return undefined
		}
		return token.content[this.charPtr]
	}
	/**
	 * 下一个字符
	 */
	passchar(): string | undefined {
		const token = this.peek()
		if(token === undefined) {
			return undefined
		}
		if('bracket' in token) {
			return undefined
		}
		if(token.type == 'stringLiteral') {
			return undefined
		}
		const len = token.content.length
		const ret = token.content[this.charPtr++]
		if(this.charPtr >= len) {
			this.charPtr = 0
			this.tokenPtr += 1
		}
		return ret
	}
	/**
	 * 下一个完整单词
	 */
	align() {
		if(this.charPtr > 0) {
			this.pass()
		}
	}
	/**
	 * 移动到下一个字符区
	 */
	alignChars() {
		while(true) {
			const token1 = this.peek()
			if(token1 !== undefined && (('bracket' in token1) || token1.type == 'stringLiteral')) {
				this.pass()
			} else {
				break
			}
		}
	}

	/**
	 * 食用音符内容（小节内的音符）
	 * @param section 结果写入此小节
	 * @param ratio 减时线缩放比例
	 * @param startPos 起始位置
	 * @param issues 问题列表
	 * @return 写入的四分音符数量，以及最后一列的位置
	 */
	parse<TypeSampler>(section: SampledSectionBase<TypeSampler>, ratio: Fraction, startPos: Fraction, issues: LinedIssue[], typeSampler: TypeSampler): [Fraction, Fraction] {
		let position = Frac.create(0)
		let insertOrdinal = 0
		let lastColumn = Frac.copy(startPos)
		let tripletFirst = Frac.create(0)
		let tripletRatio = Frac.create(1)
		let tripletRemain = 0
		var extendingNote: (MusicNote<NoteCharAny & {type: TypeSampler}>) | undefined = undefined as any;
		(() => {
			let leftSplitFlag = true
			while(true) {
				let token = this.peek()
				// ===== 检测文末 =====
				if(token === undefined) {
					return
				}
				// ===== 检测连音线左分割符号 =====
				if(new TokenFilter('symbol', '*').test(token) && leftSplitFlag) {
					this.pass()
					section.leftSplit = true
					continue
				}
				if(new TokenFilter('symbol', '~').test(token) && leftSplitFlag) {
					this.pass()
					section.leftSplitVoid = true
					continue
				}
				leftSplitFlag = false
				// ===== 检测右分割符号 =====
				if(new TokenFilter('symbol', '!').test(token)) {
					this.pass()
					section.rightSplit = true
					continue
				}
				// ===== 检测插入符 =====
				if(!('bracket' in token) && token.type == 'symbol' && token.content == '&') {
					this.pass()
					let token2 = this.peek()
					if(token2 && !('bracket' in token2) && token2.type == 'word') {
						this.pass()
						let token3 = this.peek()
						if(token3 && !('bracket' in token3) && token3.type == 'symbol' && token3.content == ';') {
							this.pass()
						} else {
							addIssue(issues,
								this.lineNumber, token.range[0], 'error', 'incomplete_insert_sequence',
								'Symbol `&` should be followed with a word and a `;`, representing a insertational sequence.'
							)
						}
						// 缺失分号，一般来讲不是大问题
						if(inCheck(token2.content, attrInsertCharCheck)) {
							section.decoration.push({
								type: 'insert',
								target: Frac.add(startPos, Frac.mul(ratio, position)),
								ordinal: insertOrdinal++,
								char: {
									type: 'insert',
									char: token2.content
								}
							})
						} else {
							addIssue(issues,
								this.lineNumber, token2.range[0], 'error', 'unknown_insert_sequence',
								'Unknown insertational sequence ${0}',
								token2.content
							)
						}
						continue
					} else {
						addIssue(issues,
							this.lineNumber, token.range[0], 'error', 'incomplete_insert_sequence',
							'Symbol `&` should be followed with a word and a `;`, representing a insertational sequence.'
						)
						continue
					}
				}
				// ===== 检测延音线 =====
				// * 延音线是单独的 symbol，不存在字符读取一半的问题。
				if(!('bracket' in token) && token.type == 'symbol' && token.content == '-') {
					// 延长上一个音符
					if(extendingNote) {
						extendingNote.length = Frac.add(extendingNote.length, Frac.mul(ratio, Frac.create(1)))
					}
					// 推入延音线
					section.notes.push({
						type: 'extend',
						lineNumber: this.lineNumber,
						range: token.range,
						startPos: Frac.add(startPos, Frac.mul(ratio, position)),
						length: Frac.mul(ratio, Frac.create(1)),
						attrs: [],
						suffix: [],
						// 延音线在小节开头隐藏（此规则忽略 grayout），可用作弱起小节的 Spacer
						voided: !extendingNote
					})
					// 更新最后一列
					lastColumn = Frac.copy(
						Frac.add(startPos, Frac.mul(position, ratio))
					)
					position = Frac.add(position, Frac.create(1))
					this.pass()
					continue
				}
				// ===== 检测连音前置符 =====
				const reductionChar1 = this.getchar()
				if(reductionChar1 !== undefined) {
					if(reductionChar1 == 'T' || reductionChar1 == 'D') {
						this.passchar()
						tripletRatio = reductionChar1 == 'T' ? Frac.create(2, 3) : Frac.create(1)
						tripletRemain = reductionChar1 == 'T' ? 3 : 1
						tripletFirst = Frac.create(0, 0)
						continue
					}
				}
				// ===== 检测小括号 =====
				if(token === undefined) {
					return
				}
				let reduction = 2
				if(this.level == 0) {
					reduction = this.context.musical.beats!.defaultReduction
					if(tripletRemain > 0 /*&& Frac.compare(Frac.create(1), tripletRatio) == 0*/) {
						reduction = 2
					}
				}
				let reducedRatio = Frac.create(1, reduction)
				if(tripletRemain > 0) {
					reducedRatio = Frac.mul(reducedRatio, tripletRatio)
				}
				if('bracket' in token) {
					if(token.bracket == '(') {
						const [writtenLength, writtenLastCol] = new NoteEater(token.tokens[0] ?? [], this.lineNumber, this.context, this.level + 1).parse(
							section,
							Frac.mul(ratio, reducedRatio),
							Frac.add(startPos, Frac.mul(ratio, position)),
							issues,
							typeSampler
						)
						// 推入下划线
						if(writtenLength.x != 0) {
							section.decoration.push({
								type: 'range',
								startPos: Frac.add(startPos, Frac.mul(ratio, position)),
								endPos: writtenLastCol,
								level: this.level + 1,
								char: '_'
							})
							lastColumn = Frac.copy(writtenLastCol)
						}
						// 推入三连音
						if(tripletRemain > 0) {
							if(Frac.compare(Frac.create(1), tripletRatio) != 0) {
								if(Frac.compare(writtenLength, Frac.create(0)) > 0) {
									section.decoration.push({
										type: 'range',
										startPos: Frac.add(startPos, Frac.mul(ratio, position)),
										endPos: writtenLastCol,
										level: this.level,
										char: 'T'
									})
								}
							}
						}
						position = Frac.add(position,
							Frac.div(writtenLength, ratio)
						)
					} else {
						addIssue(issues,
							this.lineNumber, token.range[0], 'error', 'notes_unexpected_bracket',
							'Unexpected bracket pair ${0} found in section',
							token.bracket + token.rightBracket
						)
					}
					this.pass()
					if(tripletRemain > 0) {
						tripletRemain = 0
						tripletRatio = Frac.create(1)
					}
					continue
				}
				// ===== 读取音符及音符后缀 =====
				const range0 = this.peek() ? this.peek()!.range[0] + this.charPtr : 0
				const noteChar = this.eatNoteChar<TypeSampler>(issues, typeSampler)
				const suffixes: ('*' | '~' | '.')[] = []
				const attrs: NoteAttr[] = []
				let length = Frac.create(1)
				let lengthAdd = Frac.create(1)
				if(noteChar === undefined) {
					continue
				}
				if(this.charPtr == 0) while(true) {
					// 继续读取后缀字符
					const c = this.peek()
					if(c === undefined) {
						break
					}
					if(!('bracket' in c)) {
						if(c.type != 'symbol') {
							break
						}
						if(c.content == '~' || c.content == '*' || c.content == '.') {
							suffixes.push(c.content)
							this.pass()
							if(c.content == '.') {
								lengthAdd = Frac.div(lengthAdd, Frac.create(2))
								length = Frac.add(length, lengthAdd)
							}
						} else {
							break
						}
					} else {
						if(c.bracket == '[') {
							this.pass()
							this.eatNoteAttr(attrs, c.tokens, issues)
						} else {
							break
						}
					}
				}
				lastColumn = Frac.copy(
					Frac.add(startPos, Frac.mul(position, ratio))
				)
				const noteStartPos = Frac.add(startPos, Frac.mul(ratio, position))
				extendingNote = {
					type: 'note',
					lineNumber: this.lineNumber,
					range: [range0, Tokens.rangeSafe(this.input, this.tokenPtr, 0)],
					startPos: noteStartPos,
					length: Frac.mul(ratio, Frac.mul(length, tripletRatio)),
					attrs: attrs,
					suffix: suffixes,
					voided: false,
					char: noteChar
				}
				position = Frac.add(position, Frac.mul(length, tripletRatio))
				section.notes.push(extendingNote)
				// ===== 三连音计数 =====
				if(tripletRemain > 0) {
					tripletRemain -= 1
					if(Frac.isIndeterminate(tripletFirst)) {
						tripletFirst = Frac.copy(noteStartPos)
					}
					if(tripletRemain == 0) {
						if(Frac.compare(tripletRatio, Frac.create(1)) != 0) {
							section.decoration.push({
							type: 'range',
								startPos: tripletFirst,
								endPos: noteStartPos,
								level: this.level,
								char: 'T'
							})
						}
						tripletRatio = Frac.create(1)
					}
				}
			}
		})()
		return [Frac.mul(ratio, position), lastColumn]
	}

	/**
	 * 匹配音符属性
	 */
	eatNoteAttr(attrs: NoteAttr[], attrTokens: BracketTokenList[], issues: LinedIssue[]) {
		attrTokens.forEach((tokens) => {
			let success = false
			success ||= pushIfNonNull(attrs,
				AttrMatcher.matchDecor(tokens, this.lineNumber, issues)
			)
			success ||= pushIfNonNull(attrs,
				AttrMatcher.matchNotes(tokens, this.lineNumber, issues)
			)
			success ||= pushIfNonNull(attrs,
				AttrMatcher.matchSlide(tokens, this.lineNumber, issues)
			)
			success ||= pushIfNonNull(attrs,
				AttrMatcher.matchDelta(tokens, this.lineNumber, issues)
			)
			if(!success) {
				addIssue(issues,
					this.lineNumber, tokens[0] ? tokens[0].range[0] : 0,
					'error', 'unknown_note_attr',
					'Cannot interpret `${0}` as a note attribute',
					Tokens.stringify(tokens)
				)
			}
		})
	}

	/**
	 * 食用音符字符
	 *
	 * @return Object 读取的音符字符对象, 或 undefined 未读取到有效内容（仍然会移动指针以便继续向后读取）
	 */
	eatNoteChar<TypeSampler>(issues: LinedIssue[], typeSampler: TypeSampler): NoteCharAny & {type: TypeSampler} | undefined {
		if(typeSampler == 'music') {
			// 读字符
			this.alignChars()
			// 读取升降记号前缀（#^$%b）
			let delta = NaN
			while(true) {
				const c = this.getchar()
				if(c === undefined) {
					return undefined
				}
				if(c == '#' || c == 'b' || c == '^' || c == '%' || c == '$') {
					if(delta != delta) {
						delta = 0
					}
					delta += {
						'#': 1,
						'b': -1,
						'^': 0.5,
						'%': -0.5,
						'$': 0
					}[c]
					this.passchar()
				} else {
					break
				}
			}
			// 读取音符字符（0123456789RSTXYZ）
			const c = this.getchar()
			if(c === undefined) {
				return undefined
			}
			let char = ''
			if(inCheck(c, noteCharChecker)) {
				char = c
				this.passchar()
			} else {
				addIssue(issues,
					this.lineNumber, this.peek()!.range[0], 'error', 'note_char_music_unknown',
					'Character ${0} cannot be a musical note',
					c
				)
				this.passchar()
				return undefined
			}
			// 读取 octave 后缀
			let octave = 0
			while(true) {
				const c = this.getchar()
				if(c == 'd' || c == 'e') {
					octave += (c == 'e' ? 1 : -1)
					this.passchar()
				} else {
					return {
						type: typeSampler as any,
						char: char,
						octave: octave,
						delta: delta,
					}
				}
			}

		} else {
			if(this.getchar() == '0') {
				this.passchar()
				return {
					type: typeSampler as any,
					void: true
				}
			}
			// 贴靠到 token 处
			this.align()
			const token1 = this.pass()
			if(token1 === undefined || 'bracket' in token1) {
				return undefined
			}
			if(typeSampler == 'text') {
				// 读取一个 stringLiteral
				if(token1.type != 'stringLiteral') {
					addIssue(issues,
						this.lineNumber, token1.range[0], 'error', 'note_char_text',
						'Text note should be a string literal'
					)
					return undefined
				}
				return {
					type: typeSampler as any,
					text: token1.content
				}
			} else if(typeSampler == 'force') {
				if(token1.type == 'word') {
					if(inCheck(token1.content, noteCharForceWeight)) {
						return {
							type: typeSampler as any,
							isText: false,
							char: token1.content
						}
					} else {
						addIssue(issues,
							this.lineNumber, token1.range[0], 'error', 'note_char_force_unknown1',
							'Cannot interpret word ${0} as force annotation',
							token1.content
						)
					}
				} else if(token1.type == 'symbol') {
					if(inCheck(token1.content, {'<': 1, '>': -1})) {
						return {
							type: typeSampler as any,
							isText: false,
							char: token1.content
						}
					} else {
						addIssue(issues,
							this.lineNumber, token1.range[0], 'error', 'note_char_force_unknown2',
							'Cannot interpret symbol ${0} as force annotation',
							token1.content
						)
					}
				} else if(token1.type == 'stringLiteral') {
					return {
						type: typeSampler as any,
						isText: true,
						char: token1.content
					}
				} {
					addIssue(issues,
						this.lineNumber, token1.range[0], 'error', 'note_char_force',
						'Force note should be a symbol, word, or string literal'
					)
				}
			} else if(typeSampler == 'chord') {
				// 读取一个 stringLiteral
				if(token1.type != 'stringLiteral') {
					addIssue(issues,
						this.lineNumber, token1.range[0], 'error', 'note_char_chord',
						'Chord note should be a string literal'
					)
					return undefined
				}
				const [ pref, base ] = splitBy(token1.content, '/')
				let prefSplitPos = 1
				let accidentalDeltas: {[_: string]: number} = {'#': 1, 'b': -1, '$': 0, '^': 0.5, '%': -0.5}
				while(prefSplitPos < pref.length && (
					inCheck(pref[prefSplitPos - 1], accidentalDeltas) ||
					withinCharRange(pref[prefSplitPos], 'A', 'Z')
				)) {
					prefSplitPos += 1
				}
				let prefRoot = pref.substring(0, prefSplitPos)
				let prefSuffix = pref.substring(prefSplitPos)
				let delta = 0
				while(inCheck(prefRoot[0], accidentalDeltas)) {
					delta += accidentalDeltas[prefRoot[0]]
					prefRoot = prefRoot.substring(1)
				}
				const ret: NoteCharChord = {
					type: typeSampler as any,
					delta: delta,
					root: prefRoot,
					suffix: prefSuffix,
					base: base == '' ? undefined : base
				}
				return ret as any
			}
		}
	}
}
