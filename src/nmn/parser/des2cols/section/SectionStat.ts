import { Frac, Fraction } from "../../../util/frac";
import { ScoreContext, scoreContextDefault } from "../../sparse2des/context";
import { DestructedFCA, MusicDecorationRange, MusicNote, MusicSection, NoteCharAny } from "../../sparse2des/types";
import { Jumper, LinedPart } from "../types";

export module SectionStat {
	export const nullish: MusicSection<never> = {
		range: [-1, -1],
		ordinal: 0,
		startPos: Frac.create(0),
		separator: {
			before: {char: '/', attrs: []},
			after: {char: '/', attrs: []},
			next: {char: '/', attrs: []}
		},
		musicalProps: scoreContextDefault.musical,
		type: 'nullish'
	}
	/**
	 * 小节列填充（作用同 paintArray 函数）
	 */
	export function paint<CharType>(sections: MusicSection<CharType>[], data: MusicSection<CharType>[] | undefined, offset: number, padLength: number) {
		if(data === undefined) {
			data = []
		}
		if(padLength == -1) {
			padLength = data.length
		}
		while(sections.length < offset) {
			sections.push(nullish)
		}
		for(let i = 0; i < padLength; i++) {
			sections[offset + i] = (i < data.length) ? data[i] : nullish
		}
	}
	/**
	 * 小节代表的实际小节数
	 * 
	 * 规则：omit(x) 代表 x 个小节，其余均为 1 小节
	 */
	export function ordinalCount(section: MusicSection<unknown>) {
		if(section.type == 'omit') {
			if(section.count != section.count) {
				return 1
			}
			return section.count
		}
		return 1
	}
	/**
	 * 小节的四分音符数量
	 * 
	 * - space, omit, nullish 按照音乐属性的一小节（即 4 * K_s），omit(x) 按照 x 个小节。
	 * - 正常音乐小节按照字面计算，若 next 小节线不含有 `/`，和音乐属性要求取 max。
	 */
	export function quarterCount(section: MusicSection<unknown>): Fraction {
		let shouldBe = Frac.mul(Frac.create(4), section.musicalProps.beats!.value)
		if(Frac.equals(shouldBe, Frac.create(0))) {
			shouldBe = Frac.create(1)
		}
		if(section.type == 'omit') {
			if(section.count != section.count) {
				return shouldBe
			}
			return Frac.mul(shouldBe, Frac.create(section.count))
		}
		if(section.type != 'section') {
			return shouldBe
		}
		if(section.separator.next.char.indexOf('/') != -1) {
			return section.totalQuarters
		}
		if(!Frac.equals(section.musicalProps.beats!.value, Frac.create(0))) {
			if(!Frac.equals(section.totalQuarters, shouldBe)) {
				let ch = Frac.compare(section.totalQuarters, shouldBe)
				if(ch > 0) {
					section.validation = 'more'
				} else {
					section.validation = 'less'
				}
			}
		} else {
			// 散板节拍型仅判断拍数是否为整数
			const beats = Frac.prod(Frac.create(section.musicalProps.beats!.value.y), Frac.create(1, 4), section.totalQuarters)
			if(beats.y != 1) {
				section.validation = 'less'
			}
		}
		return Frac.max(section.totalQuarters, shouldBe)
	}
	/**
	 * 连接小节内部和小节之间的连音线
	 */
	export function interLink<CharType>(sections: MusicSection<CharType>[], decorations: MusicDecorationRange[]) {
		// ===== 处理联合连音线 =====
		let pendingNote: MusicNote<CharType> | undefined = undefined as any
		let lastPlace = Frac.create(0)
		let lastSection: MusicSection<CharType> | undefined = undefined as any
		let noteList: {
			note: MusicNote<CharType>
			isLast: boolean
		}[] = []
		sections.forEach((section) => {
			if(section.type != 'section') {
				pendingNote = undefined
				return
			}
			if(section.leftSplit) {
				// 创建左分割的连音线
				lastPlace = Frac.create(0, 0)
				pendingNote = true as any
				lastSection = undefined
			}
			let isFirst = true
			section.notes.forEach((note) => {
				if(!isFirst && noteList.length > 0) {
					noteList[noteList.length - 1].isLast = false
				}
				isFirst = false
				if(note.suffix.indexOf('*') != -1) {
					if(undefined === pendingNote) {
						pendingNote = note
						lastSection = section
						noteList = []
						lastPlace = Frac.add(section.startPos, note.startPos)
					} else {
						pendingNote = undefined
						const currPlace = Frac.add(section.startPos, note.startPos)
						let levitated = 0
						for(let prevNote of noteList) {
							// 内部包含延长连音线，联合连音线等级需要提升
							if(prevNote.note.suffix.indexOf('~') != -1) {
								levitated = prevNote.isLast ? 2 : 1
							}
						}
						noteList = []
						decorations.push({
							type: 'range',
							// 跨越小节线的联合连音线等级为 1，否则为 0
							level: Math.max(levitated, section == lastSection ? 0 : 1),
							startPos: lastPlace,
							endPos: currPlace,
							char: '*'
						})
					}
				}
				noteList.push({
					note: note,
					isLast: true
				})
			})
		})
		// ===== 处理延长连音线 =====
		lastSection = undefined
		pendingNote = undefined
		let connectState = false
		sections.forEach((section) => {
			if(section.type != 'section') {
				pendingNote = undefined
				return
			}
			if(section.leftSplitVoid) {
				// 创建左分割的连音线
				connectState = true
				lastSection = undefined
				pendingNote = undefined
				lastPlace = Frac.create(0, 0)
			}
			section.notes.forEach((note) => {
				if(note.type == 'extend') {
					return
				}
				if(connectState) {
					note.voided = true
					if(pendingNote) {
						pendingNote!.length = Frac.add(pendingNote!.length, note.length)
					}
					const currPlace = Frac.add(section.startPos, note.startPos)
					decorations.push({
						type: 'range',
						level: section == lastSection ? 0 : 1,
						startPos: lastPlace,
						endPos: currPlace,
						char: '~'
					})
					lastSection = section
					lastPlace = currPlace
					if(note.suffix.indexOf('~') == -1) {
						connectState = false
					}
				} else {
					if(note.suffix.indexOf('~') != -1) {
						connectState = true
						pendingNote = note
						const currPlace = Frac.add(section.startPos, note.startPos)
						lastSection = section
						lastPlace = currPlace
					}
				}
			})
		})
	}
	/**
	 * 统计小节是否全部为 nullish，若是，说明此渲染行可以不包含这个声部（或者歌词行）
	 */
	export function allNullish(sections: {type: string}[], startSection: number, sectionCount: number) {
		for(let i = startSection; i < startSection + sectionCount; i++) {
			if(sections[i].type != 'nullish') {
				return false
			}
		}
		return true
	}
	/**
	 * 统计小节是否全部无音符，若是，说明标记或歌词行的渲染空间可以被省略
	 */
	export function allEmpty(sections: MusicSection<NoteCharAny>[], startSection: number, sectionCount: number) {
		for(let i = startSection; i < startSection + sectionCount; i++) {
			const section = sections[i]
			if(section.type == 'section') {
				for(let note of section.notes) {
					if(note.type == 'note' && !note.voided) {
						return false
					}
				}
			}
		}
		return true
	}
	/**
	 * 含小节行切取
	 */
	export function subLine<T extends {sections: MusicSection<unknown>[]}>(line: T, startSection: number, sectionCount: number): T {
		return Object.assign({}, line, {
			sections: line.sections.slice(startSection, startSection + sectionCount)
		})
	}
	/**
	 * 索引排序
	 */
	export function indexSort<T extends {index: number[]}>(arr: T[]) {
		arr.sort((a, b) => {
			let indexLen = Math.max(a.index.length, b.index.length)
			for(let i = 0; i < indexLen; i++) {
				const ia = a.index[i], ib = b.index[i]
				if(ia === undefined || ia == -1) {
					return -1
				}
				if(ib === undefined || ib == -1) {
					return 1
				}
				if(ia < ib) {
					return -1
				}
				if(ia > ib) {
					return 1
				}
			}
			return 0
		})
	}

