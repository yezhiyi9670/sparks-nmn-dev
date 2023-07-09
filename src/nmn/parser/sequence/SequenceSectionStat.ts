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
	export function jumperAttrMatch(attrs: JumperAttr[], iteration: number) {
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
	export function primoSection(article: Linked2MusicArticle, sectionIndex: number) {
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
}
