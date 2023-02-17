`Spark Numbered Music Notation / docs :`

# Strcture and specs

## Overview

```plain
Document
# Header
  - DocTitle (Dt)
  - DocPrescript (Dp)
  - DocVersion (Dv)
  - DocSubtitle (Ds)
  - DocAuthor... (Da)
  - DocFootnote... (Df)
  - Text... (T)
  * Props (P)
  - RenderProps (Rp)
# Body
  + Section...
    # Header
      - Section (S)
      - SectionProps (Sp)
    # Body
      > Fragment...

Fragment
# Header
  - Break (B)
  - Jumper (J)
  - FragmentRenderProps (Frp)
# Body
  + Part...
    # Header
      * Notes (N)
      - Force (F)
      - Chord (C)
      - Annotation... (A)
    # Body
      + Line...
        * Lyric (L) / LyricWord (Lw) / LyricChar (Lc)
        - NotesSubstitute... (Ns)
        - Force (F)
        - Chord (C)
        - Annotation... (A)
```

## Notes symbols