	/**
	 * 小节区间是否有重叠
	 */
	export function sectionRangeOverlaps(p1: [number, number], p2: [number, number]) {
		const [ l1, r1 ] = [ p1[0], p1[0] + p1[1] ]
		const [ l2, r2 ] = [ p2[0], p2[0] + p2[1] ]
		return Math.min(r1, r2) - Math.max(l1, l2) > 0
	}

	/**
	 * 音符区间是否有重叠
	 */
	export function fieldOverlaps(windowRange: [Fraction, Fraction], symbolRange: [Fraction, Fraction]) {
		let [ l1, r1 ] = [ windowRange[0], Frac.add(windowRange[0], windowRange[1]) ]
		let [ l2, r2 ] = [ symbolRange[0], symbolRange[1] ]
		if(Frac.isIndeterminate(l2)) {
			l2 = r2
		}
		if(Frac.equals(r2, l1)) {
			return true
		}
		if(Frac.equals(l2, r2)) {
			return Frac.compare(l1, l2) <= 0 &&
				Frac.compare(l2, r1) < 0
		}
		return Frac.compare(Frac.sub(Frac.min(r1, r2), Frac.max(l1, l2)), Frac.create(0)) > 0
	}
	
	/**
	 * 连接跳房子符号（这一操作对原始数据有破坏）
	 */
	export function connectJumpers(jumpers: Jumper[]): Jumper[] {
		const ret: Jumper[] = []

		jumpers.sort((x, y) => {
			return x.startSection - y.startSection
		})

		let lastSig = ''
		let lastPushed: Jumper | undefined = undefined as any
		jumpers.forEach((jumper) => {
			const currSig = JSON.stringify(jumper.attrs)
			if(lastPushed && currSig == lastSig && lastPushed.endSection == jumper.startSection) {
				lastPushed.endSection = jumper.endSection
			} else {
				ret.push(lastPushed = jumper)
			}
			lastSig = currSig
		})

		return ret
	}

