import { LyricDestructionType } from "../types";

export type LrcSymbolType = 'word' | 'prefix' | 'postfix' | 'divide' | 'placeholder'

/**
 * 确定歌词中某种字符的类型
 */
export function getLrcSymbolType(symbol: string, typeSampler: LyricDestructionType): LrcSymbolType {
	if(['_', '%'].indexOf(symbol) != -1) {
		return 'placeholder'
	}
	if(symbol == "'") {
		if(typeSampler == 'word') {
			return 'word'
		} else {
			return 'postfix'
		}
	}
	if([
		')', ']', ']]', '}',
		'~', '—',
		'!', '！',
		'^', '…',
		';', '；',
		'*',
		':', '：',
		'>', '》', '⟩', '⟧', '⟫' ,'⟭', '〉', '』', '〗', '】', '〙', '」', '〕', '〛',
		',', '，',
		'.', '。',
		'”', '’',
		'?', '？'
	].indexOf(symbol) != -1) {
		return 'postfix'
	}
	if([
		'(', '[', '[[', '[',
		'<', '《', '⟨', '⟦', '⟪', '⟬', '〈', '『', '〖', '【', '〘', '「', '〔', '〚',
		'“', '‘',
		'@', '#', '￥', '&', '$'
	].indexOf(symbol) != -1) {
		return 'prefix'
	}
	if([
		'-', "\\", '|', '/', '+', '='
	].indexOf(symbol) != -1) {
		return 'divide'
	}
	return 'word'
}
