import { handleMusicShiftInplace } from "../sparse2des/context";
import { JumperAttr, MusicProps, MusicSection, NoteCharAny, SectionSeparator, SectionSeparators, SeparatorAttr } from "../sparse2des/types";
import { Linked2MusicArticle } from "./ArticleSequenceReader";

export module SequenceSectionStat {

	export type AttrPosition = 'before' | 'after' | 'next' | 'nextPrev'

	/**
	 * 检索各声部同位置的小节线属性
	 */
	function mapPartsSeparators<T>(article: Linked2MusicArticle, index: number, mapper: (sep: SectionSeparators) => T) {
		return article.parts.map(part => {
			const section = part.notes.sections[index]
			if(!section || section.type == 'nullish') {
				return undefined
			}
			return mapper(section.separator)
		})
	}
	/**
	 * 获取位置处的小节线属性
	 */
	export function getAttr(sep: SectionSeparators, pos: AttrPosition) {
		if(pos == 'after') {
			return sep.after
		}
		if(pos == 'before') {
			return sep.before
		}
		if(pos == 'nextPrev') {
			return sep.nextPrev
		}
		return sep.next
	}

	/**
	 * 检查跳房子记号属性列是否与当前信息匹配
	 */
	export function jumperAttrMatch(attrs: (JumperAttr | SeparatorAttr)[], iteration: number) {
		let foundIters = false
		for(let attr of attrs) {
			if(attr.type == 'iter') {
				foundIters = true
				if(attr.iter == iteration) {
					return true
				}
			}
		}
		if(!foundIters) {
			return true
		}
		return false
	}
	/**
	 * 检查小节是否有 reset
	 */
	export function checkReset(article: Linked2MusicArticle, index: number, pos: AttrPosition) {
		return (
			mapPartsSeparators(article, index, sep => {
				return getAttr(sep, pos).attrs.filter(item => item.type == 'reset').length > 0
			}).filter(item => item == true).length > 0
		)
	}
	/**
	 * 获取某小节处非空的第一个声部小节
	 */
	export function getPrimoSection(article: Linked2MusicArticle, sectionIndex: number) {
		let primoSection = article.parts[0].notes.sections[sectionIndex] // 找到编号最小的非 nullish 小节
		let minIndex = Infinity
		for(let part of article.parts) {
			const section = part.notes.sections[sectionIndex]
			if(section.type == 'nullish') {
				break
			}
			let index = part.indexMap[sectionIndex]
			if(index < minIndex) {
				minIndex = index
				primoSection = section
			}
		}
		return primoSection
	}
	/**
	 * 根据音乐属性变更指令重建音乐属性
	 */
	export function recreateMusicalProps(props: MusicProps, attr: SeparatorAttr & {type : 'qpm' | 'shift'}): MusicProps {
		if(attr.type == 'qpm') {
			return {
				...props,
				qpm: attr.qpm
			}
		}
		if(attr.type == 'shift') {
			const newProps = {
				...props
			}
			handleMusicShiftInplace(newProps, attr)
			return props
		}
		return props
	}
	/**
	 * 判断小节线是否为小节线反复指令记号
	 */
	export function isSeparatorRepeatCommand(article: Linked2MusicArticle, index: number) {
		return mapPartsSeparators(article, index, sep => {
			if([':||', ':/||'].includes(sep.after.char)) {
				return true
			}
		}).filter(item => item == true).length > 0
	}
	/**
	 * 判断小节线是否为终止线
	 */
	export function isSeparatorFinal(article: Linked2MusicArticle, index: number) {
		return mapPartsSeparators(article, index, sep => {
			if(['|||'].includes(sep.after.char)) {
				return true
			}
		}).filter(item => item == true).length > 0
	}
	/**
	 * 判断小节线是否为小节线反复位置记号
	 */
	export function isSeparatorRepeatPos(article: Linked2MusicArticle, index: number) {
		return mapPartsSeparators(article, index, sep => {
			if(['||:'].includes(sep.before.char)) {
				return true
			}
		}).filter(item => item == true).length > 0
	}
	/**
	 * 获取小节处的所有属性
	 */
	export function getMergedAttrs(article: Linked2MusicArticle, index: number, pos: AttrPosition) {
		return mapPartsSeparators(article, index, sep => {
			const attr = getAttr(sep, pos)
			return attr.attrs
		}).filter(item => item !== undefined).reduce((a, b) => {
			return a!.concat(b!)
		}, [])!
	}
	/**
	 * 判断小节线是否为结构反复指令（D.C., D.S., @）
	 */
	export function isStructureRepeatCommand(article: Linked2MusicArticle, index: number) {
		const attrs = getMergedAttrs(article, index, 'after').concat(
			getMergedAttrs(article, index, 'next')
		).filter(item => item.type == 'repeat')
		if(attrs.length == 0) {
			return false
		}
		const attr = attrs[0]
		if(attr.type != 'repeat') {
			return false
		}
		if(attr.char == 'D.S.') {
			return 'D.S.'
		}
		if(attr.char == 'D.C.') {
			return 'D.C.'
		}
		if(attr.char == 'Fine.') {
			return 'Fine.'
		}
		if(attr.char == '@') {
			return '@'
		}
		return false
	}
	/**
	 * 判断小节线是否为结构反复目标
	 */
	export function isStructureRepeatPos(article: Linked2MusicArticle, index: number) {
		const attrs = getMergedAttrs(article, index, 'nextPrev').concat(
			getMergedAttrs(article, index, 'before')
		).filter(item => item.type == 'repeat')
		if(attrs.length == 0) {
			return false
		}
		const attr = attrs[0]
		if(attr.type != 'repeat') {
			return false
		}
		if(attr.char == '$') {
			return '$'
		}
		if(attr.char == '@') {
			return '@'
		}
		return false
	}
	/**
	 * 在前面寻找最近符合条件的小节序号
	 */
	export function findPrevSectionIndex(article: Linked2MusicArticle, index: number, filter: (cursor: number) => boolean) {
		for(let cursor = index; cursor >= 0; cursor--) {
			if(filter(cursor)) {
				return cursor
			}
		}
		return undefined
	}
	/**
	 * 在后面寻找最近符合条件的小节序号
	 */
	export function findNextSectionIndex(article: Linked2MusicArticle, index: number, filter: (cursor: number) => boolean) {
		for(let cursor = index; cursor < article.sectionCount; cursor++) {
			if(filter(cursor)) {
				return cursor
			}
		}
		return undefined
	}
}