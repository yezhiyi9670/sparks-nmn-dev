export default (`
Dt: 测试文档 
Ds: 测试文档
Dp: The test document
Dv: Version 2023.02
Da[作词]: 词作者
Da[作曲]: 曲作者
P: 4/4 1=C qpm=120
Rp: n=4 grayout=true
// ====
// T: text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1 text1
// T: text2
// T: text3
// T: text4
====
S: 片段A
Sp: 6/8 1=#E spm=225
---
N: 3. 3 (1) | #2. 7d. | 2. (217d) | 7d. (7d12) | 3. 3(1) | #2. #4(7) | 6. (6#56) |
Lc[1.]: 翻开下一页, 请稍候床边, 打碎了橘子酱发现橱窗里的世
Lc[2.]: 沉默的茶点, 乖巧地镶嵌, 剥落了烫金字露出褪色的星期
Lc[3.]: 纸牌的背面, 猫露出笑脸, 推倒了多米诺尽头是午夜的终
NotesSubstitute: 7: 6. (6#57)
---
Jumper: 1., 2., * // 跳房子区间段落 1, 2
N: 7. (3#57) | 6(6) (6#56) | 7(7) (71e2) | (3e2e1e) (2e1e7) | 7(0) (71e2e) | 1e(1e) (1e2e3e) | 2e(2e) (2e3e4e) | 3e.~3e. |
Lc[1.]: 界. 跟随着萤火虫的曲线, 那兔子的礼服里掉落请柬, 鸢尾装点, 灌木林背面, 排列了盛宴.
Lc[2.]: 天.       端坐在圆桌中间, 被嚣张的荆棘勾住裙边, 灯火彻夜, 女王的杖尖, 点燃了盛典.
Ns: 1: 7. 0(0)
---
J: 3.
N: 3e.~3e. |
Lc[3.]: 点.
====
S: Multipart
N["S"]:      empty / empty / empty / -- (05d)(12) | 3 (31) (25) (51) | (17d) (15) 3 (05) | (56) (03) (53) (15d) | (6d1) (51) 2 0 |
LyricChar: 这感觉像(第一)次遇见你, 用芝士配曲奇. 没道理, 不想逃离, 奶油加进甜心
N["S*"]:     empty / empty / empty / -- (05d)(12) | 5 (53) (52) (22) | (32)  (37) 5 0    | 0    (56) (03) (51)  | (23)  (21) 2 0 |
Lc:        %{15} 道理 不逃离 油加进甜心
====
Section: Test
N: 1e (01e) 7 (07) | 6 T(671e) 7 5 | 1e (01e) 7 (07) | 6 T(671e) 7 5 |
====
Section: Test2
N: 4 - T 2 3 4 | T 5 4 3 2 1 | empty / empty /
====
Section: A
Srp: n=3
// SectionProps: 4/4 1=B
N: ((6d135)) (3(32)) (3(32)) (3(6d7d)) | ((1321)) (6d5d) 3d - | omit(2) |
====
S: B
Srp: n=3
N: 0 0 0 (0(6d7d)) | ((1234)) (5(43)) (2(23)) 2 | ((6d7d12)) (3(7d6d)) 7d (0(6d7d)) | omit
====
S: C
Srp: n=3
N: 0 0 0 (03) | 6 (5(35)) 6 (5(32)) | ((16d12)) (3(32)) 3 (03) | omit
====
S: K
N: - - (05d) (6d7d) |{$} 1 (12) 3 (34) | (54) (34) 5 - |
---
N: (43) (23) (42) (7d2) | 5d 5d 1 - |{Fine.}
---
N: 6 (65) 4 6 | 5 4 3 - | (43) (23) 4 (32) | 1 (12) 1 - |{D.S.}

`).trim()
