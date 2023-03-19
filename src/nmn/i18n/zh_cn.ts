export default {
	levelNameKeys: {
		'empty_tree': [0],
		'wrong_speciality': [0],
		'special_children': [0, 1],
		'lack_required': [0],
		'second_root': [0],
		'post_header': [0],
		'duplicate_unique_del': [0],
		'duplicate_unique': [0]
	},
	levelNames: {
		'document': '文档',
		'article': '章节',
		'fragment': '片段',
		'part': '声部',
		'lyricLine': '歌词行'
	},
	issues: {
		'token.unclosed_comment': '此块注释没有闭合',
		'token.unclosed_string': '此字符串没有闭合',
		'token.invalid_escape': '无效的转义序列 ${0}',

		'bad_command_format': '此指令行格式不正确。应当形如 <指令>: <内容> 或 <指令>[<属性>]: 内容。',
		'wtf_line': '无法确定此行的意义',

		'empty_document': '文档似乎是空的',
		'empty_tree': '此${0}被丢弃，因为其不包含任何内容',
		'wrong_speciality': '此${0}包含了不相容的指令',
		'special_children': '此${0}不应当包含${1}',
		'lack_required': '此${0}中必须包含一个 ${1}(${2})，但是没有找到。',
		'unknown_command': '未知的指令 ${0}',
		'second_root': '你是想在一个${0}里面放两个${0}吗？',
		'post_header': '作为${0}的头部，指令 ${1} 应当出现在开头。',
		'redundant_props': '指令 ${0} 不能含有中括号属性',
		'lack_props': '指令 ${0} 应当有中括号属性，但是没有找到。',
		'duplicate_unique_del': '指令 ${1} 在${0}中应当是唯一的。你是否忘了添加分割线 `${2}`？',
		'duplicate_unique': '指令 ${1} 在${0}中应当是唯一的',

		'unclosed_bracket': '括号没有闭合',
		'unpaired_bracket': '括号无法配对',

		'unknown_base_shift': '无效的基调值 ${0}',
		'unknown_relative_shift': '无效的相对转调 ${0}',
		'unknown_qpm': '无效的拍速值 ${0}',
		'unknown_frac': '无效的分数值 ${0}',
		'unequal_beats': '反常拍号 ${0} 与其解析式 ${1} 不相等',

		'missing_beats': '未指定全局拍号，将默认为 0/4。',
		'unknown_base': '无效的基调值 ${0}',
		'rp_unknown_key': '未知渲染属性 ${0}',
		'rp_unknown_value': '无效的渲染属性值 ${1}（属性 ${0}）',
		'unknown_jumper_attr': '无法将 `${0}` 解析为跳房子属性',
		'nan_substitute_index': '无法确定替代音符的开始位置。你是不是忘了？',
		'unknown_part_attr': '无法将 `${0}` 解析为声部属性',
		'unknown_lrc_attr': '无法将 `${0}` 解析为歌词行属性',

		'lrc_unused_symbol': '歌词中有标点因为位置无效而未被使用',
		'unexpected_lrc_bracket': '歌词中出现未曾设想的括号 ${0}',
		'invalid_placeholder_repeat': '重复次数 `${0}` 无效',

		'incomplete_insert_sequence': '符号 `&` 后应当紧随一个单词和一个 `;`，以表示插入符号。',
		'unknown_insert_sequence': '未知的插入符号名称 ${0}',
		'notes_unexpected_bracket': '音符序列中出现未曾设想的括号 ${0}',
		'unknown_note_attr': '无法将 `${0}` 解析为音符属性',
		'note_char_music_unknown': '`${0}` 不是正确的音符字符',
		
		'note_char_text': '文本标记中的音符应当是字符串',
		'note_char_force_unknown1': '未知的力度标记词 ${0}',
		'note_char_force_unknown2': '未知的力度标记符号 ${0}',
		'note_char_force': '力度标记中的音符应当是字符串、单词或符号',
		'note_char_chord': '和弦标记中的音符应当是字符串',

		'unknown_section_separator': '未知的小节线符号 ${0}',
		'empty_section': '存在空白的小节。如果你确实想这么做，请写入一个 `empty`，否则可能导致未预期的结果。',
		'attr_beats_above': '临时拍号不能标记在小节线上方',
		"invalid_begin_separator": "小节线 ${0} 不能用在小节序列的开头",
		"invalid_end_separator": "小节线 ${0} 不能用在小节线的末尾",
		"invalid_pre_attr_begin": "小节序列开头的小节线不能有前置属性",
		"invalid_post_attr_end": "小节序列末尾的小节线不能有后置属性",
		"invalid_pre_attr": "类型为 ${0} 的小节线属性不能作为前置属性",
		"invalid_post_attr": "类型为 ${0} 的小节线属性不能作为后置属性",
		"invalid_self_attr": "类型为 ${0} 的小节线属性不能作为自身属性",
		"invalid_self_attr_begin": "类型为 ${0} 的小节线属性不能作为序列开头小节线的自身属性",
		"invalid_self_attr_end": "类型为 ${0} 的小节线属性不能作为序列末尾小节线的自身属性",
		'unknown_separator_attr': '无法将 `${0}` 解析为小节线属性',
		'unknown_omit_count': '无效的小节省略数 ${0}',
	},
	'notices': {
		'iter_invalid': '反复记号迭代数写在了无效的位置，很可能是错误的。',
		'quarters_less': '此小节的拍数少于音乐属性指定的。如果这是一个不完整小节，请在右侧小节线添加虚线。',
		'quarters_nonint': '此小节节拍为散板且拍数不是整数。如果这是一个不完整小节，请在右侧小节线添加虚线。',
		'quarters_more': '此小节的拍数多于音乐属性指定的',
		'quarters_mismatch': '此小节的拍数与其他声部内相同位置的小节不匹配'
	},
	'commands': {
		'Dt': '标题',
		'Dp': '左上角属性',
		'Dv': '右上角版本号',
		'Ds': '副标题',
		'Da': '作者',
		'Df': '脚注',
		'P': '音乐属性',
		'Pi': '音乐属性（不显示）',
		'Rp': '渲染属性',
		'T': '文本标注',
		'S': '文段标题',
		'Sp': '音乐属性',
		'Srp': '渲染属性',
		'B': '此前强制换行',
		'J': '跳房子',
		'Frp': '渲染属性',
		'N': '音符序列',
		'F': '力度标记',
		'C': '和弦标记',
		'A': '文本标记',
		'L': '歌词（手动分割）',
		'Lc': '歌词（字基）',
		'Lw': '歌词（词基）',
		'Ns': '替代小节'
	},
	'render_props': {
		'n': '每行小节数',
		'debug': '显示错误警告',
		'sectionorder': '小节线序号模式',
		'scale': '文档缩放',
		'gutter_left': '(1)左边距 - 曲谱',
		'connector_left': '(0)左边距 - 连谱号',
		'left_separator': '显示行首的小节线',
		'grayout': '降低延长连音音符的不透明度',
		'explicitmarkers': '总是显示声部标签',
		'font_part': '字体 - 声部标签',
		'font_article': '字体 - 章节标题',
		'font_title': '字体 - 大标题',
		'font_subtitle': '字体 - 副标题',
		'font_author': '字体 - 作者',
		'font_corner': '字体 - 角落标记',
		'font_text': '字体 - 文本章节',
		'font_footnote': '字体 - 脚注',
		'font_attr': '字体 - 属性文本',
		'font_force': '字体 - 力度',
		'font_chord': '字体 - 和弦',
		'font_annotation1': '字体 - 自定义标记',
		'font_annotation2': '字体 - 自定义标记',
		'font_annotation3': '字体 - 自定义标记',
		'font_lyrics': '字体 - 歌词',
		'font_checkpoint': '字体 - 段落标记',
		'margin_after_props': '(2)间距 - 大标题之后',
		'margin_after_article': '(1.5)间距 - 章节之后',
		'margin_after_header': '(0)间距 - 章节标题之后',
		'margin_before_line': '(1.7)间距 - 乐谱行之前',
		'margin_after_line': '(0.1)间距 - 乐谱行之后',
		'margin_after_part_notes': '(2)间距 - 声部曲谱部分之后',
		'inset_before_lyrics': '(1.3)负间距 - 声部歌词组之前',
		'margin_after_part': '(1)间距 - 声部之后',
		'offset_lyrics_iter': '(1.5)偏移值 - 歌词行编号',
		'offset_section_boundary': '(1)偏移值 - 小节边距',
	},
	'updown': {
		'up': '升',
		'down': '降'
	},
	'metrics': {
		'key': '${0}Key',
		'thd': '减${0}度',
		'thm': '小${0}度',
		'thM': '大${0}度',
		'th': '${0}度',
		'thp': '完全${0}度',
		'tha': '增${0}度'
	},
	'render': {
		'transpose_prop': '移调${0}Key',
		'shift_prop_a_1': '转1=',
		'shift_prop_a_2': '',
		'shift_prop_at_1': '转1=',
		'shift_prop_at_2': '移',
		'shift_prop_r': '${0}${1}',
		'shift_prop_rt': '${0}${1}移',
		'colon': '：',
		'author_sep': ' ',
		'omit': '(后略)',
		'omit_n': '(省略${0}小节)'
	}
}
