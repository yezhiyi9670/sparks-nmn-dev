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
	 * 语言
	 */
	language?: string
	/**
	 * 尺寸
	 */
	scale?: number
	/**
	 * 歌词字体尺寸
	 */
	lyricsscale?: number
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
	 * 字体-属性
	 */
	font_props?: string
	/**
	 * 字体-文段标题
	 */
	font_section?: string
	/**
	 * 字体-标题
	 */
	font_title?: string
	/**
	 * 字体-副标题
	 */
	font_subtitle?: string
	/**
	 * 字体-角落
	 */
	font_corner?: string
	/**
	 * 字体-文本
	 */
	font_text?: string
	/**
	 * 字体-文本标记
	 */
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
	font_iter?: string
}

/**
 * 默认渲染属性
 */
export const renderPropsDefault: RenderProps = {
	n: 4,
	debug: true,
	sectionorder: 'paren',
	language: 'en',
	scale: 1.0,
	lyricsscale: 1.0,
	grayout: false,
	explicitmarkers: false,
	font_part: 'Noto_Sans_SC/400',
	font_props: 'SimHei/400',
	font_section: 'SimSun/400',
	font_title: 'SimSun/700',
	font_subtitle: 'SimSun/400',
	font_corner: 'Deng/700',
	font_text: 'SimSun/400',
	font_annotation1: 'Deng/600',
	font_annotation2: 'Deng/600',
	font_annotation3: 'Deng/600',
	font_lyrics: 'Deng/600',
	font_iter: 'SimSun/400',
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
	if(key == 'debug' || key == 'grayout' || key == 'explicitmarkers') {
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
	if(key == 'language') {
		if(['en', 'zh_cn'].indexOf(val) != -1) {
			return val
		}
		return { error: 'value' }
	}
	if(key == 'lyricsscale' || key == 'scale') {
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
