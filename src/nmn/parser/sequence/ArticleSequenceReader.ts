import { Jumper, Linked2Article } from "../des2cols/types";
import { LinedIssue, addIssue } from "../parser";
import { ScoreContext } from "../sparse2des/context";
import { JumperAttr, MusicProps, MusicSection, NoteCharAny, SeparatorAttr } from "../sparse2des/types";
import { SequenceSectionStat } from "./SequenceSectionStat";
import { SequenceArticle, SequenceIteration } from "./types";

export type Linked2MusicArticle = Linked2Article & {type: 'music'}

export class ArticleSequenceReader {
	article: Linked2MusicArticle
	context: ScoreContext
	issues: LinedIssue[]

	constructor(article: Linked2MusicArticle, context: ScoreContext, issues: LinedIssue[]) {
		this.article = article
		this.context = context
		this.issues = issues
	}

	/**
	 * 迭代节数量限制
	 */
	iterationLimit: number = 65535

	/**
	 * 小节数指针位置
	 */
	sectionCursor: number = 0
	/**
	 * 当前每个声部的属性信息
	 * 
	 * 某声部出现 nullish 时，若其他声部有信息变更，则以排在最前的声部为准。
	 */
	currentProps: {[partHash: string]: MusicProps} = {}
	/**
	 * 反复指令记号的耐久度信息
	 */
	repeatDamage: number[] = []
	/**
	 * 经过此小节时出现过的迭代数
	 */
	passingIterations: {
		[iteration: number]: 'passed' | 'warned'
	}[] = []
	/**
	 * 跳房子记号统计
	 */
	jumperHeadStat: (Jumper | undefined)[] = []
	/**
	 * 跳房子八度变化统计
	 */
	jumperSectionStat: JumperAttr[][] = []

	/**
	 * 迭代节前沿
	 */
	frontier: SequenceIteration | undefined = undefined

	iterations: SequenceIteration[] = []
	overflow: boolean = false
	conflict: boolean = false

	parse(): SequenceArticle {
		if(this.article.sectionCount == 0) {
			return {
				overflow: false,
				conflict: false,
				iterations: []
			}
		}

		this.initialize()

		while(!this.exploreSection()) {}

		/* TODO[yezhiyi9670]: 检查拍号与 Quarters 的匹配情况并报错 */

		return {
			overflow: this.overflow,
			conflict: this.conflict,
			iterations: this.iterations
		}
	}

	/**
	 * 初始化
	 */
	initialize() {
		this.sectionCursor = 0
		this.repeatDamage = Array(this.article.sectionCount).fill(0)
		this.jumperHeadStat = Array(this.article.sectionCount).fill(undefined)
		this.jumperSectionStat = Array(this.article.sectionCount).fill(0).map(() => [])
		this.passingIterations = Array(this.article.sectionCount).fill(0).map(() => ({}))

		for(let partSig of this.article.partSignatures) {
			this.currentProps[partSig.hash] = {
				...this.context.musical
			}
		}

		if(!this.expandFrontier(1)) {
			throw new Error('ArticleSequenceReader: Failed to create the first iteration. How?')
		}
	}
	/**
	 * 初始化统计跳房子信息
	 */
	statJumpers() {
		for(let jumper of this.article.jumpers) {
			this.jumperHeadStat[jumper.startSection] = jumper
			for(let index = jumper.startSection; index < jumper.endSection; index++) {
				this.jumperSectionStat[index] = jumper.attrs
			}
		}
	}

	/**
	 * 创建新的迭代节
	 * 
	 * 返回值：是否成功
	 */
	expandFrontier(iteration: number) {
		if(this.iterations.length >= this.iterationLimit) {
			const primoSection = SequenceSectionStat.primoSection(this.article, this.sectionCursor)
			addIssue(
				this.issues, primoSection.idCard.lineNumber, 0,
				'error', 'repeat_overflow',
				'Total number of repeat iterations exceeded the limit ${0}. This may be caused by dead loops.',
				'' + this.iterationLimit
			)
			return false
		}
		this.iterations.push(this.frontier = {
			number: iteration,
			sections: []
		})
		return true
	}