	/**
	 * 定位位置所在的小节
	 * 
	 * 返回小节的索引，如果在系统之外，返回 -1
	 */
	export function locateSection<T>(pos: Fraction, sections: MusicSection<T>[]) {
		for(let i = 0; i < sections.length; i++) {
			const section = sections[i]
			if(section.type != 'section') {
				continue
			}
			const startPos = sections[i].startPos
			const endPos = Frac.add(sections[i].startPos, section.totalQuarters)
			if(Frac.compare(startPos, pos) <= 0 && Frac.compare(pos, endPos) < 0) {
				return i
			}
		}
		return -1
	}
	/**
	 * 找出位置对应的音符
	 */
	export function locateNote<T>(pos: Fraction, sections: MusicSection<T>[]): MusicNote<T> | undefined {
		const secIndex = locateSection(pos, sections)
		if(secIndex == -1) {
			return undefined
		}
		const section = sections[secIndex]
		if(section.type != 'section') {
			return undefined
		}
		for(let note of section.notes) {
			if(Frac.equals(Frac.add(section.startPos, note.startPos), pos)) {
				return note
			}
		}
		return undefined
	}

	/**
	 * 小节是否包含前置/后置小节线属性
	 */
	export function hasSeparatorAttrs(section: MusicSection<unknown>) {
		return section.separator.before.attrs.length || section.separator.after.attrs.length
	}

	/**
	 * 获取 FCA 中的第一标记行的小节
	 */
	export function fcaPrimary(section: DestructedFCA) {
		if(section.chord) {
			return section.chord.sections
		}
		if(section.force) {
			return section.force.sections
		}
		if(section.annotations.length > 0) {
			return section.annotations[0].sections
		}
		return undefined
	}
}
