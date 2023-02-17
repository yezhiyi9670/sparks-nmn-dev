import { flattenI18nData } from "../i18n";

const selfName = "简体中文 (中国)"
const appName = 'Sparks NMN Playground'
export default flattenI18nData({
	"i18n.self_name": selfName,

	"title": {
		"default": appName,
		"new": "演示模式 - " + appName,
		"newDirty": "● 演示模式 - " + appName,
	},
	
	// 状态栏
	"status": {
		// 显示模式
		"displaymode": {
			"edit": "编辑",
			"split": "拆分",
			"preview": "预览",
		},
		// 保存状态
		"dirty": {
			"new": "已存至浏览器",
			"dirty": "未保存",
			"preview": {
				"clean": "已刷新预览",
				"dirty": "未刷新预览"
			}
		},
		// 计时信息
		"timing": {
			"both": "${0}ms/${1}ms",
		},
		// 文件大小
		"size": {
			"source": "${0} KB"
		}
	},

	// 预览
	"preview": {
		"new_title": "新文档",
		"warning": "重要提醒：\n此 Playground 仅用于试验与学习，不支持文件保存和偏好设置。如需日常使用，应当下载桌面版。\n文件会以非常不靠谱的方式暂存在浏览器上，随时都可能会被覆盖。\n【Ctrl + S 暂存文件并刷新预览，Ctrl + R 只刷新不保存，Ctrl + P 打印预览】",
		"blank": {
			"title": "空白文档",
			"desc": {
				"1": "此文档没有任何有效内容。",
				"2": "要使文档有效，请向其中添加音乐属性行（以 P 或 Props 开头）。",
			}
		}
	},
})