	/**
	 * 探索当前小节，并自动更新对应值。如果有必要，将添加新的前沿迭代节
	 * 
	 * 返回值表示该小节是否是最后小节，终止条件如下：
	 * - 指针超出乐谱末尾
	 * - 发现不加注 Fine. 的终止线，直接结束
	 * - 发现加注 Fine. 的小节线，如果之后存在被用过的反复指令记号或结构反复标记，则结束
	 * - 为下一小节创建新的前沿时失败（超出最大限制）
	 */
	exploreSection(): boolean {
		if(this.sectionCursor < 0 || this.sectionCursor >= this.article.sectionCount) {
			throw new Error('ArticleSequenceReader/exploreSection: Section cursor is out of range.')
		}

		// 跳房子
		if(this.checkJumperHead()) {
			if(this.sectionCursor >= this.article.sectionCount) {
				return true
			} else {
				return false
			}
		}

		// 之前的事情：检查 reset、检查音乐属性变更
		this.checkReset('before')
		this.checkMusicalVariation('nextPrev')
		this.checkMusicalVariation('before')
		// 检测冲突、检查跳房子八度变更、小节推入信息
		this.checkConflict()
		this.pushCurrentSection()
		// 之后的事情：检查音乐属性变更、检查 reset、检查反复记号并跳转、若未跳转检查结束
		this.checkMusicalVariation('after')
		this.checkReset('after')

		return true
	}
	/**
	 * 检测跳房子的开头，如果不符合进入条件则跳过
	 * 
	 * 返回值表示是否跳过
	 */
	checkJumperHead() {
		const jumper = this.jumperHeadStat[this.sectionCursor]
		if(jumper && !SequenceSectionStat.jumperAttrMatch(jumper.attrs, this.frontier!.number)) {
			this.sectionCursor = jumper.endSection
			return true
		}
		return false
	}
	/**
	 * 检测小节的 reset，如果存在则启动新的迭代节
	 */
	checkReset(pos: SequenceSectionStat.AttrPosition) {
		if(SequenceSectionStat.checkReset(this.article, this.sectionCursor, 'before')) {
			this.expandFrontier(1)
		}
	}
	/**
	 * 检测小节线属性，进行音乐属性变更
	 *
	 * 这里不处理变拍，因为处理过了
	 */
	checkMusicalVariation(pos: SequenceSectionStat.AttrPosition) {
		this.checkOneVariation(pos, 'qpm')
		this.checkOneVariation(pos, 'shift')
	}
	/**
	 * 速度变更
	 */
	checkOneVariation(pos: SequenceSectionStat.AttrPosition, type: 'qpm' | 'shift') {
		const primoSection = SequenceSectionStat.primoSection(this.article, this.sectionCursor)

		for(let part of this.article.parts) {
			const section = part.notes.sections[this.sectionCursor]
			
			const applyingSeq: SeparatorAttr[] = (() => {
				if(section.type != 'nullish') {
					return SequenceSectionStat.getAttr(section.separator, pos).attrs
				}
				return SequenceSectionStat.getAttr(primoSection.separator, pos).attrs
			})()
			
			for(let attr of applyingSeq) {
				if(attr.type == type) {
					// 重建修改后的音乐属性
					this.currentProps[part.signature.hash] = SequenceSectionStat.recreateMusicalProps(
						this.currentProps[part.signature.hash],
						attr
					)
				}
			}
		}
	}
	/**
	 * 标记当前小节并检测冲突
	 */
	checkConflict() {
		const primoSection = SequenceSectionStat.primoSection(this.article, this.sectionCursor)
		const iter = this.frontier!.number
		const passingMap = this.passingIterations[this.sectionCursor]

		if(passingMap[iter]) {
			if(passingMap[iter] == 'passed') {
				passingMap[iter] = 'warned'
				addIssue(
					this.issues, primoSection.idCard.lineNumber, 0,
					'warning', 'repeat_conflict',
					'Section ${0} is passed twice by iteration number ${1}',
					'' + primoSection.idCard.lineNumber, '' + iter
				)
			}
		} else {
			passingMap[iter] = 'passed'
		}
	}
	/**
	 * 推入当前小节
	 */
	pushCurrentSection() {
		let octaveShift = 0
		
	}
}
