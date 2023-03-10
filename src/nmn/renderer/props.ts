/**
 * 渲染属性
 */
export interface RenderProps {
	/**
	 * 每行小节数
	 */
	n?: number
	/**
	 * 调试模式
	 */
	debug?: boolean
	/**
	 * 小节序号
	 */
	sectionorder?: string
	/**
	 * 尺寸
	 */
	scale?: number
	/**
	 * 声部渲染左边距
	 */
	gutter_left?: number
	/**
	 * 连谱号渲染左边距
	 */
	connector_left?: number
	/**
	 * 渲染每声部起始小节的小节线
	 */
	left_separator?: boolean
	/**
	 * 延长连音线灰色提示
	 */
	grayout?: boolean
	/**
	 * 显示所有声部标记和歌词行标记
	 */
	explicitmarkers?: boolean
	/**
	 * 字体-声部文本
	 */
	font_part?: string
	/**
	 * 字体-文段标题
	 */
	font_article?: string
	/**
	 * 字体-标题
	 */
	font_title?: string
	/**
	 * 字体-副标题
	 */
	font_subtitle?: string
	/**
	 * 字体-作者
	 */
	font_author?: string
	/**
	 * 字体-角落
	 */
	font_corner?: string
	/**
	 * 字体-文本
	 */
	font_text?: string
	/**
	 * 字体-脚注
	 */
	font_footnote?: string
	/**
	 * 字体-文本标记
	 */
	font_attr?: string
	font_force?: string
	font_chord?: string
	font_annotation1?: string
	font_annotation2?: string
	font_annotation3?: string
	/**
	 * 字体-歌词
	 */
	font_lyrics?: string
	/**
	 * 字体-段落标记
	 */
	font_checkpoint?: string
	/**
	 * 音乐作者与全局属性之后的间距
	 */
	margin_after_props?: number
	/**
	 * 章节后的间距
	 */
	margin_after_article?: number
	/**
	 * 章节标题后的间距
	 */
	margin_after_header?: number
	/**
	 * 乐谱行前的间距
	 */
	margin_before_line?: number
	/**
	 * 乐谱行后的间距
	 */
	margin_after_line?: number
	/**
	 * 声部曲谱部分后的间距
	 */
	margin_after_part_notes?: number
	/**
	 * 声部歌词组前的负间距
	 */
	inset_before_lyrics?: number
	/**
	 * 声部后的间距
	 */
	margin_after_part?: number
}

/**
 * 默认渲染属性
 */
export const renderPropsDefault: RenderProps = {
	n: 4,
	debug: true,
	sectionorder: 'paren',
	scale: 1.0,
	gutter_left: 1,
	connector_left: 0,
	left_separator: false,
	grayout: false,
	explicitmarkers: true,
	font_part: 'SimSun/700',
	font_article: 'SimSun/700',
	font_title: 'SimSun/700',
	font_subtitle: 'SimSun/400',
	font_author: 'SimSun/400',
	font_corner: 'Deng/400',
	font_text: 'SimSun/400',
	font_footnote: 'SimSun/400',
	font_attr: 'SimSun/400',
	font_force: 'Deng/700',
	font_chord: 'Deng/700',
	font_annotation1: 'SimSun/600',
	font_annotation2: 'SimSun/600',
	font_annotation3: 'SimSun/600',
	font_lyrics: 'SimSun/600',
	font_checkpoint: 'SimSun/700',
	margin_after_props: 2,
	margin_after_article: 1.5,
	margin_after_header: 0.0, // diff 1
	margin_before_line: 1.7, // diff 1.7
	margin_after_line: 0.1, // diff 1.1
	margin_after_part_notes: 2,
	inset_before_lyrics: 1.3,
	margin_after_part: 1,
}

/**
 * 验证并转换属性
 */
export function renderPropConvert(key: string, val: string) {
	if(key == 'n') {
		let r = +val
		if(Math.floor(r) == r && r >= 1 && r <= 65535) {
			return r
		}
		return { error: 'value' }
	}
	if(key == 'debug' || key == 'grayout' || key == 'explicitmarkers' || key == 'left_separator') {
		if(val == 'true') {
			return true
		}
		if(val == 'false') {
			return false
		}
		return { error: 'value' }
	}
	if(key == 'sectionorder') {
		if(['none', 'plain', 'paren', 'bracket'].indexOf(val) != -1) {
			return val
		}
		return { error: 'value' }
	}
	if(key == 'scale' || key == 'gutter_left' || key == 'connector_left' || key.startsWith('margin_') || key.startsWith('inset_')) {
		let num = +val
		if(num != num || num < 0 || num >= 65536) {
			return { error: 'value' }
		}
		return num
	}
	if(key in renderPropsDefault) {
		return val
	}
	return { error: 'key' }
}
